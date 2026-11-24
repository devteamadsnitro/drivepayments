import { useSyncExternalStore } from "react";

/**
 * Traducción ligera ES / EN.
 *
 * Los textos se escriben en línea con sus dos versiones: `tr("Continuar", "Continue")`.
 * El idioma vive en un store de módulo para que también funcione fuera de React
 * (validaciones, opciones). Cambiarlo vuelve a renderizar sin perder el estado
 * del formulario.
 */

export type Lang = "es" | "en";
export type Localized = { es: string; en: string };

const STORAGE_KEY = "dp.lang";
const listeners = new Set<() => void>();

function detect(): Lang {
  if (typeof window === "undefined") return "es";
  const fromQuery = new URLSearchParams(window.location.search).get("lang");
  if (fromQuery === "es" || fromQuery === "en") return fromQuery;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* almacenamiento bloqueado */
  }
  const browser = (navigator.languages?.[0] ?? navigator.language ?? "es").toLowerCase();
  return browser.startsWith("es") ? "es" : "en";
}

let current: Lang = detect();

/** Título de la pestaña en el idioma activo (el CRM define el suyo). */
function syncDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = current;
  if (!window.location.pathname.startsWith("/admin")) {
    document.title =
      current === "en" ? "Merchant onboarding · DrivePayments" : "Alta de comercio · DrivePayments";
  }
}
syncDocument();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* almacenamiento bloqueado */
  }
  syncDocument();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Suscribe el componente al idioma actual. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "es" as Lang);
}

/** Devuelve el texto en el idioma actual. */
export function tr(es: string, en: string): string {
  return current === "en" ? en : es;
}

/** Igual que `tr` pero con un objeto `{ es, en }`. */
export function pick(text: Localized | string): string {
  return typeof text === "string" ? text : text[current];
}

/** Hook de conveniencia: suscribe y devuelve `tr`. */
export function useT(): typeof tr {
  useLang();
  return tr;
}

/** Locale para `Intl` / `toLocaleString`. */
export function intlLocale(): string {
  return current === "en" ? "en-US" : "es-ES";
}
