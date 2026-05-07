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
     * Redirects to gym selection on success or catches and displays errors on failure.
     */
    const handleSubmit = async (e) => {
        if (e) e.preventDefault(); // Prevent standard browser form submission
        
        setLoading(true);
        setError(null);
        
        try {
            // Attempt to authenticate through the global auth context
            await login(form.email, form.password);
            
            // On success, redirect to the gym branch selection screen
            navigate("/select-gym");
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
