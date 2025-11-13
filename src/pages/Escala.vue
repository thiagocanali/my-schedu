<template>
  <div class="escala-wrapper">
    <header class="escala-header">
      <h2>📅 Escala de Trabalho — Visual estilo planilha</h2>

      <div class="header-actions">
        <div class="period-controls">
          <DatePicker
            v-model="selectedRange"
            type="daterange"
            placeholder="Selecione período"
            range-separator="até"
            start-placeholder="Início"
            end-placeholder="Fim"
          />

          <div class="quick-actions">
            <select v-model.number="quickMonth" title="Mês">
              <option :value="null">— Mês rápido —</option>
              <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>

            <select v-model.number="quickYear" title="Ano">
              <option :value="null">— Ano —</option>
              <option v-for="y in anosDisponiveis" :key="y" :value="y">{{ y }}</option>
            </select>

            <button @click="gerarMes">Gerar Mês</button>
            <button @click="carregarPeriodo">Carregar</button>
          </div>
        </div>

        <div class="header-actions-right">
          <button @click="resetToDefault" title="Recarregar dados do arquivo padrão">Reset padrão</button>
          <button @click="exportJSON" title="Exportar escala atual">Exportar JSON</button>
          <label class="import-label" title="Importar JSON (substitui a escala atual)">
            Importar
            <input type="file" accept=".json" @change="importJSON" />
          </label>
        </div>
      </div>
    </header>

    <!-- tabela -->
    <div class="table-wrap" v-if="diasLocal.length">
      <table class="escala-table">
        <thead>
          <tr>
            <th class="sticky-left">Dia</th>
            <th v-for="(op, idx) in operadoresLocal" :key="`h-${idx}`" class="operator-header">
              {{ opDisplay(op, idx) }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(dia, rowIndex) in diasLocal" :key="`r-${rowIndex}`">
            <td class="dia-col" :class="{ weekend: dia.isWeekend }">
              <div class="dia-text">{{ dia.label }}</div>
              <div class="dia-sub">{{ dia.data }}</div>
            </td>

            <td
              v-for="colIndex in operatorCount"
              :key="`c-${rowIndex}-${colIndex}`"
              :class="cellClass(rowIndex, colIndex - 1)"
              @click="openEditModal(rowIndex, colIndex - 1)"
            >
              <div class="cell-content">
                <div class="turno-text">{{ turnoValue(rowIndex, colIndex - 1) }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para editar célula -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Editar Turno — {{ diasLocal[selectedRow]?.label }} — {{ opDisplay(operadoresLocal[selectedCol], selectedCol) }}</h3>

        <label>Turno</label>
        <select v-model="editTurno">
          <option disabled value="">-- Escolha um turno --</option>

          <optgroup label="Dias úteis">
            <option v-for="t in turnoOptionsUteis" :key="t" :value="t">{{ t }}</option>
          </optgroup>

          <optgroup label="Finais de semana">
            <option v-for="t in turnoOptionsWeekend" :key="t" :value="t">{{ t }}</option>
          </optgroup>

          <optgroup label="Especiais">
            <option value="Folga">Folga</option>
            <option value="Férias">Férias</option>
            <option value="Atestado">Atestado</option>
            <option value="__custom">Outro (custom)</option>
          </optgroup>
        </select>

        <div v-if="editTurno === '__custom'">
          <input v-model="customTurno" placeholder="Digite o turno (ex: 06:00 às 14:00 / Folga)" />
        </div>

        <div class="modal-actions">
          <button @click="saveEdit" :disabled="!canSaveEdit">Salvar</button>
          <button class="cancel" @click="closeModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- pequena legenda -->
    <footer class="legend">
      <span class="legend-item manha">Manhã</span>
      <span class="legend-item tarde">Tarde</span>
      <span class="legend-item noite">Noite</span>
      <span class="legend-item madrugada">Madrugada</span>
      <span class="legend-item weekend-manha">We Manhã</span>
      <span class="legend-item weekend-tarde">We Tarde</span>
      <span class="legend-item weekend-madrugada">We Madrugada</span>
      <span class="legend-item folga">Folga</span>
      <span class="legend-item ferias">Férias</span>
      <span class="legend-item atestado">Atestado</span>
    </footer>
  </div>
</template>

<script setup>
/* Escala.vue final integrado:
   - Date range picker (vue-datepicker-next)
   - Quick month/year generator
   - Matriz de turnos (linhas = dias no período; cols = operadores)
   - Modal de edição com opções dias úteis, finais de semana, custom
   - Import/Export JSON, Reset padrão, persistência localStorage
*/

import { ref, computed, onMounted } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

import {
  operadores as operadoresBase,
  turnoOptionsUteis as turnoOptionsUteisBase,
  turnoOptionsWeekend as turnoOptionsWeekendBase,
  gerarDiasPeriodo,
  gerarTurnosPadraoParaRange,
  getColorForTurno
} from "@/data/escalaData.js";

// storage key
const STORAGE_KEY = "escala_planilha_full_v3";

// turnos para o select modal
const turnoOptionsUteis = turnoOptionsUteisBase.slice();
const turnoOptionsWeekend = turnoOptionsWeekendBase.slice();

// reactive state
const operadoresLocal = ref([]);
const diasLocal = ref([]);           // [{ data, label, isWeekend }]
const turnosMatrix = ref([]);       // matrix [row][col] = string

// picker / quick month
const selectedRange = ref(null);
const quickMonth = ref(null);
const quickYear = ref(null);
const meses = [
  { value: 0, label: "Janeiro" },{ value: 1, label: "Fevereiro" },{ value: 2, label: "Março" },
  { value: 3, label: "Abril" },{ value: 4, label: "Maio" },{ value: 5, label: "Junho" },
  { value: 6, label: "Julho" },{ value: 7, label: "Agosto" },{ value: 8, label: "Setembro" },
  { value: 9, label: "Outubro" },{ value: 10, label: "Novembro" },{ value: 11, label: "Dezembro" }
];
const anosDisponiveis = Array.from({length:6}, (_,i) => new Date().getFullYear()-2 + i);

// modal
const showModal = ref(false);
const selectedRow = ref(0);
const selectedCol = ref(0);
const editTurno = ref("");
const customTurno = ref("");

// helpers
const operatorCount = computed(() => Math.max(operadoresLocal.value.length, 1));
const mesesMap = meses.reduce((acc,m)=> (acc[m.value]=m.label,acc), {});

// --- load / save / normalize ---
function deepCopy(o){ return JSON.parse(JSON.stringify(o)) }

function normalizeMatrix() {
  const rows = diasLocal.value.length;
  const cols = operadoresLocal.value.length;
  if (!Array.isArray(turnosMatrix.value)) turnosMatrix.value = [];
  for (let r=0;r<rows;r++){
    if (!Array.isArray(turnosMatrix.value[r])) turnosMatrix.value[r] = [];
    for (let c=0;c<cols;c++){
      if (typeof turnosMatrix.value[r][c] === 'undefined' || turnosMatrix.value[r][c] === null) {
        turnosMatrix.value[r][c] = ""
      }
    }
    turnosMatrix.value[r].length = cols;
  }
  turnosMatrix.value.length = rows;
}

function saveToStorage(){
  const payload = {
    operadores: operadoresLocal.value,
    dias: diasLocal.value,
    turnos: turnosMatrix.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadFromStorageOrDefault(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      operadoresLocal.value = parsed.operadores || operadoresBase.slice();
      diasLocal.value = parsed.dias || [];
      turnosMatrix.value = parsed.turnos || [];
      normalizeMatrix();
      return;
    } catch(e){
      console.warn('Erro lendo storage — usando padrão', e);
    }
  }
  operadoresLocal.value = operadoresBase.slice();
  diasLocal.value = [];
  turnosMatrix.value = [];
  saveToStorage();
}

// quick: gerar mês selecionado (gera todos os dias do mês e uma escala padrão)
function gerarMes(){
  if (quickMonth.value === null || quickYear.value === null) {
    alert('Escolha mês e ano para gerar');
    return;
  }
  const inicio = new Date(quickYear.value, quickMonth.value, 1);
  const fim = new Date(quickYear.value, quickMonth.value + 1, 0);
  carregarRangeParaTabela(inicio, fim, true);
}

// carregar período a partir do date-range picker
function carregarPeriodo(){
  if (!selectedRange.value || selectedRange.value.length !== 2) {
    alert('Selecione um período válido no calendário');
    return;
  }
  const [s,e] = selectedRange.value;
  carregarRangeParaTabela(new Date(s), new Date(e), true);
}

function carregarRangeParaTabela(inicio, fim, overwrite=true){
  const dias = gerarDiasPeriodo(inicio, fim); // [{data,label,isWeekend}]
  diasLocal.value = dias;
  // gerar turnos padrão (preenche turnosMatrix)
  const padrao = gerarTurnosPadraoParaRange(dias, operadoresLocal.value);
  turnosMatrix.value = padrao;
  normalizeMatrix();
  saveToStorage();
}

// --- turno value helpers ---
function turnoValue(row, col){
  return turnosMatrix.value[row]?.[col] ?? "";
}

function cellClass(row, col){
  const tv = turnoValue(row,col);
  const dia = diasLocal.value[row];
  return inferClassFromTurno(tv, dia?.isWeekend);
}

function inferClassFromTurno(turnoStr, isWeekend){
  const t = (turnoStr || "").toLowerCase();
  if (!t) return "";
  if (t.includes('folga')) return 'folga';
  if (t.includes('féri')||t.includes('ferias')||t.includes('férias')) return 'ferias';
  if (t.includes('atestado')) return 'atestado';

  if (isWeekend) {
    if (t.includes('06:00') && t.includes('14:00')) return 'weekend-manha';
    if (t.includes('14:00') && t.includes('22:00')) return 'weekend-tarde';
    if (t.includes('22:00') && t.includes('06:00')) return 'weekend-madrugada';
    // fallback try by keywords
    if (t.includes('manhã') || t.includes('manha')) return 'weekend-manha';
    if (t.includes('tarde')) return 'weekend-tarde';
    if (t.includes('madrugada')||t.includes('22:')) return 'weekend-madrugada';
  }

  if (t.includes('05:30') || t.includes('06:00') || t.includes('06:30')) return 'manha';
  if (t.includes('11:30') || t.includes('12:00') || t.includes('12:30')) return 'tarde';
  if (t.includes('17:30') || t.includes('18:00') || t.includes('18:30')) return 'noite';
  if (t.includes('00:00') || t.includes('00:30') || t.includes('01:00')) return 'madrugada';

  return '';
}

// --- modal / edição ---
function openEditModal(row, col){
  selectedRow.value = row;
  selectedCol.value = col;
  editTurno.value = turnoValue(row,col) || "";
  customTurno.value = "";
  showModal.value = true;
}

const canSaveEdit = computed(()=> {
  return editTurno.value && (editTurno.value !== '__custom' ? true : customTurno.value.trim().length>0);
});

function saveEdit(){
  const value = editTurno.value === '__custom' ? customTurno.value.trim() : editTurno.value;
  if (!turnosMatrix.value[selectedRow.value]) turnosMatrix.value[selectedRow.value] = [];
  turnosMatrix.value[selectedRow.value][selectedCol.value] = value;
  saveToStorage();
  showModal.value = false;
}

function closeModal(){
  showModal.value = false;
}

// --- import / export ---
function exportJSON(){
  const payload = {
    operadores: operadoresLocal.value,
    dias: diasLocal.value,
    turnos: turnosMatrix.value
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'escala-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event){
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.operadores || !parsed.dias || !parsed.turnos) {
        alert('Arquivo inválido: precisa ter "operadores", "dias" e "turnos".');
        return;
      }
      operadoresLocal.value = parsed.operadores;
      diasLocal.value = parsed.dias;
      turnosMatrix.value = parsed.turnos;
      normalizeMatrix();
      saveToStorage();
      alert('Importado com sucesso!');
    } catch (err) {
      alert('Erro ao importar JSON: ' + err);
    }
  };
  reader.readAsText(file);
}

function resetToDefault(){
  if (!confirm('Recarregar dados padrão? Isso apaga suas alterações.')) return;
  localStorage.removeItem(STORAGE_KEY);
  loadFromStorageOrDefault();
  alert('Reset efetuado.');
}

// helper
function opDisplay(op, idx) {
  return op && op.nome ? op.nome : `Operador ${idx+1}`;
}

// lifecycle
onMounted(() => {
  loadFromStorageOrDefault();
});

// helper público para template
const diasLocalPublic = diasLocal;
</script>

<style scoped>
.escala-wrapper {
  padding: 18px;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  color: #222;
}

/* header */
.escala-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: 8px;
}

.header-actions-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* buttons and inputs */
.header-actions button,
.import-label,
.select {
  background: #40739e;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* table wrap */
.table-wrap {
  overflow-x: auto;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-top: 12px;
}

.escala-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  table-layout: fixed;
}
.escala-table th,
.escala-table td {
  border: 1px solid #dcdcdc;
  padding: 8px;
  text-align: center;
  vertical-align: middle;
  font-size: 0.9rem;
}

/* left column */
.sticky-left { position: sticky; left: 0; z-index: 5; background: #f5f6fa; }
.dia-col { text-align: left; padding-left: 12px; background: #f9fafb; width: 220px; }
.dia-col.weekend { background: #fff6ef; }
.dia-text { font-weight: 600; }
.dia-sub { font-size: 0.8rem; color: #666; }

/* headers */
.operator-header { background: #2f3640; color: #fff; font-weight: 700; position: sticky; top: 0; z-index: 3; }

/* cell classes */
.manha { background: #fff7c2; }       /* amarelo claro */
.tarde { background: #d3f8e2; }       /* verde claro */
.noite { background: #e7d6ff; }       /* roxo claro */
.madrugada { background: #d6e7ff; }   /* azul claro */

.weekend-manha { background: #ffd8a8; }       /* laranja */
.weekend-tarde { background: #ececec; }       /* cinza */
.weekend-madrugada { background: #e4c5ff; }   /* roxo */

.folga { background: #ffdad6; color: #a9382f; font-weight: 700; }
.ferias { background: #ffe8c7; color: #8e4f00; font-weight: 700; }
.atestado { background: #ffe0e9; color: #7d2b47; font-weight: 700; }

/* modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content { background: white; padding: 18px; border-radius: 10px; width: 360px; max-width: calc(100% - 32px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.modal-actions { display: flex; justify-content: space-between; margin-top: 12px; }
.modal-actions button { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; background: #44bd32; color: white; }
.modal-actions .cancel { background: #e84118; }

/* legend */
.legend { margin-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.legend-item { padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; color: #222; }

/* responsive */
@media (max-width: 900px) {
  .dia-col { width: 160px; }
  .escala-table { min-width: 720px; }
}
</style>
