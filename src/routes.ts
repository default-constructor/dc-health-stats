import {createRouter, createWebHistory} from "vue-router";
import DeathsStats from "./views/DeathsChartView.vue";
import Home from './views/Home.vue';

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'deaths-stats',
    path: '/deaths-stats',
    component: DeathsStats
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
