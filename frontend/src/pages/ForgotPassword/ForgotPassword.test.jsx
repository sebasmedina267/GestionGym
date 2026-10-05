import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";
import PasswordResetPage from "./PasswordResetPage";
import api from "../../api/axios";

vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

function LocationSearch() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

describe("password recovery pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the same confirmation regardless of whether an email exists", async () => {
    api.post.mockResolvedValue({
      status: 200,
      data: { message: "Si el correo está registrado, recibirás un enlace de recuperación." },
    });

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("tu@ejemplo.com"), {
      target: { value: "persona@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar Enlace de Recuperación/i }));

    expect(await screen.findByText(/Si el correo está registrado/i)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/auth/password-reset-request", {
      email: "persona@example.com",
    });
  });

  it("keeps the emailed token in the form while removing it from the address", async () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=secret-reset-token"]}>
        <LocationSearch />
        <Routes>
          <Route path="/reset-password" element={<PasswordResetPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Ingresa el código recibido por correo"))
      .toHaveValue("secret-reset-token");
    await waitFor(() => expect(screen.getByTestId("location-search")).toHaveTextContent(""));
  });
});
