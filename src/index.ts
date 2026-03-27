import { startWorker } from './workers/processor';
import { app } from './app.js';
import config from './config';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // Start the worker in a separate process or thread
    if (process.env.NODE_ENV !== 'worker') {
      // Start HTTP server
      app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
        console.log(`Server running on port ${config.port}`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start worker if this is the worker process
if (process.argv.includes('worker') || process.env.NODE_ENV === 'worker') {
  startWorker().catch((error) => {
    logger.error('Worker failed:', error);
    process.exit(1);
  });
} else {
  startServer();
}