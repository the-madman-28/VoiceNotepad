import jsPDF from "jspdf";

export function exportToPDF(text) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight() - margin * 2;

  doc.setFont("courier", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(text || "", pageWidth);

  let y = margin;
  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight + margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += 14;
  }

  doc.save("notes.pdf");
}
