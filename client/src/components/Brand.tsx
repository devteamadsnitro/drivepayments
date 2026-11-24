import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const plate = variant === "light" ? "var(--color-accent)" : "currentColor";
  const glyph = variant === "light" ? "var(--color-ink)" : "var(--color-accent)";
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8.5" fill={plate} />
      <path
        d="M9.2 10.4 16.6 16l-7.4 5.6"
        stroke={glyph}
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.2 10.4 23.6 16l-7.4 5.6"
        stroke={glyph}
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <span
      className={cn(
        "text-[17px] leading-none font-semibold tracking-[-0.042em] sm:text-[18px]",
        tone === "ink" ? "text-ink" : "text-paper",
        className,
      )}
    >
      <span className={tone === "ink" ? "text-ink/55" : "text-paper/50"}>drive</span>
      payments
    </span>
  );
}

export function Logo({
  showProduct = true,
  className,
}: {
  showProduct?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8 text-ink" />
      <Wordmark />
      {showProduct ? (
        <>
          <span className="mx-0.5 hidden h-4 w-px bg-line-strong lg:block" />
          <span className="hidden font-mono text-[9px] leading-none tracking-[0.18em] whitespace-nowrap text-ink-muted uppercase lg:block">
            Merchant onboarding
          </span>
        </>
      ) : null}
    </span>
  );
}
