/**
 * LIPU · Protocollo Tutela Faunistica
 * Google Apps Script — Web App
 *
 * SETUP (una tantum):
 *   1. Apri il Google Sheet → Estensioni → Apps Script
 *   2. Incolla questo codice, salva
 *   3. Imposta le proprietà script:
 *      File → Proprietà progetto → Proprietà script:
 *        GITHUB_TOKEN  → Personal Access Token con scope "repo"
 *        GITHUB_REPO   → PalermoHub/Verde_Urbano
 *        GITHUB_BRANCH → main
 *   4. Distribuisci → Nuova distribuzione → Web App
 *        Esegui come: Me
 *        Chi ha accesso: Chiunque
 *   5. Copia l'URL di distribuzione e incollalo in index.html (APPS_SCRIPT_URL)
 */

// Nomi esatti dei fogli nel Google Sheet
const SHEET_ISPEZIONI = 'Dati ispezioni';
const SHEET_ALBERI    = 'Dati alberi';

const HEADERS_ISPEZIONI = [
  'timestamp', 'id_albero', 'id_operatore', 'nome_operatore', 'ruolo_operatore',
  'ora_controllo', 'nido_visibile', 'richiami', 'andirivieni', 'esito',
  'note', 'firma_operatore', 'firma_capocantiere',
  'url_foto_1', 'url_foto_2', 'url_foto_3'
];

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = processIspezione(data);
    return jsonResponse({ status: 'ok', foto_urls: result.fotoUrls });
  } catch (err) {
    return jsonResponse({ status: 'error', error: err.message });
  }
}

// Health-check: apri l'URL del deploy nel browser per verificare che funzioni
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'LIPU Apps Script attivo' });
}

// ─── LOGICA PRINCIPALE ────────────────────────────────────────────────────────
function processIspezione(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, SHEET_ISPEZIONI, HEADERS_ISPEZIONI);

  // Carica foto su GitHub e ottieni URL raw
  const fotoUrls = [];
  const fotos = data.foto || [];
  const ts    = data.timestamp ? data.timestamp.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19) : new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const idSafe = String(data.id_albero || '').trim().replace(/\s+/g, '_');

  for (let i = 0; i < fotos.length && i < 3; i++) {
    if (!fotos[i]) continue;
    const path = 'Lipu/foto/' + idSafe + '_' + ts + '/foto_' + (i + 1) + '.jpg';
    const url  = commitFotoGitHub(path, fotos[i]);
    fotoUrls.push(url || '');
  }

  // Scrivi riga nel foglio ispezioni
  const row = [
    data.timestamp        || new Date().toISOString(),
    data.id_albero        || '',
    data.id_operatore     || '',
    data.nome_operatore   || '',
    data.ruolo_operatore  || '',
    data.ora_controllo    || '',
    data.nido_visibile    || '',
    data.richiami         || '',
    data.andirivieni      || '',
    data.esito            || '',
    data.note             || '',
    data.firma_operatore  || '',
    data.firma_capocantiere || '',
    fotoUrls[0] || '',
    fotoUrls[1] || '',
    fotoUrls[2] || ''
  ];
  sheet.appendRow(row);

  return { fotoUrls };
}

// ─── GITHUB API ───────────────────────────────────────────────────────────────
function commitFotoGitHub(path, base64content) {
  const props  = PropertiesService.getScriptProperties();
  const token  = props.getProperty('GITHUB_TOKEN');
  const repo   = props.getProperty('GITHUB_REPO')   || 'PalermoHub/Verde_Urbano';
  const branch = props.getProperty('GITHUB_BRANCH') || 'main';

  if (!token) throw new Error('GITHUB_TOKEN non configurato nelle proprietà script');

  const apiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  const headers = {
    'Authorization': 'token ' + token,
    'Content-Type': 'application/json',
    'User-Agent': 'LIPU-AppsScript'
  };

  // Recupera SHA se il file esiste già (per sovrascriverlo)
  let sha;
  try {
    const check = UrlFetchApp.fetch(apiUrl, { headers: headers, muteHttpExceptions: true });
    if (check.getResponseCode() === 200) {
      sha = JSON.parse(check.getContentText()).sha;
    }
  } catch (e) { /* file non esiste, procedi */ }

  const body = {
    message: 'foto ispezione ' + path,
    content: base64content,
    branch: branch
  };
  if (sha) body.sha = sha;

  const res = UrlFetchApp.fetch(apiUrl, {
    method: 'put',
    headers: headers,
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  if (code !== 200 && code !== 201) {
    Logger.log('GitHub API error ' + code + ': ' + res.getContentText());
    return null;
  }

  // URL raw pubblico della foto
  return 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/' + path;
}

// ─── UTILITÀ ──────────────────────────────────────────────────────────────────
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#2D6A4F')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
