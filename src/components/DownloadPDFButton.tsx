import { Download } from "lucide-react";
import { exportSectionAsPDF } from "@/lib/pdfExport";
import { useState } from "react";

interface Props {
  sectionId?: string;
  filename?: string;
}

export function DownloadPDFButton({ sectionId = "root", filename = "dfms-report" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      await exportSectionAsPDF(sectionId, filename);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors no-print disabled:opacity-50"
      title="Download as PDF"
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? "Generating…" : "PDF"}
    </button>
  );
}
