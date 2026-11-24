import { siteConfig } from "../config/site";
import { tr } from "./i18n";

/**
 * Cifrado híbrido en el navegador.
 *
 * 1. Se genera una clave AES-256-GCM efímera para esta solicitud.
 * 2. Los datos (incluidos los documentos en base64) se cifran con AES-GCM.
 * 3. La clave AES se envuelve con la clave pública RSA-OAEP-256 de DrivePayments.
 *
 * El texto plano nunca sale del dispositivo: lo único que se transmite o se
 * descarga es el sobre cifrado.
 */

export interface EncryptedEnvelope {
  version: 1;
  alg: "RSA-OAEP-256+A256GCM";
  reference: string;
  createdAt: string;
  wrappedKey: string;
  iv: string;
  ciphertext: string;
  meta: {
    documents: number;
    totalBytes: number;
  };
  /**
   * Resumen cifrado con la misma clave AES (IV propio): permite listar los
   * expedientes en el CRM sin descargar ni descifrar el sobre completo.
   */
  summary?: {
    iv: string;
    ciphertext: string;
  };
}

const encoder = new TextEncoder();

export function isSecureCryptoAvailable(): boolean {
  return typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.subtle !== "undefined";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function importRecipientKey(): Promise<CryptoKey> {
  if (!isSecureCryptoAvailable()) {
    throw new Error(
      tr(
        "Tu navegador no permite cifrado seguro en este contexto. Abre la página por HTTPS o desde localhost.",
        "Your browser doesn't allow secure encryption in this context. Open the page over HTTPS or from localhost.",
      ),
    );
  }
  return globalThis.crypto.subtle.importKey(
    "jwk",
    siteConfig.submission.publicKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

export async function encryptJson(payload: unknown): Promise<{
  wrappedKey: string;
  iv: string;
  ciphertext: string;
}> {
  const recipientKey = await importRecipientKey();
  const aesKey = await globalThis.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(payload));
  const ciphertext = await globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plaintext);

  const rawAesKey = await globalThis.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await globalThis.crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, rawAesKey);

  return {
    wrappedKey: bytesToBase64(new Uint8Array(wrappedKey)),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function encryptApplication(
  payload: unknown,
  meta: { reference: string; documents: number; totalBytes: number },
  summary?: unknown,
): Promise<EncryptedEnvelope> {
  const recipientKey = await importRecipientKey();
  const aesKey = await globalThis.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const encryptWith = async (value: unknown) => {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await globalThis.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encoder.encode(JSON.stringify(value)),
    );
    return { iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
  };

  const encrypted = await encryptWith(payload);
  const summaryEncrypted = summary === undefined ? undefined : await encryptWith(summary);
  const rawAesKey = await globalThis.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await globalThis.crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, rawAesKey);

  return {
    version: 1,
    alg: "RSA-OAEP-256+A256GCM",
    reference: meta.reference,
    createdAt: new Date().toISOString(),
    wrappedKey: bytesToBase64(new Uint8Array(wrappedKey)),
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext,
    meta: { documents: meta.documents, totalBytes: meta.totalBytes },
    ...(summaryEncrypted ? { summary: summaryEncrypted } : {}),
  };
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

/** Huella corta de la clave pública, para mostrarla en la interfaz. */
export async function publicKeyFingerprint(): Promise<string> {
  if (!isSecureCryptoAvailable()) return "—";
  try {
    const modulus = siteConfig.submission.publicKeyJwk.n ?? "";
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(modulus));
    const hex = Array.from(new Uint8Array(digest))
      .slice(0, 4)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    return hex.replace(/(.{4})(.{4})/, "$1 $2");
  } catch {
    return "—";
  }
}
