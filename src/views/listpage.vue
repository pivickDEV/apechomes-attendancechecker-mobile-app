<template>
  <div class="bg-[#F8FAFC] inset-0 absolute">
    <div class="shadow-md pb-3">
      <AppHeader title="Employee List" iconClass="fa-solid fa-list" />
    </div>

    <div class="absolute left-[5%] top-[3.7rem]">
      <button
        @click="navigateTo('/scan')"
        class="bg-transparent text-black text-xl"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
    </div>

    <div class="max-w-[90%] w-full mx-auto fixed top-[18%] left-[5%]">
      <!-- Search Input -->
      <div class="relative w-full">
        <i
          class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        ></i>
        <input
          v-model="searchQuery"
          @keypress.enter="search"
          type="text"
          placeholder="Type Employee ID"
          class="w-full p-2 pl-10 border rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400"
        />
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

      <!-- Employee List -->
      <div
        v-if="searchQuery && searchTriggered"
        class="mt-4 bg-white shadow fixed left-[5%] top-[25%] max-w-[90%] w-[90%] h-[65%] overflow-x-scroll flex-shrink-0 gap-8"
      >
        <div class="overflow-y-scroll h-full">
          <table class="text-left w-full min-w-[200%]">
            <thead class="bg-[#1C75BC] text-white">
              <tr>
                <th
                  class="p-4 border-r border-[#CBD5E1] whitespace-nowrap font-montserrat"
                >
                  Employee ID
                </th>
                <th class="p-4 border-r border-[#CBD5E1] font-montserrat">
                  Name
                </th>
                <th class="p-4 border-r border-[#CBD5E1] font-montserrat">
                  Department
                </th>
                <th class="p-4 border-r border-[#CBD5E1] font-montserrat">
                  Group
                </th>
                <th class="p-4 border-l border-[#CBD5E1] font-montserrat">
                  QR ID
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Loop through filtered employees -->
              <tr
                v-for="item in filteredEmployees"
                :key="item.emp_id"
                @click="openModal(item)"
                class="hover:bg-blue-100 cursor-pointer border-b font-thin font-montserrat border-[#CBD5E1] text-black flex-shrink-0 gap-8"
              >
                <td class="p-4 border-r border-[#CBD5E1]">{{ item.emp_id }}</td>
                <td class="p-4 border-r border-[#CBD5E1]">{{ item.name }}</td>
                <td class="p-4 border-r border-[#CBD5E1]">
                  {{ item.department_name }}
                </td>
                <td class="p-4 border-r border-[#CBD5E1]">
                  {{ item.group_name }}
                </td>
                <td class="p-4">{{ item.qrid }}</td>
              </tr>

              <!-- Show message if no employees match the search -->
              <tr v-if="filteredEmployees.length === 0 && !isLoading">
                <td colspan="5" class="p-3 text-gray-500 text-left">
                  {{
                    searchQuery
                      ? `No results found for "${searchQuery}"`
                      : "No employees available"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="closeModal"
    ></div>

    <transition
      enter-active-class="transition duration-200 ease-in-out"
      leave-active-class="transition duration-200 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showDetailsModal"
        class="text-black absolute left-[5%] w-[90%] h-[90%] top-[5%] flex flex-col justify-center bg-white rounded-xl align-center items-center z-20"
      >
        <h2 class="font-bold text-lg mb-[1rem]">Details:</h2>
        <div
          v-if="selectedEmployee"
          class="flex flex-col justify-center items-center text-black"
        >
          <img
            class="h-[10rem] rounded-[50%] w-[auto] mb-[2rem]"
            :src="
              selectedEmployee.image
                ? 'data:image/png;base64,' + selectedEmployee.image
                : '/src/assets/image/avataricon.jpg'
            "
            alt="Employee photo"
          />

          <div class="flex flex-col justify-center items-center text-black">
            <div id="modalContent" class="space-y-2">
              <p class="text-left font-bold text-lg">Employee ID:</p>
              <p class="text-left">{{ selectedEmployee.emp_id }}</p>
              <p class="text-left font-bold text-lg">Name:</p>
              <p class="text-left">{{ selectedEmployee.name }}</p>
              <p class="text-left font-bold text-lg">Department Name:</p>
              <p class="text-left">{{ selectedEmployee.department_name }}</p>
              <p class="text-left font-bold text-lg">Group Name:</p>
              <p class="text-left">{{ selectedEmployee.group_name }}</p>
              <p class="text-left font-bold text-lg">QR ID:</p>
              <p class="text-left">{{ selectedEmployee.qrid }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-10 justify-between mt-6">
          <button
            @click="confirmAttendance"
            class="px-4 py-2 bg-[#1C75BC] text-white rounded-lg hover:bg-blue-600"
          >
            Confirm
          </button>
          <button
            @click="closeModal"
            class="px-7 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      </div>
    </transition>
    <!-- Attendance Confirmation Modal -->
    <div
      v-if="showConfirmationModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showConfirmationModal = false"
    ></div>

    <transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showConfirmationModal"
        class="transform fixed left-[5%] w-[90%] h-[22%] top-[40%] flex flex-col items-center justify-center bg-white rounded-xl z-20 text-black"
      >
        <p class="text-xl mb-[1rem] mt-[1rem] font-bold m-8">
          Are you sure you want to take Attendance?
        </p>
        <div class="flex gap-10 text-xs">
          <button
            type="submit"
            @click="takeAttendance"
            class="px-8 py-2 bg-[#1C75BC] text-white rounded-lg"
          >
            Yes
          </button>
          <button
            @click="
              showConfirmationModal = false;
              showDetailsModal = true;
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
      v-if="showSuccess"
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="showSuccess = false"
    ></div>

    <transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="-translate-y-full opacity-0"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div
        v-if="showSuccess"
        class="fixed left-[5%] w-[90%] h-[50%] top-[25%] flex items-center justify-center z-20"
      >
        <button
          @click="showSuccess = false"
          class="px-2 py-2 text-gray-400 bg-transparent rounded-lg fa-solid fa-xmark absolute text-bold text-[2rem] left-[80%] top-[20%]"
        ></button>

        <div class="bg-white p-6 rounded-lg shadow-xl w-80">
          <p class="text-3xl font-bold mb-4 text-green-500 mt-3">Success!</p>
          <p class="text-lg font-semibold mb-4 text-green-500">
            {{ message }}
          </p>
          <button
            @click="
              startScan();
              showSuccess = false;
            "
            class="bg-[#1C75BC] text-white w-full py-2 rounded-md mb-2"
          >
            Scan New QR
          </button>
          <button
            @click="showSuccess = false"
            class="bg-gray-300 text-gray-700 w-full py-2 rounded-md"
          >
            Choose from the list
          </button>
        </div>
        <button
          @click="showSuccess = false"
          class="text-[white] w-full py-1 fixed left-0 font-semibold text-[1rem] mt-[19rem] underline text-md bg-transparent rounded-md z-30"
        >
          Done
        </button>
      </div>
    </transition>

    <!-- QR SCAN  -->

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
        <p class="font-bold text-lg mb-[1rem]">DETAILS:</p>
        <div class="flex flex-col justify-center items-center text-black">
          <img
            class="h-[10rem] rounded-[50%] w-auto mb-[2rem]"
            :src="
              scannedData?.image
                ? 'data:image/png;base64,' + scannedData?.image
                : '/src/assets/image/avataricon.jpg'
            "
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
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import axios from "axios";
import { computed, ref, Ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "../components/header/AppHeader.vue";

const router = useRouter();

// =======================
// Types
// =======================
export interface Employee {
  id?: string;
  image?: string;
  emp_id: string;
  name: string;
  department_name: string;
  group_name: string;
  qrid: string;
}

// =======================
// State
// =======================
const employees: Ref<Employee[]> = ref([]);
const searchQuery: Ref<string> = ref("");
const selectedEmployee = ref<Employee | null>(null);
const showDetailsModal = ref(false);
const showConfirmationModal = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(false);

const scannedValue = ref("");
const searchTriggered = ref(false);

const message = ref("");
const segment = ref("2");
const hasSavedPM = ref(false);

const scannedData = ref<Employee | null>(null);
const showResultQR = ref(false);
const showConfirmationQR = ref(false);
const showSuccessQR = ref(false);
const isScanning = ref(false);
const segmentQR = ref("2");
const hasSavedPMQR = ref(false);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// =======================
// Watch
// =======================
watch(searchQuery, (val) => {
  if (val.trim() === "") {
    searchTriggered.value = false;
  }
});

// =======================
// Search Employee List
// =======================

import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // make sure this is set up

const search = async () => {
  if (searchQuery.value.trim() !== "") {
    searchTriggered.value = true;
  }
  isLoading.value = true;
  error.value = null;

  try {
    // 🔥 get all employees from Firestore
    const snapshot = await getDocs(collection(db, "employees"));

    // map docs into your Employee[] type
    employees.value = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<Employee, "id">),
    })) as Employee[];
  } catch (err: unknown) {
    error.value = "Failed to load employee data";
    if (axios.isAxiosError(err)) {
      console.error("API Error:", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("Firestore Error:", err.message);
    } else {
      console.error("Unexpected Error:", err);
    }
  } finally {
    isLoading.value = false;
  }
};
// Computed filter
const filteredEmployees = computed<Employee[]>(() => {
  if (!searchQuery.value) return employees.value;

  const q = searchQuery.value.toLowerCase();

  return employees.value.filter(
    (e) =>
      (e.name ?? "").toLowerCase().includes(q) ||
      (e.emp_id ?? "").toLowerCase().includes(q) ||
      (e.department_name ?? "").toLowerCase().includes(q) ||
      (e.group_name ?? "").toLowerCase().includes(q) ||
      (e.qrid ?? "").toLowerCase().includes(q) // added qrid since it’s in your table
  );
});

// =======================
// Attendance (from list)
// =======================
const takeAttendance = async () => {
  showConfirmationModal.value = false;
  showSuccess.value = false;
  isLoading.value = true;

  if (segment.value === "3" && hasSavedPM.value) {
    alert("Employee attendance already saved");
    isLoading.value = false;
    return;
  }

  if (!selectedEmployee.value) {
    console.error("No employee selected");
    isLoading.value = false;
    return;
  }

  try {
    // call the service
    const saveRes = await saveAttendance({
      emp_id: selectedEmployee.value.emp_id, // dynamic
      segment: segment.value,
    });

    message.value = saveRes.message || "Attendance saved successfully!";
    console.log("Attendance saved:", saveRes);
    showSuccess.value = true;

    if (segment.value === "3") {
      hasSavedPM.value = true;
    }
  } catch (err) {
    alert("Failed to save attendance");
  } finally {
    isLoading.value = false;
  }
};

import { addDoc } from "firebase/firestore";

async function saveAttendance(data: any) {
  try {
    // 👇 save to "saveAttendance" collection
    const docRef = await addDoc(collection(db, "saveAttendance"), data);

    return { id: docRef.id, ...data }; // return saved data with generated ID
  } catch (err: unknown) {
    console.error("Error saving attendance:", err);
    throw err; // rethrow so caller can handle
  }
}

// =======================
// Modal Handlers
// =======================
const openModal = (employee: Employee) => {
  selectedEmployee.value = employee;
  showDetailsModal.value = true;
};

const closeModal = () => {
  selectedEmployee.value = null;
  showDetailsModal.value = false;
  showConfirmationModal.value = false;
};

const confirmAttendance = () => {
  showDetailsModal.value = false;
  showConfirmationModal.value = true;
};

const navigateTo = (path: string) => {
  router.push(path);
};

// =======================
// QR SCAN
// =======================

import { getDoc } from "firebase/firestore";

const startScan = async () => {
  try {
    isScanning.value = true;
    scannedData.value = null;
    showResultQR.value = false;
    isLoading.value = true;

    // Ensure Google Barcode Scanner is available
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    }

    // Scan QR
    const { barcodes } = await BarcodeScanner.scan();
    if (barcodes.length === 0) {
      alert("No QR code detected.");
      return;
    }

    const value = barcodes[0].displayValue || "";
    if (!value) {
      alert("Invalid QR code data");
      return;
    }

    scannedValue.value = value;

    // 🔹 Fetch employee data from Firestore using scanned QR id
    const docRef = doc(db, "qrscan", value); // assumes "qrscan" is collection name and value is docId
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      scannedData.value = {
        image: data.image || "",
        emp_id: data.emp_id,
        name: data.name,
        department_name: data.department_name,
        group_name: data.group_name,
        qrid: data.qrid,
      };
      showResultQR.value = true;
    } else {
      scannedData.value = null;
      alert("No matching employee found for this QR code.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (!err.message.includes("cancelled")) {
        console.error("Scan Error:", err.message);
        alert(err.message);
      }
    } else {
      console.error("Unknown Error:", err);
      alert("An unknown error occurred");
    }
  } finally {
    isScanning.value = false;
    isLoading.value = false;
  }
};

const confirmAttendanceQR = () => {
  showResultQR.value = false;
  showConfirmationQR.value = true;
};

const completeAttendanceQR = async () => {
  showConfirmationQR.value = false;
  showSuccessQR.value = false;

  if (segmentQR.value === "3" && hasSavedPMQR.value) {
    alert("Employee attendance already saved");
    return;
  }

  if (!scannedData.value) {
    alert("No QR scanned data available");
    return;
  }

  try {
    const saveRes = await api.post(
      import.meta.env.VITE_API_SAVE_ATTENDANCE_URI,
      {
        emp_id: scannedData.value.emp_id,
        segment: segmentQR.value,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    message.value = saveRes.data.message || "Attendance saved successfully!";
    console.log("Attendance saved:", saveRes.data);
    showSuccessQR.value = true;

    if (segmentQR.value === "3") {
      hasSavedPMQR.value = true;
    }
  } catch (err) {
    console.error("Error saving attendance:", err);
    alert("Failed to save attendance");
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
