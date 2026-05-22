/**
 * useGymDiscovery Hook
 * 
 * Manages gym discovery and search functionality.
 * Handles geolocation and API calls for nearby gyms.
 * 
 * Usage:
 *   const { gyms, loading, error, searchNearby, getGymDetails } = useGymDiscovery();
 */

import { useState, useCallback } from "react";
import api from "../api/axios";

export function useGymDiscovery() {
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  /**
   * Get user's current location via browser geolocation API
   */
  const getUserLocation = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          resolve({ latitude, longitude });
        },
        (err) => {
          reject(new Error(`Geolocation error: ${err.message}`));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 3600000, // 1 hour cache
        }
      );
    });
  }, []);

  /**
   * Search for nearby gyms
   */
  const searchNearby = useCallback(
    async (latitude, longitude, radiusKm = 5) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/client/gyms/near", {
          params: {
            lat: latitude,
            lng: longitude,
            radius: radiusKm,
          },
        });

        setGyms(response.data.data);
        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to search gyms";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get detailed information about a specific gym
   */
  const getGymDetails = useCallback(async (gymId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/client/gyms/${gymId}/details`);
      setSelectedGym(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch gym details";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get classes for a specific gym
   */
  const getGymClasses = useCallback(async (gymId) => {
    try {
      const response = await api.get(`/client/gyms/${gymId}/classes`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch classes";
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Get machines for a specific gym
   */
  const getGymMachines = useCallback(async (gymId) => {
    try {
      const response = await api.get(`/client/gyms/${gymId}/machines`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch machines";
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Get products for a specific gym
   */
  const getGymProducts = useCallback(async (gymId, merchandiseOnly = false) => {
    try {
      const response = await api.get(`/client/gyms/${gymId}/products`, {
        params: {
          merchandise: merchandiseOnly,
        },
      });
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch products";
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Get schedule for a specific gym
   */
  const getGymSchedule = useCallback(async (gymId) => {
    try {
      const response = await api.get(`/client/gyms/${gymId}/schedule`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch schedule";
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Search nearby gyms using current browser location
   */
  const searchNearbyFromCurrentLocation = useCallback(
    async (radiusKm = 5) => {
      try {
        const location = await getUserLocation();
        await searchNearby(location.latitude, location.longitude, radiusKm);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [getUserLocation, searchNearby]
  );

  return {
    // State
    gyms,
    selectedGym,
    loading,
    error,
    userLocation,

    // Methods
    getUserLocation,
    searchNearby,
    searchNearbyFromCurrentLocation,
    getGymDetails,
    getGymClasses,
    getGymMachines,
    getGymProducts,
    getGymSchedule,

    // Utils
    setSelectedGym,
    setError,
  };
}
