<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug;
const count = ref(4);
let timer: ReturnType<typeof setInterval> | null = null;

if (slug === 'error') {
  showError({
    statusCode: 500,
    statusMessage: 'This is a simulated error for testing purposes.',
  });
}

onMounted(() => {
  timer = setInterval(() => {
    if (count.value > 1) {
      count.value--;
    } else {
      clearInterval(timer!);
      navigateTo('/');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div>Path /{{ slug }} will redirect to home in {{ count }} seconds...</div>
</template>
