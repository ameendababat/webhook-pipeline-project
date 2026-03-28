import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../database/db";
import { pipelines, subscribers } from "../database/schema";
import { eq } from "drizzle-orm";
import logger from "../utils/logger";
import { actionRegistry } from "../actions";

const router = Router();

const createPipelineSchema = z.object({
  name: z.string().min(1),
  action: z.string().min(1),
  subscribers: z.array(z.string().url()),
});

const updatePipelineSchema = z.object({
  name: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  subscribers: z.array(z.string().url()).optional(),
});

// Create pipeline
router.post("/", async (req: Request, res: Response) => {
  try {
    const validation = createPipelineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const { name, action, subscribers: subscriberUrls } = validation.data;

    // Validate action exists
    if (!actionRegistry[action]) {
      return res.status(400).json({ error: `Invalid action: ${action}` });
    }

    // Create pipeline
    const [pipeline] = await db
      .insert(pipelines)
      .values({
        name,
        action,
      })
      .returning();

    // Create subscribers
    if (subscriberUrls.length > 0) {
      await db.insert(subscribers).values(
        subscriberUrls.map((url) => ({
          pipelineId: pipeline.id,
          url,
        })),
      );
    }
    logger.info(`Pipeline created: ${pipeline.id} - ${name}`);
    res.status(201).json({ ...pipeline, subscribers: subscriberUrls });
  } catch (error) {
    logger.error("Error creating pipeline:", error);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// Get all pipelines
router.get("/", async (req: Request, res: Response) => {
  try {
    const allPipelines = await db.query.pipelines.findMany({
      with: {
        subscribers: true,
      },
    });
    res.json(allPipelines);
  } catch (error) {
    logger.error("Error fetching pipelines:", error);
    res.status(500).json({ error: "Failed to fetch pipelines" });
  }
});

// Get pipeline by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const pipelineId = Number(req.params.id);

    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline id" });
    }

    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, pipelineId),
      with: {
        subscribers: true,
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json(pipeline);
  } catch (error) {
    logger.error("Error fetching pipeline:", error);
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});

// Update pipeline
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const pipelineId = Number(req.params.id);

    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline id" });
    }
    const validation = updatePipelineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const { name, action, subscribers: subscriberUrls } = validation.data;

    // Validate action exists if provided
    if (action && !actionRegistry[action]) {
      return res.status(400).json({ error: `Invalid action: ${action}` });
    }

    // Update pipeline
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (action) updateData.action = action;
    updateData.updatedAt = new Date();

    await db
      .update(pipelines)
      .set(updateData)
      .where(eq(pipelines.id, pipelineId));

    if (subscriberUrls) {
      // Delete existing subscribers
      await db
        .delete(subscribers)
        .where(eq(subscribers.pipelineId, pipelineId));
      // Add new subscribers
      if (subscriberUrls.length > 0) {
        await db.insert(subscribers).values(
          subscriberUrls.map((url) => ({
            pipelineId,
            url,
          })),
        );
      }
    }
    const updatedPipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, pipelineId),
      with: {
        subscribers: true,
      },
    });
    res.json(updatedPipeline);
  } catch (error) {
    logger.error("Error updating pipeline:", error);
    res.status(500).json({ error: "Failed to update pipeline" });
  }
});

// Delete pipeline
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const pipelineId = Number(req.params.id);
    if (isNaN(pipelineId)) {
      return res.status(400).json({ error: "Invalid pipeline id" });
    }
    await db.delete(pipelines).where(eq(pipelines.id, pipelineId));
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting pipeline:", error);
    res.status(500).json({ error: "Failed to delete pipeline" });
  }
});

export { router as pipelineRouter };
