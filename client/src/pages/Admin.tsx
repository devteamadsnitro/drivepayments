import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Brand";
import { LeadDetail } from "@/components/crm/LeadDetail";
import {
  Skeleton,
  STATUS_META,
  StatusPill,
  formatBytes,
  formatDate,
  formatMoney,
} from "@/components/crm/ui";
import { LoginScreen, NoAdminScreen, SetupScreen } from "@/components/crm/AuthScreens";
import { TeamPanel } from "@/components/crm/TeamPanel";
import {
  crmApi,
  type Counters,
  type LeadDto,
  type LeadStatus,
  type SessionDto,
} from "@/lib/crm/api";
import {
  decryptSummary,
  lockKey,
  restoreKey,
  unlockWithJwk,
  type LeadSummary,
} from "@/lib/crm/crypto";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: LeadStatus | "all"; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "new", label: "Nuevas" },
  { id: "review", label: "En revisión" },
  { id: "docs", label: "Faltan docs" },
  { id: "approved", label: "Aprobadas" },
  { id: "declined", label: "Rechazadas" },
  { id: "archived", label: "Archivadas" },
];

function BrandBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 rounded-md" aria-label="DrivePayments">
          <LogoMark className="size-7 text-ink" />
          <Wordmark className="text-[16px]" />
        </a>
        <span className="rounded-full border border-line bg-white/60 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-ink-muted uppercase">
          CRM
        </span>
        {children}
      </div>
    </header>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <BrandBar />
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[560px] items-center px-4 py-12">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<SessionDto | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [unlock, setUnlock] = useState<{ fingerprint: string } | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [pastedKey, setPastedKey] = useState("");

  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [counters, setCounters] = useState<Counters | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, LeadSummary | null>>({});
  const attempted = useRef(new Set<string>());

  const [teamOpen, setTeamOpen] = useState(false);

  const refreshSession = async () => {
    try {
      const data = await crmApi.session();
      setSession(data);
      if (data.canAccess) {
        const restored = await restoreKey();
        if (restored) setUnlock({ fingerprint: restored.fingerprint });
      }
    } catch {
      setSessionError("No se pudo comprobar la sesión. Recarga la página.");
    }
  };

  useEffect(() => {
    document.title = "CRM · DrivePayments";
    void refreshSession();
  }, []);

  const loadLeads = async (status: LeadStatus | "all") => {
    setLoadingLeads(true);
    setListError(null);
    try {
      const data = await crmApi.leads(status);
      setLeads(data.leads);
      setCounters(data.counters);
    } catch (cause) {
      setListError(cause instanceof Error ? cause.message : "No se pudieron cargar los expedientes.");
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (session?.canAccess && unlock) void loadLeads(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.canAccess, unlock, filter]);

  useEffect(() => {
    if (!unlock) return;
    const pending = leads.filter(
      (lead) => lead.summary && lead.wrappedKey && !attempted.current.has(lead.id),
    );
    if (pending.length === 0) return;
    let cancelled = false;
    void (async () => {
      for (const lead of pending) {
        attempted.current.add(lead.id);
        try {
          const summary = await decryptSummary({
            wrappedKey: lead.wrappedKey as string,
            summary: lead.summary,
          });
          if (!cancelled) setSummaries((previous) => ({ ...previous, [lead.id]: summary }));
        } catch {
          if (!cancelled) setSummaries((previous) => ({ ...previous, [lead.id]: null }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leads, unlock]);

  const handleKeyFile = async (file: File | null) => {
    if (!file) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const text = await file.text();
      const result = await unlockWithJwk(text);
      setUnlock({ fingerprint: result.fingerprint });
    } catch (cause) {
      setUnlockError(cause instanceof Error ? cause.message : "No se pudo cargar la clave.");
    } finally {
      setUnlocking(false);
    }
  };

  const handlePastedKey = async () => {
    if (!pastedKey.trim()) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const result = await unlockWithJwk(pastedKey.trim());
      setUnlock({ fingerprint: result.fingerprint });
      setPastedKey("");
    } catch (cause) {
      setUnlockError(cause instanceof Error ? cause.message : "No se pudo cargar la clave.");
    } finally {
      setUnlocking(false);
    }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) => {
      const summary = summaries[lead.id];
      return (
        lead.reference.toLowerCase().includes(term) ||
        (summary?.businessName ?? "").toLowerCase().includes(term) ||
        (summary?.ownerName ?? "").toLowerCase().includes(term) ||
        (summary?.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [leads, query, summaries]);

  const selected = filtered.find((lead) => lead.id === selectedId) ?? null;

  const handleUpdated = (updated: LeadDto) => {
    setLeads((previous) => previous.map((lead) => (lead.id === updated.id ? updated : lead)));
    setCounters((previous) =>
      previous
        ? {
            ...previous,
            byStatus: {
              ...previous.byStatus,
              [updated.status]: (previous.byStatus[updated.status] ?? 0) + 1,
            },
          }
        : previous,
    );
  };

  const handleDeleted = (id: string) => {
    setLeads((previous) => previous.filter((lead) => lead.id !== id));
    setSelectedId(null);
    void loadLeads(filter);
  };

  const logout = async () => {
    try {
      await crmApi.logout();
    } catch {
      /* la sesión se limpia igualmente en el cliente */
    }
    lockKey();
    setUnlock(null);
    setSession((previous) => (previous ? { ...previous, user: null, canAccess: false } : previous));
  };

  if (sessionError) {
    return (
      <CenteredShell>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-[13px] text-rose-950">
          {sessionError}
        </div>
      </CenteredShell>
    );
  }

  if (!session) {
    return (
      <CenteredShell>
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Cargando el CRM…
        </div>
      </CenteredShell>
    );
  }

  if (!session.user) {
    return (
      <CenteredShell>
        {session.adminExists ? (
          <LoginScreen onSignedIn={() => void refreshSession()} />
        ) : session.setupAvailable ? (
          <SetupScreen onCreated={() => void refreshSession()} />
        ) : (
          <NoAdminScreen />
        )}
      </CenteredShell>
    );
  }

  if (!session.canAccess) {
    return (
      <CenteredShell>
        <div className="rounded-2xl border border-line bg-white p-7">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
            Esta cuenta no tiene acceso
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            Has iniciado sesión como {session.user.email ?? "una cuenta sin email"}, pero esta cuenta
            no tiene permiso de administrador.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-[13px] font-medium text-ink"
          >
            <LogOut className="size-4" /> Cambiar de cuenta
          </button>
        </div>
      </CenteredShell>
    );
  }

  if (!unlock) {
    return (
      <CenteredShell>
        <div className="rounded-2xl border border-line bg-white p-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/60 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
            <KeyRound className="size-3" /> Clave de descifrado
          </span>
          <h1 className="mt-4 text-[24px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            Desbloquea los expedientes
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            Los datos y los documentos están cifrados de extremo a extremo. Carga tu clave privada
            (<span className="font-mono text-[12px]">private-key.jwk.json</span>) para leerlos: se
            queda en esta pestaña y nunca se envía al servidor.
          </p>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-paper/50 px-4 py-7 text-center transition-colors hover:border-ink/40">
            <Upload className="size-5 text-ink-muted" />
            <span className="text-[13px] font-medium text-ink">Selecciona el archivo de clave</span>
            <span className="text-[11.5px] text-ink-muted">JSON · JWK RSA de 4096 bits</span>
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void handleKeyFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-[12px] text-ink-muted hover:text-ink">
              O pega el contenido de la clave
            </summary>
            <textarea
              value={pastedKey}
              onChange={(event) => setPastedKey(event.target.value)}
              rows={4}
              placeholder='{"kty":"RSA","n":"...","e":"AQAB","d":"..."}'
              className="field-input mt-2 w-full resize-y font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={() => void handlePastedKey()}
              disabled={unlocking || !pastedKey.trim()}
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3 text-[12px] font-medium text-paper disabled:opacity-50"
            >
              {unlocking ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
              Desbloquear
            </button>
          </details>

          {unlockError ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-950">
              {unlockError}
            </p>
          ) : null}
          {unlocking ? (
            <p className="mt-4 flex items-center gap-2 text-[12px] text-ink-muted">
              <Loader2 className="size-3.5 animate-spin" /> Comprobando la clave…
            </p>
          ) : null}
        </div>
      </CenteredShell>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <BrandBar>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden max-w-[220px] truncate text-[12px] text-ink-muted sm:block">
            {session.user.email ?? session.user.name}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-900">
            <ShieldCheck className="size-3" /> Clave activa
          </span>
          <button
            type="button"
            onClick={() => setTeamOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Equipo</span>
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex size-8 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink"
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </BrandBar>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_540px] xl:grid-cols-[minmax(0,1fr)_600px]">
          <section className={cn("min-w-0", selectedId ? "hidden lg:block" : "block")}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9.5px] tracking-[0.18em] text-ink-muted uppercase">
                  Bandeja de entrada
                </p>
                <h1 className="mt-1 text-[24px] leading-none font-semibold tracking-[-0.03em] text-ink">
                  Expedientes
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadLeads(filter)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[12px] font-medium text-ink transition-colors hover:border-line-strong"
                >
                  <RefreshCw className={cn("size-3.5", loadingLeads && "animate-spin")} />
                  Actualizar
                </button>
                <a
                  href="/"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12px] font-medium text-paper"
                >
                  Ver formulario <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "Total", value: counters?.total ?? 0 },
                { label: "Nuevas", value: counters?.byStatus.new ?? 0 },
                { label: "En revisión", value: counters?.byStatus.review ?? 0 },
                { label: "Últimos 7 días", value: counters?.last7Days ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-white px-3 py-2.5">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-ink-muted uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[20px] leading-none font-semibold tracking-[-0.03em] text-ink">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por referencia, negocio, titular o email"
                  className="h-9 w-full rounded-lg border border-line bg-white pr-3 pl-8 text-[12.5px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-ink"
                />
              </div>
              <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
                {FILTERS.map((item) => {
                  const count =
                    item.id === "all" ? counters?.total ?? 0 : counters?.byStatus[item.id] ?? 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium transition-colors",
                        filter === item.id
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-white text-ink-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          filter === item.id ? "text-paper/60" : "text-ink-muted/60",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {listError ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-950">
                {listError}
              </p>
            ) : null}

            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
              <div className="hidden grid-cols-[132px_minmax(0,1fr)_92px_48px_84px_124px] gap-3 border-b border-line bg-paper/60 px-4 py-2 font-mono text-[9px] tracking-[0.14em] text-ink-muted uppercase sm:grid">
                <span>Expediente</span>
                <span>Negocio / titular</span>
                <span className="text-right">Volumen</span>
                <span className="text-right">Docs</span>
                <span>Fecha</span>
                <span>Estado</span>
              </div>

              {loadingLeads && leads.length === 0 ? (
                <div className="divide-y divide-line/70">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-3.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-paper-deep text-ink-muted">
                    <Inbox className="size-5" />
                  </span>
                  <p className="mt-3 text-[14px] font-medium text-ink">
                    {query ? "Sin resultados para esta búsqueda" : "Todavía no hay expedientes"}
                  </p>
                  <p className="mt-1 max-w-[320px] text-[12px] leading-relaxed text-ink-muted">
                    {query
                      ? "Prueba con la referencia del expediente o con otro término."
                      : "Cada alta enviada desde el formulario aparecerá aquí, con sus documentos cifrados."}
                  </p>
                  {!query ? (
                    <a
                      href="/"
                      className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-medium text-ink"
                    >
                      Abrir el formulario <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              ) : (
                <ul className="divide-y divide-line/70">
                  {filtered.map((lead) => {
                    const summary = summaries[lead.id];
                    const pending = Boolean(lead.summary) && summary === undefined;
                    return (
                      <li key={lead.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(lead.id)}
                          className={cn(
                            "grid w-full grid-cols-[minmax(0,1fr)] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper/70 sm:grid-cols-[132px_minmax(0,1fr)_92px_48px_84px_124px]",
                            selectedId === lead.id && "bg-accent-soft/40",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] text-ink-muted">
                              {lead.reference}
                            </span>
                            <StatusPill status={lead.status} className="sm:hidden" />
                          </div>
                          <div className="min-w-0">
                            {pending ? (
                              <Skeleton className="h-3.5 w-40" />
                            ) : (
                              <p className="truncate text-[13.5px] font-medium text-ink">
                                {summary?.businessName ?? "Expediente sin resumen"}
                              </p>
                            )}
                            <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                              {summary?.ownerName ? `${summary.ownerName} · ` : ""}
                              <span className="sm:hidden">
                                {formatDate(lead.receivedAt)} · {lead.docCount} docs ·{" "}
                              </span>
                              {formatMoney(summary?.monthlyVolumeUsd)}
                              <span className="sm:hidden">/mes</span>
                            </p>
                          </div>
                          <span className="hidden text-right font-mono text-[11.5px] text-ink sm:block">
                            {formatMoney(summary?.monthlyVolumeUsd)}
                          </span>
                          <span className="hidden text-right font-mono text-[11.5px] text-ink-muted sm:block">
                            {lead.docCount}
                          </span>
                          <span className="hidden text-[11.5px] text-ink-muted sm:block">
                            {formatDate(lead.receivedAt)}
                          </span>
                          <span className="hidden justify-self-start sm:block">
                            <StatusPill status={lead.status} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3" /> Sobres cifrados AES-256-GCM
              </span>
              <span>{counters?.documents ?? 0} documentos</span>
              <span>{formatBytes(counters?.bytes ?? 0)} almacenados</span>
              <span className="font-mono">Huella {unlock.fingerprint}</span>
            </div>
          </section>

          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-[4.75rem] max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-line bg-white">
              {selected ? (
                <div className="h-[calc(100vh-6rem)]">
                  <LeadDetail
                    key={selected.id}
                    lead={selected}
                    summary={summaries[selected.id] ?? null}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                    onClose={() => setSelectedId(null)}
                  />
                </div>
              ) : (
                <div className="flex h-[420px] flex-col items-center justify-center px-8 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-paper-deep text-ink-muted">
                    <ChevronRight className="size-5" />
                  </span>
                  <p className="mt-3 text-[14px] font-medium text-ink">Selecciona un expediente</p>
                  <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-ink-muted">
                    Verás los datos del negocio, los titulares, la cuenta bancaria, el perfil de
                    procesamiento y los documentos descifrados en tu navegador.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {selected ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-paper lg:hidden">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] font-medium text-ink"
            >
              <ArrowLeft className="size-4" /> Expedientes
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <LeadDetail
              key={selected.id}
              lead={selected}
              summary={summaries[selected.id] ?? null}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
      ) : null}
      {teamOpen ? <TeamPanel onClose={() => setTeamOpen(false)} /> : null}
    </div>
  );
}
