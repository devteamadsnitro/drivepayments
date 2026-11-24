import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { siteConfig } from "@/config/site";

const sections = [
  { id: "responsable", title: "Quién trata tus datos" },
  { id: "datos", title: "Qué datos recogemos" },
  { id: "finalidad", title: "Para qué y con qué base legal" },
  { id: "seguridad", title: "Cómo protegemos los datos sensibles" },
  { id: "destinatarios", title: "Con quién los compartimos" },
  { id: "conservacion", title: "Cuánto tiempo los conservamos" },
  { id: "derechos", title: "Tus derechos" },
  { id: "cookies", title: "Cookies y analítica" },
  { id: "contacto", title: "Contacto y reclamaciones" },
];

export default function Privacy() {
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
              Volver al formulario de alta
            </a>
            <p className="eyebrow mt-6">Legal · Versión {siteConfig.legal.privacyVersion}</p>
            <h1 className="mt-2 max-w-[22ch] text-[clamp(2rem,4.6vw,3rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-ink">
              Política de privacidad
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              Este formulario recoge datos de identificación, financieros y documentos. Aquí
              explicamos qué hacemos exactamente con ellos, cómo se cifran y cómo puedes ejercer tus
              derechos.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {[
                { icon: Lock, text: "Cifrado en el navegador antes de enviarse" },
                { icon: ShieldCheck, text: "Acceso limitado al equipo del alta" },
                { icon: Mail, text: "Derechos ejercitables por email" },
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
            <nav aria-label="Índice del documento" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="font-mono text-[9.5px] tracking-[0.16em] text-ink-muted uppercase">
                  Contenido
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
