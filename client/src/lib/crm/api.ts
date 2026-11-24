import type { EncryptedEnvelope } from "@/lib/crypto";

/** Mismo enum que la base de datos, replicado para no arrastrar código de servidor al bundle. */
export type LeadStatus = "new" | "review" | "docs" | "approved" | "declined" | "archived";

export interface LeadSummaryPayload {
  iv: string;
  ciphertext: string;
}

export interface LeadDto {
  id: string;
  reference: string;
  status: LeadStatus;
  docCount: number;
  sizeBytes: number;
  receivedAt: string;
  updatedAt: string;
  lastViewedAt: string | null;
  hasNotes: boolean;
  wrappedKey: string | null;
  summary: LeadSummaryPayload | null;
}

export interface LeadEventDto {
  id: number;
  action: string;
  detail: string | null;
  actorEmail: string | null;
  createdAt: string;
}

export interface LeadDetailDto {
  lead: LeadDto;
  notes: string | null;
  events: LeadEventDto[];
}

export interface Counters {
  byStatus: Partial<Record<LeadStatus, number>>;
  total: number;
  documents: number;
  bytes: number;
  last7Days: number;
}

export interface SessionDto {
  user: { name: string | null; email: string | null; role: string } | null;
  canAccess: boolean;
  adminExists: boolean;
  /** true si aún no hay administrador y el servidor tiene CRM_SETUP_TOKEN. */
  setupAvailable: boolean;
}

export interface TeamMemberDto {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  lastSignedIn: string;
  isSelf: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json", "x-crm-request": "1" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export const crmApi = {
  session: () => request<SessionDto>("/api/crm/session"),
  leads: (status: LeadStatus | "all" = "all") =>
    request<{ leads: LeadDto[]; counters: Counters }>(`/api/crm/leads?status=${status}`),
  lead: (id: string) => request<LeadDetailDto>(`/api/crm/leads/${id}`),
  envelope: (id: string) =>
    fetch(`/api/crm/leads/${id}/envelope`, { credentials: "include" }).then(async (response) => {
      if (!response.ok) throw new Error("No se pudo descargar el sobre cifrado.");
      return (await response.json()) as EncryptedEnvelope;
    }),
  markSeen: (id: string) =>
    request<{ ok: true }>(`/api/crm/leads/${id}/seen`, { method: "POST", body: "{}" }),
  update: (id: string, body: { status?: LeadStatus; notes?: string }) =>
    request<{ ok: true; lead: LeadDto | null }>(`/api/crm/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  logout: () => request<{ ok: true }>("/api/crm/logout", { method: "POST", body: "{}" }),
  login: (email: string, password: string) =>
    request<{ ok: true }>("/api/crm/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  setup: (body: { email: string; name: string; password: string; setupToken: string }) =>
    request<{ ok: true }>("/api/crm/setup", { method: "POST", body: JSON.stringify(body) }),
  changePassword: (current: string, next: string) =>
    request<{ ok: true }>("/api/crm/password", {
      method: "POST",
      body: JSON.stringify({ current, next }),
    }),
  team: () => request<{ users: TeamMemberDto[] }>("/api/crm/users"),
  addMember: (body: { email: string; name: string; password: string }) =>
    request<{ user: TeamMemberDto }>("/api/crm/users", { method: "POST", body: JSON.stringify(body) }),
  removeMember: (id: number) =>
    request<{ ok: true }>(`/api/crm/users/${id}`, { method: "DELETE", body: "{}" }),
  remove: (id: string) =>
    request<{ ok: true }>(`/api/crm/leads/${id}`, { method: "DELETE", body: "{}" }),
};
