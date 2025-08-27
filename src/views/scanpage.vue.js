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
    const options = {
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
const scannedData = ref(null);
const showResultQR = ref(false);
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed
const startScan = async () => {
    try {
        isScanning.value = true;
        scannedData.value = null;
        showResultQR.value = false;
        isLoading.value = true;
        // Ensure Google Barcode Scanner is available
        const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
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
        }
        else {
            scannedData.value = null;
            alert("No matching employee found for this QR code.");
        }
    }
    catch (err) {
        if (err instanceof Error) {
            if (!err.message.includes("cancelled")) {
                console.error("Scan Error:", err.message);
                alert(err.message);
            }
        }
        else {
            console.error("Unknown Error:", err);
            alert("An unknown error occurred");
        }
    }
    finally {
        isScanning.value = false;
        isLoading.value = false;
    }
};
const navigateTo = (path) => {
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
        const q = query(attendanceRef, where("emp_id", "==", scannedData.value.emp_id), where("segment", "==", segmentQR.value));
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
    }
    catch (error) {
        console.error("Error saving attendance:", error);
        alert("Error saving attendance");
    }
};
import AppHeader from "../components/header/AppHeader.vue";
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bg-[#1c75bc] absolute inset-0 w-full h-[150vh] overflow-y-auto" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shadow-md pb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "absolute left-8 top-[3.8rem] rounded-3xl" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ class: "w-[3rem] rounded-[10px]" },
    src: "../assets/image/ATTENDANCECHECKER-ICON-Whitebg.png",
    alt: "",
});
/** @type {[typeof AppHeader, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppHeader, new AppHeader({
    title: "Scan QR",
    iconClass: "fa-solid fa-qrcode",
    textClass: "text-white",
}));
const __VLS_1 = __VLS_0({
    title: "Scan QR",
    iconClass: "fa-solid fa-qrcode",
    textClass: "text-white",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex flex-row absolute items-center top-[8rem] left-[1.5rem] p-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ class: "h-[3rem] ml-[1rem] rounded-full" },
    src: "../assets/image/avataricon.jpg",
    alt: "User Avatar",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex flex-col ml-[.5rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-md font-semibold text-gray-300 font-montserrat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ class: "h-[1rem] w-[1rem] ml-[.5rem] mb-[.2rem]" },
    src: "../assets/image/wavehand.png",
    alt: "Wave Hand",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-white font-semibold text-md font-montserrat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inset-0 bg-white absolute top-[28rem] rounded-t-xl" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "w-[75%] sm:w-[85%] md:w-[75%] min-h-fit bg-[#F8FAFC] absolute left-1/2 transform -translate-x-1/2 top-[20%] h-auto rounded-2xl border border-[#CFCFD0] shadow-md" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex flex-col mt-[10%] justify-center items-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-black text-2xl font-montserrat font-semibold mt-[.5rem]" },
});
(__VLS_ctx.formattedTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-black text-base mt-[1rem] font-semibold font-montserrat" },
});
(__VLS_ctx.formattedDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex justify-center items-center p-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isDrawerOpen = true;
        } },
    ...{ class: "relative w-[10rem] h-[10rem] rounded-full bg-gradient-to-b from-white to-[#1C75BC] overflow-hidden inline-block shadow-lg border border-[#CBD5E1] mt-[1rem] cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ class: "h-[7rem] w-[7rem] mx-[.6rem] mt-[1.5rem]" },
    src: "../assets/image/scanicon.png",
    alt: "Scan Icon",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center text-xl font-bold font-montserrat bg-[#1c75bc]/60 px-3 py-1 whitespace-nowrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-[#1C75BC] text-lg font-bold font-montserrat mt-[1rem] mb-[1.5rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center justify-center mb-[1rem] font-bold text-sm text-black" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "ml-[2rem] text-black" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center font-bold justify-center text-center mb-[1rem] text-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-[#12B76A] ml-[3.5rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex items-center font-bold justify-center text-center gap-12 text-sm mb-[3rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black mr-[1rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-[#1c75bc] font-bold mb-[1.5rem]" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex mb-[2rem] text-center justify-center items-center gap-[.8rem] text-md flex-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black font-bold" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black font-bold" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-black font-bold" },
});
if (__VLS_ctx.isDrawerOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDrawerOpen))
                    return;
                __VLS_ctx.isDrawerOpen = false;
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 z-10" },
    });
}
const __VLS_3 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    enterActiveClass: "transition-all duration-200 ease-in-out",
    leaveActiveClass: "transition-all duration-200 ease-in-out",
    enterFromClass: "translate-y-full opacity-0",
    leaveToClass: "translate-y-full opacity-0",
}));
const __VLS_5 = __VLS_4({
    enterActiveClass: "transition-all duration-200 ease-in-out",
    leaveActiveClass: "transition-all duration-200 ease-in-out",
    enterFromClass: "translate-y-full opacity-0",
    leaveToClass: "translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
if (__VLS_ctx.isDrawerOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "z-10 fixed bottom-0 left-0 w-full max-w-full bg-white shadow-2xl p-6 rounded-t-3xl border h-[35%]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "max-w-[13%] bg-[#1c75bc] h-[2%] ml-[43.5%] w-full mt-[0.5rem] mb-[0.5rem] rounded-l-[1rem] rounded-r-[1rem]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDrawerOpen))
                    return;
                __VLS_ctx.startScan();
                __VLS_ctx.isDrawerOpen = false;
                ;
            } },
        disabled: (__VLS_ctx.isScanning),
        ...{ class: "text-left text-xl py-2 text-[#1C75BC] border-[#1C75BC] bg-white w-full font-semibold mt-[1rem]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-qrcode mr-[1rem]" },
    });
    (__VLS_ctx.isScanning ? "Scanning..." : "Start Scan");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDrawerOpen))
                    return;
                __VLS_ctx.navigateTo('/list');
            } },
        ...{ class: "w-full text-left text-xl py-2 text-white bg-[#1C75BC] font-semibold mt-[1rem]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-magnifying-glass mr-[0.8rem]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDrawerOpen))
                    return;
                __VLS_ctx.isDrawerOpen = false;
            } },
        ...{ class: "w-full mt-[1rem] text-left text-xl py-2 font-semibold bg-gray-300 text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-xmark ml-[0.1rem] mr-[1rem]" },
    });
}
var __VLS_6;
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
const __VLS_7 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    enterActiveClass: "transition duration-400 ease-in-out",
    leaveActiveClass: "transition duration-400 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_9 = __VLS_8({
    enterActiveClass: "transition duration-400 ease-in-out",
    leaveActiveClass: "transition duration-400 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
if (__VLS_ctx.showResultQR) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed left-[5%] w-[90%] h-[85%] top-[7.5%] flex flex-col justify-center bg-white rounded-xl items-center z-20" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "font-bold text-lg mb-[1rem]" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex flex-col justify-center items-center text-black" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ class: "h-[10rem] rounded-[50%] w-auto mb-[2rem]" },
        src: (__VLS_ctx.scannedData?.image
            ? 'data:image/png;base64,' + __VLS_ctx.scannedData?.image
            : '../assets/image/avataricon.jpg'),
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
var __VLS_10;
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
var __VLS_14;
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
const __VLS_15 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}));
const __VLS_17 = __VLS_16({
    enterActiveClass: "transition duration-300 ease-in-out",
    leaveActiveClass: "transition duration-300 ease-in-out",
    enterFromClass: "-translate-y-full opacity-0",
    leaveToClass: "-translate-y-full opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
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
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['bg-[#1c75bc]']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[150vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-8']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[3.8rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[3rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[8rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[1.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[3rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-md']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[.2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-md']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[28rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-t-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[75%]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:w-[85%]']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-[75%]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#F8FAFC]']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[20%]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CFCFD0]']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[10%]']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[10rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[10rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-b']} */ ;
/** @type {__VLS_StyleScopedClasses['from-white']} */ ;
/** @type {__VLS_StyleScopedClasses['to-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#CBD5E1]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-95']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[7rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[7rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-[.6rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1c75bc]/60']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-montserrat']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#12B76A]']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[3.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-12']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[3rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#1c75bc]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[1.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[2rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-[.8rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-md']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-t-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[35%]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[13%]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1c75bc]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[2%]']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[43.5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[0.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[0.5rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-l-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-r-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-qrcode']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#1C75BC]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-magnifying-glass']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-[0.8rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-[1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-xmark']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-[0.1rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-[1rem]']} */ ;
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
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[10rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-[50%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-auto']} */ ;
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
            isDrawerOpen: isDrawerOpen,
            showConfirmationQR: showConfirmationQR,
            showSuccessQR: showSuccessQR,
            formattedTime: formattedTime,
            formattedDate: formattedDate,
            isLoading: isLoading,
            isScanning: isScanning,
            scannedData: scannedData,
            showResultQR: showResultQR,
            startScan: startScan,
            navigateTo: navigateTo,
            confirmAttendanceQR: confirmAttendanceQR,
            message: message,
            completeAttendanceQR: completeAttendanceQR,
            AppHeader: AppHeader,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
