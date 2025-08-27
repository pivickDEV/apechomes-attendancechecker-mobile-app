import avatarIcon from "@/assets/image/avataricon.jpg";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import axios from "axios";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "../components/header/AppHeader.vue";
const router = useRouter();
// =======================
// State
// =======================
const employees = ref([]);
const searchQuery = ref("");
const selectedEmployee = ref(null);
const showDetailsModal = ref(false);
const showConfirmationModal = ref(false);
const showSuccess = ref(false);
const error = ref(null);
const isLoading = ref(false);
const scannedValue = ref("");
const searchTriggered = ref(false);
const message = ref("");
const segment = ref("2");
const hasSavedPM = ref(false);
const scannedData = ref(null);
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
import { collection, getDocs } from "firebase/firestore";
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
        employees.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    catch (err) {
        error.value = "Failed to load employee data";
        if (axios.isAxiosError(err)) {
            console.error("API Error:", err.response?.data || err.message);
        }
        else if (err instanceof Error) {
            console.error("Firestore Error:", err.message);
        }
        else {
            console.error("Unexpected Error:", err);
        }
    }
    finally {
        isLoading.value = false;
    }
};
// Computed filter
const filteredEmployees = computed(() => {
    if (!searchQuery.value)
        return employees.value;
    const q = searchQuery.value.toLowerCase();
    return employees.value.filter((e) => (e.name ?? "").toLowerCase().includes(q) ||
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
    }
    catch (err) {
        alert("Failed to save attendance");
    }
    finally {
        isLoading.value = false;
    }
};
import { addDoc } from "firebase/firestore";
async function saveAttendance(data) {
    try {
        // 👇 save to "saveAttendance" collection
        const docRef = await addDoc(collection(db, "saveAttendance"), data);
        return { id: docRef.id, ...data }; // return saved data with generated ID
    }
    catch (err) {
        console.error("Error saving attendance:", err);
        throw err; // rethrow so caller can handle
    }
}
// =======================
// Modal Handlers
// =======================
const openModal = (employee) => {
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
const navigateTo = (path) => {
    router.push(path);
};
// =======================
// QR SCAN
// =======================
import { query, where } from "firebase/firestore";
const startScan = async () => {
    try {
        isScanning.value = true;
        scannedData.value = null;
        showResultQR.value = false;
        isLoading.value = true;
        // Ensure Google Barcode Scanner
        const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!available)
            await BarcodeScanner.installGoogleBarcodeScannerModule();
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
        }
        else {
            alert("No matching employee found.");
        }
    }
    catch (err) {
        if (!err.message?.includes("cancelled")) {
            console.error("Scan Error:", err);
            alert(err.message || "An unknown error occurred");
        }
    }
    finally {
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
        const saveRes = await api.post(import.meta.env.VITE_API_SAVE_ATTENDANCE_URI, {
            emp_id: scannedData.value.emp_id,
            segment: segmentQR.value,
            timestamp: new Date().toISOString(),
        }, {
            headers: { Accept: "application/json" },
        });
        message.value = saveRes.data.message || "Attendance saved successfully!";
        console.log("Attendance saved:", saveRes.data);
        showSuccessQR.value = true;
        if (segmentQR.value === "3") {
            hasSavedPMQR.value = true;
        }
    }
    catch (err) {
        console.error("Error saving attendance:", err);
        alert("Failed to save attendance");
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bg-[#F8FAFC] inset-0 absolute" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shadow-md pb-3" },
});
/** @type {[typeof AppHeader, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppHeader, new AppHeader({
    title: "Employee List",
    iconClass: "fa-solid fa-list",
}));
const __VLS_1 = __VLS_0({
    title: "Employee List",
    iconClass: "fa-solid fa-list",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "absolute left-[5%] top-[3.7rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/scan');
        } },
    ...{ class: "bg-transparent text-black text-xl" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fa-solid fa-arrow-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "max-w-[90%] w-full mx-auto fixed top-[18%] left-[5%]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "relative w-full" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onKeypress: (__VLS_ctx.search) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "Type Employee ID",
    ...{ class: "w-full p-2 pl-10 border rounded-lg text-black font-thin font-montserrat focus:outline-none bg-white focus:ring-2 focus:ring-gray-400" },
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "animate-spin rounded-full h-16 w-16 border-t-4 border-[#1C75BC]" },
    });
}
if (__VLS_ctx.searchQuery && __VLS_ctx.searchTriggered) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-4 bg-white shadow fixed left-[5%] top-[25%] max-w-[90%] w-[90%] h-[65%] overflow-x-scroll flex-shrink-0 gap-8" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "overflow-y-scroll h-full" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "text-left w-full min-w-[200%]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({
        ...{ class: "bg-[#1C75BC] text-white" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "p-4 border-r border-[#CBD5E1] whitespace-nowrap font-montserrat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "p-4 border-r border-[#CBD5E1] font-montserrat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "p-4 border-r border-[#CBD5E1] font-montserrat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "p-4 border-r border-[#CBD5E1] font-montserrat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "p-4 border-l border-[#CBD5E1] font-montserrat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.filteredEmployees))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.searchQuery && __VLS_ctx.searchTriggered))
                        return;
                    __VLS_ctx.openModal(item);
                } },
            key: (item.emp_id),
            ...{ class: "hover:bg-blue-100 cursor-pointer border-b font-thin font-montserrat border-[#CBD5E1] text-black flex-shrink-0 gap-8" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "p-4 border-r border-[#CBD5E1]" },
        });
        (item.emp_id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "p-4 border-r border-[#CBD5E1]" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "p-4 border-r border-[#CBD5E1]" },
        });
        (item.department_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "p-4 border-r border-[#CBD5E1]" },
        });
        (item.group_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "p-4" },
        });
        (item.qrid);
    }
    if (__VLS_ctx.filteredEmployees.length === 0 && !__VLS_ctx.isLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            colspan: "5",
            ...{ class: "p-3 text-gray-500 text-left" },
        });
        (__VLS_ctx.searchQuery
            ? `No results found for "${__VLS_ctx.searchQuery}"`
            : "No employees available");
    }
}
if (__VLS_ctx.showDetailsModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
const __VLS_3 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    enterActiveClass: "transition duration-200 ease-in-out",
    leaveActiveClass: "transition duration-200 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_5 = __VLS_4({
    enterActiveClass: "transition duration-200 ease-in-out",
    leaveActiveClass: "transition duration-200 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
if (__VLS_ctx.showDetailsModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-black absolute left-[5%] w-[90%] h-[90%] top-[5%] flex flex-col justify-center bg-white rounded-xl align-center items-center z-20" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "font-bold text-lg mb-[1rem] text-black" },
    });
    if (__VLS_ctx.selectedEmployee) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex flex-col justify-center items-center text-black" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ class: "h-40 w-40 rounded-[50%] mb-[2rem]" },
            src: (__VLS_ctx.selectedEmployee?.image || __VLS_ctx.avatarIcon),
            alt: "Employee Photo",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flex flex-col justify-center items-center text-black" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            id: "modalContent",
            ...{ class: "space-y-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left font-bold text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left" },
        });
        (__VLS_ctx.selectedEmployee.emp_id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left font-bold text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left" },
        });
        (__VLS_ctx.selectedEmployee.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left font-bold text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left" },
        });
        (__VLS_ctx.selectedEmployee.department_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left font-bold text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left" },
        });
        (__VLS_ctx.selectedEmployee.group_name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left font-bold text-lg" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-left" },
        });
        (__VLS_ctx.selectedEmployee.qrid);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex gap-10 justify-between mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmAttendance) },
        ...{ class: "px-4 py-2 bg-[#1C75BC] text-white rounded-lg hover:bg-blue-600" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "px-7 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" },
    });
}
var __VLS_6;
if (__VLS_ctx.showConfirmationModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfirmationModal))
                    return;
                __VLS_ctx.showConfirmationModal = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
const __VLS_7 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_9 = __VLS_8({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
if (__VLS_ctx.showConfirmationModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "transform fixed left-[5%] w-[90%] h-[22%] top-[40%] flex flex-col items-center justify-center bg-white rounded-xl z-20 text-black" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-xl mb-[1rem] mt-[1rem] font-bold m-8" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex gap-10 text-xs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.takeAttendance) },
        type: "submit",
        ...{ class: "px-8 py-2 bg-[#1C75BC] text-white rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfirmationModal))
                    return;
                __VLS_ctx.showConfirmationModal = false;
                __VLS_ctx.showDetailsModal = true;
                ;
            } },
        ...{ class: "px-8 py-2 bg-gray-300 text-gray-700 rounded-lg" },
    });
}
var __VLS_10;
if (__VLS_ctx.showSuccess) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccess))
                    return;
                __VLS_ctx.showSuccess = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
const __VLS_11 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_13 = __VLS_12({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
if (__VLS_ctx.showSuccess) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed left-[5%] w-[90%] h-[50%] top-[25%] flex items-center justify-center z-20" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccess))
                    return;
                __VLS_ctx.showSuccess = false;
            } },
        ...{ class: "px-2 py-2 text-gray-400 bg-transparent rounded-lg fa-solid fa-xmark absolute text-bold text-[2rem] left-[80%] top-[20%]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-white p-6 rounded-lg shadow-xl w-80" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-3xl font-bold mb-4 text-green-500 mt-3" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-lg font-semibold mb-4 text-green-500" },
    });
    (__VLS_ctx.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccess))
                    return;
                __VLS_ctx.startScan();
                __VLS_ctx.showSuccess = false;
                ;
            } },
        ...{ class: "bg-[#1C75BC] text-white w-full py-2 rounded-md mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccess))
                    return;
                __VLS_ctx.showSuccess = false;
            } },
        ...{ class: "bg-gray-300 text-gray-700 w-full py-2 rounded-md" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccess))
                    return;
                __VLS_ctx.showSuccess = false;
            } },
        ...{ class: "text-[white] w-full py-1 fixed left-0 font-semibold text-[1rem] mt-[19rem] underline text-md bg-transparent rounded-md z-30" },
    });
}
var __VLS_14;
if (__VLS_ctx.showResultQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showResultQR))
                    return;
                __VLS_ctx.showResultQR = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "animate-spin rounded-full h-16 w-16 border-t-4 border-[#1C75BC]" },
    });
}
const __VLS_15 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    enterActiveClass: "transition duration-400 ease-in-out",
    leaveActiveClass: "transition duration-400 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_17 = __VLS_16({
    enterActiveClass: "transition duration-400 ease-in-out",
    leaveActiveClass: "transition duration-400 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
if (__VLS_ctx.showResultQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed left-[5%] w-[90%] h-[85%] top-[7.5%] flex flex-col justify-center bg-white rounded-xl items-center z-20" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "font-bold text-lg mb-[1rem] text-black" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-col justify-center items-center text-black" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ class: "h-40 w-40 rounded-[50%] mb-[2rem]" },
        src: (__VLS_ctx.selectedEmployee?.image || __VLS_ctx.avatarIcon),
        alt: "Employee Photo",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: "modalContent",
        ...{ class: "space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left font-bold text-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left" },
    });
    (__VLS_ctx.scannedData?.emp_id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left font-bold text-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left" },
    });
    (__VLS_ctx.scannedData?.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left font-bold text-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left" },
    });
    (__VLS_ctx.scannedData?.department_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left font-bold text-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-left" },
    });
    (__VLS_ctx.scannedData?.group_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex gap-10 justify-between mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmAttendanceQR) },
        ...{ class: "bg-[#1C75BC] text-white px-4 py-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showResultQR))
                    return;
                __VLS_ctx.showResultQR = false;
            } },
        ...{ class: "bg-gray-300 text-gray-700 px-7 py-2" },
    });
}
var __VLS_18;
if (__VLS_ctx.showConfirmationQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfirmationQR))
                    return;
                __VLS_ctx.showConfirmationQR = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
const __VLS_19 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_21 = __VLS_20({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
if (__VLS_ctx.showConfirmationQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed left-[5%] w-[90%] h-[22%] top-[40%] flex flex-col items-center justify-center bg-white rounded-xl z-20 text-black" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-xl mb-[1rem] mt-[1rem] font-bold m-8" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex gap-10 text-xs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.completeAttendanceQR) },
        ...{ class: "px-8 py-2 bg-[#1C75BC] text-white rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfirmationQR))
                    return;
                __VLS_ctx.showResultQR = true;
                __VLS_ctx.showConfirmationQR = false;
                ;
            } },
        ...{ class: "px-8 py-2 bg-gray-300 text-gray-700 rounded-lg" },
    });
}
var __VLS_22;
if (__VLS_ctx.showSuccessQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccessQR))
                    return;
                __VLS_ctx.showSuccessQR = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-20" },
    });
}
const __VLS_23 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_25 = __VLS_24({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_26.slots.default;
if (__VLS_ctx.showSuccessQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed left-[5%] w-[90%] h-[50%] top-[25%] flex items-center justify-center z-20" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccessQR))
                    return;
                __VLS_ctx.showSuccessQR = false;
            } },
        ...{ class: "px-2 py-2 text-gray-500 bg-transparent rounded-lg fa-solid fa-xmark absolute text-bold text-[2rem] left-[80%] top-[20%]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-white p-6 rounded-lg shadow-xl w-80" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-3xl font-bold mb-4 text-green-500 mt-3" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-lg font-semibold mb-4 text-green-500" },
    });
    (__VLS_ctx.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccessQR))
                    return;
                __VLS_ctx.startScan();
                __VLS_ctx.showSuccessQR = false;
                ;
            } },
        ...{ class: "bg-[#1C75BC] text-white w-full py-2 rounded-md mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccessQR))
                    return;
                __VLS_ctx.navigateTo('/list');
            } },
        ...{ class: "bg-gray-300 text-black w-full py-2 rounded-md" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showSuccessQR))
                    return;
                __VLS_ctx.showSuccessQR = false;
            } },
        ...{ class: "text-white w-full py-1 fixed left-0 font-semibold text-[1rem] mt-[19rem] underline text-md bg-transparent rounded-md z-30" },
    });
}
var __VLS_26;
/** @type {__VLS_StyleScopedClasses['bg-[#F8FAFC]']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[3.7rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-arrow-left']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[18%]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-magnifying-glass']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['font-thin']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[25%]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[65%]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-[200%]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['font-thin']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['h-40']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[50%]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['px-7']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[22%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[40%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['m-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[50%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[25%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-xmark']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['text-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[80%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[20%]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[white]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[19rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-70']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[85%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[7.5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['h-40']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[50%]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['px-7']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[22%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[40%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['m-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[90%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[50%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[25%]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-xmark']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['text-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[80%]']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[20%]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[19rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            avatarIcon: avatarIcon,
            AppHeader: AppHeader,
            searchQuery: searchQuery,
            selectedEmployee: selectedEmployee,
            showDetailsModal: showDetailsModal,
            showConfirmationModal: showConfirmationModal,
            showSuccess: showSuccess,
            isLoading: isLoading,
            searchTriggered: searchTriggered,
            message: message,
            scannedData: scannedData,
            showResultQR: showResultQR,
            showConfirmationQR: showConfirmationQR,
            showSuccessQR: showSuccessQR,
            search: search,
            filteredEmployees: filteredEmployees,
            takeAttendance: takeAttendance,
            openModal: openModal,
            closeModal: closeModal,
            confirmAttendance: confirmAttendance,
            navigateTo: navigateTo,
            startScan: startScan,
            confirmAttendanceQR: confirmAttendanceQR,
            completeAttendanceQR: completeAttendanceQR,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
