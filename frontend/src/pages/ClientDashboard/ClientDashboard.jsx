import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import ClientWelcome from "./ClientWelcome";
import ClientEnrolled from "./ClientEnrolled";

/**
 * ClientDashboard - Main Wrapper Component
 * 
 * Intelligent router that bifurcates between:
 * - ClientWelcome: For users NOT enrolled in any gym
 * - ClientEnrolled: For users enrolled in a gym
 * 
 * Checks the user's enrollment status and displays the appropriate view.
 */
export default function ClientDashboard() {
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkEnrollmentStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      // Check if user has any enrolled gyms
      const gymsRes = await api.get("/client/dashboard/my-gyms");

      if (gymsRes.data?.data?.length > 0) {
        const firstGym = gymsRes.data.data[0];
        // Get detailed info for the first gym
        const detailsRes = await api.get(`/client/dashboard/my-gyms/${firstGym.id}`);
        setGym(detailsRes.data?.data);
      } else {
        // User has no gym - show welcome screen
        setGym(null);
      }
    } catch (err) {
      console.error("Error checking enrollment status:", err);
      setError("No pudimos comprobar tu estado de membresía");
      setGym(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  const handleUnenroll = () => {
    // After unenrolling, reload to show welcome screen
    setGym(null);
    setTimeout(() => checkEnrollmentStatus(), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0b14] text-gym-accent">
        <div className="animate-pulse text-xl font-bold tracking-widest uppercase">
          Cargando tu experiencia...
        </div>
      </div>
    );
  }

  if (error && !gym) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14] text-white px-6">
        <div className="rounded-2xl border border-red-500/30 bg-[#111422] p-8 text-center">
          <p className="text-lg font-semibold text-red-300">{error}</p>
          <button
            onClick={checkEnrollmentStatus}
            className="mt-4 rounded-lg bg-gym-accent px-4 py-2 font-medium text-[#0a0b14]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Show welcome screen if user has no gym
  if (!gym) {
    return <ClientWelcome />;
  }

  // Show enrolled gym dashboard if user has a gym
  return <ClientEnrolled gym={gym} onUnenroll={handleUnenroll} />;
}
