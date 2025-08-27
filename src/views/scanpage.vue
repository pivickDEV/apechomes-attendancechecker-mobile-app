<template>
  <div class="bg-[#1c75bc] absolute inset-0 w-full h-[150vh] overflow-y-auto">
    <div class="shadow-md pb-3">
      <!-- Top Navbar -->
      <div class="absolute left-8 top-[3.8rem] rounded-3xl">
        <img
          class="w-[3rem] rounded-[10px]"
          src="../assets/image/ATTENDANCECHECKER-ICON-Whitebg.png"
          alt=""
        />
      </div>
      <AppHeader
        title="Scan QR"
        iconClass="fa-solid fa-qrcode"
        textClass="text-white"
      />
    </div>

    <div
      class="flex flex-row absolute items-center top-[8rem] left-[1.5rem] p-4"
    >
      <img
        class="h-[3rem] ml-[1rem] rounded-full"
        src="../assets/image/avataricon.jpg"
        alt="User Avatar"
      />

      <div class="flex flex-col ml-[.5rem]">
        <div class="flex items-center">
          <p class="text-md font-semibold text-gray-300 font-montserrat">
            Hello
          </p>
          <img
            class="h-[1rem] w-[1rem] ml-[.5rem] mb-[.2rem]"
            src="../assets/image/wavehand.png"
            alt="Wave Hand"
          />
        </div>

        <p class="text-white font-semibold text-md font-montserrat">
          Pivick Lorenzo
        </p>
      </div>
    </div>

    <div class="inset-0 bg-white absolute top-[28rem] rounded-t-xl"></div>

    <!-- Main Content Section -->
    <div
      class="w-[75%] sm:w-[85%] md:w-[75%] min-h-fit bg-[#F8FAFC] absolute left-1/2 transform -translate-x-1/2 top-[20%] h-auto rounded-2xl border border-[#CFCFD0] shadow-md"
    >
      <div class="flex flex-col mt-[10%] justify-center items-center">
        <div
          class="text-black text-2xl font-montserrat font-semibold mt-[.5rem]"
        >
          {{ formattedTime }}
        </div>
        <div
          class="text-black text-base mt-[1rem] font-semibold font-montserrat"
        >
          {{ formattedDate }}
        </div>

        <!-- QR Scan Button -->
        <div class="flex justify-center items-center p-4">
          <div
            class="relative w-[10rem] h-[10rem] rounded-full bg-gradient-to-b from-white to-[#1C75BC] overflow-hidden inline-block shadow-lg border border-[#CBD5E1] mt-[1rem] cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
            @click="isDrawerOpen = true"
          >
            <img
              class="h-[7rem] w-[7rem] mx-[.6rem] mt-[1.5rem]"
              src="../assets/image/scanicon.png"
              alt="Scan Icon"
            />
            <p
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center text-xl font-bold font-montserrat bg-[#1c75bc]/60 px-3 py-1 whitespace-nowrap"
            >
              SCAN QR
            </p>
          </div>
        </div>

        <!-- Displaying Current Adventure Trip / Event -->
        <p
          class="text-[#1C75BC] text-lg font-bold font-montserrat mt-[1rem] mb-[1.5rem]"
        >
          Event for Today
        </p>

        <div>
          <div
            class="flex items-center justify-center mb-[1rem] font-bold text-sm text-black"
          >
            <p class="text-black">SCHEDULE</p>
            <p class="ml-[2rem] text-black">AM - PM</p>
          </div>

          <div
            class="flex items-center font-bold justify-center text-center mb-[1rem] text-sm"
          >
            <p class="text-black">STATUS</p>
            <p class="text-[#12B76A] ml-[3.5rem]">ACTIVE</p>
          </div>

          <div
            class="flex items-center font-bold justify-center text-center gap-12 text-sm mb-[3rem]"
          >
            <p class="text-black">ATTENDEES</p>
            <p class="text-black mr-[1rem]">121</p>
          </div>
          <p class="text-[#1c75bc] font-bold mb-[1.5rem]">Attendance Window</p>
          <div
            class="flex mb-[2rem] text-center justify-center items-center gap-[.8rem] text-md flex-wrap"
          >
            <p class="text-black font-bold">7:00 AM:</p>
            <p class="text-black font-bold">-</p>
            <p class="text-black font-bold">5:00 PM</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal content -->
    <div
      v-if="isDrawerOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-10"
      @click="isDrawerOpen = false"
    ></div>

    <transition
      enter-active-class="transition-all duration-200 ease-in-out"
      leave-active-class="transition-all duration-200 ease-in-out"
      enter-from-class="translate-y-full opacity-0"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="isDrawerOpen"
        class="z-10 fixed bottom-0 left-0 w-full max-w-full bg-white shadow-2xl p-6 rounded-t-3xl border h-[35%]"
      >
        <div
          class="max-w-[13%] bg-[#1c75bc] h-[2%] ml-[43.5%] w-full mt-[0.5rem] mb-[0.5rem] rounded-l-[1rem] rounded-r-[1rem]"
        ></div>

        <button
          @click="
            startScan();
            isDrawerOpen = false;
          "
          :disabled="isScanning"
          class="text-left text-xl py-2 text-[#1C75BC] border-[#1C75BC] bg-white w-full font-semibold mt-[1rem]"
        >
          <i class="fa-solid fa-qrcode mr-[1rem]"></i>
          {{ isScanning ? "Scanning..." : "Start Scan" }}
        </button>

        <button
          @click="navigateTo('/list')"
          class="w-full text-left text-xl py-2 text-white bg-[#1C75BC] font-semibold mt-[1rem]"
        >
          <i class="fa-solid fa-magnifying-glass mr-[0.8rem]"></i> Choose from
          list
        </button>

        <button
          @click="isDrawerOpen = false"
          class="w-full mt-[1rem] text-left text-xl py-2 font-semibold bg-gray-300 text-gray-700"
        >
          <i class="fa-solid fa-xmark ml-[0.1rem] mr-[1rem]"></i> Cancel
        </button>
      </div>
    </transition>

    <!-- Modal Result -->
    <div
      v-if="showResultQR"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showResultQR = false"
    ></div>

    <!-- Loading Screen -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center"
    >
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-[#1C75BC]"
      ></div>
    </div>

    <transition
      enter-active-class="transition duration-400 ease-in-out"
      leave-active-class="transition duration-400 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showResultQR"
        class="fixed left-[5%] w-[90%] h-[85%] top-[7.5%] flex flex-col justify-center bg-white rounded-xl items-center z-20"
      >
        <p class="font-bold text-lg mb-[1rem] text-black">DETAILS:</p>
        <div class="flex flex-col justify-center items-center text-black">
          <img
            class="h-[10rem] rounded-[50%] w-auto mb-[2rem]"
            :src="scannedData?.image || avatarIcon"
            alt="Employee Photo"
          />
          <div id="modalContent" class="space-y-2">
            <p class="text-left font-bold text-lg">Employee ID:</p>
            <p class="text-left">{{ scannedData?.emp_id }}</p>
            <p class="text-left font-bold text-lg">Name:</p>
            <p class="text-left">{{ scannedData?.name }}</p>
            <p class="text-left font-bold text-lg">Department Name:</p>
            <p class="text-left">{{ scannedData?.department_name }}</p>
            <p class="text-left font-bold text-lg">Group Name:</p>
            <p class="text-left">{{ scannedData?.group_name }}</p>
          </div>
        </div>

        <div class="flex gap-10 justify-between mt-6">
          <button
            @click="confirmAttendanceQR"
            class="bg-[#1C75BC] text-white px-4 py-2"
          >
            Confirm
          </button>
          <button
            @click="showResultQR = false"
            class="bg-gray-300 text-gray-700 px-7 py-2"
          >
            Back
          </button>
        </div>
      </div>
    </transition>

    <!-- Attendance Confirmation -->
    <div
      v-if="showConfirmationQR"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showConfirmationQR = false"
    ></div>

    <transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showConfirmationQR"
        class="fixed left-[5%] w-[90%] h-[22%] top-[40%] flex flex-col items-center justify-center bg-white rounded-xl z-20 text-black"
      >
        <p class="text-xl mb-[1rem] mt-[1rem] font-bold m-8">
          Are you sure you want to take attendance?
        </p>
        <div class="flex gap-10 text-xs">
          <button
            @click="completeAttendanceQR"
            class="px-8 py-2 bg-[#1C75BC] text-white rounded-lg"
          >
            Yes
          </button>
          <button
            @click="
              showResultQR = true;
              showConfirmationQR = false;
            "
            class="px-8 py-2 bg-gray-300 text-gray-700 rounded-lg"
          >
            No
          </button>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <div
      v-if="showSuccessQR"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showSuccessQR = false"
    ></div>

    <transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showSuccessQR"
        class="fixed left-[5%] w-[90%] h-[50%] top-[25%] flex items-center justify-center z-20"
      >
        <button
          @click="showSuccessQR = false"
          class="px-2 py-2 text-gray-500 bg-transparent rounded-lg fa-solid fa-xmark absolute text-bold text-[2rem] left-[80%] top-[20%]"
        ></button>
        <div class="bg-white p-6 rounded-lg shadow-xl w-80">
          <p class="text-3xl font-bold mb-4 text-green-500 mt-3">Success!</p>
          <p class="text-lg font-semibold mb-4 text-green-500">{{ message }}</p>
          <button
            @click="
              startScan();
              showSuccessQR = false;
            "
            class="bg-[#1C75BC] text-white w-full py-2 rounded-md mb-2"
          >
            Scan New QR
          </button>
          <button
            @click="navigateTo('/list')"
            class="bg-gray-300 text-black w-full py-2 rounded-md"
          >
            Choose from the list
          </button>
        </div>
        <button
          @click="showSuccessQR = false"
          class="text-white w-full py-1 fixed left-0 font-semibold text-[1rem] mt-[19rem] underline text-md bg-transparent rounded-md z-30"
        >
          Done
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import avatarIcon from "@/assets/image/avataricon.jpg";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isDrawerOpen = ref(false);
const showConfirmationQR = ref(false);
const showSuccessQR = ref(false);
const scannedValue = ref("");
const formattedTime = ref("");
const formattedDate = ref("");
const isLoading = ref(false);

const updateDateTime = () => {
  const now = new Date();

  // Time

  formattedTime.value = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(now);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit",
    weekday: "long",
    timeZone: "Asia/Manila",
  };

  // Time Format

  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const weekday = parts.find((p) => p.type === "weekday")?.value;

  formattedDate.value = `${month} ${day}, ${year} - ${weekday}`;
};

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
});

const isScanning = ref(false);
const scannedData = ref<{
  id?: string;
  image?: string;
  emp_id?: string;
  name?: string;
  department_name?: string;
  group_name?: string;
  qrid?: string;
} | null>(null);
const showResultQR = ref(false);

import { db } from "../firebase"; // adjust path if needed

// QR SCAN

const startScan = async () => {
  try {
    isScanning.value = true;
    scannedData.value = null;
    showResultQR.value = false;
    isLoading.value = true;

    // Ensure Google Barcode Scanner
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) await BarcodeScanner.installGoogleBarcodeScannerModule();

    // Scan QR
    const { barcodes } = await BarcodeScanner.scan();
    const value = barcodes[0]?.displayValue || "";

    if (!value) {
      alert("No valid QR code detected.");
      return;
    }

    scannedValue.value = value;

    // 🔹 Query Firestore for doc where field "qrid" == value
    const q = query(collection(db, "qrscan"), where("qrid", "==", value));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const docData = querySnap.docs[0].data();
      scannedData.value = {
        image: docData.image || "",
        emp_id: docData.emp_id || "",
        name: docData.name || "",
        department_name: docData.department_name || "",
        group_name: docData.group_name || "",
        qrid: docData.qrid || "",
      };
      showResultQR.value = true;
    } else {
      alert("No matching employee found.");
    }
  } catch (err: any) {
    if (!err.message?.includes("cancelled")) {
      console.error("Scan Error:", err);
      alert(err.message || "An unknown error occurred");
    }
  } finally {
    isScanning.value = false;
    isLoading.value = false;
  }
};

const navigateTo = (path: string) => {
  router.push(path);
  isDrawerOpen.value = false;
};

const confirmAttendanceQR = () => {
  showResultQR.value = false;
  showConfirmationQR.value = true;
};

const message = ref("");
const segmentQR = ref("2");
const hasSavedPMQR = ref(false);

import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

const completeAttendanceQR = async () => {
  showConfirmationQR.value = false;
  showSuccessQR.value = false;

  if (!scannedData.value?.emp_id || !segmentQR.value) {
    alert("Missing employee or segment data");
    return;
  }

  try {
    // 1. Check if attendance already exists
    const attendanceRef = collection(db, "attendance");
    const q = query(
      attendanceRef,
      where("emp_id", "==", scannedData.value.emp_id),
      where("segment", "==", segmentQR.value)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("Employee attendance already saved");
      return;
    }

    // 2. Save attendance
    await addDoc(attendanceRef, {
      emp_id: scannedData.value.emp_id,
      segment: segmentQR.value,
      timestamp: new Date(),
    });

    message.value = "Attendance saved successfully!";
    console.log("Attendance saved in Firestore");
    showSuccessQR.value = true;

    if (segmentQR.value === "3") {
      hasSavedPMQR.value = true;
    }
  } catch (error) {
    console.error("Error saving attendance:", error);
    alert("Error saving attendance");
  }
};

import AppHeader from "../components/header/AppHeader.vue";
</script>

<style>
/* CSS Reset */
.page2 {
  margin: 0;
  padding: 0;

  width: 100%;
  height: 100%;
  background-color: #1c75bc;
}
</style>
