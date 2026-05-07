import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  createClase, updateClase, deleteClase,
  getHorarios, createHorario, updateHorario,
  getStatsClase, getClientesDeHorario,
  inscribirCliente, desinscribirCliente,
  getMonitores, agregarMonitor, removerMonitor,
  getPrecios, createPrecio, updatePrecio, deletePrecio,
  getClasesConCurrencia,
} from "../../api/clases.api";

// Initial states for feedback modals
const EMPTY_ALERT  = { open: false, title: "", message: "" };
const EMPTY_CONFIRM = { open: false, title: "", message: "", onConfirm: null };

/**
 * useClasesLogic Custom Hook
 * 
 * Orchestrates the complex state management and business logic for the class management page.
 * Responsibilities include:
 * - Fetching global and class-specific data (schedules, instructors, prices, stats).
 * - Managing visibility for multiple sub-flow modals.
 * - Handling CRUD operations for classes, schedules, and pricing.
 * - Processing enrollment/check-in requests.
 * - Aggregating analytical data for charts and metrics.
 */
export function useClasesLogic(gym) {
  const gymReady = Boolean(gym);

  // --- Primary Data Queries ---
  const { data: clases, loading, error, refetch: refetchClases } = useFetch(
    gymReady ? `/clases` : null
  );
  const { data: todosLosClientes } = useFetch(
    gymReady ? `/clientes?gymId=${gym.id}` : null
  );
  const { data: adminsData } = useFetch(gymReady ? `/admins` : null);

  // --- General Entity State ---
  const [selectedClase, setSelectedClase]       = useState(null);
  const [horarios, setHorarios]                 = useState([]);
  const [horariosGlobales, setHorariosGlobales] = useState([]);
  const [stats, setStats]                       = useState(null);
  const [monitores, setMonitores]               = useState([]);
  const [precios, setPrecios]                   = useState([]);
  const [clientesInscritos, setClientesInscritos] = useState([]);
  const [selectedHorario, setSelectedHorario]   = useState(null);
  const [clienteSelect, setClienteSelect]       = useState("");

  const [concurrencia, setConcurrencia] = useState([]);

  // --- UI Visibility State (Modals) ---
  const [showClaseModal, setShowClaseModal]     = useState(false);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showPrecioModal, setShowPrecioModal]   = useState(false);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);

  const [alertModal, setAlertModal]     = useState(EMPTY_ALERT);
  const [confirmModal, setConfirmModal] = useState(EMPTY_CONFIRM);

  const showAlert = (title, message) => setAlertModal({ open: true, title, message });
  const showConfirm = (title, message, onConfirm) => setConfirmModal({ open: true, title, message, onConfirm });
  const closeAlert = () => setAlertModal(EMPTY_ALERT);
  const closeConfirm = () => setConfirmModal(EMPTY_CONFIRM);

  // --- Form & Interaction State ---
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [horarioForm, setHorarioForm] = useState({ id: null, dia: 0, hora_inicio: 6, minuto_inicio: 0, hora_fin: 7, minuto_fin: 0 });
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [precioForm, setPrecioForm] = useState({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
  const [activeTab, setActiveTab] = useState("horarios");

  // --- Data Loading Actions ---
  const cargarHorarios       = async (id) => { const r = await getHorarios(id);       setHorarios(r.data.data); };
  const cargarStats          = async (id) => { const r = await getStatsClase(id);     setStats(r.data.data); };
  const cargarMonitores      = async (id) => { try { const r = await getMonitores(id);  setMonitores(r.data?.data || []); } catch { setMonitores([]); } };
  const cargarPrecios        = async (id) => { try { const r = await getPrecios(id);    setPrecios(r.data?.data || []); } catch { setPrecios([]); } };
  const cargarClientesHorario = async (hId) => { const r = await getClientesDeHorario(hId); setClientesInscritos(r.data.data); };

  /** Retrieves occupancy levels across all classes for comparison */
  const cargarConcurrencia = async () => {
    try {
      const r = await getClasesConCurrencia();
      setConcurrencia(r.data.data || []);
    } catch { setConcurrencia([]); }
  };

  /**
   * Effect: Orchestrates the loading of global schedule data 
   * by combining individual class schedules.
   */
  useEffect(() => {
    if (!clases) return;
    const load = async () => {
      try {
        const results = await Promise.all(
          clases.map(async (c) => {
            const r = await getHorarios(c.id);
            return r.data.data.map((h) => ({ ...h, claseNombre: c.nombre }));
          })
        );
        setHorariosGlobales(results.flat());
      } catch (err) {
        console.error("Error loading global weekly schedules", err);
      }
    };
    load();
    cargarConcurrencia();
  }, [clases]);

  // --- Action Handlers ---

  /** Opens the class detail modal and triggers secondary data fetches */
  const openDetail = (c) => {
    setSelectedClase(c);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || "" });
    setActiveTab("horarios");
    setSelectedHorario(null);
    cargarHorarios(c.id);
    cargarStats(c.id);
    cargarMonitores(c.id);
    cargarPrecios(c.id);
    setShowDetailModal(true);
  };

  /** Executes the creation of a new class definition */
  const handleCreateClase = async (e) => {
    e.preventDefault();
    try {
      await createClase(form);
      setShowClaseModal(false);
      setForm({ nombre: "", descripcion: "" });
      refetchClases();
      cargarConcurrencia();
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al crear la definición de la clase");
    }
  };

  /** Persists changes to an existing class definition */
  const handleUpdateClase = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;
    try {
      await updateClase(selectedClase.id, form);
      setShowClaseModal(false);
      refetchClases();
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al actualizar la definición de la clase");
    }
  };

  /** Permanently removes a class definition */
  const handleDeleteClase = (id) => {
    showConfirm("¿Eliminar clase?", "Esta acción es irreversible y purgará todos los horarios e inscripciones relacionados.", async () => {
      try {
        await deleteClase(id);
        if (selectedClase?.id === id) { setShowDetailModal(false); setSelectedClase(null); }
        refetchClases();
        cargarConcurrencia();
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al eliminar la clase");
      }
    });
  };

  /**
   * Handles the creation or update of a schedule slot.
   * Maps UI time selection to ISO strings for backend compatibility.
   */
  const handleCreateOrUpdateHorario = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;

    // Helper to map UI 'Day' selection to the nearest future date string
    const baseDate = new Date();
    const currentDay = baseDate.getDay();
    const dayDiff   = (horarioForm.dia === 0 ? 1 : horarioForm.dia + 1) - currentDay;
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + (dayDiff >= 0 ? dayDiff : dayDiff + 7));

    const pad  = (n) => String(n).padStart(2, "0");
    const dateStr = targetDate.toISOString().split("T")[0];

    const payload = {
      ...horarioForm,
      inicio: `${dateStr}T${pad(horarioForm.hora_inicio)}:${pad(horarioForm.minuto_inicio)}:00`,
      fin:    `${dateStr}T${pad(horarioForm.hora_fin)}:${pad(horarioForm.minuto_fin)}:00`,
    };

    try {
      if (horarioForm.id) {
        await updateHorario(horarioForm.id, payload);
      } else {
        await createHorario(selectedClase.id, payload);
      }
      setShowHorarioModal(false);
      setHorarioForm({ id: null, dia: 0, hora_inicio: 6, minuto_inicio: 0, hora_fin: 7, minuto_fin: 0 });
      await cargarHorarios(selectedClase.id);
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Conflicto de programación o error del servidor");
    }
  };

  /** Pre-populates the schedule form for editing */
  const openEditHorario = (h) => {
    const start = new Date(h.inicio);
    const end = new Date(h.fin);
    setHorarioForm({
      id:            h.id,
      dia:           (start.getDay() + 6) % 7,
      hora_inicio:   start.getHours(),
      minuto_inicio: start.getMinutes(),
      hora_fin:      end.getHours(),
      minuto_fin:    end.getMinutes(),
    });
    setShowHorarioModal(true);
  };

  /** Opens the enrollment management modal for a specific session */
  const openInscripciones = async (h) => {
    setSelectedHorario(h);
    await cargarClientesHorario(h.id);
    setShowAlumnosModal(true);
  };

  /** Enrolls a client in the selected schedule slot */
  const handleInscribir = async () => {
    if (!clienteSelect || !selectedHorario) return;
    try {
      await inscribirCliente(selectedHorario.id, clienteSelect);
      await cargarClientesHorario(selectedHorario.id);
      await cargarStats(selectedClase.id);
      setClienteSelect("");
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error en la inscripción (Verifica capacidad/duplicados)");
    }
  };

  /** Removes a client enrollment from a schedule slot */
  const handleDesinscribir = (clienteId) => {
    showConfirm("¿Desinscribir miembro?", "Este miembro será eliminado de la lista de asistencia de la sesión.", async () => {
      try {
        await desinscribirCliente(selectedHorario.id, clienteId);
        await cargarClientesHorario(selectedHorario.id);
        await cargarStats(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al desinscribir al miembro");
      }
    });
  };

  /** Assigns an instructor to the class type */
  const handleAgregarMonitor = async () => {
    if (!selectedMonitor || !selectedClase) return;
    try {
      await agregarMonitor(selectedClase.id, selectedMonitor);
      setSelectedMonitor("");
      setShowMonitorModal(false);
      await cargarMonitores(selectedClase.id);
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al asignar instructor");
    }
  };

  /** Removes an instructor's association with the class */
  const handleRemoverMonitor = (monitorId) => {
    showConfirm("¿Eliminar instructor?", "Desvincular a este instructor de la definición de la clase.", async () => {
      try {
        await removerMonitor(selectedClase.id, monitorId);
        await cargarMonitores(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al eliminar al instructor");
      }
    });
  };

  /** Creates or updates a pricing strategy for the class */
  const handleCreateOrUpdatePrecio = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;
    try {
      if (precioForm.id) {
        await updatePrecio(precioForm.id, precioForm);
      } else {
        await createPrecio(selectedClase.id, precioForm);
      }
      setShowPrecioModal(false);
      setPrecioForm({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
      await cargarPrecios(selectedClase.id);
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al guardar la opción de precio");
    }
  };

  /** Pre-populates pricing form for editing */
  const openEditPrecio = (p) => {
    setPrecioForm({ id: p.id, nombre: p.nombre, tipo_unidad: p.tipo_unidad, cantidad_unidad: p.cantidad_unidad, precio: p.precio });
    setShowPrecioModal(true);
  };

  /** Archives a pricing plan */
  const handleEliminarPrecio = (precioId) => {
    showConfirm("¿Eliminar plan de precios?", "Este plan será archivado y ya no estará disponible para nuevas inscripciones.", async () => {
      try {
        await deletePrecio(precioId);
        await cargarPrecios(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al eliminar el plan de precios");
      }
    });
  };

  // --- Analytical Data Formatting for Charts ---

  const generoData = stats?.genero?.map((g) => ({
    name: g.sexo === "M" ? "Masculino" : g.sexo === "F" ? "Femenino" : "Otro",
    value: g.total,
  })) || [];

  const edadData = stats?.edades?.map((e) => ({ name: e.rango, total: e.total })) || [];

  const concurrenciaData = concurrencia.slice(0, 8).map((c) => ({
    name: c.nombre.length > 14 ? c.nombre.slice(0, 14) + "…" : c.nombre,
    participantes: Number(c.participantes),
    horarios: Number(c.horarios),
  }));

  const alumnosInscritosTotal = concurrencia.reduce((s, c) => s + Number(c.participantes || 0), 0);

  return {
    data: {
      clases, loading, error, todosLosClientes, adminsData,
      horariosGlobales, concurrencia, alumnosInscritosTotal,
      generoData, edadData, concurrenciaData
    },
    state: {
      selectedClase, setSelectedClase,
      horarios, setHorarios,
      stats, setStats,
      monitores, setMonitores,
      precios, setPrecios,
      clientesInscritos, setClientesInscritos,
      selectedHorario, setSelectedHorario,
      clienteSelect, setClienteSelect,
      showClaseModal, setShowClaseModal,
      showDetailModal, setShowDetailModal,
      showHorarioModal, setShowHorarioModal,
      showMonitorModal, setShowMonitorModal,
      showPrecioModal, setShowPrecioModal,
      showAlumnosModal, setShowAlumnosModal,
      alertModal, setAlertModal,
      confirmModal, setConfirmModal,
      form, setForm,
      horarioForm, setHorarioForm,
      selectedMonitor, setSelectedMonitor,
      precioForm, setPrecioForm,
      activeTab, setActiveTab
    },
    actions: {
      cargarHorarios, cargarStats, cargarMonitores, cargarPrecios,
      cargarClientesHorario, cargarConcurrencia,
      openDetail, handleCreateClase, handleUpdateClase, handleDeleteClase,
      handleCreateOrUpdateHorario, openEditHorario,
      openInscripciones, handleInscribir, handleDesinscribir,
      handleAgregarMonitor, handleRemoverMonitor,
      handleCreateOrUpdatePrecio, openEditPrecio, handleEliminarPrecio,
      showAlert, showConfirm, closeAlert, closeConfirm
    }
  };
}
