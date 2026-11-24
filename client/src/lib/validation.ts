import type { ApplicationState, Errors, Owner, StepId } from "./types";

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
  return new Intl.NumberFormat("es-ES").format(Number(d));
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

const requiredMsg = "Este campo es obligatorio.";

function validateYearsMonths(
  errors: Errors,
  yearsKey: string,
  monthsKey: string,
  years: string,
  months: string,
  yearsLabel: string,
) {
  if (!required(years)) {
    errors[yearsKey] = requiredMsg;
  } else if (Number(years) < 0 || Number(years) > 80) {
    errors[yearsKey] = "Introduce un número de años válido (0–80).";
  }
  if (months !== "" && (Number(months) < 0 || Number(months) > 11)) {
    errors[monthsKey] = "Los meses deben estar entre 0 y 11.";
  }
  if (required(years) && Number(years) === 0 && (!months || Number(months) === 0)) {
    errors[monthsKey] = `Indica al menos un mes de ${yearsLabel}.`;
  }
}

export function validateStep(step: StepId, app: ApplicationState): Errors {
  const errors: Errors = {};
  const { business, owners, bank, processing } = app;

  if (step === 1) {
    if (!required(business.ownershipType)) errors["business.ownershipType"] = "Selecciona el tipo de titularidad.";
    if (!required(business.legalName)) errors["business.legalName"] = "Indica la razón social exacta del registro.";
    if (!required(business.dbaName)) errors["business.dbaName"] = "Indica el nombre comercial con el que operas.";
    if (onlyDigits(business.phone).length < 7) errors["business.phone"] = "Introduce un teléfono válido (mínimo 7 dígitos).";
    if (!isEmail(business.businessEmail)) errors["business.businessEmail"] = "Introduce un email de negocio válido.";
    if (!required(business.contactMethod)) errors["business.contactMethod"] = "Elige cómo prefieres que te contactemos.";
    if (onlyDigits(business.taxId).length !== 9) errors["business.taxId"] = "El Tax ID / EIN tiene 9 dígitos.";
    if (!required(business.locationType)) errors["business.locationType"] = "Selecciona el tipo de local.";
    validateYearsMonths(
      errors,
      "business.yearsInBusiness",
      "business.monthsInBusiness",
      business.yearsInBusiness,
      business.monthsInBusiness,
      "actividad",
    );
    business.websites.forEach((site, index) => {
      if (site.trim() && !isUrl(site)) {
        errors[`business.websites.${index}`] = "Introduce una URL válida (ej. midominio.com).";
      }
    });
    if (!required(business.businessType)) errors["business.businessType"] = "Selecciona el tipo de negocio.";
    if (!required(business.country)) errors["business.country"] = "Selecciona el país.";
    if (!required(business.legalAddress)) errors["business.legalAddress"] = "Indica la dirección legal completa.";
    if (!required(business.city)) errors["business.city"] = "Indica la ciudad.";
    if (!required(business.state)) errors["business.state"] = "Indica el estado o provincia.";
    if (!required(business.zip)) errors["business.zip"] = "Indica el código postal.";
    else if (!/^[A-Za-z0-9 -]{3,10}$/.test(business.zip.trim())) errors["business.zip"] = "El código postal no parece válido.";
    if (!required(business.dbaSameAsLegal)) errors["business.dbaSameAsLegal"] = "Indica si la dirección DBA coincide con la legal.";
    if (business.dbaSameAsLegal === "no") {
      if (!required(business.dbaAddress)) errors["business.dbaAddress"] = "Indica la dirección del DBA.";
      if (!required(business.dbaCity)) errors["business.dbaCity"] = "Indica la ciudad del DBA.";
      if (!required(business.dbaState)) errors["business.dbaState"] = "Indica el estado o provincia del DBA.";
      if (!required(business.dbaZip)) errors["business.dbaZip"] = "Indica el código postal del DBA.";
    }
    validateYearsMonths(
      errors,
      "business.yearsAtLocation",
      "business.monthsAtLocation",
      business.yearsAtLocation,
      business.monthsAtLocation,
      "antigüedad en la ubicación",
    );
  }

  if (step === 2) {
    owners.forEach((owner) => {
      const key = (field: string) => `owners.${owner.id}.${field}`;
      if (!required(owner.firstName)) errors[key("firstName")] = "Indica el nombre.";
      if (!required(owner.lastName)) errors[key("lastName")] = "Indica los apellidos.";
      if (!required(owner.addressMode)) errors[key("addressMode")] = "Indica si la dirección coincide con la del negocio.";
      if (owner.addressMode === "no") {
        if (!required(owner.address)) errors[key("address")] = "Indica la dirección personal.";
        if (!required(owner.city)) errors[key("city")] = "Indica la ciudad.";
        if (!required(owner.state)) errors[key("state")] = "Indica el estado o provincia.";
        if (!required(owner.zip)) errors[key("zip")] = "Indica el código postal.";
      }
      validateYearsMonths(
        errors,
        key("yearsAtResidence"),
        key("monthsAtResidence"),
        owner.yearsAtResidence,
        owner.monthsAtResidence,
        "residencia",
      );
      if (!required(owner.idType)) errors[key("idType")] = "Selecciona el tipo de documento.";
      if (!required(owner.idNumber)) errors[key("idNumber")] = "Indica el número de documento.";
      if (onlyDigits(owner.ssn).length !== 9) errors[key("ssn")] = "El SSN debe tener 9 dígitos.";
      if (!owner.dob) {
        errors[key("dob")] = "Indica la fecha de nacimiento.";
      } else if (ageFrom(owner.dob) < 18) {
        errors[key("dob")] = "El titular debe ser mayor de edad.";
      } else if (ageFrom(owner.dob) > 100) {
        errors[key("dob")] = "Revisa la fecha de nacimiento.";
      }
      if (onlyDigits(owner.phone).length < 7) errors[key("phone")] = "Introduce un teléfono válido.";
      if (!isEmail(owner.email)) errors[key("email")] = "Introduce un email válido.";
      const pct = Number(owner.ownershipPct);
      if (!owner.ownershipPct) errors[key("ownershipPct")] = "Indica el porcentaje de propiedad.";
      else if (Number.isNaN(pct) || pct <= 0 || pct > 100) errors[key("ownershipPct")] = "Debe estar entre 1 y 100.";
    });

    const total = totalOwnership(owners);
    if (owners.length === 0) {
      errors["owners.__total"] = "Añade al menos un titular.";
    } else if (Math.round(total) !== 100) {
      errors["owners.__total"] = `Los porcentajes suman ${Math.round(total)} %. Deben sumar 100 %.`;
    }
  }

  if (step === 3) {
    if (onlyDigits(bank.routingNumber).length !== 9) {
      errors["bank.routingNumber"] = "El routing number tiene 9 dígitos.";
    } else if (!isRoutingChecksumValid(bank.routingNumber)) {
      errors["bank.routingNumber"] = "Ese routing number no supera la validación. Revísalo con tu banco.";
    }
    if (!required(bank.bankName)) errors["bank.bankName"] = "Indica el nombre del banco.";
    if (onlyDigits(bank.accountNumber).length < 4) errors["bank.accountNumber"] = "Introduce el número de cuenta completo.";
  }

  if (step === 4) {
    if (!required(processing.methods)) errors["processing.methods"] = "Selecciona qué métodos necesitas.";
    if (!required(processing.acceptsCardsNow)) errors["processing.acceptsCardsNow"] = "Indica si ya aceptas tarjetas.";
    if (processing.acceptsCardsNow === "yes" && !required(processing.currentProcessor)) {
      errors["processing.currentProcessor"] = "Indica con qué procesador trabajas ahora.";
    }
    if (!processing.monthlyVolume) errors["processing.monthlyVolume"] = "El volumen mensual es obligatorio.";
    else if (Number(onlyDigits(processing.monthlyVolume)) < 1000) errors["processing.monthlyVolume"] = "Indica el volumen real; si es bajo, escríbelo igualmente.";
    if (!processing.averageTicket) errors["processing.averageTicket"] = "Indica la transacción media.";
    if (processing.highTicket && Number(onlyDigits(processing.highTicket)) < Number(onlyDigits(processing.averageTicket))) {
      errors["processing.highTicket"] = "La transacción más alta no puede ser menor que la media.";
    }
    if (processing.channels.length === 0) errors["processing.channels"] = "Selecciona al menos una forma de procesar.";
    if (!required(processing.fraudProtection)) errors["processing.fraudProtection"] = "Indica si te interesa la protección de fraude.";
    if (!required(processing.needsAch)) errors["processing.needsAch"] = "Indica si necesitas eChecks / ACH.";
    if (!required(processing.enrolledRdr)) errors["processing.enrolledRdr"] = "Indica si estás dado de alta en RDR u otro programa.";
  }

  if (step === 4 && !app.consent) {
    errors["consent"] = "Debes aceptar el tratamiento de datos para enviar la solicitud.";
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
