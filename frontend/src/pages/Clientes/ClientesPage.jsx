import { useState, useMemo } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";
import { useClientes } from "./useClientes";
import ClienteModal from "./ClienteModal";
import ClientesTable from "./ClientesTable";
import "../../styles/clientes.css";

export default function ClientesPage() {
  const { gym } = useGym();
  const { clientes, loading, refetch } = useClientes(gym?.id);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return clientes.filter((c) =>
      `${c.nombre} ${c.apellido}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clientes, search]);

  const handleSave = async (form) => {
    const payload = { ...form, edad: Number(form.edad) };

    if (editing) {
      await api.patch(`/clientes/${editing.id}`, payload);
    } else {
      await api.post(`/clientes`, payload);
    }

    setModalOpen(false);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (cliente) => {
    if (!confirm(`Eliminar a ${cliente.nombre}?`)) return;
    await api.delete(`/clientes/${cliente.id}`);
    refetch();
  };

  const handleToggle = async (cliente) => {
    await api.patch(`/clientes/${cliente.id}`, {
      activo: !cliente.activo,
    });
    refetch();
  };

  return (
    <AppLayout>
      <div className="clientes-v2">
        <header className="clientes-v2__hero">
          <div>
            <p className="clientes-v2__kicker">Miembros</p>
            <h1 className="clientes-v2__title">Gestión de Clientes</h1>
          </div>

          <button
            className="clientes-v2__cta"
            onClick={() => setModalOpen(true)}
          >
            + Nuevo cliente
          </button>
        </header>

        <section className="clientes-v2__tableShell">
          <div className="clientes-v2__tableToolbar">
            <div className="clientes-v2__filter">
              <span className="clientes-v2__filterIcon">⎚</span>
              <input
                className="clientes-v2__filterInput"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <ClientesTable
              data={filtered}
              onEdit={(c) => {
                setEditing(c);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </section>

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