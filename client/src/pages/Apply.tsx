import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DocumentPanel } from "@/components/form/DocumentPanel";
import { Progress } from "@/components/form/Progress";
import { SuccessScreen } from "@/components/form/SuccessScreen";
import { Step1Business } from "@/components/form/steps/Step1Business";
import { Step2Owners } from "@/components/form/steps/Step2Owners";
import { Step3Bank } from "@/components/form/steps/Step3Bank";
import { Step4Processing } from "@/components/form/steps/Step4Processing";
import { CheckboxLine } from "@/components/form/controls";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { siteConfig } from "@/config/site";
import { publicKeyFingerprint, type EncryptedEnvelope } from "@/lib/crypto";
import { isImageFile, optimizeImage } from "@/lib/imageOptimize";
import {
  countDocuments,
  countRequiredFulfilled,
  createReference,
  submitApplication,
  totalDocumentBytes,
  type DeliveryOutcome,
} from "@/lib/submission";
import { validateStep } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type {
  ApplicationState,
  BankInfo,
  BusinessInfo,
  DocumentMap,
  Errors,
  Owner,
  ProcessingInfo,
  StepId,
} from "@/lib/types";
import { getLang, tr, useLang } from "@/lib/i18n";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;

const createOwner = (): Owner => ({
  id: uid(),
  firstName: "",
  lastName: "",
  addressMode: "",
  country: "US",
  address: "",
  city: "",
  state: "",
  zip: "",
  yearsAtResidence: "",
  monthsAtResidence: "",
  idType: "",
  idNumber: "",
  ssn: "",
  dob: "",
  phone: "",
  email: "",
  ownershipPct: "",
});

const initialState: ApplicationState = {
  business: {
    ownershipType: "",
    legalName: "",
    dbaName: "",
    phoneDial: "+1",
    phone: "",
    businessEmail: "",
    contactMethod: "",
    taxId: "",
    locationType: "",
    yearsInBusiness: "",
    monthsInBusiness: "",
    websites: [""],
    description: "",
    businessType: "",
    country: "US",
    legalAddress: "",
    city: "",
    state: "",
    zip: "",
    dbaSameAsLegal: "",
    dbaAddress: "",
    dbaCity: "",
    dbaState: "",
    dbaZip: "",
    yearsAtLocation: "",
    monthsAtLocation: "",
  },
  owners: [createOwner()],
  bank: { routingNumber: "", bankName: "", accountNumber: "" },
  processing: {
    methods: "",
    acceptsCardsNow: "",
    currentProcessor: "",
    monthlyVolume: "",
    averageTicket: "",
    highTicket: "",
    channels: [],
    fraudProtection: "",
    needsAch: "",
    enrolledRdr: "",
  },
  documents: {},
  consent: false,
};

const createInitialState = (): ApplicationState => ({
  ...initialState,
  business: { ...initialState.business, websites: [""] },
  owners: [createOwner()],
  bank: { ...initialState.bank },
  processing: { ...initialState.processing, channels: [] },
  documents: {},
});

const stepMeta = (): Record<StepId, { title: string; description: string; minutes: string }> => ({
  1: {
    title: tr("Información del negocio", "Business information"),
    description: tr(
      "Datos legales y de contacto de la empresa. Deben coincidir con el registro y con tu banco.",
      "The company's legal and contact details. They must match the registration and your bank.",
    ),
    minutes: "≈ 3 min",
  },
  2: {
    title: tr("Información personal de los titulares", "Owner information"),
    description: tr(
      "Cada persona con el 25 % o más de propiedad, además del firmante autorizado. Añade un titular por socio.",
      "Everyone with 25% or more ownership, plus the authorized signer. Add one owner per partner.",
    ),
    minutes: "≈ 3 min",
  },
  3: {
    title: tr("Datos bancarios del negocio", "Business bank details"),
    description: tr(
      "La cuenta donde quieres recibir las liquidaciones. Debe estar a nombre de la razón social.",
      "The account where you want to receive settlements. It must be in the business's legal name.",
    ),
    minutes: "≈ 1 min",
  },
  4: {
    title: tr("Información de procesamiento", "Processing information"),
    description: tr(
      "Con esto dimensionamos tu cuenta y te proponemos las condiciones. Cuanto más exacto, mejor la propuesta.",
      "This lets us size your account and propose terms. The more accurate, the better the offer.",
    ),
    minutes: "≈ 2 min",
  },
});

const INITIAL_STEP: StepId = 1;

function HelpCard() {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-4">
      <h2 className="text-[13px] font-semibold text-ink">{tr("¿Te atascas en algún punto?", "Stuck on something?")}</h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
        {tr(
          "Escríbenos y lo vemos juntos. Si prefieres, rellenamos el expediente contigo en una llamada.",
          "Message us and we'll work through it together. If you prefer, we can fill in the application with you on a call.",
        )}
      </p>
      <a
        href={siteConfig.contact.telegramUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[11.5px] font-medium text-ink transition-colors hover:border-ink"
      >
        <Send className="size-3" />
        Telegram {siteConfig.contact.telegramHandle}
      </a>
      <p className="mt-2.5 font-mono text-[9.5px] tracking-[0.1em] text-ink-muted uppercase">
        {siteConfig.contact.hours}
      </p>
    </div>
  );
}

function SecurityCard({ fingerprint }: { fingerprint: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-ink p-4 text-paper">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
        <h2 className="font-mono text-[9.5px] tracking-[0.16em] text-paper/70 uppercase">
          {tr("Cómo se tratan tus datos", "How your data is handled")}
        </h2>
      </div>
      <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-paper/65">
        <li className="flex gap-1.5">
          <Check className="mt-[2px] size-3 shrink-0 text-accent" />
          {tr("Cifrado AES-256-GCM en tu navegador antes de enviarse.", "AES-256-GCM encrypted in your browser before it's sent.")}
        </li>
        <li className="flex gap-1.5">
          <Check className="mt-[2px] size-3 shrink-0 text-accent" />
          {tr("Sin borradores guardados en el dispositivo.", "No drafts saved on your device.")}
        </li>
        <li className="flex gap-1.5">
          <Check className="mt-[2px] size-3 shrink-0 text-accent" />
          {tr("Acceso limitado al equipo que tramita el alta.", "Access limited to the onboarding team.")}
        </li>
      </ul>
      <p className="mt-3 border-t border-paper/10 pt-2.5 font-mono text-[9px] tracking-[0.08em] text-paper/40 uppercase">
        {tr("Clave pública", "Public key")} · {fingerprint}
      </p>
    </div>
  );
}

export default function Apply() {
  const [state, setState] = React.useState<ApplicationState>(initialState);
  const [step, setStep] = React.useState<StepId>(INITIAL_STEP);
  const stepRef = React.useRef(step);
  stepRef.current = step;
  const [maxVisited, setMaxVisited] = React.useState<StepId>(INITIAL_STEP);
  const [errors, setErrors] = React.useState<Errors>({});
  const [formNotice, setFormNotice] = React.useState<string | null>(null);
  const [docError, setDocError] = React.useState<string | null>(null);
  const [docBusy, setDocBusy] = React.useState(false);
  // Estado más reciente para los manejadores asíncronos (la optimización tarda).
  const stateRef = React.useRef(state);
  stateRef.current = state;

  // Al cambiar de idioma, rehace los mensajes de error visibles y descarta los
  // avisos sueltos (se volverán a mostrar en el idioma nuevo si siguen aplicando).
  const lang = useLang();
  const langRef = React.useRef(lang);
  React.useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    setErrors((current) => {
      const keys = Object.keys(current);
      if (keys.length === 0) return current;
      const fresh = validateStep(stepRef.current, stateRef.current);
      return Object.fromEntries(keys.filter((key) => fresh[key]).map((key) => [key, fresh[key]]));
    });
    setFormNotice(null);
    setDocError(null);
  }, [lang]);
  const [mobileDocsOpen, setMobileDocsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle");
  const [progressMessage, setProgressMessage] = React.useState(() =>
    tr("Preparando el expediente", "Preparing your application"),
  );
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [envelope, setEnvelope] = React.useState<EncryptedEnvelope | null>(null);
  const [outcome, setOutcome] = React.useState<DeliveryOutcome | null>(null);
  const [fingerprint, setFingerprint] = React.useState("—");
  const [reference] = React.useState(() => createReference());

  const formRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let active = true;
    publicKeyFingerprint().then((value) => {
      if (active) setFingerprint(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const clearErrorsFor = (prefixes: string[]) => {
    setErrors((current) => {
      const next = { ...current };
      let changed = false;
      for (const key of Object.keys(next)) {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  };

  const updateBusiness = (patch: Partial<BusinessInfo>) => {
    setState((current) => ({ ...current, business: { ...current.business, ...patch } }));
    clearErrorsFor(
      Object.keys(patch).map((key) =>
        key === "websites" ? "business.websites" : `business.${key}`,
      ),
    );
  };

  const updateOwner = (id: string, patch: Partial<Owner>) => {
    setState((current) => ({
      ...current,
      owners: current.owners.map((owner) => (owner.id === id ? { ...owner, ...patch } : owner)),
    }));
    clearErrorsFor([
      ...Object.keys(patch).map((key) => `owners.${id}.${key}`),
      "owners.__total",
    ]);
  };

  const addOwner = () => {
    setState((current) => ({ ...current, owners: [...current.owners, createOwner()] }));
    clearErrorsFor(["owners.__total"]);
  };

  const removeOwner = (id: string) => {
    setState((current) => ({
      ...current,
      owners: current.owners.filter((owner) => owner.id !== id),
    }));
    clearErrorsFor(["owners.__total"]);
  };

  const updateBank = (patch: Partial<BankInfo>) => {
    setState((current) => ({ ...current, bank: { ...current.bank, ...patch } }));
    clearErrorsFor(Object.keys(patch).map((key) => `bank.${key}`));
  };

  const updateProcessing = (patch: Partial<ProcessingInfo>) => {
    setState((current) => ({ ...current, processing: { ...current.processing, ...patch } }));
    clearErrorsFor(Object.keys(patch).map((key) => `processing.${key}`));
  };

  const addDocuments = async (slot: string, files: FileList | File[]) => {
    const list = Array.from(files);
    const { acceptedMimeTypes, maxFileBytes, maxImageBytes, maxTotalBytes } = siteConfig.submission;
    const accepted = acceptedMimeTypes as readonly string[];
    const mb = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;

    const valid: DocumentMap[string] = [];
    const rejected: string[] = [];

    setDocBusy(true);
    setDocError(null);
    try {
      for (const original of list) {
        const extensionOk = /\.(pdf|jpe?g|png|heic|heif|webp)$/i.test(original.name);
        const mimeOk = !original.type || accepted.includes(original.type);
        if (!extensionOk && !mimeOk) {
          rejected.push(tr(`${original.name}: formato no admitido`, `${original.name}: unsupported format`));
          continue;
        }

        if (!isImageFile(original)) {
          if (original.size > maxFileBytes) {
            rejected.push(
              tr(`${original.name}: el PDF supera los ${mb(maxFileBytes)}`, `${original.name}: the PDF exceeds ${mb(maxFileBytes)}`),
            );
            continue;
          }
          valid.push({ id: uid(), file: original });
          continue;
        }

        const { file, undecodable } = await optimizeImage(original);
        if (file.size > maxImageBytes) {
          rejected.push(
            undecodable
              ? tr(
                  `${original.name}: imagen demasiado pesada y este navegador no puede optimizarla. Súbela en JPG o PNG.`,
                  `${original.name}: image too large and this browser can't optimize it. Please upload it as JPG or PNG.`,
                )
              : tr(
                  `${original.name}: la imagen sigue superando los ${mb(maxImageBytes)} tras optimizarla`,
                  `${original.name}: the image is still over ${mb(maxImageBytes)} after optimization`,
                ),
          );
          continue;
        }
        valid.push({ id: uid(), file });
      }
    } finally {
      setDocBusy(false);
    }

    const currentTotal = totalDocumentBytes(stateRef.current);
    const addedTotal = valid.reduce((sum, item) => sum + item.file.size, 0);
    if (currentTotal + addedTotal > maxTotalBytes) {
      setDocError(
        tr(
          `El expediente supera los ${mb(maxTotalBytes)}. Envíanos los documentos restantes por Telegram.`,
          `The application exceeds ${mb(maxTotalBytes)}. Send us the remaining documents via Telegram.`,
        ),
      );
      return;
    }

    if (valid.length) {
      setState((current) => ({
        ...current,
        documents: {
          ...current.documents,
          [slot]: [...(current.documents[slot] ?? []), ...valid],
        },
      }));
    }

    setDocError(rejected.length ? rejected.join(" · ") : null);
  };

  const removeDocument = (slot: string, documentId: string) => {
    setState((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [slot]: (current.documents[slot] ?? []).filter((item) => item.id !== documentId),
      },
    }));
  };

  const focusFirstError = (nextErrors: Errors) => {
    const key = Object.keys(nextErrors).find((item) => !item.includes("__total"));
    if (!key) return;
    requestAnimationFrame(() => {
      const element = document.getElementById(key);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as HTMLElement).focus({ preventScroll: true });
      }
    });
  };

  const scrollToForm = () => {
    const node = formRef.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const goNext = () => {
    const nextErrors = validateStep(step, state);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormNotice(tr("Revisa los campos marcados antes de continuar.", "Please review the highlighted fields before continuing."));
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setFormNotice(null);
    if (step < 4) {
      const next = (step + 1) as StepId;
      setStep(next);
      setMaxVisited((current) => (next > current ? next : current));
      scrollToForm();
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((step - 1) as StepId);
    setFormNotice(null);
    scrollToForm();
  };

  const goTo = (target: StepId) => {
    if (target > maxVisited) return;
    setStep(target);
    setFormNotice(null);
    scrollToForm();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "submitting" || docBusy) return;

    const steps: StepId[] = [1, 2, 3, 4];
    const firstInvalid = steps.find((item) => Object.keys(validateStep(item, state)).length > 0);

    if (firstInvalid) {
      const nextErrors = validateStep(firstInvalid, state);
      setErrors(nextErrors);
      setStep(firstInvalid);
      setMaxVisited((current) => (firstInvalid > current ? firstInvalid : current));
      setFormNotice(
        firstInvalid === 4
          ? tr(
              "Falta aceptar el tratamiento de datos o completar el perfil de procesamiento.",
              "You still need to accept the data processing terms or complete the processing profile.",
            )
          : tr(
              `Faltan datos obligatorios en el paso ${firstInvalid}.`,
              `Required information is missing in step ${firstInvalid}.`,
            ),
      );
      focusFirstError(nextErrors);
      return;
    }

    setStatus("submitting");
    setSubmitError(null);
    setProgressMessage(tr("Preparando el expediente", "Preparing your application"));

    try {
      const { envelope: nextEnvelope, outcome: nextOutcome } = await submitApplication(
        state,
        reference,
        setProgressMessage,
      );
      setEnvelope(nextEnvelope);
      setOutcome(nextOutcome);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("idle");
      setSubmitError(
        error instanceof Error
          ? error.message
          : tr("No se pudo completar el envío. Vuelve a intentarlo.", "The submission couldn't be completed. Please try again."),
      );
    }
  };

  const reset = () => {
    setState(createInitialState());
    setErrors({});
    setStep(1);
    setMaxVisited(1);
    setEnvelope(null);
    setOutcome(null);
    setStatus("idle");
    setFormNotice(null);
    setDocError(null);
    setSubmitError(null);
    setMobileDocsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requiredDocs = countRequiredFulfilled(state);
  const documentCount = countDocuments(state);
  const meta = stepMeta()[step];

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <Header />

      <main className="flex-1">
        {status === "success" && outcome ? (
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <SuccessScreen
              reference={reference}
              outcome={outcome}
              envelope={envelope}
              onReset={reset}
            />
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden border-b border-line">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
              <div className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="flex flex-col gap-4">
                  <p className="eyebrow flex items-center gap-2">
                    <span className="inline-block size-1.5 bg-accent-deep" aria-hidden="true" />
                    {tr("Alta de comercio · Expediente", "Merchant onboarding · Application")} {reference}
                  </p>
                  <h1 className="max-w-[19ch] text-[clamp(2.1rem,5.2vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-ink">
                    {tr("Abre tu cuenta de comercio en cuatro pasos.", "Open your merchant account in four steps.")}
                  </h1>
                  <p className="max-w-xl text-[14.5px] leading-relaxed text-ink-muted sm:text-[15.5px]">
                    {tr(
                      "Rellenamos el expediente contigo y lo presentamos al procesador. Cuanto más completo llegue, antes recibes el alta y las condiciones finales.",
                      "We complete the application with you and submit it to the processor. The more complete it is, the sooner you're approved and get final terms.",
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Clock className="size-3.5" aria-hidden="true" />{tr("≈ 8 minutos", "≈ 8 minutes")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Lock className="size-3.5" aria-hidden="true" />
                      {tr("Cifrado en tu navegador", "Encrypted in your browser")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      {tr("Revisión en 24–48 h", "Reviewed in 24–48 h")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Check className="size-3.5" aria-hidden="true" />
                      {tr("Sin coste ni compromiso", "No cost, no commitment")}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-[1280px] px-4 pb-4 sm:px-6 lg:px-8">
              <div className="grid items-start gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-9 lg:pt-9">
                <div className="order-2 min-w-0 lg:order-1">
                  <div className="sticky top-16 z-30 -mx-4 bg-paper/92 px-4 py-3 backdrop-blur sm:-mx-0 sm:px-0 lg:top-[70px]">
                    <Progress step={step} maxVisited={maxVisited} onNavigate={goTo} />
                  </div>

                  <div ref={formRef} className="relative mt-4 sm:mt-5">
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      aria-busy={status === "submitting"}
                      className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"
                    >
                      <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
                        <div>
                          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                            {tr("Paso", "Step")} 0{step} / 04
                          </p>
                          <h2 className="mt-1.5 text-[21px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[24px]">
                            {meta.title}
                          </h2>
                          <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-ink-muted">
                            {meta.description}
                          </p>
                        </div>
                        <span className="hidden shrink-0 rounded-full border border-line px-2 py-1 font-mono text-[9.5px] tracking-[0.1em] text-ink-muted uppercase sm:block">
                          {meta.minutes}
                        </span>
                      </div>

                      {formNotice ? (
                        <div
                          role="alert"
                          className="mt-4 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-[12px] text-danger"
                        >
                          {formNotice}
                        </div>
                      ) : null}

                      {submitError ? (
                        <div
                          role="alert"
                          className="mt-4 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-[12px] text-danger"
                        >
                          {submitError}
                        </div>
                      ) : null}

                      <div key={step} className="animate-step-in mt-6">
                        {step === 1 ? (
                          <Step1Business
                            business={state.business}
                            errors={errors}
                            update={updateBusiness}
                          />
                        ) : null}
                        {step === 2 ? (
                          <Step2Owners
                            owners={state.owners}
                            errors={errors}
                            updateOwner={updateOwner}
                            addOwner={addOwner}
                            removeOwner={removeOwner}
                          />
                        ) : null}
                        {step === 3 ? (
                          <Step3Bank bank={state.bank} errors={errors} update={updateBank} />
                        ) : null}
                        {step === 4 ? (
                          <Step4Processing
                            processing={state.processing}
                            errors={errors}
                            update={updateProcessing}
                          />
                        ) : null}
                      </div>

                      {step === 4 ? (
                        <div className="mt-8 flex flex-col gap-4">
                          <div className="rounded-xl border border-line bg-paper/60 p-4">
                            <p className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
                              {tr("Resumen del expediente", "Application summary")}
                            </p>
                            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                              {[
                                {
                                  label: tr("Negocio", "Business"),
                                  value:
                                    state.business.dbaName || state.business.legalName || "—",
                                },
                                { label: tr("Titulares", "Owners"), value: String(state.owners.length) },
                                {
                                  label: tr("Documentos", "Documents"),
                                  value: `${documentCount} · ${requiredDocs.done}/${requiredDocs.total}`,
                                },
                                {
                                  label: tr("Método", "Method"),
                                  value:
                                    state.processing.methods === "cards"
                                      ? tr("Tarjetas", "Cards")
                                      : state.processing.methods === "ach"
                                        ? "ACH"
                                        : state.processing.methods === "both"
                                          ? tr("Tarjetas + ACH", "Cards + ACH")
                                          : "—",
                                },
                              ].map((item) => (
                                <div key={item.label} className="min-w-0">
                                  <dt className="font-mono text-[9px] tracking-[0.12em] text-ink-muted uppercase">
                                    {item.label}
                                  </dt>
                                  <dd className="mt-0.5 truncate text-[12.5px] font-medium text-ink">
                                    {item.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>

                          <CheckboxLine
                            id="consent"
                            checked={state.consent}
                            onChange={(checked) => {
                              setState((current) => ({ ...current, consent: checked }));
                              clearErrorsFor(["consent"]);
                            }}
                            error={errors["consent"]}
                          >
                            {tr("He leído y acepto la", "I have read and accept the")}{" "}
                            <a
                              href={getLang() === "en" ? "/privacy" : "/privacidad"}
                              target="_blank"
                              rel="noreferrer"
                              className="link-underline font-medium text-ink"
                            >
                              {tr("política de privacidad", "privacy policy")}
                            </a>{" "}
                            {tr(
                              "y autorizo a DrivePayments a tratar estos datos y los documentos adjuntos para tramitar el alta con el procesador y el banco adquirente.",
                              "and authorize DrivePayments to process this data and the attached documents to complete onboarding with the processor and the acquiring bank.",
                            )}
                          </CheckboxLine>
                        </div>
                      ) : null}

                      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={goBack}
                          disabled={step === 1 || status === "submitting"}
                          className="inline-flex h-11 items-center justify-center gap-1.5 self-start rounded-xl border border-line px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                        >
                          <ArrowLeft className="size-3.5" />
                          {tr("Atrás", "Back")}
                        </button>

                        <div className="flex items-center gap-3">
                          <span className="hidden text-[11px] text-ink-muted sm:block">
                            {step === 4
                              ? tr("Revisa el resumen antes de enviar", "Review the summary before submitting")
                              : tr("Puedes volver atrás sin perder lo introducido", "You can go back without losing what you've entered")}
                          </span>
                          {step < 4 ? (
                            <button
                              type="button"
                              onClick={goNext}
                              className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-soft sm:flex-none"
                            >
                              {tr("Continuar", "Continue")}
                              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ) : (
                            <button
                              type="submit"
                              disabled={status === "submitting" || docBusy}
                              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[13.5px] font-semibold text-ink transition-all hover:bg-accent-deep disabled:opacity-70 sm:flex-none"
                            >
                              <Lock className="size-3.5" />
                              {tr("Enviar solicitud", "Submit application")}
                            </button>
                          )}
                        </div>
                      </div>

                      {status === "submitting" ? (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 p-6 backdrop-blur-sm">
                          <span
                            className="size-9 animate-spin rounded-full border-2 border-line border-t-ink"
                            aria-hidden="true"
                          />
                          <p className="font-mono text-[10px] tracking-[0.16em] text-ink uppercase">
                            {progressMessage}
                          </p>
                          <p className="max-w-xs text-center text-[11.5px] leading-relaxed text-ink-muted">
                            {tr(
                              "No cierres esta pestaña. Los datos y los documentos se están cifrando en tu dispositivo.",
                              "Don't close this tab. Your data and documents are being encrypted on your device.",
                            )}
                          </p>
                        </div>
                      ) : null}
                    </form>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {[
                        { icon: Lock, text: tr("Cifrado AES-256-GCM en el navegador", "AES-256-GCM encryption in the browser") },
                        { icon: ShieldCheck, text: tr("Sin borradores en este dispositivo", "No drafts on this device") },
                        { icon: Check, text: tr("Revisión humana del expediente", "Human review of every application") },
                      ].map((item) => (
                        <div
                          key={item.text}
                          className="flex items-start gap-1.5 rounded-lg border border-line/70 bg-white/50 px-2.5 py-2"
                        >
                          <item.icon className="mt-[1px] size-3 shrink-0 text-ink-muted" aria-hidden="true" />
                          <span className="text-[10.5px] leading-snug text-ink-muted">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-[86px]">
                  <button
                    type="button"
                    onClick={() => setMobileDocsOpen((current) => !current)}
                    aria-expanded={mobileDocsOpen}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-left lg:hidden"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-ink font-mono text-[9px] text-accent">
                        {requiredDocs.done}
                      </span>
                      <span className="text-[12.5px] font-medium text-ink">
                        {tr("Documentos", "Documents")} · {requiredDocs.done}/{requiredDocs.total}{" "}
                        {tr("obligatorios", "required")}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-ink-muted transition-transform",
                        mobileDocsOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <div className="relative">
                    <div
                      className={cn(
                        "mt-3 lg:mt-0 lg:max-h-[calc(100dvh-104px)] lg:overflow-y-auto lg:pr-1 lg:pb-2",
                        mobileDocsOpen ? "block animate-step-in" : "hidden lg:block",
                      )}
                    >
                    <DocumentPanel
                      documents={state.documents}
                      onAdd={addDocuments}
                      onRemove={removeDocument}
                      error={docError}
                      busy={docBusy}
                      onDismissError={() => setDocError(null)}
                    />
                      <HelpCard />
                      <SecurityCard fingerprint={fingerprint} />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-7 bg-gradient-to-t from-paper to-transparent lg:block"
                      aria-hidden="true"
                    />
                  </div>
                </aside>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
