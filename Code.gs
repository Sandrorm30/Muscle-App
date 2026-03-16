// =============================================
//  FitBuilder v3 — Code.gs (Google Apps Script)
// =============================================

const SHEET_EXERCISES = 'Exercicios';
const SHEET_WORKOUTS  = 'Treinos';

// ---- GET ----
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'getExercises') return jsonResponse(getSheetData(SHEET_EXERCISES));
  if (action === 'getWorkouts')  return jsonResponse(getWorkoutsGrouped());
  return jsonResponse({ error: 'action inválida' });
}

// ---- POST ----
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'saveWorkout') {
      const sheet = getOrCreateSheet(SHEET_WORKOUTS);
      if (sheet.getLastRow() === 0)
        sheet.appendRow(['workout_id','data','nome_treino','exercicio','series','repeticoes','carga','observacoes']);
      const workoutId = payload.workout_id;
      if (workoutId) deleteRowsByWorkoutId(sheet, workoutId);
      payload.rows.forEach(row => {
        sheet.appendRow([workoutId||'', row.data, row.nome_treino, row.exercicio,
                         row.series, row.repeticoes, row.carga||'', row.observacoes||'']);
      });
      return jsonResponse({ status: 'ok', saved: payload.rows.length });
    }
    if (payload.action === 'deleteWorkout') {
      deleteRowsByWorkoutId(getOrCreateSheet(SHEET_WORKOUTS), payload.workout_id);
      return jsonResponse({ status: 'ok' });
    }
    return jsonResponse({ error: 'action inválida' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// =============================================
//  POPULAR EXERCÍCIOS BASE
//  Execute esta função UMA VEZ pelo menu do Apps Script
// =============================================
function populateExercises() {
  const sheet = getOrCreateSheet(SHEET_EXERCISES);

  // Limpa e recria cabeçalho
  sheet.clearContents();
  sheet.appendRow(['id', 'nome', 'grupo_muscular', 'equipamento', 'nivel', 'imagem']);

  const exercises = [
    // PEITO
    [1,  'Supino Reto',            'Peito',       'Barra',       'Intermediário', '🏋️'],
    [2,  'Supino Inclinado',       'Peito',       'Halteres',    'Intermediário', '🏋️'],
    [3,  'Supino Declinado',       'Peito',       'Barra',       'Intermediário', '🏋️'],
    [4,  'Crucifixo',              'Peito',       'Halteres',    'Iniciante',     '💪'],
    [5,  'Crossover',              'Peito',       'Cabo',        'Iniciante',     '🔗'],
    [6,  'Flexão de Braço',        'Peito',       'Solo',        'Iniciante',     '💪'],
    [7,  'Peck Deck',              'Peito',       'Máquina',     'Iniciante',     '🦾'],
    // COSTAS
    [8,  'Pull-up (Barra Fixa)',   'Costas',      'Barra Fixa',  'Avançado',      '🧗'],
    [9,  'Remada Curvada',         'Costas',      'Barra',       'Intermediário', '🏋️'],
    [10, 'Puxada Frontal',         'Costas',      'Cabo',        'Iniciante',     '🔗'],
    [11, 'Remada Unilateral',      'Costas',      'Halteres',    'Iniciante',     '💪'],
    [12, 'Terra (Deadlift)',        'Costas',      'Barra',       'Avançado',      '🏋️'],
    [13, 'Remada Baixa',           'Costas',      'Cabo',        'Iniciante',     '🔗'],
    [14, 'Pullover',               'Costas',      'Halteres',    'Intermediário', '💪'],
    // PERNAS
    [15, 'Agachamento Livre',      'Pernas',      'Barra',       'Intermediário', '🦵'],
    [16, 'Leg Press',              'Pernas',      'Máquina',     'Iniciante',     '🦿'],
    [17, 'Cadeira Extensora',      'Pernas',      'Máquina',     'Iniciante',     '🦵'],
    [18, 'Cadeira Flexora',        'Pernas',      'Máquina',     'Iniciante',     '🦵'],
    [19, 'Stiff',                  'Pernas',      'Barra',       'Intermediário', '🏋️'],
    [20, 'Hack Squat',             'Pernas',      'Máquina',     'Intermediário', '🦵'],
    [21, 'Elevação de Quadril',    'Pernas',      'Barra',       'Iniciante',     '🍑'],
    [22, 'Avanço (Lunge)',         'Pernas',      'Halteres',    'Iniciante',     '🦵'],
    [23, 'Agachamento Sumô',       'Pernas',      'Halteres',    'Iniciante',     '🦵'],
    // OMBROS
    [24, 'Desenvolvimento',        'Ombros',      'Halteres',    'Iniciante',     '🙌'],
    [25, 'Elevação Lateral',       'Ombros',      'Halteres',    'Iniciante',     '💪'],
    [26, 'Arnold Press',           'Ombros',      'Halteres',    'Intermediário', '🙌'],
    [27, 'Face Pull',              'Ombros',      'Cabo',        'Iniciante',     '🔗'],
    [28, 'Elevação Frontal',       'Ombros',      'Halteres',    'Iniciante',     '💪'],
    [29, 'Desenvolvimento Militar','Ombros',      'Barra',       'Intermediário', '🏋️'],
    // BÍCEPS
    [30, 'Rosca Direta',           'Bíceps',      'Barra',       'Iniciante',     '💪'],
    [31, 'Rosca Alternada',        'Bíceps',      'Halteres',    'Iniciante',     '💪'],
    [32, 'Rosca Martelo',          'Bíceps',      'Halteres',    'Iniciante',     '🔨'],
    [33, 'Rosca Concentrada',      'Bíceps',      'Halteres',    'Iniciante',     '💪'],
    [34, 'Rosca Scott',            'Bíceps',      'Barra',       'Intermediário', '💪'],
    [35, 'Rosca no Cabo',          'Bíceps',      'Cabo',        'Iniciante',     '🔗'],
    // TRÍCEPS
    [36, 'Tríceps Testa',          'Tríceps',     'Barra',       'Intermediário', '💪'],
    [37, 'Tríceps Corda',          'Tríceps',     'Cabo',        'Iniciante',     '🔗'],
    [38, 'Mergulho (Dips)',        'Tríceps',     'Barra Fixa',  'Avançado',      '🧗'],
    [39, 'Tríceps Francês',        'Tríceps',     'Halteres',    'Iniciante',     '💪'],
    [40, 'Supino Fechado',         'Tríceps',     'Barra',       'Intermediário', '🏋️'],
    [41, 'Tríceps Coice',          'Tríceps',     'Halteres',    'Iniciante',     '💪'],
    [42, 'Tríceps no Cabo Reto',   'Tríceps',     'Cabo',        'Iniciante',     '🔗'],
    // ABDÔMEN
    [43, 'Abdominal Crunch',       'Abdômen',     'Solo',        'Iniciante',     '🔥'],
    [44, 'Prancha',                'Abdômen',     'Solo',        'Iniciante',     '🔥'],
    [45, 'Abdominal Infra',        'Abdômen',     'Solo',        'Iniciante',     '🔥'],
    [46, 'Abdominal Oblíquo',      'Abdômen',     'Solo',        'Iniciante',     '🔥'],
    [47, 'Abdominal no Cabo',      'Abdômen',     'Cabo',        'Intermediário', '🔗'],
    [48, 'Elevação de Pernas',     'Abdômen',     'Barra Fixa',  'Intermediário', '🧗'],
    // PANTURRILHA
    [49, 'Panturrilha em Pé',      'Panturrilha', 'Máquina',     'Iniciante',     '🦵'],
    [50, 'Panturrilha Sentado',    'Panturrilha', 'Máquina',     'Iniciante',     '🦵'],
    // CARDIO
    [51, 'Esteira',                'Cardio',      'Máquina',     'Iniciante',     '🏃'],
    [52, 'Bicicleta Ergométrica',  'Cardio',      'Máquina',     'Iniciante',     '🚴'],
    [53, 'Corda (Pular)',          'Cardio',      'Solo',        'Iniciante',     '🪢'],
    [54, 'Elíptico',               'Cardio',      'Máquina',     'Iniciante',     '🏃'],
  ];

  exercises.forEach(row => sheet.appendRow(row));

  // Formata o cabeçalho
  const header = sheet.getRange(1, 1, 1, 6);
  header.setBackground('#7c3aed');
  header.setFontColor('#ffffff');
  header.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Ajusta largura das colunas
  sheet.autoResizeColumns(1, 6);

  SpreadsheetApp.getUi().alert(
    '✅ Sucesso!',
    exercises.length + ' exercícios inseridos na aba "Exercicios".\n\nAgora você pode editar, adicionar ou remover linhas à vontade!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// =============================================
//  ADICIONAR EXERCÍCIO PERSONALIZADO
//  Preencha os campos abaixo e execute a função
// =============================================
function addCustomExercise() {
  // ✏️ EDITE AQUI seus exercícios personalizados:
  const customExercises = [
    // [id,  nome,              grupo_muscular, equipamento,  nivel,           imagem]
    // [100, 'Meu Exercício',   'Peito',        'Halteres',   'Intermediário', '💪'],
  ];

  if (customExercises.length === 0) {
    SpreadsheetApp.getUi().alert('Edite a lista customExercises no código antes de executar!');
    return;
  }

  const sheet = getOrCreateSheet(SHEET_EXERCISES);
  customExercises.forEach(row => sheet.appendRow(row));
  SpreadsheetApp.getUi().alert(customExercises.length + ' exercício(s) adicionado(s)!');
}

// =============================================
//  MENU PERSONALIZADO NA PLANILHA
// =============================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏋️ FitBuilder')
    .addItem('Popular exercícios base (54 exercícios)', 'populateExercises')
    .addSeparator()
    .addItem('Adicionar exercício personalizado', 'addCustomExercise')
    .addToUi();
}

// =============================================
//  HELPERS
// =============================================
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getWorkoutsGrouped() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_WORKOUTS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data    = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  const map = {};
  data.forEach(row => {
    const key = row['workout_id'] || row['nome_treino'];
    if (!map[key]) {
      map[key] = { id: row['workout_id']||key, name: row['nome_treino'],
                   updatedAt: row['data'], exercises: [] };
    }
    map[key].exercises.push({
      exercise: { id: Math.random(), nome: row['exercicio'],
                  grupo_muscular:'', equipamento:'', nivel:'', imagem:'💪' },
      series: Number(row['series'])||0, reps: Number(row['repeticoes'])||0,
      load: row['carga']||'', obs: row['observacoes']||'',
    });
  });
  return Object.values(map);
}

function deleteRowsByWorkoutId(sheet, workoutId) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(workoutId)) sheet.deleteRow(i + 1);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
