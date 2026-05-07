import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

/**
 * exportDashboardPDF
 * 
 * Generates a high-fidelity executive summary PDF for the main dashboard.
 * Features:
 * - Brand identity and gym context integration.
 * - Key performance indicators (Active clients, Revenue, Retention).
 * - Daily operational schedule (Classes) retrieval.
 * - Spanish character support (accents, ñ) via standard Helvetica encoding.
 * 
 * @param {Object} data - Context data containing gym info, stats, and classes.
 * @param {string} filename - The target filename for the generated PDF.
 */
export const exportDashboardPDF = async (data, filename) => {
  const { gym, stats, clases } = data;
  const doc = new jsPDF();

  // Branding Header: Authoritative Navy background with centered title
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FITFLOW - RESUMEN EJECUTIVO", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Gimnasio: ${gym?.nombre || "N/A"}`, 105, 28, { align: "center" });
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // Core Performance Metrics Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("Métricas de Rendimiento", 14, 55);

  autoTable(doc, {
    startY: 60,
    head: [['Indicador', 'Valor']],
    body: [
      ['Clientes Activos', stats?.activeClients || 0],
      ['Ingresos Mensuales', `${(stats?.monthlyRevenue || 0).toLocaleString()} USD`],
      ['Tasa de Retención', `${stats?.retentionRate || 0}%`],
      ['Nuevas Altas (30d)', stats?.newSignups || 0],
    ],
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] }
  });

  // Daily Operational Agenda
  let currentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text("Agenda de Clases", 14, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Horario', 'Clase', 'Instructor', 'Cupos']],
    body: (clases || []).map(c => [
      `${c.hora_inicio} - ${c.hora_fin}`,
      c.nombre,
      c.instructor || "N/A",
      `${c.inscritos || 0} / ${c.cupos || 0}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }
  });

  doc.save(filename);
};

/**
 * exportEconomiaPDF
 * 
 * Generates a comprehensive financial audit report in PDF format.
 * Features:
 * - Dynamic financial summaries (Revenue, Expenses, Profit).
 * - Visual chart captures using html2canvas for high-fidelity embedding.
 * - Detailed transactional ledger with color-coded classification (Income/Expense).
 * - Automatic pagination and page numbering.
 * - Full support for Spanish localized strings and encoding.
 * 
 * @param {Object|HTMLElement} data - Financial data object or HTML element for legacy capture.
 * @param {string} filename - The target filename.
 */
export const exportEconomiaPDF = async (data, filename) => {
  // Legacy support: Capture HTML directly via html2pdf if an element is passed
  if (data instanceof HTMLElement) {
    const html2pdf = (await import("html2pdf.js")).default;
    return html2pdf().from(data).set({ margin: 0.5, filename }).save();
  }

  const { gym, resumen, movimientos } = data;
  const doc = new jsPDF();

  // --- 1. ENCABEZADO: Professional branding with branch context ---
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FITFLOW - INFORME ECONÓMICO", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gimnasio: ${gym?.nombre || "N/A"}`, 105, 28, { align: "center" });
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // --- 2. RESUMEN FINANCIERO: Aggregate metrics table ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("Resumen Mensual", 14, 55);

  const margin = resumen.ingresos > 0 ? ((resumen.beneficios / resumen.ingresos) * 100).toFixed(1) : 0;

  autoTable(doc, {
    startY: 60,
    head: [['Concepto', 'Monto']],
    body: [
      ['Ingresos Totales', `${resumen.ingresos.toLocaleString()} USD`],
      ['Gastos Totales', `${resumen.gastos.toLocaleString()} USD`],
      ['Beneficio Neto', `${resumen.beneficios.toLocaleString()} USD`],
      ['Margen de Beneficio', `${margin}%`],
    ],
    theme: 'striped',
    headStyles: { fillStyle: 'dark', fillColor: [99, 102, 241] },
  });

  let currentY = doc.lastAutoTable.finalY + 20;

  // --- 3. GRÁFICAS: Capture and embed live Recharts instances ---
  doc.setFontSize(16);
  doc.text("Análisis Visual", 14, currentY);
  currentY += 10;

  const chartIds = ["main-economy-chart", "ingresos-pie-chart", "gastos-pie-chart"];
  
  for (const id of chartIds) {
    const el = document.getElementById(id);
    if (el) {
      // Use html2canvas to rasterize the SVG/HTML charts for PDF embedding
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 28;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle automatic page breaks for large visual assets
      if (currentY + pdfHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        currentY = 20;
      }

      doc.addImage(imgData, "PNG", 14, currentY, pdfWidth, pdfHeight);
      currentY += pdfHeight + 15;
    }
  }

  // --- 4. TABLA DE MOVIMIENTOS: Detailed chronological ledger ---
  if (currentY + 30 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(16);
  doc.text("Detalle de Movimientos", 14, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Importe']],
    body: movimientos.map(m => [
      new Date(m.fecha).toLocaleDateString(),
      m.descripcion,
      m.categoria,
      m.tipo,
      `${m.importe.toLocaleString()} USD`
    ]),
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    },
    // Semantic styling: Color code transactions based on revenue/expense classification
    didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'INGRESO') {
                data.cell.styles.textColor = [16, 185, 129]; // Operational Green
            } else {
                data.cell.styles.textColor = [239, 68, 68]; // Alert Red
            }
        }
    },
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }
  });

  // --- 5. PIE DE PÁGINA: Global numbering and metadata ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Generado por FitFlow Management Engine`,
      105,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(filename);
};