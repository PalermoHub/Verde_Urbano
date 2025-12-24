// ===== VARIABILI GLOBALI (MODIFICA) =====
let allTrees = [];
let filteredTrees = [];
let map;
let markers = [];
let chartsInstances = {};
let selectedTree = null;  // AGGIUNTO: Traccia l'albero selezionato
let selectedMarker = null;  // AGGIUNTO: Traccia il marker selezionato
let seasonalLeavesData = [];  // AGGIUNTO: Dati foglie stagionali

const cpcColors = {
     'B': '#2cc15f',
     'C': '#f39c12',
     'D': '#e74c3c',
     'C/D': '#c164a1',
     'Ceppaia': '#434343'
};
