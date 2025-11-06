<template>
  <div class="relative w-full self-stretch">
    <div class="absolute top-4 left-4 z-50">
      <div>Refill: {{ refilledCount }}</div>
      <div>Remove: {{ removedCount }}</div>
      <div>Coloumns: {{ cols }}</div>
      <div>Rows: {{ rows }}</div>
      <div>Active: {{ currentActive }}</div>
    </div>
    <div
      class="absolute w-1/2 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex justify-center z-10 glass-card shadow-xl"
    >
      <ClientOnly>
        <UContentSearchButton
          :collapsed="false"
          class="w-full rounded-full bg-teal-900"
        />
        <ContentSearch
          v-model:search-term="searchTerm"
          shortcut="meta_k"
          :files="files"
          :navigation="navigation"
          :links="hrefs"
          :fuse="{ resultLimit: 12 }"
        />
      </ClientOnly>
    </div>
    <div
      class="absolute w-full top-1/2 translate-y-16 flex justify-center space-x-10 glass-overlay"
    >
      <Icon
        v-if="docsStatus === 'pending'"
        name="svg-spinners:270-ring-with-bg"
        class="text-4xl text-amber-800"
      />
      <Icon
        v-else
        name="ic:baseline-done"
        class="text-4xl text-lime-400 fancy-icon-done"
      />
      <Icon
        v-if="navStatus === 'pending'"
        name="svg-spinners:270-ring-with-bg"
        class="text-4xl text-amber-800"
      />
      <Icon
        v-else
        name="ic:baseline-done"
        class="text-4xl text-lime-400 fancy-icon-done"
      />
      <Icon
        v-if="filesStatus === 'pending'"
        name="svg-spinners:270-ring-with-bg"
        class="text-4xl text-amber-800"
      />
      <Icon
        v-else
        name="ic:baseline-done"
        class="text-4xl text-lime-400 fancy-icon-done"
      />
    </div>
    <div ref="fancyRef" class="absolute w-full h-full linked-notes-bg">
      <div v-for="(link, index) in fancyLinks" :key="index">
        <FadeInOut
          v-if="link"
          class="fancy-link"
          :opts="{ freezing: isFreezing }"
          :coord="{ x: link.x, y: link.y }"
          @invisible="() => onInvisible(index)"
        >
          <NuxtLink :to="link.to">
            {{ link.label }}
          </NuxtLink>
        </FadeInOut>
      </div>
    </div>
    <Icon
      name="fad:random-2dice"
      class="absolute top-1/3 right-1/2 translate-x-1/2 dark:text-white text-8xl cursor-pointer"
    />
    <div
      v-if="isFreezing"
      class="absolute top-6 right-6 dark:text-white text-4xl cursor-pointer fancy-icon"
    >
      <Icon name="oui:lock" @click="() => (isFreezing = false)" />
    </div>
    <div
      v-else
      class="absolute top-6 right-6 dark:text-white text-4xl cursor-pointer fancy-icon"
    >
      <Icon name="oui:lock-open" @click="() => (isFreezing = true)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocsCollectionItem } from '@nuxt/content';
import { useResizeObserver, useDebounceFn } from '@vueuse/core';

const removedCount = ref(0);
const refilledCount = ref(0);
const cols = ref(0);
const rows = ref(0);
const currentActive = computed(() => {
  return fancyLinks.value.filter((link) => link !== null).length;
});

const searchTerm = ref('');
const isFreezing = ref(false);

const { data: docs, status: docsStatus } = await useAsyncData<
  Pick<DocsCollectionItem, 'path' | 'title'>[]
>(LINKED_NOTES_ALL_KEY, async () =>
  queryCollection('docs').select('path', 'title').all(),
);

const { data: files, status: filesStatus } = await useLazyAsyncData(
  LINKED_NOTES_SEARCH_SECTION_KEY,
  async () => queryCollectionSearchSections('docs'),
  { server: false },
);

const { data: navigation, status: navStatus } = await useLazyAsyncData(
  LINKED_NOTES_NAVIGATION_KEY,
  async () => queryCollectionNavigation('docs'),
);

const { data: hrefs } = await useAsyncData(LINKED_NOTES_HREFS_KEY, async () =>
  docs.value?.map((doc) => {
    const regex = /\/([^/]+$)/;
    const match = doc.path.match(regex);
    const pageName = match ? match[1] : doc.path;
    return { label: pageName, to: doc.path };
  }),
);

type ScatteredLink = { to: string; label?: string; x: number; y: number };
const fancyRef = ref<HTMLElement | null>(null);
const fancyLinks = ref<(ScatteredLink | null)[]>([]);
// const fancyState = useState<ScatteredLink[]>('fancyLinks', () => fancyLinks.value);
let poissonDisc: PoissonDisc;

onMounted(() => {
  const width = fancyRef.value?.clientWidth || 0;
  const height = fancyRef.value?.clientHeight || 0;
  poissonDisc = new PoissonDisc(width, height, 150);
  cols.value = poissonDisc.cols;
  rows.value = poissonDisc.rows;
  const points = poissonDisc.points;

  if (!hrefs.value) {
    return;
  }

  if (hrefs.value.length == 0 || points.length === 0) {
    return;
  }

  points.map((point, index) => {
    const docIndex = Math.floor(Math.random() * (hrefs.value!.length - 1)) + 1;
    const link = hrefs.value![docIndex]!;
    if (point) {
      fancyLinks.value[index] = { ...link, ...point };
    }
  });
});

const resizeHandler = useDebounceFn((entries) => {
  console.log('Resize detected');
  const entry = entries[0];
  if (entry) {
    const { width, height } = entry.contentRect;
    poissonDisc.resize(width, height);
    cols.value = poissonDisc.cols;
    rows.value = poissonDisc.rows;
  }
}, 600);

useResizeObserver(fancyRef, resizeHandler);

let timeout: ReturnType<typeof setTimeout> | null;
const onInvisible = (index: number) => {
  if (!hrefs.value) {
    return;
  }

  removedCount.value += 1;
  poissonDisc.removeAtIndex(index);
  fancyLinks.value[index] = null;

  if (timeout) {
    return;
  }

  timeout = setTimeout(() => {
    timeout = null;
  }, 1000);

  const refilledPoints = poissonDisc.fillDisc(150, 123);
  refilledCount.value += refilledPoints.length;
  for (const idxPoint of refilledPoints) {
    if (idxPoint) {
      const randomIndex = Math.floor(Math.random() * (hrefs.value.length - 1)) + 1;
      const link = hrefs.value[randomIndex]!;
      fancyLinks.value[idxPoint[0]] = { ...link, ...idxPoint[1] };
    }
  }
};
</script>

<style scoped>
/* Modern Fascinating Background for Linked Notes */
.linked-notes-bg {
  background: linear-gradient(120deg, #214b74, #2e5d84, #254f6f, #22690d);
  background-size: 400%;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .linked-notes-bg {
    background: repeating-linear-gradient(135deg, #0a0b1f, #153a21, #0a0b1f);
    background-size: 200% 200%;
  }
}

/* Glassmorphism Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.24);
  transition: box-shadow 0.3s;
}

.glass-card {
  background: rgba(36, 37, 42, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Modern Link Styles */
.light .fancy-link {
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #60a5fa;
  text-shadow: 0 0 12px rgba(96, 165, 250, 0.5);
  transition:
    color 0.2s,
    text-shadow 0.2s,
    transform 0.2s;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(2px);
}

.fancy-link {
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #a5b4fc; /* Soft indigo */
  text-shadow: 
    0 0 12px rgba(165, 180, 252, 0.4),
    0 0 24px rgba(129, 140, 248, 0.2);
  transition:
    color 0.3s ease,
    text-shadow 0.3s ease,
    transform 0.2s ease,
    background 0.3s ease;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 45, 0.6),
    rgba(45, 45, 60, 0.4)
  );
  backdrop-filter: blur(8px);
  border: 1px solid rgba(165, 180, 252, 0.15);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.fancy-link:hover {
  color: #38bdf8;
  text-shadow: 0 0 18px #38bdf8;
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.18);
}

.fancy-link {
  color: #a5b4fc;
  background: rgba(36, 37, 42, 0.18);
}

.fancy-link:hover {
  color: #818cf8;
  text-shadow: 0 0 18px #818cf8;
}

.fancy-icon:hover {
  filter: drop-shadow(0 0 1.5rem #ff9a00);
  transform: scale(1.1);
}

/* Overlay for Glassmorphism */
.glass-overlay {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border-radius: 2rem;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.12);
}

.glass-overlay {
  background: rgba(36, 37, 42, 0.18);
}

@keyframes floatShape {
  0% {
    transform: translateY(0) scale(1);
  }

  100% {
    transform: translateY(24px) scale(1.08);
  }
}

/* Responsive tweaks for mobile */
@media (max-width: 640px) {
  .glass-card {
    border-radius: 1rem;
  }
}
</style>
