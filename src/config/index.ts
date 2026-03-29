import dotenv from "dotenv";

dotenv.config();

export default {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:root@localhost:5432/webhook_pipeline",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  nodeEnv: process.env.NODE_ENV || "development",
  workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY || "5", 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || "5000", 10),
};
