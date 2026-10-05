import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ClientEnroll from "./ClientEnroll";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("ClientEnroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a valid fallback price when the gym does not have a configured cuota", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          id: 1,
          nombre: "Patas Gym",
          direccion: "Calle Falsa 123",
          ciudad: "Madrid",
          horario_inicio: "06:00:00",
          horario_fin: "22:00:00",
          telefono: "600000000",
          total_clases: 1,
          total_maquinas: 2,
          total_productos: 3,
          miembros_activos: 10,
        },
      },
    });

    render(
      <AuthContext.Provider value={{ logout: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: "/client/enroll", state: { gymId: 1 } }]}>
          <Routes>
            <Route path="/client/enroll" element={<ClientEnroll />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect((await screen.findAllByText("Patas Gym")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Plan Mensual").length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toContain("NaN");
    expect(screen.getAllByText("$39").length).toBeGreaterThan(0);
  });

  it("reads the Stripe client secret from the real backend response shape", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          id: 1,
          nombre: "Patas Gym",
          direccion: "Calle Falsa 123",
          ciudad: "Madrid",
          horario_inicio: "06:00:00",
          horario_fin: "22:00:00",
          telefono: "600000000",
          total_clases: 1,
          total_maquinas: 2,
          total_productos: 3,
          miembros_activos: 10,
        },
      },
    });

    api.post.mockResolvedValue({
      data: {
        clientSecret: "pi_test_secret_123",
      },
    });

    render(
      <AuthContext.Provider value={{ logout: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: "/client/enroll", state: { gymId: 1 } }]}>
          <Routes>
            <Route path="/client/enroll" element={<ClientEnroll />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await screen.findAllByText("Patas Gym");

    const payButtons = await screen.findAllByRole("button", { name: /Pagar y Enrolarse/i });
    payButtons[0].click();

    await Promise.resolve();

    expect(api.post).toHaveBeenCalledWith(
      "/stripe/create-payment-intent",
      expect.objectContaining({
        gymId: 1,
        type: "MEMBERSHIP",
      })
    );
    expect(screen.queryByText("Error al procesar la inscripción")).not.toBeInTheDocument();
  });
});
