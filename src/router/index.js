import { createRouter, createWebHistory } from 'vue-router'

import RegistroPonto from '../pages/RegistroPonto.vue'
import PassagemTurno from '../pages/PassagemTurno.vue'
import Escala from '../pages/Escala.vue'

const routes = [
  { path: '/', component: RegistroPonto },
  { path: '/passagem', component: PassagemTurno },
  { path: '/escala', component: Escala },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
