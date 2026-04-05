import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import GymCard from "./GymCard";
import GymsAssignModal from "./GymsAssignModal";
import GymsFormModal from "./GymsFormModal";
import GymsNotifyModal from "./GymsNotifyModal";
import { useGymsLogic, EMPTY_GYM_FORM } from "./useGymsLogic";
import "../../styles/clientes.css";

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

  // ============================================================
  // Acceso restringido
  // ============================================================
  if (!isDueno) {
    return (
      <AppLayout>
        <div className="clientes-page">
          <div style={{ textAlign: "center", padding: "60px" }}>
            <h1 style={{ color: "var(--danger-color)" }}>Acceso Restringido</h1>
            <p style={{ color: "var(--text-secondary)" }}>Solo los Dueños pueden gestionar gimnasios.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="clientes-page">
        <Header title="Mis Gimnasios">
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="primary" onClick={() => { setErrors({}); setOpenAssignGym(true); }}>
              + Asignar Gimnasio
            </Button>
            <Button variant="primary" onClick={() => { setCreateForm(EMPTY_GYM_FORM); setErrors({}); setOpenCreateGym(true); }}>
              + Crear Gimnasio
            </Button>
          </div>
        </Header>

        {loading ? (
          <div className="loading">Cargando gimnasios...</div>
        ) : (
          <>
            {/* MIS GIMNASIOS */}
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "16px" }}>Mis Gimnasios</h3>
              {myGyms && myGyms.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                  {myGyms.map((gym) => (
                    <GymCard key={gym.id} gym={gym} resolvePhoto={resolvePhoto} onEdit={openEdit} />
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-secondary)" }}>No tienes gimnasios asignados aún.</p>
              )}
            </div>

            {/* GIMNASIOS DISPONIBLES */}
            {availableGyms.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <h3 style={{ color: "var(--text-primary)", marginBottom: "16px" }}>Gimnasios Disponibles</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Puedes asignar {availableGyms.length} gimnasio{availableGyms.length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                  {availableGyms.map((gym) => (
                    <GymCard key={gym.id} gym={gym} resolvePhoto={resolvePhoto} onEdit={openEdit} dimmed />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* MODALES */}
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

        <GymsFormModal
          open={openCreateGym}
          onClose={() => setOpenCreateGym(false)}
          title="Crear Nuevo Gimnasio"
          form={createForm}
          setForm={setCreateForm}
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleCreateGym}
          saving={saving}
          submitText="Crear Gimnasio"
        />

        <GymsFormModal
          open={openEditGym}
          onClose={() => setOpenEditGym(false)}
          title={`Editar: ${editingGym?.nombre || ""}`}
          form={editForm}
          setForm={setEditForm}
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleEditGym}
          saving={saving}
          submitText="Guardar Cambios"
        />

        <GymsNotifyModal notif={notif} closeNotif={closeNotif} />
      </div>
    </AppLayout>
  );
}
