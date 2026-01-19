"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD COMPONENT
// Componente de upload con drag & drop y validación visual
// - Warning cuando archivo es grande (>80% del límite)
// - Error cuando excede el límite
// - Validación de tipos de archivo
// - Barra visual de tamaño
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useMemo } from "react";
import { Upload, X, FileText, Image, File, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // en MB
  multiple?: boolean;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  preview?: string | null;
  className?: string;
  disabled?: boolean;
}

// Tipos de archivo permitidos por categoría
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

// Extensiones amigables para mostrar al usuario
const EXTENSION_LABELS: Record<string, string> = {
  ".pdf": "PDF",
  ".doc": "Word",
  ".docx": "Word",
  ".xls": "Excel",
  ".xlsx": "Excel",
  ".ppt": "PowerPoint",
  ".pptx": "PowerPoint",
  ".jpg": "Imagen",
  ".jpeg": "Imagen",
  ".png": "Imagen",
  ".gif": "Imagen",
  ".webp": "Imagen",
  ".svg": "SVG",
};

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getAcceptedExtensions(accept: string): string[] {
  if (accept === "*") return [];
  return accept.split(",").map(ext => ext.trim().toLowerCase());
}

function isValidFileType(file: File, accept: string): boolean {
  if (accept === "*") return true;

  const acceptedExtensions = getAcceptedExtensions(accept);
  const fileName = file.name.toLowerCase();
  const fileExtension = "." + fileName.split(".").pop();

  // Verificar por extensión
  if (acceptedExtensions.some(ext => ext === fileExtension || ext === file.type)) {
    return true;
  }

  // Verificar por MIME type si se especificó
  if (acceptedExtensions.includes(file.type)) {
    return true;
  }

  return false;
}

type FileStatus = "valid" | "warning" | "error";

interface FileValidation {
  status: FileStatus;
  message: string;
  sizePercent: number;
}

export function FileUpload({
  accept = "*",
  maxSize = 50, // 50MB default
  multiple = false,
  value,
  onChange,
  preview,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<FileValidation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calcular extensiones permitidas para mostrar al usuario
  const acceptedFormats = useMemo(() => {
    if (accept === "*") return "Todos los archivos";
    const extensions = getAcceptedExtensions(accept);
    const labels = extensions
      .map(ext => EXTENSION_LABELS[ext] || ext.replace(".", "").toUpperCase())
      .filter((v, i, a) => a.indexOf(v) === i); // Únicos
    return labels.join(", ");
  }, [accept]);

  const validateFile = useCallback((file: File): FileValidation => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    const sizePercent = (file.size / maxSizeBytes) * 100;

    // Validar tipo de archivo
    if (!isValidFileType(file, accept)) {
      return {
        status: "error",
        message: `Tipo de archivo no permitido. Se permiten: ${acceptedFormats}`,
        sizePercent: Math.min(sizePercent, 100),
      };
    }

    // Validar tamaño - excede límite
    if (file.size > maxSizeBytes) {
      return {
        status: "error",
        message: `El archivo (${formatFileSize(file.size)}) excede el límite de ${maxSize}MB`,
        sizePercent: 100,
      };
    }

    // Warning si es mayor al 80% del límite
    if (sizePercent > 80) {
      return {
        status: "warning",
        message: `Archivo grande (${formatFileSize(file.size)} de ${maxSize}MB máx.)`,
        sizePercent,
      };
    }

    // Válido
    return {
      status: "valid",
      message: `${formatFileSize(file.size)} de ${maxSize}MB máx.`,
      sizePercent,
    };
  }, [maxSize, accept, acceptedFormats]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((fileList: FileList | File[]): File[] => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of files) {
      const validation = validateFile(file);

      if (validation.status === "error") {
        setValidationResult(validation);
        continue;
      }

      setValidationResult(validation);
      validFiles.push(file);
    }

    return validFiles;
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = processFiles(e.dataTransfer.files);
    if (files.length > 0) {
      onChange?.(multiple ? files : files[0]);
    }
  }, [disabled, multiple, onChange, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = processFiles(fileList);
    if (files.length > 0) {
      onChange?.(multiple ? files : files[0]);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [multiple, onChange, processFiles]);

  const handleRemove = useCallback(() => {
    onChange?.(null);
    setValidationResult(null);
  }, [onChange]);

  const files = value ? (Array.isArray(value) ? value : [value]) : [];
  const hasFiles = files.length > 0;

  // Colores según estado
  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case "error": return "text-destructive";
      case "warning": return "text-amber-500";
      case "valid": return "text-emerald-500";
    }
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "error": return AlertCircle;
      case "warning": return AlertTriangle;
      case "valid": return CheckCircle;
    }
  };

  const getProgressColor = (status: FileStatus) => {
    switch (status) {
      case "error": return "bg-destructive";
      case "warning": return "bg-amber-500";
      case "valid": return "bg-emerald-500";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onClick={() => !disabled && !hasFiles && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : hasFiles
            ? "border-muted bg-muted/30"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {hasFiles ? (
          <div className="w-full space-y-3">
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type);
              const validation = validateFile(file);
              const StatusIcon = getStatusIcon(validation.status);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className={cn("flex items-center gap-1.5 text-xs", getStatusColor(validation.status))}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{validation.message}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Barra de tamaño visual */}
                  <div className="px-3">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all rounded-full", getProgressColor(validation.status))}
                        style={{ width: `${Math.min(validation.sizePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? "Agregar más archivos" : "Cambiar archivo"}
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos: {acceptedFormats}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: {maxSize}MB
            </p>
          </>
        )}
      </div>

      {/* Preview for images - using img for base64 data URLs */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error de validación (cuando no hay archivo seleccionado pero hubo intento fallido) */}
      {!hasFiles && validationResult?.status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{validationResult.message}</p>
        </div>
      )}
    </div>
  );
}
