import { createRouter, createWebHistory } from 'vue-router';
import LayoutView from '../components/layout/pagelayout.vue';
import EditprofileView from '../views/editprofilepage.vue';
import HomeView from '../views/homepage.vue';
import ListView from '../views/listpage.vue';
import LoginView from '../views/loginpage.vue';
import ProfileView from '../views/profilepage.vue';
import ScanView from '../views/scanpage.vue';
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap';
document.head.appendChild(link);
const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView,
        meta: { hideLayout: true }
    },
    {
        path: '/home',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/scan',
        name: 'Scan',
        component: ScanView
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileView
    },
    {
        path: '/layout',
        name: 'Layout',
        component: LayoutView
    },
    {
        path: '/list',
        name: 'List',
        component: ListView
    },
    {
        path: '/editprofilepage',
        name: 'Editprofilepage',
        component: EditprofileView
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
export default router;
// const router = createRouter({
//   history: createWebHistory(), // Uses HTML5 history mode
//   routes: [
//     { 
//         path: '/', 
//         name: 'Home', 
//         component: HomeView 
//     },
//     { 
//         path: '/scan', 
//         name: 'Scan', 
//         component: ScanView 
//     },
//     { 
//         path: '/profile', 
//         name: 'Profile', 
//         component: ProfileView 
//     },
//     { 
//         path: '/layout', 
//         name: 'Layout', 
//         component: LayoutView 
//     },
//     {
//         path: '/list', 
//         name: 'List', 
//         component: ListView 
//     },
// ],
// });
// export { router };
