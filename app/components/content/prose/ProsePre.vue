<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
const { copy, copied, isSupported } = useClipboard({
  source: '',
  copiedDuring: 1000,
});
defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
});
</script>
<template>
  <div class="relative rounded-lg">
    <pre :class="$props.class">
      <slot />
    </pre>
    <div class="absolute top-2 right-2 flex items-center space-x-2">
      <Icon
        v-if="isSupported && !copied"
        name="proicons:copy"
        class="size-5 text-white hover:scale-125 cursor-pointer"
        @click="
          () => {
            copy($props.code);
          }
        "
      />
      <Icon v-if="copied" name="fe:check" class="size-5 text-green-500" />
    </div>
  </div>
</template>

<style>
pre code .line {
  display: block;
}
</style>
