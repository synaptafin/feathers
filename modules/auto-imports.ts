import {
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit';

const logger = useLogger('database-setup');
export default defineNuxtModule({
  meta: {
    name: 'auto-imports',
    configKey: 'autoImports',
    compatibility: {
      nuxt: '>=3.0.0',
    },
    version: '0.0.1',
  },
  defaults: {
    enabled: false,
  },
  setup(options, nuxt) {
    // logger.box('Setting up auto-imports for server/database...');
  },
});
