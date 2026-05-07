import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useGym } from "../../hooks/useGym";

/**
 * useProfileLogic Hook
 * 
 * Manages the data and operational state for the profile and team management module.
 * Responsibilities:
 * - Asynchronous retrieval of personal audit logs.
 * - Staff synchronization for the active branch (Owners only).
 * - Lifecycle management for branch expansion (Gym creation).
 * - Employee profile modification and offboarding workflows.
 * - Dynamic privilege badge calculation.
 * 
 * @returns {Object} State and operations for the profile dashboard.
 */
export const useProfileLogic = () => {
  const { admin, logout } = useAuth();
  const { gym } = useGym();
  
  // Audit and Loading State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Organizational Expansion State
  const [showCreateGym, setShowCreateGym] = useState(false);
  const [newGymForm, setNewGymForm] = useState({ nombre: "", direccion: "" });
  const [savingGym, setSavingGym] = useState(false);
  
  // Team Management (Staff) State
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [showEditEmpleado, setShowEditEmpleado] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", email: "", rol: "" });
  const [savingEmpleado, setSavingEmpleado] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const isDueno = admin?.roles?.includes('DUENO');

  /** Synchronizes personal activity audit trail upon component mount */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/audit/me');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error("Error cargando auditoría", err);
      } finally {
        setLoading(false);
      }
    };
    if (admin) fetchLogs();
  }, [admin]);

  /** Retrieves the branch staff list if the administrator has appropriate privileges (Owner) */
  useEffect(() => {
    const fetchEmpleados = async () => {
      if (!gym?.id || !isDueno) return;
      try {
        setLoadingEmpleados(true);
        const res = await api.get(`/admins?gymId=${gym.id}`);
        setEmpleados(res.data.data || []);
      } catch (err) {
        console.error("Error cargando empleados", err);
      } finally {
        setLoadingEmpleados(false);
      }
    };
    fetchEmpleados();
  }, [gym, isDueno]);

  /** 
   * Orchestrates the creation of a new gym branch infrastructure.
   * Note: This is a legacy implementation. Modern branch expansion uses Stripe redirection.
   */
  const handleCreateGym = async () => {
    if (!newGymForm.nombre.trim()) {
      alert("Por favor ingresa el nombre del gimnasio");
      return;
    }
    if (!newGymForm.direccion.trim()) {
      alert("Por favor ingresa la direccion del gimnasio");
      return;
    }

    try {
      setSavingGym(true);
      await api.post("/gyms", {
        nombre: newGymForm.nombre,
        direccion: newGymForm.direccion
      });
      alert("Gimnasio creado exitosamente");
      setShowCreateGym(false);
      setNewGymForm({ nombre: "", direccion: "" });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Error al crear gimnasio");
    } finally {
      setSavingGym(false);
    }
  };

  /** Initializes the employee profile update flow */
  const handleEditEmpleado = (empleado) => {
    setSelectedEmpleado(empleado);
    setEditForm({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      rol: empleado.rol || "EMPLEADO"
    });
    setShowEditEmpleado(true);
  };

  /** Persists staff profile updates and synchronizes the local staff list */
  const handleSaveEmpleado = async () => {
    if (!editForm.nombre.trim() || !editForm.apellido.trim()) {
      alert("Por favor completa nombre y apellido");
      return;
    }

    try {
      setSavingEmpleado(true);
      await api.put(`/admins/${selectedEmpleado.id}`, {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        email: editForm.email,
        rol: editForm.rol
      });
      alert("Empleado actualizado correctamente");
      setShowEditEmpleado(false);
      
      // Real-time synchronization of the team roster
      if (gym?.id) {
        const res = await api.get(`/admins?gymId=${gym.id}`);
        setEmpleados(res.data.data || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar empleado");
    } finally {
      setSavingEmpleado(false);
    }
  };

  /** Initiates the destructive offboarding process for a staff member */
  const handleDeleteEmpleado = async (empleado) => {
    setEmployeeToDelete(empleado);
    setShowConfirmDelete(true);
  };

  /** Confirms and executes staff record deletion */
  const confirmDelete = async () => {
    try {
      setSavingEmpleado(true);
      await api.delete(`/admins/${employeeToDelete.id}`);
      alert("Empleado eliminado correctamente");
      setShowConfirmDelete(false);
      setEmployeeToDelete(null);
      
      if (gym?.id) {
        const res = await api.get(`/admins?gymId=${gym.id}`);
        setEmpleados(res.data.data || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar empleado");
    } finally {
      setSavingEmpleado(false);
    }
  };

  /** Semantic badge mapping based on administrative privileges */
  const rolBadge = admin?.roles?.includes('DUENO') ? 'Socio Fundador (Dueño)' : 'Staff Operativo';

  return {
    admin,
    logout,
    gym,
    logs,
    loading,
    showCreateGym,
    setShowCreateGym,
    newGymForm,
    setNewGymForm,
    savingGym,
    empleados,
    loadingEmpleados,
    showEditEmpleado,
    setShowEditEmpleado,
    selectedEmpleado,
    editForm,
    setEditForm,
    savingEmpleado,
    showConfirmDelete,
    setShowConfirmDelete,
    employeeToDelete,
    isDueno,
    rolBadge,
    handleCreateGym,
    handleEditEmpleado,
    handleSaveEmpleado,
    handleDeleteEmpleado,
    confirmDelete
  };
};
