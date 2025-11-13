<template>
  <div>
    <h2>Passagem de Turno</h2>
    <textarea v-model="mensagem" placeholder="Anotações do turno..." rows="6"></textarea>
    <button @click="salvar">Salvar Anotação</button>

    <div v-if="anotacoes.length" class="anotacoes">
      <h3>Anotações anteriores</h3>
      <ul>
        <li v-for="(a, i) in anotacoes" :key="i">{{ a }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const mensagem = ref('')
const anotacoes = ref([])

function salvar() {
  if (mensagem.value.trim()) {
    anotacoes.value.unshift(`${new Date().toLocaleString()} - ${mensagem.value}`)
    mensagem.value = ''
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none;
}
button {
  background: #1e90ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.anotacoes {
  margin-top: 16px;
}
</style>
