import { Readable } from "node:stream";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { nanoid } from "nanoid";
import { LEAD_STATUSES, type LeadStatus } from "../../drizzle/schema";
import { storageGetSignedUrl, storagePut } from "../storage";
import { registerAuthRoutes, requireAdmin, type AuthedRequest } from "./auth";
import {
  clientIp,
  createRateLimiter,
  decryptNote,
  encryptNote,
} from "./security";
import * as store from "./store";

/**
 * API del CRM.
 *
 * - `POST /api/submissions` es público: recibe el sobre cifrado del formulario.
 * - El resto exige una sesión del CRM (email + contraseña) con rol de administrador.
 * - El servidor nunca ve datos personales: solo guarda el sobre cifrado y un
 *   resumen también cifrado que permite listar expedientes sin descifrarlos.
 */

const REFERENCE_PATTERN = /^DP-\d{4}-[A-Z0-9]{4}$/;
// El cliente limita los adjuntos a 30 MB (tras optimizar las fotos); en base64
// dentro del sobre cifrado eso ocupa ~41 MB. Margen pequeño por encima.
const MAX_ENVELOPE_BYTES = 45 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 30 * 1024 * 1024;
const MAX_SUMMARY_BYTES = 16 * 1024;

const submitLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 12 });

/**
 * Protección CSRF: las escrituras exigen una cabecera propia. Un formulario
 * cruzado no puede añadirla sin superar un preflight CORS, que este servidor no
 * autoriza.
 */
function guardWrite(req: Request, res: Response, next: NextFunction) {
  if (req.get("x-crm-request") !== "1") {
    res.status(403).json({ error: "Petición no válida." });
    return;
  }
  next();
}

function isBase64(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}

type ParsedEnvelope = {
  reference: string;
  docCount: number;
  sizeBytes: number;
  wrappedKey: string;
  summary: { iv: string; ciphertext: string } | null;
};

function parseEnvelope(
  body: unknown
): { ok: true; value: ParsedEnvelope } | { ok: false; error: string } {
  if (!body || typeof body !== "object")
    return { ok: false, error: "Sobre vacío." };
  const envelope = body as Record<string, unknown>;
  if (envelope.version !== 1 || envelope.alg !== "RSA-OAEP-256+A256GCM") {
    return { ok: false, error: "Versión de sobre no admitida." };
  }
  if (
    typeof envelope.reference !== "string" ||
    !REFERENCE_PATTERN.test(envelope.reference)
  ) {
    return { ok: false, error: "Referencia no válida." };
  }
  if (!isBase64(envelope.wrappedKey, 4096))
    return { ok: false, error: "Clave envuelta no válida." };
  if (!isBase64(envelope.iv, 64)) return { ok: false, error: "IV no válido." };
  if (!isBase64(envelope.ciphertext, MAX_ENVELOPE_BYTES)) {
    return {
      ok: false,
      error: "Contenido cifrado no válido o demasiado grande.",
    };
  }
  const meta = (envelope.meta ?? {}) as Record<string, unknown>;
  const docCount = Number(meta.documents);
  const sizeBytes = Number(meta.totalBytes);
  if (!Number.isFinite(docCount) || docCount < 0 || docCount > 60) {
    return { ok: false, error: "Número de documentos no válido." };
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0 || sizeBytes > MAX_DOCUMENT_BYTES) {
    return { ok: false, error: "Tamaño de expediente no válido." };
  }
  let summary: ParsedEnvelope["summary"] = null;
  const rawSummary = envelope.summary as Record<string, unknown> | undefined;
  if (rawSummary) {
    if (
      !isBase64(rawSummary.iv, 64) ||
      !isBase64(rawSummary.ciphertext, MAX_SUMMARY_BYTES)
    ) {
      return { ok: false, error: "Resumen cifrado no válido." };
    }
    summary = { iv: rawSummary.iv, ciphertext: rawSummary.ciphertext };
  }
  return {
    ok: true,
    value: {
      reference: envelope.reference,
      docCount,
      sizeBytes,
      summary,
      wrappedKey: envelope.wrappedKey,
    },
  };
}

function leadDto(row: store.LeadRow) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    docCount: row.docCount,
    sizeBytes: row.sizeBytes,
    receivedAt: row.receivedAt,
    updatedAt: row.updatedAt,
    lastViewedAt: row.lastViewedAt,
    hasNotes: Boolean(row.notesCiphertext),
    wrappedKey: row.wrappedKey,
    summary:
      row.summaryIv && row.summaryCiphertext
        ? { iv: row.summaryIv, ciphertext: row.summaryCiphertext }
        : null,
  };
}

function handle(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error(
        "[CRM] Error:",
        error instanceof Error ? error.message : error
      );
      if (!res.headersSent)
        res.status(500).json({ error: "Error interno del CRM." });
    }
  };
}

export function registerCrmRoutes(app: Express) {
  const api = express.Router();

  api.post(
    "/submissions",
    handle(async (req, res) => {
      if (!submitLimiter(clientIp(req))) {
        res
          .status(429)
          .json({ error: "Demasiadas solicitudes. Inténtalo más tarde." });
        return;
      }
      const parsed = parseEnvelope(req.body);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const { reference, docCount, sizeBytes, summary, wrappedKey } =
        parsed.value;
      const existing = await store.getLeadByReference(reference);
      if (existing) {
        res
          .status(409)
          .json({ error: "Ya existe un expediente con esta referencia." });
        return;
      }
      const payload = JSON.stringify(req.body);
      const bytes = Buffer.byteLength(payload, "utf8");
      if (bytes > MAX_ENVELOPE_BYTES) {
        res
          .status(413)
          .json({ error: "El expediente supera el tamaño máximo." });
        return;
      }
      const stored = await storagePut(
        `leads/${reference}.json`,
        payload,
        "application/json"
      );
      const id = nanoid(16);
      await store.createLead({
        id,
        reference,
        storageKey: stored.key,
        sizeBytes: bytes,
        docCount,
        wrappedKey,
        summaryIv: summary?.iv ?? null,
        summaryCiphertext: summary?.ciphertext ?? null,
      });
      console.log(
        `[CRM] Expediente ${reference} recibido (${Math.round(bytes / 1024)} KB).`
      );
      res.status(201).json({ ok: true, reference });
    })
  );

  registerAuthRoutes(api, { guardWrite, handle });

  api.get(
    "/crm/leads",
    requireAdmin,
    handle(async (req, res) => {
      const statusParam =
        typeof req.query.status === "string" ? req.query.status : "all";
      const status =
        statusParam === "all" ||
        (LEAD_STATUSES as readonly string[]).includes(statusParam)
          ? (statusParam as LeadStatus | "all")
          : "all";
      const rows = await store.listLeads(status);
      const counters = await store.stats();
      res.set("Cache-Control", "no-store").json({
        leads: rows.map(leadDto),
        counters,
      });
    })
  );

  api.get(
    "/crm/leads/:id",
    requireAdmin,
    handle(async (req, res) => {
      const lead = await store.getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: "Expediente no encontrado." });
        return;
      }
      const events = await store.listEvents(lead.id);
      res.set("Cache-Control", "no-store").json({
        lead: leadDto(lead),
        notes: decryptNote(lead.notesCiphertext),
        events: events.map(event => ({
          id: event.id,
          action: event.action,
          detail: event.detail,
          actorEmail: event.actorEmail,
          createdAt: event.createdAt,
        })),
      });
    })
  );

  api.get(
    "/crm/leads/:id/envelope",
    requireAdmin,
    handle(async (req, res) => {
      const lead = await store.getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: "Expediente no encontrado." });
        return;
      }
      const signedUrl = await storageGetSignedUrl(lead.storageKey);
      const upstream = await fetch(signedUrl);
      if (!upstream.ok || !upstream.body) {
        res.status(502).json({ error: "No se pudo leer el sobre almacenado." });
        return;
      }
      res.set("Content-Type", "application/json");
      res.set("Cache-Control", "no-store");
      Readable.fromWeb(
        upstream.body as Parameters<typeof Readable.fromWeb>[0]
      ).pipe(res);
    })
  );

  api.post(
    "/crm/leads/:id/seen",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const lead = await store.getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: "Expediente no encontrado." });
        return;
      }
      await store.updateLead(lead.id, { lastViewedAt: new Date() });
      res.json({ ok: true });
    })
  );

  api.patch(
    "/crm/leads/:id",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const user = (req as AuthedRequest).crmUser;
      const lead = await store.getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: "Expediente no encontrado." });
        return;
      }
      const body = req.body as { status?: unknown; notes?: unknown };
      const changes: Parameters<typeof store.updateLead>[1] = {};
      if (body.status !== undefined) {
        if (
          typeof body.status !== "string" ||
          !(LEAD_STATUSES as readonly string[]).includes(body.status)
        ) {
          res.status(400).json({ error: "Estado no válido." });
          return;
        }
        changes.status = body.status as LeadStatus;
      }
      if (body.notes !== undefined) {
        if (typeof body.notes !== "string" || body.notes.length > 5000) {
          res.status(400).json({ error: "La nota es demasiado larga." });
          return;
        }
        changes.notesCiphertext = body.notes.trim()
          ? encryptNote(body.notes)
          : null;
      }
      if (Object.keys(changes).length === 0) {
        res.status(400).json({ error: "Nada que actualizar." });
        return;
      }
      await store.updateLead(lead.id, changes);
      if (changes.status) {
        await store.addEvent({
          leadId: lead.id,
          action: "status",
          detail: `${store.STATUS_LABELS[lead.status]} → ${store.STATUS_LABELS[changes.status]}`,
          actorEmail: user?.email ?? null,
        });
      }
      if (body.notes !== undefined) {
        await store.addEvent({
          leadId: lead.id,
          action: "note",
          detail: body.notes
            ? "Nota interna actualizada"
            : "Nota interna eliminada",
          actorEmail: user?.email ?? null,
        });
      }
      const updated = await store.getLead(lead.id);
      res.json({ ok: true, lead: updated ? leadDto(updated) : null });
    })
  );

  api.delete(
    "/crm/leads/:id",
    requireAdmin,
    guardWrite,
    handle(async (req, res) => {
      const user = (req as AuthedRequest).crmUser;
      const lead = await store.getLead(req.params.id);
      if (!lead) {
        res.status(404).json({ error: "Expediente no encontrado." });
        return;
      }
      // El runtime no puede borrar objetos físicamente: se archiva el expediente
      // y se conserva el sobre cifrado según la política de retención.
      await store.updateLead(lead.id, { status: "archived" });
      await store.addEvent({
        leadId: lead.id,
        action: "Archivado",
        detail: "Expediente archivado; el sobre cifrado se conserva",
        actorEmail: user?.email ?? null,
      });
      console.log(`[CRM] Expediente ${lead.reference} archivado.`);
      res.json({ ok: true });
    })
  );

  api.get(
    "/crm/stats",
    requireAdmin,
    handle(async (_req, res) => {
      res.set("Cache-Control", "no-store").json(await store.stats());
    })
  );

  app.use("/api", api);
}
