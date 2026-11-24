import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/crm/api";
import type { Option } from "@/lib/options";

/** Traduce el valor guardado en el formulario a su etiqueta legible. */
export function optionLabel(options: Option[], value: string | undefined | null): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

export const STATUS_META: Record<LeadStatus, { label: string; className: string; dot: string }> = {
  new: { label: "Nueva", className: "border-accent-deep/45 bg-accent-soft text-ink", dot: "bg-accent-deep" },
  review: {
    label: "En revisión",
    className: "border-amber-300/70 bg-amber-50 text-amber-950",
    dot: "bg-amber-500",
  },
  docs: {
    label: "Faltan documentos",
    className: "border-orange-300/70 bg-orange-50 text-orange-950",
    dot: "bg-orange-500",
  },
  approved: {
    label: "Aprobada",
    className: "border-emerald-300/70 bg-emerald-50 text-emerald-950",
    dot: "bg-emerald-600",
  },
  declined: {
    label: "Rechazada",
    className: "border-rose-300/70 bg-rose-50 text-rose-950",
    dot: "bg-rose-500",
  },
  archived: {
    label: "Archivada",
    className: "border-line bg-paper-deep text-ink-muted",
    dot: "bg-ink-muted/50",
  },
};

export function StatusPill({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        meta.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DataField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <MonoLabel>{label}</MonoLabel>
      <div
        className={cn(
          "mt-1 text-[13px] leading-snug break-words text-ink",
          mono && "font-mono text-[12.5px]",
        )}
      >
        {value || <span className="text-ink-muted/60">—</span>}
      </div>
    </div>
  );
}

export function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[10px] tracking-[0.18em] text-accent-deep">{index}</span>
      <span className="h-px w-4 bg-line-strong" />
      <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">{children}</h3>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded bg-line/70", className)} />;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return dateTimeFormatter.format(new Date(value));
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function relativeTime(value: string | Date): string {
  const date = new Date(value).getTime();
  const diff = Date.now() - date;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return formatDate(value);
}
