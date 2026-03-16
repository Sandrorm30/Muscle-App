// =============================================
//  FitBuilder — timer.js
//  Timer de descanso entre séries
// =============================================

const TIMER_DEFAULTS = [30, 60, 90, 120];
let timerInterval  = null;
let timerRemaining = 0;
let timerTotal     = 0;
let timerRunning   = false;

function initTimer() {
  const html = `
  <div class="timer-fab" id="timerFab" title="Timer de descanso">
    <i class="fas fa-stopwatch"></i>
    <span class="timer-fab-label" id="timerFabLabel">Descanso</span>
  </div>
  <div class="timer-panel" id="timerPanel">
    <div class="timer-panel-header">
      <span><i class="fas fa-stopwatch"></i> Timer de Descanso</span>
      <button class="timer-close" id="timerClose"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="timer-circle-wrap">
      <svg class="timer-svg" viewBox="0 0 120 120">
        <circle class="timer-track" cx="60" cy="60" r="52"/>
        <circle class="timer-progress" id="timerProgress" cx="60" cy="60" r="52"
          stroke-dasharray="326.7" stroke-dashoffset="0"/>
      </svg>
      <div class="timer-display" id="timerDisplay">00:00</div>
    </div>
    <div class="timer-presets">
      ${TIMER_DEFAULTS.map(s => `<button class="timer-preset" data-sec="${s}">${s}s</button>`).join('')}
    </div>
    <div class="timer-controls">
      <button class="timer-btn timer-btn-start" id="timerStart"><i class="fas fa-play"></i> Iniciar</button>
      <button class="timer-btn timer-btn-reset" id="timerReset"><i class="fas fa-rotate-left"></i></button>
    </div>
    <div class="timer-custom-row">
      <input type="number" id="timerCustomInput" placeholder="Seg. personalizado" min="5" max="600" />
      <button class="timer-btn timer-btn-set" id="timerCustomSet">Definir</button>
    </div>
  </div>`;

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  document.getElementById('timerFab').addEventListener('click', toggleTimerPanel);
  document.getElementById('timerClose').addEventListener('click', () => {
    document.getElementById('timerPanel').classList.remove('open');
  });
  document.getElementById('timerStart').addEventListener('click', toggleTimer);
  document.getElementById('timerReset').addEventListener('click', resetTimer);
  document.getElementById('timerCustomSet').addEventListener('click', () => {
    const v = parseInt(document.getElementById('timerCustomInput').value);
    if (v >= 5 && v <= 600) setTimer(v);
  });
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => setTimer(parseInt(btn.dataset.sec)));
  });

  setTimer(60); // padrão 60s
}

function toggleTimerPanel() {
  document.getElementById('timerPanel').classList.toggle('open');
}

function setTimer(seconds) {
  resetTimer();
  timerTotal     = seconds;
  timerRemaining = seconds;
  updateDisplay();
  updateProgress();
  document.querySelectorAll('.timer-preset').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.sec) === seconds);
  });
}

function toggleTimer() {
  if (timerRunning) pauseTimer();
  else startTimer();
}

function startTimer() {
  if (timerRemaining <= 0) setTimer(timerTotal || 60);
  timerRunning = true;
  document.getElementById('timerStart').innerHTML = '<i class="fas fa-pause"></i> Pausar';
  timerInterval = setInterval(() => {
    timerRemaining--;
    updateDisplay();
    updateProgress();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Iniciar';
      playBeep();
      showTimerDone();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Continuar';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning   = false;
  timerRemaining = timerTotal;
  updateDisplay();
  updateProgress();
  const btn = document.getElementById('timerStart');
  if (btn) btn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
}

function updateDisplay() {
  const m = String(Math.floor(timerRemaining / 60)).padStart(2, '0');
  const s = String(timerRemaining % 60).padStart(2, '0');
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = `${m}:${s}`;
  const fab = document.getElementById('timerFabLabel');
  if (fab) fab.textContent = timerRunning ? `${m}:${s}` : 'Descanso';
}

function updateProgress() {
  const el = document.getElementById('timerProgress');
  if (!el) return;
  const circ   = 326.7;
  const ratio  = timerTotal > 0 ? timerRemaining / timerTotal : 1;
  el.style.strokeDashoffset = circ * (1 - ratio);
  const hue = Math.round(ratio * 120); // verde → vermelho
  el.style.stroke = `hsl(${hue},90%,55%)`;
}

function showTimerDone() {
  const d = document.getElementById('timerDisplay');
  if (d) { d.textContent = '✅'; d.style.fontSize = '2rem'; }
  setTimeout(() => { if (d) { d.style.fontSize = ''; updateDisplay(); } }, 2000);
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.2, 0.4].forEach(t => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.4, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.2);
    });
  } catch(e) {}
}

// Expõe para uso externo (ex: ao adicionar série)
window.startRestTimer = (sec) => {
  setTimer(sec || 60);
  startTimer();
  document.getElementById('timerPanel').classList.add('open');
};

document.addEventListener('DOMContentLoaded', initTimer);
