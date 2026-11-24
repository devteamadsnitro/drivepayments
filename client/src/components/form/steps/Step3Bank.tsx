import * as React from "react";
import { AlertTriangle, Check, Eye, EyeOff, Landmark, Lock } from "lucide-react";
import { CheckSample } from "@/components/form/CheckSample";
import { Field, Grid, TextInput } from "@/components/form/controls";
import { formatAccount, formatRouting, isRoutingChecksumValid, onlyDigits } from "@/lib/validation";
import type { BankInfo, Errors } from "@/lib/types";

export function Step3Bank({
  bank,
  errors,
  update,
}: {
  bank: BankInfo;
  errors: Errors;
  update: (patch: Partial<BankInfo>) => void;
}) {
  const [showAccount, setShowAccount] = React.useState(false);
  const routingDigits = onlyDigits(bank.routingNumber);
  const routingComplete = routingDigits.length === 9;
  const routingValid = routingComplete && isRoutingChecksumValid(routingDigits);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-paper/60 px-4 py-3">
        <Landmark className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          La cuenta debe estar a nombre de la <span className="text-ink">razón social</span>, no de
          una persona física ni de un tercero. Si el nombre no coincide, el procesador rechazará el
          alta.
        </p>
      </div>

      <Grid>
        <Field
          id="bank.routingNumber"
          label="Routing number"
          required
          error={errors["bank.routingNumber"]}
          hint="9 dígitos del banco. Aparece a la izquierda en la franja inferior del cheque."
          labelAddon={
            routingValid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/8 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ok uppercase">
                <Check className="size-2.5" strokeWidth={3.5} />
                válido
              </span>
            ) : routingComplete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-danger uppercase">
                <AlertTriangle className="size-2.5" />
                revisar
              </span>
            ) : null
          }
        >
          <TextInput
            id="bank.routingNumber"
            value={bank.routingNumber}
            onChange={(value) => update({ routingNumber: formatRouting(value) })}
            placeholder="121000248"
            inputMode="numeric"
            autoComplete="off"
            className="font-mono tracking-[0.08em]"
            error={Boolean(errors["bank.routingNumber"])}
          />
        </Field>

        <Field id="bank.bankName" label="Nombre del banco" required error={errors["bank.bankName"]}>
          <TextInput
            id="bank.bankName"
            value={bank.bankName}
            onChange={(value) => update({ bankName: value })}
            placeholder="Ej. Bank of America"
            autoComplete="off"
            error={Boolean(errors["bank.bankName"])}
          />
        </Field>

        <Field
          id="bank.accountNumber"
          label="Número de cuenta"
          required
          error={errors["bank.accountNumber"]}
          hint="Entre 4 y 17 dígitos. No es el número de la tarjeta."
          className="sm:col-span-2"
        >
          <div className="relative sm:max-w-md">
            <TextInput
              id="bank.accountNumber"
              type={showAccount ? "text" : "password"}
              value={bank.accountNumber}
              onChange={(value) => update({ accountNumber: formatAccount(value) })}
              placeholder="000123456789"
              inputMode="numeric"
              autoComplete="off"
              className="pr-10 font-mono tracking-[0.08em]"
              error={Boolean(errors["bank.accountNumber"])}
            />
            <button
              type="button"
              onClick={() => setShowAccount((current) => !current)}
              aria-label={showAccount ? "Ocultar número de cuenta" : "Mostrar número de cuenta"}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
            >
              {showAccount ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      </Grid>

      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-ink">Dónde está cada número</h3>
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-muted uppercase">
            cheque de ejemplo
          </span>
        </div>
        <CheckSample />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-ink px-4 py-3 text-paper">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-[11.5px] leading-relaxed text-paper/75">
          El routing y el número de cuenta se cifran con AES-256-GCM en tu navegador. No se guardan
          en este dispositivo ni se envían por email.
        </p>
      </div>
    </div>
  );
}
