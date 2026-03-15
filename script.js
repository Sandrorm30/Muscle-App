// =============================================
//  FitBuilder — script.js (versão corrigida)
// =============================================

// --- CONFIGURAÇÃO DA API ---
const API_CONFIG = {
  GET_EXERCISES_URL: 'https://script.google.com/macros/s/AKfycbywwz_5dBBEzqcMhjssMKYdkEzByNDkHGWMiTxE3EVYGEMW8Ex17uiHXL01-BwSa4U8/exec?action=getExercises',
  SAVE_WORKOUT_URL:  'https://script.google.com/macros/s/AKfycbywwz_5dBBEzqcMhjssMKYdkEzByNDkHGWMiTxE3EVYGEMW8Ex17uiHXL01-BwSa4U8/exec',
};

// --- DADOS MOCK (fallback) ---
const MOCK_EXERCISES = [
  { id:1,  nome:'Supino Reto',          grupo_muscular:'Peito',       equipamento:'Barra',       nivel:'Intermediário', imagem:'🏋️' },
  { id:2,  nome:'Supino Inclinado',     grupo_muscular:'Peito',       equipamento:'Halteres',    nivel:'Intermediário', imagem:'🏋️' },
  { id:3,  nome:'Crucifixo',            grupo_muscular:'Peito',       equipamento:'Halteres',    nivel:'Iniciante',     imagem:'💪' },
  { id:4,  nome:'Crossover',            grupo_muscular:'Peito',       equipamento:'Cabo',        nivel:'Iniciante',     imagem:'🔗' },
  { id:5,  nome:'Pull-up',              grupo_muscular:'Costas',      equipamento:'Barra Fixa',  nivel:'Avançado',      imagem:'🧗' },
  { id:6,  nome:'Remada Curvada',       grupo_muscular:'Costas',      equipamento:'Barra',       nivel:'Intermediário', imagem:'🏋️' },
  { id:7,  nome:'Puxada Frontal',       grupo_muscular:'Costas',      equipamento:'Cabo',        nivel:'Iniciante',     imagem:'🔗' },
  { id:8,  nome:'Remada Unilateral',    grupo_muscular:'Costas',      equipamento:'Halteres',    nivel:'Iniciante',     imagem:'💪' },
  { id:9,  nome:'Agachamento Livre',    grupo_muscular:'Pernas',      equipamento:'Barra',       nivel:'Intermediário', imagem:'🦵' },
  { id:10, nome:'Leg Press',            grupo_muscular:'Pernas',      equipamento:'Máquina',     nivel:'Iniciante',     imagem:'🦿' },
  { id:11, nome:'Cadeira Extensora',    grupo_muscular:'Pernas',      equipamento:'Máquina',     nivel:'Iniciante',     imagem:'🦵' },
  { id:12, nome:'Stiff',                grupo_muscular:'Pernas',      equipamento:'Barra',       nivel:'Intermediário', imagem:'🏋️' },
  { id:13, nome:'Desenvolvimento',      grupo_muscular:'Ombros',      equipamento:'Halteres',    nivel:'Iniciante',     imagem:'🙌' },
  { id:14, nome:'Elevação Lateral',     grupo_muscular:'Ombros',      equipamento:'Halteres',    nivel:'Iniciante',     imagem:'💪' },
  { id:15, nome:'Arnold Press',         grupo_muscular:'Ombros',      equipamento:'Halteres',    nivel:'Intermediário', imagem:'🙌' },
  { id:16, nome:'Rosca Direta',         grupo_muscular:'Bíceps',      equipamento:'Barra',       nivel:'Iniciante',     imagem:'💪' },
  { id:17, nome:'Rosca Alternada',      grupo_muscular:'Bíceps',      equipamento:'Halteres',    nivel:'Iniciante',     imagem:'💪' },
  { id:18, nome:'Rosca Martelo',        grupo_muscular:'Bíceps',      equipamento:'Halteres',    nivel:'Iniciante',     imagem:'🔨' },
  { id:19, nome:'Tríceps Testa',        grupo_muscular:'Tríceps',     equipamento:'Barra',       nivel:'Intermediário', imagem:'💪' },
  { id:20, nome:'Tríceps Corda',        grupo_muscular:'Tríceps',     equipamento:'Cabo',        nivel:'Iniciante',     imagem:'🔗' },
  { id:21, nome:'Mergulho (Dips)',      grupo_muscular:'Tríceps',     equipamento:'Barra Fixa',  nivel:'Avançado',      imagem:'🧗' },
  { id:22, nome:'Panturrilha em Pé',    grupo_muscular:'Panturrilha', equipamento:'Máquina',     nivel:'Iniciante',     imagem:'🦵' },
  { id:23, nome:'Abdominal Crunch',     grupo_muscular:'Abdômen',     equipamento:'Solo',        nivel:'Iniciante',     imagem:'🔥' },
  { id:24, nome:'Prancha',              grupo_muscular:'Abdômen',     equipamento:'Solo',        nivel:'Iniciante',     imagem:'🔥' },
];

// --- ESTADO GLOBAL ---
let allExercises   = [];
let currentWorkout = [];
let selectedExercise = null;
let activeGroup    = 'todos';

// --- ELEMENTOS DOM ---
const exerciseGrid   = document.getElementById('exerciseGrid');
const workoutList    = document.getElementById('workoutList');
const emptyWorkout   = document.getElementById('emptyWorkout');
const summarySection = document.getElementById('summarySection');
const summaryBox     = document.getElementById('summaryBox');
const workoutBadge   = document.getElementById('workoutBadge');
const totalExercises = document.getElementById('totalExercises');
const filterChips    = document.getElementById('filterChips');
const searchInput    = document.getElementById('searchInput');
const workoutName    = document.getElementById('workoutName');
const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalForm      = document.getElementById('modalForm');
const modalTitle     = document.getElementById('modalTitle');
const modalExInfo    = document.getElementById('modalExerciseInfo');
const reloadBtn      = document.getElementById('reloadBtn');
const saveBtn        = document.getElementById('saveBtn');
const clearBtn       = document.getElementById('clearBtn');
const toast          = document.getElementById('toast');

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  loadWorkoutFromStorage();
  loadExercises();
  bindEvents();
});

// =============================================
// FETCH EXERCÍCIOS
// =============================================
async function loadExercises() {
  showLoading(true);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(API_CONFIG.GET_EXERCISES_URL, {
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    const list  = Array.isArray(data) ? data : (data.exercises || []);

    // Só usa dados da API se vier com conteúdo válido
    if (list.length > 0 && list[0].nome) {
      allExercises = list;
      showToast('Exercícios carregados da planilha! ✅', 'success');
    } else {
      throw new Error('Dados vazios ou inválidos');
    }

  } catch (e) {
    allExercises = MOCK_EXERCISES;
    showToast('Usando dados de demonstração.', 'info');
  }

  buildFilterChips();
  renderExercises();
  showLoading(false);
}

// =============================================
// SALVAR TREINO (POST)
// =============================================
async function saveWorkout() {
  const name = workoutName.value.trim() || 'Treino sem nome';
  if (currentWorkout.length === 0) {
    showToast('Adicione ao menos 1 exercício!', 'error');
    return;
  }

  const now  = new Date().toLocaleString('pt-BR');
  const rows = currentWorkout.map(item => ({
    data:        now,
    nome_treino: name,
    exercicio:   item.exercise.nome,
    series:      item.series,
    repeticoes:  item.reps,
    carga:       item.load || '',
    observacoes: item.obs  || '',
  }));

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

  try {
    const res = await fetch(API_CONFIG.SAVE_WORKOUT_URL, {
      method:  'POST',
      mode:    'no-cors', // necessário para Apps Script sem proxy
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'saveWorkout', rows }),
    });
    // no-cors retorna opaque response — assume sucesso se não lançar erro
    saveToLocalStorage();
    showToast('Treino salvo! 🎉', 'success');
  } catch (e) {
    saveToLocalStorage();
    showToast('Salvo localmente (verifique a planilha).', 'info');
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Salvar Treino';
}

// =============================================
// RENDER EXERCÍCIOS
// =============================================
function renderExercises() {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = allExercises.filter(ex => {
    const matchGroup  = activeGroup === 'todos' || ex.grupo_muscular === activeGroup;
    const matchSearch = !q || ex.nome.toLowerCase().includes(q) || ex.grupo_muscular.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  exerciseGrid.innerHTML = '';

  if (filtered.length === 0) {
    exerciseGrid.innerHTML = `<div class="no-results">
      <i class="fas fa-face-frown-open"></i>
      <p>Nenhum exercício encontrado.</p>
    </div>`;
    return;
  }

  filtered.forEach(ex => {
    const inWorkout = currentWorkout.some(w => w.exercise.id === ex.id);
    const card = document.createElement('div');
    card.className = 'exercise-card' + (inWorkout ? ' already-added' : '');
    card.innerHTML = `
      <span class="card-emoji">${ex.imagem || '💪'}</span>
      <div class="card-name">${ex.nome}</div>
      <div class="card-tags">
        <span class="tag tag-muscle">${ex.grupo_muscular}</span>
        <span class="tag tag-equip">${ex.equipamento}</span>
        <span class="tag tag-level ${levelClass(ex.nivel)}">${ex.nivel}</span>
      </div>
      <button class="card-add-btn ${inWorkout ? 'added' : ''}" data-id="${ex.id}">
        ${inWorkout
          ? '<i class="fas fa-check"></i> Adicionado'
          : '<i class="fas fa-plus"></i> Adicionar'}
      </button>
    `;
    card.querySelector('.card-add-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (!inWorkout) openModal(ex);
    });
    exerciseGrid.appendChild(card);
  });
}

function levelClass(nivel) {
  if (!nivel) return '';
  const n = nivel.toLowerCase();
  if (n.includes('inici')) return 'iniciante';
  if (n.includes('avan'))  return 'avancado';
  return '';
}

// =============================================
// FILTER CHIPS
// =============================================
function buildFilterChips() {
  const groups = ['todos', ...new Set(allExercises.map(e => e.grupo_muscular).filter(Boolean))];
  filterChips.innerHTML = '';
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.className  = 'chip' + (g === activeGroup ? ' active' : '');
    btn.dataset.group = g;
    btn.textContent   = g === 'todos' ? 'Todos' : g;
    btn.addEventListener('click', () => {
      activeGroup = g;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderExercises();
    });
    filterChips.appendChild(btn);
  });
}

// =============================================
// MODAL
// =============================================
function openModal(ex) {
  selectedExercise = ex;
  modalTitle.textContent = ex.nome;
  modalExInfo.innerHTML = `
    <span class="modal-emoji">${ex.imagem || '💪'}</span>
    <div>
      <div class="card-tags">
        <span class="tag tag-muscle">${ex.grupo_muscular}</span>
        <span class="tag tag-equip">${ex.equipamento}</span>
        <span class="tag tag-level ${levelClass(ex.nivel)}">${ex.nivel}</span>
      </div>
    </div>
  `;
  document.getElementById('inputSeries').value = '';
  document.getElementById('inputReps').value   = '';
  document.getElementById('inputLoad').value   = '';
  document.getElementById('inputObs').value    = '';
  modalOverlay.classList.add('open');
  setTimeout(() => document.getElementById('inputSeries').focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  selectedExercise = null;
}

// =============================================
// ADICIONAR AO TREINO
// =============================================
modalForm.addEventListener('submit', e => {
  e.preventDefault();

  // Guarda referência local para evitar null após closeModal
  const ex = selectedExercise;
  if (!ex) return;

  const series = parseInt(document.getElementById('inputSeries').value);
  const reps   = parseInt(document.getElementById('inputReps').value);
  const load   = document.getElementById('inputLoad').value.trim();
  const obs    = document.getElementById('inputObs').value.trim();

  if (!series || series < 1) { showToast('Informe o número de séries!', 'error'); return; }
  if (!reps   || reps   < 1) { showToast('Informe o número de repetições!', 'error'); return; }

  if (currentWorkout.some(w => w.exercise.id === ex.id)) {
    showToast('Exercício já está no treino!', 'error');
    closeModal();
    return;
  }

  currentWorkout.push({ exercise: ex, series, reps, load, obs });
  closeModal();
  renderWorkout();
  renderExercises();
  saveToLocalStorage();
  showToast(`${ex.nome} adicionado! 💪`, 'success');
});

// =============================================
// RENDER TREINO
// =============================================
function renderWorkout() {
  workoutBadge.textContent   = currentWorkout.length;
  totalExercises.textContent = currentWorkout.length;

  if (currentWorkout.length === 0) {
    emptyWorkout.style.display  = 'block';
    workoutList.innerHTML       = '';
    summarySection.style.display = 'none';
    return;
  }

  emptyWorkout.style.display   = 'none';
  summarySection.style.display = 'block';
  workoutList.innerHTML        = '';

  currentWorkout.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'workout-item';
    div.innerHTML = `
      <div class="workout-item-num">${idx + 1}</div>
      <div class="workout-item-info">
        <div class="workout-item-name">${item.exercise.nome}</div>
        <div class="workout-item-details">
          <span class="detail-pill"><i class="fas fa-layer-group"></i>${item.series} séries</span>
          <span class="detail-pill"><i class="fas fa-repeat"></i>${item.reps} reps</span>
          ${item.load ? `<span class="detail-pill"><i class="fas fa-weight-hanging"></i>${item.load} kg</span>` : ''}
        </div>
        ${item.obs ? `<div class="workout-item-obs"><i class="fas fa-note-sticky"></i> ${item.obs}</div>` : ''}
      </div>
      <button class="btn-remove" data-idx="${idx}" title="Remover">
        <i class="fas fa-trash"></i>
      </button>
    `;
    div.querySelector('.btn-remove').addEventListener('click', () => removeExercise(idx));
    workoutList.appendChild(div);
  });

  renderSummary();
}

function removeExercise(idx) {
  const name = currentWorkout[idx].exercise.nome;
  currentWorkout.splice(idx, 1);
  renderWorkout();
  renderExercises();
  saveToLocalStorage();
  showToast(`${name} removido.`, 'info');
}

// =============================================
// RESUMO
// =============================================
function renderSummary() {
  const name = workoutName.value.trim() || 'Sem nome';
  let html = `<div style="margin-bottom:12px;font-size:0.82rem;color:var(--text3)">
    <b style="color:var(--text)">Treino:</b> ${name} &nbsp;|&nbsp;
    <b style="color:var(--text)">${currentWorkout.length}</b> exercícios
  </div>`;
  currentWorkout.forEach((item, i) => {
    html += `<div class="summary-row">
      <span class="summary-num">${i + 1}</span>
      <span class="summary-name">${item.exercise.nome}</span>
      <span class="summary-meta">${item.series}×${item.reps}${item.load ? ' · ' + item.load + 'kg' : ''}${item.obs ? ' · ' + item.obs : ''}</span>
    </div>`;
  });
  summaryBox.innerHTML = html;
}

// =============================================
// LOCALSTORAGE
// =============================================
function saveToLocalStorage() {
  try {
    localStorage.setItem('fitbuilder_workout', JSON.stringify({
      name:  workoutName.value.trim(),
      items: currentWorkout,
    }));
  } catch(e) { /* ignore */ }
}

function loadWorkoutFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('fitbuilder_workout'));
    if (saved && Array.isArray(saved.items) && saved.items.length > 0) {
      workoutName.value = saved.name || '';
      currentWorkout    = saved.items;
    }
  } catch (e) { /* ignore */ }
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  toast.innerHTML  = `<i class="fas ${icons[type] || 'fa-circle-info'}"></i> ${msg}`;
  toast.className  = `toast show ${type}`;
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3200);
}

// =============================================
// LOADING
// =============================================
function showLoading(show) {
  const el = document.getElementById('loadingState');
  if (el) el.style.display = show ? 'flex' : 'none';
}

// =============================================
// BIND EVENTS
// =============================================
function bindEvents() {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  searchInput.addEventListener('input', renderExercises);
  workoutName.addEventListener('input', () => { renderSummary(); saveToLocalStorage(); });
  reloadBtn.addEventListener('click', loadExercises);
  saveBtn.addEventListener('click', saveWorkout);
  clearBtn.addEventListener('click', () => {
    if (!confirm('Limpar todo o treino?')) return;
    currentWorkout = [];
    renderWorkout();
    renderExercises();
    localStorage.removeItem('fitbuilder_workout');
    showToast('Treino limpo.', 'info');
  });
}

// Render inicial do treino salvo
renderWorkout();
