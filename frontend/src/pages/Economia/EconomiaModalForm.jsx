
import React from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function EconomiaModalForm({ open, onClose, formType, form, setForm, saving, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} title={formType === "INGRESO" ? "Registrar Ingreso" : "Registrar Gasto"}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input 
          label="Descripción" 
          placeholder={formType === "INGRESO" ? "Ej: Cuota de membresía..." : "Ej: Alquiler, Servicios..."}
          value={form.descripcion} 
          onChange={(v) => setForm({...form, descripcion: v})} 
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input 
            label="Monto (€)" type="number" min="0.01" step="0.01"
            value={form.importe} onChange={(v) => setForm({...form, importe: v})} 
          />
          <Input 
            label="Fecha" type="date" 
            value={form.fecha} onChange={(v) => setForm({...form, fecha: v})} 
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
          <Button variant={formType === "INGRESO" ? "primary" : "danger"} loading={saving} onClick={onSubmit} style={{ flex: 1 }}>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}