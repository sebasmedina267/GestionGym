/**
 * FitFlow Backend Infrastructure - Entry Point
 * 
 * Initializes the HTTP server and binds the application to the configured network port.
 * Orchestrates the final startup sequence for the management engine.
 */

console.log(">>> [FitFlow] Initializing Backend Infrastructure <<<");

import app from './app.js';
import { config } from './config/env.js';

/**
 * Server Lifecycle Initialization
 * Binds the Express application to the designated port.
 */
app.listen(config.port, () => {
  console.log(`[FitFlow] Operational: Backend services listening on port ${config.port}`);
});