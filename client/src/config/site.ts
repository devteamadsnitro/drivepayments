/**
 * Configuración única de la web de alta de comercios.
 *
 * Todo lo que hay que personalizar antes de publicar está en este archivo:
 * datos de contacto, endpoint de recepción y clave pública de cifrado.
 */

import { tr } from "../lib/i18n";

export const siteConfig = {
  brand: {
    name: "DrivePayments",
    product: "Merchant Onboarding",
    /** Colores de marca documentados (se aplican en client/src/index.css). */
    palette: {
      ink: "#0b0e12",
      paper: "#f4f2ec",
      accent: "#c9f24d",
    },
  },

  contact: {
    email: "merchants@drivepayments.com",
    telegramHandle: "@danmanud",
    telegramUrl: "https://t.me/danmanud",
    get hours() {
      return tr("Lun–Vie · 9:00–19:00 CET", "Mon–Fri · 9:00–19:00 CET");
    },
    get replyTime() {
      return tr("Respondemos en menos de 24 h laborables", "We reply within 24 business hours");
    },
  },

  submission: {
    /**
     * URL HTTPS del endpoint que recibirá el sobre cifrado (POST JSON).
     * Déjalo vacío para trabajar en modo entrega: el navegador generará un
     * archivo cifrado descargable que podrás enviar por un canal seguro.
     */
    endpoint: "/api/submissions",

    /**
     * Clave pública RSA-OAEP-256 (4096 bits) a la que se cifra cada solicitud.
     * La clave privada correspondiente NUNCA está en esta web: guárdala offline
     * y úsala con `scripts/decrypt-submission.mjs`.
     * Genera tu propio par con `node scripts/generate-keys.mjs`.
     */
    publicKeyJwk: {
      kty: "RSA",
      n: "t6W9lbCsOBBmiZzhdw-qRECxz3prJcsAebKA4OwS1RdzLv05VjkSigXfu98NGMpPLlwazR7ifF__Isk3aeEq8zxt5v53pIq0q-FPHg6XP-YDPFdhu_u-NxmsalSfLdITtm5p2Z41Aey4a87sLEM8prYZOEbDyWWm_EGcJpSJeGW5IoWTBW2HfUqcso7q2ozSLW9FCrBia9q84LnYwMVrWA1xmCodzoDO8ql0Yqjy3d-cu_xRHXNApbe4phQedYJPkUmvZUmE4EIqB1PSmwq4MWvCMWaib3h3qvJhrp2l6xzFfxmPa_wb7vhqwFXizpON3t_NAy9zKOHtQTWv0LnnsHuOQFFxC9x-4kdB_7nQqSQ7VcgBFY2pUQAvn_WTtZxdTtQmrOaeLMdWm_1PL37tjcjzjz5GkcI9i5LCeCaOaGsNtrRyJeFTlsBCGHAXmtIRTvjfA3ybioGCdr4cj6d2xBN7yK1FR82MNlgIdq1ylkEAmDWb2s7Rpz9jVpRtN3K0pV9EJB-pgbvrhvke_iaOuPh99_5hZg2S426XUpTV36DrGW2vU8LDiBw9naMK7zqNa66eosXsXpWs2lOoNyMBZPVGNaHJ5cQ1tLC2AGY_0YEuCWyTE_uHoB1iXzlM6_yNr3nXgPwgjSTE1cKTixUBTk3oryA9fUT-llwf0rY7pY8",
      e: "AQAB",
      alg: "RSA-OAEP-256",
      ext: true,
      key_ops: ["encrypt"],
    } satisfies JsonWebKey,

    /**
     * Límites de los documentos adjuntos (se aplican después de optimizar).
     * Las fotos se reescalan en el navegador antes de cifrarlas: el lado mayor
     * queda en `maxImageDimension` px (legible para DNI, cheques y extractos) y
     * se recodifican en JPEG con calidad `imageQuality`. Los PDF no se modifican.
     */
    maxFileBytes: 10 * 1024 * 1024, // PDF
    maxImageBytes: 3 * 1024 * 1024, // imagen ya optimizada
    maxTotalBytes: 30 * 1024 * 1024,
    maxImageDimension: 2400,
    imageQuality: 0.82,
    acceptedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/heic",
      "image/heif",
      "image/webp",
    ],
    acceptedExtensions: ".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp",
  },

  legal: {
    privacyVersion: "25 de noviembre de 2026",
    entity: "DrivePayments",
    get jurisdiction() {
      return tr("España / Estados Unidos", "Spain / United States");
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
