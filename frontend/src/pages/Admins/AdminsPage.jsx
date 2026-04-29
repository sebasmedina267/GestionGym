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

  if (!logic.canManageStaff) {
    return (
      <AppLayout>
        <div className="admins-page-restricted-container">
          <div className="admins-page-restricted-card">
            <span className="material-symbols-outlined restricted-icon">lock</span>
            <h1 className="admins-page-restricted-title">Acceso Restringido</h1>
            <p className="admins-page-restricted-desc">No tienes permisos para gestionar el Staff del sistema.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="admins-view-container">
        {/* Header Section */}
        <div className="admins-view-header">
          <div className="header-text-group">
            <h2 className="header-display-title">Gestión de Staff</h2>
            <p className="header-subtitle-desc">
              Administre el acceso, roles y permisos de los empleados en todas sus sucursales. 
              Optimización de personal y control administrativo centralizado.
            </p>
          </div>
          <div className="header-actions-group">
            <Button 
              className="btn-filter-gym"
              variant={logic.viewAll ? "danger" : "secondary"} 
              onClick={() => logic.setViewAll(!logic.viewAll)}
            >
              <span className="material-symbols-outlined">{logic.viewAll ? "group" : "location_on"}</span>
              {logic.viewAll ? "Ver Todos" : (logic.gym?.nombre || "Sucursal Actual")}
            </Button>
            {logic.isDueno && (
              <Button className="btn-add-branch" onClick={() => logic.setShowCreateGym(true)}>
                <span className="material-symbols-outlined">add_business</span>
                Crear Sucursal
              </Button>
            )}
            <Button className="btn-hire-staff" onClick={() => logic.setOpen(true)}>
              <span className="material-symbols-outlined">person_add</span>
              Contratar Empleado
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">STAFF TOTAL</p>
              <p className="metric-value">{logic.tableData.length}</p>
            </div>
            <div className="metric-icon-box primary-tint">
              <span className="material-symbols-outlined">badge</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">SUCURSALES</p>
              <p className="metric-value">{logic.gyms?.length || 1}</p>
            </div>
            <div className="metric-icon-box secondary-tint">
              <span className="material-symbols-outlined">store</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">ADMINS ACTIVOS</p>
              <p className="metric-value">{logic.tableData.filter(a => a.rol !== 'Empleado').length}</p>
            </div>
            <div className="metric-icon-box tertiary-tint">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">NIVEL DE ACCESO</p>
              <p className="metric-value text-secondary">{logic.isDueno ? "Root" : "Admin"}</p>
            </div>
            <div className="metric-icon-box success-tint">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper-card">
          {logic.loading ? (
            <div className="loading-state">
              <div className="spinner-engine"></div>
              <span>Sincronizando Engine de Staff...</span>
            </div>
          ) : (
            <AdminsTable
              tableData={logic.tableData}
              filteredAdmins={logic.filteredAdmins}
              handleOpenEdit={logic.handleOpenEdit}
              handleOpenDelete={logic.handleOpenDelete}
            />
          )}
        </div>

        {/* Footer Info Sections */}
        <div className="footer-info-grid">
          <div className="policies-card">
            <div className="policy-glow"></div>
            <h3 className="policy-title">Políticas de Roles</h3>
            <div className="policy-items">
              <div className="policy-item">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <p className="policy-role">Dueños (Root)</p>
                  <p className="policy-desc">Acceso total a finanzas, configuración de sucursales y borrado de registros.</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <div>
                  <p className="policy-role">Managers</p>
                  <p className="policy-desc">Gestión de staff de su sucursal, reportes de asistencia y ventas locales.</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="material-symbols-outlined text-tertiary">verified_user</span>
                <div>
                  <p className="policy-role">Empleados</p>
                  <p className="policy-desc">Registro de clientes, cobros en punto de venta y control de acceso.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="security-card">
            <div>
              <h3 className="security-title">Seguridad Staff</h3>
              <p className="security-desc">
                Todas las acciones administrativas son registradas con IP y marca de tiempo en el sistema de auditoría central.
              </p>
            </div>
            <button className="btn-audit-logs">
              <span className="material-symbols-outlined">history_edu</span>
              Ver Logs de Auditoría
            </button>
          </div>
        </div>

        {/* Modals */}
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
          isDueno={logic.isDueno}
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
          isDueno={logic.isDueno}
        />

        <DeleteAdminModal
          showDelete={logic.showDelete}
          setShowDelete={logic.setShowDelete}
          selectedAdmin={logic.selectedAdmin}
          handleConfirmDelete={logic.handleConfirmDelete}
          saving={logic.saving}
        />

        {logic.isDueno && (
          <CreateGymModal
            showCreateGym={logic.showCreateGym}
            setShowCreateGym={logic.setShowCreateGym}
            formGym={logic.formGym}
            setFormGym={logic.setFormGym}
            errors={logic.errors}
            handleCreateGym={logic.handleCreateGym}
            saving={logic.saving}
          />
        )}
      </div>
    </AppLayout>
  );
}
