import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { NavLinks } from '@/shared/sectionsConfig';

const navRoutes: RouteRecordRaw[] = NavLinks.map((link): RouteRecordRaw => ({
  path: `/${link.id}`,
  name: link.id,
  component: HomeView,
}));

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // Paths all point to HomeView, but they have different expected routes and names that
    // users should be able to link to
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    ...navRoutes,
  ],
});

export default router;
