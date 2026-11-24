import { useState, type FormEvent, type ReactNode } from "react";
import { KeyRound, Loader2, Lock, LogIn, ShieldCheck } from "lucide-react";
import { crmApi } from "@/lib/crm/api";

const MIN_PASSWORD = 12;

function Card({ badge, title, children }: { badge: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-7">
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/60 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
        {badge}
      </span>
      <h1 className="mt-4 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-ink">{title}</h1>
      {children}
    </div>
  );
}

function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        className="field-input h-11 w-full"
      />
      {hint ? <p className="mt-1 text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-950">
      {message}
    </p>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await crmApi.login(email.trim(), password);
      setPassword("");
      onSignedIn();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      badge={
        <>
          <Lock className="size-3" /> Área privada
        </>
      }
      title="CRM de expedientes"
    >
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Accede con tu email y contraseña. Las cuentas las crea un administrador del CRM.
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <Input id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <ErrorBox message={error} />
        <SubmitButton busy={busy}>
          <LogIn className="size-4" /> Entrar
        </SubmitButton>
      </form>
    </Card>
  );
}

export function SetupScreen({ onCreated }: { onCreated: () => void }) {
  const [setupToken, setSetupToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await crmApi.setup({ setupToken: setupToken.trim(), name: name.trim(), email: email.trim(), password });
      onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear el administrador.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      badge={
        <>
          <ShieldCheck className="size-3" /> Instalación
        </>
      }
      title="Crea el primer administrador"
    >
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Este paso solo aparece una vez. Necesitas el código de instalación{" "}
        <span className="font-mono text-[12px]">CRM_SETUP_TOKEN</span> que está en las variables del
        servicio en Railway. Después podrás dar acceso al resto del equipo desde el CRM.
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <Input
          id="setupToken"
          label="Código de instalación"
          value={setupToken}
          onChange={setSetupToken}
          autoComplete="off"
        />
        <Input id="name" label="Nombre" value={name} onChange={setName} autoComplete="name" />
        <Input id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD} caracteres. Usa un gestor de contraseñas.`}
        />
        <Input
          id="confirm"
          label="Repite la contraseña"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <ErrorBox message={error} />
        <SubmitButton busy={busy}>
          <KeyRound className="size-4" /> Crear administrador
        </SubmitButton>
      </form>
    </Card>
  );
}

export function NoAdminScreen() {
  return (
    <Card
      badge={
        <>
          <Lock className="size-3" /> Área privada
        </>
      }
      title="CRM sin configurar"
    >
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        Todavía no hay ningún administrador. Define la variable{" "}
        <span className="font-mono text-[12px]">CRM_SETUP_TOKEN</span> en el servicio de Railway y
        vuelve a cargar esta página para crear el primero.
      </p>
    </Card>
  );
}
