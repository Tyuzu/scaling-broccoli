import { t } from '../i18n/i18n';

export function render() {
  return `
    <h1>${t('about')}</h1>
    <a href="/" data-link>${t('home')}</a>
  `;
}