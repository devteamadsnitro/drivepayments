import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepId } from "@/lib/types";
import { tr } from "@/lib/i18n";

const getSteps = (): { id: StepId; label: string; short: string }[] => [
  { id: 1, label: tr("El negocio", "Business"), short: tr("Negocio", "Business") },
  { id: 2, label: tr("Los titulares", "Owners"), short: tr("Titulares", "Owners") },
  { id: 3, label: tr("La cuenta", "Bank account"), short: tr("Banco", "Bank") },
  { id: 4, label: tr("Procesamiento", "Processing"), short: tr("Proceso", "Processing") },
];

export function Progress({
  step,
  maxVisited,
  onNavigate,
}: {
  step: StepId;
  maxVisited: StepId;
  onNavigate: (step: StepId) => void;
}) {
  const steps = getSteps();
  const pct = Math.round(((step - 1) / (steps.length - 1)) * 100);

  return (
    <div className="rounded-2xl border border-line bg-white/80 px-4 py-4 shadow-[0_1px_2px_rgba(11,14,18,0.03)] backdrop-blur sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase">
          {tr("Paso", "Step")} {step} {tr("de", "of")} {steps.length} — {steps[step - 1].label}
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
          {pct}% {tr("completado", "complete")}
        </span>
      </div>

      <div className="relative mt-3.5">
        <div
          className="absolute top-[9px] left-[10px] h-[2px] bg-line"
          style={{ right: "calc(25% + 8px)" }}
          aria-hidden="true"
        >
          <div
            className="h-full bg-ink transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ol className="relative grid grid-cols-4 gap-2">
          {steps.map((item) => {
            const done = item.id < step;
            const current = item.id === step;
            const reachable = item.id <= maxVisited;
            return (
              <li key={item.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && onNavigate(item.id)}
                  aria-current={current ? "step" : undefined}
                  aria-label={tr(`Ir al paso ${item.id}: ${item.label}`, `Go to step ${item.id}: ${item.label}`)}
                  className={cn(
                    "flex size-[20px] items-center justify-center rounded-full border transition-all duration-300",
                    done && "border-ink bg-ink text-accent",
                    current && "border-ink bg-accent text-ink ring-4 ring-accent/25",
                    !done && !current && "border-line-strong bg-white text-transparent",
                    reachable ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  {done ? (
                    <Check className="size-2.5" strokeWidth={4} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </button>
                <span
                  className={cn(
                    "truncate text-[11px] leading-tight transition-colors sm:text-[12.5px]",
                    current ? "font-semibold text-ink" : done ? "text-ink/70" : "text-ink-muted/70",
                  )}
                >
                  <span className="mr-1 hidden font-mono text-[10px] text-ink-muted/70 sm:inline">
                    0{item.id}
                  </span>
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
