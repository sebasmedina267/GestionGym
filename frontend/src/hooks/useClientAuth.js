/**
 * useClientAuth Hook
 * 
 * Manages client/user authentication state.
 * Handles login, logout, and user data persistence.
 * 
 * Usage:
 *   const { user, login, logout, isLoggedIn, isLoading, error } = useClientAuth();
 */

import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const LOCAL_STORAGE_KEY = "fitflow_client_session";

export function useClientAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setUser(parsed.user);
        setToken(parsed.token);
        // Set token in axios default headers
        if (parsed.token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error("Failed to parse stored session:", err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/user/login", {
        email,
        password,
      });

      const { user: userData, token: newToken } = response.data.data;

      // Store in state
      setUser(userData);
      setToken(newToken);

      // Store in localStorage
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          user: userData,
          token: newToken,
        })
      );

      // Set token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new client account
   */
  const register = useCallback(async (email, nombre, apellido, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/user/register", {
        email,
        nombre,
        apellido,
        password,
      });

      const { user: userData, token: newToken } = response.data.data;

      // Store in state
      setUser(userData);
      setToken(newToken);

      // Store in localStorage
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          user: userData,
          token: newToken,
        })
      );

      // Set token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  /**
   * Update user data in state (for profile updates)
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      parsed.user = { ...parsed.user, ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  }, []);

  return {
    user,
    token,
    isLoggedIn: !!user && !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    setError, // Expose for manual error handling
  };
}
