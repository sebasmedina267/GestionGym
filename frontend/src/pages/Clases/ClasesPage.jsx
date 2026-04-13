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

export default function ClasesPage() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  const { data, state, actions } = useClasesLogic(gym);

  if (!gymReady) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center bg-[#0b1326]">
          <div className="text-[#bdc2ff] animate-pulse font-bold tracking-widest uppercase text-xs">
            Cargando Gimnasio...
          </div>
        </div>
      </AppLayout>
    );
  }

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
        {/* Header Section */}
        <header
          className="kinetic-header animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <h1 className="kinetic-header__title text-on-surface">
              Gestión de Clases
            </h1>
            <p className="kinetic-header__subtitle">
              Programación y control de sesiones de entrenamiento elite
              {gym?.nombre ? ` — ${gym.nombre}` : ""}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="kinetic-btn kinetic-btn--ghost" type="button">
              <span
                className="material-symbols-outlined text-lg notranslate"
                translate="no"
              >
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
              Crear Horario
            </button>
          </div>
        </header>

        {/* Metrics Row */}
        <section
          className="kinetic-metrics animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Clases Totales</p>
            <h3 className="kinetic-display text-on-surface">
              {clases?.length || 0}
            </h3>
            <p className="kinetic-metric-card__trend text-secondary">
              <span
                className="material-symbols-outlined text-sm notranslate"
                translate="no"
              >
                trending_up
              </span>
              +{Math.max(0, (clases?.length || 0) - 10)} este mes
            </p>
            <span
              className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate"
              translate="no"
            >
              exercise
            </span>
          </div>

          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Horarios Activos</p>
            <h3 className="kinetic-display text-on-surface">
              {horariosGlobales?.length || 0}
            </h3>
            <p className="kinetic-metric-card__trend text-primary">
              <span
                className="material-symbols-outlined text-sm notranslate"
                translate="no"
              >
                schedule
              </span>
              {horariosGlobales?.length || 0} slots semanales
            </p>
            <span
              className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate"
              translate="no"
            >
              event_available
            </span>
          </div>

          <div className="glass-card kinetic-metric-card group">
            <p className="kinetic-label mb-4">Alumnos Inscritos</p>
            <h3 className="kinetic-display text-on-surface">
              {alumnosInscritosTotal}
            </h3>
            <p className="kinetic-metric-card__trend text-secondary">
              <span
                className="material-symbols-outlined text-sm notranslate"
                translate="no"
              >
                group_add
              </span>
              84% capacidad total
            </p>
            <span
              className="material-symbols-outlined kinetic-metric-card__icon group-hover:text-primary transition-colors notranslate"
              translate="no"
            >
              groups
            </span>
          </div>
        </section>

        {/* Weekly Schedule Grid */}
        <section
          className="kinetic-section animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="kinetic-section__title text-on-surface mb-0">
              <span className="kinetic-section__accent bg-primary" />
              Calendario Semanal
            </h2>
            <div className="flex bg-white/5 rounded-xl p-1">
              <button className="px-5 py-2 rounded-lg bg-[#bdc2ff] text-[#131e8c] text-xs font-bold shadow-lg shadow-[#bdc2ff]/10">
                Vista Rejilla
              </button>
              <button className="px-5 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                Lista
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

        {/* Available Classes */}
        <section
          className="kinetic-section animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="kinetic-section__title text-on-surface mb-0">
              <span className="kinetic-section__accent bg-secondary" />
              Clases Disponibles
            </h2>
            <button className="text-primary text-sm font-bold hover:underline tracking-tight flex items-center gap-1 group">
              Ver catálogo completo
              <span
                className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform notranslate"
                translate="no"
              >
                arrow_forward
              </span>
            </button>
          </div>

          {loading && (
            <div className="text-center py-20 text-[#bdc2ff] animate-pulse font-bold">
              Cargando catálogo...
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-error font-bold">
              Error al cargar clases
            </div>
          )}

          <div className="kinetic-list">
            {clases?.map((c, idx) => {
              const concInfo = concurrencia.find((x) => x.id === c.id);
              const horariosCount =
                concInfo?.horarios ??
                horariosGlobales.filter((h) => h.claseNombre === c.nombre)
                  .length;
              const alumnosCount = concInfo?.participantes ?? 0;
              const isEven = idx % 2 === 0;

              return (
                <article
                  key={c.id}
                  className="glass-card kinetic-item group hover:bg-white/5 transition-all"
                >
                  <div className="kinetic-item__left">
                    <div
                      className={`kinetic-item__icon ${
                        c.nombre.toLowerCase().includes("pilates")
                          ? "bg-[#312e81] text-[#c7d2fe]"
                          : c.nombre.toLowerCase().includes("boxing")
                            ? "bg-[#064e3b] text-[#6ee7b7]"
                            : "bg-[#1e293b] text-[#94a3b8]"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined notranslate"
                        translate="no"
                      >
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
                          "Sesión de entrenamiento elite enfocada en alto rendimiento."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="kinetic-item__stats-group">
                      <div className="kinetic-item__stat">
                        <span className="kinetic-item__stat-label">
                          ALUMNOS
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

        {/* Floating Action Button */}
        <button
          className="kinetic-fab group"
          onClick={() => {
            setSelectedClase(null);
            setForm({ nombre: "", descripcion: "" });
            setShowClaseModal(true);
          }}
        >
          <span
            className="material-symbols-outlined text-3xl notranslate"
            translate="no"
          >
            add
          </span>
          <span className="kinetic-fab__label">Nueva Clase</span>
        </button>

        {/* Modals */}
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

        <CreateClassModal
          open={showClaseModal}
          onClose={() => setShowClaseModal(false)}
          selectedClase={selectedClase}
          form={form}
          setForm={setForm}
          handleCreateClase={handleCreateClase}
          handleUpdateClase={handleUpdateClase}
        />

        <HorarioFormModal
          open={showHorarioModal}
          onClose={() => setShowHorarioModal(false)}
          horarioForm={horarioForm}
          setHorarioForm={setHorarioForm}
          handleCreateOrUpdateHorario={handleCreateOrUpdateHorario}
        />

        <AssignMonitorModal
          open={showMonitorModal}
          onClose={() => setShowMonitorModal(false)}
          selectedMonitor={selectedMonitor}
          setSelectedMonitor={setSelectedMonitor}
          adminsData={adminsData?.data || adminsData}
          handleAgregarMonitor={handleAgregarMonitor}
        />

        <PriceFormModal
          open={showPrecioModal}
          onClose={() => setShowPrecioModal(false)}
          precioForm={precioForm}
          setPrecioForm={setPrecioForm}
          handleCreateOrUpdatePrecio={handleCreateOrUpdatePrecio}
        />

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
