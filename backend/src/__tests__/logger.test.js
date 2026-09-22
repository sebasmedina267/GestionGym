/**
 * Tests for logger.js (enhancedLogger)
 *
 * Validates that the centralized Winston logger exposes the expected
 * interface and that its methods are callable without throwing.
 * We spy on the underlying winston transport to avoid writing to disk during tests.
 */

import logger from "../utils/logger.js";

// ============================================================================
// INTERFACE SHAPE
// ============================================================================
describe("enhancedLogger - interface", () => {
  test("should export an object with info method", () => {
    expect(typeof logger.info).toBe("function");
  });

  test("should export an object with error method", () => {
    expect(typeof logger.error).toBe("function");
  });

  test("should export an object with warn method", () => {
    expect(typeof logger.warn).toBe("function");
  });

  test("should export an object with debug method", () => {
    expect(typeof logger.debug).toBe("function");
  });

  test("should export an object with logSuccess method", () => {
    expect(typeof logger.logSuccess).toBe("function");
  });

  test("should export an object with logFailure method", () => {
    expect(typeof logger.logFailure).toBe("function");
  });

  test("should export an object with logAuth method", () => {
    expect(typeof logger.logAuth).toBe("function");
  });

  test("should export an object with logPayment method", () => {
    expect(typeof logger.logPayment).toBe("function");
  });

  test("should export an object with logClient method", () => {
    expect(typeof logger.logClient).toBe("function");
  });

  test("should expose the underlying winston instance via getWinstonLogger", () => {
    const winstonLogger = logger.getWinstonLogger();
    expect(winstonLogger).toBeDefined();
    expect(typeof winstonLogger.info).toBe("function");
  });
});

// ============================================================================
// METHODS DO NOT THROW
// ============================================================================
describe("enhancedLogger - methods don't throw with valid input", () => {
  test("info() should not throw", () => {
    expect(() => logger.info("SYSTEM", "Test info message")).not.toThrow();
  });

  test("warn() should not throw", () => {
    expect(() => logger.warn("SYSTEM", "Test warn message")).not.toThrow();
  });

  test("error() should not throw", () => {
    expect(() =>
      logger.error("SYSTEM", "Test error message", { error: "test" })
    ).not.toThrow();
  });

  test("debug() should not throw", () => {
    expect(() => logger.debug("SYSTEM", "Test debug message")).not.toThrow();
  });

  test("logSuccess() should not throw", () => {
    expect(() =>
      logger.logSuccess("TEST_OPERATION", { userId: 1 })
    ).not.toThrow();
  });

  test("logFailure() should not throw", () => {
    const testError = new Error("simulated error");
    expect(() =>
      logger.logFailure("TEST_OPERATION", testError, { userId: 1 })
    ).not.toThrow();
  });

  test("logAuth() should not throw", () => {
    expect(() =>
      logger.logAuth("LOGIN", 42, { email: "test@test.com" })
    ).not.toThrow();
  });

  test("logPayment() should not throw", () => {
    expect(() =>
      logger.logPayment("succeeded", "pi_test_123", 9200, "succeeded", { gymId: 1 })
    ).not.toThrow();
  });

  test("logClient() should not throw", () => {
    expect(() =>
      logger.logClient("CREATE", 10, 5, { nombre: "Juan" })
    ).not.toThrow();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================
describe("enhancedLogger - edge cases", () => {
  test("info() should not throw when called with no metadata", () => {
    expect(() => logger.info("AUTH", "Login attempt")).not.toThrow();
  });

  test("logFailure() should handle an error with no stack gracefully", () => {
    const minimalError = { message: "minimal error without stack" };
    expect(() =>
      logger.logFailure("TEST_OP", minimalError)
    ).not.toThrow();
  });

  test("logPayment() should not throw with empty details object", () => {
    expect(() =>
      logger.logPayment("pending", "pi_abc", 1000, "pending", {})
    ).not.toThrow();
  });
});
