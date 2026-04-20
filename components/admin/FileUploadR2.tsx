"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  fileType: string;
  fileSize: string;
}

interface FileUploadR2Props {
  folder: string;
  accept?: string;
  maxSizeMB?: number;
  onUploaded: (result: UploadResult) => void;
  label?: string;
}

export function FileUploadR2({
  folder,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.webp",
  maxSizeMB = 100,
  onUploaded,
  label = "Subir archivo",
}: FileUploadR2Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo excede ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al subir archivo");
      }

      onUploaded(json.data);
      toast.success("Archivo subido");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Error al subir");
      setFileName(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {fileName && !isUploading ? (
        <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate flex-1">{fileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFileName(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {label}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        Máximo {maxSizeMB}MB. PDF, DOC, XLS, JPG, PNG.
      </p>
    </div>
  );
}
