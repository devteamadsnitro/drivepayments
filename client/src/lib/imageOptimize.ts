import { siteConfig } from "../config/site";

/**
 * Reduce el peso de las fotos antes de cifrarlas.
 *
 * El servidor solo recibe el sobre cifrado, así que la optimización tiene que
 * hacerse aquí, en el navegador: se reescala el lado mayor a
 * `maxImageDimension` px y se recodifica en JPEG. Los PDF no se tocan.
 * Si el resultado no pesa menos que el original, se conserva el original.
 */

const OPTIMIZABLE = /^image\/(jpeg|png|webp|heic|heif)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
/** Por debajo de este tamaño y de la dimensión máxima no merece la pena recodificar. */
const SKIP_BELOW_BYTES = 400 * 1024;

export function isImageFile(file: File): boolean {
  return OPTIMIZABLE.test(file.type) || IMAGE_EXT.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === "function") {
    try {
      // `from-image` respeta la orientación EXIF de las fotos del móvil.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* formato no decodificable por createImageBitmap: probamos con <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } catch {
    return null; // p. ej. HEIC en navegadores que no lo soportan
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toJpegName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "imagen"}.jpg`;
}

export type OptimizeResult = {
  file: File;
  /** true si la imagen se reescaló o recodificó. */
  optimized: boolean;
  /** true si es una imagen que el navegador no pudo abrir (p. ej. HEIC fuera de Safari). */
  undecodable: boolean;
};

export async function optimizeImage(file: File): Promise<OptimizeResult> {
  if (!isImageFile(file)) return { file, optimized: false, undecodable: false };

  const { maxImageDimension, imageQuality } = siteConfig.submission;
  const source = await decode(file);
  if (!source) return { file, optimized: false, undecodable: true };

  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxImageDimension / Math.max(width, height));
  const isJpeg = /jpe?g$/i.test(file.type);

  try {
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES && isJpeg) {
      return { file, optimized: false, undecodable: false };
    }

    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, optimized: false, undecodable: false };
    // Fondo blanco: JPEG no admite transparencia (PNG/WebP con alfa).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", imageQuality),
    );
    if (!blob || (blob.size >= file.size && scale === 1)) {
      return { file, optimized: false, undecodable: false };
    }
    const optimized = new File([blob], toJpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
    return { file: optimized, optimized: true, undecodable: false };
  } finally {
    if ("close" in source) source.close();
  }
}
