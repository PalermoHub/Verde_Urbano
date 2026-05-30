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

const CLUSTER_MAX_ZOOM=15;
const CL_C={ok:'#40916C',pending:'#E76F00',stop:'#C1121F',non_ispez:'#aaa'};
const CL_KEYS=['ok','pending','stop','non_ispez'];
const CL_LABELS={ok:'OK',pending:'Necessità',stop:'Sospesi',non_ispez:'Non ispez.'};

// CONFIG
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxQ4Qqmyee_rzLeU9ayc9gWgTDHVkTD_fwP7XmqXfxyQ8ube2Aq-759KjnWe3t3DdqBgQ/exec';
const PMTILES_LAYER='dati_alberi';
const BASEMAPS={
  carto:    ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
  ctc:      ['https://siciliahub.github.io/Tiles/ctr_pa_2k/{z}/{x}/{y}.png'],
  satellite:['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}']
};
function switchBasemap(key){
  if(!map||!BASEMAPS[key])return;
  map.getSource('carto').setTiles(BASEMAPS[key]);
  document.querySelectorAll('#bm-gallery .bm-item').forEach(el=>el.classList.toggle('active',el.dataset.key===key));
}

// STATO
let statoMap={},tsMap={},coordsMap={},allIspezioni=[];
let currentUser=null,currentProps=null,currentCoords=null;
let checks={nido:null,richiami:null,andirivieni:null},esito=null,fotosBase64=[null,null,null];
let map=null,pinBuffer='',selectedId=null;
let allFeats=[],allFeatsIds=new Set();
let filtriAttivi={circoscrizione:'',quartiere:'',upl:'',odonimo:'',genere:'',nome_scientifico:''};
let filtroStati=new Set(['ok','pending','stop','non_ispez']);
let sidebarOpen=true;
let _clusterMarkers=[],_clusterRaf=null;

// ── Cluster donut ─────────────────────────────────────────────────────────
function _buildLipuDonut(props){
  const counts=CL_KEYS.map(k=>Number(props[k])||0);
  const n=counts.reduce((s,v)=>s+v,0);
  if(!n)return'';
  const SZ=44,CX=22,CY=22,OR=20,IR=11;
  let paths='';
  if(counts.filter(v=>v>0).length>1){
    let a=-Math.PI/2;
    counts.forEach((count,idx)=>{
      if(!count)return;
      const sw=(count/n)*2*Math.PI,end=a+sw,lg=sw>Math.PI?1:0;
      const c0=Math.cos(a),s0=Math.sin(a),c1=Math.cos(end),s1=Math.sin(end);
      const col=CL_C[CL_KEYS[idx]];
      paths+=`<path d="M ${(CX+OR*c0).toFixed(2)} ${(CY+OR*s0).toFixed(2)} A ${OR} ${OR} 0 ${lg} 1 ${(CX+OR*c1).toFixed(2)} ${(CY+OR*s1).toFixed(2)} L ${(CX+IR*c1).toFixed(2)} ${(CY+IR*s1).toFixed(2)} A ${IR} ${IR} 0 ${lg} 0 ${(CX+IR*c0).toFixed(2)} ${(CY+IR*s0).toFixed(2)} Z" fill="${col}" stroke="#fff" stroke-width="0.8"/>`;
      a=end;
    });
  }else{
    const idx=counts.findIndex(v=>v>0);
    const col=idx>=0?CL_C[CL_KEYS[idx]]:'#aaa';
    paths=`<circle cx="${CX}" cy="${CY}" r="${OR}" fill="${col}"/><circle cx="${CX}" cy="${CY}" r="${IR}" fill="white"/>`;
  }
  const fs=n>99?8:10;
  return`<svg width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}" xmlns="http://www.w3.org/2000/svg">${paths}<text x="${CX}" y="${CY+4}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs}" font-weight="bold" fill="#333">${n}</text></svg>`;
}

function buildClusterGeoJSON(){
  const hasF=FORDER.some(c=>filtriAttivi[c]);
  const fids=hasF?getFilteredIds():null;
  const features=[];
  allFeats.forEach(f=>{
    if(fids&&!fids.has(f.id))return;
    const stato=statoMap[f.id]||'non_ispez';
    if(!filtroStati.has(stato))return;
    const c=coordsMap[f.id];if(!c)return;
    features.push({type:'Feature',geometry:{type:'Point',coordinates:c},properties:{id:f.id,stato}});
  });
  return{type:'FeatureCollection',features};
}

function updClusterSource(){
  if(!map||!map.getSource('cluster-src'))return;
  map.getSource('cluster-src').setData(buildClusterGeoJSON());
  scheduleClusterUpdate();
}

function scheduleClusterUpdate(){
  if(_clusterRaf)cancelAnimationFrame(_clusterRaf);
  _clusterRaf=requestAnimationFrame(()=>{_clusterRaf=null;updateClusterMarkers();});
}

function updateClusterMarkers(){
  _clusterMarkers.forEach(m=>m.remove());
  _clusterMarkers=[];
  if(!map||map.getZoom()>CLUSTER_MAX_ZOOM)return;
  const feats=map.querySourceFeatures('cluster-src',{filter:['==','cluster',true]});
  feats.forEach(f=>{
    const p=f.properties,el=document.createElement('div');
    el.className='lipu-cluster';
    el.innerHTML=_buildLipuDonut(p);
    const ttLines=CL_KEYS.map(k=>p[k]>0?`${CL_LABELS[k]}: ${p[k]}`:null).filter(Boolean);
    if(ttLines.length)el.title=(p.point_count||'')+' alberi\n'+ttLines.join('\n');
    el.addEventListener('click',e=>{
      e.stopPropagation();
      map.getSource('cluster-src').getClusterExpansionZoom(p.cluster_id)
        .then(z=>map.easeTo({center:f.geometry.coordinates,zoom:Math.min(z+0.5,18)}))
        .catch(()=>{});
    });
    _clusterMarkers.push(new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(f.geometry.coordinates).addTo(map));
  });
  map.querySourceFeatures('cluster-src',{filter:['!=','cluster',true]}).forEach(f=>{
    const stato=f.properties.stato||'non_ispez';
    const col=CL_C[stato]||'#aaa';
    const el=document.createElement('div');
    el.style.cssText=`width:10px;height:10px;border-radius:50%;background:${col};border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);pointer-events:none`;
    _clusterMarkers.push(new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(f.geometry.coordinates).addTo(map));
  });
}

function _syncLayerVisibility(){
  if(!map)return;
  const cluster=map.getZoom()<=CLUSTER_MAX_ZOOM;
  map.setPaintProperty('alberi-cerchi','circle-opacity',
    cluster?0:(filtroStati.has('non_ispez')?0.8:0));
  map.setLayoutProperty('overlay-cerchi','visibility',cluster?'none':'visible');
}

async function init(){
  buildPad();
  try{
    const r=await fetch(APPS_SCRIPT_URL);
    const d=await r.json();
    if(d.status!=='ok')throw new Error(d.error||'Errore caricamento dati');
    if(d.demoPin&&d.demoPin!=='—'){
      document.getElementById('demo-pin-val').textContent=d.demoPin;
      document.getElementById('demo-hint').style.display='flex';
    }
    (d.ispezioni||[]).forEach(x=>{
      const id=String(x.id_albero||'').trim();if(!id)return;
      if(x.esito==='NEGATIVO')statoMap[id]='ok';
      else if(x.esito==='SOSPENDERE')statoMap[id]='stop';
      else if(x.esito==='STATO DI NECESSITÀ')statoMap[id]='pending';
      if(x.timestamp)tsMap[id]=String(x.timestamp).trim();
      allIspezioni.push(x);
    });
    document.getElementById('login-loading').textContent='';
  }catch(e){
    console.error(e);
    document.getElementById('login-loading').textContent='Errore caricamento - verifica connessione';
  }
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
async function chkPin(){
  const loading=document.getElementById('login-loading');
  loading.textContent='Verifica PIN in corso...';
  try{
    const res=await fetch(APPS_SCRIPT_URL,{
      method:'POST',
      headers:{'Content-Type':'text/plain'},
      body:JSON.stringify({action:'login',pin:pinBuffer.trim()})
    });
    const d=await res.json();
    loading.textContent='';
    if(d.status==='ok'){
      currentUser=d.operator;
      const ls=document.getElementById('login-screen');ls.style.transition='opacity .4s';ls.style.opacity='0';
      setTimeout(()=>{ls.style.display='none';const tu=document.getElementById('topbar-user');tu.innerHTML='<i class="fa-solid fa-user"></i>';tu.title=currentUser.nome+' '+currentUser.cognome;document.getElementById('app').classList.add('visible');initMap();},400);
    }else{
      pinErr(d.error||'PIN non riconosciuto - riprova');
      pinBuffer='';updDots();
    }
  }catch(err){
    loading.textContent='';
    pinErr('Errore di connessione al server');
    pinBuffer='';updDots();
  }
}
function pinErr(m){const e=document.getElementById('pin-error');e.textContent=m;setTimeout(()=>{e.textContent='';},2500);}
function isDemo(){return currentUser&&String(currentUser.id_operatore||'').toUpperCase()==='OP-01';}
function doLogout(){pinBuffer='';updDots();currentUser=null;closeMobSidebar();closePanel();const ls=document.getElementById('login-screen');ls.style.display='flex';ls.style.opacity='1';document.getElementById('app').classList.remove('visible');}

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
        selected:{type:'geojson',data:{type:'FeatureCollection',features:[]}},
        'cluster-src':{type:'geojson',data:{type:'FeatureCollection',features:[]},cluster:true,clusterMaxZoom:CLUSTER_MAX_ZOOM,clusterRadius:60,clusterProperties:{ok:['+',['case',['==',['get','stato'],'ok'],1,0]],pending:['+',['case',['==',['get','stato'],'pending'],1,0]],stop:['+',['case',['==',['get','stato'],'stop'],1,0]],non_ispez:['+',['case',['==',['get','stato'],'non_ispez'],1,0]]}}
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
            'circle-opacity':0
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
        },
        {id:'cluster-invis',type:'circle',source:'cluster-src',filter:['==','cluster',true],paint:{'circle-radius':0,'circle-opacity':0}}
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
    if(nuovi){updOverlay();updSidebar();updLegend();updClusterSource();}
  }

  map.on('idle',raccogliCoords);
  map.on('moveend',raccogliCoords);
  map.on('sourcedata',e=>{if(e.sourceId==='alberi'&&e.tile)raccogliCoords();});
  map.on('load',()=>{_syncLayerVisibility();});
  map.on('zoomend',()=>{_syncLayerVisibility();scheduleClusterUpdate();});
  map.on('moveend',scheduleClusterUpdate);
  map.on('sourcedata',e=>{if(e.sourceId==='cluster-src'&&e.isSourceLoaded)scheduleClusterUpdate();});

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

  map.on('click',e=>{
    const feats=map.queryRenderedFeatures(e.point,{layers:['alberi-cerchi','overlay-cerchi']});
    if(feats.length===0&&selectedId)closePanel();
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
  if(map&&map.getZoom()<=CLUSTER_MAX_ZOOM)return;
  if(e.features[0]?.layer?.id==='alberi-cerchi'&&!filtroStati.has('non_ispez'))return;
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
  document.getElementById('firma-cap-pin').value='';
  document.getElementById('firma-cap').placeholder='In attesa del PIN...';
  document.getElementById('firma-cap').style.borderColor='';
  const isCur=currentUser.ruolo==='Curiosone';
  document.getElementById('firma-cap-pin-wrap').style.display=isCur?'none':'';
  document.getElementById('firma-cap-val-row').style.display=isCur?'none':'';
  checks={nido:null,richiami:null,andirivieni:null};esito=null;fotosBase64=[null,null,null];
  document.getElementById('p-note').value='';
  ['nido','richiami','andirivieni'].forEach(k=>rndrChk(k));
  ['neg','urg','stop'].forEach(x=>{document.getElementById('esito-'+x).className='esito-opt';});
  [0,1,2].forEach(i=>{const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';});
  updBtn();
  document.getElementById('demo-banner').style.display=isDemo()?'block':'none';
  const pdfWrap=document.getElementById('p-pdf-wrap');
  const pdfLink=document.getElementById('p-pdf-link');
  if(tsMap[id]){
    const ts=tsMap[id];
    const d=new Date(ts);
    const dataFmt=isNaN(d)?ts.slice(0,10):d.toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'});
    pdfLink.href=buildPdfUrl(id,ts);
    pdfLink.title='Ispezione del '+dataFmt;
    pdfLink.querySelector('span.pdf-label').textContent='Scheda PDF · '+dataFmt;
    pdfWrap.style.display='block';
  }else{pdfWrap.style.display='none';}
  document.getElementById('panel').classList.add('open');
  if(isMob())document.getElementById('app').classList.add('panel-open');
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  document.getElementById('app').classList.remove('panel-open');
  currentProps=null;selectedId=null;
  if(map&&map.getSource('selected'))map.getSource('selected').setData({type:'FeatureCollection',features:[]});
}

// FORM
function toggleCheck(k){checks[k]=checks[k]===null?true:checks[k]===true?false:null;rndrChk(k);updBtn();}
function rndrChk(k){const v=checks[k];document.getElementById('chk-'+k).className='check-item'+(v===true?' yes':v===false?' no':'');document.getElementById('cb-'+k).textContent=v!==null?'v':'';document.getElementById('cy-'+k).textContent=v===true?'SI':v===false?'NO':'-';}
function selectEsito(e){esito=e;['neg','urg','stop'].forEach(k=>{document.getElementById('esito-'+k).className='esito-opt'+(k===e?' selected-'+k:'');});updBtn();}
function updBtn(){
  const ok=esito!==null&&checks.nido!==null&&checks.richiami!==null&&checks.andirivieni!==null;
  const cap=document.getElementById('firma-cap').value.trim();
  const demo=isDemo();
  const isCur=currentUser&&currentUser.ruolo==='Curiosone';
  const pronto = ok && (isCur || cap !== '');
  document.getElementById('btn-invia').disabled=!pronto;
  if(demo){
    document.getElementById('send-note').textContent='Modalità DEMO – premi Invia per testare';
  }else if(!ok){
    document.getElementById('send-note').textContent='Compila esito e tutti e 3 i controlli per procedere';
  }else if(!isCur&&!cap){
    document.getElementById('send-note').textContent='Inserisci il PIN del Capocantiere per firmare';
  }else{
    document.getElementById('send-note').textContent='Dati pronti per l\'invio';
  }
}

let capVerifying=false;
async function validaFirmaCap(pin){
  const cleanPin=pin.trim();
  const capField=document.getElementById('firma-cap');
  const pinField=document.getElementById('firma-cap-pin');
  if(cleanPin.length!==5){
    capField.value='';
    capField.placeholder='In attesa del PIN (5 cifre)...';
    capField.style.borderColor='';
    updBtn();
    return;
  }
  if(capVerifying)return;
  capVerifying=true;
  capField.placeholder='Verifica in corso...';
  capField.value='';
  try{
    const res=await fetch(APPS_SCRIPT_URL,{
      method:'POST',
      headers:{'Content-Type':'text/plain'},
      body:JSON.stringify({action:'login',pin:cleanPin})
    });
    const d=await res.json();
    capVerifying=false;
    if(d.status==='ok'){
      const op=d.operator;
      capField.value=op.nome+' '+op.cognome;
      capField.style.borderColor='var(--green-light)';
      pinField.blur();
    }else{
      capField.value='';
      capField.placeholder=d.error||'PIN non valido';
      capField.style.borderColor='var(--red)';
    }
  }catch(err){
    capVerifying=false;
    capField.placeholder='Errore di connessione';
    capField.style.borderColor='var(--red)';
  }
  updBtn();
}

// FOTO
function triggerFoto(i){document.getElementById('fi-'+i).click();}
async function resizeFoto(file,mx){return new Promise(res=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,mx/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.80).split(',')[1]);};img.src=url;});}
async function loadFoto(i,inp){const f=inp.files[0];if(!f)return;const s=document.getElementById('fs-'+i);s.className='foto-slot has-img';let el=s.querySelector('img');if(!el){el=document.createElement('img');s.appendChild(el);}el.src=URL.createObjectURL(f);fotosBase64[i]=await resizeFoto(f,1200);}
function removeFoto(ev,i){ev.stopPropagation();const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';fotosBase64[i]=null;}

// INVIA
async function inviaScheda(){
  if(isDemo()){showToast('Modalità DEMO – invio non disponibile','error');return;}
  const isCur=currentUser&&currentUser.ruolo==='Curiosone';
  const cap=isCur?'':document.getElementById('firma-cap').value.trim();
  if(!isCur&&!cap){showToast('Inserisci la firma del capocantiere','error');return;}
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
    lat_albero:coordsMap[id]?coordsMap[id][1]:'',
    lon_albero:coordsMap[id]?coordsMap[id][0]:'',
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
    updOverlay();updClusterSource();
    const msgs={neg:'Scheda inviata - si procede al taglio',stop:'Scheda inviata - lavori sospesi',urg:'Scheda inviata - attesa autorizzazione D.L.'};
    showToast(msgs[esito]||'Scheda inviata','success');
    btn.textContent='Inviata';
    setTimeout(()=>closePanel(),1800);
  }catch(err){showToast('Errore: '+err.message,'error');btn.disabled=false;btn.textContent='Invia scheda';}
}

function showToast(msg,type){const t=document.getElementById('toast');t.textContent=msg;t.className=type||'';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

function buildPdfUrl(id,ts){
  const idSafe=id.replace(/\s+/g,'_');
  const tsF=ts.replace(/[:.]/g,'-').replace('T','_').slice(0,19);
  return'https://raw.githubusercontent.com/PalermoHub/Verde_Urbano/main/Lipu/schede_pdf/'+idSafe+'_'+tsF+'.pdf';
}

function openMieSchede(){
  const opId=currentUser&&currentUser.id_operatore;
  const mie=allIspezioni.filter(x=>x.id_operatore===opId).slice().reverse();
  const ESITO_LABEL={'NEGATIVO':'Negativo','SOSPENDERE':'Sospendere','STATO DI NECESSITÀ':'Stato di necessità'};
  const ESITO_CLS={'NEGATIVO':'ms-ok','SOSPENDERE':'ms-stop','STATO DI NECESSITÀ':'ms-pend'};
  let rows='';
  if(!mie.length){
    rows='<div class="ms-empty">Nessuna scheda inviata.</div>';
  }else{
    mie.forEach(x=>{
      const ts=x.timestamp||'';
      const d=ts?new Date(ts):null;
      const dataFmt=d&&!isNaN(d)?d.toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}):ts.slice(0,10);
      const oraFmt=d&&!isNaN(d)?d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'';
      const esito=x.esito||'-';
      const cls=ESITO_CLS[esito]||'';
      const label=ESITO_LABEL[esito]||esito;
      const pdfHref=x.url_pdf||(ts?buildPdfUrl(x.id_albero,ts):'');
      const pdfBtn=pdfHref
        ?`<a href="${pdfHref}" target="_blank" rel="noopener" class="ms-pdf-btn" title="Apri scheda PDF">PDF</a>`
        :`<span class="ms-pdf-btn ms-pdf-na">PDF</span>`;
      rows+=`<div class="ms-row">
        <div class="ms-cell ms-date"><div>${dataFmt}</div><div class="ms-ora">${oraFmt}</div></div>
        <div class="ms-cell ms-id">${x.id_albero}</div>
        <div class="ms-cell"><span class="ms-badge ${cls}">${label}</span></div>
        <div class="ms-cell ms-pdf">${pdfBtn}</div>
      </div>`;
    });
  }
  document.getElementById('ms-body').innerHTML=rows;
  document.getElementById('ms-count').textContent=mie.length+' scheda'+(mie.length===1?'':'e');
  document.getElementById('modal-schede').classList.add('open');
}
function closeMieSchede(){document.getElementById('modal-schede').classList.remove('open');}

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
  updStatsSidebar();
}

function fitBoundsToVisible(){
  const feats=getFilteredFeats();
  const bounds=new maplibregl.LngLatBounds();
  let count=0;
  feats.forEach(f=>{
    const c=coordsMap[f.id];if(!c)return;
    const stato=statoMap[f.id]||'non_ispez';
    if(!filtroStati.has(stato))return;
    bounds.extend(c);count++;
  });
  if(count===0)return;
  map.fitBounds(bounds,{padding:60,maxZoom:17,duration:600});
}

function applyFiltriMappa(){
  if(!map)return;
  const hasF=FORDER.some(c=>filtriAttivi[c]);
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
  _syncLayerVisibility();
  updClusterSource();
  fitBoundsToVisible();
}

const STATI_ALL=new Set(['ok','pending','stop','non_ispez']);
function toggleStato(s){
  if(filtroStati.size===1&&filtroStati.has(s)){filtroStati=new Set(STATI_ALL);}
  else{filtroStati=new Set([s]);}
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
  updStatsSidebar();
}

function isMob(){return window.innerWidth<=640;}

function closeMobSidebar(){
  document.getElementById('sidebar').classList.remove('mob-open');
  document.getElementById('mob-backdrop').classList.remove('show');
  setTimeout(()=>map&&map.resize(),320);
}

function toggleSidebar(){
  if(isMob()){
    const open=document.getElementById('sidebar').classList.toggle('mob-open');
    document.getElementById('mob-backdrop').classList.toggle('show',open);
    setTimeout(()=>map&&map.resize(),320);
    return;
  }
  sidebarOpen=!sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed',!sidebarOpen);
  const fbtn=document.getElementById('filter-toggle-btn');
  if(fbtn)fbtn.classList.toggle('active',sidebarOpen);
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
function tbFullscreen(){
  if(!document.fullscreenElement){document.documentElement.requestFullscreen().catch(()=>{});}
  else{document.exitFullscreen();}
}
document.addEventListener('fullscreenchange',()=>{
  const btn=document.getElementById('tb-fs');if(!btn)return;
  const fs=!!document.fullscreenElement;
  btn.title=fs?'Esci da schermo intero':'Schermo intero';
  document.getElementById('tb-fs-svg').innerHTML=fs
    ?'<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>'
    :'<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
});
function tbSearch(){
  if(isMob()){toggleSidebar();return;}
  if(!sidebarOpen)toggleSidebar();
  const el=document.getElementById('f-circoscrizione');if(el)el.focus();
}
function tbZoom(v){map&&map.setZoom(Number(v));}

// ── Stats Sidebar destra ──────────────────────────────────────
const SS_C = 2 * Math.PI * 45;
const SS_COLORS = {ok:'#40916C',pending:'#E76F00',stop:'#C1121F',non_ispez:'#9a9a90'};
const SS_LABELS = {ok:'Ispezionato OK',pending:'Stato di necessità',stop:'Lavori sospesi',non_ispez:'Non ispezionato'};
const SS_ORDER = ['ok','pending','stop','non_ispez'];

function toggleStatsSidebar(){
  const el=document.getElementById('stats-sidebar');
  const btn=document.getElementById('stats-toggle-btn');
  if(isMob()){
    const open=el.classList.toggle('ss-open');
    btn.classList.toggle('active',open);
    setTimeout(()=>map&&map.resize(),320);
  }else{
    const nowHidden=el.classList.toggle('ss-hidden');
    btn.classList.toggle('active',!nowHidden);
    setTimeout(()=>map&&map.resize(),320);
  }
}

function updRankList(id,items,maxItems){
  maxItems=maxItems||5;
  const el=document.getElementById(id);if(!el)return;
  if(!items.length){el.innerHTML='<div class="ss-rank-empty">Nessun dato</div>';return;}
  const top=items.slice(0,maxItems);
  const maxVal=top[0].count;
  el.innerHTML=top.map(function(d){
    const pct=maxVal>0?Math.round(d.count/maxVal*100):0;
    return'<div class="ss-rank-row">'+
      '<span class="ss-rank-label" title="'+d.label+'">'+d.label+'</span>'+
      '<div class="ss-rank-bar-wrap"><div class="ss-rank-bar" style="width:'+pct+'%"></div></div>'+
      '<span class="ss-rank-count">'+d.count+'</span>'+
      '</div>';
  }).join('');
}

function updDonut(counts){
  const total=SS_ORDER.reduce(function(s,k){return s+(counts[k]||0);},0);
  const svg=document.getElementById('ss-donut');if(!svg)return;
  svg.querySelectorAll('.ss-seg').forEach(function(e){e.remove();});
  const g=svg.querySelector('g');
  let prev=0;
  if(total>0){
    SS_ORDER.forEach(function(s){
      const val=counts[s]||0;if(!val)return;
      const len=(val/total)*SS_C;
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('class','ss-seg');
      c.setAttribute('cx','60');c.setAttribute('cy','60');c.setAttribute('r','45');
      c.setAttribute('fill','none');
      c.setAttribute('stroke',SS_COLORS[s]);
      c.setAttribute('stroke-width','18');
      c.setAttribute('stroke-dasharray',len+' '+(SS_C-len));
      c.setAttribute('stroke-dashoffset',SS_C-prev);
      g.appendChild(c);
      prev+=len;
    });
  }
  const inspected=(counts.ok||0)+(counts.pending||0)+(counts.stop||0);
  const pct=total>0?Math.round(inspected/total*100):0;
  const pctEl=document.getElementById('ss-donut-pct');
  if(pctEl)pctEl.textContent=pct+'%';
  const legend=document.getElementById('ss-donut-legend');if(!legend)return;
  legend.innerHTML=SS_ORDER.map(function(s){
    const val=counts[s]||0;
    return'<div class="donut-legend-item">'+
      '<div class="donut-dot" style="background:'+SS_COLORS[s]+'"></div>'+
      '<span class="donut-lbl">'+SS_LABELS[s]+'</span>'+
      '<span class="donut-cnt">'+val+'</span>'+
      '</div>';
  }).join('');
}

function updStatsSidebar(){
  if(!allFeats.length)return;
  const hasF=FORDER.some(function(c){return filtriAttivi[c];});
  const filtered=hasF?getFilteredFeats():allFeats;
  const elTot=document.getElementById('ss-total');
  const elFilt=document.getElementById('ss-filtered');
  const elSpec=document.getElementById('ss-species');
  if(elTot)elTot.textContent=allFeats.length;
  if(elFilt)elFilt.textContent=filtered.length;
  if(elSpec){
    const sp=new Set(filtered.map(function(f){return f.nome_sci;}).filter(Boolean));
    elSpec.textContent=sp.size;
  }
  function countBy(field,base){
    const m={};
    (base||[]).forEach(function(f){const v=f[field];if(v)m[v]=m[v]||0;});
    filtered.forEach(function(f){const v=f[field];if(v)m[v]=(m[v]||0)+1;});
    return Object.entries(m).map(function(e){return{label:e[0],count:e[1]};}).sort(function(a,b){return b.count-a.count;});
  }
  const elVie=document.getElementById('ss-vie');
  if(elVie){
    const vie=new Set(filtered.map(function(f){return f.odon;}).filter(Boolean));
    elVie.textContent=vie.size;
  }
  updRankList('ss-upl',countBy('upl'));
  updRankList('ss-quart',countBy('quart'));
  updRankList('ss-circ',countBy('circ',allFeats),8);
  const counts={ok:0,pending:0,stop:0,non_ispez:0};
  filtered.forEach(function(f){
    const s=statoMap[f.id]||'non_ispez';
    if(counts[s]!==undefined)counts[s]++;else counts.non_ispez++;
  });
  updDonut(counts);
}

/* Stats sidebar: attiva su desktop di default, chiusa su mobile */
(function(){
  if(!isMob()){
    const btn=document.getElementById('stats-toggle-btn');
    if(btn)btn.classList.add('active');
  }
})();

init();