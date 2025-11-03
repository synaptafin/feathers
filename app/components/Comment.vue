<template>
  <div>
    <p>{{ props.author }}</p>
    <p>{{ props.datetime }}</p>
    <p>{{ props.id }}</p>
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  id?: string | undefined;
  author?: string | undefined;
  datetime?: string | undefined;
}>()

useHead({
  script: [
    {
      async: true,
      src: '',
      type: 'module',
    },
  ],
})

</script>
