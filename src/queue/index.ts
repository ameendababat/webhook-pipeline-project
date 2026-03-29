import { Queue, Worker } from "bullmq";
import config from "../config";
import { processJob } from "../workers/processor";
import logger from "../utils/logger";
import { JsonValue } from "../types/common";

const queueName = "webhook-pipeline-queue";

export const jobQueue = new Queue(queueName, {
  connection: {
    url: config.redisUrl,
  },
});

export const addJobToQueue = async (
  jobId: number,
  pipelineId: number,
  payload: JsonValue,
) => {
  await jobQueue.add(
    "process-webhook",
    {
      jobId,
      pipelineId,
      payload,
    },
    {
      jobId: `job-${jobId}`,
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  logger.info(`Job ${jobId} added to queue`);
};

export const setupQueueWorker = () => {
  const worker = new Worker(
    queueName,
    async (job) => {
      const { jobId, pipelineId, payload } = job.data;
      logger.info(`Processing job ${jobId} from queue`);
      await processJob(jobId, pipelineId, payload);
    },
    {
      connection: {
        url: config.redisUrl,
      },
      concurrency: config.workerConcurrency,
    },
  );

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
};
