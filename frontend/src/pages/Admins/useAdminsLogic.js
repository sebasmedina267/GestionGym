import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useGym } from "../../hooks/useGym";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

export const useAdminsLogic = () => {
  const { admin } = useAuth();
  const { gym } = useGym();
  const isDueno = admin?.roles?.includes('DUENO');

  const { data: admins, loading, refetch } = useFetch("/admins");
  const { data: gyms, refetch: refetchGyms } = useFetch("/gyms");

  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreateGym, setShowCreateGym] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    password: "",
    gymId: "",
    foto: null,
  });

  const [formGym, setFormGym] = useState({
    nombre: "",
    direccion: "",
  });

  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    gymId: "",
    foto: null,
    photoPreview: null,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // Validar requisitos de contraseña
  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    const isValid = hasMinLength && hasUppercase && hasNumber && hasSymbol;
    setPasswordValid(isValid);
    return { hasMinLength, hasUppercase, hasNumber, hasSymbol };
  };

  // Filtrar empleados: si es dueño y no está en vista todos, solo mostrar del gym actual
  const filteredAdmins = viewAll || !gym 
    ? (admins || [])
    : (admins || []).filter(a => a.gyms?.some(g => g.id === gym.id));

  // Transform data for the table
  const tableData = (filteredAdmins || []).map(a => ({
    id: a.id,
    nombre: a.nombre,
    apellido: a.apellido,
    gymNombre: a.gyms?.map(g => g.nombre).join(", ") || "Sin Gym",
    rol: a.roles?.includes('DUENO') ? 'Dueño' : 'Empleado'
  }));

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

  const handleCreate = async () => {
    const newErrors = {};

    if (!form.nombre) newErrors.nombre = "Requerido";
    if (!form.apellido) newErrors.apellido = "Requerido";
    if (!form.password) newErrors.password = "Requerido";
    if (!passwordValid) newErrors.password = "La contraseña no cumple los requisitos";
    if (!form.gymId) newErrors.gymId = "Selecciona un gimnasio";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      
      // Si hay foto, usar FormData. Si no, usar JSON directo
      if (form.foto) {
        const formData = new FormData();
        formData.append("nombre", form.nombre);
        formData.append("apellido", form.apellido);
        formData.append("password", form.password);
        formData.append("gymId", form.gymId);
        formData.append("foto", form.foto);

        await api.post("/auth/register-employee", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        // Enviar como JSON si no hay foto
        await api.post("/auth/register-employee", {
          nombre: form.nombre,
          apellido: form.apellido,
          password: form.password,
          gymId: Number(form.gymId)
        });
      }

      setOpen(false);
      setForm({ nombre: "", apellido: "", password: "", gymId: "", foto: null });
      setPhotoPreview(null);
      setPasswordValid(false);
      refetch();
      alert("¡Empleado creado exitosamente!");
    } catch (err) {
      console.error("Error detalles:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error al crear empleado";
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (adminItem) => {
    const adminData = filteredAdmins.find(a => a.id === adminItem.id);
    setSelectedAdmin(adminData);
    setEditForm({
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      gymId: adminData.gyms?.[0]?.id || "",
      foto: null,
      photoPreview: adminData.foto || null,
    });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    const newErrors = {};
    if (!editForm.nombre) newErrors.nombre = "Requerido";
    if (!editForm.apellido) newErrors.apellido = "Requerido";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("nombre", editForm.nombre);
      formData.append("apellido", editForm.apellido);
      if (editForm.gymId) formData.append("gymId", Number(editForm.gymId));
      if (editForm.foto) formData.append("foto", editForm.foto);

      await api.put(`/admins/${selectedAdmin.id}`, formData);

      setShowEdit(false);
      setSelectedAdmin(null);
      refetch();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al actualizar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (adminItem) => {
    const adminData = filteredAdmins.find(a => a.id === adminItem.id);
    setSelectedAdmin(adminData);
    setShowDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/admins/${selectedAdmin.id}`);
      setShowDelete(false);
      setSelectedAdmin(null);
      refetch();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al eliminar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGym = async () => {
    const newErrors = {};

    if (!formGym.nombre) newErrors.nombre = "Requerido";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      await api.post("/gyms/create", formGym);

      setShowCreateGym(false);
      setFormGym({ nombre: "", direccion: "" });
      setErrors({});
      
      // Recargar la lista de gymnos
      await refetchGyms();
      
      alert("¡Gimnasio creado exitosamente!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al crear gimnasio");
    } finally {
      setSaving(false);
    }
  };

  return {
    isDueno,
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
