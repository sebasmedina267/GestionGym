import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function MaquinasFormModal({ open, setOpen, editing, form, setForm, errors, saving, handleSave, resetForm }) {
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        resetForm();
      }}
      title={editing ? "Actualizar Equipo" : "Registrar Máquina"}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Nombre del equipo *</label>
          <input
            className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all"
            placeholder="Ej. Prensa de Piernas 45º"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          {errors.nombre && <p className="text-error text-xs ml-1">{errors.nombre}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Grupo Muscular / Uso</label>
            <input
              className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all"
              placeholder="Ej. Piernas"
              value={form.uso}
              onChange={(e) => setForm({ ...form, uso: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Cantidad</label>
            <input
              className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all"
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Ubicación Física</label>
            <input
              className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all"
              placeholder="Ej. Zona Planta Baja A"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Estado Actual</label>
            <select
              className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all appearance-none"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="Disponible">Disponible</option>
              <option value="En Uso">En Uso</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Descripción y Detalles</label>
          <textarea 
            value={form.descripcion}
            onChange={(e) => setForm({...form, descripcion: e.target.value})}
            placeholder="Estado, marca, notas especiales..."
            rows="3"
            className="bg-surface-container-highest border-none focus:ring-2 focus:ring-primary text-on-surface p-4 rounded-2xl w-full transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] uppercase tracking-widest font-bold text-slate-400 ml-1">Fotografía del Equipo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if(file) setForm({ ...form, imagen: file });
            }}
            className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
          />
        </div>

        {form.imagen && (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10 mt-2">
            <img
              src={
                typeof form.imagen === "string"
                  ? form.imagen
                  : URL.createObjectURL(form.imagen)
              }
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => setForm({ ...form, imagen: null })}
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-all"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button 
            type="button"
            onClick={() => { setOpen(false); resetForm(); }}
            className="flex-1 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold py-4 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(189,194,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Registrar Máquina"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
