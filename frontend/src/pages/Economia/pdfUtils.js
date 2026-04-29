import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export const exportDashboardPDF = async (data, filename) => {
  const { gym, stats, clases } = data;
  const doc = new jsPDF();

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FITFLOW - RESUMEN EJECUTIVO", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Gimnasio: ${gym?.nombre || "N/A"}`, 105, 28, { align: "center" });
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // Métricas Clave
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

  // Clases del Día / Agenda
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

export const exportEconomiaPDF = async (data, filename) => {
  // Fallback for old ref usage (though we should avoid it)
  if (data instanceof HTMLElement) {
    const html2pdf = (await import("html2pdf.js")).default;
    return html2pdf().from(data).set({ margin: 0.5, filename }).save();
  }

  const { gym, resumen, movimientos } = data;
  const doc = new jsPDF();
  // ... (rest of the existing implementation)

  // --- 1. ENCABEZADO ---
  doc.setFillColor(15, 23, 42); // Navy background
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FITFLOW - INFORME ECONÓMICO", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gimnasio: ${gym?.nombre || "N/A"}`, 105, 28, { align: "center" });
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // --- 2. RESUMEN FINANCIERO ---
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
    headStyles: { fillStyle: 'dark', fillColor: [99, 102, 241] }, // Indigo primary
  });

  let currentY = doc.lastAutoTable.finalY + 20;

  // --- 3. GRÁFICAS ---
  doc.setFontSize(16);
  doc.text("Análisis Visual", 14, currentY);
  currentY += 10;

  const chartIds = ["main-economy-chart", "ingresos-pie-chart", "gastos-pie-chart"];
  
  for (const id of chartIds) {
    const el = document.getElementById(id);
    if (el) {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      
      // Ajustar tamaño para que quepa en la página
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 28;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Verificar si hay espacio en la página actual
      if (currentY + pdfHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        currentY = 20;
      }

      doc.addImage(imgData, "PNG", 14, currentY, pdfWidth, pdfHeight);
      currentY += pdfHeight + 15;
    }
  }

  // --- 4. TABLA DE MOVIMIENTOS ---
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
    didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'INGRESO') {
                data.cell.styles.textColor = [16, 185, 129]; // Green
            } else {
                data.cell.styles.textColor = [239, 68, 68]; // Red
            }
        }
    },
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }
  });

  // --- 5. PIE DE PÁGINA ---
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