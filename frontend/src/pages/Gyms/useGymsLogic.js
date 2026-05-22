import { useState, useContext } from "react";
import { useFetch } from "../../hooks/useFetch";
import { NotificationContext } from "../../context/NotificationContext";
import api, { UPLOADS_URL } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createBranchSubscriptionPayment } from "../../api/stripe.api";

/** 
 * Interface Definition: Initial/Reset state for gym branch profiles.
 */
export const EMPTY_GYM_FORM = { 
  nombre: "", 
  direccion: "", 
  ciudad: "", 
  foto: "", 
  urlWeb: "",
  latitud: "",
  longitud: ""
};

/**
 * useGymsLogic Custom Hook
 * 
 * Orchestrates the complex lifecycle of gym branch management and expansion.
 * Key responsibilities:
 * - Data fetching for active and system-available branches.
 * - Form management for branch creation, editing, and assignment.
 * - Integration with Stripe for branch subscription payments.
 * - Centralized UI feedback (Notifications).
 * - Asset resolution (Image URL mapping).
 */
export function useGymsLogic() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const isDueno = admin?.roles?.includes("DUENO");

  // --- Primary Data Queries ---
  const { data: allGyms, loading, refetch } = useFetch("/gyms/all");
  const { data: myGyms, refetch: refetchMy } = useFetch("/gyms");

  // --- UI Visibility State ---
  const [openCreateGym, setOpenCreateGym] = useState(false);
  const [openAssignGym, setOpenAssignGym] = useState(false);
  const [openEditGym, setOpenEditGym] = useState(false);
  const [editingGym, setEditingGym] = useState(null);

  // --- Form State ---
  const [createForm, setCreateForm] = useState(EMPTY_GYM_FORM);
  const [editForm, setEditForm] = useState(EMPTY_GYM_FORM);
  const [assignForm, setAssignForm] = useState({ gymId: "" });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /** 
   * Computed: Identifies branches in the system not yet managed by the owner.
   */
  const availableGyms = (allGyms || []).filter((g) => !g.isAssigned);

  // --- Asset Management ---
  
  /** Normalizes image paths for CDN/Static asset consumption */
  const resolvePhoto = (foto) => {
    if (!foto) return null;
    if (foto.startsWith("http")) return foto;
    return `${UPLOADS_URL}/${foto.replace(/^\/uploads\//, "")}`;
  };

  // --- Action Handlers ---

  /** 
   * Orchestrates the multi-step branch expansion flow.
   * 1. Validates the local expansion form.
   * 2. Initializes a Stripe Payment Intent for the branch subscription.
   * 3. Redirects to the secure payment portal.
   */
  const handleCreateGym = async () => {
    const newErrors = {};
    if (!createForm.nombre) newErrors.nombre = "El nombre de la sucursal es obligatorio";
    if (!createForm.direccion) newErrors.direccion = "La dirección es obligatoria";
    if (!createForm.ciudad) newErrors.ciudad = "La ciudad es obligatoria";
    if (!createForm.latitud) newErrors.latitud = "La latitud es obligatoria";
    if (!createForm.longitud) newErrors.longitud = "La longitud es obligatoria";
    
    // Validar que latitud y longitud sean números válidos
    if (createForm.latitud && (isNaN(createForm.latitud) || createForm.latitud < -90 || createForm.latitud > 90)) {
      newErrors.latitud = "La latitud debe estar entre -90 y 90";
    }
    if (createForm.longitud && (isNaN(createForm.longitud) || createForm.longitud < -180 || createForm.longitud > 180)) {
      newErrors.longitud = "La longitud debe estar entre -180 y 180";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      addNotification("Por favor completa todos los campos requeridos correctamente", "error");
      return;
    }

    try {
      setSaving(true);
      
      // Step 1: Request a Payment Intent from the strategic billing engine
      const paymentIntent = await createBranchSubscriptionPayment({
        ownerId: admin.id,
        email: admin.email,
        branchName: createForm.nombre
      });

      // Step 2: Store session context for post-payment infrastructure deployment
      sessionStorage.setItem('branchPaymentData', JSON.stringify({
        paymentIntentId: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        branchData: {
          nombre: createForm.nombre,
          direccion: createForm.direccion,
          ciudad: createForm.ciudad,
          urlWeb: createForm.urlWeb,
          latitud: parseFloat(createForm.latitud),
          longitud: parseFloat(createForm.longitud)
        }
      }));

      addNotification("Redirigiendo al portal de pago...", "info");
      
      // Step 3: Transition to the high-security payment gateway
      navigate("/branch-payment");
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al inicializar la creación de sucursal";
      addNotification(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  /** 
   * Links a system-available branch to the owner's managed portfolio.
   */
  const handleAssignGym = async () => {
    if (!assignForm.gymId) {
      setErrors({ gymId: "Seleccione una sucursal" });
      addNotification("Seleccione una sucursal para vincular", "error");
      return;
    }
    try {
      setSaving(true);
      await api.post("/gyms/assign-gym", { gymId: Number(assignForm.gymId) });
      
      setOpenAssignGym(false);
      setAssignForm({ gymId: "" });
      
      refetch();
      refetchMy();
      addNotification("Sucursal vinculada exitosamente a tu portafolio", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al vincular la sucursal";
      addNotification(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  /** Pre-populates the configuration interface for a specific branch */
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

  /** Persists administrative profile changes for a branch */
  const handleEditGym = async () => {
    const newErrors = {};
    if (!editForm.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!editForm.direccion) newErrors.direccion = "La dirección es obligatoria";
    if (!editForm.ciudad) newErrors.ciudad = "La ciudad es obligatoria";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      addNotification("Por favor completa todos los campos requeridos", "error");
      return;
    }

    try {
      setSaving(true);
      await api.patch(`/gyms/${editingGym.id}`, editForm);
      
      setOpenEditGym(false);
      setEditingGym(null);
      
      refetch();
      refetchMy();
      addNotification(`${editForm.nombre} ha sido actualizada exitosamente`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al actualizar la sucursal";
      addNotification(errorMsg, "error");
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

    resolvePhoto,

    handleCreateGym,
    handleAssignGym,
    openEdit,
    handleEditGym,
  };
}
