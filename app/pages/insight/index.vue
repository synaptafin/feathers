<template>
  <div>{{ res }}</div>
</template>
<script setup lang="ts">
const { data: res } = useAsyncData(() => $fetch('/api/abc'));
</script>
