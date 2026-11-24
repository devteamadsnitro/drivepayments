import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response, Router } from "express";
import type { User } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import {
  clearSession,
  currentUser,
  hashPassword,
  issueSession,
  normalizeEmail,
  passwordProblem,
  verifyPassword,
} from "../_core/session";
import * as db from "../db";
import { clientIp, createRateLimiter } from "./security";

/**
 * Acceso al CRM con email y contraseña.
 *
 * - `POST /api/crm/setup`   crea el primer administrador (exige CRM_SETUP_TOKEN y
 *                           solo funciona mientras no exista ninguno).
 * - `POST /api/crm/login`   inicia sesión.
 * - `POST /api/crm/logout`  cierra sesión.
 * - `POST /api/crm/password` cambia la contraseña propia (cierra las demás sesiones).
 * - `GET/POST/DELETE /api/crm/users` gestión del equipo (solo administradores).
 */

export type AuthedRequest = Request & { crmUser?: User };

const loginByIp = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const loginByEmail = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 6 });
const setupByIp = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });

const GENERIC_LOGIN_ERROR = "Email o contraseña incorrectos.";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function publicUser(user: User, selfId?: number) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastSignedIn: user.lastSignedIn,
    isSelf: user.id === selfId,
  };
}

/** Exige sesión de administrador. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await currentUser(req);
  if (!user) {
    res.status(401).json({ error: "Inicia sesión para acceder al CRM." });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "Esta cuenta no tiene acceso al CRM." });
    return;
  }
  (req as AuthedRequest).crmUser = user;
  next();
}

type Handler = (req: Request, res: Response) => Promise<void>;

export function registerAuthRoutes(
  api: Router,
  helpers: { guardWrite: (req: Request, res: Response, next: NextFunction) => void; handle: (fn: Handler) => Handler },
) {
  const { guardWrite, handle } = helpers;

  api.get(
    "/crm/session",
    handle(async (req, res) => {
      const user = await currentUser(req);
      const adminExists = (await db.countAdmins()) > 0;
      res.set("Cache-Control", "no-store").json({
        user: user ? { name: user.name, email: user.email, role: user.role } : null,
        canAccess: Boolean(user && user.role === "admin"),
        adminExists,
        // El formulario de alta del primer administrador solo aparece si el
        // servidor tiene configurado el código de instalación.
        setupAvailable: !adminExists && Boolean(ENV.crmSetupToken),
      });
    }),
  );

  api.post(
    "/crm/setup",
    guardWrite,
    handle(async (req, res) => {
      if (!setupByIp(clientIp(req))) {
        res.status(429).json({ error: "Demasiados intentos. Espera un poco." });
        return;
      }
      const { email, name, password, setupToken } = (req.body ?? {}) as Record<string, unknown>;
      if (!ENV.crmSetupToken || (await db.countAdmins()) > 0) {
        res.status(409).json({ error: "El CRM ya tiene administrador." });
        return;
      }
      if (typeof setupToken !== "string" || !safeEqual(setupToken.trim(), ENV.crmSetupToken)) {
        res.status(403).json({ error: "El código de instalación no es correcto." });
        return;
      }
      const normalized = normalizeEmail(email);
      if (!normalized) {
        res.status(400).json({ error: "Introduce un email válido." });
        return;
      }
      const problem = passwordProblem(password);
      if (problem) {
        res.status(400).json({ error: problem });
        return;
      }
      const user = await db.createUser({
        email: normalized,
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 120) : null,
        passwordHash: await hashPassword(password as string),
        role: "admin",
      });
      await issueSession(req, res, user);
      console.log(`[CRM] Primer administrador creado (${normalized}).`);
      res.status(201).json({ ok: true });
    }),
  );

  api.post(
    "/crm/login",
    guardWrite,
    handle(async (req, res) => {
      const { email, password } = (req.body ?? {}) as Record<string, unknown>;
      const normalized = normalizeEmail(email);
      const ip = clientIp(req);
      if (!loginByIp(ip) || (normalized && !loginByEmail(normalized))) {
        res.status(429).json({ error: "Demasiados intentos. Vuelve a probar en 15 minutos." });
        return;
      }
      if (!normalized || typeof password !== "string" || !password) {
        res.status(400).json({ error: GENERIC_LOGIN_ERROR });
        return;
      }
      const user = await db.getUserByEmail(normalized);
      const valid = await verifyPassword(password, user?.passwordHash);
      if (!user || !valid) {
        console.warn(`[CRM] Inicio de sesión fallido para ${normalized} desde ${ip}.`);
        res.status(401).json({ error: GENERIC_LOGIN_ERROR });
        return;
      }
      await db.touchSignIn(user.id);
      await issueSession(req, res, user);
      res.json({ ok: true });
    }),
  );

  api.post(
    "/crm/logout",
    guardWrite,
    handle(async (req, res) => {
      clearSession(req, res);
      res.json({ ok: true });
    }),
  );

  api.post(
    "/crm/password",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const user = (req as AuthedRequest).crmUser!;
      const { current, next } = (req.body ?? {}) as Record<string, unknown>;
      if (typeof current !== "string" || !(await verifyPassword(current, user.passwordHash))) {
        res.status(400).json({ error: "La contraseña actual no es correcta." });
        return;
      }
      const problem = passwordProblem(next);
      if (problem) {
        res.status(400).json({ error: problem });
        return;
      }
      const updated = await db.setPassword(user.id, await hashPassword(next as string));
      await issueSession(req, res, updated); // esta sesión sigue; las demás caducan
      res.json({ ok: true });
    }),
  );

  api.get(
    "/crm/users",
    requireAdmin,
    handle(async (req, res) => {
      const self = (req as AuthedRequest).crmUser!;
      const rows = await db.listUsers();
      res.set("Cache-Control", "no-store").json({ users: rows.map((row) => publicUser(row, self.id)) });
    }),
  );

  api.post(
    "/crm/users",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const self = (req as AuthedRequest).crmUser!;
      const { email, name, password } = (req.body ?? {}) as Record<string, unknown>;
      const normalized = normalizeEmail(email);
      if (!normalized) {
        res.status(400).json({ error: "Introduce un email válido." });
        return;
      }
      const problem = passwordProblem(password);
      if (problem) {
        res.status(400).json({ error: problem });
        return;
      }
      if (await db.getUserByEmail(normalized)) {
        res.status(409).json({ error: "Ya existe una cuenta con ese email." });
        return;
      }
      const created = await db.createUser({
        email: normalized,
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 120) : null,
        passwordHash: await hashPassword(password as string),
        role: "admin",
      });
      console.log(`[CRM] ${self.email} ha dado acceso a ${normalized}.`);
      res.status(201).json({ user: publicUser(created, self.id) });
    }),
  );

  api.delete(
    "/crm/users/:id",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const self = (req as AuthedRequest).crmUser!;
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: "Usuario no válido." });
        return;
      }
      if (id === self.id) {
        res.status(400).json({ error: "No puedes quitarte el acceso a ti mismo." });
        return;
      }
      const target = await db.getUserById(id);
      if (!target) {
        res.status(404).json({ error: "Usuario no encontrado." });
        return;
      }
      await db.deleteUser(id);
      console.log(`[CRM] ${self.email} ha retirado el acceso a ${target.email}.`);
      res.json({ ok: true });
    }),
  );
}
