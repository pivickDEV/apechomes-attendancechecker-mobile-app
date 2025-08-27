<template>
  
  <layout v-if="showLayout">
    <router-view />
  </layout>
  <router-view v-else />

</template>

<script setup lang="ts">

import { App } from '@capacitor/app';
import { onMounted, computed } from 'vue';

import { useRoute } from 'vue-router'
const route = useRoute()

const showLayout = computed(() =>
  route.path === '/home' || route.path === '/scan' || route.path === '/profile'
)


onMounted(() => {
  // Completely disable back button
  App.addListener('backButton', () => {
    // Empty callback prevents default back behavior
  });
});




// @ts-ignore
import layout from '../src/components/layout/pagelayout.vue';
import axios from 'axios'


axios.interceptors.response.use(
  response => response,
  error => {
    if (!window.navigator.onLine) {
      alert('No internet connection. Please check your connection and try again.');
      return Promise.reject(new Error('No internet connection'));
    }
    return Promise.reject(error);
  }
);


import { ScreenOrientation } from '@capacitor/screen-orientation'

ScreenOrientation.lock({ orientation: 'portrait' })

import { SplashScreen } from '@capacitor/splash-screen';

// To hide splash screen after some condition
SplashScreen.hide();

// To show splash screen again if needed
SplashScreen.show();


</script>