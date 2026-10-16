import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import { DAY5_MCQS } from "./create-day5-assignment.mjs";

function buildPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  const brandDark = [17, 17, 17];
  const brandOrange = [240, 124, 39];
  const slateGray = [100, 116, 139];

  // Header Banner
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFillColor(...brandOrange);
  doc.rect(0, 22, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SUPER 60 // SKILL UP 2026", margin, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(210, 210, 210);
  doc.text("DAY 5 : ADVANCED CLI & PROJECT • 20 ADVANCED C++ MCQS", margin, 17);

  doc.setFontSize(8);
  doc.text("Max Marks: 100 • Due Date: 30 Oct 2026", pageWidth - margin, 17, { align: "right" });

  y = 30;

  // Instructions Box
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...brandDark);
  doc.text("INSTRUCTIONS: Choose the single correct answer from the four options for each question.", margin + 4, y + 6);

  y += 16;

  for (const q of DAY5_MCQS) {
    // Check if new page needed
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...brandDark);

    const qTitle = `Q${q.num}. `;
    const promptLines = doc.splitTextToSize(q.prompt, pageWidth - margin * 2 - 10);

    doc.text(qTitle, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(promptLines, margin + 7, y);

    y += promptLines.length * 4.2 + 2;

    const letters = ["A", "B", "C", "D"];
    q.options.forEach((opt, idx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...brandOrange);
      doc.text(`${letters[idx]}.`, margin + 5, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const optLines = doc.splitTextToSize(opt, pageWidth - margin * 2 - 18);
      doc.text(optLines, margin + 11, y);

      y += optLines.length * 3.8 + 1.2;
    });

    y += 3.5;
  }

  // Footer for all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...slateGray);
    doc.text("Super 60 Systems & Engineering Excellence • Skill Up 2026", margin, pageHeight - 6);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);
  }

  const outPath = path.resolve("public/assignments/Day_5_Advanced_CLI_and_Project_20_MCQ_Assignment.pdf");
  const buffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved PDF to: ${outPath}`);
}

buildPdf();
