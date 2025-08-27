<template>
  <div class="bg-[#F8FAFC] inset-0 h-[120%] absolute">
    <div class="shadow-md pb-3">
      <!-- Top Navbar -->
      <div class="absolute left-8 top-[3.8rem] rounded-3xl">
        <img
          class="w-[3rem] rounded-[10px]"
          src="../assets/image/ATTENDANCECHECKER-ICON-Whitebg.png"
          alt=""
        />
      </div>
      <AppHeader title="My Profile" iconClass="fa-solid fa-gear" />
    </div>

    <div class="flex flex-row items-start p-6">
      <img
        class="w-[full] max-w-[42%] rounded-full mr-6 mt-2"
        src="../assets/image/avataricon.jpg"
        alt="User Avatar"
      />

      <div class="flex flex-col justify-center mt-4">
        <p class="text-black font-bold font-montserrat text-md mb-1 text-left">
          Pivick Lorenzo
        </p>
        <p
          class="text-gray-400 font-bold font-montserrat text-md mb-4 text-left"
        >
          pivick@2003
        </p>
        <button
          @click="goToEditProfile"
          class="flex items-center w-fit px-3 py-3 font-montserrat bg-[#1c75bc] text-white text-sm font-semibold rounded-md"
        >
          Edit Profile
          <i class="fa-classic fa-solid fa-pen-to-square ml-[.5rem]"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          class="flex items-center w-[90%] bg-[#F8FAFC] mx-auto px-4 py-3 hover:bg-gray-200"
        >
          <i class="fa-classic fa-solid fa-lock mr-3 text-black"></i>
          <span class="text-black">Change Password</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          class="flex items-center w-[90%] mx-auto px-4 py-3 bg-[#F8FAFC] hover:bg-gray-200"
        >
          <i class="fa-classic fa-solid fa-handshake-angle mr-3 text-black"></i>
          <span class="text-black">FAQ and Help</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          class="flex items-center w-[90%] mx-auto px-4 py-3 bg-[#F8FAFC] hover:bg-gray-200"
        >
          <i class="fa-classic fa-solid fa-globe mr-3 text-black"></i>
          <span class="text-black">Language</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          class="flex items-center w-[90%] mx-auto px-4 py-3 bg-[#F8FAFC] hover:bg-gray-200"
        >
          <i class="fa-classic fa-solid fa-location-dot mr-3 text-black"></i>
          <span class="text-black">Location</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          class="flex items-center w-[90%] mx-auto px-4 py-3 bg-[#F8FAFC] hover:bg-gray-200"
        >
          <i class="fa-classic fa-solid fa-trash mr-3 text-black"></i>
          <span class="text-black">Clear Cache</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div class="mt-2">
      <div class="text-black text-sm font-bold font-montserrat">
        <button
          @click="showConfirmation = true"
          class="flex items-center w-[90%] mx-auto px-4 py-3 bg-[#F8FAFC] hover:bg-gray-200"
        >
          <i class="fa-solid fa-arrow-right-from-bracket mr-3 text-black"></i>
          <span class="text-black">Log out</span>
          <i class="fa-solid fa-chevron-right ml-auto text-black"></i>
        </button>
      </div>
    </div>

    <div
      v-if="showConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showConfirmation = false"
    ></div>

    <transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showConfirmation"
        class="fixed left-[5%] w-[90%] h-[22%] top-[40%] flex flex-col items-center justify-center bg-white rounded-xl z-30 text-black"
      >
        <p class="text-xl mb-[1rem] mt-[1rem] font-bold m-8 text-black">
          Are you sure you want to <br />
          Log out?
        </p>
        <div class="flex gap-10 text-xs">
          <button
            @click="goToLogin"
            class="px-8 py-2 bg-[#1C75BC] text-white rounded-lg"
          >
            Yes
          </button>
          <button
            @click="showConfirmation = false"
            class="px-8 py-2 bg-gray-300 text-gray-700 rounded-lg"
          >
            No
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const showConfirmation = ref(false);

// Replace this with your logout logic
const goToLogin = () => {
  console.log("Logging out...");
  // Add logout logic here
  router.push("/");
};

//
const goToEditProfile = () => {
  console.log("going to edit profile...");
  //
  router.push("/editprofilepage");
};

import AppHeader from "../components/header/AppHeader.vue";

const router = useRouter();
</script>
