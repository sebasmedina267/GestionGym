import Table from "../../components/ui/Table";


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
      label: "Sexo",
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
          >
            {row.activo ? "⦸" : "✓"}
          </button>

          <button
            className="clientes-v2__iconBtn clientes-v2__iconBtn--danger"
            onClick={() => onDelete(row)}
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