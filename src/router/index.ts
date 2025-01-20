import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'assinfo',
      component: ()=>import('@/views/AssInfo.vue'),
    },
    {
      path: '/userlink',
      name: 'userlink',
      component: ()=>import('@/views/UserLink.vue'),
    },
    {
      path: '/setting',
      name: 'setting',
      component: ()=>import('@/views/Setting.vue'),
    },
  ],
})

export default router
