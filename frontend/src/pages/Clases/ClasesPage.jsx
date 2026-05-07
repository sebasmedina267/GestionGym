import AppLayout from "../../components/layout/AppLayout";
import { useGym } from "../../hooks/useGym";
import HorarioCalendar from "../../components/ui/HorarioCalendar";
import CreateClassModal from "./CreateClassModal";
import ClassDetailModal from "./ClassDetailModal";
import HorarioFormModal from "./HorarioFormModal";
import AssignMonitorModal from "./AssignMonitorModal";
import PriceFormModal from "./PriceFormModal";
import InscriptionsModal from "./InscriptionsModal";
import { AlertModal, ConfirmModal } from "./AlertConfirmModals";
import { useClasesLogic } from "./useClasesLogic";
import "./Styles/ClasesPage.css";

/**
 * ClasesPage Component
 * 
 * The comprehensive hub for managing gym classes, schedules, and enrollments.
 * Features a 'Kinetic' UI design with atmospheric effects, detailed metrics, 
 * a weekly calendar, and modular management modals.
 */
export default function ClasesPage() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  // Orchestrate state and side-effects via a specialized logic hook
  const { data, state, actions } = useClasesLogic(gym);

  /** Guard: Render a loading state until the gym branch context is resolved */
  if (!gymReady) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center bg-[#0b1326]">
          <div className="text-[#bdc2ff] animate-pulse font-bold tracking-widest uppercase text-xs">
            Cargando Contexto del Gimnasio...
          </div>
        </div>
      </AppLayout>
    );
  }

  // Destructuring complex data structures from the logic hook for readability
  const {
    clases,
    loading,
    error,
    todosLosClientes,
    adminsData,
    horariosGlobales,
    concurrencia,
    alumnosInscritosTotal,
  } = data;

  const {
    selectedClase,
    setSelectedClase,
    horarios,
    stats,
    monitores,
    precios,
    clientesInscritos,
    selectedHorario,
    setSelectedHorario,
    clienteSelect,
    setClienteSelect,
    showClaseModal,
    setShowClaseModal,
    showDetailModal,
    setShowDetailModal,
    showHorarioModal,
    setShowHorarioModal,
    showMonitorModal,
    setShowMonitorModal,
    showPrecioModal,
    setShowPrecioModal,
    showAlumnosModal,
    setShowAlumnosModal,
    alertModal,
    confirmModal,
    form,
    setForm,
    horarioForm,
    setHorarioForm,
    selectedMonitor,
    setSelectedMonitor,
    precioForm,
    setPrecioForm,
    activeTab,
    setActiveTab,
  } = state;

  const {
    openDetail,
    handleCreateClase,
    handleUpdateClase,
    handleDeleteClase,
    handleCreateOrUpdateHorario,
    openEditHorario,
    openInscripciones,
    handleInscribir,
    handleDesinscribir,
    handleAgregarMonitor,
    handleRemoverMonitor,
    handleCreateOrUpdatePrecio,
    openEditPrecio,
    handleEliminarPrecio,
    closeAlert,
    closeConfirm,
  } = actions;

  return (
    <AppLayout>
      <div className="clases-kinetic min-h-screen">
        {/* --- Page Header: Branding and Primary Actions --- */}
        <header
          className="kinetic-header animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <h1 className="kinetic-header__title text-on-surface">
              Gestión de Clases
            </h1>
            <p className="kinetic-header__subtitle">
              Programa y monitorea sesiones de alto rendimiento
              {gym?.nombre ? ` — ${gym.nombre}` : ""}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="kinetic-btn kinetic-btn--ghost" type="button">
              <span className="material-symbols-outlined text-lg notranslate" translate="no">
                filter_list
              </span>
              Filtros
            </button>
            <button
              className="kinetic-btn kinetic-btn--secondary"
              type="button"
              onClick={() => {
                setSelectedClase(null);
                setForm({ nombre: "", descripcion: "" });
                setShowClaseModal(true);
              }}
            >
              <span className="material-symbols-outlined text-lg">
                calendar_add_on
              </span>
              Definir Horario
            </button>
          </div>
        </header>

        {/* --- Metrics Grid: Performance Overview --- */}
        <section
          className="kinetic-metrics animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Metric: Total Class Definitions */}
          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Total de Clases</p>
            <h3 className="kinetic-display text-on-surface">
              {clases?.length || 0}
            </h3>
            <p className="kinetic-metric-card__trend text-secondary">
              <span className="material-symbols-outlined text-sm notranslate" translate="no">
                trending_up
              </span>
              +{Math.max(0, (clases?.length || 0) - 10)} crecimiento este mes
            </p>
            <span className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate" translate="no">
              exercise
            </span>
          </div>

          {/* Metric: Active Weekly Sessions */}
          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Horarios Activos</p>
            <h3 className="kinetic-display text-on-surface">
              {horariosGlobales?.length || 0}
            </h3>
            <p className="kinetic-metric-card__trend text-primary">
              <span className="material-symbols-outlined text-sm notranslate" translate="no">
                schedule
              </span>
              {horariosGlobales?.length || 0} cupos semanales activos
            </p>
            <span className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate" translate="no">
              event_available
            </span>
          </div>

          {/* Metric: Total Participation Count */}
          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Inscripción Total</p>
            <h3 className="kinetic-display text-on-surface">
              {alumnosInscritosTotal}
            </h3>
            <p className="kinetic-metric-card__trend text-secondary">
              <span className="material-symbols-outlined text-sm notranslate" translate="no">
                group_add
              </span>
              84% de la capacidad total de la sucursal
            </p>
            <span className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate" translate="no">
              groups
            </span>
          </div>
        </section>

        {/* --- Central Section: Weekly Interactive Calendar --- */}
        <section
          className="kinetic-section animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="kinetic-section__title text-on-surface mb-0">
              <span className="kinetic-section__accent bg-primary" />
              Horario Semanal
            </h2>
            <div className="flex bg-white/5 rounded-xl p-1">
              <button className="px-5 py-2 rounded-lg bg-[#bdc2ff] text-[#131e8c] text-xs font-bold shadow-lg shadow-[#bdc2ff]/10">
                Vista de Cuadrícula
              </button>
              <button className="px-5 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                Vista de Lista
              </button>
            </div>
          </div>

          <HorarioCalendar
            horarios={horariosGlobales}
            onSelectHorario={(h) => {
              const clase = clases.find((c) => c.id === h.clase_id);
              if (clase) openDetail(clase);
            }}
          />
        </section>

        {/* --- Catalog Section: Class Definitions List --- */}
        <section
          className="kinetic-section animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="kinetic-section__title text-on-surface mb-0">
              <span className="kinetic-section__accent bg-secondary" />
              Catálogo de Servicios
            </h2>
            <button className="text-primary text-sm font-bold hover:underline tracking-tight flex items-center gap-1 group">
              Ver repositorio completo
              <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform notranslate" translate="no">
                arrow_forward
              </span>
            </button>
          </div>

          {loading && (
            <div className="text-center py-20 text-[#bdc2ff] animate-pulse font-bold">
              Obteniendo datos del catálogo...
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-error font-bold">
              Error crítico al cargar las clases
            </div>
          )}

          {/* Render list of classes with dynamic icons based on name patterns */}
          <div className="kinetic-list">
            {clases?.map((c, idx) => {
              const concInfo = concurrencia.find((x) => x.id === c.id);
              const horariosCount =
                concInfo?.horarios ??
                horariosGlobales.filter((h) => h.claseNombre === c.nombre)
                  .length;
              const alumnosCount = concInfo?.participantes ?? 0;

              return (
                <article
                  key={c.id}
                  className="glass-card kinetic-item group hover:bg-white/5 transition-all"
                >
                  <div className="kinetic-item__left">
                    <div
                      className={`kinetic-item__icon ${c.nombre.toLowerCase().includes("pilates")
                          ? "bg-[#312e81] text-[#c7d2fe]"
                          : c.nombre.toLowerCase().includes("boxing")
                            ? "bg-[#064e3b] text-[#6ee7b7]"
                            : "bg-[#1e293b] text-[#94a3b8]"
                        }`}
                    >
                      <span className="material-symbols-outlined notranslate" translate="no">
                        {c.nombre.toLowerCase().includes("pilates")
                          ? "self_improvement"
                          : c.nombre.toLowerCase().includes("boxing")
                            ? "sports_mma"
                            : "bolt"}
                      </span>
                    </div>
                    <div className="kinetic-item__info">
                      <h4 className="kinetic-item__title">{c.nombre}</h4>
                      <p className="kinetic-item__desc">
                        {c.descripcion ||
                          "Sesión de entrenamiento de élite enfocada en métricas de alto rendimiento."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    {/* Inline Participation Metrics */}
                    <div className="kinetic-item__stats-group">
                      <div className="kinetic-item__stat">
                        <span className="kinetic-item__stat-label">
                          MIEMBROS
                        </span>
                        <span className="kinetic-item__stat-val">
                          {alumnosCount}
                        </span>
                      </div>
                      <div className="kinetic-item__stat">
                        <span className="kinetic-item__stat-label">
                          HORARIOS
                        </span>
                        <span className="kinetic-item__stat-val">
                          {horariosCount}
                        </span>
                      </div>
                    </div>

                    <div className="kinetic-item__actions">
                      <button
                        className="kinetic-btn kinetic-btn--manage"
                        type="button"
                        onClick={() => openDetail(c)}
                      >
                        Gestionar
                      </button>

                      <button
                        className="kinetic-btn kinetic-btn--ghost kinetic-btn--delete"
                        onClick={() => handleDeleteClase(c)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Floating Action Button: Quick class creation */}
        <button
          className="kinetic-fab group"
          onClick={() => {
            setSelectedClase(null);
            setForm({ nombre: "", descripcion: "" });
            setShowClaseModal(true);
          }}
        >
          <span className="material-symbols-outlined text-3xl notranslate" translate="no">
            add
          </span>
          <span className="kinetic-fab__label">Nueva Clase</span>
        </button>

        {/* --- Modal Stack: Handling sub-flows --- */}
        
        {/* Class Details: Sub-tabs for schedules, instructors, prices, and stats */}
        <ClassDetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClase(null);
          }}
          selectedClase={selectedClase}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setForm={setForm}
          setShowClaseModal={setShowClaseModal}
          horarios={horarios}
          setHorarioForm={setHorarioForm}
          setShowHorarioModal={setShowHorarioModal}
          openInscripciones={openInscripciones}
          openEditHorario={openEditHorario}
          selectedHorario={selectedHorario}
          monitores={monitores}
          setSelectedMonitor={setSelectedMonitor}
          setShowMonitorModal={setShowMonitorModal}
          handleRemoverMonitor={handleRemoverMonitor}
          precios={precios}
          setPrecioForm={setPrecioForm}
          setShowPrecioModal={setShowPrecioModal}
          openEditPrecio={openEditPrecio}
          handleEliminarPrecio={handleEliminarPrecio}
          stats={stats}
          generoData={data.generoData}
          edadData={data.edadData}
        />

        {/* Create/Edit Base Class Definition */}
        <CreateClassModal
          open={showClaseModal}
          onClose={() => setShowClaseModal(false)}
          selectedClase={selectedClase}
          form={form}
          setForm={setForm}
          handleCreateClase={handleCreateClase}
          handleUpdateClase={handleUpdateClase}
        />

        {/* Weekly Schedule Entry Editor */}
        <HorarioFormModal
          open={showHorarioModal}
          onClose={() => setShowHorarioModal(false)}
          horarioForm={horarioForm}
          setHorarioForm={setHorarioForm}
          handleCreateOrUpdateHorario={handleCreateOrUpdateHorario}
        />

        {/* Instructor Assignment Flow */}
        <AssignMonitorModal
          open={showMonitorModal}
          onClose={() => setShowMonitorModal(false)}
          selectedMonitor={selectedMonitor}
          setSelectedMonitor={setSelectedMonitor}
          adminsData={adminsData?.data || adminsData}
          handleAgregarMonitor={handleAgregarMonitor}
        />

        {/* Pricing Strategy Editor */}
        <PriceFormModal
          open={showPrecioModal}
          onClose={() => setShowPrecioModal(false)}
          precioForm={precioForm}
          setPrecioForm={setPrecioForm}
          handleCreateOrUpdatePrecio={handleCreateOrUpdatePrecio}
        />

        {/* Member Enrollment & Check-in Management */}
        <InscriptionsModal
          open={showAlumnosModal}
          onClose={() => {
            setShowAlumnosModal(false);
            setSelectedHorario(null);
            setClienteSelect("");
          }}
          selectedHorario={selectedHorario}
          clienteSelect={clienteSelect}
          setClienteSelect={setClienteSelect}
          todosLosClientes={todosLosClientes?.data || todosLosClientes}
          handleInscribir={handleInscribir}
          clientesInscritos={clientesInscritos}
          handleDesinscribir={handleDesinscribir}
        />

        {/* System Feedback Modals */}
        <AlertModal
          open={alertModal.open}
          title={alertModal.title}
          message={alertModal.message}
          onClose={closeAlert}
        />

        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          onClose={closeConfirm}
          onConfirm={() => {
            confirmModal.onConfirm?.();
            closeConfirm();
          }}
        />
      </div>
    </AppLayout>
  );
}
