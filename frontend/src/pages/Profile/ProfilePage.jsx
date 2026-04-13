import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import { useProfileLogic } from "./useProfileLogic";
import ProfileCard from "./ProfileCard";
import ActivityLogs from "./ActivityLogs";
import EmployeesSection from "./EmployeesSection";
import ProfileModals from "./ProfileModals";
import "./Styles/ProfilePage.css";

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
        <Header title="Mi Perfil y Actividad">
          <button 
            className="btn btn-danger" 
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </Header>

        <div className="profile-main-grid">
          <ProfileCard 
            admin={admin} 
            isDueno={isDueno} 
            setShowCreateGym={setShowCreateGym} 
            rolBadge={rolBadge} 
          />
          <ActivityLogs 
            loading={loading} 
            logs={logs} 
          />
        </div>

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
