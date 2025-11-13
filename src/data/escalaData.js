// src/data/escalaData.js
// Operadores e turnos padrão + utilitários (gerar dias, gerar escala padrão, cores)

/* ========== OPERADORES (colunas) ========== */
/* Edite esse array caso o chefe troque de gente; IDs fixos ajudam armazenamento */
export const operadores = [
  { id: 1, nome: "Elias", tipo: "manha", horario: "05:30 às 11:30" },
  { id: 2, nome: "Maicon", tipo: "manha", horario: "06:00 às 12:00" },
  { id: 3, nome: "Enzo", tipo: "manha", horario: "06:30 às 12:30" },

  { id: 4, nome: "Saymon", tipo: "tarde", horario: "11:30 às 17:30" },
  { id: 5, nome: "Thiago", tipo: "tarde", horario: "12:00 às 18:00" },
  { id: 6, nome: "Marlon", tipo: "tarde", horario: "12:30 às 18:30" },

  { id: 7, nome: "Operador7", tipo: "noite", horario: "17:30 às 23:30" },
  { id: 8, nome: "Fred", tipo: "noite", horario: "18:00 às 00:00" },
  { id: 9, nome: "Jair", tipo: "noite", horario: "18:30 às 00:30" },

  { id: 10, nome: "Jorge", tipo: "madrugada", horario: "00:00 às 05:00" },
  { id: 11, nome: "Pinotti", tipo: "madrugada", horario: "00:30 às 05:30" },
  { id: 12, nome: "Ricardo", tipo: "madrugada", horario: "01:00 às 06:00" },
];

/* ========== LISTAS DE TURNOS (select modal) ========== */
export const turnoOptionsUteis = [
  "05:30 às 11:30",
  "06:00 às 12:00",
  "06:30 às 12:30",
  "11:30 às 17:30",
  "12:00 às 18:00",
  "12:30 às 18:30",
  "17:30 às 23:30",
  "18:00 às 00:00",
  "18:30 às 00:30",
  "00:00 às 05:00",
  "00:30 às 05:30",
  "01:00 às 06:00"
];

export const turnoOptionsWeekend = [
  "06:00 às 14:00",
  "14:00 às 22:00",
  "22:00 às 06:00"
];

/* ========== CORES ========== */
export const cores = {
  manha: "#fff7c2",
  tarde: "#d3f8e2",
  noite: "#e7d6ff",
  madrugada: "#d6e7ff",
  weekendManha: "#ffd8a8",
  weekendTarde: "#ececec",
  weekendMadrugada: "#e4c5ff",
  folga: "#ffdad6",
  ferias: "#ffe8c7",
  atestado: "#ffe0e9"
};

/* ========== UTIL: gerar lista de dias entre duas datas (inclusive) ==========
   Retorna array de objetos: { data: 'YYYY-MM-DD', label: 'dd/mm — Nome', isWeekend: boolean }
========================================================================= */
export function gerarDiasPeriodo(inicio, fim) {
  const dias = [];
  const atual = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const limite = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());

  while (atual <= limite) {
    const ano = atual.getFullYear();
    const mes = String(atual.getMonth() + 1).padStart(2, "0");
    const dia = String(atual.getDate()).padStart(2, "0");
    const iso = `${ano}-${mes}-${dia}`;

    const weekdayIndex = atual.getDay(); // 0 = dom, 6 = sab
    const weekdayNames = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
    const label = `${dia}/${mes} — ${weekdayNames[weekdayIndex]}`;

    dias.push({
      data: iso,
      label,
      isWeekend: weekdayIndex === 0 || weekdayIndex === 6
    });

    atual.setDate(atual.getDate() + 1);
  }
  return dias;
}

/* ========== GERAR TURNOS PADRÃO PARA UM RANGE ==========
   Recebe: dias (array retornado por gerarDiasPeriodo) e operadores (array)
   Retorna: matriz [rows][cols] com strings de turno.
   Regra:
     - Em dias úteis usa horário padrão definido em operadores[].horario
     - Em finais de semana converte o tipo do operador:
         manha -> 06:00 às 14:00
         tarde -> 14:00 às 22:00
         madrugada/noite -> 22:00 às 06:00
     - Pode ser facilmente alterado para lógica mais complexa depois
========================================================================= */
export function gerarTurnosPadraoParaRange(dias, operadoresList) {
  const matrix = dias.map(d => {
    return operadoresList.map(op => {
      if (d.isWeekend) {
        // weekend mapping
        if (op.tipo === 'manha') return "06:00 às 14:00";
        if (op.tipo === 'tarde') return "14:00 às 22:00";
        // para noite/madrugada agrupamos como madrugada final de semana
        return "22:00 às 06:00";
      } else {
        // weekday: use operador default horario (se existir) ou vazio
        return op.horario || "";
      }
    });
  });
  return matrix;
}

/* ========== GET COR POR TURNO (considera final de semana) ========== */
export function getColorForTurno(turnoStr, isWeekend=false) {
  if (!turnoStr) return "#ffffff";
  const t = turnoStr.toLowerCase();
  if (t.includes("folga")) return cores.folga;
  if (t.includes("féri") || t.includes("ferias") || t.includes("férias")) return cores.ferias;
  if (t.includes("atestado")) return cores.atestado;

  if (isWeekend) {
    if (t.includes("06:00") && t.includes("14:00")) return cores.weekendManha;
    if (t.includes("14:00") && t.includes("22:00")) return cores.weekendTarde;
    if (t.includes("22:00") && (t.includes("06:00") || t.includes("06"))) return cores.weekendMadrugada;
    // fallback simple
    if (t.includes("manhã")||t.includes("manha")) return cores.weekendManha;
    if (t.includes("tarde")) return cores.weekendTarde;
    if (t.includes("madrugada")||t.includes("22:")) return cores.weekendMadrugada;
  }

  if (t.includes("05:30") || t.includes("06:00") || t.includes("06:30")) return cores.manha;
  if (t.includes("11:30") || t.includes("12:00") || t.includes("12:30")) return cores.tarde;
  if (t.includes("17:30") || t.includes("18:00") || t.includes("18:30")) return cores.noite;
  if (t.includes("00:00") || t.includes("00:30") || t.includes("01:00") || t.includes("madrugada")) return cores.madrugada;

  return "#ffffff";
}
