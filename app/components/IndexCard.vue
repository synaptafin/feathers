<template>
  <div
    class="relative flex flex-col w-40 h-48 justify-around items-center p-4 border rounded-lg dark:border-slate-700 shadow hover:shadow-md dark:hover:shadow-slate-200/40 dark:hover:shadow-lg transition-all bg-white dark:bg-stone-700"
  >
    <Icon :name="iconName" class="mb-2 text-7xl text-blue-500" />
    <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{
      text
    }}</span>
    <NuxtLink v-if="to" :to="to" class="absolute inset-0" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  iconName: {
    type: String,
    default: 'svg-spinners:pulse-rings-multiple',
  },
  text: {
    type: String,
    default: 'Card Name',
  },
  to: {
    type: String,
    required: false,
    default: null,
  }
});
</script>
