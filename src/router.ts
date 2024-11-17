import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/demo/Index.vue') },
    { path: '/test', name: 'test', component: () => import('./views/test/Index.vue') },
    { path: '/experiment', name: 'experiment', component: () => import('./views/experiment/Index.vue') },
  ],
})

export default router
