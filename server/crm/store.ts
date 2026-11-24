import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  leadEvents,
  leads,
  users,
  type LeadStatus,
} from "../../drizzle/schema";

export type LeadRow = typeof leads.$inferSelect;

async function db() {
  const instance = await getDb();
  if (!instance) throw new Error("La base de datos no está disponible.");
  return instance;
}

export async function createLead(values: {
  id: string;
  reference: string;
  storageKey: string;
  sizeBytes: number;
  docCount: number;
  wrappedKey: string | null;
  summaryIv: string | null;
  summaryCiphertext: string | null;
  source?: string;
}) {
  const database = await db();
  await database.insert(leads).values({
    id: values.id,
    reference: values.reference,
    storageKey: values.storageKey,
    sizeBytes: values.sizeBytes,
    docCount: values.docCount,
    wrappedKey: values.wrappedKey,
    summaryIv: values.summaryIv,
    summaryCiphertext: values.summaryCiphertext,
    source: values.source ?? "web",
  });
  await database.insert(leadEvents).values({
    leadId: values.id,
    action: "received",
    detail: `${values.docCount} documento(s) · ${Math.round(values.sizeBytes / 1024)} KB`,
  });
}

export async function listLeads(status?: LeadStatus | "all") {
  const database = await db();
  const query = database.select().from(leads);
  const rows =
    status === "all"
      ? await query
          .where(ne(leads.status, "archived"))
          .orderBy(desc(leads.receivedAt))
      : status
        ? await query
            .where(eq(leads.status, status))
            .orderBy(desc(leads.receivedAt))
        : await query
            .where(ne(leads.status, "archived"))
            .orderBy(desc(leads.receivedAt));
  return rows;
}

export async function getLead(id: string) {
  const database = await db();
  const rows = await database
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLeadByReference(reference: string) {
  const database = await db();
  const rows = await database
    .select()
    .from(leads)
    .where(eq(leads.reference, reference))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateLead(
  id: string,
  values: Partial<{
    status: LeadStatus;
    notesCiphertext: string | null;
    lastViewedAt: Date;
  }>
) {
  const database = await db();
  if (Object.keys(values).length === 0) return;
  await database.update(leads).set(values).where(eq(leads.id, id));
}

export async function deleteLead(id: string) {
  const database = await db();
  await database.delete(leads).where(eq(leads.id, id));
}

export async function addEvent(input: {
  leadId: string;
  action: string;
  detail?: string | null;
  actorEmail?: string | null;
}) {
  const database = await db();
  await database.insert(leadEvents).values({
    leadId: input.leadId,
    action: input.action,
    detail: input.detail ?? null,
    actorEmail: input.actorEmail ?? null,
  });
}

export async function listEvents(leadId: string) {
  const database = await db();
  return database
    .select()
    .from(leadEvents)
    .where(eq(leadEvents.leadId, leadId))
    .orderBy(desc(leadEvents.createdAt));
}

export async function stats() {
  const database = await db();
  const byStatus = await database
    .select({ status: leads.status, count: sql<number>`count(*)` })
    .from(leads)
    .groupBy(leads.status);
  const [totals] = await database
    .select({
      total: sql<number>`count(*)`,
      documents: sql<number>`coalesce(sum(${leads.docCount}), 0)`,
      bytes: sql<number>`coalesce(sum(${leads.sizeBytes}), 0)`,
    })
    .from(leads);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recent] = await database
    .select({ total: sql<number>`count(*)` })
    .from(leads)
    .where(gte(leads.receivedAt, since));
  return {
    byStatus: Object.fromEntries(
      byStatus.map(row => [row.status, Number(row.count)])
    ),
    total: Number(totals?.total ?? 0),
    documents: Number(totals?.documents ?? 0),
    bytes: Number(totals?.bytes ?? 0),
    last7Days: Number(recent?.total ?? 0),
  };
}

/** ¿Hay algún administrador dado de alta? Se usa solo para el primer acceso. */
export async function hasAdmin(): Promise<boolean> {
  const database = await db();
  const [row] = await database
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  return Number(row?.count ?? 0) > 0;
}

export async function promoteToAdmin(userId: number) {
  const database = await db();
  await database
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, userId));
}

/** Archivar es un cambio de estado; el sobre cifrado permanece intacto. */
export async function archiveAll(status: LeadStatus) {
  const database = await db();
  const rows = await database
    .select({ id: leads.id })
    .from(leads)
    .where(ne(leads.status, status));
  for (const row of rows) {
    await database.update(leads).set({ status }).where(eq(leads.id, row.id));
  }
  return rows.length;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nueva",
  review: "En revisión",
  docs: "Faltan documentos",
  approved: "Aprobada",
  declined: "Rechazada",
  archived: "Archivada",
};

export const ACTIVE_STATUSES: LeadStatus[] = [
  "new",
  "review",
  "docs",
  "approved",
  "declined",
];

export { and };
