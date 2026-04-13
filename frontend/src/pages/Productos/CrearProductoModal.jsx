import React, { useRef } from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "./Styles/CrearProductoModal.module.css";


export default function CrearProductoModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
  saving
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imagen: file });
    }
  };

  const removeImage = () => {
    setForm({ ...form, imagen: null });
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      clean
    >
      <div className={styles.prodModalContainer}>
        {/* Side Decorative/Info Section */}
        <div className={styles.sideInfoPanel}>
          <div>
            <h3 className={styles.sideInfoTitle}>Gestión de Stock</h3>
            <p className={styles.sideInfoText}>
              Añada nuevos artículos a su catálogo de élite. Asegúrese de que las imágenes reflejen la calidad de Titan High-End.
            </p>
          </div>
          <div className={styles.sideValidationArea}>
            <div className={styles.validationPro}>
              <span className={`material-symbols-outlined ${styles.validationProIcon}`}>verified</span>
              <span className={styles.validationProText}>Validación Pro</span>
            </div>
            <div className={styles.proTipBox}>
              <span className={styles.proTipLabel}>TIP PROFESIONAL</span>
              <p className={styles.proTipText}>"La precisión en el inventario es la base de un rendimiento óptimo."</p>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className={styles.mainFormSection}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Dar de Alta un Artículo</h2>
            <button className={styles.btnClose} onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className={styles.kaForm} onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            {/* Foto Upload Area */}
            <div className={styles.prodPhotoUploadGroup}>
              <label className={styles.prodPhotoLabel}>Foto del Producto</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={styles.prodPhotoDropzone}
              >
                {form.imagen ? (
                  <>
                    <img 
                      src={URL.createObjectURL(form.imagen)} 
                      alt="Vista previa" 
                      className={styles.prodPhotoPreview}
                    />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                  </>
                ) : (
                  <div className={styles.dropzoneContent}>
                    <span className={`material-symbols-outlined ${styles.prodPhotoEmptyIcon}`}>add_a_photo</span>
                    <span className={styles.prodPhotoEmptyText}>Seleccionar Imagen</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <Input 
              label="Nombre del artículo" 
              value={form.nombre} 
              onChange={(v) => setForm({ ...form, nombre: v })} 
              placeholder="Ej: Proteína Isolate 2kg"
              variant="kinetic"
            />
            
            <div className={styles.prodFormRow}>
              <Input 
                label="Precio Venta (€)" 
                type="number" 
                min="0" 
                step="0.01"
                value={form.precio} 
                onChange={(v) => setForm({ ...form, precio: v })} 
                placeholder="0.00"
                variant="kinetic"
              />
              <Input 
                label="Stock Inicial (Ud)" 
                type="number" 
                min="0" 
                value={form.stock} 
                onChange={(v) => setForm({ ...form, stock: v })} 
                placeholder="0"
                variant="kinetic"
              />
            </div>

            <div className={styles.prodModalFooter}>
              <button 
                type="button"
                className={styles.prodModalBtnCancel}
                onClick={onClose}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className={styles.prodModalBtnConfirm}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Confirmar Alta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
