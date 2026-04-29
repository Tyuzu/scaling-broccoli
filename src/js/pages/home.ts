import { t } from '../i18n/i18n';

export function render() {
  return `
    <h1>${t('home')}</h1>
    <a href="/about" data-link>${t('about')}</a>
    <a href="/user/42" data-link>${t('user')} 42</a>
  `;
}