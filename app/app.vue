<script setup lang="ts">
import { useAnalytics } from '#imports';
import { useColorMode, useDark } from '@vueuse/core';

const config = useAppConfig();
const layout = 'default';

useAnalytics();
useColorMode({ initialValue: 'light' });
useDark().value = true;

useSchemaOrg([
  defineWebSite({
    name: config.name as string,
    url: config.url as string,
    description: config.description as string,
    inLanguage: (config.language as string) || 'en',
  }),
]);

useHead({
  htmlAttrs: {
    lang: (config.language as string) || 'en',
  },
  link: [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  meta: [
    {
      key: 'poweredBy',
      name: 'poweredBy',
      content: 'Feathers',
    },
    {
      key: 'feathers-theme',
      name: 'feathers-theme',
      content: 'default',
    },
  ],
});
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout :name="layout" fallback="invalid">
    <NuxtPage />
  </NuxtLayout>
</template>
