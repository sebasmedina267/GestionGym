
import React from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./Styles/EconomiaModalForm.css";

export default function EconomiaModalForm({ open, onClose, formType, form, setForm, saving, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} title={formType === "INGRESO" ? "Registrar Ingreso" : "Registrar Gasto"}>
      <div className="economia-modal-form-container">
        <Input 
          label="Descripción" 
          placeholder={formType === "INGRESO" ? "Ej: Cuota de membresía..." : "Ej: Alquiler, Servicios..."}
          value={form.descripcion} 
          onChange={(v) => setForm({...form, descripcion: v})} 
        />
        <div className="economia-modal-form-row">
          <Input 
            label="Monto (€)" type="number" min="0.01" step="0.01"
            value={form.importe} onChange={(v) => setForm({...form, importe: v})} 
          />
          <Input 
            label="Fecha" type="date" 
            value={form.fecha} onChange={(v) => setForm({...form, fecha: v})} 
          />
        </div>
        <div className="economia-modal-footer">
          <Button variant="secondary" onClick={onClose} className="economia-modal-btn-full">Cancelar</Button>
          <Button variant={formType === "INGRESO" ? "primary" : "danger"} loading={saving} onClick={onSubmit} className="economia-modal-btn-full">
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}