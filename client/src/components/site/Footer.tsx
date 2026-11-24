import { Lock, Send } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Brand";
import { siteConfig } from "@/config/site";
import { tr } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <LogoMark variant="light" className="size-8" />
              <Wordmark tone="paper" />
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-paper/60">
              {tr(
                "Alta de comercios para negocios que quieren cobrar sin fricción. Tramitamos tu expediente con el procesador y te acompañamos hasta la primera transacción.",
                "Merchant onboarding for businesses that want frictionless payments. We handle your application with the processor and stay with you through your first transaction.",
              )}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-paper/70 uppercase">
              <Lock className="size-3 text-accent" />
              {tr("Cifrado AES-256-GCM", "AES-256-GCM encryption")}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.16em] text-paper/40 uppercase">
              {tr("Contacto", "Contact")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-paper/75">
              <li>
                <a
                  className="link-underline decoration-paper/30 hover:decoration-paper"
                  href={`mailto:${siteConfig.contact.email}`}
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1.5 link-underline decoration-paper/30 hover:decoration-paper"
                  href={siteConfig.contact.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Send className="size-3.5" />
                  Telegram {siteConfig.contact.telegramHandle}
                </a>
              </li>
              <li className="text-paper/50">{siteConfig.contact.hours}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.16em] text-paper/40 uppercase">
              Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-paper/75">
              <li>
                <a className="link-underline decoration-paper/30 hover:decoration-paper" href="/privacidad">
                  {tr("Política de privacidad", "Privacy policy")}
                </a>
              </li>
              <li>
                <a className="link-underline decoration-paper/30 hover:decoration-paper" href="/privacidad#seguridad">
                  {tr("Tratamiento de datos sensibles", "Handling of sensitive data")}
                </a>
              </li>
              <li>
                <a className="link-underline decoration-paper/30 hover:decoration-paper" href="/privacidad#derechos">
                  {tr("Tus derechos", "Your rights")}
                </a>
              </li>
              <li>
                <a className="link-underline decoration-paper/30 hover:decoration-paper" href="/admin">
                  {tr("Acceso del equipo", "Team login")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-paper/10 pt-6 text-[11.5px] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} DrivePayments.{" "}
            {tr("Todos los derechos reservados.", "All rights reserved.")}
          </p>
          <p className="max-w-md sm:text-right">
            {tr(
              "DrivePayments tramita solicitudes de alta de comercio; la aprobación final corresponde al procesador y al banco adquirente.",
              "DrivePayments processes merchant onboarding applications; final approval rests with the processor and the acquiring bank.",
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
