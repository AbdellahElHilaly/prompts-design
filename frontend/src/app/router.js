import { createRouter, createWebHashHistory } from 'vue-router'
import GalleryView from '../views/GalleryView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'gallery',
      component: GalleryView,
    },
    {
      path: '/demo/:designId',
      name: 'demo',
      component: () => import('../views/DemoView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDesignsView.vue'),
    },
  ],
})

export default router
