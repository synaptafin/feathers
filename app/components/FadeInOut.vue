<template>
  <div 
    ref="rootRef" class="absolute fadeInOut" 
    :class="{ fadeInOutFreeze: isFreezing || isLock}"
    :style="inlineStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface PropOpts {
  opts?: {
    freezing?: boolean;
    delay?: number;
  } 
  coord?: {
    x: number;
    y: number;
  }
};

const props = defineProps<PropOpts>();

const rootRef = ref<HTMLElement | null>(null);
const isFreezing = computed(() => props.opts?.freezing);
const isLock = ref(true);

const inlineStyle = computed(() => ({
  left: `${props.coord?.x}px`,
  top: `${props.coord?.y}px`,
}));

const emits = defineEmits<{
  (e: 'invisible'): void;
}>();

const animationEndHandler = (_: Event) => {
  emits('invisible');
};

onMounted(() => {
  setTimeout(() => {
    isLock.value = false;
  }, props.opts?.delay ? props.opts?.delay : Math.random() * 4000);
  rootRef.value?.addEventListener('animationiteration', animationEndHandler);
});

onUnmounted(() => {
  rootRef.value?.removeEventListener('animationiteration', animationEndHandler);
});
</script>

<style scoped>
.fadeInOut {
  animation: fancy 7s ease-out infinite;
  animation-play-state: running;
}

.fadeInOut:hover {
  transform: scale(1) !important;
  animation-play-state: paused;
}

.fadeInOutFreeze {
  animation-play-state: paused;
}

@keyframes fancy {
  0% {
    transform: scale(0);
  }

  45% {
    transform: scale(1);
  }

  55% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}
</style>
