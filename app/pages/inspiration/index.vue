<template>
  <div class="w-full">
    <div class="flex justify-start gap-3 pl-4 mt-4">
      <input
        v-model="inputUrl"
        name="website-url"
        class="border rounded-3xl w-2/3 pl-3"
        placeholder="Enter A URL"
      >
      <button
        class="bg-teal-800 text-white px-4 py-2 rounded-full cursor-pointer"
        @click="startInspect"
      >
        Start Inspect
      </button>
      <Icon
        v-if="!result && pending"
        name="svg-spinners:180-ring-with-bg"
        class="text-4xl text-center text-gray-400"
      />
      <Icon
        v-else-if="result && !pending"
        name="material-symbols:check-rounded"
        class="text-4xl text-center text-green-500"
      />
    </div>
    <div v-if='isUrl' class="ml-3 p-2">
      <div class="parsedUrlTag">
        <span class="font-bold">protocol: </span><span>{{ parsedUrl.protocol }}</span>
      </div>
      <div class="parsedUrlTag">
        <span class="font-bold">host: </span><span>{{ parsedUrl.host }}</span>
      </div>
      <div class="parsedUrlTag">
        <span class="font-bold">path name: </span><span>{{ parsedUrl.pathname }}</span>
      </div>
    </div>
    <div v-else class="text-red-300 ml-3 p-2">Can't parsed url</div>

    <div class="border-b border-white" />
    <div v-if="msg">
      {{ result.msg }}
    </div>
    <div class="rounded-2xl border m-4">
      <table>
        <tbody>
          <tr>
            <td class="p-2 font-bold">Input URL:</td>
            <td class="p-2 break-all">{{ inputUrl }}</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">Status:</td>
            <td class="p-2 break-all">{{ result?.status }}</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">Error:</td>
            <td class="p-2 break-all">{{ result?.error }}</td>
          </tr>
          <tr>
            <td class="p-2 font-bold">Links Found:</td>
            <td class="p-2 break-all">{{ result?.links?.length || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ol class="w-full text-wrap">
      <li
        v-for="(link, index) in result"
        :key="index"
        class="even:bg-zinc-800 odd:bg-stone-900 text-white"
      >
        <p class="p-2 border-r wrap-anywhere"> {{ link.url }} </p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputUrl = ref('https://www.stardewvalleywiki.com/Stardew_Valley_Wiki');
const result = ref();
const msg = ref('');
const pending = ref(false);
const urlRegex = /^https?:\/\/(?:www\.)?[\w@:%.+~#=]{1,256}\.[\w()]{1,6}\b[\w()@:%+.~#?&/=]*$/;

const startInspect = async () => {
  pending.value = true;

  // Call the API with the user input as a query param
  try {
    const data = await $fetch('/api/scrape', {
      params: { url: inputUrl.value },
    });
    result.value = data;
  } catch (error) {
    msg.value = 'accessing /api/scrape error: ' + (error as Error).message;
  } finally {
    pending.value = false;
  }
};

const parsedUrl = ref<URL>(new URL(inputUrl.value));
const isUrl = computed(() => urlRegex.test(inputUrl.value));

watch(inputUrl, () => {
  if (isUrl.value) {
    parsedUrl.value = new URL(inputUrl.value);
  }
});
</script>

<style scoped>
@reference '~/assets/main.css';

.parsedUrlTag {
  @apply bg-indigo-900 rounded-3xl border-teal-300 px-2 py-1 inline mx-1 shadow-md/50 shadow-black;
}
</style>
