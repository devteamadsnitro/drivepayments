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
      n: "nqrJXoQVqAGsCtj2ZVI8G38tV72Q9oA2QlsJYWTDfMccZHBqLGx6avGVjniDm8spX49vPbXvJFOhPb-L3KzCSBPytAUDcRnp0bHYUp7rSBdrGUmbZHZhm5fDpc8SwbGbSdR0ZgUsDyugmAmN-uHV2NWIslxiqGNGfipdBQRIRh3OMjgk5aEC6M1R4K1D8H7gGOw41ENTYXhmaoU-h6YxyjbrpywcPhdpsKVC3I-6idOTXBTKEbysOSi-bo9SwzaF5WUP3OL494PxFNaKGmsl5Fs5Y9bQ5hl9ITgSxZXHeKSKrJv5Z2f2Hgi6ajz5nd-G3v7vvVSjhqHYjC2luoj284A-doGJg4uWBLwRONdxFbL_tUaWkxF1XlCMWQsphf_dA2mQ2Xf39hHLBpCUVBPOMGE7E-JBsv0EmvrLFLvWs-CxKuxKBpgTkWsZqJNybuD7mB8A7R2zdhTMzb7D1-EPtaEq9C76BOXkAQwc83HUVWGIgoAIB3sDVZGqkxg7wgKvmyF2mgfrI0aGBZUHSmFrcdv27xBH3Tr16SrHntAL3eeyVuHuTTweXIn2Hr5XY8VdOGojal4dui49i0DZ2SUe5XCyOtdo5ZOD0mGzPdMM7XMJpI5171OUra4nzxWpymni10t75313VwUGQ3dhN4D7oPzxUa1Sb2-xWzWz4fa9nbk",
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
    privacyVersion: "24 de noviembre de 2026",
    entity: "DrivePayments",
    get jurisdiction() {
      return tr("España / Estados Unidos", "Spain / United States");
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
