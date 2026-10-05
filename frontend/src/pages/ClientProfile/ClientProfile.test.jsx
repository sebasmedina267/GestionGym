import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import api from "../../api/axios";
import ClientProfile from "./ClientProfile";

const notificationMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock("../../hooks/useNotification", () => ({
  useNotification: () => notificationMocks,
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

describe("ClientProfile payment history", () => {
  it("renders the member's transactions and paid total", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/client/dashboard/profile") {
        return Promise.resolve({
          data: { data: { nombre: "Ana", apellido: "García", email: "ana@example.com" } },
        });
      }
      if (url === "/client/dashboard/transactions") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 17,
                tipo_transaccion: "MEMBRESÍA",
                gym_nombre: "FitFlow Centro",
                metodo_pago: "TARJETA",
                importe: 42,
                fecha_pago: "2026-10-01",
                pagado: 1,
              },
            ],
          },
        });
      }
      if (url === "/client/dashboard/transactions/stats") {
        return Promise.resolve({ data: { data: { total_gastado: 42 } } });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });

    render(
      <MemoryRouter>
        <ClientProfile />
      </MemoryRouter>
    );

    expect(await screen.findByText(/FitFlow Centro/)).toBeInTheDocument();
    expect(screen.getByText("MEMBRESÍA")).toBeInTheDocument();
    expect(screen.getByText("Pagado")).toBeInTheDocument();
    expect(screen.getByText(/Total pagado:/)).toHaveTextContent(/42,00\s?€/);
  });
});
