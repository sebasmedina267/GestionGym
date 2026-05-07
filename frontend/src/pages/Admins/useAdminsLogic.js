import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { useGym } from "../../hooks/useGym";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { createBranchSubscriptionPayment } from "../../api/stripe.api";

/**
 * useAdminsLogic Custom Hook
 * 
 * Orchestrates the business logic for staff management and organizational expansion.
 * Key responsibilities:
 * - Role-based authorization checks (Owner vs Manager).
 * - Multi-branch data synchronization and filtering.
 * - Form validation for staff onboarding (including complex password requirements).
 * - Multi-part form submission (Staff profiles + images).
 * - Orchestrating Stripe-based branch expansion payments.
 */
export const useAdminsLogic = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { gym } = useGym();
  
  // Authorization flags based on JWT claims
  const isDueno = admin?.roles?.includes('DUENO');
  const isEncargado = admin?.roles?.includes('ENCARGADO');
  const canManageStaff = isDueno || isEncargado;

  // --- Data Queries ---
  const { data: admins, loading, refetch } = useFetch("/admins");
  const { data: gyms, refetch: refetchGyms } = useFetch("/gyms");

  // --- UI visibility state ---
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreateGym, setShowCreateGym] = useState(false);
  const [viewAll, setViewAll] = useState(false); // Toggle organization-wide vs branch-specific view
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // --- Form State: Onboarding ---
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    gymId: "",
    rol: "EMPLEADO",
    foto: null,
  });

  // --- Form State: Gym Branch Creation ---
  const [formGym, setFormGym] = useState({
    nombre: "",
    direccion: "",
  });

  // --- Form State: Profile Updates ---
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    gymId: "",
    rol: "EMPLEADO",
    foto: null,
    photoPreview: null,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  /**
   * Validates password strength in real-time.
   * Requirements: 8+ chars, Uppercase, Number, Special Character.
   */
  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    const isValid = hasMinLength && hasUppercase && hasNumber && hasSymbol;
    setPasswordValid(isValid);
    return { hasMinLength, hasUppercase, hasNumber, hasSymbol };
  };

  /** 
   * Filters the staff list based on the 'Organization View' toggle.
   * Owners can see all staff across all branches, while Managers are scoped to their branch.
   */
  const filteredAdmins = viewAll || !gym 
    ? (admins || [])
    : (admins || []).filter(a => a.gyms?.some(g => g.id === gym.id));

  /** Normalizes staff data for UI table consumption */
  const tableData = (filteredAdmins || []).map(a => ({
    id: a.id,
    nombre: a.nombre,
    apellido: a.apellido,
    email: a.email,
    gymNombre: a.gyms?.map(g => g.nombre).join(", ") || "Sin asignar",
    rol: a.roles?.includes('DUENO') ? 'Dueño' : (a.roles?.includes('ENCARGADO') ? 'Gerente' : 'Empleado')
  }));

  /** Handles profile picture selection and preview generation for onboarding */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhotoPreview(evt.target?.result);
        setForm({ ...form, foto: file });
      };
      reader.readAsDataURL(file);
    }
  };

  /** Handles profile picture selection for existing profiles */
  const handleEditPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setEditForm({ ...editForm, photoPreview: evt.target?.result, foto: file });
      };
      reader.readAsDataURL(file);
    }
  };

  /** 
   * Submits a new staff onboarding request.
   * Uses FormData to support file uploads.
   */
  const handleCreate = async () => {
    const newErrors = {};

    // Base Validation
    if (!form.nombre) newErrors.nombre = "Obligatorio";
    if (!form.apellido) newErrors.apellido = "Obligatorio";
    if (!form.email) newErrors.email = "Obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Formato de correo inválido";
    if (!form.password) newErrors.password = "Obligatorio";
    if (!passwordValid) newErrors.password = "No se cumplen los requisitos de seguridad";
    if (!form.gymId) newErrors.gymId = "Selección de sucursal obligatoria";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      
      const roleToAssign = (isDueno && form.rol) ? form.rol : 'EMPLEADO';

      // Multi-part submission for files
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("apellido", form.apellido);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("gymId", form.gymId);
      formData.append("rol", roleToAssign);
      if (form.foto) formData.append("foto", form.foto);

      await api.post("/auth/register-employee", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setOpen(false);
      setForm({ nombre: "", apellido: "", email: "", password: "", gymId: "", rol: "EMPLEADO", foto: null });
      setPhotoPreview(null);
      setPasswordValid(false);
      refetch();
      alert("¡Miembro del personal contratado con éxito!");
    } catch (err) {
      console.error("Onboarding Error:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error crítico durante la contratación del personal";
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  /** Pre-populates the edit modal with selected staff data */
  const handleOpenEdit = (adminItem) => {
    const adminData = filteredAdmins.find(a => a.id === adminItem.id);
    setSelectedAdmin(adminData);
    setEditForm({
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      email: adminData.email || "",
      gymId: adminData.gyms?.[0]?.id || "",
      rol: adminData.roles?.includes('ENCARGADO') ? 'ENCARGADO' : 'EMPLEADO',
      foto: null,
      photoPreview: adminData.foto || null,
    });
    setShowEdit(true);
  };

  /** Persists profile updates */
  const handleEditSave = async () => {
    const newErrors = {};
    if (!editForm.nombre) newErrors.nombre = "Obligatorio";
    if (!editForm.apellido) newErrors.apellido = "Obligatorio";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("nombre", editForm.nombre);
      formData.append("apellido", editForm.apellido);
      if (editForm.email) formData.append("email", editForm.email);
      if (editForm.gymId) formData.append("gymId", Number(editForm.gymId));
      if (isDueno && editForm.rol) formData.append("rol", editForm.rol);
      if (editForm.foto) formData.append("foto", editForm.foto);

      await api.put(`/admins/${selectedAdmin.id}`, formData);

      setShowEdit(false);
      setSelectedAdmin(null);
      refetch();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al actualizar el perfil del personal");
    } finally {
      setSaving(false);
    }
  };

  /** Initializes the offboarding/deletion guard */
  const handleOpenDelete = (adminItem) => {
    const adminData = filteredAdmins.find(a => a.id === adminItem.id);
    setSelectedAdmin(adminData);
    setShowDelete(true);
  };

  /** Confirms staff deletion */
  const handleConfirmDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/admins/${selectedAdmin.id}`);
      setShowDelete(false);
      setSelectedAdmin(null);
      refetch();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al eliminar al miembro del personal");
    } finally {
      setSaving(false);
    }
  };

  /** 
   * Orchestrates the complex flow of creating a new gym branch.
   * This involves initializing a Stripe subscription flow.
   */
  const handleCreateGym = async () => {
    const newErrors = {};
    if (!formGym.nombre) newErrors.nombre = "Obligatorio";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      
      // Step 1: Initialize Payment Intent with Stripe
      const paymentData = await createBranchSubscriptionPayment({
        ownerId: admin?.id,
        email: admin?.email,
        branchName: formGym.nombre,
      });

      // Step 2: Persist context for the payment redirect
      sessionStorage.setItem('branchPaymentData', JSON.stringify({
        paymentIntentId: paymentData.paymentIntentId,
        clientSecret: paymentData.clientSecret,
        branchData: formGym,
      }));

      alert("Serás redirigido al portal de pago seguro para completar la suscripción de la sucursal ($49 USD/año).");
      
      setShowCreateGym(false);
      
      // Step 3: Shift to payment lifecycle
      navigate('/branch-payment');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Fallo crítico durante la inicialización de la expansión de la sucursal");
    } finally {
      setSaving(false);
    }
  };

  return {
    isDueno,
    isEncargado,
    canManageStaff,
    gym,
    gyms,
    admins,
    loading,
    refetch,
    refetchGyms,
    open, setOpen,
    showEdit, setShowEdit,
    showDelete, setShowDelete,
    showCreateGym, setShowCreateGym,
    viewAll, setViewAll,
    selectedAdmin, setSelectedAdmin,
    photoPreview, setPhotoPreview,
    form, setForm,
    formGym, setFormGym,
    editForm, setEditForm,
    errors, setErrors,
    saving, setSaving,
    passwordValid, setPasswordValid,
    validatePassword,
    filteredAdmins,
    tableData,
    handlePhotoChange,
    handleEditPhotoChange,
    handleCreate,
    handleOpenEdit,
    handleEditSave,
    handleOpenDelete,
    handleConfirmDelete,
    handleCreateGym
  };
};
