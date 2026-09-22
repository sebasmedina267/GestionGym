/**
 * Tests for auth.utils.js
 *
 * Validates the core authentication and authorization utility functions:
 * - validateAdminAuthenticated
 * - validateNumericId / validateNumericIds
 * - validateRole
 * - validateEntityExists
 * - validatePaymentCompleted
 */

import {
  validateAdminAuthenticated,
  validateNumericId,
  validateNumericIds,
  validateRole,
  validateEntityExists,
  validatePaymentCompleted,
} from "../utils/auth.utils.js";

import { AppError } from "../utils/AppError.js";

// ============================================================================
// validateAdminAuthenticated
// ============================================================================
describe("validateAdminAuthenticated", () => {
  test("should NOT throw when req.admin with id is present", () => {
    const req = { admin: { id: 1, roles: ["DUENO"] } };
    expect(() => validateAdminAuthenticated(req)).not.toThrow();
  });

  test("should throw AppError 401 when req.admin is undefined", () => {
    const req = {};
    expect(() => validateAdminAuthenticated(req)).toThrow(AppError);
    try {
      validateAdminAuthenticated(req);
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });

  test("should throw AppError 401 when req.admin has no id", () => {
    const req = { admin: { roles: ["DUENO"] } };
    expect(() => validateAdminAuthenticated(req)).toThrow(AppError);
    try {
      validateAdminAuthenticated(req);
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });
});

// ============================================================================
// validateNumericId
// ============================================================================
describe("validateNumericId", () => {
  test("should return numeric id when given a valid string number", () => {
    expect(validateNumericId("42", "gymId")).toBe(42);
  });

  test("should return numeric id when given a valid number", () => {
    expect(validateNumericId(7, "clientId")).toBe(7);
  });

  test("should throw AppError 400 when id is NaN (string 'abc')", () => {
    expect(() => validateNumericId("abc", "claseId")).toThrow(AppError);
    try {
      validateNumericId("abc", "claseId");
    } catch (e) {
      expect(e.status).toBe(400);
    }
  });

  test("should throw AppError 400 when id is 0", () => {
    expect(() => validateNumericId(0, "clientId")).toThrow(AppError);
  });

  test("should throw AppError 400 when id is negative", () => {
    expect(() => validateNumericId(-5, "clientId")).toThrow(AppError);
  });

  test("should throw AppError 400 when id is null", () => {
    expect(() => validateNumericId(null, "clientId")).toThrow(AppError);
  });
});

// ============================================================================
// validateNumericIds
// ============================================================================
describe("validateNumericIds", () => {
  test("should return all validated ids as numbers", () => {
    const result = validateNumericIds(
      { gymId: "3", clienteId: "10" },
      ["gymId", "clienteId"]
    );
    expect(result.gymId).toBe(3);
    expect(result.clienteId).toBe(10);
  });

  test("should throw AppError 400 if one id is missing from the object", () => {
    expect(() =>
      validateNumericIds({ gymId: "3" }, ["gymId", "clienteId"])
    ).toThrow(AppError);
  });

  test("should throw AppError 400 if one id is invalid", () => {
    expect(() =>
      validateNumericIds({ gymId: "3", clienteId: "texto" }, ["gymId", "clienteId"])
    ).toThrow(AppError);
  });
});

// ============================================================================
// validateRole
// ============================================================================
describe("validateRole", () => {
  test("should NOT throw when admin has the required role", () => {
    const admin = { roles: ["DUENO", "ENCARGADO"] };
    expect(() => validateRole(admin, "DUENO")).not.toThrow();
  });

  test("should NOT throw when admin has one of multiple required roles", () => {
    const admin = { roles: ["EMPLEADO"] };
    expect(() => validateRole(admin, ["DUENO", "EMPLEADO"])).not.toThrow();
  });

  test("should throw AppError 403 when admin lacks the required role", () => {
    const admin = { roles: ["EMPLEADO"] };
    expect(() => validateRole(admin, "DUENO")).toThrow(AppError);
    try {
      validateRole(admin, "DUENO");
    } catch (e) {
      expect(e.status).toBe(403);
    }
  });

  test("should throw AppError 401 when admin is undefined", () => {
    expect(() => validateRole(undefined, "DUENO")).toThrow(AppError);
    try {
      validateRole(undefined, "DUENO");
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });

  test("should throw AppError 401 when admin has no roles array", () => {
    const admin = { id: 1 };
    expect(() => validateRole(admin, "DUENO")).toThrow(AppError);
  });
});

// ============================================================================
// validateEntityExists
// ============================================================================
describe("validateEntityExists", () => {
  test("should NOT throw when entity is a non-null object", () => {
    expect(() => validateEntityExists({ id: 1, nombre: "Test" }, "Cliente")).not.toThrow();
  });

  test("should throw AppError 404 when entity is null", () => {
    expect(() => validateEntityExists(null, "Cliente")).toThrow(AppError);
    try {
      validateEntityExists(null, "Cliente");
    } catch (e) {
      expect(e.status).toBe(404);
    }
  });

  test("should throw AppError 404 when entity is undefined", () => {
    expect(() => validateEntityExists(undefined, "Clase")).toThrow(AppError);
  });

  test("error message should include the entity name", () => {
    try {
      validateEntityExists(null, "Maquina");
    } catch (e) {
      expect(e.message).toContain("Maquina");
    }
  });
});

// ============================================================================
// validatePaymentCompleted
// ============================================================================
describe("validatePaymentCompleted", () => {
  test("should NOT throw when payment status is 'completed'", () => {
    const payment = { id: "pi_123", status: "completed" };
    expect(() => validatePaymentCompleted(payment)).not.toThrow();
  });

  test("should throw AppError 400 when payment status is 'pending'", () => {
    const payment = { id: "pi_123", status: "pending" };
    expect(() => validatePaymentCompleted(payment)).toThrow(AppError);
    try {
      validatePaymentCompleted(payment);
    } catch (e) {
      expect(e.status).toBe(400);
    }
  });

  test("should throw AppError 404 when payment is null", () => {
    expect(() => validatePaymentCompleted(null)).toThrow(AppError);
    try {
      validatePaymentCompleted(null);
    } catch (e) {
      expect(e.status).toBe(404);
    }
  });

  test("should throw AppError 400 when payment status is 'failed'", () => {
    const payment = { id: "pi_456", status: "failed" };
    expect(() => validatePaymentCompleted(payment)).toThrow(AppError);
  });
});
