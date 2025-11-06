<script setup lang="ts">
const items = [
  { icon: 'mingcute:empty-box-line', text: 'Home' },
  { icon: 'mingcute:tool-line', text: 'Insight', link: '/insight' },
  { icon: 'mingcute:empty-box-line', text: 'Void', link: '/empty' },
  { icon: 'hugeicons:constellation', text: 'Personal Wiki', link: '/linked-notes' },
  { icon: 'mingcute:tool-line', text: 'Inspiration', link: '/inspiration' },
  { icon: 'mingcute:tool-line', text: 'Graph', link: '/graph' },
  { icon: 'streamline-sharp:browser-error-404-remix', text: 'Error', link: '/error' },
];
</script>

<template>
  <div class="w-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-12 py-12 px-24">
    <IndexCard v-for="item in items" :key="item.text" :icon-name="item.icon" :text="item.text" :to="item.link" />
  </div>
</template>
