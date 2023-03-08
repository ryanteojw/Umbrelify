import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from "../firebase"
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const routes = [
  {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
          requiresAuth: true
      }
  },
  {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: true
      }
  
  },
  {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/LeaderboardView.vue'),
      meta: {
        requiresAuth: true
      }

  },
  {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
  },
  {
      path: '/forecast',
      name: 'forecast',
      component: () => import('../views/ForecastView.vue'),
      meta: {
        requiresAuth: true
      }

  },
  {
      path: '/register',
      name: 'register',
      component: () => import("../views/Register.vue")
  }

]

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user)
      },
      reject
    )
  })
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()){
      next()
    } else {
      next("/login")
    }
  } else {
    next()
  }
})

export default router
