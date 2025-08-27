<template>
  <div class="bg-[#F8FAFC] inset-0 h-[140%] absolute">
    <AppHeader
      title="Edit Profile"
      iconClass="fa-classic fa-solid fa-user-pen"
    />

    <div class="absolute left-[5%] top-[3.7rem]">
      <button
        @click="navigateTo('/profile')"
        class="bg-transparent text-black text-xl"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
    </div>

    <div class="flex flex-row justify-center p-6">
      <img
        class="w-[full] max-w-[60%] rounded-full"
        src="../assets/image/avataricon.jpg"
        alt="User Avatar"
      />
    </div>

    <!-- Name Input -->
    <div class="relative w-[80%] left-[10%] mt-[2rem]">
      <p class="text-start text-black font-montserrat font-semibold mb-2">
        Name
      </p>
      <input
        type="text"
        placeholder="Pivick Lorenzo "
        class="w-full p-2 pl-5 border-[0.3px] border-gray-400 rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
      />
    </div>

    <!-- Email Input -->
    <div class="relative w-[80%] left-[10%] mt-[2rem]">
      <p class="text-start text-black font-montserrat font-semibold mb-2">
        Email
      </p>
      <input
        type="text"
        placeholder="pvk.lorenzo@gmail.com "
        class="w-full p-2 pl-5 border-[0.3px] border-gray-400 rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
      />
    </div>

    <!-- Username Input -->
    <div class="relative w-[80%] left-[10%] mt-[2rem]">
      <p class="text-start text-black font-montserrat font-semibold mb-2">
        Username
      </p>
      <input
        type="text"
        placeholder="pivick@2003"
        class="w-full p-2 pl-5 border-[0.3px] border-gray-400 rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
      />
    </div>

    <!-- Number Input -->
    <div class="relative w-[80%] left-[10%] mt-[2rem]">
      <p class="text-start text-black font-montserrat font-semibold mb-2">
        Phone number
      </p>
      <input
        type="text"
        placeholder="+63 9321464379"
        class="w-full p-2 pl-5 border-[0.3px] border-gray-400 rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
      />
    </div>

    <!-- Save Changes Button -->
    <button
      class="w-full max-w-[80%] py-2 bg-[#1C75BC] text-white rounded-lg mt-[3rem] font-montserrat text-[1rem]"
    >
      Save Changes
    </button>

    <!-- Cancel Button -->
    <button
      @click="navigateTo('/profile')"
      class="w-full max-w-[80%] py-2 bg-gray-400 text-black rounded-lg mt-[1rem] font-montserrat text-[1rem]"
    >
      Cancel
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import AppHeader from "../components/header/AppHeader.vue";

const navigateTo = (path: string) => {
  router.push(path);
};

const router = useRouter();
</script>
