import React from 'react';
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import './Styles/DeleteAdminModal.css';

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
        <div className="delete-admin-modal-container">
          <p className="delete-admin-text">
            ¿Estás seguro de que quieres eliminar a <strong>{selectedAdmin.nombre} {selectedAdmin.apellido}</strong>?
          </p>
          <p className="delete-admin-warning">⚠️ Esta acción no se puede deshacer.</p>
          
          <div className="delete-admin-actions">
            <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="danger" loading={saving} onClick={handleConfirmDelete} className="delete-admin-btn-confirm">
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
