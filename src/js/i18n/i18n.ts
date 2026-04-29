import { getState } from '../state/state';

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    about: 'About',
    user: 'User'
  }
};

export function t(key: string): string {
  const lang = getState().language;
  return translations[lang]?.[key] || key;
}