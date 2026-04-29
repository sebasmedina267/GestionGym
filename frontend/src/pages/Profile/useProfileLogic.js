import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useGym } from "../../hooks/useGym";

export const useProfileLogic = () => {
  const { admin, logout } = useAuth();
  const { gym } = useGym();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGym, setShowCreateGym] = useState(false);
  const [newGymForm, setNewGymForm] = useState({ nombre: "", direccion: "" });
  const [savingGym, setSavingGym] = useState(false);
  
  // Empleados
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [showEditEmpleado, setShowEditEmpleado] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", email: "", rol: "" });
  const [savingEmpleado, setSavingEmpleado] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const isDueno = admin?.roles?.includes('DUENO');

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

  // Cargar empleados del gym
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
      // Recargar empleados
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

  const handleDeleteEmpleado = async (empleado) => {
    setEmployeeToDelete(empleado);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSavingEmpleado(true);
      await api.delete(`/admins/${employeeToDelete.id}`);
      alert("Empleado eliminado correctamente");
      setShowConfirmDelete(false);
      setEmployeeToDelete(null);
      // Recargar empleados
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
