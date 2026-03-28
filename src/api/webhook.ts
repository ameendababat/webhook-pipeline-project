import { Router, Request, Response } from "express";
import { db } from "../database/db";
import { pipelines } from "../database/schema";
import { eq } from "drizzle-orm";
import { addJobToQueue } from "../queue";
import { jobs } from "../database/schema";
import logger from "../utils/logger";

const router = Router();

// Webhook endpoint
router.post("/:pipelineId", async (req: Request, res: Response) => {
  try {
    const pipelineId = Number(req.params.pipelineId);

    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline id" });
    }

    // Check if pipeline exists
    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, pipelineId),
      with: {
        subscribers: true,
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    // Store the job in database
    const [job] = await db
      .insert(jobs)
      .values({
        pipelineId,
        payload: req.body,
        status: "pending",
      })
      .returning();

    // Add to queue for background processing
    await addJobToQueue(job.id, pipelineId, req.body);

    logger.info(`Job queued: ${job.id} for pipeline ${pipelineId}`);

    res.status(202).json({
      message: "Webhook received and queued for processing",
      jobId: job.id,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    logger.error("Error processing webhook:", error);

    res.status(500).json({
      error: "Failed to process webhook",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export { router as webhookRouter };
