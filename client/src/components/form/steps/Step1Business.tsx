import {
  Combobox,
  Field,
  FormSection,
  Grid,
  Segmented,
  Select,
  TextInput,
  Textarea,
  WebsiteList,
  YearsMonths,
} from "@/components/form/controls";
import {
  businessTypes,
  countries,
  locationTypes,
  ownershipTypes,
  usStates,
} from "@/lib/options";
import { formatPhone, formatTaxId } from "@/lib/validation";
import type { BusinessInfo, Errors } from "@/lib/types";

export function Step1Business({
  business,
  errors,
  update,
}: {
  business: BusinessInfo;
  errors: Errors;
  update: (patch: Partial<BusinessInfo>) => void;
}) {
  const websiteErrors: Record<number, string | undefined> = {};
  business.websites.forEach((_, index) => {
    websiteErrors[index] = errors[`business.websites.${index}`];
  });

  const setCountry = (code: string) => {
    const country = countries.find((item) => item.code === code);
    const patch: Partial<BusinessInfo> = { country: code };
    if (country && !business.phone.trim()) patch.phoneDial = country.dial;
    if (code !== "US") patch.state = "";
    update(patch);
  };

  return (
    <div className="flex flex-col gap-8">
      <FormSection
        index="01"
        title="Identidad de la empresa"
        description="Tal y como aparece en el registro mercantil y en la documentación bancaria."
      >
        <Grid>
          <Field
            id="business.ownershipType"
            label="Tipo de titularidad"
            required
            error={errors["business.ownershipType"]}
          >
            <Select
              id="business.ownershipType"
              value={business.ownershipType}
              onChange={(value) => update({ ownershipType: value })}
              options={ownershipTypes}
              placeholder="Selecciona la forma jurídica"
              error={Boolean(errors["business.ownershipType"])}
            />
          </Field>

          <Field
            id="business.taxId"
            label="Tax ID / EIN"
            required
            error={errors["business.taxId"]}
            hint="Los 9 dígitos de tu EIN, tal y como figuran en la carta del IRS."
          >
            <TextInput
              id="business.taxId"
              value={business.taxId}
              onChange={(value) => update({ taxId: formatTaxId(value) })}
              placeholder="12-3456789"
              inputMode="numeric"
              autoComplete="off"
              error={Boolean(errors["business.taxId"])}
            />
          </Field>

          <Field
            id="business.legalName"
            label="Razón social"
            required
            error={errors["business.legalName"]}
            hint="Nombre legal completo, incluido el sufijo (LLC, Inc., S.L.)."
          >
            <TextInput
              id="business.legalName"
              value={business.legalName}
              onChange={(value) => update({ legalName: value })}
              placeholder="Ej. Northwind Digital LLC"
              autoComplete="organization"
              error={Boolean(errors["business.legalName"])}
            />
          </Field>

          <Field
            id="business.dbaName"
            label="Nombre comercial (DBA)"
            required
            error={errors["business.dbaName"]}
            hint="El nombre con el que tus clientes te reconocen en el extracto."
          >
            <TextInput
              id="business.dbaName"
              value={business.dbaName}
              onChange={(value) => update({ dbaName: value })}
              placeholder="Ej. Northwind Store"
              error={Boolean(errors["business.dbaName"])}
            />
          </Field>

          <Field
            id="business.businessType"
            label="Tipo de negocio"
            required
            error={errors["business.businessType"]}
            hint="Lo usamos para asignar el MCC correcto en el alta."
          >
            <Combobox
              id="business.businessType"
              value={business.businessType}
              onChange={(value) => update({ businessType: value })}
              options={businessTypes}
              placeholder="Busca tu sector…"
              error={Boolean(errors["business.businessType"])}
            />
          </Field>

          <Field
            id="business.locationType"
            label="Tipo de local"
            required
            error={errors["business.locationType"]}
          >
            <Select
              id="business.locationType"
              value={business.locationType}
              onChange={(value) => update({ locationType: value })}
              options={locationTypes}
              placeholder="¿Dónde operas?"
              error={Boolean(errors["business.locationType"])}
            />
          </Field>

          <Field
            id="business.yearsInBusiness"
            label="Antigüedad del negocio"
            required
            hint="Desde la constitución o el inicio de la actividad."
            className="sm:col-span-2"
          >
            <YearsMonths
              yearsId="business.yearsInBusiness"
              monthsId="business.monthsInBusiness"
              years={business.yearsInBusiness}
              months={business.monthsInBusiness}
              onYears={(value) => update({ yearsInBusiness: value })}
              onMonths={(value) => update({ monthsInBusiness: value })}
              yearsError={errors["business.yearsInBusiness"]}
              monthsError={errors["business.monthsInBusiness"]}
            />
          </Field>

          <Field
            id="business.description"
            label="Descripción del negocio"
            error={errors["business.description"]}
            hint="Qué vendes, a quién y cómo cobras. Dos o tres frases bastan."
            className="sm:col-span-2"
          >
            <Textarea
              id="business.description"
              value={business.description}
              onChange={(value) => update({ description: value })}
              placeholder="Ej. Vendemos equipamiento de entrenamiento funcional a gimnasios de EE. UU. y Canadá. Facturación media de 8.000 USD al mes, envíos desde nuestro almacén de Miami."
              maxLength={600}
              rows={4}
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection
        index="02"
        title="Contacto"
        description="Para validar el alta y avisarte de cualquier documento que falte."
      >
        <Grid>
          <Field
            id="business.phone"
            label="Teléfono del negocio"
            required
            error={errors["business.phone"]}
          >
            <div className="flex gap-2">
              <select
                value={business.phoneDial}
                onChange={(event) => update({ phoneDial: event.target.value })}
                aria-label="Prefijo de país"
                className="field-input h-11 w-[104px] shrink-0"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.dial}>
                    {country.code} {country.dial}
                  </option>
                ))}
              </select>
              <TextInput
                id="business.phone"
                value={business.phone}
                onChange={(value) => update({ phone: formatPhone(value, business.phoneDial) })}
                placeholder="(305) 555-0142"
                inputMode="tel"
                autoComplete="tel"
                error={Boolean(errors["business.phone"])}
              />
            </div>
          </Field>

          <Field
            id="business.businessEmail"
            label="Email del negocio"
            required
            error={errors["business.businessEmail"]}
            hint="Donde puedas recibir la documentación del alta."
          >
            <TextInput
              id="business.businessEmail"
              type="email"
              value={business.businessEmail}
              onChange={(value) => update({ businessEmail: value })}
              placeholder="finanzas@tuempresa.com"
              autoComplete="email"
              error={Boolean(errors["business.businessEmail"])}
            />
          </Field>

          <Field
            id="business.contactMethod"
            label="Método de contacto preferido"
            required
            error={errors["business.contactMethod"]}
            className="sm:col-span-2"
          >
            <Segmented
              id="business.contactMethod"
              value={business.contactMethod}
              onChange={(value) => update({ contactMethod: value as BusinessInfo["contactMethod"] })}
              options={[
                { value: "phone", label: "Teléfono" },
                { value: "telegram", label: "Telegram" },
                { value: "whatsapp", label: "WhatsApp" },
              ]}
              error={Boolean(errors["business.contactMethod"])}
            />
          </Field>

          <Field
            id="business.websites.0"
            label="Web del negocio"
            error={websiteErrors[0]}
            hint="Puedes añadir varias tiendas o landings."
            className="sm:col-span-2"
          >
            <WebsiteList
              values={business.websites}
              onChange={(values) => update({ websites: values })}
              errors={websiteErrors}
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection
        index="03"
        title="Dirección legal"
        description="La que figura en el registro. Debe coincidir con la de tu extracto bancario."
      >
        <Grid>
          <Field
            id="business.country"
            label="País"
            required
            error={errors["business.country"]}
            className="sm:col-span-2"
          >
            <Select
              id="business.country"
              value={business.country}
              onChange={setCountry}
              options={countries.map((country) => ({ value: country.code, label: country.label }))}
              placeholder="Selecciona el país"
              error={Boolean(errors["business.country"])}
            />
          </Field>

          <Field
            id="business.legalAddress"
            label="Dirección legal"
            required
            error={errors["business.legalAddress"]}
            className="sm:col-span-2"
          >
            <TextInput
              id="business.legalAddress"
              value={business.legalAddress}
              onChange={(value) => update({ legalAddress: value })}
              placeholder="Calle, número, piso, suite"
              autoComplete="street-address"
              error={Boolean(errors["business.legalAddress"])}
            />
          </Field>

          <Field id="business.city" label="Ciudad" required error={errors["business.city"]}>
            <TextInput
              id="business.city"
              value={business.city}
              onChange={(value) => update({ city: value })}
              placeholder="Miami"
              autoComplete="address-level2"
              error={Boolean(errors["business.city"])}
            />
          </Field>

          <Field
            id="business.state"
            label="Estado / provincia"
            required
            error={errors["business.state"]}
          >
            {business.country === "US" ? (
              <Select
                id="business.state"
                value={business.state}
                onChange={(value) => update({ state: value })}
                options={usStates}
                placeholder="Selecciona el estado"
                error={Boolean(errors["business.state"])}
              />
            ) : (
              <TextInput
                id="business.state"
                value={business.state}
                onChange={(value) => update({ state: value })}
                placeholder="Estado, provincia o región"
                autoComplete="address-level1"
                error={Boolean(errors["business.state"])}
              />
            )}
          </Field>

          <Field id="business.zip" label="Código postal (Zip)" required error={errors["business.zip"]}>
            <TextInput
              id="business.zip"
              value={business.zip}
              onChange={(value) => update({ zip: value })}
              placeholder="33145"
              autoComplete="postal-code"
              error={Boolean(errors["business.zip"])}
            />
          </Field>

          <Field
            id="business.yearsAtLocation"
            label="Tiempo en la ubicación actual"
            required
          >
            <YearsMonths
              yearsId="business.yearsAtLocation"
              monthsId="business.monthsAtLocation"
              years={business.yearsAtLocation}
              months={business.monthsAtLocation}
              onYears={(value) => update({ yearsAtLocation: value })}
              onMonths={(value) => update({ monthsAtLocation: value })}
              yearsError={errors["business.yearsAtLocation"]}
              monthsError={errors["business.monthsAtLocation"]}
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection
        index="04"
        title="Ubicación del DBA"
        description="Solo si operas desde una dirección distinta a la legal."
      >
        <div className="flex flex-col gap-4">
          <Field
            id="business.dbaSameAsLegal"
            label="¿La dirección del DBA es la misma que la legal?"
            required
            error={errors["business.dbaSameAsLegal"]}
          >
            <Segmented
              id="business.dbaSameAsLegal"
              value={business.dbaSameAsLegal}
              onChange={(value) =>
                update({ dbaSameAsLegal: value as BusinessInfo["dbaSameAsLegal"] })
              }
              options={[
                { value: "yes", label: "Sí, es la misma" },
                { value: "no", label: "No, es distinta" },
              ]}
              error={Boolean(errors["business.dbaSameAsLegal"])}
            />
          </Field>

          {business.dbaSameAsLegal === "no" ? (
            <div className="animate-step-in rounded-xl border border-line bg-paper/50 p-4">
              <Grid>
                <Field
                  id="business.dbaAddress"
                  label="Dirección del DBA"
                  required
                  error={errors["business.dbaAddress"]}
                  className="sm:col-span-2"
                >
                  <TextInput
                    id="business.dbaAddress"
                    value={business.dbaAddress}
                    onChange={(value) => update({ dbaAddress: value })}
                    placeholder="Calle, número, piso, suite"
                    error={Boolean(errors["business.dbaAddress"])}
                  />
                </Field>
                <Field id="business.dbaCity" label="Ciudad" required error={errors["business.dbaCity"]}>
                  <TextInput
                    id="business.dbaCity"
                    value={business.dbaCity}
                    onChange={(value) => update({ dbaCity: value })}
                    placeholder="Ciudad"
                    error={Boolean(errors["business.dbaCity"])}
                  />
                </Field>
                <Field
                  id="business.dbaState"
                  label="Estado / provincia"
                  required
                  error={errors["business.dbaState"]}
                >
                  <TextInput
                    id="business.dbaState"
                    value={business.dbaState}
                    onChange={(value) => update({ dbaState: value })}
                    placeholder="Estado o provincia"
                    error={Boolean(errors["business.dbaState"])}
                  />
                </Field>
                <Field id="business.dbaZip" label="Código postal" required error={errors["business.dbaZip"]}>
                  <TextInput
                    id="business.dbaZip"
                    value={business.dbaZip}
                    onChange={(value) => update({ dbaZip: value })}
                    placeholder="Código postal"
                    error={Boolean(errors["business.dbaZip"])}
                  />
                </Field>
              </Grid>
            </div>
          ) : null}
        </div>
      </FormSection>
    </div>
  );
}
