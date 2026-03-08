import { Download } from "lucide-react";

interface Props {
  sectionId?: string;
  filename?: string;
}

export function DownloadPDFButton({ sectionId, filename = "dfms-report" }: Props) {
  function handleDownload() {
    // Open print dialog with only the relevant section visible
    const style = document.createElement("style");
    style.id = "__pdf_print_style";
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #${sectionId ?? "root"} { display: block !important; }
        .no-print { display: none !important; }
        @page { margin: 20mm; size: A4; }
      }
    `;
    document.head.appendChild(style);
    document.title = filename;
    window.print();
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors no-print"
      title="Download as PDF"
    >
      <Download className="w-3.5 h-3.5" />
      PDF
    </button>
  );
}
