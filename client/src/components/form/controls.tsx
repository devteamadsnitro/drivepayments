import * as React from "react";
import { AlertCircle, Check, ChevronDown, Globe, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Estructuras                                                         */
/* ------------------------------------------------------------------ */

export function CornerTicks({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <span className="absolute top-3 left-3 size-2 border-t border-l border-line-strong/80" />
      <span className="absolute top-3 right-3 size-2 border-t border-r border-line-strong/80" />
      <span className="absolute bottom-3 left-3 size-2 border-b border-l border-line-strong/80" />
      <span className="absolute right-3 bottom-3 size-2 border-r border-b border-line-strong/80" />
    </span>
  );
}

export function FormSection({
  index,
  title,
  description,
  children,
  className,
}: {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-line pt-6 first:border-t-0 first:pt-0", className)}>
      <header className="mb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent-deep">{index}</span>
          <span className="h-px w-6 bg-line-strong" />
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        </div>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function Grid({
  children,
  className,
  cols = 2,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-5 gap-y-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
  labelAddon,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  labelAddon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] leading-snug font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {labelAddon}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1 text-[11.5px] leading-snug text-danger"
        >
          <AlertCircle className="mt-[1px] size-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] leading-snug text-ink-muted/90">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

type BaseProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "className"> & {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
  containerClassName?: string;
  prefix?: string;
  suffix?: string;
};

export function TextInput({
  value,
  onChange,
  error,
  className,
  containerClassName,
  prefix,
  suffix,
  id,
  ...props
}: BaseProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      {prefix ? (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-[12px] text-ink-muted">
          {prefix}
        </span>
      ) : null}
      <input
        {...props}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn("field-input h-11", prefix && "pl-8", suffix && "pr-14", className)}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[10px] tracking-wide text-ink-muted uppercase">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  error,
  id,
  rows = 4,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  id?: string;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className="field-input resize-y leading-relaxed"
      />
      {maxLength ? (
        <span className="pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] text-ink-muted/80">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = tr("Selecciona…", "Select…"),
  error,
  id,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={cn("field-input h-11", !value && "text-ink-muted/70")}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-ink">
          {option.label}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Selectores                                                          */
/* ------------------------------------------------------------------ */

export function Segmented({
  id,
  value,
  onChange,
  options,
  error,
  size = "default",
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint?: string }[];
  error?: boolean;
  size?: "default" | "compact";
  className?: string;
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      tabIndex={id ? -1 : undefined}
      aria-invalid={error ? true : undefined}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl border text-[13.5px] font-medium transition-all duration-150",
              size === "compact" ? "h-9 px-3" : "min-h-11 px-3.5 py-2",
              active
                ? "border-ink bg-ink text-paper shadow-[0_2px_8px_-4px_rgba(11,14,18,0.5)]"
                : "border-line bg-white text-ink hover:border-line-strong hover:bg-paper/60",
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border transition-colors",
                active ? "border-accent bg-accent text-ink" : "border-line-strong/70 text-transparent",
              )}
              aria-hidden="true"
            >
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
            <span>{option.label}</span>
            {option.hint ? (
              <span
                className={cn(
                  "hidden font-mono text-[10px] tracking-wide uppercase sm:inline",
                  active ? "text-paper/55" : "text-ink-muted/70",
                )}
              >
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({
  id,
  value,
  onChange,
  error,
  labels = [tr("Sí", "Yes"), "No"],
}: {
  id?: string;
  value: string;
  onChange: (value: "yes" | "no") => void;
  error?: boolean;
  labels?: [string, string];
}) {
  return (
    <Segmented
      id={id}
      value={value}
      onChange={(next) => onChange(next as "yes" | "no")}
      error={error}
      size="compact"
      options={[
        { value: "yes", label: labels[0] },
        { value: "no", label: labels[1] },
      ]}
    />
  );
}

export function Chips({
  id,
  values,
  onToggle,
  options,
  error,
}: {
  id?: string;
  values: string[];
  onToggle: (value: string) => void;
  options: { value: string; label: string }[];
  error?: boolean;
}) {
  return (
    <div
      id={id}
      role="group"
      tabIndex={id ? -1 : undefined}
      aria-invalid={error ? true : undefined}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.value)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-[13.5px] font-medium transition-all duration-150",
              active
                ? "border-ink bg-accent-soft text-ink"
                : "border-line bg-white text-ink hover:border-line-strong hover:bg-paper/60",
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-[5px] border",
                active ? "border-ink bg-ink text-accent" : "border-line-strong/70 text-transparent",
              )}
              aria-hidden="true"
            >
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Combobox con buscador                                               */
/* ------------------------------------------------------------------ */

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = tr("Buscar…", "Search…"),
  error,
  emptyMessage = tr("Sin resultados. Prueba con otra palabra.", "No results. Try another word."),
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  emptyMessage?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = React.useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((option) => normalize(option.label).includes(q));
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  React.useEffect(() => {
    setHighlight(0);
  }, [query]);

  const commit = (index: number) => {
    const option = filtered[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          autoComplete="off"
          value={open ? query : (selected?.label ?? "")}
          placeholder={selected ? selected.label : placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setHighlight((current) => Math.min(current + 1, filtered.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter") {
              if (open) {
                event.preventDefault();
                commit(highlight);
              }
            } else if (event.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          className={cn("field-input h-11 pr-9", open && query && "text-ink")}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </div>

      {open ? (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white p-1 shadow-lift"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-[13px] text-ink-muted">{emptyMessage}</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors",
                    index === highlight ? "bg-paper text-ink" : "text-ink/85",
                    option.value === value && "font-medium",
                  )}
                >
                  {option.label}
                  {option.value === value ? <Check className="size-3.5 text-ok" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Antigüedad, importes y listas repetibles                            */
/* ------------------------------------------------------------------ */

export function YearsMonths({
  yearsId,
  monthsId,
  years,
  months,
  onYears,
  onMonths,
  yearsError,
  monthsError,
  yearsPlaceholder = "0",
}: {
  yearsId: string;
  monthsId: string;
  years: string;
  months: string;
  onYears: (value: string) => void;
  onMonths: (value: string) => void;
  yearsError?: string;
  monthsError?: string;
  yearsPlaceholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-3">
        <div className="relative w-full max-w-[132px]">
          <input
            id={yearsId}
            inputMode="numeric"
            placeholder={yearsPlaceholder}
            value={years}
            onChange={(event) => onYears(event.target.value.replace(/\D/g, "").slice(0, 2))}
            aria-invalid={yearsError ? true : undefined}
            aria-describedby={yearsError ? `${yearsId}-error` : undefined}
            className="field-input h-11 pr-12"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[10px] tracking-wide text-ink-muted uppercase">
            {tr("años", "years")}
          </span>
        </div>
        <div className="relative w-full max-w-[132px]">
          <input
            id={monthsId}
            inputMode="numeric"
            placeholder="0"
            value={months}
            onChange={(event) => onMonths(event.target.value.replace(/\D/g, "").slice(0, 2))}
            aria-invalid={monthsError ? true : undefined}
            aria-describedby={monthsError ? `${monthsId}-error` : undefined}
            className="field-input h-11 pr-14"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[10px] tracking-wide text-ink-muted uppercase">
            {tr("meses", "months")}
          </span>
        </div>
      </div>
      {yearsError ? (
        <p
          id={`${yearsId}-error`}
          role="alert"
          className="flex items-start gap-1 text-[11.5px] text-danger"
        >
          <AlertCircle className="mt-[1px] size-3 shrink-0" aria-hidden="true" />
          {yearsError}
        </p>
      ) : null}
      {monthsError ? (
        <p
          id={`${monthsId}-error`}
          role="alert"
          className="flex items-start gap-1 text-[11.5px] text-danger"
        >
          <AlertCircle className="mt-[1px] size-3 shrink-0" aria-hidden="true" />
          {monthsError}
        </p>
      ) : null}
    </div>
  );
}

export function WebsiteList({
  values,
  onChange,
  errors,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  errors: Record<number, string | undefined>;
}) {
  const update = (index: number, next: string) => {
    onChange(values.map((value, i) => (i === index ? next : value)));
  };

  return (
    <div className="flex flex-col gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-muted/70"
                aria-hidden="true"
              />
              <input
                id={`business.websites.${index}`}
                value={value}
                placeholder={tr("midominio.com", "mydomain.com")}
                onChange={(event) => update(index, event.target.value)}
                aria-invalid={errors[index] ? true : undefined}
                className="field-input h-11 pl-9"
              />
            </div>
            {values.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-danger/40 hover:text-danger"
                aria-label={tr(`Eliminar web ${index + 1}`, `Remove website ${index + 1}`)}
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : null}
          </div>
          {errors[index] ? (
            <p role="alert" className="text-[11.5px] text-danger">
              {errors[index]}
            </p>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-ink hover:bg-white"
      >
        <Plus className="size-3" />
        {tr("Añadir otra web", "Add another website")}
      </button>
    </div>
  );
}

export function CheckboxLine({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-colors",
          error ? "border-danger/40 bg-danger-soft/40" : "border-line hover:border-line-strong",
        )}
      >
        <span className="relative mt-0.5 flex size-[18px] shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer size-[18px] appearance-none rounded-[5px] border border-line-strong bg-white transition-colors checked:border-ink checked:bg-ink"
          />
          <Check
            className="pointer-events-none absolute size-3 text-accent opacity-0 peer-checked:opacity-100"
            strokeWidth={3.5}
            aria-hidden="true"
          />
        </span>
        <span className="text-[13px] leading-relaxed text-ink/85">{children}</span>
      </label>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1 text-[11.5px] text-danger"
        >
          <AlertCircle className="mt-[1px] size-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
