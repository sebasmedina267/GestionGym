import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ClientDashboard from "./ClientDashboard";
import api from "../../api/axios";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("./ClientWelcome", () => ({
  default: () => <div>ClientWelcome</div>,
}));

vi.mock("./ClientEnrolled", () => ({
  default: ({ gym }) => <div>ClientEnrolled:{gym?.nombre}</div>,
}));

describe("ClientDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the active gym and renders the enrolled dashboard when the user is already a member", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/client/dashboard/my-gyms") {
        return Promise.resolve({
          data: { data: [{ id: 99, nombre: "Patas Gym" }] },
        });
      }

      if (url === "/client/dashboard/my-gyms/99") {
        return Promise.resolve({
          data: { data: { id: 99, nombre: "Patas Gym", total_clases: 5, total_maquinas: 12, total_productos: 8 } },
        });
      }

      return Promise.reject(new Error(`Unexpected API request: ${url}`));
    });

    render(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("ClientEnrolled:Patas Gym")).toBeInTheDocument();
    });
  });
});
