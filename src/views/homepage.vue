<template>
  <div
    class="absolute inset-0 w-full h-[120%] overflow-y-auto bg-[#F8FAFC] font-montserrat"
  >
    <div class="shadow-md pb-3 bg-[#F8FAFC]">
      <!-- Top Navbar -->
      <div class="absolute left-8 top-[3.8rem] rounded-3xl">
        <img
          class="w-[3rem] rounded-[10px]"
          src="../assets/image/ATTENDANCECHECKER-ICON-Whitebg.png"
          alt=""
        />
      </div>

      <AppHeader
        title="Home"
        iconClass="fa-solid fa-bell text-yellow-500 "
        textClass="text-black"
      />
    </div>

    <div class="flex flex-row absolute items-center top-[8rem] left-[1rem] p-4">
      <img
        class="h-[3rem] ml-[1rem] rounded-full"
        src="../assets/image/avataricon.jpg"
        alt="User Avatar"
      />

      <div class="flex flex-col ml-[.5rem]">
        <div class="flex items-center">
          <p class="text-md font-semibold text-gray-500 font-montserrat">
            Hello
          </p>
          <img
            class="h-[1rem] w-[1rem] ml-[.5rem] mb-[.2rem]"
            src="../assets/image/wavehand.png"
            alt="Wave Hand"
          />
        </div>

        <p class="text-black font-semibold text-md font-montserrat">
          Pivick Lorenzo
        </p>
      </div>
    </div>

    <!-- Welcome Text -->
    <div class="mt-[8rem] text-center px-4">
      <p class="text-xl font-semibold text-black text-left ml-[1.8rem]">
        Welcome!
      </p>
    </div>

    <!-- Background Image & Text -->
    <div class="relative w-full px-10 mt-6">
      <div class="relative w-full rounded-2xl overflow-hidden shadow-lg">
        <img src="../assets/image/wcbg4.jpg" class="w-full h-full" />
        <p
          class="absolute top-1/2 left-1/4 transform -translate-x-1/3 -translate-y-1/2 text-white text-[1rem] font-bold text-center"
        >
          "You can now<br />mark your<br />Attendance"
        </p>
        <img
          src="../assets/image/manbg3.png"
          class="absolute bottom-4 -right-1/4 -translate-x-1/2 transform w-[53%] h-auto"
          alt="Man Illustration"
        />
      </div>
    </div>

    <div class="w-full px-4 mt-10">
      <div class="items-center justify-between">
        <p class="text-xl font-semibold text-black ml-[1.8rem] flex">
          Events for today
          <img src="../assets/image/eventicon2.png" class="w-8 h-8 ml-[1rem]" />
        </p>
      </div>

      <div class="mt-4 grid grid-cols-2 px-5">
        <div class="flex flex-col items-center rounded-lg p-2">
          <img
            src="../assets/image/atpic.jpg"
            class="w-28 h-28 object-cover rounded-md border"
            alt="Adventure Trip"
          />
          <p class="mt-2 text-xs font-bold text-black">Adventure Trip</p>
          <p class="text-green-500 font-semibold text-sm">Active</p>
        </div>

        <div class="flex flex-col items-center rounded-lg p-2">
          <img
            src="../assets/image/sppic.jpg"
            class="w-28 h-28 object-cover rounded-md border"
            alt="Summer Outing"
          />
          <p class="mt-2 text-xs font-bold text-black">Summer Outing</p>
          <p class="text-green-500 font-semibold text-sm">Active</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../components/header/AppHeader.vue";
</script>
