import { siteConfig } from "@/config/site";
import type { EncryptedEnvelope } from "@/lib/crypto";
import type { ApplicationPayload } from "@/lib/submission";

/**
 * Descifrado del CRM en el navegador.
 *
 * La clave privada nunca viaja al servidor: se carga desde el archivo del
 * operador y se mantiene en memoria (y en sessionStorage para no pedirla en cada
 * recarga de la pestaña). El servidor solo almacena sobres cifrados.
 */

export type PrivateJwk = JsonWebKey & { kty: "RSA"; n: string; e: string; d: string };

let cachedKey: CryptoKey | null = null;
let cachedJwk: PrivateJwk | null = null;

const KEY_STORAGE = "dp.crm.privateKey";

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function normalizeModulus(value: string | undefined): string {
  return (value ?? "").replace(/=+$/, "");
}

async function fingerprintOf(modulus: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(modulus));
  return Array.from(new Uint8Array(digest))
    .slice(0, 4)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .replace(/(.{4})(.{4})/, "$1 $2");
}

async function importPrivate(jwk: PrivateJwk): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}

/**
 * Comprueba que el JWK está completo importando una copia extraíble y
 * exportándola. La clave que se guarda en memoria nunca es extraíble.
 */
async function probePrivate(jwk: PrivateJwk): Promise<void> {
  const copy = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
  const exported = await crypto.subtle.exportKey("jwk", copy);
  if (!exported.d || normalizeModulus(exported.n) !== normalizeModulus(jwk.n)) {
    throw new Error("La clave privada está incompleta.");
  }
}

/** Valida el archivo de clave y comprueba que corresponde a la clave pública de la web. */
export async function unlockWithJwk(raw: string): Promise<{ fingerprint: string; jwk: PrivateJwk }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }
  const candidate = parsed as Partial<PrivateJwk>;
  if (candidate.kty !== "RSA" || !candidate.n || !candidate.e || !candidate.d) {
    throw new Error("El archivo no contiene una clave privada RSA en formato JWK.");
  }
  const jwk = candidate as PrivateJwk;
  if (normalizeModulus(jwk.n) !== normalizeModulus(siteConfig.submission.publicKeyJwk.n)) {
    throw new Error("Esta clave no corresponde a la clave pública configurada en la web.");
  }
  await probePrivate(jwk).catch(() => {
    throw new Error("La clave no se pudo cargar.");
  });
  const key = await importPrivate(jwk);
  cachedKey = key;
  cachedJwk = jwk;
  sessionStorage.setItem(KEY_STORAGE, JSON.stringify(jwk));
  return { fingerprint: await fingerprintOf(jwk.n), jwk };
}

/** Recupera la clave de la pestaña actual, si la había. */
export async function restoreKey(): Promise<{ fingerprint: string; jwk: PrivateJwk } | null> {
  const stored = sessionStorage.getItem(KEY_STORAGE);
  if (!stored) return null;
  try {
    return await unlockWithJwk(stored);
  } catch {
    sessionStorage.removeItem(KEY_STORAGE);
    return null;
  }
}

export function lockKey() {
  cachedKey = null;
  cachedJwk = null;
  sessionStorage.removeItem(KEY_STORAGE);
}

export function currentJwk(): PrivateJwk | null {
  return cachedJwk;
}

async function aesKeyFor(envelope: EncryptedEnvelope): Promise<CryptoKey> {
  if (!cachedKey) throw new Error("Introduce la clave privada para descifrar.");
  const raw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    cachedKey,
    base64ToBytes(envelope.wrappedKey),
  );
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["decrypt"]);
}

async function decryptPart(key: CryptoKey, iv: string, ciphertext: string): Promise<unknown> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    base64ToBytes(ciphertext),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

export async function decryptEnvelope(envelope: EncryptedEnvelope): Promise<ApplicationPayload> {
  const key = await aesKeyFor(envelope);
  return (await decryptPart(key, envelope.iv, envelope.ciphertext)) as ApplicationPayload;
}

export interface LeadSummary {
  businessName: string;
  legalName: string;
  ownerName: string;
  owners: number;
  email: string;
  city: string;
  state: string;
  country: string;
  monthlyVolumeUsd: number;
  methods: string;
  documents: number;
}

export async function decryptSummary(envelope: {
  wrappedKey: string;
  summary?: { iv: string; ciphertext: string } | null;
}): Promise<LeadSummary | null> {
  if (!envelope.summary) return null;
  const key = await aesKeyFor(envelope as EncryptedEnvelope);
  return (await decryptPart(key, envelope.summary.iv, envelope.summary.ciphertext)) as LeadSummary;
}

/** Convierte un documento en base64 a un objeto URL para previsualizarlo. */
export function documentBlobUrl(base64: string, type: string): string {
  const bytes = base64ToBytes(base64);
  return URL.createObjectURL(new Blob([bytes], { type: type || "application/octet-stream" }));
}

export function base64Bytes(base64: string): Uint8Array<ArrayBuffer> {
  return base64ToBytes(base64);
}
