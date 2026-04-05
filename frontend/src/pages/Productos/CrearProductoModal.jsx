import React, { useRef } from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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
      title="Dar de Alta un Artículo"
      className="kinetic-modal"
    >
      <div style={{display: "flex", flexDirection: "column", gap: "28px", padding: '10px 0'}}>
        
        {/* Foto Upload Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--p-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Fotografía del Producto
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: '140px',
              borderRadius: '2rem',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--p-primary)', e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)', e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
          >
            {form.imagen ? (
              <>
                <img 
                  src={URL.createObjectURL(form.imagen)} 
                  alt="Vista previa" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '2rem' }}>edit</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,92,114,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                </button>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }}>add_a_photo</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--p-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seleccionar Imagen</span>
              </>
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
          placeholder="Ej: Proteína Whey 2kg"
        />
        
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
          <Input 
            label="Precio Venta (€)" 
            type="number" 
            min="0" 
            step="0.01"
            value={form.precio} 
            onChange={(v) => setForm({ ...form, precio: v })} 
            placeholder="0.00"
          />
          <Input 
            label="Stock Inicial (Uds)" 
            type="number" 
            min="0" 
            value={form.stock} 
            onChange={(v) => setForm({ ...form, stock: v })} 
            placeholder="0"
          />
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
            variant="primary" 
            loading={saving} 
            onClick={onSave} 
            style={{flex: 2, borderRadius: '1.25rem', padding: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', boxShadow: '0 10px 25px rgba(189, 194, 255, 0.4)'}}
          >
            Confirmar Alta
          </Button>
        </div>
      </div>
    </Modal>
  );
}
