import AppLayout from "../../components/layout/AppLayout";
import { useMaquinasLogic } from "./useMaquinasLogic";
import MaquinasGrid from "./MaquinasGrid";
import MaquinasFormModal from "./MaquinasFormModal";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import "./Styles/MaquinasPage.css";
import "./Styles/MaquinasModals.css";

export default function MaquinasPage() {
  const {
    gymReady,
    maquinas,
    stats,
    loading,
    open,
    setOpen,
    editing,
    alertModal,
    setAlertModal,
    confirmModal,
    setConfirmModal,
    form,
    setForm,
    errors,
    saving,
    resetForm,
    openEdit,
    handleDelete,
    handleSave,
  } = useMaquinasLogic();

  if (!gymReady) {
    return (
      <AppLayout>
        <div className="loading-maquinas-state">
          <div className="sync-icon">
            <span className="material-symbols-outlined">sync</span>
          </div>
          <p className="sync-text">Cargando gimnasio...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="maquinas-page">
        {/* Ambient Glows */}
        <div className="maquinas-ambient-glow-1"></div>
        <div className="maquinas-ambient-glow-2"></div>

        {/* Page Header Area */}
        <div className="maquinas-header-area">
          <div className="maquinas-title-group">
            <div className="maquinas-title-wrapper">
              <div className="maquinas-title-accent"></div>
              <h2 className="maquinas-title">Inventario</h2>
            </div>
            <p className="maquinas-subtitle">
              Control del ecosistema de entrenamiento. <span className="maquinas-subtitle-highlight">Monitoreo de estado y operatividad.</span>
            </p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="btn-new-maquina"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Máquina
          </button>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="maquinas-stats-grid">
          {/* Total Items */}
          <div className="stat-card-kinetic">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper icon-total">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Total</p>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>
            <span className="material-symbols-outlined stat-arrow">chevron_right</span>
          </div>

          {/* Operativas */}
          <div className="stat-card-kinetic">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper icon-operativas">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Operativas</p>
                <p className="stat-value stat-value-secondary">{stats.operativas}</p>
              </div>
            </div>
            <span className="material-symbols-outlined stat-arrow">chevron_right</span>
          </div>

          {/* Mantenimiento */}
          <div className="stat-card-kinetic">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper icon-mantenimiento">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Mantenimiento</p>
                <p className="stat-value stat-value-tertiary">{stats.mantenimiento}</p>
              </div>
            </div>
            <span className="material-symbols-outlined stat-arrow">chevron_right</span>
          </div>

          {/* Uso */}
          <div className="stat-card-kinetic">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper icon-uso">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
              <div className="stat-info">
                <p className="stat-label">Uso Diario</p>
                <div className="flex items-baseline gap-0.5">
                  <p className="stat-value">{stats.uso}</p>
                  <span className="stat-unit">%</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined stat-arrow">chevron_right</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="maquinas-controls">
          <div className="maquinas-search-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              className="maquinas-search-input" 
              placeholder="Identifica equipo por nombre, zona o estado..." 
              type="text"
            />
          </div>
          <button className="btn-filter-maquinas">
            <span className="material-symbols-outlined filter-icon">tune</span>
            <span className="filter-label">Filtros</span>
          </button>
        </div>

        {/* Inventory Section */}
        <div className="maquinas-grid-container">
          {loading ? (
            <div className="loading-maquinas-state">
              <div className="sync-icon">
                <span className="material-symbols-outlined">sync</span>
              </div>
              <p className="sync-text">Sincronizando Sistemas...</p>
            </div>
          ) : (
            <MaquinasGrid 
              maquinas={maquinas} 
              openEdit={openEdit} 
              handleDelete={handleDelete} 
            />
          )}
        </div>

        <MaquinasFormModal 
          open={open}
          setOpen={setOpen}
          editing={editing}
          form={form}
          setForm={setForm}
          errors={errors}
          saving={saving}
          handleSave={handleSave}
          resetForm={resetForm}
        />

        {/* MODAL DE CONFIRMACIÓN - Kinetic Style */}
        <Modal open={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })} title={confirmModal.title}>
          <div className="maquina-confirm-container">
            <div className="maquina-confirm-top">
              <span className="material-symbols-outlined confirm-icon-kinetic">warning</span>
              <p className="confirm-title-kinetic">¿Confirmar Acción?</p>
              <p className="confirm-msg-kinetic">
                {confirmModal.message}
              </p>
            </div>
            <div className="maquina-modal-actions">
              <button 
                className="btn-modal-action btn-modal-cancel"
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
              >
                CANCELAR
              </button>
              <button 
                className="btn-modal-action btn-confirm-delete"
                onClick={() => confirmModal.onConfirm?.()}
              >
                ELIMINAR EQUIPO
              </button>
            </div>
          </div>
        </Modal>

        {/* MODAL DE ALERTA - Kinetic Style */}
        <Modal open={alertModal.open} onClose={() => setAlertModal({ ...alertModal, open: false })} title={alertModal.title}>
          <div className="maquina-alert-container">
            <div className="maquina-confirm-top">
              <div className={`alert-icon-circle ${alertModal.type === 'error' ? 'alert-circle-error' : 'alert-circle-success'}`}>
                <span className="material-symbols-outlined" style={{fontSize: "2.5rem"}}>{alertModal.type === 'error' ? 'report_problem' : 'task_alt'}</span>
              </div>
              <p className="alert-title-kinetic">{alertModal.title}</p>
              <p className="confirm-msg-kinetic">
                {alertModal.message}
              </p>
            </div>
            <button 
              className="alert-btn-kinetic"
              onClick={() => setAlertModal({ ...alertModal, open: false })}
            >
              ENTENDIDO
            </button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
