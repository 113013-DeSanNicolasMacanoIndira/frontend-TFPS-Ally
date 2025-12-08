import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import localeEsAr from '@angular/common/locales/es-AR';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEsAr, 'es-AR');

providers: [
  { provide: LOCALE_ID, useValue: 'es-AR' },
  { provide: DEFAULT_CURRENCY_CODE, useValue: 'ARS' }
];