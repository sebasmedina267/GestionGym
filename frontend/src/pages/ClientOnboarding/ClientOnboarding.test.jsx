import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ClientOnboarding from "./ClientOnboarding";
import { AuthContext } from "../../context/AuthContext";

vi.mock("../../hooks/useGymDiscovery", () => ({
  useGymDiscovery: () => ({
    gyms: [
      {
        id: 7,
        nombre: "Gym Test",
        ciudad: "Madrid",
        direccion: "Calle Falsa 123",
        distancia_km: 1.5,
        miembros_activos: 42,
        total_maquinas: 18,
        total_clases: 6,
        horario_inicio: "06:00",
        horario_fin: "22:00",
      },
    ],
    loading: false,
    error: null,
    userLocation: { latitude: 40.4, longitude: -3.7 },
    searchNearbyFromCurrentLocation: vi.fn(),
    getGymDetails: vi.fn(),
    selectedGym: {
      id: 7,
      nombre: "Gym Test",
      ciudad: "Madrid",
      direccion: "Calle Falsa 123",
      horario_inicio: "06:00",
      horario_fin: "22:00",
      telefono: "600000000",
      email_contacto: "gym@test.com",
      total_maquinas: 18,
      total_clases: 6,
      total_productos: 3,
      miembros_activos: 42,
    },
  }),
}));

describe("ClientOnboarding gym selection", () => {
  it("navigates to the client enrollment page when the user selects a gym", async () => {
    render(
      <AuthContext.Provider value={{ logout: vi.fn() }}>
        <MemoryRouter initialEntries={["/onboarding"]}>
          <Routes>
            <Route path="/onboarding" element={<ClientOnboarding />} />
            <Route path="/client/enroll" element={<div>Enrollment page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Apuntarme a este Gym/i }));

    expect(await screen.findByText("Enrollment page")).toBeInTheDocument();
  });
});
