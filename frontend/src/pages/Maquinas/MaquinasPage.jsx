import AppLayout from "../../components/layout/AppLayout";
import { useMaquinasLogic } from "./useMaquinasLogic";
import MaquinasGrid from "./MaquinasGrid";
import MaquinasFormModal from "./MaquinasFormModal";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import "../../styles/maquinas.css";

export default function MaquinasPage() {
  const {
    gymReady,
    maquinas,
    stats,
    loading,
    open,
    setOpen,
    editing,
    alertModal,
    setAlertModal,
    confirmModal,
    setConfirmModal,
    form,
    setForm,
    errors,
    saving,
    resetForm,
    openEdit,
    handleDelete,
    handleSave,
  } = useMaquinasLogic();

  if (!gymReady) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="animate-pulse">Cargando gimnasio...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="maquinas-page flex flex-col gap-8 relative overflow-hidden">
        {/* Ambient Glows - Slightly smaller to match scale */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Page Header Area (Compact) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 px-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_10px_rgba(189,194,255,0.3)]"></div>
              <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase">Inventario</h2>
            </div>
            <p className="text-slate-400 font-semibold text-base max-w-xl leading-snug tracking-tight">
              Control del ecosistema de entrenamiento. <span className="text-primary/60 font-medium">Monitoreo de estado y operatividad.</span>
            </p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="flex items-center gap-2 bg-secondary text-[#003924] px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(78,222,163,0.3)] group uppercase"
          >
            <span className="material-symbols-outlined font-black text-lg group-hover:rotate-180 transition-transform duration-700">add</span>
            Nueva Máquina
          </button>
        </div>

        {/* Dashboard Quick Stats (Compact & Aligned) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 px-4">
          {/* Total Items */}
          <div className="glass-card glow-indigo p-6 rounded-[1.5rem] flex items-center justify-between group transition-all duration-500 hover:bg-[#252d43]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-0.5">Total</p>
                <p className="text-3xl font-black text-on-surface tracking-tighter">{stats.total}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-700 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>

          {/* Operativas */}
          <div className="glass-card glow-emerald p-6 rounded-[1.5rem] flex items-center justify-between group transition-all duration-500 hover:bg-[#252d43]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-0.5">Operativas</p>
                <p className="text-3xl font-black text-secondary tracking-tighter">{stats.operativas}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-700 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>

          {/* Mantenimiento */}
          <div className="glass-card glow-rose p-6 rounded-[1.5rem] flex items-center justify-between group transition-all duration-500 hover:bg-[#252d43]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-tertiary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-tertiary text-2xl">build</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-0.5">Mantenimiento</p>
                <p className="text-3xl font-black text-tertiary tracking-tighter">{stats.mantenimiento}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-700 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>

          {/* Uso */}
          <div className="glass-card glow-slate p-6 rounded-[1.5rem] flex items-center justify-between group transition-all duration-500 hover:bg-[#252d43]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-400/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-slate-400 text-2xl">query_stats</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-0.5">Uso Diario</p>
                <div className="flex items-baseline gap-0.5">
                  <p className="text-3xl font-black text-on-surface tracking-tighter">{stats.uso}</p>
                  <span className="text-sm font-black text-slate-500">%</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-700 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
        </div>

        {/* Filter & Search Bar (Compact Modern) */}
        <div className="flex flex-col md:flex-row gap-4 relative z-10 px-4">
          <div className="flex-grow bg-[#131b2e] rounded-2xl px-6 py-4 flex items-center gap-4 group focus-within:bg-[#1a233a] transition-all duration-500 shadow-inner overflow-hidden">
            <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-xl">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-on-surface text-lg placeholder:text-slate-600 w-full outline-none font-medium tracking-tight" 
              placeholder="Identifica equipo por nombre, zona o estado..." 
              type="text"
            />
          </div>
          <button className="bg-[#222a3d] hover:bg-[#2d3449] px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 active:scale-95 group shadow-lg">
            <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform duration-700 text-xl">tune</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Filtros</span>
          </button>
        </div>

        {/* Inventory Section */}
        <div className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 text-primary gap-4">
              <div className="animate-spin text-5xl">
                <span className="material-symbols-outlined">sync</span>
              </div>
              <p className="font-bold uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Sistemas...</p>
            </div>
          ) : (
            <MaquinasGrid 
              maquinas={maquinas} 
              openEdit={openEdit} 
              handleDelete={handleDelete} 
            />
          )}
        </div>

        <MaquinasFormModal 
          open={open}
          setOpen={setOpen}
          editing={editing}
          form={form}
          setForm={setForm}
          errors={errors}
          saving={saving}
          handleSave={handleSave}
          resetForm={resetForm}
        />

        {/* MODAL DE CONFIRMACIÓN - Kinetic Style */}
        <Modal open={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })} title={confirmModal.title}>
          <div className="min-w-[400px] p-2 text-center flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-error text-6xl">warning</span>
              <p className="text-2xl font-black tracking-tight text-on-surface">¿Confirmar Acción?</p>
              <p className="text-slate-400 font-medium">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                className="flex-1 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold py-4 rounded-2xl transition-all active:scale-95"
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
              >
                CANCELAR
              </button>
              <button 
                className="flex-1 bg-error text-white font-black py-4 rounded-2xl hover:brightness-110 shadow-[0_10px_30px_rgba(255,178,183,0.3)] transition-all active:scale-95"
                onClick={() => confirmModal.onConfirm?.()}
              >
                ELIMINAR EQUIPO
              </button>
            </div>
          </div>
        </Modal>

        {/* MODAL DE ALERTA - Kinetic Style */}
        <Modal open={alertModal.open} onClose={() => setAlertModal({ ...alertModal, open: false })} title={alertModal.title}>
          <div className="min-w-[360px] p-2 text-center flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center self-center ${alertModal.type === 'error' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                <span className="material-symbols-outlined text-4xl">{alertModal.type === 'error' ? 'report_problem' : 'task_alt'}</span>
              </div>
              <p className="text-2xl font-black tracking-tight text-on-surface uppercase tracking-wider">{alertModal.title}</p>
              <p className="text-slate-400 font-medium leading-relaxed">
                {alertModal.message}
              </p>
            </div>
            <button 
              className="bg-primary text-on-primary font-black py-4 px-12 rounded-2xl self-center hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(189,194,255,0.3)]"
              onClick={() => setAlertModal({ ...alertModal, open: false })}
            >
              ENTENDIDO
            </button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
