import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStripeCheckout } from "./useStripeCheckout";

const mockNavigate = vi.fn();
const mockLocation = {
  pathname: "/stripe-checkout",
  search: "?clientSecret=pi_test_secret&gymId=42&plan=monthly&amount=3900",
  state: {},
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => ({ confirmCardPayment: vi.fn() }),
  useElements: () => ({ getElement: () => ({}) }),
  CardElement: () => null,
}));

vi.mock("../../../api/stripe.api", () => ({
  confirmOwnerPayment: vi.fn(),
  createBranchAfterPayment: vi.fn(),
  createOwnerSubscriptionPayment: vi.fn(),
  createBranchSubscriptionPayment: vi.fn(),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: () => ({
    admin: { id: 7, email: "cliente@test.com", nombre: "Cliente" },
  }),
}));

describe("useStripeCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects the client membership payment flow from query params", async () => {
    const { result } = renderHook(() => useStripeCheckout());

    await waitFor(() => {
      expect(result.current.paymentData?.type).toBe("CLIENT_MEMBERSHIP");
    });

    expect(result.current.paymentData.gymId).toBe("42");
    expect(result.current.paymentData.email).toBe("cliente@test.com");
  });
});
