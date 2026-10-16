import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FeedbackPdfExportItem {
  id: string;
  rating: number;
  comment: string;
  category?: string;
  isAnonymous?: boolean;
  createdAt: string | Date;
  student?: {
    name?: string | null;
    rollNumber?: string | null;
    email?: string | null;
    branch?: string | null;
    college?: string | null;
  } | null;
  mentor?: {
    name?: string | null;
    email?: string | null;
  } | null;
  lab?: {
    name?: string | null;
  } | null;
  labName?: string | null;
}

export interface FeedbackPdfFilterOptions {
  labName?: string;
  dateStr?: string;
  ratingFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  workshopTitle?: string;
  userRole?: "ADMIN" | "MENTOR";
  userName?: string;
}

export function exportFeedbackToPdf(
  feedbacks: FeedbackPdfExportItem[],
  options: FeedbackPdfFilterOptions = {}
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const brandDark = [17, 17, 17] as const;
  const brandOrange = [240, 124, 39] as const;
  const slateGray = [100, 116, 139] as const;
  const lightBg = [248, 249, 250] as const;

  // 1. Top Header Banner
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, pageWidth, 24, "F");

  // Orange accent strip
  doc.setFillColor(...brandOrange);
  doc.rect(0, 24, pageWidth, 2.5, "F");

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SUPER 60 // SKILL UP 2026", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 200, 200);
  doc.text(
    options.workshopTitle
      ? `${options.workshopTitle.toUpperCase()} • FACULTY & MENTOR APPRAISAL AUDIT`
      : "FACULTY & MENTOR APPRAISAL AUDIT REPORT",
    margin,
    18
  );

  const nowIST = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  doc.setFontSize(8);
  doc.text(`Generated: ${nowIST} IST`, pageWidth - margin, 18, { align: "right" });

  let y = 33;

  // 2. Active Filter Specifications Banner
  doc.setFillColor(...lightBg);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...brandDark);
  doc.text("ACTIVE REPORT FILTERS & AUDIT CRITERIA", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  const labLabel = options.labName || "All Laboratory Tracks";
  const dateLabel = options.dateStr || "All Session Dates";
  const ratingLabel = options.ratingFilter
    ? options.ratingFilter === "5"
      ? "5 Stars Only (★★★★★)"
      : options.ratingFilter === "4"
      ? "4 Stars Only (★★★★☆)"
      : "3 Stars or Below (★★★☆☆)"
    : "All Ratings (1 - 5 Stars)";
  const categoryLabel = options.categoryFilter || "All Categories";
  const searchLabel = options.searchTerm ? `"${options.searchTerm}"` : "None";

  doc.text(`• Lab Track: ${labLabel}`, col1X, y + 12);
  doc.text(`• Session Date: ${dateLabel}`, col1X, y + 17);

  doc.text(`• Rating Filter: ${ratingLabel}`, col2X, y + 12);
  doc.text(`• Category: ${categoryLabel}`, col2X, y + 17);

  doc.text(`• Search Term: ${searchLabel}`, col3X, y + 12);
  doc.text(`• Exported By: ${options.userName || options.userRole || "Admin/Mentor"}`, col3X, y + 17);

  y += 27;

  // 3. Executive KPI Summary Cards
  const totalCount = feedbacks.length;
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / totalCount).toFixed(2)
      : "0.00";

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach((f) => {
    const r = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
    dist[r] = (dist[r] || 0) + 1;
  });

  const satisfactionRate =
    totalCount > 0 ? Math.round(((dist[4] + dist[5]) / totalCount) * 100) : 100;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 16;

  const kpis: {
    label: string;
    value: string;
    color: [number, number, number];
    smaller?: boolean;
  }[] = [
    { label: "FILTERED SUBMISSIONS", value: `${totalCount} Reviews`, color: [17, 17, 17] },
    { label: "FILTERED AVERAGE", value: `★ ${avgRating} / 5.0`, color: [240, 124, 39] },
    { label: "SATISFACTION RATE", value: `${satisfactionRate}%`, color: [16, 185, 129] },
    {
      label: "RATING BREAKDOWN",
      value: `5★:${dist[5]} | 4★:${dist[4]} | ≤3★:${dist[1] + dist[2] + dist[3]}`,
      color: [100, 116, 139],
      smaller: true,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(...lightBg);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateGray);
    doc.text(kpi.label, cardX + 3, y + 5);

    doc.setFontSize(kpi.smaller ? 8 : 10.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, cardX + 3, y + 12);
  });

  y += cardHeight + 6;

  // 4. Feedback Detailed Table (AutoTable)
  const tableRows = feedbacks.map((f, index) => {
    const createdAt = new Date(f.createdAt);
    const dateFormatted = createdAt.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = createdAt.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isAnon = Boolean(f.isAnonymous && options.userRole !== "ADMIN");
    const studentName = isAnon
      ? "Anonymous Student"
      : f.student?.name || "Student";
    const studentMeta = isAnon
      ? "[Protected Identity]"
      : f.student?.rollNumber || f.student?.email || "—";

    const labName = f.lab?.name || f.labName || "General";
    const mentorName = f.mentor?.name || "Lead Mentor";
    const stars = `${"★".repeat(f.rating || 5)}${"☆".repeat(5 - (f.rating || 5))} (${f.rating}/5)`;
    const category = f.category || "GENERAL";
    const comment = f.comment || "—";

    return [
      String(index + 1),
      `${dateFormatted}\n${timeFormatted}`,
      `${studentName}\n${studentMeta}`,
      labName,
      mentorName,
      stars,
      category,
      comment,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [
      [
        "#",
        "Date / Time",
        "Student Candidate",
        "Laboratory",
        "Faculty / Mentor",
        "Rating",
        "Category",
        "Appraisal Review Comment",
      ],
    ],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [17, 17, 17],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 2.5,
    },
    bodyStyles: {
      textColor: [30, 30, 30],
      fontSize: 7,
      cellPadding: 2.5,
      valign: "top",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" }, // #
      1: { cellWidth: 22 }, // Date/Time
      2: { cellWidth: 32 }, // Student
      3: { cellWidth: 20 }, // Lab
      4: { cellWidth: 25 }, // Mentor
      5: { cellWidth: 22 }, // Rating
      6: { cellWidth: 18 }, // Category
      7: { cellWidth: "auto" }, // Comment
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNumber = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);

      // Left footer
      doc.text(
        "Super 60 Systems & Engineering Excellence • Confidential Feedback Audit",
        margin,
        pageHeight - 7
      );

      // Right footer
      doc.text(
        `Page ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 7,
        { align: "right" }
      );

      // Footer divider line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    },
  });

  // 5. Clean Filename
  const cleanLab = (options.labName || "all_labs").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const cleanDate = (options.dateStr || "all_dates").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const filename = `skillup_feedback_${cleanLab}_${cleanDate}.pdf`;

  // Trigger download in browser
  doc.save(filename);
}
