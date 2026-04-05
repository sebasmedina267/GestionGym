import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import { useAdminsLogic } from "./useAdminsLogic";
import AdminsTable from "./AdminsTable";
import CreateAdminModal from "./CreateAdminModal";
import EditAdminModal from "./EditAdminModal";
import DeleteAdminModal from "./DeleteAdminModal";
import CreateGymModal from "./CreateGymModal";
import "../../styles/clientes.css";

export default function AdminsPage() {
  const logic = useAdminsLogic();

  if (!logic.isDueno) {
    return (
      <AppLayout>
        <div className="clientes-page">
          <div style={{textAlign: "center", padding: "60px"}}>
            <h1 style={{color: "var(--danger-color)"}}>Acceso Restringido</h1>
            <p style={{color: "var(--text-secondary)"}}>Solo los Dueños (Superadmins) pueden gestionar el Staff.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="clientes-page">
        <Header title="Gestión de Staff">
          <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
            <Button variant={logic.viewAll ? "danger" : "secondary"} onClick={() => logic.setViewAll(!logic.viewAll)}>
              {logic.viewAll ? "👥 Todos" : `📍 ${logic.gym?.nombre || "Seleccionar Gym"}`}
            </Button>
            <Button variant="primary" onClick={() => logic.setShowCreateGym(true)}>
              + Crear Sucursal
            </Button>
            <Button variant="primary" onClick={() => logic.setOpen(true)}>
              + Contratar Empleado
            </Button>
          </div>
        </Header>

        {logic.loading ? (
          <div className="loading">Cargando administradores...</div>
        ) : (
          <AdminsTable
            tableData={logic.tableData}
            filteredAdmins={logic.filteredAdmins}
            handleOpenEdit={logic.handleOpenEdit}
            handleOpenDelete={logic.handleOpenDelete}
          />
        )}

        <CreateAdminModal
          open={logic.open}
          setOpen={logic.setOpen}
          photoPreview={logic.photoPreview}
          setPhotoPreview={logic.setPhotoPreview}
          handlePhotoChange={logic.handlePhotoChange}
          form={logic.form}
          setForm={logic.setForm}
          errors={logic.errors}
          validatePassword={logic.validatePassword}
          passwordValid={logic.passwordValid}
          gyms={logic.gyms}
          saving={logic.saving}
          handleCreate={logic.handleCreate}
          setPasswordValid={logic.setPasswordValid}
        />

        <EditAdminModal
          showEdit={logic.showEdit}
          setShowEdit={logic.setShowEdit}
          selectedAdmin={logic.selectedAdmin}
          editForm={logic.editForm}
          setEditForm={logic.setEditForm}
          errors={logic.errors}
          gyms={logic.gyms}
          handleEditPhotoChange={logic.handleEditPhotoChange}
          handleEditSave={logic.handleEditSave}
          saving={logic.saving}
        />

        <DeleteAdminModal
          showDelete={logic.showDelete}
          setShowDelete={logic.setShowDelete}
          selectedAdmin={logic.selectedAdmin}
          handleConfirmDelete={logic.handleConfirmDelete}
          saving={logic.saving}
        />

        <CreateGymModal
          showCreateGym={logic.showCreateGym}
          setShowCreateGym={logic.setShowCreateGym}
          formGym={logic.formGym}
          setFormGym={logic.setFormGym}
          errors={logic.errors}
          handleCreateGym={logic.handleCreateGym}
          saving={logic.saving}
        />
      </div>
    </AppLayout>
  );
}
