import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/Brand";

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
          Esta página no existe.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          Puede que el enlace haya cambiado o que el expediente ya no esté disponible. Vuelve al
          formulario de alta para empezar de nuevo.
        </p>
        <a
          href="/"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          Ir al formulario de alta
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
