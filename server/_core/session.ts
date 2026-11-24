import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, SESSION_TTL_MS } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import * as db from "../db";

/**
 * Autenticación propia del CRM: email + contraseña.
 *
 * - Contraseñas con scrypt (N=2^15, r=8, p=1) y sal aleatoria de 16 bytes.
 * - Sesión en una cookie httpOnly firmada (HS256) con `SESSION_SECRET`.
 * - La sesión lleva la versión de credenciales del usuario: al cambiar la
 *   contraseña o borrar al usuario, todas sus sesiones dejan de valer.
 */

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 };

export const MIN_PASSWORD_LENGTH = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password.normalize("NFKC"), salt, SCRYPT.keylen, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  // Sin hash almacenado se compara igualmente contra uno ficticio para que el
  // tiempo de respuesta no revele si el email existe.
  const parts = (stored ?? DUMMY_HASH).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return stored != null && actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Hash de una contraseña aleatoria descartada: solo sirve para igualar tiempos.
const DUMMY_HASH =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");

export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password.length > 200) return "La contraseña es demasiado larga.";
  return null;
}

export const normalizeEmail = (email: unknown): string | null => {
  if (typeof email !== "string") return null;
  const value = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(value) && value.length <= 320 ? value : null;
};

function sessionKey(): Uint8Array {
  const secret = ENV.sessionSecret;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (at least 32 characters)");
  }
  return new TextEncoder().encode(secret);
}

export async function issueSession(req: Request, res: Response, user: User): Promise<void> {
  const token = await new SignJWT({ sv: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_TTL_MS) / 1000))
    .sign(sessionKey());
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: SESSION_TTL_MS });
}

export function clearSession(req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
}

/** Usuario de la sesión actual, o null si no hay sesión válida. */
export async function currentUser(req: Request): Promise<User | null> {
  const token = parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) return null;
    const user = await db.getUserById(id);
    if (!user || !user.passwordHash || user.sessionVersion !== payload.sv) return null;
    return user;
  } catch {
    return null;
  }
}
