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
        title="Qué quieres procesar"
        description="Esto define el tipo de cuenta que solicitamos al procesador."
      >
        <div className="flex flex-col gap-5">
          <Field
            id="processing.methods"
            label="Método(s) solicitados"
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
            label="¿Aceptas tarjeta ahora mismo?"
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
                label="¿Con qué procesador?"
                required
                error={errors["processing.currentProcessor"]}
                hint="Si trabajas con varios, indica el principal."
                className="sm:max-w-md"
              >
                <TextInput
                  id="processing.currentProcessor"
                  value={processing.currentProcessor}
                  onChange={(value) => update({ currentProcessor: value })}
                  placeholder="Ej. Stripe, Square, Authorize.net"
                  error={Boolean(errors["processing.currentProcessor"])}
                />
              </Field>
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        index="02"
        title="Volumen y ticket"
        description="Cifras medias de los últimos meses. Sirven para dimensionar la cuenta y negociar las comisiones."
      >
        <Grid cols={3}>
          <Field
            id="processing.monthlyVolume"
            label="Volumen mensual"
            required
            error={errors["processing.monthlyVolume"]}
            hint="Total procesado al mes."
          >
            <TextInput
              id="processing.monthlyVolume"
              value={formatMoney(processing.monthlyVolume)}
              onChange={(value) => update({ monthlyVolume: onlyDigits(value) })}
              placeholder="150.000"
              inputMode="numeric"
              prefix="$"
              suffix="USD"
              className="font-mono"
              error={Boolean(errors["processing.monthlyVolume"])}
            />
          </Field>

          <Field
            id="processing.averageTicket"
            label="Transacción media"
            required
            error={errors["processing.averageTicket"]}
            hint="Importe medio por venta."
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
            label="Transacción más alta"
            error={errors["processing.highTicket"]}
            hint="Tu venta máxima habitual."
          >
            <TextInput
              id="processing.highTicket"
              value={formatMoney(processing.highTicket)}
              onChange={(value) => update({ highTicket: onlyDigits(value) })}
              placeholder="2.500"
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
        title="Operativa y protección"
        description="Cómo cobras hoy y qué necesitas del procesador."
      >
        <div className="flex flex-col gap-5">
          <Field
            id="processing.channels"
            label="Cómo procesas"
            required
            error={errors["processing.channels"]}
            hint="Puedes marcar varias opciones."
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
                { value: "inperson", label: "Presencial" },
                { value: "phone", label: "Teléfono / MOTO" },
              ]}
              error={Boolean(errors["processing.channels"])}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="processing.fraudProtection"
              label="¿Te interesa la protección de fraude y chargebacks?"
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
              label="¿Necesitas eChecks / ACH?"
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
              label="¿Estás dado de alta en RDR u otro programa de chargebacks?"
              required
              error={errors["processing.enrolledRdr"]}
              hint="RDR, Ethoca, CDRN o similar."
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
