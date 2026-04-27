import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import styles from "./Styles/MovimientoModal.module.css";

export default function MovimientoModal({
  open,
  onClose,
  selectedProd,
  movTipo,
  form,
  setForm,
  onSave,
  saving
}) {
  const isVenta = movTipo === "venta";

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      clean
    >
      {selectedProd && (
        <div className={styles.movModalShell}>
          <div className={styles.movProductHeader}>
            <p className={styles.movStockText} style={{ marginBottom: '0.25rem' }}>
              {isVenta ? "Registrar Venta" : "Registrar Compra"}
            </p>
            <h3 className={styles.movProductName}>
              {selectedProd.nombre}
            </h3>
            <div className={styles.movProductStockRow}>
              <span className={`material-symbols-outlined ${styles.movStockIcon}`}>inventory_2</span>
              <p className={styles.movStockText}>
                Stock Actual: <span className={styles.movStockValue}>{selectedProd.cantidad} uds</span>
              </p>
            </div>
          </div>

          <div className={styles.movFormGrid}>
              <Input
                label={`Unidades a ${isVenta ? 'vender' : 'comprar'}`}
                type="number"
                value={form.cantidad}
                onChange={(v) => setForm({...form, cantidad: v})}
                variant="kinetic"
                placeholder="2"
              />
              <Input
                label="Precio Unitario (€)"
                type="number"
                value={form.precio_unitario}
                onChange={(v) => setForm({...form, precio_unitario: v})}
                variant="kinetic"
                placeholder="15.00"
                icon="payments"
              />
          </div>
          
          <div className={`${styles.movSummaryBox} ${isVenta ? styles.venta : styles.compra}`}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={`${styles.movSummaryLabel} ${isVenta ? styles.venta : styles.compra}`}>
                {isVenta ? "TOTAL INGRESO" : "TOTAL COSTO"}
              </span>
              <span className={styles.movSummaryValue}>
                {(Number(form.cantidad) * Number(form.precio_unitario)).toFixed(2)} €
              </span>
            </div>
            <div className={styles.summaryIcon} style={{ opacity: 0.1, transform: 'scale(1.5)' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                 {isVenta ? 'monetization_on' : 'shopping_cart'}
               </span>
            </div>
          </div>

          <div className={styles.movFooter}>
            <button 
              className={styles.movBtnCancel}
              onClick={onClose} 
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              className={`${styles.movBtnConfirm} ${isVenta ? styles.venta : styles.compra}`}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Procesando..." : `Confirmar ${isVenta ? "Venta" : "Compra"}`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
