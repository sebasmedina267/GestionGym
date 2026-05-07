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

/**
 * AdminsPage Component (Staff Management)
 * 
 * The authoritative interface for managing gym human resources.
 * Features:
 * - Role-based access control (RBAC) visualization.
 * - Multi-branch staff coordination.
 * - Dynamic metrics for staff distribution.
 * - Comprehensive CRUD for administrators and employees.
 * - New branch (Gym) creation for Owners.
 */
export default function AdminsPage() {
  const logic = useAdminsLogic();

  /** Access Control Guard: Ensure only authorized roles can view this module */
  if (!logic.canManageStaff) {
    return (
      <AppLayout>
        <div className="admins-page-restricted-container">
          <div className="admins-page-restricted-card">
            <span className="material-symbols-outlined restricted-icon">lock</span>
            <h1 className="admins-page-restricted-title">Acceso Restringido</h1>
            <p className="admins-page-restricted-desc">
              No tienes suficientes privilegios administrativos para gestionar el personal del sistema.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="admins-view-container">
        {/* --- Page Header: Strategic Context and Global Actions --- */}
        <div className="admins-view-header">
          <div className="header-text-group">
            <h2 className="header-display-title">Ecosistema de Personal</h2>
            <p className="header-subtitle-desc">
              Organiza niveles de acceso, roles y permisos operativos en todas las sucursales del gimnasio. 
              Optimización centralizada de recursos humanos y auditoría administrativa.
            </p>
          </div>
          <div className="header-actions-group">
            {/* Toggle between specific branch view and global organization view */}
            <Button 
              className="btn-filter-gym"
              variant={logic.viewAll ? "danger" : "secondary"} 
              onClick={() => logic.setViewAll(!logic.viewAll)}
            >
              <span className="material-symbols-outlined">{logic.viewAll ? "group" : "location_on"}</span>
              {logic.viewAll ? "Vista de Organización" : (logic.gym?.nombre || "Sucursal Actual")}
            </Button>
            
            {/* Restricted Action: Only owners can expand the gym network */}
            {logic.isDueno && (
              <Button className="btn-add-branch" onClick={() => logic.setShowCreateGym(true)}>
                <span className="material-symbols-outlined">add_business</span>
                Añadir Sucursal
              </Button>
            )}
            
            <Button className="btn-hire-staff" onClick={() => logic.setOpen(true)}>
              <span className="material-symbols-outlined">person_add</span>
              Contratar Personal
            </Button>
          </div>
        </div>

        {/* --- Operational Metrics: Real-time Staff Distribution --- */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">TOTAL PERSONAL</p>
              <p className="metric-value">{logic.tableData.length}</p>
            </div>
            <div className="metric-icon-box primary-tint">
              <span className="material-symbols-outlined">badge</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">SUCURSALES ACTIVAS</p>
              <p className="metric-value">{logic.gyms?.length || 1}</p>
            </div>
            <div className="metric-icon-box secondary-tint">
              <span className="material-symbols-outlined">store</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">ADMINS PRIVILEGIADOS</p>
              <p className="metric-value">{logic.tableData.filter(a => a.rol !== 'Empleado').length}</p>
            </div>
            <div className="metric-icon-box tertiary-tint">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <p className="metric-label">TU NIVEL DE PRIVILEGIO</p>
              <p className="metric-value text-secondary">{logic.isDueno ? "Root / Dueño" : "Administrativo"}</p>
            </div>
            <div className="metric-icon-box success-tint">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
        </div>

        {/* --- Data Visualization: Staff Registry Table --- */}
        <div className="table-wrapper-card">
          {logic.loading ? (
            <div className="loading-state">
              <div className="spinner-engine"></div>
              <span>Sincronizando el Motor de Personal...</span>
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

        {/* --- Instructional Content: Governance Policies --- */}
        <div className="footer-info-grid">
          <div className="policies-card">
            <div className="policy-glow"></div>
            <h3 className="policy-title">Política de Gobernanza de Roles</h3>
            <div className="policy-items">
              <div className="policy-item">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <p className="policy-role">Dueños (Acceso Root)</p>
                  <p className="policy-desc">Autoridad fiscal total, control de infraestructura de sucursales y eliminación destructiva de registros.</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <div>
                  <p className="policy-role">Gerentes de Sucursal</p>
                  <p className="policy-desc">Supervisión de personal local, analítica de asistencia e informes de ingresos regionales.</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="material-symbols-outlined text-tertiary">verified_user</span>
                <div>
                  <p className="policy-role">Personal Operativo (Empleados)</p>
                  <p className="policy-desc">Check-in de miembros, operaciones en punto de venta y control activo de las instalaciones.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="security-card">
            <div>
              <h3 className="security-title">Auditoría y Cumplimiento</h3>
              <p className="security-desc">
                Todas las acciones administrativas se registran criptográficamente con origen IP y marcas de tiempo de alta precisión en el motor de auditoría central.
              </p>
            </div>
            <button className="btn-audit-logs">
              <span className="material-symbols-outlined">history_edu</span>
              Revisar Historial de Auditoría
            </button>
          </div>
        </div>

        {/* --- Component Modals: Staff Lifecycle Operations --- */}
        
        {/* Onboarding Flow */}
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

        {/* Profile Modification Flow */}
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

        {/* Offboarding / Deletion Guard */}
        <DeleteAdminModal
          showDelete={logic.showDelete}
          setShowDelete={logic.setShowDelete}
          selectedAdmin={logic.selectedAdmin}
          handleConfirmDelete={logic.handleConfirmDelete}
          saving={logic.saving}
        />

        {/* Strategic Expansion: Only for Owners */}
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
