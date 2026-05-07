import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import GymCard from "./GymCard";
import GymsAssignModal from "./GymsAssignModal";
import GymsFormModal from "./GymsFormModal";
import GymsNotifyModal from "./GymsNotifyModal";
import { useGymsLogic, EMPTY_GYM_FORM } from "./useGymsLogic";
import "./Styles/GymsPage.css";

/**
 * GymsPage Component (Branch Portfolio Management)
 * 
 * The strategic cockpit for Owners to manage their gym branch network.
 * Responsibilities:
 * - Visualizing the managed branch portfolio.
 * - System-wide discovery of unmanaged branches for acquisition/assignment.
 * - Orchestrating branch expansion (Creation) and profile refinement (Editing).
 * - Enforcing organizational security policies for structural changes.
 */
export default function GymsPage() {
  const {
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
  } = useGymsLogic();

  /** 
   * Security Guard: Structural organizational changes are restricted to primary Owners.
   */
  if (!isDueno) {
    return (
      <AppLayout>
        <div className="gyms-redesign-container">
          <div className="gyms-restricted">
            <h1>Acceso Administrativo Restringido</h1>
            <p>Solo los Dueños de la Organización verificados están autorizados para gestionar la infraestructura de las sucursales.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="gyms-redesign-container">
        {/* --- Strategic Header: Branch Discovery & Expansion --- */}
        <Header title="Portafolio de Sucursales">
          <div className="gyms-header-actions">
            <Button variant="primary" onClick={() => { setErrors({}); setOpenAssignGym(true); }}>
              Vincular Sucursal Existente
            </Button>
            <Button variant="primary" onClick={() => { setCreateForm(EMPTY_GYM_FORM); setErrors({}); setOpenCreateGym(true); }}>
              Inicializar Nueva Sucursal
            </Button>
          </div>
        </Header>

        {loading ? (
          <div className="gyms-loading">Sincronizando Datos de Sucursales...</div>
        ) : (
          <>
            {/* --- PRIMARY PORTFOLIO: Branches under active management --- */}
            <div className="gyms-section">
              <h3 className="gyms-section-title">Portafolio de Gestión Activa</h3>
              {myGyms && myGyms.length > 0 ? (
                <div className="gyms-grid">
                  {myGyms.map((gym) => (
                    <GymCard key={gym.id} gym={gym} resolvePhoto={resolvePhoto} onEdit={openEdit} />
                  ))}
                </div>
              ) : (
                <p className="gyms-section-desc">Aún no has integrado ninguna sucursal a tu portafolio.</p>
              )}
            </div>

            {/* --- DISCOVERY: Branches available in the global system --- */}
            {availableGyms.length > 0 && (
              <div className="gyms-section--available">
                <h3 className="gyms-section-title">Directorio Global del Sistema</h3>
                <p className="gyms-section-desc">
                  {availableGyms.length} sucursal{availableGyms.length !== 1 ? "es" : ""} encontradas en el registro disponibles para asignación.
                </p>
                <div className="gyms-grid">
                  {availableGyms.map((gym) => (
                    <GymCard key={gym.id} gym={gym} resolvePhoto={resolvePhoto} onEdit={openEdit} dimmed />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- MODAL ORCHESTRATION --- */}
        
        {/* Assignment Flow: Link unmanaged branches */}
        <GymsAssignModal
          open={openAssignGym}
          onClose={() => setOpenAssignGym(false)}
          assignForm={assignForm}
          setAssignForm={setAssignForm}
          errors={errors}
          setErrors={setErrors}
          handleAssignGym={handleAssignGym}
          saving={saving}
          availableGyms={availableGyms}
        />

        {/* Expansion Flow: Initialize brand new branches */}
        <GymsFormModal
          open={openCreateGym}
          onClose={() => setOpenCreateGym(false)}
          title="Expansión de Sucursal: Nueva Infraestructura"
          form={createForm}
          setForm={setCreateForm}
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleCreateGym}
          saving={saving}
          submitText="Desplegar Sucursal"
        />

        {/* Configuration Flow: Refine branch profiles */}
        <GymsFormModal
          open={openEditGym}
          onClose={() => setOpenEditGym(false)}
          title={`Configurar: ${editingGym?.nombre || ""}`}
          form={editForm}
          setForm={setEditForm}
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleEditGym}
          saving={saving}
          submitText="Actualizar Configuración"
        />

        {/* Feedback Channel: Success/Error notifications */}
        <GymsNotifyModal notif={notif} closeNotif={closeNotif} />
      </div>
    </AppLayout>
  );
}
