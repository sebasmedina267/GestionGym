
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useGym } from "../../hooks/useGym";
import { useEconomia } from "./useEconomia";
import { exportEconomiaPDF } from "./pdfUtils";
import ResumenSection from "./ResumenSection";
import ChartsSection from "./ChartsSection";
import MovimientosTable from "./MovimientosTable";
import EconomiaModalForm from "./EconomiaModalForm";
import api from "../../api/axios";
import "./Styles/EconomiaPage.css";

export default function EconomiaPage() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);
  const pdfRef = useRef(null);

  const mes = new Date().toISOString().substring(0, 7);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [openModal, setOpenModal] = useState(false);
  const [formType, setFormType] = useState(null);
  const [form, setForm] = useState({ descripcion: "", importe: "", fecha: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const [desde, hasta] = useMemo(() => {
    const [year, m] = mes.split("-");
    return [`${mes}-01`, new Date(year, m, 0).toISOString().split("T")[0]];
  }, [mes]);

  const { resumen, ingresosFuentes, gastosFuentes, sortedMovimientos, fetchData } = useEconomia(gymReady, desde, hasta);

  const calcMargin = useCallback(() => {
    if (resumen.ingresos === 0) return 0;
    return ((resumen.beneficios / resumen.ingresos) * 100).toFixed(1);
  }, [resumen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (type) => {
    setFormType(type);
    setForm({ descripcion: "", importe: "", fecha: new Date().toISOString().split("T")[0] });
    setOpenModal(true);
  };

  const handleSubmitForm = async () => {
    if (!form.descripcion || !form.importe || !form.fecha) return alert("Faltan datos requeridos");
    try {
      setSaving(true);
      const payload = { ...form, importe: Number(form.importe) };
      const endpoint = formType === "INGRESO" ? "/economia/ingresos" : "/economia/gastos";
      await api.post(endpoint, payload);
      setOpenModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Economía">
      {/* BOTONES ARRIBA DEL TODO */}
      <div className="economia-btn-group">
        <button className="btn-primary" onClick={() => handleOpenForm("INGRESO")}>Registrar Ingreso</button>
        <button className="btn-danger" onClick={() => handleOpenForm("GASTO")}>Registrar Gasto</button>
        <button className="btn-secondary" onClick={() => exportEconomiaPDF(pdfRef.current, "economia.pdf")}>Exportar PDF</button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div ref={pdfRef} className="economia-redesign-container">
        <ResumenSection resumen={resumen} calcMargin={calcMargin} />
        <ChartsSection resumen={resumen} ingresosFuentes={ingresosFuentes} gastosFuentes={gastosFuentes} />
        <MovimientosTable movimientos={sortedMovimientos} filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
      </div>

      <EconomiaModalForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        formType={formType}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSubmitForm}
      />
    </AppLayout>
  );
}