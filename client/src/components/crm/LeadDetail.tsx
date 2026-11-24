import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Archive,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";
import {
  crmApi,
  type LeadDetailDto,
  type LeadDto,
  type LeadStatus,
} from "@/lib/crm/api";
import {
  decryptEnvelope,
  documentBlobUrl,
  type LeadSummary,
} from "@/lib/crm/crypto";
import { buildLeadZip, downloadBlob } from "@/lib/crm/export";
import {
  businessTypes,
  idTypes,
  locationTypes,
  ownershipTypes,
} from "@/lib/options";
import type { ApplicationPayload } from "@/lib/submission";
import { cn } from "@/lib/utils";
import {
  DataField,
  MonoLabel,
  STATUS_META,
  SectionTitle,
  StatusPill,
  formatBytes,
  formatDate,
  formatDateTime,
  formatMoney,
  optionLabel,
} from "./ui";

const TABS = [
  { id: "negocio", label: "Negocio" },
  { id: "titulares", label: "Titulares" },
  { id: "banco", label: "Banco" },
  { id: "procesamiento", label: "Procesamiento" },
  { id: "documentos", label: "Documentos" },
  { id: "actividad", label: "Actividad" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CONTACT_LABELS: Record<string, string> = {
  phone: "Teléfono",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

const METHODS_LABELS: Record<string, string> = {
  cards: "Tarjetas",
  ach: "ACH",
  both: "Tarjetas + ACH",
};

const CHANNEL_LABELS: Record<string, string> = {
  online: "Online",
  inperson: "Presencial",
  phone: "Teléfono / MOTO",
};

const YES_NO: Record<string, string> = { yes: "Sí", no: "No" };

function maskValue(value: string, reveal: boolean): string {
  if (!value) return "";
  if (reveal) return value;
  const clean = value.replace(/\s+/g, "");
  return `•••• ${clean.slice(-4)}`;
}

export function LeadDetail({
  lead,
  summary,
  onUpdated,
  onDeleted,
  onClose,
  className,
}: {
  lead: LeadDto;
  summary: LeadSummary | null;
  onUpdated: (lead: LeadDto) => void;
  onDeleted: (id: string) => void;
  onClose?: () => void;
  className?: string;
}) {
  const [detail, setDetail] = useState<LeadDetailDto | null>(null);
  const [payload, setPayload] = useState<ApplicationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("negocio");
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesState, setNotesState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      const [meta, envelope] = await Promise.all([
        crmApi.lead(lead.id),
        crmApi.envelope(lead.id),
      ]);
      const decrypted = await decryptEnvelope(envelope);
      setDetail(meta);
      setPayload(decrypted);
      setNotes(meta.notes ?? "");
      crmApi.markSeen(lead.id).catch(() => undefined);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo abrir el expediente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const business = payload?.business;
  const owners = payload?.owners ?? [];
  const bank = payload?.bank;
  const processing = payload?.processing;

  const documents = useMemo(() => payload?.documents ?? [], [payload]);

  const changeStatus = async (status: LeadStatus) => {
    setStatusBusy(true);
    try {
      const result = await crmApi.update(lead.id, { status });
      if (result.lead) onUpdated(result.lead);
      const refreshed = await crmApi.lead(lead.id);
      setDetail(refreshed);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cambiar el estado."
      );
    } finally {
      setStatusBusy(false);
    }
  };

  const saveNotes = async () => {
    setNotesState("saving");
    try {
      await crmApi.update(lead.id, { notes });
      const refreshed = await crmApi.lead(lead.id);
      setDetail(refreshed);
      setNotesState("saved");
      setTimeout(() => setNotesState("idle"), 2000);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo guardar la nota."
      );
      setNotesState("idle");
    }
  };

  const exportZip = async () => {
    if (!payload) return;
    setExporting(true);
    try {
      downloadBlob(buildLeadZip(payload), `${payload.reference}.zip`);
    } finally {
      setExporting(false);
    }
  };

  const remove = async () => {
    try {
      await crmApi.remove(lead.id);
      onDeleted(lead.id);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo archivar el expediente."
      );
    }
  };

  const openPreview = (document: ApplicationPayload["documents"][number]) => {
    const url = documentBlobUrl(document.dataBase64, document.type);
    setPreview({ url, name: document.name, type: document.type });
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <MonoLabel>{lead.reference}</MonoLabel>
              <StatusPill status={lead.status} />
            </div>
            <h2 className="mt-1.5 truncate text-[19px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              {summary?.businessName || business?.legalName || "Expediente"}
            </h2>
            <p className="mt-1 text-[12px] text-ink-muted">
              {summary?.ownerName || "—"} · {formatDateTime(lead.receivedAt)} ·{" "}
              {formatBytes(lead.sizeBytes)}
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              aria-label="Cerrar expediente"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={lead.status}
              onChange={event =>
                void changeStatus(event.target.value as LeadStatus)
              }
              disabled={statusBusy}
              className="h-8 appearance-none rounded-lg border border-line bg-paper/60 pr-8 pl-2.5 text-[12px] font-medium text-ink outline-none focus:border-ink disabled:opacity-60"
              aria-label="Estado del expediente"
            >
              {(Object.keys(STATUS_META) as LeadStatus[]).map(status => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </select>
            {statusBusy ? (
              <Loader2 className="pointer-events-none absolute top-2 right-2 size-4 animate-spin text-ink-muted" />
            ) : (
              <span className="pointer-events-none absolute top-2.5 right-2.5 size-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-ink-muted" />
            )}
          </div>
          <button
            type="button"
            onClick={() => void exportZip()}
            disabled={!payload || exporting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink transition-colors hover:border-line-strong disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Descargar
          </button>
          <button
            type="button"
            onClick={() => setReveal(value => !value)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink transition-colors hover:border-line-strong"
          >
            {reveal ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {reveal ? "Ocultar datos" : "Mostrar datos"}
          </button>
          {confirmDelete ? (
            <span className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-amber-300/70 bg-amber-50 px-2 py-1 text-[11.5px] text-amber-950">
              Se oculta de la bandeja; el sobre cifrado se conserva.
              <button
                type="button"
                onClick={() => void remove()}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-amber-900 px-2 text-[11.5px] font-medium text-white"
              >
                <Archive className="size-3.5" /> Archivar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-7 rounded-md px-1.5 text-[11.5px] text-amber-900 hover:underline"
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] text-ink-muted transition-colors hover:text-ink"
            >
              <Archive className="size-3.5" />
              Archivar
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
        {TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              tab === item.id
                ? "bg-ink text-paper"
                : "text-ink-muted hover:bg-paper-deep hover:text-ink"
            )}
          >
            {item.label}
            {item.id === "documentos" && documents.length > 0 ? (
              <span className="ml-1.5 font-mono text-[10px] opacity-70">
                {documents.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[12px] text-ink-muted">
              <Loader2 className="size-3.5 animate-spin" /> Descargando y
              descifrando el expediente…
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-2 w-16 animate-pulse rounded bg-line" />
                  <div className="h-3 w-full animate-pulse rounded bg-line/70" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-950">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" /> No se pudo descifrar el
              expediente
            </div>
            <p className="mt-1.5 text-rose-900/80">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-2.5 py-1.5 text-[12px] font-medium"
            >
              <RefreshCw className="size-3.5" /> Reintentar
            </button>
          </div>
        ) : payload ? (
          <div className="space-y-6">
            {tab === "negocio" && business ? (
              <>
                <section className="space-y-4">
                  <SectionTitle index="01">Identidad</SectionTitle>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <DataField
                      label="Razón social"
                      value={business.legalName}
                    />
                    <DataField
                      label="Nombre comercial"
                      value={business.dbaName}
                    />
                    <DataField
                      label="Titularidad"
                      value={optionLabel(
                        ownershipTypes,
                        business.ownershipType
                      )}
                    />
                    <DataField
                      label="Tax ID / EIN"
                      value={business.taxId}
                      mono
                    />
                    <DataField
                      label="Tipo de negocio"
                      value={optionLabel(businessTypes, business.businessType)}
                    />
                    <DataField
                      label="Tipo de local"
                      value={optionLabel(locationTypes, business.locationType)}
                    />
                    <DataField
                      label="Antigüedad"
                      value={`${business.yearsInBusinessTotal.toFixed(1)} años`}
                    />
                    <DataField
                      label="En la ubicación actual"
                      value={`${business.yearsAtLocationTotal.toFixed(1)} años`}
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <SectionTitle index="02">Contacto</SectionTitle>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <DataField label="Email" value={business.businessEmail} />
                    <DataField
                      label="Teléfono"
                      value={business.phoneFull}
                      mono
                    />
                    <DataField
                      label="Método preferido"
                      value={
                        CONTACT_LABELS[business.contactMethod] ??
                        business.contactMethod
                      }
                    />
                    <DataField
                      label="Web"
                      value={
                        business.websites.length ? (
                          <span className="space-y-0.5">
                            {business.websites.map(site => (
                              <a
                                key={site}
                                href={
                                  site.startsWith("http")
                                    ? site
                                    : `https://${site}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
                              >
                                {site}
                              </a>
                            ))}
                          </span>
                        ) : null
                      }
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <SectionTitle index="03">Dirección legal</SectionTitle>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <DataField
                      label="Dirección"
                      value={business.legalAddress}
                      className="col-span-2"
                    />
                    <DataField label="Ciudad" value={business.city} />
                    <DataField label="Estado" value={business.state} />
                    <DataField
                      label="Código postal"
                      value={business.zip}
                      mono
                    />
                    <DataField label="País" value={business.country} />
                  </div>
                  {business.dbaSameAsLegal === "no" ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-line bg-paper/50 p-3">
                      <div className="col-span-2">
                        <MonoLabel>Dirección del DBA</MonoLabel>
                      </div>
                      <DataField
                        label="Dirección"
                        value={business.dbaAddress}
                        className="col-span-2"
                      />
                      <DataField label="Ciudad" value={business.dbaCity} />
                      <DataField label="Estado" value={business.dbaState} />
                      <DataField
                        label="Código postal"
                        value={business.dbaZip}
                        mono
                      />
                    </div>
                  ) : null}
                </section>
                {business.description ? (
                  <section className="space-y-2">
                    <SectionTitle index="04">Descripción</SectionTitle>
                    <p className="text-[13px] leading-relaxed text-ink-soft">
                      {business.description}
                    </p>
                  </section>
                ) : null}
              </>
            ) : null}

            {tab === "titulares" ? (
              <div className="space-y-4">
                {owners.map((owner, index) => (
                  <section
                    key={owner.id ?? index}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <MonoLabel>
                          Titular {String(index + 1).padStart(2, "0")}
                        </MonoLabel>
                        <p className="mt-1 text-[15px] font-semibold text-ink">
                          {owner.firstName} {owner.lastName}
                        </p>
                      </div>
                      <span className="rounded-full border border-accent-deep/40 bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-medium text-ink">
                        {owner.ownershipTotal}%
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                      <DataField
                        label="Documento"
                        value={optionLabel(idTypes, owner.idType)}
                      />
                      <DataField label="Número" value={owner.idNumber} mono />
                      <DataField
                        label="SSN"
                        value={maskValue(owner.ssn, reveal)}
                        mono
                      />
                      <DataField
                        label="Fecha de nacimiento"
                        value={formatDate(owner.dob)}
                        mono
                      />
                      <DataField
                        label="Teléfono"
                        value={owner.phoneFull}
                        mono
                      />
                      <DataField label="Email" value={owner.email} />
                      <DataField
                        label="Dirección"
                        value={`${owner.address}, ${owner.city}, ${owner.state} ${owner.zip}`}
                        className="col-span-2"
                      />
                      <DataField
                        label="Residencia"
                        value={`${owner.yearsAtResidenceTotal.toFixed(1)} años`}
                      />
                      <DataField
                        label="Dirección declarada"
                        value={
                          owner.addressMode === "legal"
                            ? "Igual que la legal"
                            : owner.addressMode === "dba"
                              ? "Igual que el DBA"
                              : "Distinta"
                        }
                      />
                    </div>
                  </section>
                ))}
                {owners.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    Sin titulares registrados.
                  </p>
                ) : null}
              </div>
            ) : null}

            {tab === "banco" && bank ? (
              <section className="space-y-4">
                <SectionTitle index="01">Cuenta de liquidación</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DataField
                    label="Banco"
                    value={bank.bankName}
                    className="col-span-2"
                  />
                  <DataField
                    label="Routing number"
                    value={maskValue(bank.routingNumber, reveal)}
                    mono
                  />
                  <DataField
                    label="Número de cuenta"
                    value={maskValue(bank.accountNumber, reveal)}
                    mono
                  />
                </div>
                <p className="flex items-start gap-2 rounded-lg bg-paper-deep/70 p-3 text-[11.5px] leading-relaxed text-ink-muted">
                  <Lock className="mt-0.5 size-3.5 shrink-0" />
                  Estos datos se descifran en tu navegador. Pulsa «Mostrar
                  datos» para verlos completos.
                </p>
              </section>
            ) : null}

            {tab === "procesamiento" && processing ? (
              <section className="space-y-4">
                <SectionTitle index="01">Perfil de procesamiento</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DataField
                    label="Métodos"
                    value={
                      METHODS_LABELS[processing.methods] ?? processing.methods
                    }
                  />
                  <DataField
                    label="Acepta tarjetas ahora"
                    value={YES_NO[processing.acceptsCardsNow] ?? "—"}
                  />
                  <DataField
                    label="Procesador actual"
                    value={processing.currentProcessor}
                  />
                  <DataField
                    label="Volumen mensual"
                    value={formatMoney(processing.monthlyVolumeUsd)}
                  />
                  <DataField
                    label="Ticket medio"
                    value={formatMoney(processing.averageTicketUsd)}
                  />
                  <DataField
                    label="Ticket más alto"
                    value={formatMoney(processing.highTicketUsd)}
                  />
                  <DataField
                    label="Canales"
                    value={processing.channels
                      .map(channel => CHANNEL_LABELS[channel] ?? channel)
                      .join(" · ")}
                    className="col-span-2"
                  />
                  <DataField
                    label="Protección de fraude"
                    value={YES_NO[processing.fraudProtection] ?? "—"}
                  />
                  <DataField
                    label="eChecks / ACH"
                    value={YES_NO[processing.needsAch] ?? "—"}
                  />
                  <DataField
                    label="RDR / otro programa"
                    value={YES_NO[processing.enrolledRdr] ?? "—"}
                  />
                </div>
              </section>
            ) : null}

            {tab === "documentos" ? (
              <div className="space-y-2.5">
                {documents.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    El solicitante no adjuntó documentos.
                  </p>
                ) : null}
                {documents.map((document, index) => (
                  <div
                    key={`${document.slot}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-line p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-paper-deep text-ink-muted">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {document.name}
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {document.slotLabel} · {formatBytes(document.size)}
                      </p>
                    </div>
                    {document.type.startsWith("image/") ||
                    document.type === "application/pdf" ? (
                      <button
                        type="button"
                        onClick={() => openPreview(document)}
                        className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink"
                        aria-label={`Previsualizar ${document.name}`}
                      >
                        <Eye className="size-4" />
                      </button>
                    ) : null}
                    <a
                      href={documentBlobUrl(document.dataBase64, document.type)}
                      download={document.name}
                      className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink"
                      aria-label={`Descargar ${document.name}`}
                    >
                      <Download className="size-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "actividad" ? (
              <div className="space-y-6">
                <section className="space-y-2">
                  <SectionTitle index="01">Notas internas</SectionTitle>
                  <textarea
                    value={notes}
                    onChange={event => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Anotaciones del equipo: documentación pendiente, llamadas, incidencias…"
                    className="field-input min-h-[96px] w-full resize-y text-[13px]"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void saveNotes()}
                      disabled={notesState === "saving"}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12px] font-medium text-paper disabled:opacity-60"
                    >
                      {notesState === "saving" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Guardar nota
                    </button>
                    {notesState === "saved" ? (
                      <span className="text-[11.5px] text-emerald-700">
                        Guardada y cifrada
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-ink-muted">
                        Se guarda cifrada en la base de datos
                      </span>
                    )}
                  </div>
                </section>
                <section className="space-y-3">
                  <SectionTitle index="02">Historial</SectionTitle>
                  <ol className="space-y-3">
                    {(detail?.events ?? []).map(event => (
                      <li key={event.id} className="flex gap-3">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink/30" />
                        <div className="min-w-0">
                          <p className="text-[12.5px] text-ink">
                            {event.action === "received"
                              ? "Expediente recibido"
                              : event.action === "status"
                                ? "Cambio de estado"
                                : "Nota"}
                            {event.detail ? (
                              <span className="text-ink-muted">
                                {" "}
                                · {event.detail}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {formatDateTime(event.createdAt)}
                            {event.actorEmail ? ` · ${event.actorEmail}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {preview
        ? createPortal(
            <div className="fixed inset-0 z-50 flex flex-col bg-ink/80 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between text-paper">
                <p className="truncate text-[13px]">{preview.name}</p>
                <button
                  type="button"
                  onClick={closePreview}
                  className="flex size-8 items-center justify-center rounded-full border border-paper/20 hover:bg-paper/10"
                  aria-label="Cerrar previsualización"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white">
                {preview.type.startsWith("image/") ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={preview.url}
                    title={preview.name}
                    className="h-full w-full"
                  />
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
