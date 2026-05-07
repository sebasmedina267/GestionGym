import Table from "../../components/ui/Table";
import "./Styles/ClientesTable.css";

/**
 * ClientesTable Component
 * 
 * Renders the member directory in a high-density, interactive data grid.
 * Features:
 * - Dynamic column generation with custom renders for status and gender.
 * - Integrated actions for profile editing, status toggling, and deletion.
 * - Identity visualization via avatars.
 * 
 * Props:
 * @param {Array} data - Collection of member entities.
 * @param {Function} onEdit - Callback for profile modification.
 * @param {Function} onDelete - Callback for member offboarding.
 * @param {Function} onToggle - Callback for membership status switching.
 */
export default function ClientesTable({ data, onEdit, onDelete, onToggle }) {
  const columns = [
    {
      key: "nombre",
      label: "Nombre",
      render: (_val, row) => (
        <div className="clientes-v2__nameCell">
          <div className="clientes-v2__avatar">
            {(row.nombre?.[0] || "") + (row.apellido?.[0] || "")}
          </div>
          <span className="clientes-v2__nameText">{row.nombre}</span>
        </div>
      ),
    },
    { key: "apellido", label: "Apellido" },
    { key: "edad", label: "Edad" },
    {
      key: "sexo",
      label: "Género",
      render: (v) =>
        v === "M" ? "Masculino" : v === "F" ? "Femenino" : "Otro",
    },
    {
      key: "estado",
      label: "Estado",
      render: (_val, row) => (
        <span
          className={`clientes-v2__chip ${
            row.activo
              ? "clientes-v2__chip--active"
              : "clientes-v2__chip--inactive"
          }`}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_val, row) => (
        <div className="clientes-v2__rowActions">
          <button
            className="clientes-v2__iconBtn clientes-v2__iconBtn--primary"
            onClick={() => onEdit(row)}
            title="Editar Perfil"
          >
            ✎
          </button>

          <button
            className={`clientes-v2__iconBtn ${
              row.activo
                ? "clientes-v2__iconBtn--warn"
                : "clientes-v2__iconBtn--good"
            }`}
            onClick={() => onToggle(row)}
            title={row.activo ? "Desactivar Miembro" : "Activar Miembro"}
          >
            {row.activo ? "⦸" : "✓"}
          </button>

          <button
            className="clientes-v2__iconBtn clientes-v2__iconBtn--danger"
            onClick={() => onDelete(row)}
            title="Eliminar Registro"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="clientes-v2__tableWrap">
      <Table columns={columns} data={data} />
    </div>
  );
}