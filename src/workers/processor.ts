import { db } from "../database/db";
import { jobs, deliveries, pipelines } from "../database/schema";
import { eq } from "drizzle-orm";
import { actionRegistry } from "../actions";
import { deliverToSubscriber } from "../services/deliveryService";
import logger from "../utils/logger";
import { JsonValue } from "../types/common";

export const processJob = async (
  jobId: number,
  pipelineId: number,
  payload: JsonValue,
) => {
  // Mark job as processing
  await db
    .update(jobs)
    .set({
      status: "processing",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  try {
    // Get pipeline
    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, pipelineId),
      with: {
        subscribers: true,
      },
    });

    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    // Execute the action
    const action = actionRegistry[pipeline.action];
    if (!action) {
      throw new Error(`Unknown action: ${pipeline.action}`);
    }

    const processedPayload = await action(payload);

    // Update job with processed payload
    await db
      .update(jobs)
      .set({
        status: "completed",
        processedPayload,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // Create delivery records and attempt deliveries
    for (const subscriber of pipeline.subscribers) {
      const [delivery] = await db
        .insert(deliveries)
        .values({
          jobId,
          subscriberUrl: subscriber.url,
          status: "pending",
          attempt: 0,
        })
        .returning();

      // Attempt delivery with retry
      await deliverToSubscriber(
        delivery.id,
        jobId,
        subscriber.url,
        processedPayload,
      );
    }

    logger.info(`Job ${jobId} processed successfully`);
  } catch (error) {
    logger.error(`Error processing job ${jobId}:`, error);

    // Mark job as failed
    await db
      .update(jobs)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    throw error;
  }
};

export const startWorker = async () => {
  const { setupQueueWorker } = await import("../queue");
  const worker = setupQueueWorker();
  logger.info("Worker started");
  return worker;
};
