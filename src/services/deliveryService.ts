import { db } from '../database/db';
import { deliveries } from '../database/schema';
import { eq } from 'drizzle-orm';
import { retryWithBackoff } from '../utils/retry.js';
import logger from '../utils/logger.js';
import config from '../config';

export const deliverToSubscriber = async (
  deliveryId: number,
  jobId: number,
  subscriberUrl: string,
  payload: any
) => {
  const attemptDelivery = async (attempt: number) => {
    try {
      logger.info(`Attempt ${attempt + 1} to deliver to ${subscriberUrl}`);
      
      const response = await fetch(subscriberUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Delivery-Attempt': attempt.toString(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

       // Success
      await db.update(deliveries)
        .set({
          status: 'success',
          attempt,
          deliveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(deliveries.id, deliveryId)); // 000 jobId
      
      logger.info(`Delivery ${deliveryId} succeeded to ${subscriberUrl}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Delivery ${deliveryId} attempt ${attempt + 1} failed:`, errorMessage);
      
      // Update delivery record with failure
      await db.update(deliveries)
        .set({
          status: attempt + 1 >= config.maxRetries ? 'failed' : 'pending',
          attempt,
          error: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(deliveries.id, deliveryId));
      
      throw error;
    }
  };

  try {
    await retryWithBackoff(
      async () => {
        // Get current attempt count
        const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, deliveryId));
        const attempt = delivery.attempt;
        await attemptDelivery(attempt);
      },
      {
        maxRetries: config.maxRetries,
        initialDelay: config.retryDelayMs,
      }
    );
  } catch (error) {
    logger.error(`All delivery attempts failed for delivery ${deliveryId}`);
    // Final failure already marked in the last attempt
  }
};