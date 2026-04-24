import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

/**
 * Captures a DOM section and exports it as a multi-page A4 PDF.
 * This replaces the old `window.print()` hack which produced blank pages
 * because Lovable's preview iframe blocks the print pipeline.
 */
export async function exportSectionAsPDF(sectionId: string, filename: string) {
  const el = document.getElementById(sectionId);
  if (!el) {
    toast.error(`Section "${sectionId}" not found`);
    return;
  }

  const loadingToast = toast.loading("Generating PDF…");

  try {
    // Make sure all images are loaded before snapshot
    const imgs = Array.from(el.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            })
      )
    );

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: el.scrollWidth,
      onclone: (doc) => {
        // Hide controls that shouldn't appear in PDF
        doc.querySelectorAll(".no-print").forEach((n) => ((n as HTMLElement).style.display = "none"));
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    // Footer
    const total = pdf.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(
        `DFMS Dashboard · ${new Date().toLocaleString()} · Page ${i} of ${total}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    }

    pdf.save(`${filename}-${Date.now()}.pdf`);
    toast.success("PDF downloaded", { id: loadingToast });
  } catch (e: any) {
    console.error(e);
    toast.error(`PDF export failed: ${e.message || e}`, { id: loadingToast });
  }
}
