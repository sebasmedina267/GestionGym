import { useState, useMemo } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";
import { useClientes } from "./useClientes";
import ClienteModal from "./ClienteModal";
import ClientesTable from "./ClientesTable";
import "./Styles/ClientesPage.css";

/**
 * ClientesPage Component
 * 
 * Orchestrates the management of gym members. 
 * Supports creating, updating, toggling status, and deleting client records.
 * Distinguishes between local clients and external App Users (who have limited editability).
 */
export default function ClientesPage() {
  const { gym } = useGym();
  
  // Custom hook to fetch and synchronize the list of clients for the current gym
  const { clientes, loading, refetch } = useClientes(gym?.id);

  // --- UI States ---
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /**
   * Filtered client list based on search input. 
   * Searches across full names.
   */
  const filtered = useMemo(() => {
    return clientes.filter((c) =>
      `${c.nombre} ${c.apellido}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clientes, search]);

  /**
   * Persists client data to the backend.
   * Handles both creation and updates.
   * @param {Object} form - Data from the ClienteModal
   */
  const handleSave = async (form) => {
    const payload = { ...form, edad: Number(form.edad) };

    try {
      if (editing) {
        // Carry over origin metadata for correct backend routing
        if (editing.tipo_origen === 'APP') {
           payload.tipo_origen = 'APP';
        }
        await api.patch(`/clientes/${editing.id}`, payload);
      } else {
        await api.post(`/clientes`, payload);
      }

      setModalOpen(false);
      setEditing(null);
      refetch(); // Synchronize UI with updated database state
    } catch (error) {
      console.error("Save client error:", error);
      alert("Error al guardar los datos del cliente. Inténtalo de nuevo.");
    }
  };

  /**
   * Handles client record removal.
   * Note: App Users cannot be deleted from this interface as they own their accounts.
   */
  const handleDelete = async (cliente) => {
    if (cliente.tipo_origen === 'APP') {
      alert("Los usuarios de la App móvil no pueden eliminarse aquí. Solo se puede gestionar su estado de membresía.");
      return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${cliente.nombre}?`)) return;
    
    try {
      await api.delete(`/clientes/${cliente.id}`);
      refetch();
    } catch (error) {
      console.error("Delete client error:", error);
    }
  };

  /**
   * Toggles the active/inactive status of a member.
   */
  const handleToggle = async (cliente) => {
    try {
      await api.patch(`/clientes/${cliente.id}`, {
        activo: !cliente.activo,
        tipo_origen: cliente.tipo_origen
      });
      refetch();
    } catch (error) {
      console.error("Toggle client status error:", error);
    }
  };

  return (
    <AppLayout>
      <div className="clientes-v2">
        {/* Page Header: Title and primary creation action */}
        <header className="clientes-v2__hero">
          <div>
            <p className="clientes-v2__kicker">Miembros Activos</p>
            <h1 className="clientes-v2__title">Gestión de Clientes</h1>
          </div>

          <button
            className="clientes-v2__cta"
            onClick={() => setModalOpen(true)}
          >
            + Nuevo Cliente
          </button>
        </header>

        {/* Data Table Container */}
        <section className="clientes-v2__tableShell">
          <div className="clientes-v2__tableToolbar">
            {/* Real-time Filter Bar */}
            <div className="clientes-v2__filter">
              <span className="clientes-v2__filterIcon">⎚</span>
              <input
                className="clientes-v2__filterInput"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="clientes-v2__loading">Procesando datos...</div>
          ) : (
            <ClientesTable
              data={filtered}
              onEdit={(c) => {
                // Constraint: App Users are managed within the app; dashboard only toggles status
                if (c.tipo_origen === 'APP') {
                   alert("Los perfiles de usuarios móviles son de solo lectura. Solo puedes gestionar su estado activo/inactivo.");
                   return;
                }
                setEditing(c);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </section>

        {/* Create/Edit Modal Component */}
        <ClienteModal
          key={editing?.id || "new"} 
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
          editing={editing}
        />
      </div>
    </AppLayout>
  );
}