import { createHash } from "node:crypto";
import { jest } from "@jest/globals";

const authRepository = {
  findAdminByEmail: jest.fn(),
  findUserFinalByEmail: jest.fn(),
  createPasswordResetToken: jest.fn(),
  invalidatePasswordResetToken: jest.fn(),
  resetPasswordWithToken: jest.fn(),
};
const sendPasswordResetEmail = jest.fn();
const hashPassword = jest.fn(async (password) => `hashed:${password}`);

jest.unstable_mockModule("../modules/auth/auth.repository.js", () => authRepository);
jest.unstable_mockModule("../services/email.service.js", () => ({ sendPasswordResetEmail }));
jest.unstable_mockModule("../utils/password.js", () => ({ hashPassword, comparePassword: jest.fn() }));
jest.unstable_mockModule("../utils/jwt.js", () => ({ signToken: jest.fn() }));
jest.unstable_mockModule("../modules/audit/audit.service.js", () => ({ registrarOperacion: jest.fn() }));
jest.unstable_mockModule("../config/db.js", () => ({ pool: {} }));
jest.unstable_mockModule("../config/env.js", () => ({
  config: { frontendUrl: "https://gym.example.com" },
}));
jest.unstable_mockModule("../utils/AppError.js", () => ({
  AppError: class AppError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  },
}));

const authService = await import("../modules/auth/auth.service.js");

describe("password recovery service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendPasswordResetEmail.mockResolvedValue(true);
  });

  test("sends a one-time link but never returns the recovery token", async () => {
    authRepository.findAdminByEmail.mockResolvedValue({
      nombre: "Ana",
      apellido: "García",
    });

    const result = await authService.requestPasswordReset("ana@example.com");

    expect(result).not.toHaveProperty("token");
    expect(result.mensaje).toBe("Si el correo está registrado, recibirás un enlace de recuperación.");
    expect(authRepository.createPasswordResetToken).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@example.com",
        tipo_usuario: "ADMIN",
        token: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );

    const [, , resetUrl] = sendPasswordResetEmail.mock.calls[0];
    const url = new URL(resetUrl);
    expect(url.origin).toBe("https://gym.example.com");
    expect(url.pathname).toBe("/reset-password");
    expect(url.searchParams.get("token")).toMatch(/^[a-f0-9]{64}$/);
    expect(authRepository.createPasswordResetToken.mock.calls[0][0].token).toBe(
      createHash("sha256").update(url.searchParams.get("token")).digest("hex")
    );
  });

  test("returns a generic response for unknown emails without sending mail", async () => {
    authRepository.findAdminByEmail.mockResolvedValue(undefined);
    authRepository.findUserFinalByEmail.mockResolvedValue(undefined);

    const result = await authService.requestPasswordReset("unknown@example.com");

    expect(result.mensaje).toBe("Si el correo está registrado, recibirás un enlace de recuperación.");
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(authRepository.createPasswordResetToken).not.toHaveBeenCalled();
  });

  test("hashes the supplied token and consumes it through the atomic repository operation", async () => {
    authRepository.resetPasswordWithToken.mockResolvedValue(true);

    await expect(authService.resetPassword({
      token: "email-token",
      newPassword: "SecurePass1!",
    })).resolves.toEqual({ mensaje: "Password updated successfully" });

    expect(authRepository.resetPasswordWithToken).toHaveBeenCalledWith(
      createHash("sha256").update("email-token").digest("hex"),
      "hashed:SecurePass1!"
    );
  });
});
