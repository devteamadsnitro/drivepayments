import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import type { User } from "../drizzle/schema";
import { COOKIE_NAME } from "../shared/const";

const store = new Map<number, User>();
vi.mock("./db", () => ({
  getUserById: async (id: number) => store.get(id),
}));

const session = await import("./_core/session");

function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date();
  return {
    id: 7,
    openId: "email:ana@example.com",
    name: "Ana",
    email: "ana@example.com",
    loginMethod: "password",
    role: "admin",
    passwordHash: "x",
    sessionVersion: 0,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    ...overrides,
  };
}

/** Emite una sesión y devuelve la cabecera Cookie que mandaría el navegador. */
async function signIn(user: User): Promise<{ cookie: string; options: Record<string, unknown> }> {
  let value = "";
  let options: Record<string, unknown> = {};
  const res = {
    cookie: (name: string, v: string, o: Record<string, unknown>) => {
      expect(name).toBe(COOKIE_NAME);
      value = v;
      options = o;
    },
  } as unknown as Response;
  await session.issueSession({ headers: { host: "platform.drivepayments.io" } } as Request, res, user);
  return { cookie: `${COOKIE_NAME}=${value}`, options };
}

const req = (cookie: string) => ({ headers: { cookie } }) as Request;

afterEach(() => {
  vi.unstubAllEnvs();
  store.clear();
});

describe("passwords", () => {
  it("hashes with scrypt and verifies only the right password", async () => {
    const hash = await session.hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$32768$8$1$")).toBe(true);
    expect(await session.verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await session.verifyPassword("wrong password!!", hash)).toBe(false);
    expect(await session.verifyPassword("anything", null)).toBe(false);
  });

  it("uses a fresh salt for every hash", async () => {
    expect(await session.hashPassword("same-password-123")).not.toBe(
      await session.hashPassword("same-password-123"),
    );
  });

  it("enforces the minimum length and normalizes emails", () => {
    expect(session.passwordProblem("short")).toMatch(/12/);
    expect(session.passwordProblem("long-enough-pass")).toBeNull();
    expect(session.normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
    expect(session.normalizeEmail("not-an-email")).toBeNull();
  });
});

describe("sessions", () => {
  it("round-trips a signed, httpOnly, secure session cookie", async () => {
    vi.stubEnv("SESSION_SECRET", "unit-test-secret-that-is-long-enough-123");
    const user = makeUser();
    store.set(user.id, user);
    const { cookie, options } = await signIn(user);
    expect(options).toMatchObject({ httpOnly: true, secure: true, sameSite: "strict" });
    expect((await session.currentUser(req(cookie)))?.email).toBe("ana@example.com");
  });

  it("rejects sessions after a password change or account removal", async () => {
    vi.stubEnv("SESSION_SECRET", "unit-test-secret-that-is-long-enough-123");
    const user = makeUser();
    store.set(user.id, user);
    const { cookie } = await signIn(user);

    store.set(user.id, { ...user, sessionVersion: 1 });
    expect(await session.currentUser(req(cookie))).toBeNull();

    store.delete(user.id);
    expect(await session.currentUser(req(cookie))).toBeNull();
  });

  it("rejects cookies signed with another secret", async () => {
    vi.stubEnv("SESSION_SECRET", "first-secret-value-that-is-long-enough-1");
    const user = makeUser();
    store.set(user.id, user);
    const { cookie } = await signIn(user);
    vi.stubEnv("SESSION_SECRET", "second-secret-value-that-is-long-enough-2");
    expect(await session.currentUser(req(cookie))).toBeNull();
  });
});
