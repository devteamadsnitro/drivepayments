import { siteConfig } from "../config/site";
import { encryptApplication, fileToBase64, type EncryptedEnvelope } from "./crypto";
import { documentRequirements } from "./options";
import { onlyDigits } from "./validation";
import type { ApplicationState } from "./types";

export interface SubmissionDocument {
  slot: string;
  slotLabel: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataBase64: string;
}

export interface ApplicationPayload {
  reference: string;
  submittedAt: string;
  locale: string;
  source: string;
  consent: {
    accepted: boolean;
    acceptedAt: string;
    privacyVersion: string;
  };
  business: ApplicationState["business"] & {
    phoneFull: string;
    yearsInBusinessTotal: number;
    yearsAtLocationTotal: number;
  };
  owners: Array<
    ApplicationState["owners"][number] & {
      phoneFull: string;
      yearsAtResidenceTotal: number;
      ownershipTotal: number;
    }
  >;
  bank: ApplicationState["bank"] & {
    accountLast4: string;
  };
  processing: ApplicationState["processing"] & {
    monthlyVolumeUsd: number;
    averageTicketUsd: number;
    highTicketUsd: number;
  };
  documents: SubmissionDocument[];
  diagnostics: {
    userAgent: string;
    timezone: string;
    language: string;
  };
}

const refAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createReference(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const random = globalThis.crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(random)
    .map((byte) => refAlphabet[byte % refAlphabet.length])
    .join("");
  return `DP-${yy}${mm}-${suffix}`;
}

export function countDocuments(state: ApplicationState): number {
  return Object.values(state.documents).reduce((total, files) => total + files.length, 0);
}

export function totalDocumentBytes(state: ApplicationState): number {
  return Object.values(state.documents).reduce(
    (total, files) => total + files.reduce((sum, doc) => sum + doc.file.size, 0),
    0,
  );
}

export function countRequiredFulfilled(state: ApplicationState): { done: number; total: number } {
  const requiredSlots = documentRequirements.filter((doc) => doc.required);
  const done = requiredSlots.filter((doc) => (state.documents[doc.id]?.length ?? 0) > 0).length;
  return { done, total: requiredSlots.length };
}

export function buildPayload(state: ApplicationState, reference: string): ApplicationPayload {
  const { business, owners, bank, processing } = state;
  const labelFor = (slot: string) =>
    documentRequirements.find((doc) => doc.id === slot)?.label ?? slot;

  const documents: SubmissionDocument[] = [];
  for (const [slot, files] of Object.entries(state.documents)) {
    for (const item of files) {
      documents.push({
        slot,
        slotLabel: labelFor(slot),
        name: item.file.name,
        type: item.file.type || "application/octet-stream",
        size: item.file.size,
        lastModified: item.file.lastModified,
        dataBase64: "",
      });
    }
  }

  return {
    reference,
    submittedAt: new Date().toISOString(),
    locale: "es",
    source: "drivepayments-merchant-onboarding",
    consent: {
      accepted: state.consent,
      acceptedAt: new Date().toISOString(),
      privacyVersion: siteConfig.legal.privacyVersion,
    },
    business: {
      ...business,
      websites: business.websites.map((site) => site.trim()).filter(Boolean),
      phoneFull: `${business.phoneDial} ${business.phone}`.trim(),
      yearsInBusinessTotal:
        Number(business.yearsInBusiness || 0) + Number(business.monthsInBusiness || 0) / 12,
      yearsAtLocationTotal:
        Number(business.yearsAtLocation || 0) + Number(business.monthsAtLocation || 0) / 12,
    },
    owners: owners.map((owner) => ({
      ...owner,
      phoneFull: owner.phone,
      yearsAtResidenceTotal:
        Number(owner.yearsAtResidence || 0) + Number(owner.monthsAtResidence || 0) / 12,
      ownershipTotal: Number(owner.ownershipPct || 0),
    })),
    bank: {
      ...bank,
      accountLast4: onlyDigits(bank.accountNumber).slice(-4),
    },
    processing: {
      ...processing,
      monthlyVolumeUsd: Number(onlyDigits(processing.monthlyVolume) || 0),
      averageTicketUsd: Number(onlyDigits(processing.averageTicket) || 0),
      highTicketUsd: Number(onlyDigits(processing.highTicket) || 0),
    },
    documents,
    diagnostics: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: typeof navigator !== "undefined" ? navigator.language : "es",
    },
  };
}

async function attachDocumentData(
  payload: ApplicationPayload,
  state: ApplicationState,
  onProgress?: (message: string) => void,
): Promise<{ payload: ApplicationPayload; totalBytes: number }> {
  const files = Object.entries(state.documents).flatMap(([slot, items]) =>
    items.map((item) => ({ slot, item })),
  );

  let totalBytes = 0;
  let index = 0;
  const withData: SubmissionDocument[] = [];

  for (const entry of files) {
    index += 1;
    onProgress?.(`Preparando documentos ${index}/${files.length}`);
    const dataBase64 = await fileToBase64(entry.item.file);
    totalBytes += entry.item.file.size;
    withData.push({
      slot: entry.slot,
      slotLabel:
        documentRequirements.find((doc) => doc.id === entry.slot)?.label ?? entry.slot,
      name: entry.item.file.name,
      type: entry.item.file.type || "application/octet-stream",
      size: entry.item.file.size,
      lastModified: entry.item.file.lastModified,
      dataBase64,
    });
  }

  return { payload: { ...payload, documents: withData }, totalBytes };
}

export type DeliveryOutcome =
  | { kind: "sent"; reference: string }
  | { kind: "download"; reference: string; filename: string; reason?: string };

export function downloadEnvelope(envelope: EncryptedEnvelope, filename: string): void {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function submitApplication(
  state: ApplicationState,
  reference: string,
  onProgress?: (message: string) => void,
): Promise<{ envelope: EncryptedEnvelope; outcome: DeliveryOutcome }> {
  onProgress?.("Preparando el expediente");
  const basePayload = buildPayload(state, reference);
  const { payload, totalBytes } = await attachDocumentData(basePayload, state, onProgress);

  onProgress?.("Cifrando en tu dispositivo");
  // Resumen mínimo (también cifrado) para poder listar el expediente en el CRM
  // sin descargar ni descifrar los documentos.
  const summary = {
    businessName: payload.business.dbaName?.trim() || payload.business.legalName,
    legalName: payload.business.legalName,
    ownerName: [payload.owners[0]?.firstName, payload.owners[0]?.lastName]
      .filter(Boolean)
      .join(" "),
    owners: payload.owners.length,
    email: payload.business.businessEmail,
    city: payload.business.city,
    state: payload.business.state,
    country: payload.business.country,
    monthlyVolumeUsd: payload.processing.monthlyVolumeUsd,
    methods: payload.processing.methods,
    documents: payload.documents.length,
  };
  const envelope = await encryptApplication(
    payload,
    { reference, documents: payload.documents.length, totalBytes },
    summary,
  );

  const filename = `${reference}-drivepayments.enc.json`;
  const endpoint = siteConfig.submission.endpoint.trim();

  if (!endpoint) {
    downloadEnvelope(envelope, filename);
    return { envelope, outcome: { kind: "download", reference, filename } };
  }

  onProgress?.("Enviando por canal cifrado");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`El endpoint respondió ${response.status}.`);
    }

    return { envelope, outcome: { kind: "sent", reference } };
  } catch (error) {
    downloadEnvelope(envelope, filename);
    return {
      envelope,
      outcome: {
        kind: "download",
        reference,
        filename,
        reason: error instanceof Error ? error.message : "No se pudo contactar con el endpoint.",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
