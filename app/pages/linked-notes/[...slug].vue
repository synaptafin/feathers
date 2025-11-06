<template>
  <div class="h-full w-full">
    <div
      class="h-full bg-white/90 dark:bg-stone-800/90 border-gray-200 dark:border-gray-700"
    >
      <nav
        class="flex items-center p-3 text-sm font-medium overflow-x-auto border-b border-gray-100 dark:border-gray-700"
      >
        <NuxtLink
          to="/linked-notes"
          class="text-blue-400 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        >
          linked-notes
        </NuxtLink>
        <div
          v-for="(crumb, idx) in breadcrumbSegments.slice(1)"
          :key="crumb.path"
          class="flex items-center"
        >
          <!-- Chevron Separator -->
          <svg
            class="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <NuxtLink
            v-if="idx < breadcrumbSegments.length - 2"
            :to="crumb.path"
            class="text-blue-400 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {{ crumb.name }}
          </NuxtLink>
          <span
            v-else
            class="text-gray-900 dark:text-white font-semibold px-2 py-1"
          >{{ crumb.name }}</span
          >
        </div>
      </nav>
      <div class="px-6 py-6">
        <ContentRenderer
          v-if="doc"
          :value="doc"
          :prose="true"
          :class="'prose' + (isDark ? ' dark' : '')"
        />
        <!-- <div v-else>Home not found</div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core';

const route = useRoute();
const isDark = useDark();

// Compute breadcrumb segments from the route path
const breadcrumbSegments = computed(() => {
  const segments = route.path.replace(/^\//, '').split('/');
  let path = '';
  return segments.map((seg) => {
    path += '/' + seg;
    return {
      name: seg,
      path: path,
    };
  });
});

// ✨ Use a computed key based on the route path
const { data: doc } = await useAsyncData(
  `doc-${route.path}`, // 👈 Add dynamic key
  () => queryCollection('docs').path(route.path).first(),
  {
    watch: [() => route.path], // 👈 Watch route changes
  }
);

// // ✨ Or alternatively, manually refresh on route change
// watch(() => route.path, async () => {
//   const { data: newDoc } = await useAsyncData(
//     `doc-${route.path}`,
//     () => queryCollection('docs').path(route.path).first()
//   );
//   doc.value = newDoc.value;
// });

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Document not found' });
}

useSeoMeta(doc.value?.seo || {});
useSeoMeta({
  title: doc.value?.title,
  description: doc.value?.description,
  ogType: 'article',
  twitterTitle: doc.value?.title,
  twitterCard: 'summary',
});
</script>
