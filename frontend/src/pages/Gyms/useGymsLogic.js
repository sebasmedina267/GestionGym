import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
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
  urlWeb: "" 
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

  // --- Centralized Notification System ---
  const [notif, setNotif] = useState({ open: false, title: "", message: "", type: "info" });
  const showNotif = (title, message, type = "info") =>
    setNotif({ open: true, title, message, type });
  const closeNotif = () => setNotif((n) => ({ ...n, open: false }));

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
    if (!createForm.nombre) newErrors.nombre = "Obligatorio";
    if (!createForm.direccion) newErrors.direccion = "Obligatorio";
    if (!createForm.ciudad) newErrors.ciudad = "Obligatorio";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
          urlWeb: createForm.urlWeb
        }
      }));

      // Step 3: Transition to the high-security payment gateway
      navigate("/branch-payment");
      
    } catch (err) {
      showNotif("❌ Error Crítico", err.response?.data?.message || "Error al inicializar el ciclo de vida de facturación", "error");
    } finally {
      setSaving(false);
    }
  };

  /** 
   * Links a system-available branch to the owner's managed portfolio.
   */
  const handleAssignGym = async () => {
    if (!assignForm.gymId) {
      setErrors({ gymId: "Selección de sucursal objetivo obligatoria" });
      return;
    }
    try {
      setSaving(true);
      await api.post("/gyms/assign-gym", { gymId: Number(assignForm.gymId) });
      
      setOpenAssignGym(false);
      setAssignForm({ gymId: "" });
      
      refetch();
      refetchMy();
      showNotif("✅ Integración Exitosa", "La sucursal ha sido añadida a tu portafolio de gestión.", "success");
    } catch (err) {
      showNotif("❌ Error", err.response?.data?.message || "La integración al portafolio falló", "error");
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
    if (!editForm.nombre) newErrors.nombre = "Obligatorio";
    if (!editForm.direccion) newErrors.direccion = "Obligatorio";
    if (!editForm.ciudad) newErrors.ciudad = "Obligatorio";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      await api.patch(`/gyms/${editingGym.id}`, editForm);
      
      setOpenEditGym(false);
      setEditingGym(null);
      
      refetch();
      refetchMy();
      showNotif("✅ Configuración Actualizada", "Los datos administrativos de la sucursal han sido sincronizados.", "success");
    } catch (err) {
      showNotif("❌ Error de Sincronización", err.response?.data?.message || "Error al sincronizar la configuración de la sucursal", "error");
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
