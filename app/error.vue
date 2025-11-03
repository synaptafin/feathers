<template>
  <NuxtLayout :name="layout" fallback="invalid">
    <div
      class="w-full p-6 border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <h5
        class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        Error
      </h5>
      <p class="w-full font-normal text-gray-700 dark:text-gray-400">
        <strong>{{ error.statusCode }}</strong> - {{ error.message }}
      </p>
      <button
        v-if="isDev"
        class="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-150 ease-in-out"
        @click="toggleErrorStack = !toggleErrorStack"
      >
        ErrorStack
      </button>
      <div
        v-if="toggleErrorStack"
        class="border-2 mt-4 overflow-x-scroll"
        v-html="error.stack"
      />
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
import type { NuxtError } from '#app';
const layout = 'default';

const isDev = import.meta.env.DEV;

const toggleErrorStack = ref(false);

defineProps<{
  error: NuxtError;
}>();
</script>
