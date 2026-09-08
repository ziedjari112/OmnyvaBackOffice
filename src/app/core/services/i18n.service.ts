import { Injectable, effect, signal } from '@angular/core';
import { Locale, RTL_LOCALES, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'omnyva.backoffice.locale';
const SUPPORTED: Locale[] = ['en', 'fr', 'ar'];

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>(this.readInitialLocale());

  constructor() {
    effect(() => {
      const locale = this.locale();
      localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    });
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  t(key: string, params?: Record<string, string | number>): string {
    let value = TRANSLATIONS[this.locale()][key] ?? TRANSLATIONS['en'][key] ?? key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      }
    }
    return value;
  }

  private readInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && SUPPORTED.includes(stored)) return stored;

    const browserLang = navigator.language.slice(0, 2) as Locale;
    return SUPPORTED.includes(browserLang) ? browserLang : 'en';
  }
}
