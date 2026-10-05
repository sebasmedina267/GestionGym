import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useGymDiscovery } from "./useGymDiscovery";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("useGymDiscovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to the full gym list when browser geolocation is denied", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_success, error) => error(new Error("User denied Geolocation")),
      },
      configurable: true,
    });

    api.get.mockResolvedValue({
      data: {
        data: [
          { id: 42, nombre: "Gym fallback", distancia_km: null, miembros_activos: 10 },
        ],
      },
    });

    const { result } = renderHook(() => useGymDiscovery());

    await act(async () => {
      await result.current.searchNearbyFromCurrentLocation(25);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/client/gyms",
        expect.objectContaining({
          params: expect.objectContaining({ radius: 25 }),
        })
      );
    });

    expect(result.current.gyms).toHaveLength(1);
    expect(result.current.gyms[0].nombre).toBe("Gym fallback");
  });
});
