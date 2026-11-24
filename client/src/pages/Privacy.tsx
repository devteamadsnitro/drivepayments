import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { siteConfig } from "@/config/site";
import { getLang, tr } from "@/lib/i18n";

const getSections = () => [
  { id: "responsable", title: tr("Quién trata tus datos", "Who processes your data") },
  { id: "datos", title: tr("Qué datos recogemos", "What data we collect") },
  { id: "finalidad", title: tr("Para qué y con qué base legal", "Purpose and legal basis") },
  { id: "seguridad", title: tr("Cómo protegemos los datos sensibles", "How we protect sensitive data") },
  { id: "destinatarios", title: tr("Con quién los compartimos", "Who we share it with") },
  { id: "conservacion", title: tr("Cuánto tiempo los conservamos", "How long we keep it") },
  { id: "derechos", title: tr("Tus derechos", "Your rights") },
  { id: "cookies", title: tr("Cookies y analítica", "Cookies and analytics") },
  { id: "contacto", title: tr("Contacto y reclamaciones", "Contact and complaints") },
];

/** Fecha de la versión vigente (la misma en ambos idiomas). */
const versionLabel = () =>
  getLang() === "en" ? PRIVACY_VERSION_EN : siteConfig.legal.privacyVersion;
const PRIVACY_VERSION_EN = "November 24, 2026";

export default function Privacy() {
  const sections = getSections();
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <Header />

      <main className="flex-1">
        <div className="border-b border-line">
          <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-3.5" />
              {tr("Volver al formulario de alta", "Back to the application form")}
            </a>
            <p className="eyebrow mt-6">
              Legal · {tr("Versión", "Version")} {versionLabel()}
            </p>
            <h1 className="mt-2 max-w-[22ch] text-[clamp(2rem,4.6vw,3rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-ink">
              {tr("Política de privacidad", "Privacy policy")}
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              {tr(
                "Este formulario recoge datos de identificación, financieros y documentos. Aquí explicamos qué hacemos exactamente con ellos, cómo se cifran y cómo puedes ejercer tus derechos.",
                "This form collects identification and financial data and documents. Here we explain exactly what we do with them, how they're encrypted and how you can exercise your rights.",
              )}
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {[
                { icon: Lock, text: tr("Cifrado en el navegador antes de enviarse", "Encrypted in the browser before sending") },
                { icon: ShieldCheck, text: tr("Acceso limitado al equipo del alta", "Access limited to the onboarding team") },
                { icon: Mail, text: tr("Derechos ejercitables por email", "Rights exercisable by email") },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-2 rounded-lg border border-line bg-white px-3 py-2.5"
                >
                  <item.icon className="mt-[1px] size-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                  <span className="text-[11.5px] leading-snug text-ink-muted">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
            <nav aria-label={tr("Índice del documento", "Table of contents")} className="hidden lg:block">
              <div className="sticky top-24">
                <p className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
                  {tr("Contenido", "Contents")}
                </p>
                <ol className="mt-3 space-y-1.5">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex gap-2 text-[12px] leading-snug text-ink-muted transition-colors hover:text-ink"
                      >
                        <span className="font-mono text-[10px] text-ink-muted/60">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            {getLang() === "en" ? <PrivacyArticleEn /> : <PrivacyArticleEs />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PrivacyArticleEs() {
  return (
    <article className="max-w-[680px] text-[13.5px] leading-relaxed text-ink/85">
      <section id="responsable" className="scroll-mt-24">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          01 · Quién trata tus datos
        </h2>
        <p className="mt-2.5">
          El responsable del tratamiento es <strong>{siteConfig.legal.entity}</strong>, con
          domicilio profesional en {siteConfig.legal.jurisdiction}. Puedes contactar con
          nosotros en{" "}
          <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>
        <p className="mt-2.5">
          DrivePayments actúa como intermediario en la tramitación del alta de comercio. El
          procesador de pagos y el banco adquirente que finalmente aprueben la cuenta actúan
          como responsables independientes de los datos que les remitimos para el alta y la
          prevención del fraude.
        </p>
      </section>

      <section id="datos" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          02 · Qué datos recogemos
        </h2>
        <p className="mt-2.5">A través de este formulario tratamos:</p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">
            <strong>Identificación del negocio:</strong> razón social, nombre comercial, Tax
            ID/EIN, dirección, antigüedad y actividad.
          </li>
          <li className="list-disc">
            <strong>Datos de contacto:</strong> teléfono, email y método de contacto
            preferido.
          </li>
          <li className="list-disc">
            <strong>Datos de los titulares:</strong> nombre, dirección, fecha de nacimiento,
            número de documento, SSN y porcentaje de propiedad.
          </li>
          <li className="list-disc">
            <strong>Datos financieros:</strong> banco, routing number, número de cuenta y
            volumen de procesamiento previsto.
          </li>
          <li className="list-disc">
            <strong>Documentación:</strong> carné de conducir, cheque anulado o carta del
            banco, escritura de constitución, extractos bancarios y de procesamiento y, en su
            caso, acuerdo de fulfillment.
          </li>
          <li className="list-disc">
            <strong>Datos técnicos mínimos:</strong> idioma, zona horaria y navegador, para
            poder reproducir incidencias del formulario.
          </li>
        </ul>
        <p className="mt-3">
          El SSN, el número de cuenta y los documentos son datos sensibles desde el punto de
          vista de la seguridad. Solo se solicitan porque el procesador los exige para el
          alta y la verificación KYC/AML.
        </p>
      </section>

      <section id="finalidad" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          03 · Para qué y con qué base legal
        </h2>
        <p className="mt-2.5">Usamos los datos exclusivamente para:</p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">Preparar y presentar tu solicitud de alta de comercio.</li>
          <li className="list-disc">
            Verificar la identidad del negocio y de sus titulares (KYC/AML) antes de remitir
            el expediente.
          </li>
          <li className="list-disc">
            Atender consultas, incidencias y requerimientos documentales del procesador.
          </li>
          <li className="list-disc">
            Cumplir obligaciones legales de prevención del blanqueo de capitales y fraude.
          </li>
        </ul>
        <p className="mt-3">
          La base legal es tu <strong>consentimiento explícito</strong> (art. 6.1.a RGPD) para
          el tratamiento de los datos del formulario, la{" "}
          <strong>ejecución de medidas precontractuales</strong> (art. 6.1.b) en lo relativo a
          la tramitación del alta y el <strong>cumplimiento de obligaciones legales</strong>{" "}
          (art. 6.1.c) en materia de prevención del fraude y KYC. No usamos tus datos para
          publicidad ni los vendemos.
        </p>
      </section>

      <section id="seguridad" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          04 · Cómo protegemos los datos sensibles
        </h2>
        <p className="mt-2.5">
          El formulario aplica cifrado en el propio navegador antes de que la información
          salga de tu dispositivo:
        </p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">
            Se genera una clave <strong>AES-256-GCM</strong> efímera para cada solicitud y se
            cifran con ella los datos y los documentos.
          </li>
          <li className="list-disc">
            Esa clave se envuelve con una clave pública <strong>RSA-OAEP de 4096 bits</strong>{" "}
            cuya clave privada no está en el servidor web.
          </li>
          <li className="list-disc">
            El envío se hace siempre por <strong>HTTPS/TLS</strong>. Nunca se envían datos en
            claro ni por email abierto.
          </li>
          <li className="list-disc">
            No guardamos borradores en el almacenamiento del navegador: si cierras la
            pestaña, los datos introducidos se descartan.
          </li>
          <li className="list-disc">
            El acceso al expediente se limita al personal que tramita el alta, con registro
            de accesos y acuerdo de confidencialidad.
          </li>
        </ul>
        <p className="mt-3">
          Ningún sistema es infalible. Si se produjera una brecha de seguridad que afecte a
          tus datos, lo notificaremos a la autoridad de control y a las personas afectadas en
          los plazos que exige el RGPD.
        </p>
      </section>

      <section id="destinatarios" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          05 · Con quién los compartimos
        </h2>
        <p className="mt-2.5">
          Remitimos el expediente únicamente a: el procesador de pagos y el banco adquirente
          que evalúan el alta; los proveedores de verificación de identidad y prevención del
          fraude que intervienen en el proceso; y, cuando exista una obligación legal, a las
          autoridades competentes. Todos ellos actúan bajo contrato de encargo o como
          responsables independientes con sus propias políticas.
        </p>
        <p className="mt-2.5">
          Algunos de estos destinatarios pueden estar fuera del Espacio Económico Europeo
          (principalmente en Estados Unidos). En esos casos la transferencia se ampara en la
          decisión de adecuación del marco de privacidad UE-EE. UU. o en cláusulas
          contractuales tipo.
        </p>
      </section>

      <section id="conservacion" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          06 · Cuánto tiempo los conservamos
        </h2>
        <p className="mt-2.5">
          Si la solicitud no llega a tramitarse, conservamos el expediente un máximo de 12
          meses desde el último contacto. Si se formaliza el alta, los datos se conservan
          mientras dure la relación comercial y, después, durante los plazos de prescripción
          legal aplicables (con carácter general, 5 años en materia mercantil y de prevención
          del blanqueo de capitales). Los documentos se destruyen de forma segura al vencer
          esos plazos.
        </p>
      </section>

      <section id="derechos" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          07 · Tus derechos
        </h2>
        <p className="mt-2.5">
          Puedes solicitar el acceso, la rectificación, la supresión, la limitación, la
          portabilidad y la oposición al tratamiento de tus datos, así como retirar el
          consentimiento en cualquier momento, escribiendo a{" "}
          <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          con el asunto «Protección de datos» e indicando la referencia del expediente.
          Responderemos en un plazo máximo de un mes.
        </p>
        <p className="mt-2.5">
          Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante
          la Agencia Española de Protección de Datos (AEPD) o ante la autoridad de control de
          tu país de residencia.
        </p>
      </section>

      <section id="cookies" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          08 · Cookies y analítica
        </h2>
        <p className="mt-2.5">
          Esta web no utiliza cookies publicitarias ni de perfilado. Solo emplea
          almacenamiento técnico imprescindible para el funcionamiento del formulario durante
          la sesión, y no guarda datos personales en él. Las tipografías se cargan desde un
          proveedor externo, que recibe la dirección IP de la petición.
        </p>
      </section>

      <section id="contacto" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          09 · Contacto y reclamaciones
        </h2>
        <p className="mt-2.5">
          Para cualquier duda sobre esta política o sobre el tratamiento de tu expediente,
          escríbenos a{" "}
          <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          o por Telegram en{" "}
          <a
            className="link-underline text-ink"
            href={siteConfig.contact.telegramUrl}
            target="_blank"
            rel="noreferrer"
          >
            {siteConfig.contact.telegramHandle}
          </a>
          . Horario de atención: {siteConfig.contact.hours}.
        </p>
        <p className="mt-6 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
          Última actualización · {siteConfig.legal.privacyVersion}
        </p>
      </section>
    </article>
  );
}

function PrivacyArticleEn() {
  const mail = (
    <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>
      {siteConfig.contact.email}
    </a>
  );
  return (
    <article className="max-w-[680px] text-[13.5px] leading-relaxed text-ink/85">
      <section id="responsable" className="scroll-mt-24">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          01 · Who processes your data
        </h2>
        <p className="mt-2.5">
          The data controller is <strong>{siteConfig.legal.entity}</strong>, with its business
          address in {siteConfig.legal.jurisdiction}. You can contact us at {mail}.
        </p>
        <p className="mt-2.5">
          DrivePayments acts as an intermediary in processing your merchant onboarding. The payment
          processor and the acquiring bank that ultimately approve the account act as independent
          controllers of the data we send them for onboarding and fraud prevention.
        </p>
      </section>

      <section id="datos" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          02 · What data we collect
        </h2>
        <p className="mt-2.5">Through this form we process:</p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">
            <strong>Business identification:</strong> legal name, trade name (DBA), Tax ID/EIN,
            address, time in business and industry.
          </li>
          <li className="list-disc">
            <strong>Contact details:</strong> phone, email and preferred contact method.
          </li>
          <li className="list-disc">
            <strong>Owner details:</strong> name, address, date of birth, ID number, SSN and
            ownership percentage.
          </li>
          <li className="list-disc">
            <strong>Financial data:</strong> bank, routing number, account number and expected
            processing volume.
          </li>
          <li className="list-disc">
            <strong>Documents:</strong> driver&apos;s license, voided check or bank letter,
            articles of incorporation, bank and processing statements and, where applicable, a
            fulfillment agreement.
          </li>
          <li className="list-disc">
            <strong>Minimal technical data:</strong> language, time zone and browser, so we can
            reproduce issues with the form.
          </li>
        </ul>
        <p className="mt-3">
          The SSN, account number and documents are sensitive from a security standpoint. We only
          request them because the processor requires them for onboarding and KYC/AML
          verification.
        </p>
      </section>

      <section id="finalidad" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          03 · Purpose and legal basis
        </h2>
        <p className="mt-2.5">We use the data exclusively to:</p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">Prepare and submit your merchant onboarding application.</li>
          <li className="list-disc">
            Verify the identity of the business and its owners (KYC/AML) before submitting the
            application.
          </li>
          <li className="list-disc">
            Handle questions, issues and document requests from the processor.
          </li>
          <li className="list-disc">
            Comply with legal obligations on anti-money laundering and fraud prevention.
          </li>
        </ul>
        <p className="mt-3">
          The legal basis is your <strong>explicit consent</strong> (Art. 6(1)(a) GDPR) for
          processing the form data, the <strong>performance of pre-contractual measures</strong>{" "}
          (Art. 6(1)(b)) for processing your onboarding, and{" "}
          <strong>compliance with legal obligations</strong> (Art. 6(1)(c)) regarding fraud
          prevention and KYC. We don&apos;t use your data for advertising and we don&apos;t sell
          it.
        </p>
      </section>

      <section id="seguridad" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          04 · How we protect sensitive data
        </h2>
        <p className="mt-2.5">
          The form encrypts everything in your browser before the information leaves your device:
        </p>
        <ul className="mt-2.5 space-y-1.5 pl-4">
          <li className="list-disc">
            A one-time <strong>AES-256-GCM</strong> key is generated for each application and used
            to encrypt the data and documents.
          </li>
          <li className="list-disc">
            That key is wrapped with a <strong>4096-bit RSA-OAEP</strong> public key whose private
            key is not stored on the web server.
          </li>
          <li className="list-disc">
            Data is always sent over <strong>HTTPS/TLS</strong>. Nothing is ever sent in plain text
            or by regular email.
          </li>
          <li className="list-disc">
            We don&apos;t save drafts in browser storage: if you close the tab, the information you
            entered is discarded.
          </li>
          <li className="list-disc">
            Access to applications is limited to the staff handling onboarding, with access logging
            and a confidentiality agreement.
          </li>
        </ul>
        <p className="mt-3">
          No system is infallible. If a security breach affecting your data occurs, we will notify
          the supervisory authority and the affected individuals within the deadlines required by
          the GDPR.
        </p>
      </section>

      <section id="destinatarios" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          05 · Who we share it with
        </h2>
        <p className="mt-2.5">
          We send the application only to: the payment processor and acquiring bank evaluating the
          onboarding; the identity verification and fraud prevention providers involved in the
          process; and, where there is a legal obligation, the competent authorities. All of them
          act under a data processing agreement or as independent controllers with their own
          policies.
        </p>
        <p className="mt-2.5">
          Some of these recipients may be located outside the European Economic Area (mainly in the
          United States). In those cases the transfer relies on the EU-US Data Privacy Framework
          adequacy decision or on standard contractual clauses.
        </p>
      </section>

      <section id="conservacion" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          06 · How long we keep it
        </h2>
        <p className="mt-2.5">
          If the application doesn&apos;t move forward, we keep it for a maximum of 12 months from
          the last contact. If the account is opened, the data is kept for the duration of the
          business relationship and then for the applicable statutory limitation periods
          (generally 5 years for commercial and anti-money laundering purposes). Documents are
          securely destroyed when those periods expire.
        </p>
      </section>

      <section id="derechos" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">07 · Your rights</h2>
        <p className="mt-2.5">
          You can request access to, rectification, erasure, restriction and portability of your
          data, object to its processing, and withdraw your consent at any time by writing to{" "}
          {mail} with the subject “Data protection” and your application reference. We will reply
          within one month at most.
        </p>
        <p className="mt-2.5">
          If you believe we haven&apos;t handled your request properly, you can file a complaint
          with the Spanish Data Protection Agency (AEPD) or with the supervisory authority in your
          country of residence.
        </p>
      </section>

      <section id="cookies" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          08 · Cookies and analytics
        </h2>
        <p className="mt-2.5">
          This website doesn&apos;t use advertising or profiling cookies. It only uses the
          technical storage strictly necessary for the form to work during the session (and to
          remember your language choice), and it stores no personal data there. Fonts are loaded
          from an external provider, which receives the IP address of the request.
        </p>
      </section>

      <section id="contacto" className="mt-8 scroll-mt-24 border-t border-line pt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          09 · Contact and complaints
        </h2>
        <p className="mt-2.5">
          For any questions about this policy or how your application is handled, write to us at{" "}
          {mail} or on Telegram at{" "}
          <a
            className="link-underline text-ink"
            href={siteConfig.contact.telegramUrl}
            target="_blank"
            rel="noreferrer"
          >
            {siteConfig.contact.telegramHandle}
          </a>
          . Support hours: {siteConfig.contact.hours}.
        </p>
        <p className="mt-6 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase">
          Last updated · {versionLabel()}
        </p>
      </section>
    </article>
  );
}
