
import html2pdf from "html2pdf.js";

export const exportEconomiaPDF = (element, filename) => {
  if (!element) return;
  html2pdf()
    .from(element)
    .set({
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .save();
};