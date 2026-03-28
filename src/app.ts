import express from "express";
import { Request, Response } from "express";
import { pipelineRouter } from "./api/pipelines";
import { webhookRouter } from "./api/webhook";
import { jobRouter } from "./api/jobs";
import logger from "./utils/logger";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging //
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/pipelines", pipelineRouter);
app.use("/webhook", webhookRouter);
app.use("/api/jobs", jobRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, _req: Request, res: Response) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});
