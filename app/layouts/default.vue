<script setup lang="ts">
import { FetchError } from 'ofetch';
import { useDark, useToggle } from '@vueuse/core';
const { user, isAuthenticated, fetchUser } = useAuth();
try {
  await fetchUser();
} catch (error) {
  if (error instanceof FetchError) {
    console.log(error.statusCode, error.message);
  }
}

const authModalOpen = ref<boolean>(false);
const sidebarModalOpen = ref<boolean>(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);

watch(isAuthenticated, (newVal) => {
  if (newVal) {
    authModalOpen.value = false;
  } else {
    sidebarModalOpen.value = false;
  }
});

</script>

<template>
  <div class="flex flex-col justify-between items-center min-h-screen text-white bg-stone-900 light:bg-neutral-200">
    <div class="flex justify-between p-4 dark:bg-stone-900 rounded-md self-stretch">
      <div class="text-2xl">
        <NuxtLink to="/" class="font-bold text-black dark:text-white underline underline-offset-4">
          Feathers
        </NuxtLink>
      </div>

      <div class="flex items-center">
        <div class="relative">
          <div 
            v-if="!isAuthenticated" 
            class="flex items-center gap-4"
          >
            <UButton
              label="Login" 
              variant="subtle" 
              color="secondary" 
              class="text-white light:text-black"
              icon="material-symbols:login-sharp" 
              @click="authModalOpen = true" 
            />

            <div class="flex items-center light:border-black p-2 border border-white rounded-md cursor-pointer grow" @click="toggleDark()">
              <Icon v-if="!isDark" name="ri:moon-clear-fill" class="text-black" />
              <Icon v-if="isDark" name="material-symbols:light-mode-rounded" class="text-white"  />
            </div>
          </div>

          <div v-if="user" class="flex items-center">
            <div class="mr-2 cursor-pointer light:text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><!-- Icon from Zondicons by Steve Schoger - https://github.com/dukestreetstudio/zondicons/blob/master/LICENSE --><path fill="currentColor" d="M4 8a6 6 0 0 1 4.03-5.67a2 2 0 1 1 3.95 0A6 6 0 0 1 16 8v6l3 2v1H1v-1l3-2zm8 10a2 2 0 1 1-4 0z"/></svg>
            </div>
            <Icon 
              name="material-symbols:menu-rounded"
              class="text-3xl mr-2 cursor-pointer light:text-black"
            />
            <UUser
              :avatar="{
                src: user.avatar || '/fallback-avatar.svg',
                alt: user.name,
              }" 
              @click="sidebarModalOpen = true" 
            />
          </div>
        </div>
      </div>
    </div>

    <main class="flex w-full dark:bg-stone-700 grow">
      <slot />
    </main>

    <footer class="w-full dark:bg-stone-800 text-center text-gray-500">
      <div>
        <NuxtLink class="underline" to="/about"> Footer </NuxtLink>
      </div>
    </footer>

    <UModal
      v-model:open="authModalOpen"
      class="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-gray-200 dark:border-stone-700">
      <template #content>
        <AuthCard />
      </template>
    </UModal>
    <UModal
      v-model:open="sidebarModalOpen" fullscreen :overlay="false"
      class="absolute inset-auto right-0 top-16 max-w-3xs min-w-2xs rounded-2xl light:bg-white/80 bg-stone-900/80 backdrop-blur-md border border-gray-200 dark:border-stone-700">
      <template #content>
        <Sidebar />
      </template>
    </UModal>

  </div>
</template>
