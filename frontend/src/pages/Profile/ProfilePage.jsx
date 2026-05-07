import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import { useProfileLogic } from "./useProfileLogic";
import ProfileCard from "./ProfileCard";
import ActivityLogs from "./ActivityLogs";
import EmployeesSection from "./EmployeesSection";
import ProfileModals from "./ProfileModals";
import "./Styles/ProfilePage.css";

/**
 * ProfilePage Component
 * 
 * Central hub for personal account management and administrative oversight.
 * Features:
 * - Identity visualization and session control (Logout).
 * - Real-time activity auditing for the current administrator.
 * - Team management portal (Employees) restricted to Owners.
 * - Organizational expansion entry points (Branch creation).
 */
export default function ProfilePage() {
  const {
    admin,
    logout,
    gym,
    logs,
    loading,
    showCreateGym,
    setShowCreateGym,
    newGymForm,
    setNewGymForm,
    savingGym,
    handleCreateGym,
    empleados,
    loadingEmpleados,
    showEditEmpleado,
    setShowEditEmpleado,
    selectedEmpleado,
    editForm,
    setEditForm,
    savingEmpleado,
    handleSaveEmpleado,
    showConfirmDelete,
    setShowConfirmDelete,
    employeeToDelete,
    confirmDelete,
    isDueno,
    rolBadge,
    handleEditEmpleado,
    handleDeleteEmpleado
  } = useProfileLogic();

  return (
    <AppLayout>
      <div className="profile-page">
        {/* Module Header: Personal identity and high-level session action */}
        <Header title="Mi Perfil y Actividad">
          <button 
            className="btn btn-danger" 
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </Header>

        <div className="profile-main-grid">
          {/* Identity & Privilege Visualization */}
          <ProfileCard 
            admin={admin} 
            isDueno={isDueno} 
            setShowCreateGym={setShowCreateGym} 
            rolBadge={rolBadge} 
          />
          {/* Audit Ledger: Recent system interactions */}
          <ActivityLogs 
            loading={loading} 
            logs={logs} 
          />
        </div>

        {/* Strategic Team Oversight: Scoped to Owners for branch management */}
        {isDueno && (
          <EmployeesSection 
            gym={gym} 
            loadingEmpleados={loadingEmpleados} 
            empleados={empleados} 
            handleEditEmpleado={handleEditEmpleado} 
            handleDeleteEmpleado={handleDeleteEmpleado} 
          />
        )}
      </div>

      {/* Subsystem Modals: Managed workflows for profile and team updates */}
      <ProfileModals 
        showCreateGym={showCreateGym}
        setShowCreateGym={setShowCreateGym}
        newGymForm={newGymForm}
        setNewGymForm={setNewGymForm}
        savingGym={savingGym}
        handleCreateGym={handleCreateGym}
        showEditEmpleado={showEditEmpleado}
        setShowEditEmpleado={setShowEditEmpleado}
        selectedEmpleado={selectedEmpleado}
        editForm={editForm}
        setEditForm={setEditForm}
        savingEmpleado={savingEmpleado}
        handleSaveEmpleado={handleSaveEmpleado}
        showConfirmDelete={showConfirmDelete}
        setShowConfirmDelete={setShowConfirmDelete}
        confirmDelete={confirmDelete}
        employeeToDelete={employeeToDelete}
      />
    </AppLayout>
  );
}
