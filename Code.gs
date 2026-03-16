// =============================================
//  FitBuilder v2 — Code.gs (Google Apps Script)
//  Integração total: exercícios + treinos
// =============================================

const SHEET_EXERCISES = 'Exercicios';
const SHEET_WORKOUTS  = 'Treinos';

// ---- GET ----
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';

  if (action === 'getExercises') {
    return jsonResponse(getSheetData(SHEET_EXERCISES));
  }

  if (action === 'getWorkouts') {
    return jsonResponse(getWorkoutsGrouped());
  }

  return jsonResponse({ error: 'action inválida' });
}

// ---- POST ----
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === 'saveWorkout') {
      const sheet = getOrCreateSheet(SHEET_WORKOUTS);

      // Garante cabeçalho
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['workout_id','data','nome_treino','exercicio','series','repeticoes','carga','observacoes']);
      }

      // Remove linhas antigas do mesmo workout_id antes de reinserir
      const workoutId = payload.workout_id;
      if (workoutId) deleteRowsByWorkoutId(sheet, workoutId);

      payload.rows.forEach(row => {
        sheet.appendRow([
          workoutId || '',
          row.data,
          row.nome_treino,
          row.exercicio,
          row.series,
          row.repeticoes,
          row.carga       || '',
          row.observacoes || '',
        ]);
      });

      return jsonResponse({ status: 'ok', saved: payload.rows.length });
    }

    if (payload.action === 'deleteWorkout') {
      const sheet = getOrCreateSheet(SHEET_WORKOUTS);
      deleteRowsByWorkoutId(sheet, payload.workout_id);
      return jsonResponse({ status: 'ok' });
    }

    return jsonResponse({ error: 'action inválida' });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ---- HELPERS ----

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
  const headers = rows[0]; // workout_id, data, nome_treino, exercicio, series, repeticoes, carga, observacoes
  const data    = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  // Agrupa por workout_id + nome_treino
  const map = {};
  data.forEach(row => {
    const key = row['workout_id'] || row['nome_treino'];
    if (!map[key]) {
      map[key] = {
        id:        row['workout_id'] || key,
        name:      row['nome_treino'],
        updatedAt: row['data'],
        exercises: [],
      };
    }
    map[key].exercises.push({
      exercise: {
        id:             Math.random(), // id local
        nome:           row['exercicio'],
        grupo_muscular: '',
        equipamento:    '',
        nivel:          '',
        imagem:         '💪',
      },
      series: Number(row['series'])     || 0,
      reps:   Number(row['repeticoes']) || 0,
      load:   row['carga']       || '',
      obs:    row['observacoes'] || '',
    });
  });

  return Object.values(map);
}

function deleteRowsByWorkoutId(sheet, workoutId) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(workoutId)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
