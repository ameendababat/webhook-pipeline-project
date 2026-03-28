import { Router, Request, Response } from "express";
import { db } from "../database/db";
import { jobs, deliveries } from "../database/schema";
import { eq } from "drizzle-orm";
import logger from "../utils/logger";

const router = Router();

// Get job status
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job id" });
    }
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        pipeline: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      id: job.id,
      status: job.status,
      pipelineId: job.pipelineId,
      payload: job.payload,
      processedPayload: job.processedPayload,
      error: job.error,
      createdAt: job.createdAt,
      processedAt: job.processedAt,
    });
  } catch (error) {
    logger.error("Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Get job deliveries
router.get("/:id/deliveries", async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job id" });
    }

    const deliveriesList = await db.query.deliveries.findMany({
      where: eq(deliveries.jobId, jobId),
    });

    res.json(deliveriesList);
  } catch (error) {
    logger.error("Error fetching deliveries:", error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

export { router as jobRouter };
