// =============================================
//  FitBuilder — pdf.js
//  Exportar ficha de treino como PDF
// =============================================

function initPDF() {
  // Injecta botão no editor — será adicionado ao editor-topbar dinamicamente
  document.addEventListener('fitbuilder:editorOpened', injectPDFButton);
}

function injectPDFButton() {
  if (document.getElementById('btnExportPDF')) return;
  const topbar = document.querySelector('.editor-topbar');
  if (!topbar) return;
  const btn = document.createElement('button');
  btn.className = 'btn-icon-sm btn-pdf';
  btn.id = 'btnExportPDF';
  btn.title = 'Exportar PDF';
  btn.innerHTML = '<i class="fas fa-file-pdf"></i>';
  btn.addEventListener('click', exportPDF);
  topbar.appendChild(btn);
}

function exportPDF() {
  // Usa window.currentWorkoutId e window.getWorkout expostos pelo script.js
  const w = window.getWorkoutPublic ? window.getWorkoutPublic() : null;
  if (!w || w.exercises.length === 0) {
    if (window.showToast) window.showToast('Adicione exercícios antes de exportar!', 'error');
    return;
  }

  const now = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  const rows = w.exercises.map((item, i) => `
    <tr>
      <td style="width:28px;text-align:center;font-weight:700;color:#7c3aed">${i+1}</td>
      <td style="font-weight:600">${item.exercise.nome}</td>
      <td style="text-align:center">${item.series}</td>
      <td style="text-align:center">${item.reps}</td>
      <td style="text-align:center">${item.load ? item.load + ' kg' : '—'}</td>
      <td style="color:#888">${item.obs || '—'}</td>
      <td style="width:80px"></td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${w.name} — FitBuilder</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:30px}
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:12px;border-bottom:3px solid #7c3aed}
    .logo{font-size:1.5rem;font-weight:900}.logo span{color:#f97316}
    .meta{font-size:.82rem;color:#666}
    h1{font-size:1.3rem;font-weight:800;color:#7c3aed;margin-bottom:4px}
    .subtitle{font-size:.85rem;color:#888;margin-bottom:18px}
    table{width:100%;border-collapse:collapse;font-size:.87rem}
    thead tr{background:#7c3aed;color:#fff}
    thead th{padding:9px 10px;font-weight:700;text-align:left}
    tbody tr:nth-child(even){background:#f8f4ff}
    tbody td{padding:9px 10px;border-bottom:1px solid #e8e0f8;vertical-align:middle}
    .footer{margin-top:30px;text-align:center;font-size:.75rem;color:#bbb}
    @media print{body{padding:15px}.no-print{display:none}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Fit<span>Builder</span></div>
    <div class="meta">Gerado em ${now}</div>
  </div>
  <h1>${w.name}</h1>
  <p class="subtitle">${w.exercises.length} exercícios • ${now}</p>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Exercício</th><th>Séries</th><th>Reps</th><th>Carga</th><th>Obs.</th><th>✓ Feito</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">FitBuilder — Monte. Treine. Evolua.</div>
  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    // Fallback: download direto
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${w.name.replace(/\s+/g,'_')}_FitBuilder.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

document.addEventListener('DOMContentLoaded', initPDF);
