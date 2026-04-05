import React from 'react';
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

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
      title={isVenta ? "REGISTRAR VENTA" : "REGISTRAR COMPRA"}
      className="kinetic-modal"
    >
      {selectedProd && (
        <div style={{display: "flex", flexDirection: "column", gap: "24px", paddingTop: '10px'}}>
          <div style={{
            padding: "24px", 
            background: "rgba(255, 255, 255, 0.03)", 
            borderRadius: "2rem", 
            border: "1px dashed rgba(255, 255, 255, 0.12)", 
            textAlign: "center"
          }}>
            <h3 style={{margin: "0 0 6px 0", fontSize: '1.5rem', fontWeight: '900', color: 'var(--p-on-surface)', letterSpacing: '-0.02em'}}>
              {selectedProd.nombre}
            </h3>
            <div style={{display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center'}}>
              <span className="material-symbols-outlined" style={{fontSize: '0.9rem', color: 'var(--p-primary)'}}>inventory_2</span>
              <p style={{margin: 0, color: "var(--p-on-surface-variant)", fontSize: "0.8rem", fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                Stock Actual: <span style={{color: "var(--p-primary)"}}>{selectedProd.cantidad} uds</span>
              </p>
            </div>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
              <div>
                <label style={{display: "block", marginBottom: "12px", fontSize: "0.7rem", fontWeight: '900', color: "var(--p-on-surface-variant)", textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                  Unidades {isVenta ? "a vender" : "a comprar"}
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={isVenta ? selectedProd.cantidad : 9999} 
                  value={form.cantidad} 
                  onChange={(e) => setForm({...form, cantidad: e.target.value})} 
                  style={{
                    width: "100%", 
                    padding: "16px", 
                    borderRadius: "1.25rem", 
                    background: "rgba(255, 255, 255, 0.04)", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    color: "var(--p-on-surface)",
                    fontWeight: '700',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--p-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div>
                <label style={{display: "block", marginBottom: "12px", fontSize: "0.7rem", fontWeight: '900', color: "var(--p-on-surface-variant)", textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                  Precio Unitario (€)
                </label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={form.precio_unitario} 
                  onChange={(e) => setForm({...form, precio_unitario: e.target.value})} 
                  style={{
                    width: "100%", 
                    padding: "16px", 
                    borderRadius: "1.25rem", 
                    background: "rgba(255, 255, 255, 0.04)", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    color: "var(--p-on-surface)",
                    fontWeight: '700',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--p-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
          </div>
          
          <div style={{
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: 'center',
            padding: "24px 28px", 
            background: isVenta ? "rgba(78, 222, 163, 0.08)" : "rgba(255, 92, 114, 0.08)", 
            borderRadius: "2rem",
            borderLeft: `5px solid ${isVenta ? 'var(--p-secondary)' : 'var(--p-tertiary)'}`,
            boxShadow: `0 10px 30px ${isVenta ? 'rgba(78, 222, 163, 0.1)' : 'rgba(255, 92, 114, 0.1)'}`
          }}>
            <span style={{color: isVenta ? "var(--p-secondary)" : "var(--p-tertiary)", fontWeight: "950", textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem'}}>
              {isVenta ? "TOTAL INGRESO" : "TOTAL COSTO"}
            </span>
            <span style={{fontSize: "1.75rem", fontWeight: "950", color: "var(--p-on-surface)", textShadow: isVenta ? '0 0 15px rgba(78, 222, 163, 0.2)' : '0 0 15px rgba(255, 92, 114, 0.2)'}}>
              {(Number(form.cantidad) * Number(form.precio_unitario)).toFixed(2)} €
            </span>
          </div>

          <div style={{display: "flex", gap: "16px", marginTop: "12px"}}>
            <Button 
              variant="secondary" 
              onClick={onClose} 
              style={{flex: 1, borderRadius: '1.25rem', padding: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'}}
            >
              Cancelar
            </Button>
            <Button 
              variant={isVenta ? "success" : "danger"} 
              loading={saving} 
              onClick={onSave} 
              style={{
                flex: 2, 
                borderRadius: '1.25rem', 
                padding: '14px', 
                fontWeight: 950, 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em',
                boxShadow: `0 10px 25px ${isVenta ? 'rgba(78, 222, 163, 0.4)' : 'rgba(255, 92, 114, 0.4)'}`
              }}
            >
              Confirmar {isVenta ? "Venta" : "Compra"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
