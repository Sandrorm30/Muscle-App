// =============================================
//  FitBuilder — history.js
//  Registro de execuções + gráficos de evolução
// =============================================

// Depende de Chart.js (carregado no index.html)

let historyData = []; // [{date, workoutId, workoutName, exercise, series, reps, load, obs}]

function initHistory() {
  loadHistoryFromStorage();
  injectHistoryUI();
}

// ---- SALVAR EXECUÇÃO ----
function logWorkoutExecution(workout) {
  const now = new Date().toISOString();
  workout.exercises.forEach(item => {
    historyData.push({
      date:        now,
      workoutId:   workout.id,
      workoutName: workout.name,
      exercise:    item.exercise.nome,
      series:      item.series,
      reps:        item.reps,
      load:        parseFloat(item.load) || 0,
      obs:         item.obs || '',
    });
  });
  saveHistoryToStorage();
  renderHistoryList();
}

// ---- STORAGE ----
function saveHistoryToStorage() {
  try { localStorage.setItem('fitbuilder_history', JSON.stringify(historyData)); } catch(e) {}
}

function loadHistoryFromStorage() {
  try {
    const d = JSON.parse(localStorage.getItem('fitbuilder_history'));
    if (Array.isArray(d)) historyData = d;
  } catch(e) { historyData = []; }
}

// ---- UI ----
function injectHistoryUI() {
  // Botão no header para abrir o painel de histórico
  const actionsEl = document.querySelector('.header-actions');
  if (actionsEl) {
    const btn = document.createElement('button');
    btn.className = 'btn-icon';
    btn.id = 'btnHistory';
    btn.title = 'Histórico';
    btn.innerHTML = '<i class="fas fa-chart-line"></i>';
    actionsEl.insertBefore(btn, actionsEl.firstChild);
    btn.addEventListener('click', openHistoryModal);
  }

  // Modal de histórico
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modalHistory';
  modal.innerHTML = `
    <div class="modal modal-lg history-modal">
      <button class="modal-close" id="closeHistory"><i class="fas fa-xmark"></i></button>
      <h3 class="modal-title"><i class="fas fa-chart-line"></i> Histórico & Evolução</h3>

      <div class="history-tabs">
        <button class="htab active" data-tab="log">📋 Registros</button>
        <button class="htab" data-tab="chart">📈 Evolução</button>
      </div>

      <div class="htab-content" id="htabLog">
        <div class="history-filter-row">
          <select id="historyFilterEx" class="history-select">
            <option value="">Todos os exercícios</option>
          </select>
          <select id="historyFilterWorkout" class="history-select">
            <option value="">Todos os treinos</option>
          </select>
          <button class="btn-icon-sm" id="btnClearHistory" title="Limpar histórico">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="history-list" id="historyList">
          <div class="empty-state"><i class="fas fa-clock"></i><p>Nenhuma execução registrada ainda.</p></div>
        </div>
      </div>

      <div class="htab-content hidden" id="htabChart">
        <div class="chart-filter-row">
          <select id="chartFilterEx" class="history-select">
            <option value="">Selecione um exercício</option>
          </select>
          <select id="chartMetric" class="history-select">
            <option value="load">Carga (kg)</option>
            <option value="volume">Volume (séries × reps × kg)</option>
            <option value="reps">Repetições</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas id="evolutionChart"></canvas>
          <div class="chart-empty" id="chartEmpty">
            <i class="fas fa-chart-line"></i>
            <p>Selecione um exercício para ver a evolução.</p>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('closeHistory').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  // Tabs
  modal.querySelectorAll('.htab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.htab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.htab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`htab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.remove('hidden');
      if (tab.dataset.tab === 'chart') renderEvolutionChart();
    });
  });

  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if (!confirm('Limpar todo o histórico de execuções?')) return;
    historyData = [];
    saveHistoryToStorage();
    renderHistoryList();
  });

  document.getElementById('historyFilterEx').addEventListener('change', renderHistoryList);
  document.getElementById('historyFilterWorkout').addEventListener('change', renderHistoryList);
  document.getElementById('chartFilterEx').addEventListener('change', renderEvolutionChart);
  document.getElementById('chartMetric').addEventListener('change', renderEvolutionChart);
}

function openHistoryModal() {
  populateHistoryFilters();
  renderHistoryList();
  document.getElementById('modalHistory').classList.add('open');
}

function populateHistoryFilters() {
  const exercises = [...new Set(historyData.map(h => h.exercise))].sort();
  const workouts  = [...new Set(historyData.map(h => h.workoutName))].sort();

  ['historyFilterEx', 'chartFilterEx'].forEach(id => {
    const sel = document.getElementById(id);
    const cur = sel.value;
    sel.innerHTML = `<option value="">Todos os exercícios</option>`;
    exercises.forEach(ex => sel.insertAdjacentHTML('beforeend', `<option value="${ex}"${ex===cur?' selected':''}>${ex}</option>`));
  });

  const wSel = document.getElementById('historyFilterWorkout');
  const wCur = wSel.value;
  wSel.innerHTML = `<option value="">Todos os treinos</option>`;
  workouts.forEach(w => wSel.insertAdjacentHTML('beforeend', `<option value="${w}"${w===wCur?' selected':''}>${w}</option>`));
}

function renderHistoryList() {
  const filterEx  = document.getElementById('historyFilterEx')?.value  || '';
  const filterWkt = document.getElementById('historyFilterWorkout')?.value || '';
  const list      = document.getElementById('historyList');
  if (!list) return;

  let filtered = [...historyData].reverse();
  if (filterEx)  filtered = filtered.filter(h => h.exercise    === filterEx);
  if (filterWkt) filtered = filtered.filter(h => h.workoutName === filterWkt);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-clock"></i><p>Nenhum registro encontrado.</p></div>`;
    return;
  }

  // Agrupa por data de execução
  const groups = {};
  filtered.forEach(h => {
    const dateLabel = new Date(h.date).toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(h);
  });

  list.innerHTML = Object.entries(groups).map(([date, items]) => `
    <div class="history-group">
      <div class="history-date"><i class="fas fa-calendar-day"></i> ${date}</div>
      ${items.map(h => `
        <div class="history-item">
          <div class="hi-name">${h.exercise}</div>
          <div class="hi-meta">
            <span class="detail-pill"><i class="fas fa-tag"></i>${h.workoutName}</span>
            <span class="detail-pill"><i class="fas fa-layer-group"></i>${h.series}×${h.reps}</span>
            ${h.load ? `<span class="detail-pill"><i class="fas fa-weight-hanging"></i>${h.load}kg</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ---- GRÁFICO ----
let chartInstance = null;

function renderEvolutionChart() {
  const exercise = document.getElementById('chartFilterEx')?.value;
  const metric   = document.getElementById('chartMetric')?.value || 'load';
  const empty    = document.getElementById('chartEmpty');
  const canvas   = document.getElementById('evolutionChart');

  if (!exercise) {
    if (empty)  empty.style.display  = 'flex';
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const data = historyData
    .filter(h => h.exercise === exercise && (metric !== 'load' || h.load > 0))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (data.length === 0) {
    if (empty)  empty.style.display  = 'flex';
    if (canvas) canvas.style.display = 'none';
    return;
  }

  if (empty)  empty.style.display  = 'none';
  if (canvas) canvas.style.display = 'block';

  const labels = data.map(h => new Date(h.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }));
  const values = data.map(h => {
    if (metric === 'load')   return h.load;
    if (metric === 'volume') return h.series * h.reps * (h.load || 1);
    return h.reps;
  });

  const metricLabels = { load:'Carga (kg)', volume:'Volume total', reps:'Repetições' };

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metricLabels[metric],
        data: values,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.15)',
        pointBackgroundColor: '#f97316',
        pointRadius: 5,
        tension: 0.35,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#a0a0c0' } },
        tooltip: { backgroundColor: '#1a1a2e', titleColor: '#f0f0ff', bodyColor: '#a0a0c0' },
      },
      scales: {
        x: { ticks: { color: '#6060a0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#6060a0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

// Expõe para o script.js chamar ao salvar treino
window.logWorkoutExecution = logWorkoutExecution;

document.addEventListener('DOMContentLoaded', initHistory);
