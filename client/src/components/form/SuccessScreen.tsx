import * as React from "react";
import { ArrowRight, Check, Copy, Download, Lock, Send } from "lucide-react";
import { siteConfig } from "@/config/site";
import { downloadEnvelope, type DeliveryOutcome } from "@/lib/submission";
import type { EncryptedEnvelope } from "@/lib/crypto";

export function SuccessScreen({
  reference,
  outcome,
  envelope,
  onReset,
}: {
  reference: string;
  outcome: DeliveryOutcome;
  envelope: EncryptedEnvelope | null;
  onReset: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const filename = `${reference}-drivepayments.enc.json`;

  return (
    <div className="animate-fade-up mx-auto max-w-2xl py-10 sm:py-16">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent text-ink">
          <Check className="size-6" strokeWidth={3} />
        </span>

        <h1 className="mt-6 text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink">
          Solicitud recibida.
        </h1>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">
          {outcome.kind === "sent"
            ? "Hemos recibido tu expediente cifrado. Lo revisamos y te escribimos en menos de 24 h laborables con el estado del alta."
            : "Tu expediente se ha cifrado y descargado en este dispositivo. Envíanoslo por Telegram o por email seguro para que podamos tramitarlo."}
        </p>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-paper/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
              Referencia del expediente
            </p>
            <p className="mt-1 font-mono text-[17px] font-medium tracking-[0.04em] text-ink">
              {reference}
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink transition-colors hover:border-ink sm:self-auto"
          >
            {copied ? <Check className="size-3 text-ok" /> : <Copy className="size-3" />}
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>

        {outcome.kind === "download" ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3.5 py-3 text-[12px] leading-relaxed text-amber-900">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Archivo generado: <span className="font-mono">{outcome.filename}</span>. Solo puede
              abrirse con la clave privada de DrivePayments
              {outcome.reason ? ` (${outcome.reason})` : ""}.
            </span>
          </div>
        ) : null}

        <ol className="mt-8 space-y-4 border-t border-line pt-6">
          {[
            {
              title: "Revisión del expediente",
              detail: "Comprobamos titulares, documentos y coherencia de los datos. Menos de 24 h.",
            },
            {
              title: "Alta con el procesador",
              detail: "Presentamos el caso al procesador y al banco adquirente. 24–72 h laborables.",
            },
            {
              title: "Primera transacción",
              detail: "Recibes las credenciales, los enlaces de pago y el soporte de integración.",
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[9.5px] text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          {envelope ? (
            <button
              type="button"
              onClick={() => downloadEnvelope(envelope, filename)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              <Download className="size-4" />
              Descargar copia cifrada
            </button>
          ) : null}
          <a
            href={siteConfig.contact.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-ink"
          >
            <Send className="size-4" />
            Escribir por Telegram
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Nueva solicitud
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-muted">
        Guarda la referencia {reference}. Cualquier consulta sobre el expediente se atiende en{" "}
        <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>
        .
      </p>
    </div>
  );
}
