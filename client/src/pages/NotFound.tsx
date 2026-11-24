import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/Brand";
import { tr } from "@/lib/i18n";

// Hosting answers this path with HTTP 404 while still serving the app.
const NOT_FOUND_PATH = "/404";

export default function NotFound() {
  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);

    // Full-page navigation: a client-side route change sends no request, so no 404 status.
    if (window.location.pathname.replace(/\/$/, "") !== NOT_FOUND_PATH) {
      window.location.replace(NOT_FOUND_PATH);
    }

    return () => robots.remove();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <Logo showProduct={false} />
        <p className="eyebrow mt-10">Error 404</p>
        <h1 className="mt-2 text-[clamp(2rem,6vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink">
          {tr("Esta página no existe.", "This page doesn't exist.")}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          {tr(
            "Puede que el enlace haya cambiado o que el expediente ya no esté disponible. Vuelve al formulario de alta para empezar de nuevo.",
            "The link may have changed or the application may no longer be available. Go back to the application form to start again.",
          )}
        </p>
        <a
          href="/"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          {tr("Ir al formulario de alta", "Go to the application form")}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
