// =============================================
//  FitBuilder v2 — script.js
//  Integração total com Google Sheets
// =============================================

// -----------------------------------------------
// CONFIGURAÇÃO — substitua pela sua URL real
// -----------------------------------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby5wxMIvwrxd72HVgCPz6LuFPQUmxULpyy5rHgUX1aEEehZt4gPwKg_HRChhSUl6iMC/exec';
// -----------------------------------------------

// --- DADOS MOCK ---
const MOCK_EXERCISES = [
  {id:1, nome:'Supino Reto',         grupo_muscular:'Peito',       equipamento:'Barra',      nivel:'Intermediário', imagem:'🏋️'},
  {id:2, nome:'Supino Inclinado',    grupo_muscular:'Peito',       equipamento:'Halteres',   nivel:'Intermediário', imagem:'🏋️'},
  {id:3, nome:'Crucifixo',           grupo_muscular:'Peito',       equipamento:'Halteres',   nivel:'Iniciante',     imagem:'💪'},
  {id:4, nome:'Crossover',           grupo_muscular:'Peito',       equipamento:'Cabo',       nivel:'Iniciante',     imagem:'🔗'},
  {id:5, nome:'Pull-up',             grupo_muscular:'Costas',      equipamento:'Barra Fixa', nivel:'Avançado',      imagem:'🧗'},
  {id:6, nome:'Remada Curvada',      grupo_muscular:'Costas',      equipamento:'Barra',      nivel:'Intermediário', imagem:'🏋️'},
  {id:7, nome:'Puxada Frontal',      grupo_muscular:'Costas',      equipamento:'Cabo',       nivel:'Iniciante',     imagem:'🔗'},
  {id:8, nome:'Remada Unilateral',   grupo_muscular:'Costas',      equipamento:'Halteres',   nivel:'Iniciante',     imagem:'💪'},
  {id:9, nome:'Agachamento Livre',   grupo_muscular:'Pernas',      equipamento:'Barra',      nivel:'Intermediário', imagem:'🦵'},
  {id:10,nome:'Leg Press',           grupo_muscular:'Pernas',      equipamento:'Máquina',    nivel:'Iniciante',     imagem:'🦿'},
  {id:11,nome:'Cadeira Extensora',   grupo_muscular:'Pernas',      equipamento:'Máquina',    nivel:'Iniciante',     imagem:'🦵'},
  {id:12,nome:'Stiff',               grupo_muscular:'Pernas',      equipamento:'Barra',      nivel:'Intermediário', imagem:'🏋️'},
  {id:13,nome:'Desenvolvimento',     grupo_muscular:'Ombros',      equipamento:'Halteres',   nivel:'Iniciante',     imagem:'🙌'},
  {id:14,nome:'Elevação Lateral',    grupo_muscular:'Ombros',      equipamento:'Halteres',   nivel:'Iniciante',     imagem:'💪'},
  {id:15,nome:'Arnold Press',        grupo_muscular:'Ombros',      equipamento:'Halteres',   nivel:'Intermediário', imagem:'🙌'},
  {id:16,nome:'Rosca Direta',        grupo_muscular:'Bíceps',      equipamento:'Barra',      nivel:'Iniciante',     imagem:'💪'},
  {id:17,nome:'Rosca Alternada',     grupo_muscular:'Bíceps',      equipamento:'Halteres',   nivel:'Iniciante',     imagem:'💪'},
  {id:18,nome:'Rosca Martelo',       grupo_muscular:'Bíceps',      equipamento:'Halteres',   nivel:'Iniciante',     imagem:'🔨'},
  {id:19,nome:'Tríceps Testa',       grupo_muscular:'Tríceps',     equipamento:'Barra',      nivel:'Intermediário', imagem:'💪'},
  {id:20,nome:'Tríceps Corda',       grupo_muscular:'Tríceps',     equipamento:'Cabo',       nivel:'Iniciante',     imagem:'🔗'},
  {id:21,nome:'Mergulho (Dips)',     grupo_muscular:'Tríceps',     equipamento:'Barra Fixa', nivel:'Avançado',      imagem:'🧗'},
  {id:22,nome:'Panturrilha em Pé',   grupo_muscular:'Panturrilha', equipamento:'Máquina',    nivel:'Iniciante',     imagem:'🦵'},
  {id:23,nome:'Abdominal Crunch',    grupo_muscular:'Abdômen',     equipamento:'Solo',       nivel:'Iniciante',     imagem:'🔥'},
  {id:24,nome:'Prancha',             grupo_muscular:'Abdômen',     equipamento:'Solo',       nivel:'Iniciante',     imagem:'🔥'},
  {id:25,nome:'Terra (Deadlift)',    grupo_muscular:'Costas',      equipamento:'Barra',      nivel:'Avançado',      imagem:'🏋️'},
  {id:26,nome:'Hack Squat',          grupo_muscular:'Pernas',      equipamento:'Máquina',    nivel:'Intermediário', imagem:'🦵'},
  {id:27,nome:'Elevação de Quadril', grupo_muscular:'Pernas',      equipamento:'Barra',      nivel:'Iniciante',     imagem:'🍑'},
  {id:28,nome:'Face Pull',           grupo_muscular:'Ombros',      equipamento:'Cabo',       nivel:'Iniciante',     imagem:'🔗'},
  {id:29,nome:'Tríceps Francês',     grupo_muscular:'Tríceps',     equipamento:'Halteres',   nivel:'Iniciante',     imagem:'💪'},
  {id:30,nome:'Supino Fechado',      grupo_muscular:'Tríceps',     equipamento:'Barra',      nivel:'Intermediário', imagem:'🏋️'},
];

// --- ESTADO GLOBAL ---
let workouts          = [];   // [{id, name, exercises, updatedAt, synced}]
let allExercises      = [];
let currentWorkoutId  = null;
let pickerActiveGroup = 'todos';
let editingItemIndex  = -1;
let pendingExercise   = null;
let pickerChipsBuilt  = false;
let isSyncing         = false;

// --- DOM ---
const viewWorkouts       = document.getElementById('viewWorkouts');
const viewEditor         = document.getElementById('viewEditor');
const workoutsGrid       = document.getElementById('workoutsGrid');
const emptyWorkouts      = document.getElementById('emptyWorkouts');
const badgeTotalWorkouts = document.getElementById('badgeTotalWorkouts');
const editorTitle        = document.getElementById('editorTitle');
const editorList         = document.getElementById('editorList');
const emptyEditor        = document.getElementById('emptyEditor');
const summarySection     = document.getElementById('summarySection');
const summaryBox         = document.getElementById('summaryBox');
const badgeEditorCount   = document.getElementById('badgeEditorCount');
const toast              = document.getElementById('toast');
const modalNewWorkout    = document.getElementById('modalNewWorkout');
const modalRename        = document.getElementById('modalRename');
const modalPicker        = document.getElementById('modalPicker');
const modalExConfig      = document.getElementById('modalExConfig');
const pickerGrid         = document.getElementById('pickerGrid');
const pickerChips        = document.getElementById('pickerChips');
const pickerSearch       = document.getElementById('pickerSearch');
const exConfigTitle      = document.getElementById('exConfigTitle');
const exConfigInfo       = document.getElementById('exConfigInfo');
const btnExConfigSubmit  = document.getElementById('btnExConfigSubmit');

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
  loadFromStorage();
  renderWorkoutsList();
  showView('workouts');
  bindEvents();
  // Carrega exercícios e treinos da API em paralelo
  await Promise.all([loadExercises(), syncWorkoutsFromSheet()]);
});

// =============================================
// API — EXERCÍCIOS
// =============================================
async function loadExercises() {
  allExercises = [...MOCK_EXERCISES];
  try {
    const res = await apiFetch(`${API_URL}?action=getExercises`);
    if (Array.isArray(res) && res.length > 0 && res[0].nome) {
      allExercises = res;
    }
  } catch(e) { /* usa mock */ }
}

// =============================================
// API — SINCRONIZAR TREINOS DA PLANILHA
// =============================================
async function syncWorkoutsFromSheet() {
  if (isSyncing) return;
  isSyncing = true;
  showSyncStatus('syncing');
  try {
    const remote = await apiFetch(`${API_URL}?action=getWorkouts`);
    if (!Array.isArray(remote)) throw new Error('resposta inválida');

    if (remote.length === 0) {
      showSyncStatus('ok');
      isSyncing = false;
      return;
    }

    // Merge: remote sobrescreve local (planilha é fonte da verdade)
    // Mantém treinos locais que não existem na planilha (não foram salvos ainda)
    const remoteIds = new Set(remote.map(w => w.id));
    const localOnly = workouts.filter(w => !remoteIds.has(w.id));
    workouts = [...remote.map(w => ({...w, synced: true})), ...localOnly];
    saveToStorage();
    renderWorkoutsList();

    // Se estiver no editor, atualiza a lista também
    if (currentWorkoutId) renderEditorList();

    showSyncStatus('ok');
    showToast('Treinos sincronizados! ☁️', 'success');
  } catch(e) {
    showSyncStatus('error');
    // mantém dados locais silenciosamente
  }
  isSyncing = false;
}

// =============================================
// API — SALVAR TREINO NA PLANILHA
// =============================================
async function saveWorkoutToSheet(workoutId) {
  const w = getWorkout(workoutId || currentWorkoutId);
  if (!w || w.exercises.length === 0) {
    showToast('Adicione exercícios antes de salvar!', 'error');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

  const now  = new Date().toLocaleString('pt-BR');
  const rows = w.exercises.map(item => ({
    data:        now,
    nome_treino: w.name,
    exercicio:   item.exercise.nome,
    series:      item.series,
    repeticoes:  item.reps,
    carga:       item.load || '',
    observacoes: item.obs  || '',
  }));

  try {
    await fetch(API_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'saveWorkout', workout_id: w.id, rows }),
    });
    w.synced    = true;
    w.updatedAt = now;
    saveToStorage();
    renderWorkoutsList();
    if (currentWorkoutId === w.id) renderEditorList();
    showToast('Treino salvo na planilha! 🎉', 'success');
    // Registra no histórico de execuções
    if (typeof window.logWorkoutExecution === 'function') window.logWorkoutExecution(w);
  } catch(e) {
    showToast('Erro ao salvar. Dados mantidos localmente.', 'error');
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Salvar na Planilha';
}

// =============================================
// API — DELETAR TREINO DA PLANILHA
// =============================================
async function deleteWorkoutFromSheet(workoutId) {
  try {
    await fetch(API_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'deleteWorkout', workout_id: workoutId }),
    });
  } catch(e) { /* silencioso */ }
}

// =============================================
// FETCH HELPER
// =============================================
async function apiFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// =============================================
// SYNC STATUS no header
// =============================================
function showSyncStatus(status) {
  const badge = document.getElementById('syncBadge');
  if (!badge) return;
  const states = {
    syncing: { icon:'fa-rotate fa-spin', text:'Sincronizando...', color:'#a78bfa' },
    ok:      { icon:'fa-cloud-arrow-up', text:'Sincronizado',     color:'#10b981' },
    error:   { icon:'fa-cloud-slash',    text:'Offline',          color:'#f97316' },
  };
  const s = states[status] || states.error;
  badge.innerHTML  = `<i class="fas ${s.icon}"></i> ${s.text}`;
  badge.style.color       = s.color;
  badge.style.borderColor = s.color + '55';
}

// =============================================
// VIEWS
// =============================================
function showView(name) {
  viewWorkouts.classList.toggle('hidden', name !== 'workouts');
  viewEditor.classList.toggle('hidden', name !== 'editor');
}

// =============================================
// TREINOS — CRUD LOCAL
// =============================================
function createWorkout(name) {
  const w = {
    id:        'wb_' + Date.now(),
    name:      name.trim(),
    exercises: [],
    updatedAt: new Date().toLocaleString('pt-BR'),
    synced:    false,
  };
  workouts.push(w);
  saveToStorage();
  renderWorkoutsList();
  showToast(`Treino "${w.name}" criado!`, 'success');
  return w;
}

function deleteWorkout(id) {
  const w = getWorkout(id);
  workouts = workouts.filter(w => w.id !== id);
  saveToStorage();
  renderWorkoutsList();
  if (w && w.synced) deleteWorkoutFromSheet(id);
  showToast('Treino removido.', 'info');
}

function renameWorkout(id, newName) {
  const w = getWorkout(id);
  if (!w) return;
  w.name      = newName.trim();
  w.updatedAt = new Date().toLocaleString('pt-BR');
  w.synced    = false;
  saveToStorage();
  renderWorkoutsList();
  editorTitle.textContent = w.name;
  showToast('Treino renomeado!', 'success');
}

function getWorkout(id) {
  return workouts.find(w => w.id === id) || null;
}

function openEditor(id) {
  currentWorkoutId = id;
  const w = getWorkout(id);
  if (!w) return;
  editorTitle.textContent = w.name;
  renderEditorList();
  showView('editor');
  window.scrollTo(0, 0);
  // Notifica outros módulos que o editor foi aberto
  document.dispatchEvent(new CustomEvent('fitbuilder:editorOpened'));
}

// =============================================
// RENDER — LISTA DE TREINOS
// =============================================
function renderWorkoutsList() {
  badgeTotalWorkouts.textContent = workouts.length;
  workoutsGrid.innerHTML = '';

  if (workouts.length === 0) {
    workoutsGrid.appendChild(emptyWorkouts);
    emptyWorkouts.style.display = 'block';
    return;
  }
  emptyWorkouts.style.display = 'none';

  workouts.forEach(w => {
    const syncIcon = w.synced
      ? '<i class="fas fa-cloud-arrow-up" style="color:#10b981" title="Salvo na planilha"></i>'
      : '<i class="fas fa-circle-dot"     style="color:#f97316" title="Não sincronizado"></i>';

    const card = document.createElement('div');
    card.className = 'workout-card';
    card.innerHTML = `
      <div class="wc-header">
        <div class="wc-name">${w.name}</div>
        <span class="wc-sync">${syncIcon}</span>
      </div>
      <div class="wc-meta">
        <span><i class="fas fa-list-check"></i> ${w.exercises.length} exercício${w.exercises.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="wc-actions">
        <button class="wc-btn wc-btn-edit"  data-id="${w.id}"><i class="fas fa-pen-to-square"></i> Editar</button>
        <button class="wc-btn wc-btn-cloud" data-id="${w.id}" title="Salvar na planilha"><i class="fas fa-floppy-disk"></i></button>
        <button class="wc-btn wc-btn-del"   data-id="${w.id}" title="Excluir"><i class="fas fa-trash"></i></button>
      </div>
      <div class="wc-updated">Atualizado: ${w.updatedAt}</div>
    `;
    card.querySelector('.wc-btn-edit').addEventListener('click', e => { e.stopPropagation(); openEditor(w.id); });
    card.querySelector('.wc-btn-cloud').addEventListener('click', e => { e.stopPropagation(); saveWorkoutToSheet(w.id); });
    card.querySelector('.wc-btn-del').addEventListener('click', e => {
      e.stopPropagation();
      if (confirm(`Excluir o treino "${w.name}"?`)) deleteWorkout(w.id);
    });
    workoutsGrid.appendChild(card);
  });
}

// =============================================
// RENDER — EDITOR
// =============================================
function renderEditorList() {
  const w = getWorkout(currentWorkoutId);
  if (!w) return;
  badgeEditorCount.textContent = w.exercises.length;
  editorList.innerHTML = '';

  if (w.exercises.length === 0) {
    emptyEditor.style.display    = 'block';
    summarySection.style.display = 'none';
    return;
  }
  emptyEditor.style.display    = 'none';
  summarySection.style.display = 'block';

  w.exercises.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'workout-item';
    div.innerHTML = `
      <div class="wi-num">${idx + 1}</div>
      <div class="wi-info">
        <div class="wi-name">${item.exercise.nome}</div>
        <div class="wi-details">
          <span class="detail-pill"><i class="fas fa-layer-group"></i>${item.series} séries</span>
          <span class="detail-pill"><i class="fas fa-repeat"></i>${item.reps} reps</span>
          ${item.load ? `<span class="detail-pill"><i class="fas fa-weight-hanging"></i>${item.load} kg</span>` : ''}
        </div>
        ${item.obs ? `<div class="wi-obs"><i class="fas fa-note-sticky"></i> ${item.obs}</div>` : ''}
      </div>
      <button class="btn-edit-item"   data-idx="${idx}" title="Editar"><i class="fas fa-pen"></i></button>
      <button class="btn-remove-item" data-idx="${idx}" title="Remover"><i class="fas fa-trash"></i></button>
    `;
    div.querySelector('.btn-edit-item').addEventListener('click',   () => openEditItem(idx));
    div.querySelector('.btn-remove-item').addEventListener('click', () => removeItem(idx));
    editorList.appendChild(div);
  });
  renderSummary(w);
}

function removeItem(idx) {
  const w = getWorkout(currentWorkoutId);
  if (!w) return;
  const name = w.exercises[idx].exercise.nome;
  w.exercises.splice(idx, 1);
  w.updatedAt = new Date().toLocaleString('pt-BR');
  w.synced    = false;
  saveToStorage();
  renderEditorList();
  renderWorkoutsList();
  showToast(`${name} removido.`, 'info');
}

// =============================================
// RESUMO
// =============================================
function renderSummary(w) {
  let html = `<div style="margin-bottom:10px;font-size:.8rem;color:var(--text3)">
    <b style="color:var(--text)">${w.name}</b> &nbsp;·&nbsp;
    <b style="color:var(--text)">${w.exercises.length}</b> exercícios
  </div>`;
  w.exercises.forEach((item, i) => {
    html += `<div class="summary-row">
      <span class="summary-num">${i+1}</span>
      <span class="summary-name">${item.exercise.nome}</span>
      <span class="summary-meta">${item.series}×${item.reps}${item.load ? ' · '+item.load+'kg' : ''}${item.obs ? ' · '+item.obs : ''}</span>
    </div>`;
  });
  summaryBox.innerHTML = html;
}

// =============================================
// PICKER DE EXERCÍCIOS
// =============================================
function openPicker() {
  pickerChipsBuilt = false;
  buildPickerChips();
  pickerChipsBuilt = true;
  pickerSearch.value = '';
  renderPickerGrid();
  modalPicker.classList.add('open');
  setTimeout(() => pickerSearch.focus(), 120);
}

function buildPickerChips() {
  const groups = ['todos', ...new Set(allExercises.map(e => e.grupo_muscular).filter(Boolean))];
  pickerChips.innerHTML = '';
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (g === pickerActiveGroup ? ' active' : '');
    btn.textContent = g === 'todos' ? 'Todos' : g;
    btn.addEventListener('click', () => {
      pickerActiveGroup = g;
      pickerChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderPickerGrid();
    });
    pickerChips.appendChild(btn);
  });
}

function renderPickerGrid() {
  const q = pickerSearch.value.toLowerCase().trim();
  const filtered = allExercises.filter(ex => {
    const mg = pickerActiveGroup === 'todos' || ex.grupo_muscular === pickerActiveGroup;
    const ms = !q || ex.nome.toLowerCase().includes(q) || ex.grupo_muscular.toLowerCase().includes(q);
    return mg && ms;
  });

  pickerGrid.innerHTML = '';

  if (filtered.length === 0) {
    pickerGrid.innerHTML = `<div class="no-results"><i class="fas fa-face-frown-open"></i><p>Nenhum exercício encontrado.</p></div>`;
    return;
  }

  filtered.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
      <span class="card-emoji">${ex.imagem || '💪'}</span>
      <div class="card-name">${ex.nome}</div>
      <div class="card-tags">
        <span class="tag tag-muscle">${ex.grupo_muscular}</span>
        <span class="tag tag-equip">${ex.equipamento}</span>
        <span class="tag tag-level ${levelClass(ex.nivel)}">${ex.nivel}</span>
      </div>
      <button class="card-add-btn"><i class="fas fa-plus"></i> Selecionar</button>
    `;
    card.querySelector('.card-add-btn').addEventListener('click', () => {
      modalPicker.classList.remove('open');
      openExConfig(ex, -1);
    });
    pickerGrid.appendChild(card);
  });
}

function levelClass(n) {
  if (!n) return '';
  const l = n.toLowerCase();
  if (l.includes('inici')) return 'iniciante';
  if (l.includes('avan'))  return 'avancado';
  return '';
}

// =============================================
// CONFIG EXERCÍCIO
// =============================================
function openExConfig(ex, idx) {
  pendingExercise  = ex;
  editingItemIndex = idx;

  exConfigTitle.textContent = idx === -1 ? ex.nome : `Editar: ${ex.nome}`;
  exConfigInfo.innerHTML = `
    <span class="modal-emoji">${ex.imagem || '💪'}</span>
    <div><div class="card-tags">
      <span class="tag tag-muscle">${ex.grupo_muscular || ''}</span>
      <span class="tag tag-equip">${ex.equipamento || ''}</span>
      <span class="tag tag-level ${levelClass(ex.nivel)}">${ex.nivel || ''}</span>
    </div></div>
  `;

  const w = getWorkout(currentWorkoutId);
  if (idx >= 0 && w) {
    const item = w.exercises[idx];
    document.getElementById('inputSeries').value = item.series;
    document.getElementById('inputReps').value   = item.reps;
    document.getElementById('inputLoad').value   = item.load || '';
    document.getElementById('inputObs').value    = item.obs  || '';
    btnExConfigSubmit.innerHTML = '<i class="fas fa-check"></i> Salvar Alterações';
  } else {
    document.getElementById('inputSeries').value = '';
    document.getElementById('inputReps').value   = '';
    document.getElementById('inputLoad').value   = '';
    document.getElementById('inputObs').value    = '';
    btnExConfigSubmit.innerHTML = '<i class="fas fa-plus"></i> Adicionar ao Treino';
  }

  modalExConfig.classList.add('open');
  setTimeout(() => document.getElementById('inputSeries').focus(), 120);
}

function openEditItem(idx) {
  const w = getWorkout(currentWorkoutId);
  if (!w) return;
  openExConfig(w.exercises[idx].exercise, idx);
}

// =============================================
// SUBMIT CONFIG EXERCÍCIO
// =============================================
document.getElementById('formExConfig').addEventListener('submit', e => {
  e.preventDefault();
  const ex = pendingExercise;
  if (!ex) return;

  const series = parseInt(document.getElementById('inputSeries').value);
  const reps   = parseInt(document.getElementById('inputReps').value);
  const load   = document.getElementById('inputLoad').value.trim();
  const obs    = document.getElementById('inputObs').value.trim();

  if (!series || series < 1) { showToast('Informe as séries!', 'error'); return; }
  if (!reps   || reps   < 1) { showToast('Informe as repetições!', 'error'); return; }

  const w = getWorkout(currentWorkoutId);
  if (!w) return;

  if (editingItemIndex >= 0) {
    w.exercises[editingItemIndex] = { exercise: ex, series, reps, load, obs };
    showToast(`${ex.nome} atualizado! ✅`, 'success');
  } else {
    if (w.exercises.some(i => i.exercise.id === ex.id)) {
      showToast('Exercício já está neste treino!', 'error');
      modalExConfig.classList.remove('open');
      return;
    }
    w.exercises.push({ exercise: ex, series, reps, load, obs });
    showToast(`${ex.nome} adicionado! 💪`, 'success');
  }

  w.updatedAt     = new Date().toLocaleString('pt-BR');
  w.synced        = false;
  pendingExercise  = null;
  editingItemIndex = -1;
  modalExConfig.classList.remove('open');
  saveToStorage();
  renderEditorList();
  renderWorkoutsList();
});

// =============================================
// LOCALSTORAGE
// =============================================
function saveToStorage() {
  try { localStorage.setItem('fitbuilder_v2', JSON.stringify(workouts)); } catch(e) {}
}

function loadFromStorage() {
  try {
    const d = JSON.parse(localStorage.getItem('fitbuilder_v2'));
    if (Array.isArray(d)) workouts = d;
  } catch(e) { workouts = []; }
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info' };
  toast.innerHTML = `<i class="fas ${icons[type] || 'fa-circle-info'}"></i> ${msg}`;
  toast.className = `toast show ${type}`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}

// =============================================
// BIND EVENTS
// =============================================
function bindEvents() {
  // Sincronizar manualmente
  const syncBtn = document.getElementById('btnSync');
  if (syncBtn) syncBtn.addEventListener('click', () => syncWorkoutsFromSheet());

  // Novo treino
  document.getElementById('btnNewWorkout').addEventListener('click', () => {
    document.getElementById('inputNewWorkoutName').value = '';
    modalNewWorkout.classList.add('open');
    setTimeout(() => document.getElementById('inputNewWorkoutName').focus(), 100);
  });
  document.getElementById('closeNewWorkout').addEventListener('click', () => modalNewWorkout.classList.remove('open'));
  document.getElementById('formNewWorkout').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('inputNewWorkoutName').value.trim();
    if (!name) return;
    const existing = workouts.find(w => w.name.toLowerCase() === name.toLowerCase());
    modalNewWorkout.classList.remove('open');
    if (existing) { openEditor(existing.id); }
    else { const w = createWorkout(name); openEditor(w.id); }
  });

  // Hints nome
  document.querySelectorAll('.hint-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('inputNewWorkoutName').value = btn.dataset.val;
    });
  });

  // Atalhos A B C D
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const existing = workouts.find(w => w.name === name);
      if (existing) { openEditor(existing.id); }
      else { const w = createWorkout(name); openEditor(w.id); }
    });
  });

  // Voltar
  document.getElementById('btnBack').addEventListener('click', () => {
    currentWorkoutId = null;
    renderWorkoutsList();
    showView('workouts');
    window.scrollTo(0, 0);
  });

  // Renomear
  document.getElementById('btnRenameWorkout').addEventListener('click', () => {
    const w = getWorkout(currentWorkoutId);
    if (!w) return;
    document.getElementById('inputRenameName').value = w.name;
    modalRename.classList.add('open');
    setTimeout(() => document.getElementById('inputRenameName').focus(), 100);
  });
  document.getElementById('closeRename').addEventListener('click', () => modalRename.classList.remove('open'));
  document.getElementById('formRename').addEventListener('submit', e => {
    e.preventDefault();
    const n = document.getElementById('inputRenameName').value.trim();
    if (!n) return;
    renameWorkout(currentWorkoutId, n);
    modalRename.classList.remove('open');
  });

  // Excluir treino no editor
  document.getElementById('btnDeleteWorkout').addEventListener('click', () => {
    const w = getWorkout(currentWorkoutId);
    if (!w || !confirm(`Excluir o treino "${w.name}"?`)) return;
    deleteWorkout(currentWorkoutId);
    currentWorkoutId = null;
    showView('workouts');
    window.scrollTo(0, 0);
  });

  // Adicionar exercício
  document.getElementById('btnOpenPicker').addEventListener('click', openPicker);
  pickerSearch.addEventListener('input', renderPickerGrid);
  document.getElementById('closePicker').addEventListener('click', () => modalPicker.classList.remove('open'));

  // Fechar config exercício
  document.getElementById('closeExConfig').addEventListener('click', () => {
    modalExConfig.classList.remove('open');
    pendingExercise  = null;
    editingItemIndex = -1;
  });

  // Salvar + limpar no editor
  document.getElementById('saveBtn').addEventListener('click', () => saveWorkoutToSheet());
  document.getElementById('clearBtn').addEventListener('click', () => {
    const w = getWorkout(currentWorkoutId);
    if (!w || !confirm(`Limpar todos os exercícios de "${w.name}"?`)) return;
    w.exercises = [];
    w.synced    = false;
    w.updatedAt = new Date().toLocaleString('pt-BR');
    saveToStorage();
    renderEditorList();
    renderWorkoutsList();
    showToast('Treino limpo.', 'info');
  });

  // Fechar modais ao clicar fora ou ESC
  [modalNewWorkout, modalRename, modalPicker, modalExConfig].forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      [modalNewWorkout, modalRename, modalPicker, modalExConfig].forEach(m => m.classList.remove('open'));
  });
}

// =============================================
// FUNÇÕES PÚBLICAS (usadas por módulos externos)
// =============================================
window.getWorkoutPublic = () => getWorkout(currentWorkoutId);
window.showToast = showToast;
