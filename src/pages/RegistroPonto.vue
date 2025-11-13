<template>
  <div>
    <h2>Registro de Ponto</h2>
    <button @click="baterPonto">Bater Ponto</button>
    <ul>
      <li v-for="(item, i) in registros" :key="i">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const registros = ref([])
function baterPonto() {
  registros.value.push(`Ponto batido em ${new Date().toLocaleString()}`)
}
</script>
