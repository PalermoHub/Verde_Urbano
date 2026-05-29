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
const SHEET_OPERATORI = 'Gestione operatori';

const HEADERS_ISPEZIONI = [
  'timestamp', 'id_albero', 'id_operatore', 'nome_operatore', 'ruolo_operatore',
  'ora_controllo', 'nido_visibile', 'richiami', 'andirivieni', 'esito',
  'note', 'firma_operatore', 'firma_capocantiere',
  'url_foto_1', 'url_foto_2', 'url_foto_3', 'url_pdf'
];

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Gestione login sicuro
    if (data.action === 'login') {
      const result = verifyLogin(data.pin);
      return jsonResponse(result);
    }
    
    // Azione predefinita: elabora e inserisce una nuova ispezione
    const result = processIspezione(data);
    return jsonResponse({ status: 'ok', foto_urls: result.fotoUrls });
  } catch (err) {
    return jsonResponse({ status: 'error', error: err.message });
  }
}

// Recupera i dati minimi iniziali per disegnare la mappa e mostrare il PIN demo
function doGet(e) {
  try {
    const result = getInitData();
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ status: 'error', error: err.message });
  }
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

  // URL del PDF predittivo (generato dal workflow ~2 min dopo)
  const props  = PropertiesService.getScriptProperties();
  const repo   = props.getProperty('GITHUB_REPO')   || 'PalermoHub/Verde_Urbano';
  const branch = props.getProperty('GITHUB_BRANCH') || 'main';
  const pdfUrl = 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/Lipu/schede_pdf/' + idSafe + '_' + ts + '.pdf';

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
    fotoUrls[2] || '',
    pdfUrl
  ];
  sheet.appendRow(row);

  // Commette un JSON con i dati ispezione — usato dal workflow GitHub Actions per generare il PDF
  const jsonData = {
    timestamp:          data.timestamp        || new Date().toISOString(),
    id_albero:          data.id_albero        || '',
    specie:             data.specie           || '',
    via:                data.via              || '',
    id_operatore:       data.id_operatore     || '',
    nome_operatore:     data.nome_operatore   || '',
    ruolo_operatore:    data.ruolo_operatore  || '',
    ora_controllo:      data.ora_controllo    || '',
    nido_visibile:      data.nido_visibile    || '',
    richiami:           data.richiami         || '',
    andirivieni:        data.andirivieni      || '',
    esito:              data.esito            || '',
    note:               data.note             || '',
    firma_operatore:    data.firma_operatore  || '',
    firma_capocantiere: data.firma_capocantiere || '',
    url_foto_1:         fotoUrls[0] || '',
    url_foto_2:         fotoUrls[1] || '',
    url_foto_3:         fotoUrls[2] || ''
  };
  const jsonPath = 'Lipu/schede_pdf/' + idSafe + '_' + ts + '.json';
  commitFileGitHub(jsonPath, Utilities.base64Encode(JSON.stringify(jsonData, null, 2)), 'dati ispezione ' + jsonPath);

  return { fotoUrls };
}

// ─── GITHUB API ───────────────────────────────────────────────────────────────
function commitFotoGitHub(path, base64content) {
  return commitFileGitHub(path, base64content, 'foto ispezione ' + path);
}

function commitFileGitHub(path, base64content, message) {
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
    message: message,
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
  }
  
  // Verifica se la prima riga è vuota (per inserire le intestazioni)
  const range = sheet.getRange(1, 1, 1, headers.length);
  const firstRowValues = range.getValues()[0];
  const isFirstRowEmpty = firstRowValues.every(val => String(val).trim() === '');
  
  if (isFirstRowEmpty) {
    range.setValues([headers])
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

// Recupera lo stato delle ispezioni ridotto ed il PIN dell'utente demo OP-01
function getInitData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Legge le ispezioni per ricavare solo ID albero ed Esito
  const sheetIspez = ss.getSheetByName(SHEET_ISPEZIONI);
  const ispezioni = [];
  if (sheetIspez) {
    const data = sheetIspez.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0].map(h => String(h).trim().toLowerCase());
      const idxId   = headers.indexOf('id_albero');
      const idxEsito = headers.indexOf('esito');
      const idxTs   = headers.indexOf('timestamp');
      const idxOp   = headers.indexOf('id_operatore');
      const idxPdf  = headers.indexOf('url_pdf');

      if (idxId !== -1 && idxEsito !== -1) {
        for (let i = 1; i < data.length; i++) {
          const id = String(data[i][idxId]).trim();
          const esito = String(data[i][idxEsito]).trim();
          if (id) {
            ispezioni.push({
              id_albero:    id,
              esito:        esito,
              timestamp:    idxTs  !== -1 ? String(data[i][idxTs]).trim()  : '',
              id_operatore: idxOp  !== -1 ? String(data[i][idxOp]).trim()  : '',
              url_pdf:      idxPdf !== -1 ? String(data[i][idxPdf]).trim() : ''
            });
          }
        }
      }
    }
  }

  // 2. Cerca il PIN demo dell'operatore OP-01
  let demoPin = '—';
  const sheetOp = ss.getSheetByName(SHEET_OPERATORI);
  if (sheetOp) {
    const data = sheetOp.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
      const idxId = findColumnIndex(headers, ['idoperatore', 'id', 'codice', 'operatorid', 'id_operatore']);
      const idxPin = findColumnIndex(headers, ['pin', 'codicepin']);
      
      if (idxId !== -1 && idxPin !== -1) {
        for (let i = 1; i < data.length; i++) {
          const id = String(data[i][idxId]).trim().toUpperCase();
          if (id === 'OP-01') {
            demoPin = String(data[i][idxPin]).trim();
            break;
          }
        }
      }
    }
  }

  return {
    status: 'ok',
    demoPin: demoPin,
    ispezioni: ispezioni
  };
}

// Verifica il PIN inserito confrontandolo con il foglio operatori
function verifyLogin(pin) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetOp = ss.getSheetByName(SHEET_OPERATORI);
  if (!sheetOp) {
    throw new Error("Foglio '" + SHEET_OPERATORI + "' non trovato nel Google Sheet");
  }
  
  const data = sheetOp.getDataRange().getValues();
  if (data.length < 2) {
    throw new Error("Nessun operatore configurato nel foglio Gestione operatori");
  }
  
  const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const idxId = findColumnIndex(headers, ['idoperatore', 'id', 'codice', 'operatorid', 'id_operatore']);
  const idxPin = findColumnIndex(headers, ['pin', 'codicepin']);
  const idxNome = findColumnIndex(headers, ['nome', 'name']);
  const idxCognome = findColumnIndex(headers, ['cognome', 'surname']);
  const idxRuolo = findColumnIndex(headers, ['ruolo', 'role']);
  const idxAttivo = findColumnIndex(headers, ['attivo', 'active', 'abilitato']);
  
  if (idxPin === -1) {
    throw new Error("Colonna PIN non trovata nel foglio Gestione operatori");
  }
  
  const cleanPin = String(pin).trim();
  if (!cleanPin) {
    return { status: 'error', error: 'Inserisci un PIN' };
  }
  
  for (let i = 1; i < data.length; i++) {
    const rowPin = String(data[i][idxPin]).trim();
    if (rowPin === cleanPin) {
      const attivoVal = idxAttivo !== -1 ? String(data[i][idxAttivo]).trim().toUpperCase() : 'SI';
      if (attivoVal !== 'SI') {
        return { status: 'error', error: 'Operatore non attivo' };
      }
      
      const operator = {
        id_operatore: idxId !== -1 ? String(data[i][idxId]).trim() : '',
        nome: idxNome !== -1 ? String(data[i][idxNome]).trim() : '',
        cognome: idxCognome !== -1 ? String(data[i][idxCognome]).trim() : '',
        ruolo: idxRuolo !== -1 ? String(data[i][idxRuolo]).trim() : ''
      };
      
      return { status: 'ok', operator: operator };
    }
  }
  
  return { status: 'error', error: 'PIN non valido' };
}

// Trova la colonna corrispondente cercando diverse varianti comuni
function findColumnIndex(headers, possibleNames) {
  for (let i = 0; i < possibleNames.length; i++) {
    const idx = headers.indexOf(possibleNames[i].toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (idx !== -1) return idx;
  }
  return -1;
}

