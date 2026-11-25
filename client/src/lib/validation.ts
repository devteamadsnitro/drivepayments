import type { ApplicationState, Errors, Owner, StepId } from "./types";
import { intlLocale, tr } from "./i18n";

export const onlyDigits = (value: string): string => value.replace(/\D+/g, "");

export function formatPhone(value: string, dial: string): string {
  const d = onlyDigits(value).slice(0, dial === "+1" ? 10 : 15);
  if (!d) return "";
  if (dial === "+1") {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function formatTaxId(value: string): string {
  const d = onlyDigits(value).slice(0, 9);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

export function formatSsn(value: string): string {
  const d = onlyDigits(value).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function formatMoney(value: string): string {
  const d = onlyDigits(value).slice(0, 12);
  if (!d) return "";
  return new Intl.NumberFormat(intlLocale()).format(Number(d));
}

export function formatAccount(value: string): string {
  return onlyDigits(value).slice(0, 17);
}

export function formatRouting(value: string): string {
  return onlyDigits(value).slice(0, 9);
}

/** Comprobación del dígito de control ABA de un routing number de 9 dígitos. */
export function isRoutingChecksumValid(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split("").map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());

export const isUrl = (value: string): boolean => {
  const v = value.trim();
  if (!v) return true;
  return /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(v);
};

export const ageFrom = (isoDate: string): number => {
  if (!isoDate) return 0;
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

export const totalOwnership = (owners: Owner[]): number =>
  owners.reduce((sum, owner) => sum + (Number(owner.ownershipPct) || 0), 0);

const required = (value: string | undefined): boolean =>
  Boolean(value && value.trim().length > 0);

const requiredMsg = () => tr("Este campo es obligatorio.", "This field is required.");

function validateYearsMonths(
  errors: Errors,
  yearsKey: string,
  monthsKey: string,
  years: string,
  months: string,
  yearsLabel: string,
) {
  if (!required(years)) {
    errors[yearsKey] = requiredMsg();
  } else if (Number(years) < 0 || Number(years) > 80) {
    errors[yearsKey] = tr("Introduce un número de años válido (0–80).", "Enter a valid number of years (0–80).");
  }
  if (months !== "" && (Number(months) < 0 || Number(months) > 11)) {
    errors[monthsKey] = tr("Los meses deben estar entre 0 y 11.", "Months must be between 0 and 11.");
  }
  if (required(years) && Number(years) === 0 && (!months || Number(months) === 0)) {
    errors[monthsKey] = tr(`Indica al menos un mes de ${yearsLabel}.`, `Enter at least one month of ${yearsLabel}.`);
  }
}

export function validateStep(step: StepId, app: ApplicationState): Errors {
  const errors: Errors = {};
  const { business, owners, bank, processing } = app;

  if (step === 1) {
    if (!required(business.ownershipType)) errors["business.ownershipType"] = tr("Selecciona el tipo de titularidad.", "Select the ownership type.");
    if (!required(business.legalName)) errors["business.legalName"] = tr("Indica la razón social exacta del registro.", "Enter the exact registered legal name.");
    if (!required(business.dbaName)) errors["business.dbaName"] = tr("Indica el nombre comercial con el que operas.", "Enter the trade name (DBA) you operate under.");
    if (onlyDigits(business.phone).length < 7) errors["business.phone"] = tr("Introduce un teléfono válido (mínimo 7 dígitos).", "Enter a valid phone number (at least 7 digits).");
    if (!isEmail(business.businessEmail)) errors["business.businessEmail"] = tr("Introduce un email de negocio válido.", "Enter a valid business email.");
    if (!required(business.contactMethod)) errors["business.contactMethod"] = tr("Elige cómo prefieres que te contactemos.", "Choose how you prefer to be contacted.");
    if (onlyDigits(business.taxId).length !== 9) errors["business.taxId"] = tr("El Tax ID / EIN tiene 9 dígitos.", "The Tax ID / EIN has 9 digits.");
    if (!required(business.locationType)) errors["business.locationType"] = tr("Selecciona el tipo de local.", "Select the location type.");
    validateYearsMonths(
      errors,
      "business.yearsInBusiness",
      "business.monthsInBusiness",
      business.yearsInBusiness,
      business.monthsInBusiness,
      tr("actividad", "business activity"),
    );
    business.websites.forEach((site, index) => {
      if (site.trim() && !isUrl(site)) {
        errors[`business.websites.${index}`] = tr("Introduce una URL válida (ej. midominio.com).", "Enter a valid URL (e.g. mydomain.com).");
      }
    });
    if (!required(business.businessType)) errors["business.businessType"] = tr("Selecciona el tipo de negocio.", "Select the business type.");
    if (!required(business.country)) errors["business.country"] = tr("Selecciona el país.", "Select the country.");
    if (!required(business.legalAddress)) errors["business.legalAddress"] = tr("Indica la dirección legal completa.", "Enter the full legal address.");
    if (!required(business.city)) errors["business.city"] = tr("Indica la ciudad.", "Enter the city.");
    if (!required(business.state)) errors["business.state"] = tr("Indica el estado o provincia.", "Enter the state or province.");
    if (!required(business.zip)) errors["business.zip"] = tr("Indica el código postal.", "Enter the ZIP / postal code.");
    else if (!/^[A-Za-z0-9 -]{3,10}$/.test(business.zip.trim())) errors["business.zip"] = tr("El código postal no parece válido.", "The ZIP / postal code doesn't look valid.");
    if (!required(business.dbaSameAsLegal)) errors["business.dbaSameAsLegal"] = tr("Indica si la dirección DBA coincide con la legal.", "Indicate whether the DBA address matches the legal address.");
    if (business.dbaSameAsLegal === "no") {
      if (!required(business.dbaAddress)) errors["business.dbaAddress"] = tr("Indica la dirección del DBA.", "Enter the DBA address.");
      if (!required(business.dbaCity)) errors["business.dbaCity"] = tr("Indica la ciudad del DBA.", "Enter the DBA city.");
      if (!required(business.dbaState)) errors["business.dbaState"] = tr("Indica el estado o provincia del DBA.", "Enter the DBA state or province.");
      if (!required(business.dbaZip)) errors["business.dbaZip"] = tr("Indica el código postal del DBA.", "Enter the DBA ZIP / postal code.");
    }
    validateYearsMonths(
      errors,
      "business.yearsAtLocation",
      "business.monthsAtLocation",
      business.yearsAtLocation,
      business.monthsAtLocation,
      tr("antigüedad en la ubicación", "time at this location"),
    );
  }

  if (step === 2) {
    owners.forEach((owner) => {
      const key = (field: string) => `owners.${owner.id}.${field}`;
      if (!required(owner.firstName)) errors[key("firstName")] = tr("Indica el nombre.", "Enter the first name.");
      if (!required(owner.lastName)) errors[key("lastName")] = tr("Indica los apellidos.", "Enter the last name.");
      if (!required(owner.addressMode)) errors[key("addressMode")] = tr("Indica si la dirección coincide con la del negocio.", "Indicate whether the address matches the business address.");
      if (owner.addressMode === "no") {
        if (!required(owner.address)) errors[key("address")] = tr("Indica la dirección personal.", "Enter the home address.");
        if (!required(owner.city)) errors[key("city")] = tr("Indica la ciudad.", "Enter the city.");
        if (!required(owner.state)) errors[key("state")] = tr("Indica el estado o provincia.", "Enter the state or province.");
        if (!required(owner.zip)) errors[key("zip")] = tr("Indica el código postal.", "Enter the ZIP / postal code.");
      }
      validateYearsMonths(
        errors,
        key("yearsAtResidence"),
        key("monthsAtResidence"),
        owner.yearsAtResidence,
        owner.monthsAtResidence,
        tr("residencia", "residence"),
      );
      if (!required(owner.idType)) errors[key("idType")] = tr("Selecciona el tipo de documento.", "Select the ID type.");
      if (!required(owner.idNumber)) errors[key("idNumber")] = tr("Indica el número de documento.", "Enter the ID number.");
      if (onlyDigits(owner.ssn).length !== 9) errors[key("ssn")] = tr("El SSN debe tener 9 dígitos.", "The SSN must have 9 digits.");
      if (!owner.dob) {
        errors[key("dob")] = tr("Indica la fecha de nacimiento.", "Enter the date of birth.");
      } else if (ageFrom(owner.dob) < 18) {
        errors[key("dob")] = tr("El titular debe ser mayor de edad.", "The owner must be at least 18 years old.");
      } else if (ageFrom(owner.dob) > 100) {
        errors[key("dob")] = tr("Revisa la fecha de nacimiento.", "Check the date of birth.");
      }
      if (onlyDigits(owner.phone).length < 7) errors[key("phone")] = tr("Introduce un teléfono válido.", "Enter a valid phone number.");
      if (!isEmail(owner.email)) errors[key("email")] = tr("Introduce un email válido.", "Enter a valid email.");
      const pct = Number(owner.ownershipPct);
      if (!owner.ownershipPct) errors[key("ownershipPct")] = tr("Indica el porcentaje de propiedad.", "Enter the ownership percentage.");
      else if (Number.isNaN(pct) || pct <= 0 || pct > 100) errors[key("ownershipPct")] = tr("Debe estar entre 1 y 100.", "Must be between 1 and 100.");
    });

    const total = totalOwnership(owners);
    if (owners.length === 0) {
      errors["owners.__total"] = tr("Añade al menos un titular.", "Add at least one owner.");
    } else if (Math.round(total) !== 100) {
      errors["owners.__total"] = tr(
        `Los porcentajes suman ${Math.round(total)} %. Deben sumar 100 %.`,
        `Ownership adds up to ${Math.round(total)}%. It must total 100%.`,
      );
    }
  }

  if (step === 3) {
    if (onlyDigits(bank.routingNumber).length !== 9) {
      errors["bank.routingNumber"] = tr("El routing number tiene 9 dígitos.", "The routing number has 9 digits.");
    } else if (!isRoutingChecksumValid(bank.routingNumber)) {
      errors["bank.routingNumber"] = tr("Ese routing number no supera la validación. Revísalo con tu banco.", "That routing number fails validation. Please check it with your bank.");
    }
    if (!required(bank.bankName)) errors["bank.bankName"] = tr("Indica el nombre del banco.", "Enter the bank name.");
    if (onlyDigits(bank.accountNumber).length < 4) errors["bank.accountNumber"] = tr("Introduce el número de cuenta completo.", "Enter the full account number.");
  }

  if (step === 4) {
    if (!required(processing.methods)) errors["processing.methods"] = tr("Selecciona qué métodos necesitas.", "Select the methods you need.");
    if (!required(processing.acceptsCardsNow)) errors["processing.acceptsCardsNow"] = tr("Indica si ya aceptas tarjetas.", "Indicate whether you already accept cards.");
    if (processing.acceptsCardsNow === "yes" && !required(processing.currentProcessor)) {
      errors["processing.currentProcessor"] = tr("Indica con qué procesador trabajas ahora.", "Enter your current processor.");
    }
    if (!processing.monthlyVolume) errors["processing.monthlyVolume"] = tr("El volumen mensual es obligatorio.", "Monthly volume is required.");
    else if (Number(onlyDigits(processing.monthlyVolume)) < 1000) errors["processing.monthlyVolume"] = tr("Indica el volumen real; si es bajo, escríbelo igualmente.", "Enter your actual volume; if it's low, enter it anyway.");
    if (!processing.averageTicket) errors["processing.averageTicket"] = tr("Indica la transacción media.", "Enter the average transaction.");
    if (processing.highTicket && Number(onlyDigits(processing.highTicket)) < Number(onlyDigits(processing.averageTicket))) {
      errors["processing.highTicket"] = tr("La transacción más alta no puede ser menor que la media.", "The highest transaction can't be lower than the average.");
    }
    if (processing.channels.length === 0) errors["processing.channels"] = tr("Selecciona al menos una forma de procesar.", "Select at least one processing channel.");
    if (!required(processing.fraudProtection)) errors["processing.fraudProtection"] = tr("Indica si te interesa la protección de fraude.", "Indicate whether you want fraud protection.");
    if (!required(processing.needsAch)) errors["processing.needsAch"] = tr("Indica si necesitas eChecks / ACH.", "Indicate whether you need eChecks / ACH.");
    if (!required(processing.enrolledRdr)) errors["processing.enrolledRdr"] = tr("Indica si estás dado de alta en RDR u otro programa.", "Indicate whether you're enrolled in RDR or another program.");
  }

  if (step === 4 && !app.consent) {
    errors["consent"] = tr("Debes aceptar el tratamiento de datos para enviar la solicitud.", "You must accept the data processing terms to submit the application.");
  }
  if (step === 4 && !app.partnerConsent) {
    errors["partnerConsent"] = tr(
      "Debes aceptar que compartamos tus datos con nuestros socios y abramos las pasarelas en tu nombre.",
      "You must agree that we share your data with our partners and open the gateways on your behalf.",
    );
  }

  return errors;
}

/** Valida los cuatro pasos y devuelve el primero con errores. */
export function firstStepWithErrors(app: ApplicationState): StepId | null {
  const steps: StepId[] = [1, 2, 3, 4];
  for (const step of steps) {
    if (Object.keys(validateStep(step, app)).length > 0) return step;
  }
  return null;
}

export const errorCount = (errors: Errors): number => Object.keys(errors).length;
