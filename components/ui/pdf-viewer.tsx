"use client";

import { useState, lazy, Suspense } from "react";
import { FileText, Download, Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lazy load the PDF viewer (uses WebAssembly)
const EmbedPdfViewer = lazy(async () => {
  const mod = await import("@embedpdf/react-pdf-viewer");
  return { default: mod.PDFViewer };
});

interface PdfViewerButtonProps {
  url: string;
  title?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function PdfViewerButton({
  url,
  title = "Documento",
  variant = "outline",
  size = "sm",
  children,
}: PdfViewerButtonProps) {
  const [open, setOpen] = useState(false);

  const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf");

  // Non-PDFs just download
  if (!isPdf) {
    return (
      <Button variant={variant} size={size} asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children || (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Descargar
            </>
          )}
        </a>
      </Button>
    );
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children || (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Ver PDF
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-base truncate pr-4">{title}</DialogTitle>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Maximize2 className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={url} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <EmbedPdfViewer
                config={{
                  src: url,
                  theme: { preference: "system" },
                }}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
