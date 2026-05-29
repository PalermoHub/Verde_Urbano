// FILTRI CONFIG
const CAMPO={
  circoscrizione:['Circoscrizione','circoscrizione','CIRCOSCRIZIONE'],
  quartiere:['Quartiere','quartiere','QUARTIERE'],
  upl:['UPL','upl','Upl'],
  odonimo:['Odonimo','odonimo','Via','via','ODONIMO'],
  genere:['Genere','genere','GENERE'],
  nome_scientifico:['Nome scientifico','Nome_scientifico','nome_scientifico','NOME_SCIENTIFICO','Specie','specie']
};
const FORDER=['circoscrizione','quartiere','upl','odonimo','genere','nome_scientifico'];
const FKEY={circoscrizione:'circ',quartiere:'quart',upl:'upl',odonimo:'odon',genere:'genere',nome_scientifico:'nome_sci'};
const FDEFAULT={circoscrizione:'Tutte le circoscrizioni',quartiere:'Tutti i quartieri',upl:'Tutte le UPL',odonimo:'Tutte le strade',genere:'Tutti i generi',nome_scientifico:'Tutte le specie'};
const FLABEL={circoscrizione:'Circ.',quartiere:'Quartiere',upl:'UPL',odonimo:'Strada',genere:'Genere',nome_scientifico:'Specie'};

// CONFIG
const CSV_OPERATORI='https://docs.google.com/spreadsheets/d/e/2PACX-1vR9A6NCjRN8wkbUoctx9W4p07kckFmqLwVaySZtPcEDGA5KAXD5_mXsnTSyS1IAaZay9eR-j5EbocDt/pub?gid=775899245&single=true&output=csv';
const CSV_ISPEZIONI='https://docs.google.com/spreadsheets/d/e/2PACX-1vR9A6NCjRN8wkbUoctx9W4p07kckFmqLwVaySZtPcEDGA5KAXD5_mXsnTSyS1IAaZay9eR-j5EbocDt/pub?gid=921930186&single=true&output=csv';
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxQ4Qqmyee_rzLeU9ayc9gWgTDHVkTD_fwP7XmqXfxyQ8ube2Aq-759KjnWe3t3DdqBgQ/exec';
const PMTILES_LAYER='dati_alberi';

// STATO
let operatori=[],statoMap={},coordsMap={};
let currentUser=null,currentProps=null,currentCoords=null;
let checks={nido:null,richiami:null,andirivieni:null},esito=null,fotosBase64=[null,null,null];
let map=null,pinBuffer='',selectedId=null;
let allFeats=[],allFeatsIds=new Set();
let filtriAttivi={circoscrizione:'',quartiere:'',upl:'',odonimo:'',genere:'',nome_scientifico:''};
let filtroStati=new Set(['ok','pending','stop','non_ispez']);
let sidebarOpen=true;

// CSV (solo operatori e ispezioni)
function pLine(l){const o=[];let f='',q=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'){if(q&&l[i+1]==='"'){f+='"';i++;}else q=!q;}else if(c===','&&!q){o.push(f);f='';}else f+=c;}o.push(f);return o;}
function pCSV(t){const ls=t.trim().split('\n');if(ls.length<2)return[];const h=pLine(ls[0]).map(x=>x.trim());return ls.slice(1).map(l=>Object.fromEntries(h.map((k,i)=>[k,(pLine(l)[i]||'').trim()]))).filter(r=>Object.values(r).some(v=>v!==''));}

function getOpId(o){const k=Object.keys(o).find(k=>k.toLowerCase().replace(/[\s_]/g,'')==='idoperatore');return k?String(o[k]).trim():'';}
function getOpPin(o){const k=Object.keys(o).find(k=>k.toLowerCase()==='pin');return k?String(o[k]).trim():'';}

async function init(){
  buildPad();
  try{
    const[a,b]=await Promise.all([fetch(CSV_OPERATORI),fetch(CSV_ISPEZIONI)]);
    const tuttiOp=pCSV(await a.text());
    operatori=tuttiOp.filter(r=>r.attivo==='SI');
    const demo=tuttiOp.find(o=>getOpId(o).toUpperCase()==='OP-01');
    if(demo){const pin=getOpPin(demo);if(pin){document.getElementById('demo-pin-val').textContent=pin;document.getElementById('demo-hint').style.display='flex';}}
    pCSV(await b.text()).forEach(x=>{
      const id=String(x.id_albero||'').trim();if(!id)return;
      if(x.esito==='NEGATIVO')statoMap[id]='ok';
      else if(x.esito==='SOSPENDERE')statoMap[id]='stop';
      else if(x.esito==='STATO DI NECESSITÀ')statoMap[id]='pending';
    });
    document.getElementById('login-loading').textContent='';
  }catch(e){document.getElementById('login-loading').textContent='Errore caricamento - verifica connessione';}
}

// PIN
function buildPad(){
  const pad=document.getElementById('pin-pad');
  [1,2,3,4,5,6,7,8,9,'C',0,'OK'].forEach(k=>{
    const b=document.createElement('button');b.className='pin-btn';b.textContent=k;
    b.onclick=()=>hPin(k);pad.appendChild(b);
  });
}
function hPin(k){if(k==='C'){pinBuffer='';updDots();return;}if(k==='OK'){chkPin();return;}pinBuffer+=String(k);updDots();}
function updDots(){const c=document.getElementById('pin-dots');c.innerHTML='';const n=Math.max(pinBuffer.length,1);for(let i=0;i<n;i++){const d=document.createElement('div');d.className='pin-dot'+(i<pinBuffer.length?' filled':'');c.appendChild(d);}}
function chkPin(){
  if(!operatori.length){pinErr('Dati non ancora caricati...');return;}
  const op=operatori.find(o=>String(o.pin).trim()===pinBuffer.trim());
  if(op){currentUser=op;const ls=document.getElementById('login-screen');ls.style.transition='opacity .4s';ls.style.opacity='0';
    setTimeout(()=>{ls.style.display='none';document.getElementById('topbar-user').textContent=op.nome+' '+op.cognome;document.getElementById('app').classList.add('visible');initMap();},400);
  }else{pinErr('PIN non riconosciuto - riprova');pinBuffer='';updDots();}
}
function pinErr(m){const e=document.getElementById('pin-error');e.textContent=m;setTimeout(()=>{e.textContent='';},2500);}
function isDemo(){return currentUser&&getOpId(currentUser).toUpperCase()==='OP-01';}
function doLogout(){pinBuffer='';updDots();currentUser=null;const ls=document.getElementById('login-screen');ls.style.display='flex';ls.style.opacity='1';document.getElementById('app').classList.remove('visible');closePanel();}

// MAPPA
function initMap(){
  const protocol=new pmtiles.Protocol();
  maplibregl.addProtocol('pmtiles',protocol.tile);
  const pmUrl='pmtiles://https://palermohub.github.io/Verde_Urbano/Lipu/dati/dati_alberi.pmtiles';

  map=new maplibregl.Map({
    container:'map',
    style:{
      version:8,
      glyphs:'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources:{
        carto:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap © CartoDB'},
        alberi:{type:'vector',url:pmUrl},
        overlay:{type:'geojson',data:{type:'FeatureCollection',features:[]}},
        selected:{type:'geojson',data:{type:'FeatureCollection',features:[]}}
      },
      layers:[
        {id:'basemap',type:'raster',source:'carto'},
        {
          id:'alberi-cerchi',type:'circle',source:'alberi','source-layer':PMTILES_LAYER,
          minzoom:0,
          paint:{
            'circle-radius':['interpolate',['linear'],['zoom'],
              0,1.5, 6,2, 10,3, 13,5, 15,7, 18,10],
            'circle-color':'#888888',
            'circle-stroke-width':0,
            'circle-opacity':0.8
          }
        },
        {
          id:'overlay-cerchi',type:'circle',source:'overlay',
          minzoom:0,
          paint:{
            'circle-radius':['interpolate',['linear'],['zoom'],
              0,1.5, 6,2, 10,3, 13,5, 15,7, 18,10],
            'circle-color':['get','colore'],
            'circle-stroke-width':0,
            'circle-opacity':1
          }
        },
        {
          id:'selected-cerchio',type:'circle',source:'selected',
          paint:{
            'circle-radius':['interpolate',['linear'],['zoom'],
              0,5.5, 6,6, 10,7, 13,9, 15,11, 18,14],
            'circle-color':'#FFD600',
            'circle-stroke-width':2.5,
            'circle-stroke-color':'#1a3d2b',
            'circle-opacity':1
          }
        }
      ]
    },
    center:[13.358,38.119],zoom:12,
    hash:true,minZoom:12,maxZoom:18,
    maxBounds:[[13.08,37.88],[13.58,38.35]]
  });

  map.on('zoom',()=>{
    const z=Math.round(map.getZoom());
    const sl=document.getElementById('tb-zoom');const vl=document.getElementById('tb-zoom-val');
    if(sl)sl.value=z;if(vl)vl.textContent=z;
  });

  function raccogliCoords(){
    const feats=map.querySourceFeatures('alberi',{sourceLayer:PMTILES_LAYER});
    let nuovi=false;
    feats.forEach(f=>{
      const id=String(f.properties['ID albero']||f.properties['ID_albero']||f.properties['id_albero']||'').trim();
      if(!id||!f.geometry||!f.geometry.coordinates)return;
      if(!coordsMap[id])coordsMap[id]=f.geometry.coordinates;
      if(!allFeatsIds.has(id)){
        allFeatsIds.add(id);
        allFeats.push({id,
          circ:getF(f.properties,'circoscrizione'),
          quart:getF(f.properties,'quartiere'),
          upl:getF(f.properties,'upl'),
          odon:getF(f.properties,'odonimo'),
          genere:getF(f.properties,'genere'),
          nome_sci:getF(f.properties,'nome_scientifico')
        });
        nuovi=true;
      }
    });
    if(nuovi){updOverlay();updSidebar();updLegend();}
  }

  map.on('idle',raccogliCoords);
  map.on('moveend',raccogliCoords);
  map.on('sourcedata',e=>{if(e.sourceId==='alberi'&&e.tile)raccogliCoords();});

  const tooltip=new maplibregl.Popup({closeButton:false,closeOnClick:false,className:'map-tooltip',offset:10,maxWidth:'220px'});

  ['alberi-cerchi','overlay-cerchi'].forEach(l=>{
    map.on('click',l,apriClick);
    map.on('mouseenter',l,e=>{
      map.getCanvas().style.cursor='pointer';
      const {id,odon,quart}=getTooltipProps(e.features[0].properties);
      tooltip.setLngLat(e.lngLat).setHTML(
        `<div class="tt-id">Id: ${id}</div>`+
        (odon?`<div class="tt-via">${odon}</div>`:'')+
        (quart?`<div class="tt-quart">${quart}</div>`:'')
      ).addTo(map);
    });
    map.on('mousemove',l,e=>{tooltip.setLngLat(e.lngLat);});
    map.on('mouseleave',l,()=>{map.getCanvas().style.cursor='';tooltip.remove();});
  });
}

function getTooltipProps(fp){
  const id=String(fp['ID albero']||fp['ID_albero']||fp['id_albero']||fp['id']||'').trim();
  let odon=getProp(fp,['Odonimo','odonimo','Via','via']);
  let quart=getProp(fp,['Quartiere','quartiere','QUARTIERE']);
  if((!odon||!quart)&&id){const af=allFeats.find(x=>x.id===id);if(af){odon=odon||af.odon;quart=quart||af.quart;}}
  return{id,odon,quart};
}

function apriClick(e){
  const f=e.features[0];
  const p=f.properties;
  const id=String(p['ID albero']||p['ID_albero']||p['id_albero']||p['id']||'').trim();
  if(!id)return;
  if(selectedId===id&&document.getElementById('panel').classList.contains('open')){closePanel();return;}
  if(f.geometry&&f.geometry.coordinates){
    coordsMap[id]=f.geometry.coordinates;
    map.getSource('selected').setData({type:'Feature',geometry:f.geometry,properties:{}});
  }
  selectedId=id;
  openScheda(id,p);
}

function updOverlay(){
  if(!map||!map.getSource('overlay'))return;
  const C={ok:'#40916C',pending:'#E76F00',stop:'#C1121F'};
  const fids=FORDER.some(c=>filtriAttivi[c])?getFilteredIds():null;
  const feats=Object.entries(statoMap).map(([id,s])=>{
    if(fids&&!fids.has(id))return null;
    if(!filtroStati.has(s))return null;
    const c=coordsMap[id];if(!c)return null;
    return{type:'Feature',geometry:{type:'Point',coordinates:c},properties:{id_albero:id,colore:C[s]||'#aaa'}};
  }).filter(Boolean);
  map.getSource('overlay').setData({type:'FeatureCollection',features:feats});
}

// SCHEDA
function getProp(p,keys){for(const k of keys){if(p[k]!==undefined&&p[k]!==null&&p[k]!=='')return String(p[k]);}return '';}

function openScheda(id,props){
  currentProps=props;
  const specie=getProp(props,['Nome scientifico','Nome_scientifico','nome_scientifico','Genere','genere']);
  const via=getProp(props,['Odonimo','odonimo','Via','via','Quartiere']);
  const now=new Date();
  document.getElementById('p-specie').textContent=specie||id;
  document.getElementById('p-via').textContent=via;
  document.getElementById('p-id').textContent=id;
  document.getElementById('p-specie2').textContent=specie||id;
  document.getElementById('p-via2').textContent=via;
  const fv=v=>v||'-';
  document.getElementById('p-alt-chioma').textContent=fv(getProp(props,['Altezza chioma [m]','Altezza chioma','altezza_chioma']));
  document.getElementById('p-alt-compl').textContent=fv(getProp(props,['Altezza complessiva [m]','Altezza complessiva','altezza_complessiva']));
  document.getElementById('p-alt-base').textContent=fv(getProp(props,['Altezza della base della chioma [m]','Altezza della base della chioma','altezza_base_chioma']));
  document.getElementById('p-area-chioma').textContent=fv(getProp(props,['Area protezione chioma [m²]','Area protezione chioma [m2]','Area protezione chioma','area_protezione_chioma']));
  document.getElementById('p-diam-tronco').textContent=fv(getProp(props,['Diametro tronco [m]','Diametro tronco','diametro_tronco']));
  document.getElementById('p-data').textContent=now.toLocaleDateString('it-IT');
  document.getElementById('p-ora').textContent=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('firma-op').value=currentUser.nome+' '+currentUser.cognome;
  document.getElementById('firma-cap').value='';
  checks={nido:null,richiami:null,andirivieni:null};esito=null;fotosBase64=[null,null,null];
  document.getElementById('p-note').value='';
  ['nido','richiami','andirivieni'].forEach(k=>rndrChk(k));
  ['neg','urg','stop'].forEach(x=>{document.getElementById('esito-'+x).className='esito-opt';});
  [0,1,2].forEach(i=>{const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';});
  updBtn();
  document.getElementById('demo-banner').style.display=isDemo()?'block':'none';
  document.getElementById('panel').classList.add('open');
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  currentProps=null;selectedId=null;
  if(map&&map.getSource('selected'))map.getSource('selected').setData({type:'FeatureCollection',features:[]});
}

// FORM
function toggleCheck(k){checks[k]=checks[k]===null?true:checks[k]===true?false:null;rndrChk(k);updBtn();}
function rndrChk(k){const v=checks[k];document.getElementById('chk-'+k).className='check-item'+(v===true?' yes':v===false?' no':'');document.getElementById('cb-'+k).textContent=v!==null?'v':'';document.getElementById('cy-'+k).textContent=v===true?'SI':v===false?'NO':'-';}
function selectEsito(e){esito=e;['neg','urg','stop'].forEach(k=>{document.getElementById('esito-'+k).className='esito-opt'+(k===e?' selected-'+k:'');});updBtn();}
function updBtn(){
  const ok=esito!==null&&checks.nido!==null&&checks.richiami!==null&&checks.andirivieni!==null;
  const demo=isDemo();
  document.getElementById('btn-invia').disabled=!ok||demo;
  document.getElementById('send-note').textContent=demo?'':'Compila esito e tutti e 3 i controlli per procedere';
  if(ok&&!demo)document.getElementById('send-note').textContent='Dati pronti - aggiungi firma capocantiere e invia';
}

// FOTO
function triggerFoto(i){document.getElementById('fi-'+i).click();}
async function resizeFoto(file,mx){return new Promise(res=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,mx/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.80).split(',')[1]);};img.src=url;});}
async function loadFoto(i,inp){const f=inp.files[0];if(!f)return;const s=document.getElementById('fs-'+i);s.className='foto-slot has-img';let el=s.querySelector('img');if(!el){el=document.createElement('img');s.appendChild(el);}el.src=URL.createObjectURL(f);fotosBase64[i]=await resizeFoto(f,1200);}
function removeFoto(ev,i){ev.stopPropagation();const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';fotosBase64[i]=null;}

// INVIA
async function inviaScheda(){
  if(isDemo()){showToast('Modalità DEMO – invio non disponibile','error');return;}
  const cap=document.getElementById('firma-cap').value.trim();
  if(!cap){showToast('Inserisci la firma del capocantiere','error');return;}
  const btn=document.getElementById('btn-invia');btn.disabled=true;btn.textContent='Invio in corso...';
  const EL={neg:'NEGATIVO',stop:'SOSPENDERE',urg:'STATO DI NECESSITÀ'};
  const p=currentProps||{};
  const id=getProp(p,['ID albero','ID_albero','id_albero','id']);
  const idSafe=id.replace(/\s+/g,'_');
  const payload={
    timestamp:new Date().toISOString(),id_albero:id,
    specie:getProp(p,['Nome scientifico','Nome_scientifico','Genere']),
    via:getProp(p,['Odonimo','odonimo','Via']),
    id_operatore:currentUser.id_operatore,
    nome_operatore:currentUser.nome+' '+currentUser.cognome,
    ruolo_operatore:currentUser.ruolo,
    ora_controllo:document.getElementById('p-ora').textContent,
    nido_visibile:checks.nido===true?'Si':'No',
    richiami:checks.richiami===true?'Si':'No',
    andirivieni:checks.andirivieni===true?'Si':'No',
    esito:EL[esito],
    note:document.getElementById('p-note').value.trim(),
    firma_operatore:document.getElementById('firma-op').value.trim(),
    firma_capocantiere:cap,
    foto:fotosBase64.filter(Boolean),
    id_safe:idSafe
  };
  try{
    const r=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});
    const d=await r.json();
    if(d.status!=='ok')throw new Error(d.error||'Errore sconosciuto');
    statoMap[id]={neg:'ok',stop:'stop',urg:'pending'}[esito];
    updOverlay();
    const msgs={neg:'Scheda inviata - si procede al taglio',stop:'Scheda inviata - lavori sospesi',urg:'Scheda inviata - attesa autorizzazione D.L.'};
    showToast(msgs[esito]||'Scheda inviata','success');
    btn.textContent='Inviata';
    setTimeout(()=>closePanel(),1800);
  }catch(err){showToast('Errore: '+err.message,'error');btn.disabled=false;btn.textContent='Invia scheda';}
}

function showToast(msg,type){const t=document.getElementById('toast');t.textContent=msg;t.className=type||'';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

// SIDEBAR / FILTRI
function getF(props,campo){for(const k of CAMPO[campo]){if(props[k]!==undefined&&props[k]!==null&&String(props[k]).trim()!=='')return String(props[k]).trim();}return '';}

function getFilteredFeats(){
  let f=allFeats;
  FORDER.forEach(c=>{if(filtriAttivi[c])f=f.filter(x=>x[FKEY[c]]===filtriAttivi[c]);});
  return f;
}
function getFilteredIds(){return new Set(getFilteredFeats().map(f=>f.id));}

function cambiaFiltro(campo){
  filtriAttivi[campo]=document.getElementById('f-'+campo).value;
  updSidebar();applyFiltriMappa();
}

function resetFiltri(){
  FORDER.forEach(c=>{filtriAttivi[c]='';});
  updSidebar();applyFiltriMappa();
}

function removeFiltro(campo){
  filtriAttivi[campo]='';
  updSidebar();applyFiltriMappa();
}

function updSidebar(){
  FORDER.forEach(c=>{
    const sel=document.getElementById('f-'+c);if(!sel)return;
    const cur=filtriAttivi[c];
    // Faceted: opzioni = valori presenti con TUTTI gli altri filtri attivi (escludo me stesso)
    let pool=allFeats;
    FORDER.forEach(other=>{if(other!==c&&filtriAttivi[other])pool=pool.filter(f=>f[FKEY[other]]===filtriAttivi[other]);});
    const vals=[...new Set(pool.map(f=>f[FKEY[c]]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'it'));
    sel.innerHTML=`<option value="">${FDEFAULT[c]}</option>`;
    vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;if(v===cur)o.selected=true;sel.appendChild(o);});
    sel.disabled=vals.length===0;
    // Auto-invalida selezione se non più disponibile
    if(cur&&!vals.includes(cur)){filtriAttivi[c]='';sel.value='';}
  });
  const hasF=FORDER.some(c=>filtriAttivi[c]);
  const cnt=getFilteredFeats().length;
  const tot=allFeats.length;
  document.getElementById('fi-count').textContent=hasF?`${cnt} di ${tot} alberi`:`${tot} alberi`;
  const resetBtn=document.getElementById('fi-reset');
  resetBtn.style.display=hasF?'inline-block':'none';
  const badges=document.getElementById('f-badges');
  badges.innerHTML='';
  FORDER.forEach(c=>{
    if(!filtriAttivi[c])return;
    const b=document.createElement('div');b.className='f-badge';
    b.innerHTML=`<span>${FLABEL[c]}: ${filtriAttivi[c]}</span><button onclick="removeFiltro('${c}')" title="Rimuovi filtro">&times;</button>`;
    badges.appendChild(b);
  });
}

function applyFiltriMappa(){
  if(!map)return;
  const hasF=FORDER.some(c=>filtriAttivi[c]);
  // alberi-cerchi (grigio): visibile solo se non_ispez attivo
  map.setLayoutProperty('alberi-cerchi','visibility',filtroStati.has('non_ispez')?'visible':'none');
  if(!hasF){map.setFilter('alberi-cerchi',null);}
  else{
    const conds=[];
    FORDER.forEach(c=>{
      if(!filtriAttivi[c])return;
      const keys=CAMPO[c],val=filtriAttivi[c];
      conds.push(keys.length===1?['==',['get',keys[0]],val]:['any',...keys.map(k=>['==',['get',k],val])]);
    });
    map.setFilter('alberi-cerchi',conds.length===1?conds[0]:['all',...conds]);
  }
  updOverlay();
  updLegend();
}

function toggleStato(s){
  if(filtroStati.has(s))filtroStati.delete(s);else filtroStati.add(s);
  applyFiltriMappa();
}

function updLegend(){
  const fids=FORDER.some(c=>filtriAttivi[c])?getFilteredIds():null;
  const pool=fids?[...fids]:allFeats.map(f=>f.id);
  ['ok','pending','stop'].forEach(s=>{
    const cnt=pool.filter(id=>statoMap[id]===s).length;
    const el=document.getElementById('lc-'+s);
    if(el)el.textContent=cnt||'';
  });
  const niCnt=pool.filter(id=>!statoMap[id]).length;
  const elNi=document.getElementById('lc-non_ispez');
  if(elNi)elNi.textContent=niCnt||'';
  ['ok','pending','stop','non_ispez'].forEach(s=>{
    const item=document.querySelector(`.legend-item[data-stato="${s}"]`);
    if(item)item.classList.toggle('inactive',!filtroStati.has(s));
  });
}

function toggleSidebar(){
  sidebarOpen=!sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed',!sidebarOpen);
  setTimeout(()=>map&&map.resize(),320);
}

// TOOLBAR MAPPA
function tbHome(){map&&map.flyTo({center:[13.35151,38.14277],zoom:12,bearing:0,pitch:0});}
function tbGps(){
  if(!navigator.geolocation){showToast('Geolocalizzazione non disponibile','error');return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    map&&map.flyTo({center:[pos.coords.longitude,pos.coords.latitude],zoom:16});
  },()=>showToast('Posizione non disponibile','error'));
}
function tbSearch(){if(!sidebarOpen)toggleSidebar();const el=document.getElementById('f-circoscrizione');if(el)el.focus();}
function tbZoom(v){map&&map.setZoom(Number(v));}

init();