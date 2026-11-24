import { asc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, type User } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function listUsers(): Promise<User[]> {
  const db = await requireDb();
  return db.select().from(users).orderBy(asc(users.createdAt));
}

export async function countAdmins(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  return Number(rows[0]?.n ?? 0);
}

export async function createUser(values: {
  email: string;
  name: string | null;
  passwordHash: string;
  role: "admin" | "user";
}): Promise<User> {
  const db = await requireDb();
  await db.insert(users).values({
    openId: `email:${values.email}`.slice(0, 64),
    email: values.email,
    name: values.name,
    loginMethod: "password",
    role: values.role,
    passwordHash: values.passwordHash,
  });
  const created = await getUserByEmail(values.email);
  if (!created) throw new Error("User was not created");
  return created;
}

/** Cambia la contraseña e invalida todas las sesiones abiertas del usuario. */
export async function setPassword(id: number, passwordHash: string): Promise<User> {
  const db = await requireDb();
  await db
    .update(users)
    .set({ passwordHash, sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, id));
  const updated = await getUserById(id);
  if (!updated) throw new Error("User not found");
  return updated;
}

export async function touchSignIn(id: number): Promise<void> {
  const db = await requireDb();
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function deleteUser(id: number): Promise<void> {
  const db = await requireDb();
  await db.delete(users).where(eq(users.id, id));
}
