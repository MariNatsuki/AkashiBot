import { I18n } from 'i18n';
import { dirname, join } from 'path';
import { createModule } from 'utils/create-module';

import { Logger } from '../utils/logger.ts';

export default createModule(() => {
  const logger = new Logger('I18n');

  const i18n = new I18n({
    locales: ['en', 'vi'],
    directory: join(dirname(Bun.main), 'locales'),
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
      disable: false,
    },
  });

  return {
    name: 'I18n',
    provide: {
      i18n,
    },
  };
});
