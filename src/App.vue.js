import { App } from '@capacitor/app';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const showLayout = computed(() => route.path === '/home' || route.path === '/scan' || route.path === '/profile');
onMounted(() => {
    // Completely disable back button
    App.addListener('backButton', () => {
        // Empty callback prevents default back behavior
    });
});
// @ts-ignore
import layout from '../src/components/layout/pagelayout.vue';
import axios from 'axios';
axios.interceptors.response.use(response => response, error => {
    if (!window.navigator.onLine) {
        alert('No internet connection. Please check your connection and try again.');
        return Promise.reject(new Error('No internet connection'));
    }
    return Promise.reject(error);
});
import { ScreenOrientation } from '@capacitor/screen-orientation';
ScreenOrientation.lock({ orientation: 'portrait' });
import { SplashScreen } from '@capacitor/splash-screen';
// To hide splash screen after some condition
SplashScreen.hide();
// To show splash screen again if needed
SplashScreen.show();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.showLayout) {
    /** @type {[typeof layout, typeof layout, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(layout, new layout({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    __VLS_2.slots.default;
    const __VLS_4 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    var __VLS_2;
}
else {
    const __VLS_8 = {}.RouterView;
    /** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_12 = {};
    var __VLS_11;
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            showLayout: showLayout,
            layout: layout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
