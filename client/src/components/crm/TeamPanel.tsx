import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Loader2, Trash2, UserPlus, Users, X } from "lucide-react";
import { crmApi, type TeamMemberDto } from "@/lib/crm/api";
import { formatDate } from "@/components/crm/ui";

const MIN_PASSWORD = 12;

/** Panel lateral: equipo con acceso al CRM y cambio de contraseña propia. */
export function TeamPanel({ onClose }: { onClose: () => void }) {
  const [members, setMembers] = useState<TeamMemberDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [changing, setChanging] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await crmApi.team();
      setMembers(data.users);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el equipo.");
    }
  };

  useEffect(() => {
    void load();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña inicial debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setAdding(true);
    try {
      await crmApi.addMember({ name: name.trim(), email: email.trim(), password });
      setNotice(`Acceso creado para ${email.trim()}. Comparte la contraseña inicial por un canal seguro.`);
      setName("");
      setEmail("");
      setPassword("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo dar acceso.");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (member: TeamMemberDto) => {
    // Sin diálogos nativos: se pide una segunda pulsación para confirmar.
    if (confirmingId !== member.id) {
      setConfirmingId(member.id);
      return;
    }
    setConfirmingId(null);
    setError(null);
    setNotice(null);
    try {
      await crmApi.removeMember(member.id);
      setNotice(`Se ha retirado el acceso a ${member.email}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo retirar el acceso.");
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (next.length < MIN_PASSWORD) {
      setError(`La nueva contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    setChanging(true);
    try {
      await crmApi.changePassword(current, next);
      setCurrent("");
      setNext("");
      setNotice("Contraseña actualizada. Se han cerrado tus otras sesiones.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar la contraseña.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Equipo y acceso"
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-line bg-paper"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Users className="size-4" /> Equipo y acceso
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-full border border-line text-ink-muted hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </header>

        <div className="flex flex-col gap-6 p-5">
          {error ? (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-950">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-950">
              {notice}
            </p>
          ) : null}

          <section>
            <h3 className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
              Personas con acceso
            </h3>
            {members === null ? (
              <p className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted">
                <Loader2 className="size-3.5 animate-spin" /> Cargando…
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
                {members.map((member) => (
                  <li key={member.id} className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {member.name || member.email}
                        {member.isSelf ? (
                          <span className="ml-1.5 font-mono text-[9px] tracking-[0.1em] text-ink-muted uppercase">tú</span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11.5px] text-ink-muted">
                        {member.email} · último acceso {formatDate(member.lastSignedIn)}
                      </p>
                    </div>
                    {member.isSelf ? null : (
                      <button
                        type="button"
                        onClick={() => void remove(member)}
                        onBlur={() => setConfirmingId(null)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-rose-50 hover:text-rose-900"
                      >
                        <Trash2 className="size-3" />
                        {confirmingId === member.id ? "¿Confirmar?" : "Quitar"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
              Dar acceso a alguien
            </h3>
            <form onSubmit={add} className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-white p-4">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre"
                aria-label="Nombre"
                className="field-input h-10 w-full"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@empresa.com"
                aria-label="Email"
                autoComplete="off"
                className="field-input h-10 w-full"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={`Contraseña inicial (mín. ${MIN_PASSWORD})`}
                aria-label="Contraseña inicial"
                autoComplete="new-password"
                className="field-input h-10 w-full"
              />
              <p className="text-[11px] leading-relaxed text-ink-muted">
                La persona podrá cambiarla desde este panel. Ten en cuenta que sin la clave privada de
                descifrado solo verá la lista de expedientes, no su contenido.
              </p>
              <button
                type="submit"
                disabled={adding}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-[12.5px] font-medium text-paper disabled:opacity-60"
              >
                {adding ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                Dar acceso
              </button>
            </form>
          </section>

          <section>
            <h3 className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
              Cambiar mi contraseña
            </h3>
            <form onSubmit={changePassword} className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-white p-4">
              <input
                type="password"
                required
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                placeholder="Contraseña actual"
                aria-label="Contraseña actual"
                autoComplete="current-password"
                className="field-input h-10 w-full"
              />
              <input
                type="password"
                required
                value={next}
                onChange={(event) => setNext(event.target.value)}
                placeholder={`Nueva contraseña (mín. ${MIN_PASSWORD})`}
                aria-label="Nueva contraseña"
                autoComplete="new-password"
                className="field-input h-10 w-full"
              />
              <button
                type="submit"
                disabled={changing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink hover:border-ink disabled:opacity-60"
              >
                {changing ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
                Cambiar contraseña
              </button>
            </form>
          </section>
        </div>
      </aside>
    </div>
  );
}
