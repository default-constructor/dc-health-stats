import {createRouter, createWebHistory} from "vue-router";
import DeathsStatsView from "./views/DeathsStatsView.vue";
import Icd10StatsView from "./views/Icd10StatsView.vue";
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
  {
    name: 'icd-10-stats',
    path: '/icd-10-stats',
    component: Icd10StatsView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
