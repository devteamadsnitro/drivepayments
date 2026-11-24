import { Mail, Send } from "lucide-react";
import { Logo } from "@/components/Brand";
import { siteConfig } from "@/config/site";
import { useT } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";

export function Header() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center rounded-md" aria-label={t("DrivePayments · Alta de comercios", "DrivePayments · Merchant onboarding")}>
          <Logo />
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="group flex items-center gap-2 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
            >
              <Mail className="size-3.5 text-ink-muted/70 transition-colors group-hover:text-ink" />
              {siteConfig.contact.email}
            </a>
            <span className="h-3.5 w-px bg-line-strong/70" aria-hidden="true" />
            <a
              href={siteConfig.contact.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
            >
              <Send className="size-3.5 text-ink-muted/70 transition-colors group-hover:text-ink" />
              {siteConfig.contact.telegramHandle}
            </a>
          </div>

          <span className="hidden h-3.5 w-px bg-line-strong/70 md:block" aria-hidden="true" />

          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-2.5 py-1 whitespace-nowrap max-[359px]:hidden">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
            </span>
            <span className="font-mono text-[9.5px] tracking-[0.14em] whitespace-nowrap text-ink-muted uppercase">
              {t("Alta abierta", "Now onboarding")}
            </span>
          </span>

          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-white/60 text-ink-muted transition-colors hover:text-ink md:hidden"
            aria-label={t(`Escríbenos a ${siteConfig.contact.email}`, `Email us at ${siteConfig.contact.email}`)}
          >
            <Mail className="size-4" />
          </a>

          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
