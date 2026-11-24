import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import type { Request } from "express";
import { ENV } from "../_core/env";

/**
 * Utilidades de seguridad del CRM.
 *
 * Las notas internas son el único texto libre que se guarda en la base de datos:
 * se cifran con AES-256-GCM usando una clave derivada del secreto de sesión del
 * proyecto, de modo que un volcado de la base de datos no las exponga.
 */

const INFO = Buffer.from("drivepayments-crm-notes-v1");

function notesKey(): Buffer {
  const secret = ENV.sessionSecret || "drivepayments-local-development-secret";
  return Buffer.from(hkdfSync("sha256", Buffer.from(secret), Buffer.from("drivepayments"), INFO, 32));
}

export function encryptNote(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", notesKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64")}.${Buffer.concat([ciphertext, tag]).toString("base64")}`;
}

export function decryptNote(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const [version, ivB64, payloadB64] = stored.split(".");
  if (version !== "v1" || !ivB64 || !payloadB64) return null;
  try {
    const payload = Buffer.from(payloadB64, "base64");
    const tag = payload.subarray(payload.length - 16);
    const ciphertext = payload.subarray(0, payload.length - 16);
    const decipher = createDecipheriv("aes-256-gcm", notesKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** IP del cliente detrás del proxy del entorno, solo para limitar peticiones. */
export function clientIp(req: Request): string {
  // Con `trust proxy = 1`, req.ip es la dirección que vio el proxy de Railway
  // (la primera entrada de X-Forwarded-For la puede falsificar el cliente).
  return req.ip || req.socket.remoteAddress || "unknown";
}

/** Limitador en memoria: suficiente para una instancia y para frenar abusos básicos. */
export function createRateLimiter(options: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();
  return function allow(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < options.windowMs);
    if (recent.length >= options.max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [entryKey, times] of hits) {
        if (times.every((time) => now - time >= options.windowMs)) hits.delete(entryKey);
      }
    }
    return true;
  };
}
