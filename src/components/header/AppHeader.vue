<template>
    <div class="bg-transparent mt-[3.5rem] py-4">
      <div class="relative flex justify-center items-center">
        <p :class="['font-bold font-montserrat text-xl text-center', textClass]">
          {{ title }}
        </p>
        <i :class="['text-xl absolute right-8', iconClass, textClass]"></i>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    iconClass: String,
    textClass: {
      type: String,
      default: "text-black",
    },
  });
  </script>