/**
 * i18n module - decoupled from state management
 * Uses event emitter for loose coupling
 */

import { eventBus, Events } from '../core/EventEmitter';
import { setState } from '../state/state';

interface Dictionary {
  [key: string]: string | Dictionary;
}

let translations: Dictionary = {};
let currentLang = 'en';

const SUPPORTED_LANGS = ['en', 'es', 'fr', 'hi', 'ar', 'ja'];
const FALLBACK_LANG = 'en';

/* ---------------- Language Loading ---------------- */

async function loadTranslations(lang: string) {
  try {
    const res = await fetch(`/static/i18n/${lang}.json`);

    if (!res.ok) {
      throw new Error(`Failed to load ${lang}: ${res.status}`);
    }

    translations = await res.json();
    currentLang = lang;

    localStorage.setItem('lang', lang);
    
    // Update state AND emit event for decoupled communication
    setState({ language: lang });
    eventBus.emit(Events.LANGUAGE_CHANGED, { language: lang });
  } catch (err) {
    console.error(`Failed loading "${lang}"`, err);

    if (lang !== FALLBACK_LANG) {
      return loadTranslations(FALLBACK_LANG);
    }

    translations = {};
  }
}

export async function setLanguage(lang: string) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = FALLBACK_LANG;
  }

  await loadTranslations(lang);
}

/* ---------------- Detection ---------------- */

export function detectLanguage(): string {
  const saved = localStorage.getItem('lang');

  if (saved && SUPPORTED_LANGS.includes(saved)) {
    return saved;
  }

  const browserLangs = navigator.languages || [navigator.language];

  for (const lang of browserLangs) {
    const base = lang.split('-')[0];

    if (SUPPORTED_LANGS.includes(base)) return base;
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }

  return FALLBACK_LANG;
}

export function getCurrentLanguage() {
  return currentLang;
}

/* ---------------- Translation ---------------- */

export function t(
  key: string,
  vars: Record<string, string | number> = {},
  fallback = ''
): string {
  let template = resolve(translations, key);

  // pluralization
  if (typeof vars.count === 'number') {
    const pluralKey = `${key}.${vars.count === 1 ? 'one' : 'other'}`;
    const pluralTemplate = resolve(translations, pluralKey);
    template = pluralTemplate ?? template;
  }

  if (!template) {
    template = fallback || key;
  }

  return interpolate(String(template), vars);
}

/* ---------------- Init ---------------- */

export async function initI18n() {
  const lang = detectLanguage();
  await setLanguage(lang);
}

/* ---------------- Helpers ---------------- */

function resolve(obj: Dictionary, path: string): string | undefined {
  return path.split('.').reduce<any>((acc, part) => {
    if (acc && typeof acc === 'object') return acc[part];
    return undefined;
  }, obj);
}

function interpolate(
  str: string,
  vars: Record<string, string | number>
): string {
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}