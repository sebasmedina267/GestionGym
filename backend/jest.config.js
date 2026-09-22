/**
 * Jest Configuration
 * 
 * Configured for native ES Modules (ESM) since the project uses "type": "module"
 * in package.json. No Babel transform needed — we rely on Node's --experimental-vm-modules.
 */
export default {
  // Use Node.js test environment (no DOM)
  testEnvironment: "node",

  // No transform needed for native ES Modules
  transform: {},

  // Find test files in __tests__ directories
  testMatch: [
    "**/__tests__/**/*.test.js"
  ],

  // Display individual test names in output
  verbose: true,

  // Collect coverage from the src folder (excluding node_modules and tests themselves)
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**"
  ],

  // Minimum coverage thresholds to enforce (informational for now)
  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0
    }
  }
};
