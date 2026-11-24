import { setLang, useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "es", label: "ES", name: "Español" },
  { value: "en", label: "EN", name: "English" },
];

/** Selector de idioma ES / EN (arriba a la derecha de la cabecera). */
export function LanguageSwitch({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div
      role="group"
      aria-label={lang === "en" ? "Language" : "Idioma"}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-line bg-white/60 p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            title={option.name}
            aria-label={option.name}
            aria-pressed={active}
            onClick={() => setLang(option.value)}
            className={cn(
              "h-7 min-w-8 rounded-full px-2 font-mono text-[10.5px] font-semibold tracking-[0.08em] transition-colors",
              active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
