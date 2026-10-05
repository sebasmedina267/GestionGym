import { jest } from "@jest/globals";

const repository = {
  getNativeClientClasses: jest.fn(),
  getUserClasses: jest.fn(),
  getNativeClientTransactions: jest.fn(),
  getUserTransactions: jest.fn(),
  isNativeClientEnrolledInClass: jest.fn(),
  isUserEnrolledInClass: jest.fn(),
  enrollNativeClientInClass: jest.fn(),
  enrollUserInClass: jest.fn(),
  unenrollNativeClientFromClass: jest.fn(),
  unenrollUserFromClass: jest.fn(),
};

jest.unstable_mockModule("../modules/cliente/cliente.repository.js", () => repository);

const clienteService = await import("../modules/cliente/cliente.service.js");

describe("client dashboard service", () => {
  beforeEach(() => {
    Object.values(repository).forEach((mock) => mock.mockReset());
  });

  test("returns only app-user classes via the user-specific repository query", async () => {
    const classes = [{ horario_id: 7 }];
    repository.getUserClasses.mockResolvedValue(classes);

    await expect(clienteService.getMyClasses({ id: 12 }, "upcoming"))
      .resolves.toEqual(classes);
    expect(repository.getUserClasses).toHaveBeenCalledWith(12, "upcoming");
  });

  test("uses the native member ID space for native client class history", async () => {
    repository.getNativeClientClasses.mockResolvedValue([]);

    await clienteService.getMyClasses({ id: 6, gymId: 4 }, "past");

    expect(repository.getNativeClientClasses).toHaveBeenCalledWith(6, "past");
    expect(repository.getUserClasses).not.toHaveBeenCalled();
  });

  test("rejects duplicate class bookings before attempting another insert", async () => {
    repository.isUserEnrolledInClass.mockResolvedValue(true);

    await expect(clienteService.enrollInClass({ id: 12 }, 7))
      .rejects.toMatchObject({ status: 400 });
    expect(repository.enrollUserInClass).not.toHaveBeenCalled();
  });

  test("books an app user's class through the app-user repository path", async () => {
    repository.isUserEnrolledInClass.mockResolvedValue(false);
    repository.enrollUserInClass.mockResolvedValue({ affectedRows: 1 });

    await expect(clienteService.enrollInClass({ id: 12 }, 7))
      .resolves.toMatchObject({ success: true });
    expect(repository.enrollUserInClass).toHaveBeenCalledWith(12, 7);
  });

  test("books a native client's class through the native repository path", async () => {
    repository.isNativeClientEnrolledInClass.mockResolvedValue(false);
    repository.enrollNativeClientInClass.mockResolvedValue({ affectedRows: 1 });

    await clienteService.enrollInClass({ id: 6, gymId: 4 }, 7);

    expect(repository.enrollNativeClientInClass).toHaveBeenCalledWith(6, 7);
    expect(repository.enrollUserInClass).not.toHaveBeenCalled();
  });

  test("rejects cancelling a booking that does not belong to the app user", async () => {
    repository.unenrollUserFromClass.mockResolvedValue({ affectedRows: 0 });

    await expect(clienteService.unenrollFromClass({ id: 12 }, 7))
      .rejects.toMatchObject({ status: 404 });
  });

  test("clamps transaction pagination and scopes account history by gym when requested", async () => {
    repository.getUserTransactions.mockResolvedValue([]);

    await clienteService.getTransactionHistory({ id: 12 }, "4", "500", "-10");

    expect(repository.getUserTransactions).toHaveBeenCalledWith(12, 4, 100, 0);
  });

  test("uses the native member's own transaction history and bounded pagination", async () => {
    repository.getNativeClientTransactions.mockResolvedValue([]);

    await clienteService.getTransactionHistory(
      { id: 6, gymId: 4 },
      null,
      "0",
      "15"
    );

    expect(repository.getNativeClientTransactions).toHaveBeenCalledWith(6, 50, 15);
    expect(repository.getUserTransactions).not.toHaveBeenCalled();
  });
});
