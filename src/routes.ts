import {createRouter, createWebHistory} from "vue-router";
import DeathsStatsView from "./views/DeathsStatsView.vue";
import Home from "./views/Home.vue";

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'deaths-stats',
    path: '/deaths-stats',
    component: DeathsStatsView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
