
const CSV_OPERATORI='https://docs.google.com/spreadsheets/d/e/2PACX-1vR9A6NCjRN8wkbUoctx9W4p07kckFmqLwVaySZtPcEDGA5KAXD5_mXsnTSyS1IAaZay9eR-j5EbocDt/pub?gid=775899245&single=true&output=csv';
const CSV_ALBERI='https://docs.google.com/spreadsheets/d/e/2PACX-1vR9A6NCjRN8wkbUoctx9W4p07kckFmqLwVaySZtPcEDGA5KAXD5_mXsnTSyS1IAaZay9eR-j5EbocDt/pub?gid=25053895&single=true&output=csv';
const CSV_ISPEZIONI='https://docs.google.com/spreadsheets/d/e/2PACX-1vR9A6NCjRN8wkbUoctx9W4p07kckFmqLwVaySZtPcEDGA5KAXD5_mXsnTSyS1IAaZay9eR-j5EbocDt/pub?gid=921930186&single=true&output=csv';
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxQ4Qqmyee_rzLeU9ayc9gWgTDHVkTD_fwP7XmqXfxyQ8ube2Aq-759KjnWe3t3DdqBgQ/exec';
const PMTILES_LAYER='dati_alberi';

let operatori=[],alberiMap={},statoMap={},currentUser=null,currentAlbero=null;
let checks={nido:null,richiami:null,andirivieni:null},esito=null,fotosBase64=[null,null,null];
let map=null,pinBuffer='';

function pLine(l){const o=[];let f='',inQ=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'){if(inQ&&l[i+1]==='"'){f+='"';i++;}else inQ=!inQ;}else if(c===','&&!inQ){o.push(f);f='';}else f+=c;}o.push(f);return o;}
function pCSV(t){const ls=t.trim().split('\n');if(ls.length<2)return[];const h=pLine(ls[0]).map(x=>x.trim());return ls.slice(1).map(l=>Object.fromEntries(h.map((k,i)=>[k,(pLine(l)[i]||'').trim()]))).filter(r=>Object.values(r).some(v=>v!==''));}

async function init(){
  buildPad();
  try{
    const[a,b,c]=await Promise.all([fetch(CSV_OPERATORI),fetch(CSV_ALBERI),fetch(CSV_ISPEZIONI)]);
    operatori=pCSV(await a.text()).filter(r=>r.attivo==='SI');
    pCSV(await b.text()).forEach(x=>{alberiMap[String(x['ID albero']).trim()]=x;});
    pCSV(await c.text()).forEach(x=>{
      const id=String(x.id_albero||'').trim();if(!id)return;
      if(x.esito==='NEGATIVO')statoMap[id]='ok';
      else if(x.esito==='SOSPENDERE')statoMap[id]='stop';
      else if(x.esito==='STATO DI NECESSITÀ')statoMap[id]='pending';
    });
    document.getElementById('login-loading').textContent='';
  }catch(e){document.getElementById('login-loading').textContent='Errore caricamento — verifica connessione';}
}

function buildPad(){
  const pad=document.getElementById('pin-pad');
  [1,2,3,4,5,6,7,8,9,'X',0,'OK'].forEach(k=>{
    const b=document.createElement('button');b.className='pin-btn';b.textContent=k;
    b.onclick=()=>handlePin(k);pad.appendChild(b);
  });
}
function handlePin(k){if(k==='X'){pinBuffer='';updDots();return;}if(k==='OK'){chkPin();return;}pinBuffer+=String(k);updDots();}
function updDots(){const c=document.getElementById('pin-dots');c.innerHTML='';const n=Math.max(pinBuffer.length,1);for(let i=0;i<n;i++){const d=document.createElement('div');d.className='pin-dot'+(i<pinBuffer.length?' filled':'');c.appendChild(d);}}
function chkPin(){
  if(!operatori.length){pinErr('Dati non ancora caricati — attendi...');return;}
  const op=operatori.find(o=>String(o.pin).trim()===pinBuffer.trim());
  if(op){currentUser=op;const ls=document.getElementById('login-screen');ls.style.transition='opacity .4s';ls.style.opacity='0';
    setTimeout(()=>{ls.style.display='none';document.getElementById('topbar-user').textContent=op.nome+' '+op.cognome;document.getElementById('app').classList.add('visible');initMap();},400);
  }else{pinErr('PIN non riconosciuto — riprova');pinBuffer='';updDots();}
}
function pinErr(m){const e=document.getElementById('pin-error');e.textContent=m;setTimeout(()=>{e.textContent='';},2500);}
function doLogout(){pinBuffer='';updDots();currentUser=null;const ls=document.getElementById('login-screen');ls.style.display='flex';ls.style.opacity='1';document.getElementById('app').classList.remove('visible');closePanel();}

function initMap(){
  const protocol=new pmtiles.Protocol();
  maplibregl.addProtocol('pmtiles',protocol.tile);
  const pmUrl='pmtiles://'+new URL('dati/dati_alberi.pmtiles',document.baseURI).href;
  map=new maplibregl.Map({
    container:'map',
    style:{
      version:8,
      glyphs:'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources:{
        carto:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap © CartoDB'},
        alberi:{type:'vector',url:pmUrl},
        overlay:{type:'geojson',data:{type:'FeatureCollection',features:[]}}
      },
      layers:[
        {id:'basemap',type:'raster',source:'carto'},
        {id:'alberi-cerchi',type:'circle',source:'alberi','source-layer':PMTILES_LAYER,
          paint:{'circle-radius':['interpolate',['linear'],['zoom'],10,4,15,9,18,14],'circle-color':'#aaaaaa','circle-stroke-width':2,'circle-stroke-color':'#ffffff','circle-opacity':0.85}},
        {id:'overlay-cerchi',type:'circle',source:'overlay',
          paint:{'circle-radius':['interpolate',['linear'],['zoom'],10,4,15,9,18,14],'circle-color':['get','colore'],'circle-stroke-width':2,'circle-stroke-color':'#ffffff','circle-opacity':0.95}}
      ]
    },
    center:[13.358,38.119],zoom:13
  });
  map.addControl(new maplibregl.NavigationControl(),'top-right');
  map.on('load',()=>{
    const b=new maplibregl.LngLatBounds();
    Object.values(alberiMap).forEach(a=>{const la=parseFloat(a['Lat']),lo=parseFloat(a['Long']);if(!isNaN(la)&&!isNaN(lo))b.extend([lo,la]);});
    if(!b.isEmpty())map.fitBounds(b,{padding:40,maxZoom:16});
    updOverlay();
  });
  ['alberi-cerchi','overlay-cerchi'].forEach(l=>{
    map.on('click',l,apriClick);
    map.on('mouseenter',l,()=>{map.getCanvas().style.cursor='pointer';});
    map.on('mouseleave',l,()=>{map.getCanvas().style.cursor='';});
  });
}
function apriClick(e){const p=e.features[0].properties;const id=String(p['ID albero']||p['ID_albero']||p['id_albero']||p['id']||'').trim();if(id)openScheda(id);}
function updOverlay(){
  if(!map||!map.getSource('overlay'))return;
  const C={ok:'#40916C',pending:'#E76F00',stop:'#C1121F'};
  const feats=Object.entries(statoMap).map(([id,s])=>{
    const a=alberiMap[id];if(!a)return null;
    const la=parseFloat(a['Lat']),lo=parseFloat(a['Long']);if(isNaN(la)||isNaN(lo))return null;
    return{type:'Feature',geometry:{type:'Point',coordinates:[lo,la]},properties:{id_albero:id,colore:C[s]||'#aaa'}};
  }).filter(Boolean);
  map.getSource('overlay').setData({type:'FeatureCollection',features:feats});
}

function openScheda(id){
  const a=alberiMap[id];if(!a){showToast('Albero '+id+' non trovato','error');return;}
  currentAlbero=a;
  const now=new Date(),sp=a['Nome scientifico'],via=a['Odonimo'];
  document.getElementById('p-specie').textContent=sp;document.getElementById('p-via').textContent=via;
  document.getElementById('p-id').textContent=id;document.getElementById('p-specie2').textContent=sp;
  document.getElementById('p-via2').textContent=via;
  document.getElementById('p-data').textContent=now.toLocaleDateString('it-IT');
  document.getElementById('p-ora').textContent=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('firma-op').value=currentUser.nome+' '+currentUser.cognome;
  document.getElementById('firma-cap').value='';
  checks={nido:null,richiami:null,andirivieni:null};esito=null;fotosBase64=[null,null,null];
  document.getElementById('p-note').value='';
  ['nido','richiami','andirivieni'].forEach(k=>rndrChk(k));
  ['neg','urg','stop'].forEach(x=>{document.getElementById('esito-'+x).className='esito-opt';});
  [0,1,2].forEach(i=>{const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';});
  updBtn();document.getElementById('panel').classList.add('open');
}
function closePanel(){document.getElementById('panel').classList.remove('open');currentAlbero=null;}
function toggleCheck(k){checks[k]=checks[k]===null?true:checks[k]===true?false:null;rndrChk(k);updBtn();}
function rndrChk(k){const v=checks[k];document.getElementById('chk-'+k).className='check-item'+(v===true?' yes':v===false?' no':'');document.getElementById('cb-'+k).textContent=v!==null?'v':'';document.getElementById('cy-'+k).textContent=v===true?'SI':v===false?'NO':'-';}
function selectEsito(e){esito=e;['neg','urg','stop'].forEach(k=>{document.getElementById('esito-'+k).className='esito-opt'+(k===e?' selected-'+k:'');});updBtn();}
function updBtn(){const ok=esito!==null&&checks.nido!==null&&checks.richiami!==null&&checks.andirivieni!==null;document.getElementById('btn-invia').disabled=!ok;document.getElementById('send-note').textContent=ok?'Dati pronti - aggiungi firma capocantiere e invia':'Compila esito e tutti e 3 i controlli per procedere';}

function triggerFoto(i){document.getElementById('fi-'+i).click();}
async function resizeFoto(file,mx){return new Promise(res=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,mx/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.80).split(',')[1]);};img.src=url;});}
async function loadFoto(i,inp){const f=inp.files[0];if(!f)return;const s=document.getElementById('fs-'+i);s.className='foto-slot has-img';let el=s.querySelector('img');if(!el){el=document.createElement('img');s.appendChild(el);}el.src=URL.createObjectURL(f);fotosBase64[i]=await resizeFoto(f,1200);}
function removeFoto(ev,i){ev.stopPropagation();const s=document.getElementById('fs-'+i);s.className='foto-slot';const img=s.querySelector('img');if(img)img.remove();document.getElementById('fi-'+i).value='';fotosBase64[i]=null;}

async function inviaScheda(){
  const cap=document.getElementById('firma-cap').value.trim();if(!cap){showToast('Inserisci la firma del capocantiere','error');return;}
  const btn=document.getElementById('btn-invia');btn.disabled=true;btn.textContent='Invio in corso...';
  const EL={neg:'NEGATIVO',stop:'SOSPENDERE',urg:'STATO DI NECESSITÀ'};
  const ts=new Date().toISOString(),idS=String(currentAlbero['ID albero']).trim().replace(/\s+/g,'_');
  const payload={timestamp:ts,id_albero:currentAlbero['ID albero'],specie:currentAlbero['Nome scientifico'],via:currentAlbero['Odonimo'],id_operatore:currentUser.id_operatore,nome_operatore:currentUser.nome+' '+currentUser.cognome,ruolo_operatore:currentUser.ruolo,ora_controllo:document.getElementById('p-ora').textContent,nido_visibile:checks.nido===true?'Si':'No',richiami:checks.richiami===true?'Si':'No',andirivieni:checks.andirivieni===true?'Si':'No',esito:EL[esito],note:document.getElementById('p-note').value.trim(),firma_operatore:document.getElementById('firma-op').value.trim(),firma_capocantiere:cap,foto:fotosBase64.filter(Boolean),id_safe:idS};
  try{
    const r=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});
    const d=await r.json();if(d.status!=='ok')throw new Error(d.error||'Errore sconosciuto');
    statoMap[String(currentAlbero['ID albero'])]={neg:'ok',stop:'stop',urg:'pending'}[esito];updOverlay();
    const msgs={neg:'Scheda inviata - si procede al taglio',stop:'Scheda inviata - lavori sospesi',urg:'Scheda inviata - attesa autorizzazione D.L.'};
    showToast(msgs[esito]||'Scheda inviata','success');btn.textContent='Inviata';setTimeout(()=>closePanel(),1800);
  }catch(err){showToast('Errore: '+err.message,'error');btn.disabled=false;btn.textContent='Invia scheda';}
}

function showToast(msg,type){const t=document.getElementById('toast');t.textContent=msg;t.className=type||'';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

init();
