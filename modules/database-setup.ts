import { addServerImportsDir, defineNuxtModule, useLogger } from '@nuxt/kit';

const logger = useLogger('database-setup');
export default defineNuxtModule({
  meta: {
    name: 'database-setup',
    configKey: 'databaseSetup',
    compatibility: {
      nuxt: '>=3.0.0',
    },
    version: '0.0.1',
  },
  defaults: {
    enabled: false,
  },
  setup(options, nuxt) {
    nuxt.hook()
  },
});
