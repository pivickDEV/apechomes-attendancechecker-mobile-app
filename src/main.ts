import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';
import router from './router';
// import router from "./router/index";
import axios from 'axios';
import './style.css';

const app = createApp(App);

app.config.globalProperties.$axios = axios; // Make Axios available globally

app.use(router);

app.mount('#app');