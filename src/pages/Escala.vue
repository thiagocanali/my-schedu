<template>
  <div class="escala-container">
    <h2>📅 Escala de Trabalho</h2>
    <p>Visualize os turnos da semana e gerencie solicitações de troca.</p>

    <!-- Tabela principal -->
    <table class="escala-table">
      <thead>
        <tr>
          <th>Dia</th>
          <th>Turno</th>
          <th>Operador</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in escala" :key="i">
          <td>{{ item.dia }}</td>
          <td>{{ item.turno }}</td>
          <td>{{ item.operador }}</td>
          <td>
            <button
              v-if="!item.solicitado"
              @click="abrirSolicitacao(i)"
            >
              Solicitar troca
            </button>
            <span v-else class="solicitado">
              Solicitado para {{ item.solicitacao?.para }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de solicitação -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Solicitar troca - {{ escala[selectedIndex]?.dia }}</h3>

        <label>Escolha o operador para trocar:</label>
        <select v-model="operadorSelecionado">
          <option disabled value="">Selecione</option>
          <option v-for="(item, i) in escala" :key="i" :value="item.operador" v-if="item.operador !== escala[selectedIndex].operador">
            {{ item.operador }} ({{ item.dia }} - {{ item.turno }})
          </option>
        </select>

        <div class="modal-actions">
          <button @click="confirmarSolicitacao" :disabled="!operadorSelecionado">Confirmar</button>
          <button class="cancelar" @click="cancelarSolicitacao">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Painel de solicitações -->
    <div class="solicitacoes" v-if="solicitacoesPendentes.length">
      <h3>📨 Solicitações Pendentes</h3>
      <ul>
        <li v-for="(sol, i) in solicitacoesPendentes" :key="i">
          <strong>{{ sol.de }}</strong> quer trocar com <strong>{{ sol.para }}</strong>  
          ({{ sol.dia }} - {{ sol.turno }})
          <button @click="aceitarTroca(sol)">Aceitar</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const escala = ref([
  { dia: 'Segunda', turno: 'Manhã', operador: 'João', solicitado: false, solicitacao: null },
  { dia: 'Terça', turno: 'Tarde', operador: 'Maria', solicitado: false, solicitacao: null },
  { dia: 'Quarta', turno: 'Noite', operador: 'Carlos', solicitado: false, solicitacao: null },
  { dia: 'Quinta', turno: 'Madrugada', operador: 'Ana', solicitado: false, solicitacao: null },
  { dia: 'Sexta', turno: 'Manhã', operador: 'Lucas', solicitado: false, solicitacao: null },
  { dia: 'Sábado', turno: 'Tarde', operador: 'Paula', solicitado: false, solicitacao: null },
  { dia: 'Domingo', turno: 'Noite', operador: 'Rafael', solicitado: false, solicitacao: null }
])

const showModal = ref(false)
const selectedIndex = ref(null)
const operadorSelecionado = ref('')
const solicitacoes = ref([])

// 🔄 Carrega dados do navegador
onMounted(() => {
  const saved = localStorage.getItem('escala_v2')
  const savedSolic = localStorage.getItem('solicitacoes')
  if (saved) escala.value = JSON.parse(saved)
  if (savedSolic) solicitacoes.value = JSON.parse(savedSolic)
})

// 💾 Salva quando mudar
watch([escala, solicitacoes], () => {
  localStorage.setItem('escala_v2', JSON.stringify(escala.value))
  localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes.value))
}, { deep: true })

// 🔘 Abre modal
function abrirSolicitacao(index) {
  selectedIndex.value = index
  operadorSelecionado.value = ''
  showModal.value = true
}

// ✅ Confirmar troca
function confirmarSolicitacao() {
  const from = escala.value[selectedIndex.value]
  const to = operadorSelecionado.value

  from.solicitado = true
  from.solicitacao = { para: to, dia: from.dia, turno: from.turno, de: from.operador }

  solicitacoes.value.push({
    de: from.operador,
    para: to,
    dia: from.dia,
    turno: from.turno
  })

  showModal.value = false
  alert(`Solicitação enviada para ${to}`)
}

// ❌ Cancelar modal
function cancelarSolicitacao() {
  showModal.value = false
}

// 📬 Lista de solicitações pendentes
const solicitacoesPendentes = computed(() => solicitacoes.value.filter(s => !s.concluida))

// 🤝 Aceitar troca
function aceitarTroca(sol) {
  const operador1 = escala.value.find(e => e.operador === sol.de)
  const operador2 = escala.value.find(e => e.operador === sol.para)

  if (operador1 && operador2) {
    const temp = operador1.operador
    operador1.operador = operador2.operador
    operador2.operador = temp
  }

  solicitacoes.value = solicitacoes.value.filter(s => s !== sol)
  alert(`Troca entre ${sol.de} e ${sol.para} confirmada!`)
}
</script>

<style scoped>
.escala-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 5px;
  color: #2f3640;
}

p {
  color: #555;
  margin-bottom: 20px;
}

.escala-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.escala-table th, .escala-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.escala-table th {
  background: #40739e;
  color: white;
}

button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #44bd32;
  color: white;
  transition: 0.2s;
}

button:hover {
  background: #4cd137;
}

.solicitado {
  color: #718093;
  font-size: 0.9rem;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.cancelar {
  background: #e84118;
}

.cancelar:hover {
  background: #c23616;
}

/* Painel de solicitações */
.solicitacoes {
  margin-top: 30px;
  background: #f5f6fa;
  border-radius: 8px;
  padding: 15px;
}

.solicitacoes ul {
  list-style: none;
  padding: 0;
}

.solicitacoes li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.solicitacoes button {
  background: #0097e6;
}

.solicitacoes button:hover {
  background: #00a8ff;
}
</style>
