import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SensorsView from '@/views/SensorsView.vue'
import LightsView from '@/views/LightsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sensors',
      name: 'sensors',
      component: SensorsView,
    },
    {
      path: '/lights',
      name: 'lights',
      component: LightsView,
    },
  ],
})

export default router
