<template>
  <div class="w-full h-[130%] bg-[#0C314F] absolute inset-0 m-0 p-0">
    <!-- Background Image -->
    <img
      class="w-full h-[auto] object-cover absolute top-0 left-0 z-0"
      src="../assets/image/ATTENDANCECHECKER-LOGO-White.png"
      alt="Background Image"
    />

    <!-- White Container -->
    <div
      class="absolute bottom-0 left-0 w-full h-[70%] bg-white rounded-t-[2rem] z-10 flex flex-col items-center space-y-6"
    >
      <!-- Welcome Texts -->
      <div class="mt-[2rem] text-center">
        <p class="text-[#1C75BC] font-bold font-montserrat text-lg">
          Welcome Back!
        </p>
        <p
          class="text-[#828385] font-bold font-montserrat text-sm mt-1 mb-[1rem]"
        >
          Login to continue using the app
        </p>
      </div>

      <!-- Email Field -->
      <div class="relative w-full max-w-[80%]">
        <p
          class="mb-1 text-[#828385] text-[0.875rem] ml-[.2rem] font-montserrat text-left"
        >
          Email
        </p>
        <i
          class="fa-solid fa-envelope absolute left-4 top-2/3 -translate-y-1/2 text-[#828385]"
        ></i>
        <input
          v-model="email"
          type="text"
          placeholder="Email"
          class="w-full p-2 pl-10 border border-gray-300 rounded-2xl text-black text-[0.875rem] font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <!-- Password Field -->
      <div class="relative w-full max-w-[80%]">
        <p
          class="mb-1 text-[#828385] text-[0.875rem] ml-[.2rem] font-montserrat text-left"
        >
          Password
        </p>
        <i
          class="fa-solid fa-lock absolute left-4 top-2/3 -translate-y-1/2 text-[#828385]"
        ></i>
        <input
          v-model="password"
          @keypress.enter="login"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          class="w-full p-2 pl-10 pr-10 border border-gray-300 rounded-2xl text-black text-[0.875rem] font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
        />
        <i
          :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
          @click="showPassword = !showPassword"
          class="absolute right-4 top-2/3 -translate-y-1/2 text-[#828385] cursor-pointer"
        ></i>
      </div>

      <!-- Login Button -->
      <button
        @click="login"
        :disabled="isLoginDisabled"
        class="w-full max-w-[80%] py-2 bg-[#1C75BC] text-white rounded-2xl font-montserrat text-[1rem] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Login
      </button>

      <!-- Forgot Password -->
      <p
        class="text-[#1C75BC] underline text-[0.75rem] font-bold font-montserrat cursor-pointer"
      >
        Forgot your Password
      </p>
    </div>

    <!-- Loading Screen -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-[#1C75BC]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase";

// Reactive state
const showPassword = ref(false);
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const token = ref("");
const router = useRouter();

// Computed: disable login button if email or password is empty
const isLoginDisabled = computed(() => !email.value || !password.value);

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: "application/json" },
});

// Login function
const login = async () => {
  if (!email.value || !password.value) {
    alert("Enter email and password");
    return;
  }

  isLoading.value = true;
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;
    console.log("Logged in:", user.uid);
    router.push("/home");
  } catch (err) {
    console.error("Login failed:", err);
    alert("Invalid credentials");
  } finally {
    isLoading.value = false;
  }
};
</script>
