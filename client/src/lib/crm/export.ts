import { zipSync } from "fflate";
import { base64Bytes } from "./crypto";
import type { ApplicationPayload } from "@/lib/submission";

function safeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\- ]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/** Genera un ZIP con el JSON descifrado y los documentos originales. */
export function buildLeadZip(payload: ApplicationPayload): Blob {
  const root = safeName(payload.reference) || "expediente";
  const files: Record<string, Uint8Array> = {};
  const encoder = new TextEncoder();

  files[`${root}/expediente.json`] = encoder.encode(JSON.stringify(payload, null, 2));

  const used = new Map<string, number>();
  for (const document of payload.documents) {
    const folder = safeName(document.slotLabel || document.slot) || "documentos";
    const base = safeName(document.name) || "documento";
    const key = `${folder}/${base}`;
    const count = used.get(key) ?? 0;
    used.set(key, count + 1);
    const finalName = count === 0 ? key : key.replace(/(\.[^.]+)?$/, ` (${count + 1})$1`);
    files[`${root}/documentos/${finalName}`] = base64Bytes(document.dataBase64);
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as unknown as BlobPart], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
