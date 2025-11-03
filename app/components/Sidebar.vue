<template>
  <div class="px-4 py-2">
    <div class="pb-2 flex justify-between items-center">
      <div class="flex items-center light:border-black gap-2 cursor-pointer grow" @click="toggleDark()">
        <Icon v-if="!isDark" name="material-symbols:light-mode-rounded" class="text-black" @click="toggleDark()" />
        <Icon v-if="isDark" name="ri:moon-clear-fill" class="text-white" @click="toggleDark()" />
        <span>Dark Mode</span>
      </div>
      <USwitch v-model="isDark" class="cursor-pointer" />
    </div>
    <USeparator class="pb-2"/>
    <div v-for="item in menuItemsGroup1" :key="item.name" class="pb-2">
      <NuxtLink to="/profile" class="light:text-black text-white flex items-center gap-2 hover:underline underline-offset-4">
        <Icon
          :name="item.icon"
          class="text-xl"
        />
        <span>{{ item.name }}</span>
      </NuxtLink>
    </div>
    <USeparator class="pb-2"/>
    <div v-for="item in menuItemsGroup2" :key="item.name" class="pb-2">
      <NuxtLink
        to="#"
        class="light:text-black text-white flex items-center gap-2 hover:underline underline-offset-4"
        @click.prevent="item.onClick"
      >
        <Icon
          :name="item.icon"
          class="text-xl"
        />
        <span>{{ item.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
const isDark = useDark({
  valueLight: 'light',
});
const toggleDark = useToggle(isDark);
const { logout } = useAuth();
const router = useRouter();
const menuItemsGroup1 = [
  { name: 'Profile', icon: 'material-symbols:account-box', link: '/profile' },
  { name: 'Settings', icon: 'ic:sharp-settings-applications', link: '/settings' },
];

const logoutHandler = async () => {
  await logout();
  router.push('/');
};
const menuItemsGroup2 = [
  { name: 'Logout', icon: 'material-symbols:logout', onClick: logoutHandler },
];

</script>
