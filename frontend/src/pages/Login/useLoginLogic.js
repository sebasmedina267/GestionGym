import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * useLoginLogic Custom Hook
 * 
 * Separates the authentication logic from the visual representation of the login page.
 * Manages form state, loading indicators, and error handling for the login process.
 */
export const useLoginLogic = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Core form state for user credentials
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    // Request lifecycle states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Updates specific fields in the form state.
     * @param {string} field - 'email' or 'password'
     * @param {string} value - User input
     */
    const handleInputChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /**
     * Executes the login operation via the auth service.
     * Redirects based on user type:
     * - Admin → /select-gym
     * - Client → /onboarding (if no gym) or /client/dashboard (if has gym)
     */
    const handleSubmit = async (e) => {
        if (e) e.preventDefault(); // Prevent standard browser form submission

        setLoading(true);
        setError(null);

        try {
            // Attempt to authenticate through the global auth context
            await login(form.email, form.password);

            // Get user data from localStorage to determine type
            const userData = JSON.parse(localStorage.getItem("admin") || "{}");

            // Redirect based on user type
            if (userData.tipo === "USUARIO_FINAL") {
                // Client user - check if they have a gym
                if (userData.gyms && userData.gyms.length > 0) {
                    navigate("/client/dashboard");
                } else {
                    navigate("/onboarding");
                }
            } else {
                // Admin user - send to gym selection
                navigate("/select-gym");
            }
        } catch (err) {
            console.error("Login lifecycle error:", err);
            // Extract server message or provide a localized fallback
            setError(err.response?.data?.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        error,
        handleInputChange,
        handleSubmit,
    };
};
