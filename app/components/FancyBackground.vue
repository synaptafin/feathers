<template>
  <div class="absolute w-full h-full">
    <FadeInOut
      v-for="(item, index) in fancyLinks"
      :key="index"
      @invisible="() => onInvisible(index)"
    >
      <NuxtLink 
        :to="'#'" 
        class="text-lg text-blue-400 font-semibold underline hover:text-blue-300 cursor-pointer" 
        style="text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);"
      >
        {{ item.label}}
      </NuxtLink>
    </FadeInOut>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { label: string; to: string }[];
}>();

const emits = defineEmits<{
  (e: 'refill', index: number): void;
}>();

const onInvisible = (index: number) => {
  emits('refill', index);
};

const fancyLinks = props.items.map((item) => ({ ...item, delay: Math.random() * 6000}));

onMounted(() => {

});
</script>

