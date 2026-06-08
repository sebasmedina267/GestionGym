import logger from './utils/logger.js';
import app from './app.js';
import { config } from './config/env.js';
import { startCleanupJob } from './jobs/cleanup.inactive.users.js';

logger.info('SYSTEM', '>>> [FitFlow] Initializing Backend Infrastructure <<<');

/**
 * Server Lifecycle Initialization
 * Binds the Express application to the designated port.
 */
app.listen(config.port, () => {
  logger.info('SYSTEM', `[FitFlow] Operational: Backend services listening on port ${config.port}`);
  startCleanupJob();
});