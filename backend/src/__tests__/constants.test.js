/**
 * Tests for centralized constants (constants/index.js)
 * 
 * Validates that the single source of truth for business rules,
 * HTTP status codes, error messages and regex patterns are correct
 * and haven't been accidentally modified.
 */

import {
  BUSINESS_RULES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  USER_ROLES,
  ROLE_PERMISSIONS,
  LOG_LEVELS,
  LOG_CONTEXT,
  DATE_FORMATS,
  REGEX_PATTERNS,
} from "../constants/index.js";

// ============================================================================
// BUSINESS_RULES
// ============================================================================
describe("BUSINESS_RULES", () => {
  describe("INACTIVITY", () => {
    test("MONTHS_THRESHOLD should be 4", () => {
      expect(BUSINESS_RULES.INACTIVITY.MONTHS_THRESHOLD).toBe(4);
    });
  });

  describe("LOCATION", () => {
    test("SEARCH_RADIUS_KM should be 5", () => {
      expect(BUSINESS_RULES.LOCATION.SEARCH_RADIUS_KM).toBe(5);
    });

    test("latitude bounds should be -90 to 90", () => {
      expect(BUSINESS_RULES.LOCATION.MIN_LATITUDE).toBe(-90);
      expect(BUSINESS_RULES.LOCATION.MAX_LATITUDE).toBe(90);
    });

    test("longitude bounds should be -180 to 180", () => {
      expect(BUSINESS_RULES.LOCATION.MIN_LONGITUDE).toBe(-180);
      expect(BUSINESS_RULES.LOCATION.MAX_LONGITUDE).toBe(180);
    });
  });

  describe("PASSWORD rules", () => {
    test("MIN_LENGTH should be 8", () => {
      expect(BUSINESS_RULES.PASSWORD.MIN_LENGTH).toBe(8);
    });

    test("REGEX should reject passwords shorter than 8 characters", () => {
      expect(BUSINESS_RULES.PASSWORD.REGEX.test("A1!")).toBe(false);
    });

    test("REGEX should reject passwords without uppercase", () => {
      expect(BUSINESS_RULES.PASSWORD.REGEX.test("password1!")).toBe(false);
    });

    test("REGEX should reject passwords without numbers", () => {
      expect(BUSINESS_RULES.PASSWORD.REGEX.test("Password!")).toBe(false);
    });

    test("REGEX should reject passwords without symbols", () => {
      expect(BUSINESS_RULES.PASSWORD.REGEX.test("Password1")).toBe(false);
    });

    test("REGEX should accept a valid strong password", () => {
      expect(BUSINESS_RULES.PASSWORD.REGEX.test("Password1!")).toBe(true);
    });
  });

  describe("PAGINATION", () => {
    test("DEFAULT_LIMIT should be 50", () => {
      expect(BUSINESS_RULES.PAGINATION.DEFAULT_LIMIT).toBe(50);
    });

    test("MAX_LIMIT should be 100", () => {
      expect(BUSINESS_RULES.PAGINATION.MAX_LIMIT).toBe(100);
    });
  });

  describe("PAYMENT statuses", () => {
    test("STATUS_PENDING should be 'pending'", () => {
      expect(BUSINESS_RULES.PAYMENT.STATUS_PENDING).toBe("pending");
    });

    test("STATUS_COMPLETED should be 'completed'", () => {
      expect(BUSINESS_RULES.PAYMENT.STATUS_COMPLETED).toBe("completed");
    });

    test("STATUS_FAILED should be 'failed'", () => {
      expect(BUSINESS_RULES.PAYMENT.STATUS_FAILED).toBe("failed");
    });
  });
});

// ============================================================================
// HTTP_STATUS
// ============================================================================
describe("HTTP_STATUS", () => {
  test("OK should be 200", () => expect(HTTP_STATUS.OK).toBe(200));
  test("CREATED should be 201", () => expect(HTTP_STATUS.CREATED).toBe(201));
  test("BAD_REQUEST should be 400", () => expect(HTTP_STATUS.BAD_REQUEST).toBe(400));
  test("UNAUTHORIZED should be 401", () => expect(HTTP_STATUS.UNAUTHORIZED).toBe(401));
  test("FORBIDDEN should be 403", () => expect(HTTP_STATUS.FORBIDDEN).toBe(403));
  test("NOT_FOUND should be 404", () => expect(HTTP_STATUS.NOT_FOUND).toBe(404));
  test("CONFLICT should be 409", () => expect(HTTP_STATUS.CONFLICT).toBe(409));
  test("INTERNAL_ERROR should be 500", () => expect(HTTP_STATUS.INTERNAL_ERROR).toBe(500));
});

// ============================================================================
// REGEX_PATTERNS
// ============================================================================
describe("REGEX_PATTERNS", () => {
  describe("EMAIL", () => {
    test("should accept valid email", () => {
      expect(REGEX_PATTERNS.EMAIL.test("user@example.com")).toBe(true);
    });
    test("should reject email without @", () => {
      expect(REGEX_PATTERNS.EMAIL.test("userexample.com")).toBe(false);
    });
    test("should reject email without domain", () => {
      expect(REGEX_PATTERNS.EMAIL.test("user@")).toBe(false);
    });
  });

  describe("PHONE", () => {
    test("should accept valid 9-digit phone", () => {
      expect(REGEX_PATTERNS.PHONE.test("612345678")).toBe(true);
    });
    test("should reject phone with letters", () => {
      expect(REGEX_PATTERNS.PHONE.test("612abc678")).toBe(false);
    });
    test("should reject phone too short", () => {
      expect(REGEX_PATTERNS.PHONE.test("123")).toBe(false);
    });
  });
});

// ============================================================================
// USER_ROLES
// ============================================================================
describe("USER_ROLES", () => {
  test("OWNER should be DUENO", () => expect(USER_ROLES.OWNER).toBe("DUENO"));
  test("MANAGER should be GERENTE", () => expect(USER_ROLES.MANAGER).toBe("GERENTE"));
  test("CLIENT should be CLIENTE", () => expect(USER_ROLES.CLIENT).toBe("CLIENTE"));
});

// ============================================================================
// ROLE_PERMISSIONS
// ============================================================================
describe("ROLE_PERMISSIONS", () => {
  test("OWNER should have full permissions", () => {
    expect(ROLE_PERMISSIONS["DUENO"]).toContain("manage_gym");
    expect(ROLE_PERMISSIONS["DUENO"]).toContain("manage_employees");
    expect(ROLE_PERMISSIONS["DUENO"]).toContain("manage_payments");
    expect(ROLE_PERMISSIONS["DUENO"]).toContain("view_reports");
  });

  test("MANAGER should NOT have manage_settings", () => {
    expect(ROLE_PERMISSIONS["GERENTE"]).not.toContain("manage_settings");
  });

  test("CLIENT should only have basic personal permissions", () => {
    expect(ROLE_PERMISSIONS["CLIENTE"]).toContain("view_own_profile");
    expect(ROLE_PERMISSIONS["CLIENTE"]).not.toContain("manage_gym");
  });
});

// ============================================================================
// LOG_LEVELS & LOG_CONTEXT
// ============================================================================
describe("LOG_LEVELS", () => {
  test("should define all standard levels", () => {
    expect(LOG_LEVELS.ERROR).toBe("error");
    expect(LOG_LEVELS.WARN).toBe("warn");
    expect(LOG_LEVELS.INFO).toBe("info");
    expect(LOG_LEVELS.DEBUG).toBe("debug");
  });
});

describe("LOG_CONTEXT", () => {
  test("should define all key contexts", () => {
    expect(LOG_CONTEXT.AUTH).toBe("AUTH");
    expect(LOG_CONTEXT.PAYMENT).toBe("PAYMENT");
    expect(LOG_CONTEXT.SYSTEM).toBe("SYSTEM");
  });
});

// ============================================================================
// DATE_FORMATS
// ============================================================================
describe("DATE_FORMATS", () => {
  test("ISO format should be YYYY-MM-DD", () => {
    expect(DATE_FORMATS.ISO).toBe("YYYY-MM-DD");
  });
  test("DISPLAY format should be DD/MM/YYYY", () => {
    expect(DATE_FORMATS.DISPLAY).toBe("DD/MM/YYYY");
  });
});
