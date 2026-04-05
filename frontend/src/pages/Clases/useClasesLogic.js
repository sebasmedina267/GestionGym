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

const EMPTY_ALERT  = { open: false, title: "", message: "" };
const EMPTY_CONFIRM = { open: false, title: "", message: "", onConfirm: null };

export function useClasesLogic(gym) {
  const gymReady = Boolean(gym);

  const { data: clases, loading, error, refetch: refetchClases } = useFetch(
    gymReady ? `/clases` : null
  );
  const { data: todosLosClientes } = useFetch(
    gymReady ? `/clientes?gymId=${gym.id}` : null
  );
  const { data: adminsData } = useFetch(gymReady ? `/admins` : null);

  // ─── Estado general ──────────────────────────────────────
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

  // ─── Visibilidad de modales ───────────────────────────────
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

  // ─── Formularios ─────────────────────────────────────────
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [horarioForm, setHorarioForm] = useState({ id: null, dia: 0, hora_inicio: 6, minuto_inicio: 0, hora_fin: 7, minuto_fin: 0 });
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [precioForm, setPrecioForm] = useState({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
  const [activeTab, setActiveTab] = useState("horarios");

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  const cargarHorarios       = async (id) => { const r = await getHorarios(id);       setHorarios(r.data.data); };
  const cargarStats          = async (id) => { const r = await getStatsClase(id);     setStats(r.data.data); };
  const cargarMonitores      = async (id) => { try { const r = await getMonitores(id);  setMonitores(r.data?.data || []); } catch { setMonitores([]); } };
  const cargarPrecios        = async (id) => { try { const r = await getPrecios(id);    setPrecios(r.data?.data || []); } catch { setPrecios([]); } };
  const cargarClientesHorario = async (hId) => { const r = await getClientesDeHorario(hId); setClientesInscritos(r.data.data); };

  const cargarConcurrencia = async () => {
    try {
      const r = await getClasesConCurrencia();
      setConcurrencia(r.data.data || []);
    } catch { setConcurrencia([]); }
  };

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
        console.error("Error cargando horarios globales", err);
      }
    };
    load();
    cargarConcurrencia();
  }, [clases]);

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

  const handleCreateClase = async (e) => {
    e.preventDefault();
    try {
      await createClase(form);
      setShowClaseModal(false);
      setForm({ nombre: "", descripcion: "" });
      refetchClases();
      cargarConcurrencia();
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al crear clase");
    }
  };

  const handleUpdateClase = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;
    try {
      await updateClase(selectedClase.id, form);
      setShowClaseModal(false);
      refetchClases();
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error al actualizar clase");
    }
  };

  const handleDeleteClase = (id) => {
    showConfirm("¿Eliminar clase?", "Esta acción no se puede deshacer. Se eliminarán horarios e inscripciones.", async () => {
      try {
        await deleteClase(id);
        if (selectedClase?.id === id) { setShowDetailModal(false); setSelectedClase(null); }
        refetchClases();
        cargarConcurrencia();
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al eliminar clase");
      }
    });
  };

  const handleCreateOrUpdateHorario = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;

    const fechaBase = new Date();
    const diaActual = fechaBase.getDay();
    const difDias   = (horarioForm.dia === 0 ? 1 : horarioForm.dia + 1) - diaActual;
    const fecha     = new Date(fechaBase);
    fecha.setDate(fecha.getDate() + (difDias >= 0 ? difDias : difDias + 7));

    const pad  = (n) => String(n).padStart(2, "0");
    const fStr = fecha.toISOString().split("T")[0];

    const payload = {
      ...horarioForm,
      inicio: `${fStr}T${pad(horarioForm.hora_inicio)}:${pad(horarioForm.minuto_inicio)}:00`,
      fin:    `${fStr}T${pad(horarioForm.hora_fin)}:${pad(horarioForm.minuto_fin)}:00`,
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
      showAlert("❌ Error", err.response?.data?.message || "Error guardando horario");
    }
  };

  const openEditHorario = (h) => {
    const ini = new Date(h.inicio);
    const fin = new Date(h.fin);
    setHorarioForm({
      id:            h.id,
      dia:           (ini.getDay() + 6) % 7,
      hora_inicio:   ini.getHours(),
      minuto_inicio: ini.getMinutes(),
      hora_fin:      fin.getHours(),
      minuto_fin:    fin.getMinutes(),
    });
    setShowHorarioModal(true);
  };

  const openInscripciones = async (h) => {
    setSelectedHorario(h);
    await cargarClientesHorario(h.id);
    setShowAlumnosModal(true);
  };

  const handleInscribir = async () => {
    if (!clienteSelect || !selectedHorario) return;
    try {
      await inscribirCliente(selectedHorario.id, clienteSelect);
      await cargarClientesHorario(selectedHorario.id);
      await cargarStats(selectedClase.id);
      setClienteSelect("");
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error inscribiendo cliente");
    }
  };

  const handleDesinscribir = (clienteId) => {
    showConfirm("¿Desinscribir alumno?", "Se eliminará al cliente de este horario.", async () => {
      try {
        await desinscribirCliente(selectedHorario.id, clienteId);
        await cargarClientesHorario(selectedHorario.id);
        await cargarStats(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error al desinscribir");
      }
    });
  };

  const handleAgregarMonitor = async () => {
    if (!selectedMonitor || !selectedClase) return;
    try {
      await agregarMonitor(selectedClase.id, selectedMonitor);
      setSelectedMonitor("");
      setShowMonitorModal(false);
      await cargarMonitores(selectedClase.id);
    } catch (err) {
      showAlert("❌ Error", err.response?.data?.message || "Error agregando monitor");
    }
  };

  const handleRemoverMonitor = (monitorId) => {
    showConfirm("¿Remover monitor?", "Se desvinculará este monitor de la clase.", async () => {
      try {
        await removerMonitor(selectedClase.id, monitorId);
        await cargarMonitores(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error removiendo monitor");
      }
    });
  };

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
      showAlert("❌ Error", err.response?.data?.message || "Error guardando precio");
    }
  };

  const openEditPrecio = (p) => {
    setPrecioForm({ id: p.id, nombre: p.nombre, tipo_unidad: p.tipo_unidad, cantidad_unidad: p.cantidad_unidad, precio: p.precio });
    setShowPrecioModal(true);
  };

  const handleEliminarPrecio = (precioId) => {
    showConfirm("¿Eliminar precio?", "Se eliminará este plan de precios de la clase.", async () => {
      try {
        await deletePrecio(precioId);
        await cargarPrecios(selectedClase.id);
      } catch (err) {
        showAlert("❌ Error", err.response?.data?.message || "Error eliminando precio");
      }
    });
  };

  const generoData = stats?.genero?.map((g) => ({
    name: g.sexo === "M" ? "Hombres" : g.sexo === "F" ? "Mujeres" : "Otros",
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
