import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import ClientEnrolled from "./ClientEnrolled";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    admin: { nombre: "Ana" },
    logout: vi.fn(),
  }),
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ClientEnrolled class enrollment", () => {
  it("loads available classes and shows enrollment actions for the enrolled gym", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/client/dashboard/my-gyms/12/available-classes?includeEnrolled=true") {
        return Promise.resolve({
          data: {
            data: [
              {
                horario_id: 45,
                nombre: "Yoga matutino",
                descripcion: "Clase de relajación",
                inicio: "2026-10-12T08:00:00.000Z",
                fin: "2026-10-12T09:00:00.000Z",
                aforo_maximo: 18,
                disponibles: 8,
                monitores: "Laura",
                inscritos_actuales: 10,
              },
            ],
          },
        });
      }

      if (url === "/client/dashboard/my-classes?status=upcoming") {
        return Promise.resolve({
          data: {
            data: [],
          },
        });
      }

      throw new Error(`Unexpected API request: ${url}`);
    });

    render(
      <MemoryRouter>
        <ClientEnrolled
          gym={{
            id: 12,
            nombre: "FitFlow Centro",
            direccion: "Calle Mayor 1",
          }}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText("Clases")[0]);

    expect(await screen.findByText("Yoga matutino")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Inscribirme/i })).toBeInTheDocument();
  });

  it("loads machines and products for the gym when the relevant tabs are opened", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/client/dashboard/my-gyms/12/machines") {
        return Promise.resolve({
          data: { data: [{ id: 1, nombre: "Bicicleta", uso: "Cardio", cantidad: 3, ubicacion: "Sala 1" }] },
        });
      }

      if (url === "/client/dashboard/my-gyms/12/products") {
        return Promise.resolve({
          data: { data: [{ id: 10, nombre: "Botella FitFlow", precio_unitario: 12, cantidad: 5, descripcion: "Botella reutilizable" }] },
        });
      }

      return Promise.resolve({ data: { data: [] } });
    });

    render(
      <MemoryRouter>
        <ClientEnrolled
          gym={{
            id: 12,
            nombre: "FitFlow Centro",
            direccion: "Calle Mayor 1",
          }}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText("Máquinas")[0]);
    expect(await screen.findByText("Bicicleta")).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Productos")[0]);
    expect(await screen.findByText("Botella FitFlow")).toBeInTheDocument();
  });
});
