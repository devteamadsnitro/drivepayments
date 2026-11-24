import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here
/** Estado del expediente en el CRM. */
export const LEAD_STATUSES = [
  "new",
  "review",
  "docs",
  "approved",
  "declined",
  "archived",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Expediente recibido: solo metadatos y cifrado. El sobre completo (datos y
 * documentos) vive en el almacenamiento de objetos; aquí nunca hay texto plano.
 */
export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 32 }).primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", LEAD_STATUSES).default("new").notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  sizeBytes: int("sizeBytes").default(0).notNull(),
  docCount: int("docCount").default(0).notNull(),
  /** Resumen cifrado (nombre del negocio, titular, volumen) para listar sin descifrar el sobre. */
  /** Clave AES envuelta con RSA: permite descifrar el resumen sin bajar el sobre. */
  wrappedKey: varchar("wrappedKey", { length: 1024 }),
  summaryIv: varchar("summaryIv", { length: 64 }),
  summaryCiphertext: text("summaryCiphertext"),
  /** Notas internas cifradas con AES-256-GCM y una clave derivada del servidor. */
  notesCiphertext: text("notesCiphertext"),
  source: varchar("source", { length: 64 }).default("web").notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
}, (table) => [
  index("leads_status_idx").on(table.status),
  index("leads_received_idx").on(table.receivedAt),
]);
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/** Historial de actividad del expediente. */
export const leadEvents = mysqlTable(
  "leadEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    leadId: varchar("leadId", { length: 32 })
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 32 }).notNull(),
    detail: varchar("detail", { length: 255 }),
    actorEmail: varchar("actorEmail", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("leadEvents_lead_idx").on(table.leadId)],
);
export type LeadEvent = typeof leadEvents.$inferSelect;
