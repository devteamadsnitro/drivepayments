import * as React from "react";
import { AlertCircle, Check, FileText, Lock, Paperclip, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { documentRequirements } from "@/lib/options";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { DocumentMap } from "@/lib/types";
import { tr } from "@/lib/i18n";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DocumentPanel({
  documents,
  onAdd,
  onRemove,
  error,
  busy = false,
  onDismissError,
}: {
  documents: DocumentMap;
  onAdd: (slot: string, files: FileList | File[]) => void | Promise<void>;
  onRemove: (slot: string, documentId: string) => void;
  error: string | null;
  busy?: boolean;
  onDismissError: () => void;
}) {
  const [dragging, setDragging] = React.useState<string | null>(null);
  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const zoneInputRef = React.useRef<HTMLInputElement>(null);

  const totalFiles = Object.values(documents).reduce((sum, files) => sum + files.length, 0);
  const requiredSlots = documentRequirements.filter((doc) => doc.required);
  const requiredDone = requiredSlots.filter((doc) => (documents[doc.id]?.length ?? 0) > 0).length;

  const handleDrop = (slot: string, event: React.DragEvent) => {
    event.preventDefault();
    setDragging(null);
    if (event.dataTransfer.files?.length) onAdd(slot, event.dataTransfer.files);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(11,14,18,0.03)]">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
        <div>
          <h2 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
            <Paperclip className="size-3.5 text-ink-muted" aria-hidden="true" />
            Documentos
          </h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {tr("Disponible en los cuatro pasos", "Available in all four steps")}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide",
            requiredDone === requiredSlots.length
              ? "border-ok/30 bg-ok/8 text-ok"
              : "border-line bg-paper text-ink-muted",
          )}
        >
          {requiredDone}/{requiredSlots.length} obligatorios
        </span>
      </header>

      <div className="p-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => zoneInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              zoneInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging("__zone__");
          }}
          onDragLeave={() => setDragging(null)}
          onDrop={(event) => handleDrop("other", event)}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-5 text-center transition-colors",
            dragging === "__zone__"
              ? "border-ink bg-accent-soft/60"
              : "border-line-strong bg-paper/50",
          )}
        >
          <Upload className="size-4 text-ink-muted" aria-hidden="true" />
          <p className="mt-2 text-[12px] font-medium text-ink">{tr("Arrastra aquí tus archivos", "Drag your files here")}</p>
          <p className="mt-0.5 text-[10.5px] leading-snug text-ink-muted">
            {tr("o usa «Adjuntar» en cada documento", "or use “Attach” on each document")}
          </p>
          <p className="mt-2 font-mono text-[9px] tracking-[0.08em] text-ink-muted/80 uppercase">
            {tr("PDF máx.", "PDF max")} {siteConfig.submission.maxFileBytes / (1024 * 1024)} MB ·{" "}
            {tr("fotos optimizadas automáticamente", "photos optimized automatically")}
          </p>
          <input
            ref={zoneInputRef}
            type="file"
            multiple
            accept={siteConfig.submission.acceptedExtensions}
            className="sr-only"
            aria-label={tr("Añadir documentos adicionales", "Add additional documents")}
            onChange={(event) => {
              if (event.target.files?.length) onAdd("other", event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {busy ? (
          <p
            role="status"
            className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 text-[11px] text-ink-muted"
          >
            <span
              className="size-3 animate-spin rounded-full border-2 border-line border-t-ink"
              aria-hidden="true"
            />
            {tr("Optimizando imágenes…", "Optimizing images…")}
          </p>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-2.5 py-2 text-[11px] leading-snug text-danger"
          >
            <AlertCircle className="mt-[1px] size-3 shrink-0" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              aria-label={tr("Descartar aviso", "Dismiss notice")}
              className="text-danger/70 hover:text-danger"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}

        <ul className="mt-3 divide-y divide-line/70">
          {documentRequirements.map((requirement) => {
            const files = documents[requirement.id] ?? [];
            const complete = files.length > 0;
            const isDragging = dragging === requirement.id;
            return (
              <li
                key={requirement.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(requirement.id);
                }}
                onDragLeave={() => setDragging(null)}
                onDrop={(event) => handleDrop(requirement.id, event)}
                className={cn(
                  "py-2.5 transition-colors first:pt-0 last:pb-0",
                  isDragging && "bg-accent-soft/40",
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-full border",
                      complete
                        ? "border-ok bg-ok text-white"
                        : requirement.required
                          ? "border-line-strong bg-white text-transparent"
                          : "border-line bg-paper text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    <Check className="size-2.5" strokeWidth={4} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-1.5 text-[12px] leading-tight font-medium text-ink">
                      {requirement.label}
                      {requirement.required ? (
                        <span className="text-danger" aria-label={tr("obligatorio", "required")}>
                          *
                        </span>
                      ) : (
                        <span className="font-mono text-[8.5px] tracking-[0.1em] text-ink-muted/70 uppercase">
                          {tr("opcional", "optional")}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-ink-muted">{requirement.hint}</p>

                    {files.length > 0 ? (
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {files.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-1.5 rounded-md bg-paper/80 px-1.5 py-1"
                          >
                            <FileText className="size-3 shrink-0 text-ink-muted" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink">
                              {item.file.name}
                            </span>
                            <span className="shrink-0 font-mono text-[9px] text-ink-muted">
                              {formatBytes(item.file.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemove(requirement.id, item.id)}
                              aria-label={tr(`Quitar ${item.file.name}`, `Remove ${item.file.name}`)}
                              className="shrink-0 text-ink-muted transition-colors hover:text-danger"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => inputRefs.current[requirement.id]?.click()}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[10.5px] font-medium text-ink transition-colors hover:border-ink"
                      >
                        <Paperclip className="size-2.5" />
                        {complete ? tr("Añadir otro", "Add another") : tr("Adjuntar", "Attach")}
                      </button>
                      {requirement.conditional ? (
                        <span className="font-mono text-[8.5px] tracking-[0.06em] text-ink-muted/80 uppercase">
                          {requirement.conditional}
                        </span>
                      ) : null}
                      <input
                        ref={(node) => {
                          inputRefs.current[requirement.id] = node;
                        }}
                        type="file"
                        multiple
                        accept={siteConfig.submission.acceptedExtensions}
                        className="sr-only"
                        aria-label={tr(`Adjuntar ${requirement.label}`, `Attach ${requirement.label}`)}
                        onChange={(event) => {
                          if (event.target.files?.length) onAdd(requirement.id, event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-paper px-2.5 py-2">
          <Lock className="mt-[1px] size-3 shrink-0 text-ok" aria-hidden="true" />
          <p className="text-[10.5px] leading-snug text-ink-muted">
            {tr(
              "Los archivos se cifran en tu navegador antes de salir del dispositivo. Nunca se envían en claro ni por email abierto.",
              "Files are encrypted in your browser before they leave your device. They're never sent in plain text or by regular email.",
            )}
          </p>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3" aria-hidden="true" />
            {totalFiles}{" "}
            {totalFiles === 1 ? tr("archivo", "file") : tr("archivos", "files")}{" "}
            {tr("en el expediente", "in the application")}
          </span>
          <span className="font-mono text-[9px] tracking-[0.08em] uppercase">
            {tr("Cifrado en origen", "Encrypted at source")}
          </span>
        </div>
      </div>
    </section>
  );
}
