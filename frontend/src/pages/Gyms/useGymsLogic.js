import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import api, { UPLOADS_URL } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createBranchSubscriptionPayment } from "../../api/stripe.api";

export const EMPTY_GYM_FORM = { nombre: "", direccion: "", ciudad: "", foto: "", urlWeb: "" };

export function useGymsLogic() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const isDueno = admin?.roles?.includes("DUENO");

  const { data: allGyms, loading, refetch } = useFetch("/gyms/all");
  const { data: myGyms, refetch: refetchMy } = useFetch("/gyms");

  const [openCreateGym, setOpenCreateGym] = useState(false);
  const [openAssignGym, setOpenAssignGym] = useState(false);
  const [openEditGym, setOpenEditGym] = useState(false);
  const [editingGym, setEditingGym] = useState(null);

  const [createForm, setCreateForm] = useState(EMPTY_GYM_FORM);
  const [editForm, setEditForm] = useState(EMPTY_GYM_FORM);
  const [assignForm, setAssignForm] = useState({ gymId: "" });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal de notificaciones (reemplaza alert)
  const [notif, setNotif] = useState({ open: false, title: "", message: "", type: "info" });
  const showNotif = (title, message, type = "info") =>
    setNotif({ open: true, title, message, type });
  const closeNotif = () => setNotif((n) => ({ ...n, open: false }));

  const availableGyms = (allGyms || []).filter((g) => !g.isAssigned);

  // ============================================================
  // Helpers de imagen
  // ============================================================
  const resolvePhoto = (foto) => {
    if (!foto) return null;
    if (foto.startsWith("http")) return foto;
    return `${UPLOADS_URL}/${foto.replace(/^\/uploads\//, "")}`;
  };

  // ============================================================
  // Crear gym
  // ============================================================
  const handleCreateGym = async () => {
    const newErrors = {};
    if (!createForm.nombre) newErrors.nombre = "Requerido";
    if (!createForm.direccion) newErrors.direccion = "Requerido";
    if (!createForm.ciudad) newErrors.ciudad = "Requerido";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      
      // 1. Crear el Payment Intent en el backend
      const paymentIntent = await createBranchSubscriptionPayment({
        ownerId: admin.id,
        email: admin.email,
        branchName: createForm.nombre
      });

      // 2. Guardar datos en sessionStorage para recuperarlos tras el pago
      sessionStorage.setItem('branchPaymentData', JSON.stringify({
        paymentIntentId: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        branchData: {
          nombre: createForm.nombre,
          direccion: createForm.direccion,
          ciudad: createForm.ciudad,
          urlWeb: createForm.urlWeb
        }
      }));

      // 3. Redirigir a la página de pago
      navigate("/branch-payment");
      
    } catch (err) {
      showNotif("❌ Error", err.response?.data?.message || "Error al iniciar proceso de pago", "error");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Asignar gym
  // ============================================================
  const handleAssignGym = async () => {
    if (!assignForm.gymId) {
      setErrors({ gymId: "Selecciona un gimnasio" });
      return;
    }
    try {
      setSaving(true);
      await api.post("/gyms/assign-gym", { gymId: Number(assignForm.gymId) });
      setOpenAssignGym(false);
      setAssignForm({ gymId: "" });
      refetch();
      refetchMy();
      showNotif("✅ Asignado", "Gimnasio asignado correctamente.", "success");
    } catch (err) {
      showNotif("❌ Error", err.response?.data?.message || "Error al asignar gimnasio", "error");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Editar gym
  // ============================================================
  const openEdit = (gym) => {
    setEditingGym(gym);
    setEditForm({
      nombre: gym.nombre || "",
      direccion: gym.direccion || "",
      ciudad: gym.ciudad || "",
      foto: gym.foto || "",
      urlWeb: gym.url_web || "",
    });
    setErrors({});
    setOpenEditGym(true);
  };

  const handleEditGym = async () => {
    const newErrors = {};
    if (!editForm.nombre) newErrors.nombre = "Requerido";
    if (!editForm.direccion) newErrors.direccion = "Requerido";
    if (!editForm.ciudad) newErrors.ciudad = "Requerido";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      await api.patch(`/gyms/${editingGym.id}`, editForm);
      setOpenEditGym(false);
      setEditingGym(null);
      refetch();
      refetchMy();
      showNotif("✅ Actualizado", "Gimnasio actualizado correctamente.", "success");
    } catch (err) {
      showNotif("❌ Error", err.response?.data?.message || "Error al actualizar gimnasio", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    isDueno,
    loading,
    myGyms,
    availableGyms,
    
    openCreateGym,
    setOpenCreateGym,
    openAssignGym,
    setOpenAssignGym,
    openEditGym,
    setOpenEditGym,
    editingGym,

    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    assignForm,
    setAssignForm,

    errors,
    setErrors,
    saving,

    notif,
    closeNotif,
    resolvePhoto,

    handleCreateGym,
    handleAssignGym,
    openEdit,
    handleEditGym,
  };
}

