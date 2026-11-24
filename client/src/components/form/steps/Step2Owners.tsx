import * as React from "react";
import { Eye, EyeOff, Plus, Trash2, UserRound } from "lucide-react";
import {
  Field,
  Grid,
  Segmented,
  Select,
  TextInput,
  YearsMonths,
} from "@/components/form/controls";
import { idTypes, usStates } from "@/lib/options";
import { formatPhone, formatSsn, totalOwnership } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Errors, Owner } from "@/lib/types";

const today = new Date();
const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  .toISOString()
  .slice(0, 10);

export function Step2Owners({
  owners,
  errors,
  updateOwner,
  addOwner,
  removeOwner,
}: {
  owners: Owner[];
  errors: Errors;
  updateOwner: (id: string, patch: Partial<Owner>) => void;
  addOwner: () => void;
  removeOwner: (id: string) => void;
}) {
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const total = totalOwnership(owners);
  const totalOk = Math.round(total) === 100;
  const totalError = errors["owners.__total"];

  return (
    <div className="flex flex-col gap-5">
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          totalOk ? "border-ok/25 bg-ok/5" : "border-line bg-paper/70",
        )}
      >
        <div className="flex items-center gap-2">
          <UserRound className="size-3.5 text-ink-muted" aria-hidden="true" />
          <p className="text-[12.5px] text-ink">
            {owners.length} {owners.length === 1 ? "titular" : "titulares"} · propiedad declarada{" "}
            <span className={cn("font-semibold", totalOk ? "text-ok" : "text-ink")}>
              {Math.round(total)} %
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
            <div
              className={cn("h-full rounded-full transition-all", totalOk ? "bg-ok" : "bg-ink/40")}
              style={{ width: `${Math.min(total, 100)}%` }}
            />
          </div>
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-muted uppercase">
            debe sumar 100 %
          </span>
        </div>
      </div>

      {totalError ? (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-[12px] text-danger">
          {totalError}
        </p>
      ) : null}

      {owners.map((owner, index) => {
        const key = (field: string) => `owners.${owner.id}.${field}`;
        const showSsn = Boolean(revealed[owner.id]);
        const isUs = owner.country === "US";

        return (
          <section
            key={owner.id}
            className="rounded-2xl border border-line bg-white"
            aria-labelledby={`owner-${owner.id}-title`}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 id={`owner-${owner.id}-title`} className="text-[13.5px] font-semibold text-ink">
                  Titular {index + 1}
                  {index === 0 ? (
                    <span className="ml-2 font-mono text-[9px] tracking-[0.1em] text-ink-muted uppercase">
                      principal
                    </span>
                  ) : null}
                </h3>
              </div>
              {owners.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeOwner(owner.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-3" />
                  Eliminar
                </button>
              ) : null}
            </header>

            <div className="flex flex-col gap-5 p-4">
              <Grid>
                <Field
                  id={key("firstName")}
                  label="Nombre"
                  required
                  error={errors[key("firstName")]}
                >
                  <TextInput
                    id={key("firstName")}
                    value={owner.firstName}
                    onChange={(value) => updateOwner(owner.id, { firstName: value })}
                    placeholder="Nombre"
                    autoComplete="given-name"
                    error={Boolean(errors[key("firstName")])}
                  />
                </Field>
                <Field
                  id={key("lastName")}
                  label="Apellidos"
                  required
                  error={errors[key("lastName")]}
                >
                  <TextInput
                    id={key("lastName")}
                    value={owner.lastName}
                    onChange={(value) => updateOwner(owner.id, { lastName: value })}
                    placeholder="Apellidos"
                    autoComplete="family-name"
                    error={Boolean(errors[key("lastName")])}
                  />
                </Field>

                <Field
                  id={key("addressMode")}
                  label="¿Dirección personal igual que la del negocio?"
                  required
                  error={errors[key("addressMode")]}
                  className="sm:col-span-2"
                >
                  <Segmented
                    id={key("addressMode")}
                    value={owner.addressMode}
                    onChange={(value) =>
                      updateOwner(owner.id, { addressMode: value as Owner["addressMode"] })
                    }
                    options={[
                      { value: "no", label: "No, es otra" },
                      { value: "legal", label: "Igual que la legal" },
                      { value: "dba", label: "Igual que el DBA" },
                    ]}
                    error={Boolean(errors[key("addressMode")])}
                  />
                </Field>
              </Grid>

              {owner.addressMode === "no" ? (
                <div className="animate-step-in rounded-xl border border-line bg-paper/50 p-4">
                  <Grid>
                    <Field
                      id={key("country")}
                      label="País"
                      error={errors[key("country")]}
                    >
                      <Select
                        id={key("country")}
                        value={owner.country}
                        onChange={(value) => updateOwner(owner.id, { country: value })}
                        options={[
                          { value: "US", label: "Estados Unidos" },
                          { value: "ES", label: "España" },
                          { value: "MX", label: "México" },
                          { value: "CA", label: "Canadá" },
                          { value: "GB", label: "Reino Unido" },
                          { value: "AR", label: "Argentina" },
                          { value: "CO", label: "Colombia" },
                          { value: "CL", label: "Chile" },
                          { value: "PE", label: "Perú" },
                          { value: "BR", label: "Brasil" },
                          { value: "OTHER", label: "Otro país" },
                        ]}
                        placeholder="País de residencia"
                      />
                    </Field>
                    <Field
                      id={key("address")}
                      label="Dirección"
                      required
                      error={errors[key("address")]}
                    >
                      <TextInput
                        id={key("address")}
                        value={owner.address}
                        onChange={(value) => updateOwner(owner.id, { address: value })}
                        placeholder="Calle, número, piso"
                        autoComplete="street-address"
                        error={Boolean(errors[key("address")])}
                      />
                    </Field>
                    <Field id={key("city")} label="Ciudad" required error={errors[key("city")]}>
                      <TextInput
                        id={key("city")}
                        value={owner.city}
                        onChange={(value) => updateOwner(owner.id, { city: value })}
                        placeholder="Ciudad"
                        autoComplete="address-level2"
                        error={Boolean(errors[key("city")])}
                      />
                    </Field>
                    <Field
                      id={key("state")}
                      label="Estado / provincia"
                      required
                      error={errors[key("state")]}
                    >
                      {isUs ? (
                        <Select
                          id={key("state")}
                          value={owner.state}
                          onChange={(value) => updateOwner(owner.id, { state: value })}
                          options={usStates}
                          placeholder="Selecciona el estado"
                          error={Boolean(errors[key("state")])}
                        />
                      ) : (
                        <TextInput
                          id={key("state")}
                          value={owner.state}
                          onChange={(value) => updateOwner(owner.id, { state: value })}
                          placeholder="Estado o provincia"
                          error={Boolean(errors[key("state")])}
                        />
                      )}
                    </Field>
                    <Field id={key("zip")} label="Código postal" required error={errors[key("zip")]}>
                      <TextInput
                        id={key("zip")}
                        value={owner.zip}
                        onChange={(value) => updateOwner(owner.id, { zip: value })}
                        placeholder="Código postal"
                        autoComplete="postal-code"
                        error={Boolean(errors[key("zip")])}
                      />
                    </Field>
                  </Grid>
                </div>
              ) : null}

              <Grid>
                <Field
                  id={key("yearsAtResidence")}
                  label="Tiempo en la residencia actual"
                  required
                  className="sm:col-span-2"
                >
                  <YearsMonths
                    yearsId={key("yearsAtResidence")}
                    monthsId={key("monthsAtResidence")}
                    years={owner.yearsAtResidence}
                    months={owner.monthsAtResidence}
                    onYears={(value) => updateOwner(owner.id, { yearsAtResidence: value })}
                    onMonths={(value) => updateOwner(owner.id, { monthsAtResidence: value })}
                    yearsError={errors[key("yearsAtResidence")]}
                    monthsError={errors[key("monthsAtResidence")]}
                  />
                </Field>

                <Field
                  id={key("idType")}
                  label="Tipo de documento"
                  required
                  error={errors[key("idType")]}
                >
                  <Select
                    id={key("idType")}
                    value={owner.idType}
                    onChange={(value) => updateOwner(owner.id, { idType: value })}
                    options={idTypes}
                    placeholder="Selecciona el documento"
                    error={Boolean(errors[key("idType")])}
                  />
                </Field>
                <Field
                  id={key("idNumber")}
                  label="Número de documento"
                  required
                  error={errors[key("idNumber")]}
                >
                  <TextInput
                    id={key("idNumber")}
                    value={owner.idNumber}
                    onChange={(value) => updateOwner(owner.id, { idNumber: value })}
                    placeholder="Número del documento"
                    error={Boolean(errors[key("idNumber")])}
                  />
                </Field>

                <Field
                  id={key("ssn")}
                  label="SSN"
                  required
                  error={errors[key("ssn")]}
                  hint="Nueve dígitos. Se cifra en tu navegador."
                >
                  <div className="relative">
                    <TextInput
                      id={key("ssn")}
                      type={showSsn ? "text" : "password"}
                      value={owner.ssn}
                      onChange={(value) => updateOwner(owner.id, { ssn: formatSsn(value) })}
                      placeholder="000-00-0000"
                      inputMode="numeric"
                      autoComplete="off"
                      error={Boolean(errors[key("ssn")])}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((current) => ({ ...current, [owner.id]: !current[owner.id] }))
                      }
                      aria-label={showSsn ? "Ocultar SSN" : "Mostrar SSN"}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
                    >
                      {showSsn ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>

                <Field
                  id={key("dob")}
                  label="Fecha de nacimiento"
                  required
                  error={errors[key("dob")]}
                >
                  <TextInput
                    id={key("dob")}
                    type="date"
                    value={owner.dob}
                    onChange={(value) => updateOwner(owner.id, { dob: value })}
                    max={maxBirthDate}
                    autoComplete="bday"
                    error={Boolean(errors[key("dob")])}
                  />
                </Field>

                <Field
                  id={key("phone")}
                  label="Teléfono personal"
                  required
                  error={errors[key("phone")]}
                >
                  <TextInput
                    id={key("phone")}
                    value={owner.phone}
                    onChange={(value) => updateOwner(owner.id, { phone: formatPhone(value, "+1") })}
                    placeholder="(305) 555-0142"
                    inputMode="tel"
                    autoComplete="tel-national"
                    error={Boolean(errors[key("phone")])}
                  />
                </Field>

                <Field
                  id={key("email")}
                  label="Email personal"
                  required
                  error={errors[key("email")]}
                >
                  <TextInput
                    id={key("email")}
                    type="email"
                    value={owner.email}
                    onChange={(value) => updateOwner(owner.id, { email: value })}
                    placeholder="nombre@email.com"
                    autoComplete="email"
                    error={Boolean(errors[key("email")])}
                  />
                </Field>

                <Field
                  id={key("ownershipPct")}
                  label="% de propiedad"
                  required
                  error={errors[key("ownershipPct")]}
                  className="sm:col-span-2 sm:max-w-[220px]"
                >
                  <TextInput
                    id={key("ownershipPct")}
                    value={owner.ownershipPct}
                    onChange={(value) =>
                      updateOwner(owner.id, {
                        ownershipPct: value.replace(/\D/g, "").slice(0, 3),
                      })
                    }
                    placeholder="100"
                    inputMode="numeric"
                    suffix="%"
                    error={Boolean(errors[key("ownershipPct")])}
                  />
                </Field>
              </Grid>
            </div>
          </section>
        );
      })}

      <button
        type="button"
        onClick={addOwner}
        className="group flex items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-white/60 px-4 py-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-white"
      >
        <span className="flex size-5 items-center justify-center rounded-full border border-line-strong transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-accent">
          <Plus className="size-3" />
        </span>
        Añadir titular
      </button>

      <p className="text-[11.5px] leading-relaxed text-ink-muted">
        Deben figurar todas las personas con el 25 % o más de propiedad, además del firmante
        autorizado. Si un socio supera el 25 %, el procesador pedirá también su documento de
        identidad.
      </p>
    </div>
  );
}
