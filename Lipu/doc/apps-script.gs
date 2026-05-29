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

  // Genera ed esporta il PDF della Scheda Stampa su GitHub
  let pdfUrl = '';
  try {
    popolaSchedaStampa(ss, data, fotoUrls);
    SpreadsheetApp.flush(); // Forza il salvataggio immediato delle modifiche nel foglio prima dell'export
    
    // Esporta la Scheda stampa in PDF
    const sheetStampa = ss.getSheetByName('Scheda stampa');
    const pdfBlob = exportSheetAsPdf(ss.getId(), sheetStampa.getSheetId());
    
    // Upload del PDF su GitHub nella cartella schede_pdf
    const base64Pdf = Utilities.base64Encode(pdfBlob.getBytes());
    const pdfPath = 'Lipu/schede_pdf/' + idSafe + '_' + ts + '.pdf';
    pdfUrl = commitFotoGitHub(pdfPath, base64Pdf) || '';
  } catch (err) {
    Logger.log("Errore durante la creazione/caricamento del PDF: " + err.message);
  }

  // Scrivi riga nel foglio ispezioni (compreso il link al PDF)
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
      const idxId = headers.indexOf('id_albero');
      const idxEsito = headers.indexOf('esito');
      
      if (idxId !== -1 && idxEsito !== -1) {
        for (let i = 1; i < data.length; i++) {
          const id = String(data[i][idxId]).trim();
          const esito = String(data[i][idxEsito]).trim();
          if (id) {
            ispezioni.push({ id_albero: id, esito: esito });
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

// Popola automaticamente la Scheda stampa in tempo reale con un layout professionale
function popolaSchedaStampa(ss, data, fotoUrls) {
  let sheet = ss.getSheetByName('Scheda stampa');
  if (!sheet) {
    sheet = ss.insertSheet('Scheda stampa');
  }
  
  sheet.clear();
  
  // Unisce/separa tutte le celle esistenti per ricominciare da un foglio pulito ed evitare conflitti di celle unite
  try {
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();
    sheet.getRange(1, 1, maxRows, maxCols).breakApart();
  } catch (err) {
    Logger.log("Errore breakApart: " + err.message);
  }
  
  sheet.showSheet(); // Rende visibile se nascosto
  
  // Imposta larghezza colonne per rendere la stampa pulita (4 colonne principali)
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 180);
  
  // Gridlines visibili
  sheet.setGridlines(true);
  
  // 1. Titolo principale
  sheet.getRange('A1:D1').merge().setValue('LIPU · PROTOCOLLO TUTELA FAUNISTICA')
    .setFontFamily('Arial').setFontSize(14).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#2D6A4F').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange('A2:D2').merge().setValue('SCHEDA DI ISPEZIONE ALBERI PRIMA DEL TAGLIO')
    .setFontFamily('Arial').setFontSize(10).setFontItalic(true)
    .setFontColor('#ffffff').setBackground('#2D6A4F').setHorizontalAlignment('center').setVerticalAlignment('middle');
  
  sheet.setRowHeight(1, 30);
  sheet.setRowHeight(2, 20);
  
  // Utilità per creare intestazioni di sezione
  function createSectionHeader(row, title) {
    sheet.getRange(row, 1, 1, 4).merge().setValue(title)
      .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
      .setFontColor('#2D6A4F').setBackground('#f2f2ee').setVerticalAlignment('middle')
      .setBorder(true, true, true, true, false, false, '#c8c8be', SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(row, 24);
  }
  
  function setField(row, colLabel, label, colVal, val, isBold) {
    sheet.getRange(row, colLabel).setValue(label)
      .setFontFamily('Arial').setFontSize(9).setFontColor('#7a7a72').setFontWeight('bold').setVerticalAlignment('middle');
    const cellVal = sheet.getRange(row, colVal).setValue(val)
      .setFontFamily('Arial').setFontSize(10).setFontColor('#1a1a18').setVerticalAlignment('middle');
    if (isBold) cellVal.setFontWeight('bold');
    sheet.getRange(row, colLabel, 1, 2).setBorder(true, true, true, true, false, false, '#f2f2ee', SpreadsheetApp.BorderStyle.SOLID);
  }

  // Sezione 1: Anagrafica
  createSectionHeader(4, ' 1 - ANAGRAFICA DELLA PIANTA');
  setField(5, 1, 'ID Albero:', 2, data.id_albero || '-', true);
  setField(5, 3, 'Data Ispezione:', 4, data.timestamp ? data.timestamp.split('T')[0] : new Date().toLocaleDateString('it-IT'));
  
  setField(6, 1, 'Specie Pianta:', 2, data.specie || '-');
  setField(6, 3, 'Ora Controllo:', 4, data.ora_controllo || '-');
  
  sheet.getRange(7, 1).setValue('Ubicazione:')
    .setFontFamily('Arial').setFontSize(9).setFontColor('#7a7a72').setFontWeight('bold').setVerticalAlignment('middle');
  sheet.getRange('B7:D7').merge().setValue(data.via || '-')
    .setFontFamily('Arial').setFontSize(10).setFontColor('#1a1a18').setVerticalAlignment('middle');
  sheet.getRange(7, 1, 1, 4).setBorder(true, true, true, true, false, false, '#f2f2ee', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(7, 22);
  
  // Sezione 2: Dichiarazione
  createSectionHeader(9, ' 2 - DICHIARAZIONE OPERATORE');
  
  function setCheckRow(row, label, val) {
    sheet.getRange(row, 1, 1, 3).merge().setValue(label)
      .setFontFamily('Arial').setFontSize(10).setFontColor('#3d3d38').setVerticalAlignment('middle');
    const cellVal = sheet.getRange(row, 4).setValue(val)
      .setFontFamily('Arial').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
    
    if (val === 'Si') {
      cellVal.setFontColor('#c17f00').setBackground('#fffde7');
    } else {
      cellVal.setFontColor('#2D6A4F').setBackground('#F0FFF4');
    }
    sheet.getRange(row, 1, 1, 4).setBorder(true, true, true, true, false, false, '#f2f2ee', SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(row, 22);
  }
  
  setCheckRow(10, 'Nidi strutturati, uova o piccoli (pulli) visibili nella chioma o cavità', data.nido_visibile || '-');
  setCheckRow(11, 'Richiami o pigolii percepibili provenienti dalla chioma o cavità', data.richiami || '-');
  setCheckRow(12, 'Andirivieni continuo di adulti con cibo nel becco verso la chioma', data.andirivieni || '-');
  
  // Sezione 3: Esito
  createSectionHeader(14, " 3 - ESITO DELL'ESAME");
  sheet.getRange('A15:C15').merge().setValue("Esito finale dell'ispezione ed azione da intraprendere:")
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold').setFontColor('#3d3d38').setVerticalAlignment('middle');
  
  const esitoCell = sheet.getRange(15, 4).setValue(data.esito || '-')
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  
  if (data.esito === 'SOSPENDERE') {
    esitoCell.setFontColor('#C1121F').setBackground('#FFECEC');
  } else if (data.esito === 'NEGATIVO') {
    esitoCell.setFontColor('#2D6A4F').setBackground('#F0FFF4');
  } else {
    esitoCell.setFontColor('#E76F00').setBackground('#FFF3E0');
  }
  sheet.getRange(15, 1, 1, 4).setBorder(true, true, true, true, false, false, '#f2f2ee', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(15, 26);
  
  // Sezione 4: Note
  createSectionHeader(17, ' NOTE AGGIUNTIVE');
  sheet.getRange('A18:D18').merge().setValue(data.note || 'Nessuna nota aggiuntiva inserita.')
    .setFontFamily('Arial').setFontSize(10).setFontColor('#3d3d38').setWrap(true).setVerticalAlignment('top');
  sheet.getRange(18, 1, 1, 4).setBorder(true, true, true, true, false, false, '#f2f2ee', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(18, 50);
  
  // Sezione 5: Firme
  createSectionHeader(20, ' FIRME DI CONVALIDA');
  setField(21, 1, 'Firma Operatore:', 2, data.firma_operatore || '-', true);
  setField(21, 3, 'Firma Capocantiere:', 4, data.firma_capocantiere || '-', true);
  sheet.setRowHeight(21, 24);
  
  // Sezione 6: Foto
  createSectionHeader(23, ' DOCUMENTAZIONE FOTOGRAFICA');
  sheet.setRowHeight(23, 24);
  
  // Uniamo celle per le immagini
  sheet.getRange('A24:B31').merge();
  sheet.getRange('C24:D31').merge();
  sheet.getRange('A33:B40').merge();
  sheet.getRange('C33:D40').merge();
  
  function applyPhoto(rangeStr, url, label) {
    const r = sheet.getRange(rangeStr);
    r.setHorizontalAlignment('center').setVerticalAlignment('middle');
    if (url) {
      r.setFormula('=IMAGE("' + url + '")');
    } else {
      r.setValue(label).setFontFamily('Arial').setFontSize(9).setFontColor('#c8c8be').setBackground('#f8f8f5');
    }
    r.setBorder(true, true, true, true, false, false, '#c8c8be', SpreadsheetApp.BorderStyle.SOLID);
  }
  
  applyPhoto('A24:B31', fotoUrls[0] || null, 'Foto 1 non caricata');
  applyPhoto('C24:D31', fotoUrls[1] || null, 'Foto 2 non caricata');
  applyPhoto('A33:B40', fotoUrls[2] || null, 'Foto 3 non caricata');
  
  sheet.getRange('C33:D40').setValue('PROTOCOLLO LIPU\nTutela della Fauna Selvatica\nComune di Palermo')
    .setFontFamily('Arial').setFontSize(9).setFontWeight('bold').setFontItalic(true).setFontColor('#7a7a72')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setBackground('#f8f8f5')
    .setBorder(true, true, true, true, false, false, '#c8c8be', SpreadsheetApp.BorderStyle.SOLID);
    
  // Impostiamo l'altezza delle righe per le foto per renderle quadrate
  for (let r = 24; r <= 31; r++) sheet.setRowHeight(r, 20);
  sheet.setRowHeight(32, 10);
  for (let r = 33; r <= 40; r++) sheet.setRowHeight(r, 20);
}

// Esporta un singolo foglio specifico come file PDF in modo programmato
function exportSheetAsPdf(ssId, sheetId) {
  const url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?";
  const exportOptions = {
    exportFormat: "pdf",
    format: "pdf",
    size: "A4",
    portrait: "true",
    fitw: "true",
    gridlines: "false",
    printtitle: "false",
    sheetnames: "false",
    fzr: "false",
    gid: sheetId
  };
  
  const urlParts = [];
  for (let key in exportOptions) {
    urlParts.push(key + "=" + exportOptions[key]);
  }
  const exportUrl = url + urlParts.join("&");
  
  const response = UrlFetchApp.fetch(exportUrl, {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken(),
    },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    throw new Error("Errore nel download del PDF da Google Sheets (Codice: " + response.getResponseCode() + ")");
  }
  
  return response.getBlob();
}
