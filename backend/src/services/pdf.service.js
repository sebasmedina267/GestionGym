import PDFDocument from "pdfkit";
import { formatDate } from "../utils/dateFormatter.js";

/**
 * PDF Generation Service
 * 
 * Handles the creation of professional PDF reports for financial data,
 * including resumes, income, and expense reports.
 */

/**
 * Generates a comprehensive financial resume PDF
 * @param {Object} data - Financial data including ingresos, gastos, balances
 * @param {Object} gym - Gym information
 * @returns {Stream} PDF document stream
 */
export function generarResumenPDF(data, gym) {
  const doc = new PDFDocument({
    bufferPages: true,
    margin: 40,
  });

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("REPORTE FINANCIERO", {
    align: "center",
  });
  
  doc.fontSize(12).font("Helvetica").text(`Gimnasio: ${gym.nombre}`, {
    align: "center",
  });
  
  if (gym.ciudad) {
    doc.fontSize(10).text(`${gym.ciudad}`, { align: "center" });
  }

  doc.moveDown();
  doc.fontSize(10).text(
    `Generado: ${formatDate(new Date())}`,
    { align: "right" }
  );

  // Divider
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  // Summary Section
  doc.fontSize(14).font("Helvetica-Bold").text("RESUMEN FINANCIERO", {
    underline: true,
  });
  doc.moveDown(0.5);

  const resumen = data.resumen;
  if (resumen) {
    doc.fontSize(11).font("Helvetica");

    const summaryItems = [
      { label: "Ingresos Totales:", value: `$${resumen.totalIngresos || 0}` },
      { label: "Gastos Totales:", value: `$${resumen.totalGastos || 0}` },
      {
        label: "Balance Neto:",
        value: `$${resumen.balanceNeto || 0}`,
        bold: true,
      },
    ];

    summaryItems.forEach((item) => {
      const xLabel = 50;
      const xValue = 350;

      if (item.bold) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      doc.text(item.label, xLabel, doc.y, { width: 300 });
      doc.text(item.value, xValue, doc.y - 20, {
        align: "right",
        width: 150,
      });
      doc.moveDown();
    });
  }

  doc.moveDown();

  // Income Details
  if (data.ingresos && data.ingresos.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").text("DETALLE DE INGRESOS", {
      underline: true,
    });
    doc.moveDown(0.5);

    trazarTablaIngresos(doc, data.ingresos);
    doc.moveDown();
  }

  // Expense Details
  if (data.gastos && data.gastos.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").text("DETALLE DE GASTOS", {
      underline: true,
    });
    doc.moveDown(0.5);

    trazarTablaGastos(doc, data.gastos);
    doc.moveDown();
  }

  // Footer
  doc.fontSize(8).text(
    "Este documento fue generado automáticamente por FitFlow Management System.",
    { align: "center", color: "#999" }
  );

  return doc;
}

/**
 * Generates an income transactions PDF report
 * @param {Array} ingresos - Income transactions
 * @param {Object} gym - Gym information
 * @returns {Stream} PDF document stream
 */
export function generarIngresoPDF(ingresos, gym) {
  const doc = new PDFDocument({
    bufferPages: true,
    margin: 40,
  });

  // Header
  doc.fontSize(22).font("Helvetica-Bold").text("REPORTE DE INGRESOS", {
    align: "center",
  });
  
  doc.fontSize(12).font("Helvetica").text(`Gimnasio: ${gym.nombre}`, {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(10).text(
    `Generado: ${formatDate(new Date())}`,
    { align: "right" }
  );

  // Divider
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  if (ingresos.length === 0) {
    doc.fontSize(11).text("No hay ingresos registrados en este período.", {
      align: "center",
      color: "#999",
    });
  } else {
    // Summary
    const totalIngresos = ingresos.reduce((sum, ing) => sum + (ing.monto || 0), 0);
    doc.fontSize(11).font("Helvetica").text("Total de Ingresos: ", {
      continued: true,
    });
    doc.font("Helvetica-Bold").text(`$${totalIngresos}`);
    doc.moveDown();

    trazarTablaIngresos(doc, ingresos);
  }

  // Footer
  doc.fontSize(8).text(
    "Reporte generado por FitFlow Management System.",
    { align: "center", color: "#999" }
  );

  return doc;
}

/**
 * Generates an expense transactions PDF report
 * @param {Array} gastos - Expense transactions
 * @param {Object} gym - Gym information
 * @returns {Stream} PDF document stream
 */
export function generarGastoPDF(gastos, gym) {
  const doc = new PDFDocument({
    bufferPages: true,
    margin: 40,
  });

  // Header
  doc.fontSize(22).font("Helvetica-Bold").text("REPORTE DE GASTOS", {
    align: "center",
  });
  
  doc.fontSize(12).font("Helvetica").text(`Gimnasio: ${gym.nombre}`, {
    align: "center",
  });
  doc.moveDown(0.5);
  doc.fontSize(10).text(
    `Generado: ${formatDate(new Date())}`,
    { align: "right" }
  );

  // Divider
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  if (gastos.length === 0) {
    doc.fontSize(11).text("No hay gastos registrados en este período.", {
      align: "center",
      color: "#999",
    });
  } else {
    // Summary
    const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
    doc.fontSize(11).font("Helvetica").text("Total de Gastos: ", {
      continued: true,
    });
    doc.font("Helvetica-Bold").text(`$${totalGastos}`);
    doc.moveDown();

    trazarTablaGastos(doc, gastos);
  }

  // Footer
  doc.fontSize(8).text(
    "Reporte generado por FitFlow Management System.",
    { align: "center", color: "#999" }
  );

  return doc;
}

/**
 * Helper function to draw income table
 */
function trazarTablaIngresos(doc, ingresos) {
  const columns = {
    fecha: { x: 50, width: 80 },
    concepto: { x: 140, width: 200 },
    categoria: { x: 360, width: 100 },
    monto: { x: 470, width: 85 },
  };

  // Header
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("FECHA", columns.fecha.x, doc.y);
  doc.text("CONCEPTO", columns.concepto.x, doc.y - 20);
  doc.text("CATEGORÍA", columns.categoria.x, doc.y - 40);
  doc.text("MONTO", columns.monto.x, doc.y - 60, { align: "right" });

  const headerY = doc.y;
  doc.moveTo(40, headerY + 5).lineTo(555, headerY + 5).stroke();
  doc.moveDown();

  // Rows
  doc.font("Helvetica").fontSize(9);
  ingresos.forEach((ingreso) => {
    const y = doc.y;
    const fecha = ingreso.fecha || ingreso.creado_en || "N/A";
    const concepto = ingreso.concepto || "Ingreso";
    const categoria = ingreso.categoria || "General";
    const monto = `$${(ingreso.monto || 0).toFixed(2)}`;

    doc.text(formatShortDate(fecha), columns.fecha.x, y, {
      width: columns.fecha.width,
    });
    doc.text(concepto.substring(0, 25), columns.concepto.x, y, {
      width: columns.concepto.width,
    });
    doc.text(categoria, columns.categoria.x, y, {
      width: columns.categoria.width,
    });
    doc.text(monto, columns.monto.x, y, {
      align: "right",
      width: columns.monto.width,
    });

    doc.moveDown();
  });
}

/**
 * Helper function to draw expense table
 */
function trazarTablaGastos(doc, gastos) {
  const columns = {
    fecha: { x: 50, width: 80 },
    concepto: { x: 140, width: 200 },
    categoria: { x: 360, width: 100 },
    monto: { x: 470, width: 85 },
  };

  // Header
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("FECHA", columns.fecha.x, doc.y);
  doc.text("CONCEPTO", columns.concepto.x, doc.y - 20);
  doc.text("CATEGORÍA", columns.categoria.x, doc.y - 40);
  doc.text("MONTO", columns.monto.x, doc.y - 60, { align: "right" });

  const headerY = doc.y;
  doc.moveTo(40, headerY + 5).lineTo(555, headerY + 5).stroke();
  doc.moveDown();

  // Rows
  doc.font("Helvetica").fontSize(9);
  gastos.forEach((gasto) => {
    const y = doc.y;
    const fecha = gasto.fecha || gasto.creado_en || "N/A";
    const concepto = gasto.concepto || "Gasto";
    const categoria = gasto.categoria || "General";
    const monto = `$${(gasto.monto || 0).toFixed(2)}`;

    doc.text(formatShortDate(fecha), columns.fecha.x, y, {
      width: columns.fecha.width,
    });
    doc.text(concepto.substring(0, 25), columns.concepto.x, y, {
      width: columns.concepto.width,
    });
    doc.text(categoria, columns.categoria.x, y, {
      width: columns.categoria.width,
    });
    doc.text(monto, columns.monto.x, y, {
      align: "right",
      width: columns.monto.width,
    });

    doc.moveDown();
  });
}

/**
 * Format date to short format (MM/DD/YYYY)
 */
function formatShortDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES");
}
