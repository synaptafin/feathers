import { consola } from 'consola';
import { colors } from 'consola/utils';
import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'feathers',
    configKey: 'feathers',
  },
  setup(options, nuxt) {
    nuxt.hook('build:before', async () => {
      let message = '';
      if (!process.env.BASE_URL) {
        message += colors.cyanBright('BASE_URL') + 'is not set ';
      }
      if (!process.env.SITE_INDEXABLE) {
        message += colors.cyanBright('SITE_INDEXABLE') + ' is not set. Site will not be indexed by search engines..n';
      }
      consola.warn(message);
    });
  },
});
