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
import "./Styles/AdminsPage.css";

export default function AdminsPage() {
  const logic = useAdminsLogic();

  if (!logic.isDueno) {
    return (
      <AppLayout>
        <div className="clientes-page">
          <div className="admins-page-restricted">
            <h1 className="admins-page-restricted-title">Acceso Restringido</h1>
            <p className="admins-page-restricted-desc">Solo los Dueños (Superadmins) pueden gestionar el Staff.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="clientes-page">
        <Header title="Gestión de Staff">
          <div className="admins-page-header-actions">
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
