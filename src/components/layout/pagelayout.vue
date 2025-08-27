<template>
 <router-view></router-view>

  <div
    class="fixed  left-0 right-0 bottom-[5%] flex flex-row rounded-3xl bg-white shadow-md text-xl border-[0.3px] border-[#CBD5E1] w-full max-w-[90%] m-auto   "
  >
   <!-- Loading Screen -->
   <div
        v-if="isLoading"
        class="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-4 border-[#1C75BC]"
        ></div>
      </div>

    <!-- Home Button -->
    <button
      @click="navigate(0, '/home')"
      class="px-[6%] rounded-3xl w-full flex items-center justify-center "
      :class="{
        'bg-[#1C75BC] text-white': activeButton === 0,
        'text-[#636466] bg-transparent': activeButton !== 0
      }"
    >
      <i class="fa-solid fa-home"></i>
      <span v-if="activeButton === 0" class="ml-2 text-xs">HOME</span>
    </button>

    <!-- Scan Button -->
    <button
      @click="navigate(1, '/scan')"
      class="px-[6%] rounded-3xl w-full flex items-center justify-center"
      :class="{
        'bg-[#1C75BC] text-white': activeButton === 1,
        'text-[#636466] bg-transparent': activeButton !== 1
      }"
    >
      <i class="fa-solid fa-qrcode"></i>
      <span v-if="activeButton === 1" class="ml-2 text-xs">SCAN</span>
    </button>

    <!-- Profile Button -->
    <button
      @click="navigate(2, '/profile')"
      class="px-[6%] rounded-3xl w-full flex items-center justify-center"
      :class="{
        'bg-[#1C75BC] text-white': activeButton === 2,
        'text-[#636466] bg-transparent': activeButton !== 2
      }"
    >
      <i class="fa-solid fa-user"></i>
      <span v-if="activeButton === 2" class="ml-2 text-xs">ACCOUNT</span>
    </button>
  </div>
</template>





<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const activeButton = ref<number | null>(null);
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);



// Map path to button index
const pathToIndex: Record<string, number> = {
  '/home': 0,
  '/scan': 1,
  '/profile': 2
};

onMounted(() => {
  activeButton.value = pathToIndex[route.path] ?? null;

  // // Set up global navigation guards
  // router.beforeEach((to, from, next) => {
  //   isLoading.value = true;
  //   next();
  // });

  // router.afterEach(() => {
  //   setTimeout(() => {
  //     isLoading.value = false;
  //   }, 300); // small delay to show loading nicely
  // });
});

const navigate = (index: number, path: string) => {
  activeButton.value = index;
  router.push(path);
};


</script>


