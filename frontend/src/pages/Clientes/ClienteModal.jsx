import { useState } from "react";
import Button from "../../components/ui/Button";


export default function ClienteModal({ open, onClose, onSave, editing }) {
  const getInitialForm = () => ({
    nombre: editing?.nombre || "",
    apellido: editing?.apellido || "",
    edad: editing?.edad || "",
    sexo: editing?.sexo || "",
  });

  const [form, setForm] = useState(getInitialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{editing ? "Editar Cliente" : "Nuevo Cliente"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input type="number" name="edad" value={form.edad} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}