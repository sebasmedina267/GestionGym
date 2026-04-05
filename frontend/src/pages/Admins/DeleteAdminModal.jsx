import React from 'react';
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function DeleteAdminModal({
  showDelete,
  setShowDelete,
  selectedAdmin,
  handleConfirmDelete,
  saving
}) {
  return (
    <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Confirmar Eliminación">
      {selectedAdmin && (
        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          <p style={{color: "var(--text-secondary)", margin: 0}}>
            ¿Estás seguro de que quieres eliminar a <strong>{selectedAdmin.nombre} {selectedAdmin.apellido}</strong>?
          </p>
          <p style={{color: "var(--danger-color)", margin: "0", fontSize: "0.9rem"}}>⚠️ Esta acción no se puede deshacer.</p>
          
          <div style={{display: "flex", gap: "12px"}}>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="danger" loading={saving} onClick={handleConfirmDelete} style={{flex: 1}}>
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
