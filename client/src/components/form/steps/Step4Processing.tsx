import {
  Chips,
  Field,
  FormSection,
  Grid,
  Segmented,
  TextInput,
  YesNo,
} from "@/components/form/controls";
import { processingMethods } from "@/lib/options";
import { formatMoney, onlyDigits } from "@/lib/validation";
import type { Errors, ProcessingChannel, ProcessingInfo } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function Step4Processing({
  processing,
  errors,
  update,
}: {
  processing: ProcessingInfo;
  errors: Errors;
  update: (patch: Partial<ProcessingInfo>) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <FormSection
        index="01"
        title={tr("Qué quieres procesar", "What you want to process")}
        description={tr("Esto define el tipo de cuenta que solicitamos al procesador.", "This defines the type of account we request from the processor.")}
      >
        <div className="flex flex-col gap-5">
          <Field
            id="processing.methods"
            label={tr("Método(s) solicitados", "Requested method(s)")}
            required
            error={errors["processing.methods"]}
          >
            <Segmented
              id="processing.methods"
              value={processing.methods}
              onChange={(value) => update({ methods: value as ProcessingInfo["methods"] })}
              options={processingMethods.map((method) => ({
                value: method.value,
                label: method.label,
                hint: method.hint,
              }))}
              error={Boolean(errors["processing.methods"])}
            />
          </Field>

          <Field
            id="processing.acceptsCardsNow"
            label={tr("¿Aceptas tarjeta ahora mismo?", "Do you accept cards right now?")}
            required
            error={errors["processing.acceptsCardsNow"]}
          >
            <YesNo
              id="processing.acceptsCardsNow"
              value={processing.acceptsCardsNow}
              onChange={(value) => update({ acceptsCardsNow: value })}
              error={Boolean(errors["processing.acceptsCardsNow"])}
            />
          </Field>

          {processing.acceptsCardsNow === "yes" ? (
            <div className="animate-step-in">
              <Field
                id="processing.currentProcessor"
                label={tr("¿Con qué procesador?", "With which processor?")}
                required
                error={errors["processing.currentProcessor"]}
                hint={tr("Si trabajas con varios, indica el principal.", "If you use several, enter the main one.")}
                className="sm:max-w-md"
              >
                <TextInput
                  id="processing.currentProcessor"
                  value={processing.currentProcessor}
                  onChange={(value) => update({ currentProcessor: value })}
                  placeholder={tr("Ej. Stripe, Square, Authorize.net", "e.g. Stripe, Square, Authorize.net")}
                  error={Boolean(errors["processing.currentProcessor"])}
                />
              </Field>
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        index="02"
        title={tr("Volumen y ticket", "Volume and ticket size")}
        description={tr("Cifras medias de los últimos meses. Sirven para dimensionar la cuenta y negociar las comisiones.", "Average figures from recent months. They're used to size the account and negotiate fees.")}
      >
        <Grid cols={3}>
          <Field
            id="processing.monthlyVolume"
            label={tr("Volumen mensual", "Monthly volume")}
            required
            error={errors["processing.monthlyVolume"]}
            hint={tr("Total procesado al mes.", "Total processed per month.")}
          >
            <TextInput
              id="processing.monthlyVolume"
              value={formatMoney(processing.monthlyVolume)}
              onChange={(value) => update({ monthlyVolume: onlyDigits(value) })}
              placeholder={tr("150.000", "150,000")}
              inputMode="numeric"
              prefix="$"
              suffix="USD"
              className="font-mono"
              error={Boolean(errors["processing.monthlyVolume"])}
            />
          </Field>

          <Field
            id="processing.averageTicket"
            label={tr("Transacción media", "Average transaction")}
            required
            error={errors["processing.averageTicket"]}
            hint={tr("Importe medio por venta.", "Average amount per sale.")}
          >
            <TextInput
              id="processing.averageTicket"
              value={formatMoney(processing.averageTicket)}
              onChange={(value) => update({ averageTicket: onlyDigits(value) })}
              placeholder="120"
              inputMode="numeric"
              prefix="$"
              suffix="USD"
              className="font-mono"
              error={Boolean(errors["processing.averageTicket"])}
            />
          </Field>

          <Field
            id="processing.highTicket"
            label={tr("Transacción más alta", "Highest transaction")}
            error={errors["processing.highTicket"]}
            hint={tr("Tu venta máxima habitual.", "Your usual largest sale.")}
          >
            <TextInput
              id="processing.highTicket"
              value={formatMoney(processing.highTicket)}
              onChange={(value) => update({ highTicket: onlyDigits(value) })}
              placeholder={tr("2.500", "2,500")}
              inputMode="numeric"
              prefix="$"
              suffix="USD"
              className="font-mono"
              error={Boolean(errors["processing.highTicket"])}
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection
        index="03"
        title={tr("Operativa y protección", "Operations and protection")}
        description={tr("Cómo cobras hoy y qué necesitas del procesador.", "How you take payments today and what you need from the processor.")}
      >
        <div className="flex flex-col gap-5">
          <Field
            id="processing.channels"
            label={tr("Cómo procesas", "How you process")}
            required
            error={errors["processing.channels"]}
            hint={tr("Puedes marcar varias opciones.", "You can select several options.")}
          >
            <Chips
              id="processing.channels"
              values={processing.channels}
              onToggle={(value) => {
                const channel = value as ProcessingChannel;
                update({
                  channels: processing.channels.includes(channel)
                    ? processing.channels.filter((item) => item !== channel)
                    : [...processing.channels, channel],
                });
              }}
              options={[
                { value: "online", label: "Online" },
                { value: "inperson", label: tr("Presencial", "In person") },
                { value: "phone", label: tr("Teléfono / MOTO", "Phone / MOTO") },
              ]}
              error={Boolean(errors["processing.channels"])}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="processing.fraudProtection"
              label={tr("¿Te interesa la protección de fraude y chargebacks?", "Are you interested in fraud and chargeback protection?")}
              required
              error={errors["processing.fraudProtection"]}
            >
              <YesNo
                id="processing.fraudProtection"
                value={processing.fraudProtection}
                onChange={(value) => update({ fraudProtection: value })}
                error={Boolean(errors["processing.fraudProtection"])}
              />
            </Field>

            <Field
              id="processing.needsAch"
              label={tr("¿Necesitas eChecks / ACH?", "Do you need eChecks / ACH?")}
              required
              error={errors["processing.needsAch"]}
            >
              <YesNo
                id="processing.needsAch"
                value={processing.needsAch}
                onChange={(value) => update({ needsAch: value })}
                error={Boolean(errors["processing.needsAch"])}
              />
            </Field>

            <Field
              id="processing.enrolledRdr"
              label={tr("¿Estás dado de alta en RDR u otro programa de chargebacks?", "Are you enrolled in RDR or another chargeback program?")}
              required
              error={errors["processing.enrolledRdr"]}
              hint={tr("RDR, Ethoca, CDRN o similar.", "RDR, Ethoca, CDRN or similar.")}
              className="sm:col-span-2"
            >
              <YesNo
                id="processing.enrolledRdr"
                value={processing.enrolledRdr}
                onChange={(value) => update({ enrolledRdr: value })}
                error={Boolean(errors["processing.enrolledRdr"])}
              />
            </Field>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
