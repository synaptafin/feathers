<script setup lang="ts">
const items = [
  { icon: 'streamline-sharp:sword-attack-solid', text: 'Home' },
  { icon: 'streamline-sharp:sword-attack-solid', text: 'Insight', link: '/insight' },
  { icon: 'streamline-sharp:sword-attack-solid', text: 'Attack', link: '/attack' },
  { icon: 'hugeicons:constellation', text: 'Linked Notes', link: '/linked-notes' },
  { icon: 'streamline-sharp:sword-attack-solid', text: 'Inspiration', link: '/inspiration' },
  { icon: 'streamline-sharp:sword-attack-solid', text: 'Graph', link: '/graph' },
  { icon: 'streamline-sharp:browser-error-404-remix', text: 'Error', link: '/error' },
];
</script>

<template>
  <div class="w-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-12 py-12 px-24">
    <IndexCard v-for="item in items" :key="item.text" :icon-name="item.icon" :text="item.text" :to="item.link" />
  </div>
</template>
