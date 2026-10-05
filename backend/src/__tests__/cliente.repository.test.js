import { jest } from "@jest/globals";

const pool = {
  query: jest.fn(),
};

jest.unstable_mockModule("../config/db.js", () => ({ pool }));

const clienteRepository = await import("../modules/cliente/cliente.repository.js");

describe("client dashboard repository access scoping", () => {
  beforeEach(() => {
    pool.query.mockReset();
    pool.query.mockResolvedValue([[]]);
  });

  test("lists only class sessions booked by the requested app user", async () => {
    await clienteRepository.getUserClasses(12);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("cli.email = uf.email");
    expect(query).toContain("cc.cliente_id = cli.id");
    expect(query).toContain("ufg.usuario_id = ?");
    expect(query).not.toContain("cc.cliente_id IS NOT NULL");
    expect(params).toEqual([12]);
  });

  test("filters available sessions against the requested user's bookings", async () => {
    await clienteRepository.getAvailableClassesForGym(12, 4, false);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("usuario.id = ?");
    expect(query).toContain("reserva_usuario.clase_horario_id = ch.id");
    expect(params).toEqual([4, 12]);
  });

  test("filters native client bookings by client ID instead of app account ID", async () => {
    await clienteRepository.getAvailableClassesForGym(6, 4, false, true);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("reserva_usuario.cliente_id = ?");
    expect(query).not.toContain("JOIN usuarios_finales usuario");
    expect(params).toEqual([4, 6]);
  });

  test("cancels only a class booking linked to the requested app user's email", async () => {
    await clienteRepository.unenrollUserFromClass(12, 7);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("JOIN usuarios_finales uf ON uf.email = c.email");
    expect(query).toContain("uf.id = ?");
    expect(params).toEqual([7, 12]);
  });

  test("limits app transaction history to payments linked to that user's client record", async () => {
    await clienteRepository.getUserTransactions(12, null, 25, 0);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("c.id = p.cliente_id");
    expect(query).toContain("uf.email = c.email");
    expect(query).toContain("WHERE uf.id = ?");
    expect(query).not.toContain("JOIN usuarios_finales_gimnasios");
    expect(params).toEqual([12, 25, 0]);
  });

  test("returns native client payments with the requested pagination", async () => {
    const payments = [{ id: 9, pagado: 1 }];
    pool.query.mockResolvedValueOnce([payments]);

    await expect(clienteRepository.getNativeClientTransactions(6, 10, 20))
      .resolves.toEqual(payments);

    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain("WHERE c.id = ?");
    expect(query).toContain("LIMIT ? OFFSET ?");
    expect(params).toEqual([6, 10, 20]);
  });

  test("reports paid amounts only in transaction statistics", async () => {
    await clienteRepository.getUserTransactionStats(12);

    const [query] = pool.query.mock.calls[0];
    expect(query).toContain("CASE WHEN p.pagado = TRUE THEN p.importe ELSE 0 END");
    expect(query).toContain("JOIN usuarios_finales uf ON uf.email = c.email");
  });
});
