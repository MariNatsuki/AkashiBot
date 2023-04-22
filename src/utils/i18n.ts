import i18n from 'i18n';
import { join } from 'path';

import { Logger } from './logger';

const logger = new Logger('I18n');

i18n.configure({
  locales: ['en', 'vi'],
  directory: join(__dirname, '..', 'locales'),
  defaultLocale: 'en',
  retryInDefaultLocale: true,
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    logger.log(msg);
  },

  logErrorFn: function (msg) {
    logger.log(msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ['{{', '}}'],
    disable: false
  }
});

i18n.setLocale(process.env.LOCALE || 'en');

export { i18n };
