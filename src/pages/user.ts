import { t } from '../i18n/i18n';

export function render(params: { id: string }) {
  return `
    <h1>${t('user')} ${params.id}</h1>
    <a href="/" data-link>${t('home')}</a>
  `;
}