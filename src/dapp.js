// ── Config ──
var SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

// ── State ──
var _session=null;
var _balance=0;
var _publicMode=false; // true when viewing public pages without auth
var ARIA_EUR=0.10; // 1 ARIA = €0.10 (interno, usato per ROBI e ABO)
function eur(aria){return '€'+(aria*ARIA_EUR).toFixed(2).replace('.',',')}
function escHtml(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'';}
function tokIcon(t,sz){
  sz=sz||14;
  var c=t==='ARIA'?'#4A9EFF':t==='ROBI'?'#EF3E4F':t==='KAS'?'#49EACB':'var(--gray-500)';
  var l=t==='ARIA'?'A':t==='ROBI'?'R':t==='KAS'?'K':'?';
  return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 16 16" style="vertical-align:-2px;flex-shrink:0;display:inline-block"><circle cx="8" cy="8" r="7" fill="none" stroke="'+c+'" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="'+c+'" font-size="9" font-weight="700" font-family="Instrument Sans,sans-serif">'+l+'</text></svg>';
}

var CAT_ICONS={
  smartphone:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
  tablet:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>',
  computer:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="12" rx="1"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/></svg>',
  gaming:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11h4M8 9v4"/><path d="M2 13a2 2 0 002 2h2l2 3h4l2-3h2a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v4z"/></svg>',
  audio:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>',
  fotografia:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  orologi:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  gioielli:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12l4 7-10 11L2 10z"/><path d="M2 10h20M12 21L8 10l4-7 4 7z"/></svg>',
  borse:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V6a4 4 0 018 0v2"/></svg>',
  moda:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L8 6h8l-4-4zM8 6v4c0 2 1 4 4 4s4-2 4-4V6M8 22h8M10 14v8M14 14v8"/></svg>',
  biciclette:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h4l4 8M10 8l2 8"/></svg>',
  arredamento:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6"/><rect x="9" y="9" width="6" height="4"/></svg>',
  sport:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 000 18M12 3a14.5 14.5 0 010 18M3 12h18"/></svg>',
  strumenti:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  arte:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="11.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12" r="1.5"/><path d="M12 22a10 10 0 110-20 10 10 0 010 20z"/></svg>',
  vino:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l-1 7a5 5 0 01-3 4.5 5 5 0 01-3-4.5L8 2zM12 13.5V21M8 21h8"/></svg>'
};

// UI icons (Lucide-style, monochrome, currentColor). Never use colored emoji in UI.
var UI_ICONS={
  // Fiore-ROBI (Skeezu 10 lug): il ROBI che raccogli sul percorso — petali + R nel cuore
  flower:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 13.5V21"/><path d="M12 18.2c-2.6-.3-4.1-1.6-4.5-3.8"/><circle cx="12" cy="4.6" r="1.8"/><circle cx="16.6" cy="8" r="1.8"/><circle cx="14.9" cy="12.6" r="1.8"/><circle cx="9.1" cy="12.6" r="1.8"/><circle cx="7.4" cy="8" r="1.8"/><circle cx="12" cy="8.8" r="2.7"/><text x="12" y="10.6" text-anchor="middle" font-size="4.6" font-weight="700" fill="currentColor" stroke="none" font-family="Inter,sans-serif">R</text></svg>',
  // Orme-STEP: l'unità di misura della distanza dalla vetta
  steps:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5.2" y="12.6" width="4.6" height="7.4" rx="2.3" transform="rotate(14 7.5 16.3)"/><rect x="14" y="3.8" width="4.6" height="7.4" rx="2.3" transform="rotate(14 16.3 7.5)"/></svg>',
  target:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  trophy:'<svg class="ico" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  gem:'<svg class="ico" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
  bulb:'<svg class="ico" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  ban:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',
  star:'<svg class="ico" viewBox="0 0 24 24"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/></svg>',
  zap:'<svg class="ico" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  alert:'<svg class="ico" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  up:'<svg class="ico" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>'
};

async function loadRobiPrice(){
  // bug 2 (Mary, 15 lug 2026): treasury_funds e' leggibile solo dagli admin —
  // per gli utenti normali il calcolo tornava 0 e il valore ROBI/KAS spariva.
  // Fonte universale: snapshot orario (formula unica ABO), RPC aperta anche anon.
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_robi_snapshots_recent',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_limit:1})});
    if(res.ok){var d=await res.json();var last=(d&&d.length)?d[0]:null;var p=last?parseFloat(last.price_eur):0;if(p>0)_robiPrice=p;}
  }catch(e){}
}


/* ── punto 7 (15 lug 2026): fase dell'airdrop chiara ed evidente ── */

/* ── punto 12 (15 lug 2026): estensione timer lato venditore ── */
function buildExtendBox(a){
  try{
    var uid=_session&&_session.user&&_session.user.id;
    if(!uid||(a.submitted_by!==uid&&a.created_by!==uid))return '';
    if(['presale','sale','active'].indexOf(a.status)<0)return '';
    var n=(a.extensions_count||0);
    if(n>=5)return '<div style="margin:6px 0 4px;font-family:var(--font-m);font-size:10px;color:var(--gray-500)"><span class="it">Estensioni esaurite (5/5)</span><span class="en">Extensions used up (5/5)</span></div>';
    var cost=n===0?5:(n===1?10:15);
    var hours=n===0?72:24;
    return '<div style="margin:6px 0 4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      +'<button onclick="doExtendAirdrop(\''+a.id+'\')" style="background:none;border:1px solid var(--gold);color:var(--gold);padding:8px 16px;font-family:var(--font-m);font-size:10px;letter-spacing:1px;cursor:pointer;border-radius:10px;font-weight:700">&#8987; <span class="it">ESTENDI LA CORSA +'+hours+'H · '+cost+' ARIA</span><span class="en">EXTEND THE CLIMB +'+hours+'H · '+cost+' ARIA</span></button>'
      +'<span style="font-family:var(--font-m);font-size:9px;color:var(--gray-500)">'+(5-n)+'/5 <span class="it">disponibili</span><span class="en">left</span></span>'
      +'</div>';
  }catch(e){return '';}
}
async function doExtendAirdrop(id){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var token=await getValidToken();
  var res=await fetch(SB_URL+'/rest/v1/rpc/extend_airdrop_deadline',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_airdrop_id:id})});
  var d=await res.json().catch(function(){return {}});
  if(d&&d.ok){
    showToast((lang==='it'?'Corsa estesa di ':'Extended by ')+d.hours_added+'h · '+d.aria_spent+' ARIA','success');
    if(typeof loadAirdropDetail==='function')loadAirdropDetail(id);
    else location.reload();
  }else{
    var msg={MAX_EXTENSIONS:lang==='it'?'Hai già usato le 5 estensioni.':'All 5 extensions used.',INSUFFICIENT_ARIA:lang==='it'?'ARIA insufficienti.':'Not enough ARIA.',NOT_SELLER:lang==='it'?'Solo il venditore può estendere.':'Seller only.'}[d&&d.error]||(lang==='it'?'Estensione non riuscita.':'Extension failed.');
    showToast(msg,'warning');
  }
}

function buildPhaseStepper(a){
  var st=a.status;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(st==='annullato'){
    return '<div class="phase-strip cancelled"><span class="it">✕ AIRDROP ANNULLATO — ARIA dei partecipanti rimborsati</span><span class="en">✕ AIRDROP CANCELLED — participants refunded</span></div>';
  }
  var PH=[
    {k:'val', it:'Valutazione', en:'Evaluation', match:['draft','in_valutazione','valutazione_completata','accettato']},
    {k:'pre', it:'Presale',     en:'Presale',    match:['presale']},
    {k:'run', it:'In corsa',    en:'Climbing',   match:['sale','active']},
    {k:'chi', it:'Chiusura',    en:'Closing',    match:['waiting_seller_acknowledge','pending_seller_decision','dropped','closed']},
    {k:'fin', it:'Completato',  en:'Completed',  match:['completed']}
  ];
  var idx=0;
  for(var i=0;i<PH.length;i++){if(PH[i].match.indexOf(st)>-1){idx=i;break;}}
  var html='<div class="phase-strip" role="list" aria-label="Fase airdrop">';
  for(var j=0;j<PH.length;j++){
    var cls=j<idx?'done':(j===idx?'now':'todo');
    html+='<span class="phase-step '+cls+'" role="listitem">'
      +(j<idx?'<span class="phase-check">✓</span>':'<span class="phase-dot"></span>')
      +'<span class="it">'+PH[j].it+'</span><span class="en">'+PH[j].en+'</span></span>';
    if(j<PH.length-1)html+='<span class="phase-sep '+(j<idx?'done':'')+'"></span>';
  }
  html+='</div>';
  return html;
}

function calcMiningRate(a){
  // Treasury-based: blocchi per 1 ROBI
  if(_robiPrice>0&&a.total_blocks>0&&a.block_price_aria>0){
    var treasuryPrevisto=a.total_blocks*a.block_price_aria*ARIA_EUR*0.22;
    var maxRobi=treasuryPrevisto/_robiPrice;
    if(maxRobi>0)return Math.max(1,Math.ceil(a.total_blocks/maxRobi));
  }
  return Math.max(1,Math.ceil((a.object_value_eur||500)/100));
}

var _robi=0;
function updateBalanceUI(){
  var ariaEl=document.getElementById('topbar-aria-val');
  var robiEl=document.getElementById('topbar-robi-val');
  if(ariaEl)ariaEl.textContent=_balance;
  if(robiEl)robiEl.textContent=_robi;
}
var _airdrops=[];
var _myParts=[];
var _myRanks={}; // {airdrop_id: {rank, total, score}}
var _myRobiByAirdrop={}; // {airdrop_id: {shares, sources, consolation_rank}} · Atto 6 reveal
var _robiPrice=0; // treasury×0.999/robi_circolanti
var _currentFilter='all';
var _currentSort='deadline';
var _searchQuery='';
var _searchDebounce=null;
var _currentDetail=null;
var _pendingBuy=null;
var _isAdmin=false;
var _isManager=false;
var _managerCats=[];
var _allAirdrops=[];
var _boFilter='in_valutazione';
var _boTarget=null;
var _watchlist=[];
var _countdownInterval=null;
var _positionInterval=null;
var _lastPosition=null;

// ── Supabase helpers ──
async function sbGet(path,token){
  var h={'apikey':SB_KEY,'Authorization':'Bearer '+(token||SB_KEY)};
  var res=await fetch(SB_URL+'/rest/v1/'+path,{headers:h});
  return res.ok?await res.json():[];
}

async function sbRpc(fn,body,token){
  var res=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{
    method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify(body)
  });
  if(!res.ok){
    var errText=await res.text();
    console.error('RPC error',res.status,errText);
    return {ok:false,error:'HTTP_'+res.status,detail:errText};
  }
  return res.json();
}

// ── Session ──
function getSession(){
  try{return JSON.parse(localStorage.getItem('airoobi_session'))}catch(e){return null}
}

function requireAuth(){
  _session=getSession();
  if(!_session){
    window.location.href='/login';
    return false;
  }
  return true;
}

function doLogout(){
  localStorage.removeItem('airoobi_session');
  window.location.href=_isApp?'/':'https://airoobi.com';
}

// ── Export user data (GS-4 · GDPR Art. 20 portability) ──
async function doExportUserData(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var btn=document.getElementById('exportdata-btn');
  var errEl=document.getElementById('exportdata-error');
  var originalLabel=btn.innerHTML;
  btn.disabled=true;
  btn.textContent=lang==='it'?'Esportazione...':'Exporting...';
  errEl.style.display='none';
  try{
    var token=await getValidToken();
    if(!token)throw new Error('no_token');
    var res=await fetch(SB_URL+'/rest/v1/rpc/export_user_data',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:'{}'
    });
    var data=await res.json();
    if(!data||data.ok===false){
      var error=data&&data.error?data.error:'unknown';
      errEl.textContent=lang==='it'?'Errore: '+error:'Error: '+error;
      errEl.style.display='block';
      return;
    }
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var d=new Date();
    var ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
    var a=document.createElement('a');
    a.href=url;
    a.download='airoobi-export-'+ymd+'.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){
    errEl.textContent=lang==='it'?'Errore di rete. Riprova.':'Network error. Try again.';
    errEl.style.display='block';
  }finally{
    btn.disabled=false;
    btn.innerHTML=originalLabel;
  }
}

// ── Delete account ──
function showDeleteAccount(){
  document.getElementById('deleteaccount-modal').classList.add('active');
  document.getElementById('deleteaccount-confirm').value='';
  document.getElementById('deleteaccount-error').style.display='none';
}
function closeDeleteAccount(){
  document.getElementById('deleteaccount-modal').classList.remove('active');
}
async function doDeleteAccount(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var confirmVal=document.getElementById('deleteaccount-confirm').value.trim().toUpperCase();
  var expected=lang==='it'?'ELIMINA':'DELETE';
  if(confirmVal!==expected){
    var errEl=document.getElementById('deleteaccount-error');
    errEl.textContent=lang==='it'?'Scrivi ELIMINA per confermare':'Type DELETE to confirm';
    errEl.style.display='block';
    return;
  }
  var msg2=lang==='it'
    ?'CONFERMA DEFINITIVA: Sei sicuro di voler eliminare il tuo account?\n\nTutti i tuoi dati, ARIA, ROBI e partecipazioni verranno cancellati permanentemente.\n\nQuesta azione NON è reversibile.'
    :'FINAL CONFIRMATION: Are you sure you want to delete your account?\n\nAll your data, ARIA, ROBI and participations will be permanently deleted.\n\nThis action CANNOT be undone.';
  if(!confirm(msg2)){return;}
  var btn=document.getElementById('deleteaccount-btn');
  btn.disabled=true;
  btn.textContent=lang==='it'?'Eliminazione...':'Deleting...';
  var errEl=document.getElementById('deleteaccount-error');
  errEl.style.display='none';
  try{
    var token=await getValidToken();
    if(!token)throw new Error('no_token');
    var res=await fetch(SB_URL+'/rest/v1/rpc/delete_my_account',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:'{}'
    });
    var data=await res.json();
    if(data&&data.ok){
      localStorage.removeItem('airoobi_session');
      window.location.href='/';
    } else {
      var error=data?data.error:'unknown';
      if(error==='active_participations'){
        errEl.innerHTML=lang==='it'
          ?'Hai <strong>'+data.count+'</strong> partecipazione/i in airdrop attivi. Ritira le partecipazioni prima di eliminare l\'account.'
          :'You have <strong>'+data.count+'</strong> active airdrop participation(s). Withdraw them before deleting your account.';
      } else if(error==='active_submissions'){
        errEl.innerHTML=lang==='it'
          ?'Hai <strong>'+data.count+'</strong> airdrop in valutazione o in corso. Attendi la conclusione prima di eliminare l\'account.'
          :'You have <strong>'+data.count+'</strong> airdrop(s) pending or in progress. Wait for them to complete before deleting.';
      } else {
        errEl.textContent=lang==='it'?'Errore: '+error:'Error: '+error;
      }
      errEl.style.display='block';
      btn.disabled=false;
      btn.innerHTML=lang==='it'?'<span class="it">Elimina</span><span class="en">Delete</span>':'<span class="it">Elimina</span><span class="en">Delete</span>';
    }
  }catch(e){
    errEl.textContent=lang==='it'?'Errore di rete. Riprova.':'Network error. Try again.';
    errEl.style.display='block';
    btn.disabled=false;
    btn.innerHTML='<span class="it">Elimina</span><span class="en">Delete</span>';
  }
}

// ── Language ──
function toggleLang(){
  var root=document.documentElement;
  var current=root.getAttribute('data-lang');
  var next=current==='it'?'en':'it';
  root.setAttribute('data-lang',next);
  root.setAttribute('lang',next);
  document.getElementById('lang-btn').textContent=next==='it'?'EN':'IT';
  localStorage.setItem('airoobi_lang',next);
  applyExploreI18n(next);
}
function applyExploreI18n(lang){
  var input=document.getElementById('etb-search-input');
  if(input){
    var p=input.getAttribute('data-placeholder-'+lang);
    if(p)input.setAttribute('placeholder',p);
  }
  document.querySelectorAll('#etb-sort-select option').forEach(function(opt){
    var t=opt.getAttribute('data-'+lang);
    if(t)opt.textContent=t;
  });
}
// Restore saved language
(function(){
  var saved=localStorage.getItem('airoobi_lang');
  if(saved&&saved!=='it'){toggleLang();}
  else{
    // Ensure explore i18n applied even when staying on default 'it'
    document.addEventListener('DOMContentLoaded',function(){applyExploreI18n('it')});
  }
})();

// ── Token refresh ──
async function refreshToken(){
  if(!_session||!_session.refresh_token)return false;
  try{
    var res=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:_session.refresh_token})
    });
    if(!res.ok)return false;
    var data=await res.json();
    _session.access_token=data.access_token;
    _session.refresh_token=data.refresh_token;
    // Update localStorage so main site also gets fresh token
    localStorage.setItem('airoobi_session',JSON.stringify(_session));
    return true;
  }catch(e){return false}
}

async function getValidToken(){
  if(!_session||!_session.access_token)return null;
  // Check if token is expired by decoding JWT
  try{
    var payload=JSON.parse(atob(_session.access_token.split('.')[1]));
    if(payload.exp*1000<Date.now()+60000){
      // Token expires in less than 60s, refresh it
      var ok=await refreshToken();
      if(!ok){
        // Don't redirect here — let the caller decide (may be a public route)
        if(!isPublicRoute())window.location.href='/login';
        return null;
      }
    }
  }catch(e){}
  return _session.access_token;
}

// ── Public pages (no auth required) ──
var PUBLIC_PAGES=['home','explore','faq','learn','blog'];
function isPublicRoute(){
  var pp=location.pathname;
  var page=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')||pp.startsWith('/dapp/airdrop/')?'explore':null);
  return page&&PUBLIC_PAGES.indexOf(page)!==-1;
}

// ── Init ──
// ── Guida rapida banner (stato globale in localStorage) ──
function toggleGuidaBanner(open){
  var banner=document.getElementById('guida-banner');
  var toggle=document.getElementById('guida-banner-toggle');
  if(!banner||!toggle)return;
  if(open){
    banner.style.display='';
    toggle.style.display='none';
    localStorage.setItem('airoobi_guida_banner_open','1');
  }else{
    banner.style.display='none';
    toggle.style.display='flex';
    localStorage.setItem('airoobi_guida_banner_open','0');
  }
}
function initGuidaBanner(){
  var saved=localStorage.getItem('airoobi_guida_banner_open');
  // Default: aperto al primo accesso
  toggleGuidaBanner(saved==='0'?false:true);
}

document.addEventListener('DOMContentLoaded',async function(){
  initGuidaBanner();
  var pp=location.pathname;
  document.body.classList.add('logged'); // i toggle lingua/tema vivono nel menu utente
  var initialPage=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')||pp.startsWith('/dapp/airdrop/')?'explore':'home');
  var airdropMatch=pp.match(/^\/(?:airdrops|dapp\/airdrop)\/([0-9a-f-]{36})$/);
  var urlId=airdropMatch?airdropMatch[1]:new URLSearchParams(location.search).get('id');
  if(urlId)initialPage='explore';

  // Try to get session (without redirecting)
  _session=getSession();

  if(_session){
    // Logged in — full experience
    var token=await getValidToken();
    if(!token){
      // Token expired/invalid — if on a public route, fall back to public mode
      if(isPublicRoute()||urlId){
        _session=null;
        _publicMode=true;
        setupPublicUI();
        await Promise.all([loadAirdropsPublic(),loadRobiPrice()]);
        renderGrid();
        renderCatDashboard();
        renderCategoryFilter();
        startCountdowns();
      } else {
        return;
      }
    } else {
    // Show splash tour on first visit
    if(!localStorage.getItem('airoobi_splash_done'))showSplash();
    setupUI();
    await Promise.all([loadBalance(),loadAirdrops(),loadMyParticipations(),checkUserRoles(),loadWatchlist(),loadRobiPrice(),loadMyRanks(),loadAlphaCounterInvita()]);
    renderGrid();
    renderCatDashboard();
    renderCategoryFilter();
    startCountdowns();
    loadValuationCount();
    loadComingSoon();
    registerServiceWorker();
    setTimeout(requestPushPermission,3000);
    loadNotifications();
    }
  } else if(isPublicRoute()||(urlId)){
    // Public mode — show airdrops/learn without auth
    _publicMode=true;
    setupPublicUI();
    await loadAirdropsPublic();
    renderGrid();
    renderCatDashboard();
    renderCategoryFilter();
    startCountdowns();
    loadComingSoon();
  } else {
    // Protected page without session — redirect to login
    window.location.href='/login?returnTo='+encodeURIComponent(location.pathname);
    return;
  }

  // In public mode, never show dashboard — redirect to landing or default to explore
  if(_publicMode&&initialPage==='home'){
    initialPage='explore';
  }
  showPage(initialPage);
  if(initialPage==='my'&&location.hash==='#corse'){
    setTimeout(function(){var el=document.getElementById('my-corse');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},700);
  }
  if(!urlId){
    history.replaceState({page:initialPage},null,PAGE_PATHS[initialPage]||'/dapp');
  }
  if(urlId){
    openDetail(urlId);
    var detailPath=_publicMode?('/airdrops/'+urlId):('/dapp/airdrop/'+urlId);
    history.replaceState({page:'explore',detail:urlId},null,detailPath);
  }
});

function setupPublicUI(){
  // Hide user-specific topbar elements
  document.getElementById('topbar-bal').style.display='none';
  var robiBar=document.getElementById('topbar-bal-robi');if(robiBar)robiBar.style.display='none';
  document.getElementById('notif-bell').style.display='none';
  document.getElementById('topbar-avatar').style.display='none';
  // Hide non-public nav items (keep only explore + learn)
  document.querySelectorAll('.topbar-nav a, .topbar-mobile-menu a').forEach(function(a){
    var page=a.getAttribute('data-page');
    if(page&&PUBLIC_PAGES.indexOf(page)===-1)a.style.display='none';
  });
  // Add login/signup buttons to topbar-right (desktop)
  var topRight=document.querySelector('.topbar-right');
  if(topRight){
    var authLinks=document.createElement('div');
    authLinks.className='topbar-auth-links';
    authLinks.innerHTML='<a href="/login" class="topbar-auth-link"><span class="it">Accedi</span><span class="en">Log in</span></a>'
      +'<a href="/signup" class="topbar-auth-cta"><span class="it">Registrati</span><span class="en">Sign up</span></a>';
    topRight.appendChild(authLinks);
  }
  // Add login/signup buttons to mobile menu
  var mobileMenu=document.getElementById('topbar-mobile-menu');
  if(mobileMenu){
    var sep=document.createElement('div');
    sep.className='mobile-auth-sep';
    mobileMenu.appendChild(sep);
    var loginLink=document.createElement('a');
    loginLink.href='/login';
    loginLink.className='mobile-auth-link';
    loginLink.innerHTML='<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg><span class="it">Accedi</span><span class="en">Log in</span>';
    mobileMenu.appendChild(loginLink);
    var signupLink=document.createElement('a');
    signupLink.href='/signup';
    signupLink.className='mobile-auth-cta';
    signupLink.innerHTML='<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg><span class="it">Registrati gratis</span><span class="en">Sign up free</span>';
    mobileMenu.appendChild(signupLink);
  }
}

async function loadAirdropsPublic(){
  // Load airdrops with anon key only (no user token)
  _airdrops=await sbGet('airdrops?status=in.(presale,sale)&order=created_at.desc',SB_KEY)||[];
}

function setupUI(){
  var email=_session.user?.email||'';
  document.getElementById('user-menu-email').textContent=email;
  var letter=email?email[0].toUpperCase():'?';
  document.getElementById('avatar-letter').textContent=letter;
  // Load avatar image from profile
  loadDappAvatar();
  // Update nav hrefs to clean paths on airoobi.app
  if(_isApp){
    document.querySelectorAll('[data-page]').forEach(function(a){
      var page=a.getAttribute('data-page');
      if(PAGE_PATHS[page])a.setAttribute('href',PAGE_PATHS[page]);
    });
  }
  // Close menu on outside click
  document.addEventListener('click',function(e){
    var menu=document.getElementById('user-menu');
    var avatar=document.getElementById('topbar-avatar');
    if(!menu.contains(e.target)&&!avatar.contains(e.target)){menu.classList.remove('active')}
  });
}

async function loadDappAvatar(){
  try{
    var data=await sbGet('profiles?id=eq.'+_session.user.id+'&select=avatar_url',_session.access_token);
    if(data&&data[0]&&data[0].avatar_url){
      var avatarEl=document.getElementById('topbar-avatar');
      var letterEl=document.getElementById('avatar-letter');
      if(letterEl)letterEl.style.display='none';
      var img=document.createElement('img');
      img.src=data[0].avatar_url+'?t='+Date.now();
      img.alt='';
      avatarEl.appendChild(img);
    }
  }catch(e){}
}

function toggleDiscoverMenu(e){
  if(e){e.stopPropagation();e.preventDefault();}
  var menu=document.getElementById('nav-discover-menu');
  if(!menu)return;
  menu.style.display=menu.style.display==='block'?'none':'block';
}
function closeDiscoverMenu(){
  var menu=document.getElementById('nav-discover-menu');
  if(menu)menu.style.display='none';
}
// Click-outside per chiudere dropdown "Scopri"
document.addEventListener('click',function(e){
  var menu=document.getElementById('nav-discover-menu');
  var btn=document.getElementById('nav-discover-btn');
  if(!menu||menu.style.display!=='block')return;
  if(menu.contains(e.target)||(btn&&btn.contains(e.target)))return;
  menu.style.display='none';
});
function toggleUserMenu(){
  document.getElementById('user-menu').classList.toggle('active');
}

function toggleMobileNav(){
  var m=document.getElementById('topbar-mobile-menu');
  m.classList.toggle('active');
  document.body.style.overflow=m.classList.contains('active')?'hidden':'';
}

// ── Browser back/forward ──
window.addEventListener('popstate',function(e){
  // MNB-1 fix 3 v2: rete di sicurezza · qualsiasi route-change rilascia body scroll-lock
  document.body.style.overflow='';
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
  var page=(e.state&&e.state.page)?e.state.page:(PATH_TO_PAGE[location.pathname]||'home');
  showPage(page);
  if(e.state&&e.state.detail){
    openDetail(e.state.detail);
  } else if(page==='explore'){
    closeDetailView();
    loadValuationCount();
  }
});

// ── Home Dashboard ──
async function loadHomeDashboard(){
  var token=await getValidToken();
  if(!token)return;
  var email=_session.user?.email||'';
  var name=email?email.split('@')[0]:'';
  var elIt=document.getElementById('home-user-name');
  var elEn=document.getElementById('home-user-name-en');
  // Render with prefix only if name available; empty otherwise (no "Bentornato, —")
  if(elIt)elIt.textContent=name?(elIt.getAttribute('data-prefix')||', ')+name:'';
  if(elEn)elEn.textContent=name?(elEn.getAttribute('data-prefix')||', ')+name:'';
  // Registration date
  try{
    var prof=await sbGet('profiles?id=eq.'+_session.user.id+'&select=created_at',token);
    if(prof&&prof[0]&&prof[0].created_at){
      var rd=new Date(prof[0].created_at);
      var rdIt=document.getElementById('home-reg-date');
      var rdEn=document.getElementById('home-reg-date-en');
      var rdStr=rd.toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
      var rdStrEn=rd.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
      if(rdIt)rdIt.textContent=rdStr;
      if(rdEn)rdEn.textContent=rdStrEn;
      var rd2=document.getElementById('home-reg-date2');if(rd2)rd2.textContent=rdStr;
      var rd2e=document.getElementById('home-reg-date2-en');if(rd2e)rd2e.textContent=rdStrEn;
    }
  }catch(e){}
  // ARIA balance
  document.getElementById('home-aria').innerHTML=_balance;
  // ROBI count (nft_type = ROBI or NFT_REWARD)
  try{
    var nfts=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&nft_type=in.(ROBI,NFT_REWARD)&select=id,shares',token);
    var robiCount=0;
    if(nfts)for(var ni=0;ni<nfts.length;ni++){
      robiCount+=parseFloat(nfts[ni].shares)||1;
    }
    document.getElementById('home-robi').textContent=robiCount%1===0?robiCount:robiCount.toFixed(4);
    // Potential KAS from ROBI value
    try{
      var snRes=await fetch(SB_URL+'/rest/v1/rpc/get_robi_snapshots_recent',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_limit:1})});
      var uVal=0;
      if(snRes.ok){var sn=await snRes.json();if(sn&&sn.length)uVal=parseFloat(sn[0].price_eur)||0;}
      if(uVal>0&&robiCount>0){
        var myValEur=(uVal*robiCount).toFixed(2);
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur').then(function(r){return r.json()}).then(function(d){
          var kasEl=document.getElementById('home-kas');
          if(d&&d.kaspa&&d.kaspa.eur>0&&kasEl){
            kasEl.textContent=(parseFloat(myValEur)/d.kaspa.eur).toFixed(2);
          }
        }).catch(function(){});
      }
    }catch(e){}
  }catch(e){document.getElementById('home-robi').textContent='0'}
  // Participations count + blocks + spent
  var totalBlocks=0,totalSpent=0;
  _myParts.forEach(function(p){totalBlocks+=p.blocks_count||0;totalSpent+=p.aria_spent||0});
  document.getElementById('home-blocks').textContent=totalBlocks;
  document.getElementById('home-spent').textContent=totalSpent+' ARIA';
  // Streak giornaliero (v2: stato calendario settimanale)
  loadStreakState();
  // Check faucet status
  checkFaucetStatus();
  // Referral auto-confirm (se utente ha referred_by e non ancora confirmed)
  autoConfirmReferral();
  // Portfolio chart
  console.log('[home-dashboard] chiamo loadPortfolioChart con robiCount',robiCount);
  loadPortfolioChart(token,robiCount);
}

// ── Portfolio Chart ──
// fetch con timeout — se la risposta non arriva entro ms, abort + reject
function fetchWithTimeout(url,opts,ms){
  opts=opts||{};
  if(typeof AbortController==='undefined'){return fetch(url,opts);}
  var ctl=new AbortController();
  var t=setTimeout(function(){ctl.abort();},ms||3000);
  opts.signal=ctl.signal;
  return fetch(url,opts).finally(function(){clearTimeout(t);});
}

async function loadPortfolioChart(token,userRobi){
  console.log('[portfolio-chart] start',{userRobi:userRobi,balance:_balance});
  var canvas=document.getElementById('portfolio-chart');
  var eurEl=document.getElementById('portfolio-eur-val');
  if(!canvas){console.warn('[portfolio-chart] canvas not found');return;}
  // Setto subito un valore base così non resta mai "—"
  if(eurEl&&eurEl.textContent==='—')eurEl.textContent='€ 0,00';
  try{
    // 1. Totale — calcolato e mostrato SEMPRE, indipendente dal layout del canvas
    var robiValEur=0,kasPrice=0;
    try{
      var snRes=await fetchWithTimeout(SB_URL+'/rest/v1/rpc/get_robi_snapshots_recent',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_limit:1})},3000);
      if(snRes.ok){var sn=await snRes.json();var uv=(sn&&sn.length)?parseFloat(sn[0].price_eur)||0:0;robiValEur=uv*userRobi;console.log('[portfolio-chart] snapshot unitVal',uv);}
      else console.warn('[portfolio-chart] snapshot HTTP',snRes.status);
    }catch(e){console.warn('[portfolio-chart] treasury/rpc error',e);}
    try{
      var kRes=await fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur',{},3000);
      var kd=await kRes.json();
      if(kd&&kd.kaspa&&kd.kaspa.eur>0)kasPrice=kd.kaspa.eur;
    }catch(e){console.warn('[portfolio-chart] coingecko error',e);}
    console.log('[portfolio-chart] robiValEur',robiValEur,'kasPrice',kasPrice);

    if(eurEl)eurEl.innerHTML='&euro; '+robiValEur.toFixed(2)+'<span style="font-family:var(--font-m);font-size:11px;color:var(--gray-400);margin-left:8px;letter-spacing:1px">ROBI</span>';

    // 2. Attesa layout canvas — retry fino a ~3s, poi ResizeObserver come ultima chance
    var rect=canvas.parentElement.getBoundingClientRect();
    var tries=0;
    while((rect.width<=0||rect.height<=0)&&tries<30){
      await new Promise(function(r){requestAnimationFrame(function(){setTimeout(r,100);});});
      rect=canvas.parentElement.getBoundingClientRect();
      tries++;
    }
    // Fallback a offsetWidth/offsetHeight se getBoundingClientRect fallisce
    if(rect.width<=0)rect={width:canvas.parentElement.offsetWidth||canvas.parentElement.clientWidth||0,height:rect.height};
    if(rect.height<=0)rect={width:rect.width,height:canvas.parentElement.offsetHeight||canvas.parentElement.clientHeight||160};
    if(rect.width<=0||rect.height<=0){
      try{
        var ro=new ResizeObserver(function(entries){
          for(var k=0;k<entries.length;k++){
            if(entries[k].contentRect.width>0&&entries[k].contentRect.height>0){
              ro.disconnect();
              loadPortfolioChart(token,userRobi);
              return;
            }
          }
        });
        ro.observe(canvas.parentElement);
      }catch(e){}
      return;
    }

    // Ledger last 30 days
    var days=30;
    var since=new Date();since.setDate(since.getDate()-days);
    var sinceStr=since.toISOString().slice(0,10);
    var ledger=[];
    try{
      ledger=await sbGet('points_ledger?user_id=eq.'+_session.user.id+'&created_at=gte.'+sinceStr+'T00:00:00&select=amount,created_at&order=created_at.asc',token)||[];
    }catch(e){}

    // Labels
    var labels=[];
    for(var i=days;i>=0;i--){
      var d=new Date();d.setDate(d.getDate()-i);
      labels.push(d.toISOString().slice(0,10));
    }

    // Daily aggregate
    var dailyMap={};
    ledger.forEach(function(e){
      var d=e.created_at.slice(0,10);
      dailyMap[d]=(dailyMap[d]||0)+(e.amount||0);
    });

    // Reconstruct historical ARIA backwards from current _balance
    var ariaData=[];
    var runningBack=_balance;
    for(var i=labels.length-1;i>=0;i--){
      ariaData[i]=runningBack;
      if(i>0)runningBack-=(dailyMap[labels[i]]||0);
    }
    ariaData=ariaData.map(function(v){return Math.max(0,v)});

    // Detect corrupted history (admin grants, outliers) → use flat line at current balance.
    // Matches when: extreme min/max ratio, huge spikes vs median, or non-finite values.
    var arMax=Math.max.apply(null,ariaData);
    var sorted=ariaData.slice().sort(function(a,b){return a-b});
    var median=sorted[Math.floor(sorted.length/2)];
    var isCorrupted=
      ariaData.some(function(v){return !isFinite(v)}) ||
      (arMax>0 && median>=0 && (median===0 ? _balance>0 : arMax/median>10)) ||
      (_balance>0 && median<_balance*0.05);
    if(isCorrupted){
      ariaData=labels.map(function(){return _balance});
    }

    var robiData=labels.map(function(){return robiValEur});
    var kasData=kasPrice>0?labels.map(function(){return robiValEur/kasPrice}):[];

    // hasData check basato su balance reali, non sulla serie ricostruita
    var hasData=_balance>0||robiValEur>0;
    if(!hasData){
      canvas.parentElement.style.display='flex';
      canvas.parentElement.style.alignItems='center';
      canvas.parentElement.style.justifyContent='center';
      canvas.style.display='none';
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      if(!canvas.parentElement.querySelector('.portfolio-empty')){
        var emptyMsg=document.createElement('div');
        emptyMsg.className='portfolio-empty';
        emptyMsg.style.cssText='text-align:center;padding:16px;font-size:12px;color:var(--gray-500);line-height:1.5';
        emptyMsg.innerHTML=lang==='it'
          ?'Nessun dato ancora.<br>Usa il <strong style="color:var(--aria)">faucet</strong> e il <strong style="color:var(--gold)">check-in</strong> per accumulare ARIA,<br>poi partecipa agli airdrop per guadagnare ROBI.'
          :'No data yet.<br>Use the <strong style="color:var(--aria)">faucet</strong> and <strong style="color:var(--gold)">check-in</strong> to accumulate ARIA,<br>then join airdrops to earn ROBI.';
        canvas.parentElement.appendChild(emptyMsg);
      }
      if(eurEl)eurEl.textContent='€ 0,00';
      return;
    }

    // Reset parent layout da eventuale precedente empty state
    canvas.parentElement.style.display='';
    canvas.parentElement.style.alignItems='';
    canvas.parentElement.style.justifyContent='';
    canvas.style.display='';
    var existingEmpty=canvas.parentElement.querySelector('.portfolio-empty');
    if(existingEmpty)existingEmpty.remove();

    // Re-measure dopo reset layout
    await new Promise(function(r){requestAnimationFrame(r);});
    rect=canvas.parentElement.getBoundingClientRect();

    // Canvas init con DPR (setTransform pulito, no accumulazione scale)
    var dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.floor(rect.width*dpr));
    canvas.height=Math.max(1,Math.floor(rect.height*dpr));
    var ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var W=rect.width,H=rect.height;

    var pad={top:14,right:10,bottom:20,left:10};
    var cW=W-pad.left-pad.right;
    var cH=H-pad.top-pad.bottom;

    function drawLine(data,color,alpha,flatPct){
      if(!data.length)return;
      var mn=Math.min.apply(null,data);
      var mx=Math.max.apply(null,data);
      var flat=mx-mn<1e-6;
      if(flat&&mx<=0)return;
      var step=cW/(data.length-1||1);
      var yFor=function(v){
        if(flat)return pad.top+cH*(flatPct||0.5);
        return pad.top+cH-((v-mn)/(mx-mn))*cH*0.92-cH*0.04;
      };
      ctx.beginPath();
      ctx.strokeStyle=color;
      ctx.lineWidth=1.5;
      ctx.globalAlpha=1;
      for(var i=0;i<data.length;i++){
        var x=pad.left+i*step;
        var y=yFor(data[i]);
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.lineTo(pad.left+(data.length-1)*step,pad.top+cH);
      ctx.lineTo(pad.left,pad.top+cH);
      ctx.closePath();
      ctx.globalAlpha=alpha;
      ctx.fillStyle=color;
      ctx.fill();
      ctx.globalAlpha=1;
    }

    ctx.clearRect(0,0,W,H);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=0.5;
    for(var g=0;g<4;g++){
      var gy=pad.top+(cH/3)*g;
      ctx.beginPath();ctx.moveTo(pad.left,gy);ctx.lineTo(W-pad.right,gy);ctx.stroke();
    }

    drawLine(ariaData,'#4A9EFF',0.06,0.25);
    drawLine(robiData,'#EF3E4F',0.08,0.5);
    if(kasData.length)drawLine(kasData,'#49EACB',0.05,0.75);

    // Date labels
    ctx.font='9px monospace';ctx.fillStyle='rgba(255,255,255,.2)';ctx.textBaseline='top';
    var ly=H-pad.bottom+4;
    ctx.textAlign='left';ctx.fillText(labels[0].slice(5),pad.left,ly);
    ctx.textAlign='center';ctx.fillText(labels[Math.floor(labels.length/2)].slice(5),W/2,ly);
    ctx.textAlign='right';ctx.fillText(labels[labels.length-1].slice(5),W-pad.right,ly);
  }catch(err){
    console.error('[portfolio-chart]',err);
    var eurErr=document.getElementById('portfolio-eur-val');
    if(eurErr&&eurErr.textContent==='—')eurErr.textContent='€ 0,00';
  }
}

// ── Check-in ──
// ══ Streak giornaliero v2 (earnings v2) ══
// Timbra il giorno corrente: +50 ARIA. Completa lun-dom: +1 ROBI.
async function claimStreakDay(){
  var btn=document.getElementById('streak-btn');
  if(!btn)return;
  btn.disabled=true;btn.style.opacity='.5';btn.style.cursor='not-allowed';
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var origLabel=btn.innerHTML;
  btn.textContent='...';
  try{
    var token=await getValidToken();
    if(!token){btn.disabled=false;btn.style.opacity='1';btn.innerHTML=origLabel;return;}
    var res=await sbRpc('daily_checkin_v2',{},token);
    if(res&&res.ok){
      if(res.aria_awarded>0){
        _balance+=res.aria_awarded;
        updateBalanceUI();
        var homeAria=document.getElementById('home-aria');
        if(homeAria)homeAria.innerHTML=_balance;
        showToast('<span style="color:var(--aria)">+'+res.aria_awarded+' ARIA</span> &middot; <span class="it">giorno timbrato</span><span class="en">day checked</span>');
      }
      if(res.week_complete){
        showToast('<span style="color:var(--gold)">+1 ROBI</span> &middot; <span class="it">settimana completa!</span><span class="en">week complete!</span>');
        _robi=(_robi||0)+1;
        updateBalanceUI();
      } else if(res.already_today){
        showToast('<span class="it">Gi&agrave; timbrato oggi</span><span class="en">Already checked today</span>');
      }
      renderStreakCalendar(res.days_checked||[],res.day_of_week);
      updateStreakButton(res.already_today || res.aria_awarded>0);
    } else {
      btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
      btn.innerHTML=origLabel;
    }
  }catch(e){
    btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
    btn.innerHTML=origLabel;
  }
}

async function loadStreakState(){
  if(!_session||!_session.user)return;
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await sbRpc('get_my_weekly_streak',{},token);
    if(!res||!res.ok){renderStreakCalendar([],null);return;}
    var days=res.days_checked||[];
    // il giorno lo decide il server (ora italiana); fallback locale se RPC vecchia
    var isoDow=res.day_of_week;
    if(!isoDow){var jsDow=new Date().getDay();isoDow=jsDow===0?7:jsDow;}
    renderStreakCalendar(days,isoDow);
    updateStreakButton(days.indexOf(isoDow)>=0);
  }catch(e){}
}

function renderStreakCalendar(daysChecked,today){
  var el=document.getElementById('streak-calendar');
  if(!el)return;
  var labels=['L','M','M','G','V','S','D'];
  // Calcola lunedì della settimana ISO corrente
  var now=new Date();
  var jsDow=now.getDay();
  var isoNow=jsDow===0?7:jsDow;
  var monday=new Date(now);
  monday.setDate(now.getDate()-(isoNow-1));

  var html='';
  for(var i=0;i<7;i++){
    var dow=i+1;
    var checked=daysChecked.indexOf(dow)>=0;
    var isToday=today===dow;
    var isPastMissed=today!==null&&dow<today&&!checked;
    var isFuture=today!==null&&dow>today;
    var dayDate=new Date(monday);dayDate.setDate(monday.getDate()+i);
    var dayNum=dayDate.getDate();

    var bg,fg,border,topLine,bottomContent,weight;
    if(checked){
      bg='var(--gold)';
      fg='var(--black)';
      border='1px solid var(--gold)';
      weight='700';
      bottomContent='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      topLine='<div style="font-size:10px;letter-spacing:.5px;color:'+fg+';font-weight:'+weight+';opacity:.85">'+labels[i]+'</div>';
    } else if(isToday){
      bg='rgba(239,62,79,.06)';
      fg='var(--gold)';
      border='1.5px solid var(--gold)';
      weight='700';
      bottomContent='<div style="font-family:var(--font-m);font-size:8px;letter-spacing:1.5px;color:var(--gold)">OGGI</div>';
      topLine='<div style="font-size:11px;letter-spacing:.5px;color:'+fg+';font-weight:'+weight+'">'+labels[i]+'</div>';
    } else if(isPastMissed){
      bg='transparent';
      fg='var(--gray-600)';
      border='1px dashed var(--gray-700)';
      weight='400';
      bottomContent='<div style="font-size:14px;color:var(--gray-700);line-height:1">&middot;</div>';
      topLine='<div style="font-size:10px;letter-spacing:.5px;color:'+fg+';font-weight:'+weight+'">'+labels[i]+'</div>';
    } else { // future
      bg='rgba(255,255,255,.015)';
      fg='var(--gray-500)';
      border='1px solid var(--gray-800)';
      weight='400';
      bottomContent='<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-600)">'+dayNum+'</div>';
      topLine='<div style="font-size:10px;letter-spacing:.5px;color:'+fg+';font-weight:'+weight+'">'+labels[i]+'</div>';
    }

    html+='<div style="aspect-ratio:1/1;min-width:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:'+bg+';border:'+border+';border-radius:var(--radius-sm);font-family:var(--font-m);transition:all .25s ease"'
      +(isToday?' class="streak-today-pulse"':'')
      +'>'
      +topLine
      +bottomContent
      +'</div>';
  }
  el.innerHTML=html;

  // Status: progress bar + testo
  var status=document.getElementById('streak-status');
  if(status){
    var count=daysChecked.length;
    var pct=Math.round((count/7)*100);
    var bar='<div style="width:100%;height:3px;background:rgba(255,255,255,.04);border-radius:2px;overflow:hidden;margin-bottom:6px"><div style="height:100%;width:'+pct+'%;background:var(--gold);border-radius:2px;transition:width .4s ease"></div></div>';
    var text='';
    if(count===7){
      text='<span style="color:var(--gold);font-weight:600"><span class="it">&#9819; Settimana completa &middot; +1 ROBI assegnato</span><span class="en">&#9819; Week complete &middot; +1 ROBI awarded</span></span>';
    } else if(count>0){
      text='<span class="it"><strong style="color:var(--gold)">'+count+'/7</strong> timbrati &middot; mancano <strong>'+(7-count)+'</strong> per il ROBI</span><span class="en"><strong style="color:var(--gold)">'+count+'/7</strong> checked &middot; <strong>'+(7-count)+'</strong> left for the ROBI</span>';
    } else {
      text='<span class="it">Inizia la tua sequenza della settimana</span><span class="en">Start your weekly streak</span>';
    }
    status.innerHTML=bar+text;
  }
}

function updateStreakButton(doneToday){
  var btn=document.getElementById('streak-btn');
  if(!btn)return;
  if(doneToday){
    btn.disabled=true;btn.style.background='var(--gray-700)';btn.style.color='var(--gray-400)';btn.style.cursor='not-allowed';btn.style.opacity='1';
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    btn.innerHTML=lang==='it'?'<span class="it">TIMBRATO ✓</span>':'<span class="en">CHECKED ✓</span>';
  } else {
    btn.disabled=false;btn.style.background='var(--gold)';btn.style.color='#000';btn.style.cursor='pointer';btn.style.opacity='1';
    btn.innerHTML='<span class="it">TIMBRA OGGI</span><span class="en">CHECK IN</span>';
  }
}

// Legacy wrapper (nel caso qualcosa chiami ancora claimCheckin)
async function claimCheckin(){return claimStreakDay();}
function checkCheckinStatus(){return loadStreakState();}
function markDailyTask(){/* no-op v2 */}
function updateDailyTasksScore(){/* no-op v2 */}

// Referral auto-confirm al login (chiamata silente)
async function autoConfirmReferral(){
  if(!_session||!_session.user)return;
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await sbRpc('confirm_referral',{},token);
    if(res&&res.ok){
      _robi=(_robi||0)+5;
      updateBalanceUI();
      showToast('<span style="color:var(--gold)">+5 ROBI</span> &middot; <span class="it">benvenuto! Il tuo referrer ha ricevuto +5 ROBI</span><span class="en">welcome! Your referrer earned +5 ROBI</span>');
    }
    // Errori silenti (no_referral_code, already_confirmed, ecc): normali
  }catch(e){}
}

// ── Faucet ──
async function claimFaucet(){
  var btn=document.getElementById('faucet-btn');
  var status=document.getElementById('faucet-status');
  btn.disabled=true;btn.style.opacity='.5';btn.style.cursor='not-allowed';
  btn.textContent='...';
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await sbRpc('claim_faucet',{},token);
    if(res&&res.ok){
      _balance+=res.amount;
      updateBalanceUI();
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      btn.style.background='var(--kas)';btn.style.color='var(--black)';
      btn.textContent=lang==='it'?'+100 ARIA ricevuti!':'+100 ARIA received!';
      showToast('<span style="color:var(--kas)">+100 ARIA</span> — <span class="it">più Step, più ROBI</span><span class="en">more Steps, more ROBI</span>');
      // Refresh dashboard stats
      var homeAria=document.getElementById('home-aria');
      if(homeAria)homeAria.innerHTML=_balance;
      showFaucetCooldown();
    }else if(res&&res.error==='already_claimed'){
      showFaucetCooldown();
    }else{
      btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
      var _l=document.documentElement.getAttribute('data-lang')||'it';btn.textContent=_l==='it'?'RICEVI':'GET';
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      status.style.display='block';status.style.color='#f87171';
      status.textContent=lang==='it'?'Errore — riprova':'Error — try again';
    }
  }catch(e){
    btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
    var _l=document.documentElement.getAttribute('data-lang')||'it';btn.textContent=_l==='it'?'RICEVI':'GET';
  }
}

function showFaucetCooldown(){
  var btn=document.getElementById('faucet-btn');
  var status=document.getElementById('faucet-status');
  btn.disabled=true;btn.style.opacity='.5';btn.style.cursor='not-allowed';
  btn.style.background='var(--gray-700)';btn.style.color='var(--gray-400)';
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  btn.textContent=lang==='it'?'Gi\u00e0 ricevuti oggi':'Already received today';
  var now=new Date();
  var midnight=new Date(now);midnight.setUTCHours(24,0,0,0);
  var diff=midnight-now;
  var h=Math.floor(diff/3600000);var m=Math.floor((diff%3600000)/60000);
  status.style.display='block';status.style.color='var(--gray-400)';
  status.innerHTML=(lang==='it'?'Prossimi ARIA tra ':'Next ARIA in ')+h+'h '+m+'m';
  markDailyTask('faucet',true);
}

async function checkFaucetStatus(){
  try{
    var token=await getValidToken();
    if(!token)return;
    var today=new Date().toISOString().slice(0,10);
    var rows=await sbGet('points_ledger?user_id=eq.'+_session.user.id+'&reason=eq.faucet&created_at=gte.'+today+'T00:00:00&select=id&limit=1',token);
    if(rows&&rows.length>0)showFaucetCooldown();
  }catch(e){}
}

// ── Referral ──
function truncEmail(e){if(!e)return'***';var p=e.split('@');return p[0].substring(0,3)+'***@'+p[1]}

async function loadDappReferral(){
  var token=await getValidToken();
  if(!token)return;
  var uid=_session.user.id;
  var myCode='';
  // Load referral link
  var prof=await sbGet('profiles?id=eq.'+uid+'&select=referral_code,referral_count',token);
  if(prof&&prof[0]){
    myCode=prof[0].referral_code||'';
    var link=(_isApp?'https://airoobi.app/signup':'https://airoobi.com/signup.html')+'?ref='+myCode;
    var el=document.getElementById('dapp-ref-link');
    if(el){el.textContent=link;el.dataset.link=link;el.dataset.code=myCode;}
    document.getElementById('dapp-ref-count').textContent=prof[0].referral_count||0;
  }
  // Confirmed count
  var confirmed=await sbGet('referral_confirmations?referrer_id=eq.'+uid+'&status=eq.confirmed&select=referred_id,confirmed_at',token);
  var confirmedMap={};
  if(confirmed&&confirmed.length){
    confirmed.forEach(function(c){confirmedMap[c.referred_id]=c.confirmed_at;});
  }
  var confirmedCount=confirmed?confirmed.length:0;
  document.getElementById('dapp-ref-confirmed').textContent=confirmedCount;
  // Round 8 · render tier + alpha counter
  if(typeof renderReferralTier==='function')renderReferralTier(confirmedCount);
  if(typeof loadAlphaCounterInvita==='function')loadAlphaCounterInvita();

  // History: who you invited (source: profiles.referred_by)
  var invList=document.getElementById('dapp-ref-invited-list');
  try{
    var invited=myCode?(await sbGet('profiles?referred_by=eq.'+myCode+'&deleted_at=is.null&select=id,email,created_at&order=created_at.desc',token)):[];
    if(invited&&invited.length>0){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      var hdrEl=document.getElementById('dapp-ref-invited-header');
      if(hdrEl)hdrEl.style.display='flex';
      invList.innerHTML=invited.map(function(p){
        var email=p.email?truncEmail(p.email):'***';
        var confirmedAt=confirmedMap[p.id];
        var ok=!!confirmedAt;
        var date=new Date(confirmedAt||p.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
        var statusLabel=ok?(lang==='it'?'Confermato':'Confirmed'):(lang==='it'?'In attesa':'Pending');
        var reward=ok?'+5 ROBI':'—';
        return '<div class="ref-history-row"><span class="ref-history-email">'+email+'</span><span class="ref-history-status '+(ok?'ref-history-confirmed':'ref-history-pending')+'">'+statusLabel+'</span><span class="ref-history-aria" style="color:var(--gold)">'+reward+'</span><span style="font-size:11px;color:var(--gray-400)">'+date+'</span></div>';
      }).join('');
    }else{
      invList.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Nessun invitato ancora.</span><span class="en">No invitees yet.</span></p>';
    }
  }catch(e){invList.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Errore caricamento.</span><span class="en">Load error.</span></p>';}

  // History: who invited you
  var inviterEl=document.getElementById('dapp-ref-inviter-info');
  try{
    var myP=await sbGet('profiles?id=eq.'+uid+'&select=referred_by,created_at',token);
    if(myP&&myP[0]&&myP[0].referred_by){
      var refCode=myP[0].referred_by;
      var rProf=await sbGet('profiles?referral_code=eq.'+refCode+'&select=email',token);
      var rEmail=rProf&&rProf[0]?truncEmail(rProf[0].email):'***';
      var myConfs=await sbGet('referral_confirmations?referred_id=eq.'+uid+'&status=eq.confirmed&select=confirmed_at',token);
      var lang2=document.documentElement.getAttribute('data-lang')||'it';
      var isOk=myConfs&&myConfs.length>0;
      var cDate=isOk&&myConfs[0].confirmed_at?new Date(myConfs[0].confirmed_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):(myP[0].created_at?new Date(myP[0].created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):'—');
      var statusLabel2=isOk?(lang2==='it'?'Confermato':'Confirmed'):(lang2==='it'?'In attesa':'Pending');
      var reward2=isOk?'+5 ROBI':'—';
      inviterEl.innerHTML='<div class="ref-history-row"><span class="ref-history-email">'+rEmail+'</span><span class="ref-history-status '+(isOk?'ref-history-confirmed':'ref-history-pending')+'">'+statusLabel2+'</span><span class="ref-history-aria" style="color:var(--gold)">'+reward2+'</span><span style="font-size:11px;color:var(--gray-400)">'+cDate+'</span></div>';
    }else{
      inviterEl.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Non sei stato invitato da nessuno.</span><span class="en">You were not invited by anyone.</span></p>';
    }
  }catch(e){inviterEl.innerHTML='';}
}

function dappCopyRef(){
  var link=document.getElementById('dapp-ref-link').dataset.link;
  if(!link)return;
  navigator.clipboard.writeText(link).then(function(){
    var btn=document.querySelector('#tab-referral .ref-copy, #tab-referral .invita-link-copy-btn');
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    if(btn){
      btn.textContent=lang==='it'?'COPIATO!':'COPIED!';
      setTimeout(function(){btn.innerHTML='<span class="it">COPIA</span><span class="en">COPY</span>'},2000);
    }
  });
}

// Round 8 · /invita Content Rewrite helpers
function copyReferralLink(btn){
  var link=document.getElementById('dapp-ref-link').dataset.link;
  if(!link)return;
  navigator.clipboard.writeText(link).then(function(){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    btn.textContent=lang==='it'?'COPIATO!':'COPIED!';
    setTimeout(function(){btn.innerHTML='<span class="it">COPIA</span><span class="en">COPY</span>'},2000);
  });
}

function shareReferral(platform,event){
  if(event&&event.preventDefault)event.preventDefault();
  var el=document.getElementById('dapp-ref-link');if(!el)return;
  var link=el.dataset.link||el.textContent.trim();if(!link)return;
  var lang=document.documentElement.getAttribute('data-lang')==='en'?'en':'it';
  // Round 13 (12 lug 2026) · linea della corsa: Step, vetta, ringraziamento · outsider-friendly + seller hook
  var msgs={
    it:{
      whatsapp:'AIROOBI: il negozio online dove ogni oggetto è una corsa. Entri gratis, ogni giorno ricevi ARIA e li usi per avanzare Step dopo Step verso l\'oggetto che vuoi: chi arriva in vetta se lo porta a casa, e chi ha corso viene comunque ringraziato. Curioso?\n'+link+'\nPlus: se hai un oggetto di valore da vendere, qui lo liquidi in ore, non mesi.',
      telegram:'AIROOBI: il negozio online dove ogni oggetto è una corsa. Entri gratis, ogni giorno ricevi ARIA e li usi per avanzare Step dopo Step verso l\'oggetto che vuoi: chi arriva in vetta se lo porta a casa, e chi ha corso viene comunque ringraziato. Curioso?\n'+link+'\nPlus: se hai un oggetto di valore da vendere, qui lo liquidi in ore, non mesi.',
      twitter:'Su AIROOBI ogni oggetto è una corsa: avanzi Step dopo Step, chi arriva in vetta lo porta a casa, chi ha corso viene ringraziato. E se vendi, liquidi in ore, non mesi. '+link,
      email_subject:'AIROOBI · il negozio dove ogni oggetto è una corsa',
      email_body:'Ciao,\n\nvolevo consigliarti AIROOBI: un negozio online dove gli oggetti (smartphone, orologi, tech) non si comprano a prezzo pieno — si raggiungono. Ogni oggetto è una corsa: entri gratis, ricevi ARIA ogni giorno e li usi per avanzare di Step verso la vetta. Chi arriva in cima si porta a casa l\'oggetto, chi ha corso riceve comunque un ringraziamento reale.\n\nPlus: se hai qualcosa di valore da vendere, qui lo liquidi in ore, non mesi come eBay/Subito.\n\nSiamo in pre-lancio, è il momento giusto per entrare.\n\nProvalo: '+link+'\n\nFammi sapere cosa ne pensi!'
    },
    en:{
      whatsapp:'AIROOBI: the online store where every item is a race. Join for free, get ARIA every day and use them to advance Step by Step toward the item you want: first to the summit takes it home, and everyone who ran gets thanked anyway. Curious?\n'+link+'\nPlus: if you have something valuable to sell, here you liquidate it in hours, not months.',
      telegram:'AIROOBI: the online store where every item is a race. Join for free, get ARIA every day and use them to advance Step by Step toward the item you want: first to the summit takes it home, and everyone who ran gets thanked anyway. Curious?\n'+link+'\nPlus: if you have something valuable to sell, here you liquidate it in hours, not months.',
      twitter:'On AIROOBI every item is a race: advance Step by Step, first to the summit takes it home, everyone who ran gets thanked. And if you sell, you liquidate in hours, not months. '+link,
      email_subject:'AIROOBI · the store where every item is a race',
      email_body:'Hi,\n\nI wanted to recommend AIROOBI: an online store where items (smartphones, watches, tech) aren\'t bought at full price — they\'re reached. Every item is a race: join for free, get ARIA every day and use them to advance Steps toward the summit. First to the top takes the item home, everyone who ran still receives a real thank-you.\n\nPlus: if you have something valuable to sell, here you liquidate it in hours, not months like eBay.\n\nWe\'re in pre-launch — perfect timing to join.\n\nTry it: '+link+'\n\nLet me know what you think!'
    }
  };
  var m=msgs[lang]||msgs.it;
  if(platform==='whatsapp')window.open('https://wa.me/?text='+encodeURIComponent(m.whatsapp),'_blank');
  else if(platform==='telegram')window.open('https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(m.telegram),'_blank');
  else if(platform==='twitter'||platform==='x')window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(m.twitter),'_blank');
  else if(platform==='email')window.location.href='mailto:?subject='+encodeURIComponent(m.email_subject)+'&body='+encodeURIComponent(m.email_body);
}

function calculateReferralTier(confirmedCount){
  if(confirmedCount>=25)return{tier:'platinum',label:'💎 Platinum',next:null};
  if(confirmedCount>=10)return{tier:'gold',label:'🥇 Gold',next:25};
  if(confirmedCount>=5)return{tier:'silver',label:'🥈 Silver',next:10};
  if(confirmedCount>=1)return{tier:'bronze',label:'🥉 Bronze',next:5};
  return{tier:'none',label:'—',next:1};
}

function renderReferralTier(confirmedCount){
  var t=calculateReferralTier(confirmedCount);
  var el=document.getElementById('referral-tier');
  if(el)el.textContent=t.label;
  var steps=document.querySelectorAll('.invita-tier-step');
  steps.forEach(function(s){if(s.dataset.tier===t.tier)s.classList.add('active');else s.classList.remove('active');});
}

async function loadAlphaCounterInvita(){
  // Round 9: writes to all alpha counter IDs (invita + marketplace banner)
  var ids=['alpha-counter-invita','banner-counter','banner-counter-en'];
  var present=ids.map(function(id){return document.getElementById(id);}).filter(Boolean);
  if(!present.length)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/profiles?select=id&deleted_at=is.null',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'count=exact','Range':'0-0'}
    });
    if(res.ok){
      var range=res.headers.get('content-range');
      if(range){var total=parseInt(range.split('/')[1],10)||0;present.forEach(function(el){el.textContent=total;});}
    }
  }catch(e){}
}


// ── Data loading ──
async function loadBalance(){
  var profs=await sbGet('profiles?id=eq.'+_session.user.id+'&select=total_points',_session.access_token);
  if(profs&&profs.length>0){_balance=profs[0].total_points||0;}
  // Load ROBI count from nft_rewards
  var nfts=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&nft_type=in.(ROBI,NFT_REWARD)&select=shares',_session.access_token);
  if(nfts&&nfts.length>0){_robi=0;nfts.forEach(function(n){_robi+=parseFloat(n.shares)||0;});_robi=Math.round(_robi*100)/100;}
  updateBalanceUI();
}

async function loadAirdrops(){
  _airdrops=await sbGet('airdrops?status=in.(presale,sale)&order=created_at.desc',_session.access_token)||[];
}

async function loadWatchlist(){
  if(!_session)return;
  var rows=await sbGet('airdrop_watchlist?user_id=eq.'+_session.user.id+'&select=airdrop_id',_session.access_token)||[];
  _watchlist=rows.map(function(r){return r.airdrop_id});
}
function isInWatchlist(id){return _watchlist.indexOf(id)!==-1}

async function toggleWatchlist(id,e){
  if(e)e.stopPropagation();
  if(_publicMode){window.location.href='/login?returnTo='+encodeURIComponent(location.pathname);return;}
  var token=await getValidToken();if(!token)return;
  var res=await sbRpc('toggle_watchlist',{p_airdrop_id:id},token);
  if(res&&res.ok){
    if(res.action==='added'){_watchlist.push(id);showToast('♡ <span class="it">Aggiunto ai preferiti</span><span class="en">Added to favorites</span>');}
    else{_watchlist=_watchlist.filter(function(w){return w!==id});showToast('<span class="it">Rimosso dai preferiti</span><span class="en">Removed from favorites</span>');}
    renderGrid();
    if(_currentDetail&&_currentDetail.id===id){
      // GS-8 reopen 24 May: toggla solo .active sul .heart-btn-v2 esistente.
      // Sostituire className con 'heart-btn' (vecchia classe card position:absolute)
      // teleportava il cuore in alto a destra del viewport (ROBY catch).
      var hb=document.getElementById('detail-heart');
      if(hb){
        if(isInWatchlist(id))hb.classList.add('active');
        else hb.classList.remove('active');
      }
    }
  }
}

async function loadMyParticipations(){
  _myParts=await sbGet('airdrop_participations?user_id=eq.'+_session.user.id+'&cancelled_at=is.null&select=*,airdrops(id,title,category,image_url,block_price_aria,total_blocks,blocks_sold,status,winner_id,story_public_url,story_public_visible,aria_incassato,object_value_eur,draw_executed_at)&order=created_at.desc',_session.access_token)||[];
  // Atto 6 reveal: aggregate user's ROBI shares per completed/annullato airdrop
  _myRobiByAirdrop={};
  var completedIds=_myParts
    .map(function(p){return p.airdrops&&p.airdrops.id&&['completed','annullato'].indexOf(p.airdrops.status)!==-1?p.airdrops.id:null})
    .filter(Boolean);
  if(completedIds.length){
    var uniq=Array.from(new Set(completedIds));
    var idList=uniq.map(function(id){return '"'+id+'"'}).join(',');
    var nfts=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&airdrop_id=in.('+idList+')&select=airdrop_id,shares,source,metadata',_session.access_token)||[];
    nfts.forEach(function(n){
      var aid=n.airdrop_id;if(!aid)return;
      if(!_myRobiByAirdrop[aid])_myRobiByAirdrop[aid]={shares:0,sources:[],consolation_rank:null};
      _myRobiByAirdrop[aid].shares+=Number(n.shares||0);
      _myRobiByAirdrop[aid].sources.push(n.source);
      if(n.source==='airdrop_draw_consolation'&&n.metadata&&n.metadata.consolation_rank){
        _myRobiByAirdrop[aid].consolation_rank=n.metadata.consolation_rank;
      }
    });
  }
}

async function loadMyRanks(){
  _myRanks={};
  if(!_session)return;
  var token=await getValidToken();if(!token)return;
  var data=await sbRpc('get_my_airdrop_ranks',{},token)||[];
  if(!Array.isArray(data))return;
  data.forEach(function(r){_myRanks[r.airdrop_id]={rank:r.rank,total:r.total,score:r.score,blocks:r.blocks||0,aria_spent:r.aria_spent||0};});
}

// ── Mine Tower 3D ──
function hashStr(s){var h=0;for(var i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i);return h;}

function buildMineTower(a,myBlocks){
  var total=a.total_blocks;
  var sold=a.blocks_sold;
  var others=sold-myBlocks;
  var rate=calcMiningRate(a)||50;

  var BPR=8; // blocks per ring
  var RINGS=Math.min(12,Math.max(4,Math.ceil(total/(BPR*20))));
  var vis=RINGS*BPR;

  // Proportional visual distribution
  var vOthers=Math.round(others/total*vis);
  var vMine=Math.round(myBlocks/total*vis);
  if(vMine>0&&vMine<1)vMine=1;
  if(vOthers+vMine>vis)vOthers=vis-vMine;

  // ROBI block positions (deterministic seed from airdrop ID)
  var seed=Math.abs(hashStr(a.id));
  var robiVis=Math.max(1,Math.round(vis/rate));
  if(robiVis>Math.floor(vis/3))robiVis=Math.floor(vis/3);
  var robiSet={};
  for(var r=0;r<robiVis;r++){
    var pos=Math.abs((seed*(r+1)*7919+r*13)%vis);
    robiSet[pos]=true;
  }

  var ringH=26;
  var totalH=RINGS*ringH;
  var html='<div class="mine-scene" style="height:'+(totalH+40)+'px">'
    +'<div class="mine-tower" id="mine-tower">';

  var idx=0;
  for(var ring=0;ring<RINGS;ring++){
    var y=ring*ringH;
    html+='<div class="mine-ring" style="bottom:'+y+'px">';
    for(var col=0;col<BPR;col++){
      var angle=col*(360/BPR);
      var cls='mine-block';
      if(idx<vOthers)cls+=' others';
      else if(idx<vOthers+vMine)cls+=' mine';
      else cls+=' avail';
      if(robiSet[idx])cls+=' robi';
      html+='<div class="'+cls+'" style="transform:rotateY('+angle+'deg) translateZ(65px)" data-idx="'+idx+'"></div>';
      idx++;
    }
    html+='</div>';
  }

  html+='</div>'
    +'<div class="mine-label"></div>'
    +'</div>';

  // Legend
  html+='<div class="mine-legend">'
    +(vMine>0?'<div class="mine-legend-item"><div class="mine-legend-dot m-mine"></div><span class="it">Tuoi ('+myBlocks+')</span><span class="en">Yours ('+myBlocks+')</span></div>':'')
    +(vOthers>0?'<div class="mine-legend-item"><div class="mine-legend-dot m-others"></div><span class="it">Altri ('+(sold-myBlocks)+')</span><span class="en">Others ('+(sold-myBlocks)+')</span></div>':'')
    +'<div class="mine-legend-item"><div class="mine-legend-dot m-avail"></div><span class="it">Disponibili ('+(total-sold)+')</span><span class="en">Available ('+(total-sold)+')</span></div>'
    +'<div class="mine-legend-item"><div class="mine-legend-dot m-robi"></div>ROBI</div>'
    +'</div>';

  return html;
}

/* §5 prompt ROBI (8 lug) · Reveal = UNBOXING ecommerce: pacco che si apre,
   esito reale dal server (revealed_robi_total), sempre valorizzato.
   Sostituisce piccone+coriandoli (estetica jackpot, vietata dalla legge di brand). */
function playUnboxingReveal(blocksBought,revealedRobi){
  var overlay=document.createElement('div');
  overlay.className='unbox-overlay';
  var boxSvg=''
    +'<svg viewBox="0 0 64 64">'
    +'<g class="unbox-lid"><path d="M8 24l24-10 24 10-24 10z"/><path d="M32 14v20"/></g>'
    +'<path d="M8 24v22l24 10 24-10V24"/><path d="M32 34v22"/>'
    +'</svg>';
  overlay.innerHTML='<div class="unbox-card">'
    +'<div class="unbox-pack">'+boxSvg+'</div>'
    +'<div class="unbox-blocks">+'+blocksBought+' Step</div>'
    +'<div class="unbox-result">'
    +(revealedRobi>0
      ?'<div class="unbox-robi">'+UI_ICONS.flower+' +'+revealedRobi+' ROBI Reward <span class="it">raccolti sul percorso</span><span class="en">picked up on the trail</span></div>'
       +'<div class="unbox-note"><span class="it">Gi&agrave; sul tuo portafoglio.</span><span class="en">Already in your wallet.</span></div>'
      :'<div class="unbox-note"><span class="it">La tua posizione in classifica sale. Altri fiori ROBI ti aspettano sul percorso.</span><span class="en">Your ranking position climbs. More ROBI flowers await on the trail.</span></div>')
    +'</div>'
    +'</div>';
  overlay.addEventListener('click',function(){
    overlay.classList.remove('active');
    setTimeout(function(){overlay.remove()},350);
  });
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){
    overlay.classList.add('active');
    var dur=revealedRobi>0?3000:2200;
    setTimeout(function(){
      if(!overlay.parentNode)return;
      overlay.classList.remove('active');
      setTimeout(function(){overlay.remove()},350);
    },dur);
  });
}

// ── Page routing ──
var _isApp=location.hostname==='airoobi.app'||location.hostname==='www.airoobi.app';
var PAGE_PATHS=_isApp
  ?{home:'/dashboard',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/invita',wallet:'/portafoglio',archive:'/archivio',learn:'/come-funziona-airdrop',profilo:'/profilo'}
  :{home:'/dapp',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/invita',wallet:'/portafoglio-dapp',archive:'/archivio',learn:'/come-funziona-airdrop',profilo:'/profilo'};
var PATH_TO_PAGE={'/':'home','/dashboard':'home','/dapp':'home','/dapp.html':'home','/airdrops':'explore','/esplora':'explore','/miei-airdrop':'my','/proponi':'submit','/referral-dapp':'referral','/referral':'referral','/invita':'referral','/portafoglio-dapp':'wallet','/portafoglio':'wallet','/archivio':'archive','/come-funziona-airdrop':'learn','/profilo':'profilo'};
var PAGE_HEADERS={
  explore:{it:'<em>Airdrops</em>',en:'<em>Airdrops</em>',sub_it:'Usa i tuoi ARIA per correre. Ogni Step ti avvicina alla vetta.',sub_en:'Use your ARIA to climb. Every Step brings you closer to the summit.'},
  my:{it:'I miei <em>Airdrop</em>',en:'My <em>Airdrops</em>',sub_it:'Segui le tue corse e gli Step acquistati.',sub_en:'Track your races and purchased Steps.'},
  submit:{it:'<b>Valuta</b> il tuo <em>oggetto</em>',en:'<b>Evaluate</b> your <em>item</em>',sub_it:'Hai un oggetto di valore? Mettilo in airdrop su AIROOBI.',sub_en:'Have a valuable item? Put it on airdrop on AIROOBI.'},
  referral:{it:'<em>Referral</em>',en:'<em>Referral</em>',sub_it:'Invita amici e accumula ROBI insieme. +5 ROBI per ogni invito confermato.',sub_en:'Invite friends and accumulate ROBI together. +5 ROBI for every confirmed invite.'},
  wallet:{it:'<em>Portafoglio</em>',en:'<em>Wallet</em>',sub_it:'I tuoi asset: ARIA, ROBI e KAS.',sub_en:'Your assets: ARIA, ROBI and KAS.'},
  archive:{it:'<em>Archivio</em> Airdrop',en:'Airdrop <em>Archive</em>',sub_it:'Tutti gli airdrop completati. Trasparenza totale.',sub_en:'All completed airdrops. Full transparency.'},
  learn:{it:'<em>Impara</em>',en:'<em>Learn</em>',sub_it:'Scopri come funzionano ARIA, ROBI e il motore airdrop.',sub_en:'Learn how ARIA, ROBI and the airdrop engine work.'},
  profilo:{it:'<em>Profilo</em>',en:'<em>Profile</em>',sub_it:'Account, sicurezza e preferenze.',sub_en:'Account, security and preferences.'},
};

function navigateTo(page,event){
  if(event)event.preventDefault();
  // In public mode: home → landing page, auth pages → login redirect
  if(_publicMode){
    if(page==='home'){window.location.href='/';return;}
    if(PUBLIC_PAGES.indexOf(page)===-1){
      var path=PAGE_PATHS[page]||'/';
      window.location.href='/login?returnTo='+encodeURIComponent(path);
      return;
    }
  }
  // Fix 10 lug: se un detail e' aperto, chiudilo — navigare dal topbar lasciava
  // la vista detail montata con URL cambiato (lista/detail disallineati).
  if(document.body.classList.contains('detail-open'))closeDetailView();
  showPage(page);
  var path=PAGE_PATHS[page]||'/esplora';
  if(location.pathname!==path)history.pushState({page:page},null,path);
  // Close mobile menu (MNB-1 fix 3 v2: rilascia anche body scroll-lock orfano post-tap voce)
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
  document.body.style.overflow='';
}

function showPage(page){
  ['home','explore','my','submit','referral','wallet','archive','learn','profilo'].forEach(function(t){
    var panel=document.getElementById('tab-'+t);
    if(panel)panel.style.display=page===t?'block':'none';
  });
  // Show/hide page header (home and explore use their own hero)
  var pageHeader=document.getElementById('page-header');
  if(pageHeader)pageHeader.style.display=(page==='home'||page==='explore')?'none':'block';
  // Update nav active state
  document.querySelectorAll('.topbar-nav a, .topbar-mobile-menu a').forEach(function(a){
    a.classList.toggle('active',a.dataset.page===page);
  });
  // Update page header
  var hdr=PAGE_HEADERS[page];
  if(hdr){
    var h=document.getElementById('page-header');
    if(h){
      h.querySelector('h1').innerHTML='<span class="it">'+hdr.it+'</span><span class="en">'+hdr.en+'</span>';
      h.querySelector('.dapp-hero-sub').innerHTML='<span class="it">'+hdr.sub_it+'</span><span class="en">'+hdr.sub_en+'</span>';
    }
  }
  // Refresh topbar balances on every SPA navigation (fix stale state cross-route)
  if(typeof refreshTopbarBalances==='function')refreshTopbarBalances();
  if(page==='home'){loadHomeDashboard();startFeedPolling();}
  if(page==='explore'){bindExploreSearch();}
  if(page==='my'){renderMyAirdrops();loadMySubmissions();}
  if(page==='submit'){loadValuationCost().then(function(){updateSubmitCostUI();});renderSubPhotos();}
  if(page==='referral')loadDappReferral();
  if(page==='wallet')loadDappWallet();
  if(page==='archive')loadDappArchive();
  if(page==='profilo')loadProfilePage();
  if(page==='home'&&typeof renderDailyQuests==='function')renderDailyQuests();
}

// ── Profilo page (account settings view) ──
async function loadProfilePage(){
  var emailEl=document.getElementById('profilo-email');
  var nameEl=document.getElementById('profilo-name');
  var sinceEl=document.getElementById('profilo-since');
  var usernameEl=document.getElementById('profilo-username');
  if(emailEl&&_session&&_session.user)emailEl.textContent=_session.user.email||'—';
  // Fetch profile detail — Round 6 added username + corrected full_name → first_name,last_name
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await fetch(SB_URL+'/rest/v1/profiles?select=first_name,last_name,username,created_at&id=eq.'+_session.user.id,{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(!res.ok)return;
    var rows=await res.json();
    if(!rows||!rows.length)return;
    var p=rows[0];
    _currentProfile={first_name:p.first_name||'',last_name:p.last_name||'',username:p.username||''};
    var fullName=((p.first_name||'')+' '+(p.last_name||'')).trim();
    if(nameEl)nameEl.textContent=fullName||(_session.user.email?_session.user.email.split('@')[0]:'—');
    if(usernameEl)usernameEl.textContent=p.username?'@'+p.username:'—';
    if(sinceEl&&p.created_at){
      var d=new Date(p.created_at);
      sinceEl.textContent=d.toLocaleDateString(document.documentElement.getAttribute('data-lang')==='en'?'en-US':'it-IT',{year:'numeric',month:'long',day:'numeric'});
    }
  }catch(e){}
}

// ── Round 6 · Profilo Edit Modal (username feature) ──
var _currentProfile={first_name:'',last_name:'',username:''};
var _usernameCheckTimeout=null;
var _usernameAvailable=true;

function showProfiloEditModal(){
  var modal=document.getElementById('profilo-edit-modal');if(!modal)return;
  document.getElementById('edit-name').value=_currentProfile.first_name||'';
  document.getElementById('edit-surname').value=_currentProfile.last_name||'';
  document.getElementById('edit-username').value=_currentProfile.username||'';
  document.getElementById('username-feedback').textContent='';
  document.getElementById('username-feedback').className='form-feedback';
  document.getElementById('profilo-edit-error').style.display='none';
  _usernameAvailable=true;
  modal.classList.add('active');
}

function hideProfiloEditModal(){
  var modal=document.getElementById('profilo-edit-modal');if(!modal)return;
  modal.classList.remove('active');
  if(_usernameCheckTimeout){clearTimeout(_usernameCheckTimeout);_usernameCheckTimeout=null;}
}

// Decision #5 LOCKED: debounced 300ms su input completion
function onUsernameInput(input){
  if(_usernameCheckTimeout)clearTimeout(_usernameCheckTimeout);
  var feedback=document.getElementById('username-feedback');
  feedback.className='form-feedback checking';
  feedback.textContent=document.documentElement.getAttribute('data-lang')==='en'?'…':'…';
  _usernameCheckTimeout=setTimeout(function(){checkUsernameAvailability(input)},300);
}

async function checkUsernameAvailability(input){
  var username=(input.value||'').trim().toLowerCase();
  var feedback=document.getElementById('username-feedback');
  var lang=document.documentElement.getAttribute('data-lang')==='en'?'en':'it';
  // Same as current → no need to check
  if(username===_currentProfile.username){
    feedback.className='form-feedback';
    feedback.textContent='';
    _usernameAvailable=true;
    return;
  }
  // Format validation client-side
  if(!/^[a-z0-9_]{3,30}$/.test(username)){
    feedback.className='form-feedback taken';
    feedback.textContent=lang==='it'?'Formato non valido (3-30 char · a-z 0-9 _)':'Invalid format (3-30 char · a-z 0-9 _)';
    _usernameAvailable=false;
    return;
  }
  feedback.className='form-feedback checking';
  feedback.textContent=lang==='it'?'Verifica…':'Checking…';
  try{
    var token=await getValidToken();if(!token){_usernameAvailable=true;return;}
    var data=await sbRpc('check_username_available',{p_username:username},token);
    if(data&&data.available){
      feedback.className='form-feedback available';
      feedback.textContent=lang==='it'?'✓ Disponibile':'✓ Available';
      _usernameAvailable=true;
    } else {
      feedback.className='form-feedback taken';
      var reason=data&&data.reason||'username_taken';
      feedback.textContent=lang==='it'
        ?(reason==='reserved'?'✗ Username riservato':reason==='invalid_format'?'✗ Formato non valido':'✗ Username gi&agrave; preso')
        :(reason==='reserved'?'✗ Reserved username':reason==='invalid_format'?'✗ Invalid format':'✗ Username taken');
      _usernameAvailable=false;
    }
  }catch(e){
    feedback.className='form-feedback';feedback.textContent='';_usernameAvailable=true;
  }
}

async function submitProfiloEdit(event){
  event.preventDefault();
  var name=(document.getElementById('edit-name').value||'').trim();
  var surname=(document.getElementById('edit-surname').value||'').trim();
  var username=(document.getElementById('edit-username').value||'').trim().toLowerCase();
  var errorBox=document.getElementById('profilo-edit-error');
  var saveBtn=document.getElementById('profilo-edit-save');
  var lang=document.documentElement.getAttribute('data-lang')==='en'?'en':'it';
  errorBox.style.display='none';
  if(!_usernameAvailable){
    errorBox.style.display='block';
    errorBox.textContent=lang==='it'?'Username non disponibile. Scegline un altro.':'Username not available. Choose another.';
    return;
  }
  saveBtn.disabled=true;
  try{
    var token=await getValidToken();if(!token)throw new Error('no_token');
    var data=await sbRpc('update_user_profile',{p_name:name,p_surname:surname,p_username:username},token);
    if(data&&data.error){
      errorBox.style.display='block';
      errorBox.textContent=mapProfiloEditError(data.error,data.next_change_at,lang);
      saveBtn.disabled=false;
      return;
    }
    hideProfiloEditModal();
    loadProfilePage();
    showToast(lang==='it'?'Profilo aggiornato.':'Profile updated.');
  }catch(e){
    errorBox.style.display='block';
    errorBox.textContent=lang==='it'?'Errore di rete. Riprova.':'Network error. Retry.';
    saveBtn.disabled=false;
  }
}

function mapProfiloEditError(code,nextChangeAt,lang){
  var locale=lang==='en'?'en-US':'it-IT';
  var dateStr=nextChangeAt?new Date(nextChangeAt).toLocaleDateString(locale):'';
  var msg={
    not_authenticated:{it:'Sessione scaduta. Effettua di nuovo il login.',en:'Session expired. Please log in again.'},
    invalid_name_length:{it:'Nome non valido (1-50 caratteri).',en:'Invalid first name (1-50 chars).'},
    invalid_surname_length:{it:'Cognome non valido (1-50 caratteri).',en:'Invalid last name (1-50 chars).'},
    invalid_username_format:{it:'Formato username non valido.',en:'Invalid username format.'},
    username_reserved:{it:'Username riservato dal sistema.',en:'Username reserved by system.'},
    username_taken:{it:'Username gi&agrave; preso.',en:'Username taken.'},
    username_rate_limit:{it:'Username cambiabile dopo '+dateStr+'.',en:'Username changeable after '+dateStr+'.'}
  };
  return (msg[code]&&msg[code][lang])||(lang==='it'?'Errore sconosciuto':'Unknown error');
}

// ── Topbar balance refresh (used on cross-route SPA navigation) ──
async function refreshTopbarBalances(){
  if(!_session||!_session.user)return;
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await fetch(SB_URL+'/rest/v1/profiles?select=total_points,kas_balance&id=eq.'+_session.user.id,{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(!res.ok)return;
    var rows=await res.json();
    if(!rows||!rows.length)return;
    var p=rows[0];
    var ariaEl=document.getElementById('topbar-aria-val');
    if(ariaEl&&p.total_points!=null)ariaEl.textContent=p.total_points;
    // ROBI = somma di nft_rewards.shares (solo ROBI/NFT_REWARD — canone come
    // le altre viste; la vecchia query usava .amount, colonna inesistente:
    // saldo topbar rotto in silenzio, scoperto nel check ABO 8 lug 2026)
    var rRes=await fetch(SB_URL+'/rest/v1/nft_rewards?select=shares&nft_type=in.(ROBI,NFT_REWARD)&user_id=eq.'+_session.user.id,{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(rRes.ok){
      var rRows=await rRes.json();
      var robiTotal=(rRows||[]).reduce(function(s,r){return s+(parseFloat(r.shares)||0)},0);
      var robiEl=document.getElementById('topbar-robi-val');
      if(robiEl)robiEl.textContent=robiTotal.toFixed(0);
    }
    // GS-6: ROBI market data pill (price + trend 24h)
    try{
      var mdRes=await fetch(SB_URL+'/rest/v1/rpc/get_robi_market_data',{
        method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}'
      });
      if(mdRes.ok){
        var md=await mdRes.json();
        var priceEl=document.getElementById('topbar-robi-price');
        var valEl=document.getElementById('topbar-robi-price-val');
        var trendEl=document.getElementById('topbar-robi-price-trend');
        if(priceEl&&valEl&&md&&md.price_eur!=null){
          valEl.textContent='€'+Number(md.price_eur).toFixed(2);
          if(trendEl){
            if(md.trend_24h_pct!=null){
              var tp=Number(md.trend_24h_pct);
              var arrow=tp>0?'↑':(tp<0?'↓':'·');
              var cls=tp>0?'up':(tp<0?'down':'flat');
              trendEl.className='topbar-robi-trend '+cls;
              trendEl.textContent=arrow+' '+Math.abs(tp).toFixed(1)+'%';
              trendEl.style.display='';
            }else{
              trendEl.style.display='none';
            }
          }
          priceEl.style.display='';
        }
      }
    }catch(_){}
  }catch(e){}
}

// ── Category filter ──
function renderCategoryFilter(){
  // 10 lug (Skeezu PM): fila unica — le pill assorbono i contatori LIVE
  // del vecchio cat-dashboard (renderCatDashboard ora è no-op).
  var counts={};
  _airdrops.forEach(function(a){var c=a.category;if(!c)return;counts[c]=(counts[c]||0)+1;});
  var wrap=document.getElementById('cat-filter');
  function badge(n){return n>0?' <span class="cat-pill-count">'+n+'</span>':'';}
  var html='<button class="cat-pill active" onclick="filterCat(\'all\')"><span class="it">Tutti</span><span class="en">All</span>'+badge(_airdrops.length)+'</button>';
  html+='<button class="cat-pill" onclick="filterCat(\'favorites\')">♡ <span class="it">Preferiti</span><span class="en">Favorites</span></button>';
  if(_session&&_session.user)html+='<button class="cat-pill" onclick="filterCat(\'mine\')"><span class="it">Solo miei</span><span class="en">My own</span></button>';
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury',smartphone:'Smartphone',tablet:'Tablet',computer:'Computer',gaming:'Gaming',audio:'Audio',fotografia:'Fotografia',orologi:'Orologi',gioielli:'Gioielli',borse:'Borse',moda:'Moda',biciclette:'Biciclette',arredamento:'Arredamento',sport:'Sport',strumenti:'Strumenti',arte:'Arte',vino:'Vini'};
  Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]||a.localeCompare(b);}).forEach(function(c){
    html+='<button class="cat-pill" onclick="filterCat(\''+c+'\')">'+( catLabels[c]||c)+badge(counts[c])+'</button>';
  });
  wrap.innerHTML=html;
  attachCatFilterNav();
  updateCatFilterNav();
}

// Nav per strip filtri categoria (frecce + fade + wheel)
var _catFilterNavBound=false;
function scrollCatFilter(dir){
  var row=document.getElementById('cat-filter');
  if(!row)return;
  var amount=Math.max(180,Math.round(row.clientWidth*0.7))*dir;
  if(typeof row.scrollBy==='function'){row.scrollBy({left:amount,behavior:'smooth'});}
  else{row.scrollLeft+=amount;}
}
function updateCatFilterNav(){
  var row=document.getElementById('cat-filter');
  var prev=document.getElementById('cat-filter-prev');
  var next=document.getElementById('cat-filter-next');
  if(!row||!prev||!next)return;
  var canScroll=row.scrollWidth>row.clientWidth+4;
  var atStart=row.scrollLeft<=4;
  var atEnd=row.scrollLeft>=(row.scrollWidth-row.clientWidth-4);
  prev.classList.toggle('visible',canScroll&&!atStart);
  next.classList.toggle('visible',canScroll&&!atEnd);
  var wrap=row.parentElement;
  var fl=wrap&&wrap.querySelector('.cat-fade.left');
  var fr=wrap&&wrap.querySelector('.cat-fade.right');
  if(fl)fl.classList.toggle('visible',canScroll&&!atStart);
  if(fr)fr.classList.toggle('visible',canScroll&&!atEnd);
}
function attachCatFilterNav(){
  if(_catFilterNavBound)return;
  var row=document.getElementById('cat-filter');
  if(!row)return;
  row.addEventListener('scroll',function(){updateCatFilterNav();},{passive:true});
  window.addEventListener('resize',function(){updateCatFilterNav();});
  row.addEventListener('wheel',function(e){
    if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
    if(row.scrollWidth<=row.clientWidth+4)return;
    e.preventDefault();
    row.scrollLeft+=e.deltaY;
  },{passive:false});
  _catFilterNavBound=true;
}

function filterCat(cat){
  _currentFilter=cat;
  document.querySelectorAll('.cat-pill').forEach(function(p){
    var txt=p.textContent.trim();
    var isCat=false;
    if(cat==='all')isCat=!!txt.match(/Tutti|All/);
    else if(cat==='favorites')isCat=txt.indexOf('♡')!==-1;
    else if(cat==='mine')isCat=!!txt.match(/Solo miei|My own/);
    else isCat=txt.toLowerCase()===cat.toLowerCase();
    p.classList.toggle('active',isCat);
  });
  renderGrid();
}

function changeSort(value){
  _currentSort=value||'deadline';
  renderGrid();
}

function bindExploreSearch(){
  var input=document.getElementById('etb-search-input');
  if(!input||input.dataset.bound)return;
  input.dataset.bound='1';
  input.addEventListener('input',function(){
    clearTimeout(_searchDebounce);
    var v=input.value||'';
    _searchDebounce=setTimeout(function(){
      _searchQuery=v.trim();
      renderGrid();
    },180);
  });
}

// ── Category Dashboard ──
var _comingSoonItems=[];
function renderCatDashboard(){
  // 10 lug (Skeezu PM): fila B rimossa — diceva le stesse cose delle pill.
  // I contatori LIVE vivono ora dentro le pill di renderCategoryFilter.
  var wrap=document.getElementById('cat-dashboard');
  if(wrap){wrap.style.display='none';var row=document.getElementById('cat-dashboard-row');if(row)row.innerHTML='';}
  return;
  /* eslint-disable no-unreachable */
  var row=document.getElementById('cat-dashboard-row');
  if(!wrap||!row)return;

  // Count active per category
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury',smartphone:'Smartphone',tablet:'Tablet',computer:'Computer',gaming:'Gaming',audio:'Audio',fotografia:'Fotografia',orologi:'Orologi',gioielli:'Gioielli',borse:'Borse',moda:'Moda',biciclette:'Biciclette',arredamento:'Arredamento',sport:'Sport',strumenti:'Strumenti',arte:'Arte',vino:'Vini'};
  var cats={};
  _airdrops.forEach(function(a){
    var c=a.category||'altro';
    if(!cats[c])cats[c]={active:0,coming:0};
    cats[c].active++;
  });
  // Count coming soon per category
  _comingSoonItems.forEach(function(a){
    var c=a.category||'altro';
    if(!cats[c])cats[c]={active:0,coming:0};
    cats[c].coming++;
  });

  var keys=Object.keys(cats);
  if(keys.length===0){wrap.style.display='none';return;}
  wrap.style.display='block';

  // Totals
  var totalActive=_airdrops.length;
  var totalComing=_comingSoonItems.length;

  var html='<div style="flex:0 0 auto;padding:10px 16px;border:1px solid rgba(239,62,79,.2);background:rgba(239,62,79,.04);border-radius:var(--radius-sm);text-align:center;min-width:90px">'
    +'<div style="font-family:var(--font-m);font-size:20px;color:var(--gold);font-weight:600">'+totalActive+'</div>'
    +'<div style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-400);text-transform:uppercase;margin-top:2px"><span class="it">Attivi</span><span class="en">Active</span></div>'
    +'</div>';

  if(totalComing>0){
    html+='<div style="flex:0 0 auto;padding:10px 16px;border:1px solid rgba(240,160,48,.15);background:rgba(240,160,48,.03);border-radius:var(--radius-sm);text-align:center;min-width:90px">'
      +'<div style="font-family:var(--font-m);font-size:20px;color:#f0a030;font-weight:600">'+totalComing+'</div>'
      +'<div style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-400);text-transform:uppercase;margin-top:2px"><span class="it">In arrivo</span><span class="en">Coming</span></div>'
      +'</div>';
  }

  // Divider
  html+='<div style="flex:0 0 1px;background:var(--gray-800);align-self:stretch;margin:0 4px"></div>';

  keys.sort().forEach(function(c){
    var d=cats[c];
    var label=catLabels[c]||c;
    html+='<div style="flex:0 0 auto;padding:10px 16px;border:1px solid rgba(255,255,255,.06);background:var(--card-bg);border-radius:var(--radius-sm);text-align:center;min-width:80px">'
      +'<div style="font-family:var(--font-m);font-size:11px;letter-spacing:1px;color:var(--white);margin-bottom:4px">'+label+'</div>'
      +'<div style="display:flex;gap:8px;justify-content:center;font-family:var(--font-m);font-size:10px">'
      +'<span style="color:var(--aria)">'+d.active+' <span style="color:var(--gray-500);font-size:8px">LIVE</span></span>'
      +(d.coming>0?'<span style="color:#f0a030">'+d.coming+' <span style="color:var(--gray-500);font-size:8px">SOON</span></span>':'')
      +'</div></div>';
  });

  row.innerHTML=html;
  attachCatDashboardNav();
  updateCatDashboardNav();
}

// Scroll + visibility control for category strip
var _catNavBound=false;
function scrollCatDashboard(dir){
  var row=document.getElementById('cat-dashboard-row');
  if(!row)return;
  // Scorri del ~70% della larghezza visibile (min 220px) nella direzione
  var amount=Math.max(220,Math.round(row.clientWidth*0.7))*dir;
  if(typeof row.scrollBy==='function'){row.scrollBy({left:amount,behavior:'smooth'});}
  else{row.scrollLeft+=amount;}
}
function updateCatDashboardNav(){
  var row=document.getElementById('cat-dashboard-row');
  var prev=document.getElementById('cat-dashboard-prev');
  var next=document.getElementById('cat-dashboard-next');
  if(!row||!prev||!next)return;
  var canScroll=row.scrollWidth>row.clientWidth+4;
  var atStart=row.scrollLeft<=4;
  var atEnd=row.scrollLeft>=(row.scrollWidth-row.clientWidth-4);
  prev.classList.toggle('visible',canScroll&&!atStart);
  next.classList.toggle('visible',canScroll&&!atEnd);
  var wrap=row.parentElement;
  var fl=wrap&&wrap.querySelector('.cat-fade.left');
  var fr=wrap&&wrap.querySelector('.cat-fade.right');
  if(fl)fl.classList.toggle('visible',canScroll&&!atStart);
  if(fr)fr.classList.toggle('visible',canScroll&&!atEnd);
}
function attachCatDashboardNav(){
  if(_catNavBound)return;
  var row=document.getElementById('cat-dashboard-row');
  if(!row)return;
  row.addEventListener('scroll',function(){updateCatDashboardNav();},{passive:true});
  window.addEventListener('resize',function(){updateCatDashboardNav();});
  // Wheel verticale → scroll orizzontale (desktop senza trackpad orizzontale)
  row.addEventListener('wheel',function(e){
    if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
    if(row.scrollWidth<=row.clientWidth+4)return;
    e.preventDefault();
    row.scrollLeft+=e.deltaY;
  },{passive:false});
  _catNavBound=true;
}

// ── Notifications (in-app) ──
var _notifOpen=false;

async function loadNotifications(){
  if(!_session)return;
  var token=await getValidToken();if(!token)return;
  var rows=await sbGet('notifications?user_id=eq.'+_session.user.id+'&order=created_at.desc&limit=30',token)||[];
  var unread=rows.filter(function(r){return !r.read}).length;
  _lastNotifCount=unread; // init count to avoid toast on first load
  var badge=document.getElementById('notif-badge');
  if(badge){
    if(unread>0){badge.style.display='flex';badge.textContent=unread>99?'99+':unread;}
    else{badge.style.display='none';}
  }
  var bell=document.getElementById('notif-bell');
  if(bell)bell.classList.toggle('has-unread',unread>0);
  // Render list
  var list=document.getElementById('notif-list');
  if(!list)return;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(!rows.length){
    list.innerHTML='<div style="color:var(--gray-500);font-size:12px;text-align:center;padding:24px">'+(lang==='it'?'Nessuna notifica':'No notifications')+'</div>';
    return;
  }
  list.innerHTML=rows.map(function(n){
    var time=new Date(n.created_at).toLocaleString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    var isMsg=n.type==='message';
    var onclick=isMsg
      ?'notifGoToChat(\''+n.id+'\')'
      :'markNotifRead(\''+n.id+'\')';
    var airdropLink='';
    if(n.airdrop_id){
      airdropLink='<div style="margin-top:6px"><a onclick="event.stopPropagation();markNotifRead(\''+n.id+'\');notifGoToAirdrop(\''+n.airdrop_id+'\')" style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--aria);cursor:pointer;text-decoration:none;border:1px solid rgba(74,158,255,.25);padding:4px 10px;border-radius:var(--radius-sm);transition:all .3s" onmouseover="this.style.background=\'rgba(74,158,255,.1)\'" onmouseout="this.style.background=\'transparent\'">'+(lang==='it'?'VAI ALL\'AIRDROP':'GO TO AIRDROP')+'</a></div>';
    }
    return '<div class="notif-item'+(n.read?'':' unread')+'" data-id="'+n.id+'" onclick="'+onclick+'">'
      +'<div class="notif-title">'+escHtml(n.title||'AIROOBI')+'</div>'
      +'<div>'+escHtml(n.body||'')+'</div>'
      +airdropLink
      +'<div class="notif-time">'+time+'</div>'
      +'</div>';
  }).join('');
}

// Nielsen audit 16 lug: stato pannello+backdrop SEMPRE sincronizzati da un
// unico punto — chiusure sparse lasciavano il backdrop attivo sopra la pagina
// (click morti ovunque finché non ricaricavi).
function setNotifPanel(open){
  _notifOpen=!!open;
  var panel=document.getElementById('notif-panel');
  if(panel)panel.style.display=_notifOpen?'block':'none';
  var bd=document.getElementById('notif-panel-backdrop');
  if(!bd&&_notifOpen){
    bd=document.createElement('div');
    bd.id='notif-panel-backdrop';
    bd.className='notif-panel-backdrop';
    bd.addEventListener('click',function(){setNotifPanel(false)});
    document.body.appendChild(bd);
  }
  if(bd)bd.classList.toggle('active',_notifOpen);
  if(_notifOpen)loadNotifications();
}
function toggleNotifPanel(){setNotifPanel(!_notifOpen);}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&_notifOpen)setNotifPanel(false);});

async function markNotifRead(id){
  var token=await getValidToken();if(!token)return;
  await fetch(SB_URL+'/rest/v1/notifications?id=eq.'+id,{
    method:'PATCH',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json','Prefer':'return=minimal'},
    body:JSON.stringify({read:true})
  });
  var item=document.querySelector('.notif-item[data-id="'+id+'"]');
  if(item)item.classList.remove('unread');
  // Update badge count
  var badge=document.getElementById('notif-badge');
  if(badge){
    var count=parseInt(badge.textContent)||0;
    if(count>1){badge.textContent=count-1;}else{badge.style.display='none';}
  }
}

function notifGoToChat(notifId){
  markNotifRead(notifId);
  setNotifPanel(false);
  // Navigate to miei-airdrop and open all chats
  navigateTo('my');
}

function notifGoToAirdrop(airdropId){
  setNotifPanel(false);
  goToAirdrop(airdropId);
}

async function markAllNotifRead(){
  var token=await getValidToken();if(!token)return;
  await fetch(SB_URL+'/rest/v1/notifications?user_id=eq.'+_session.user.id+'&read=eq.false',{
    method:'PATCH',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json','Prefer':'return=minimal'},
    body:JSON.stringify({read:true})
  });
  loadNotifications();
}

function showNotifToast(title,body){
  var container=document.getElementById('notif-toast-container');
  if(!container)return;
  var toast=document.createElement('div');
  toast.className='notif-toast';
  toast.innerHTML='<div class="notif-toast-title">'+escHtml(title||'AIROOBI')+'</div><div class="notif-toast-body">'+escHtml(body||'')+'</div>';
  toast.onclick=function(){toast.remove();navigateTo('my');};
  container.appendChild(toast);
  requestAnimationFrame(function(){toast.classList.add('show');});
  setTimeout(function(){toast.classList.remove('show');setTimeout(function(){toast.remove();},400);},5000);
}

var _lastNotifCount=0;
async function pollNotifications(){
  if(!_session)return;
  var token=await getValidToken();if(!token)return;
  var rows=await sbGet('notifications?user_id=eq.'+_session.user.id+'&read=eq.false&order=created_at.desc&limit=5',token)||[];
  var count=rows.length;
  if(count>_lastNotifCount&&_lastNotifCount>=0){
    // New notifications arrived — show toast for each new one
    var newOnes=rows.slice(0,count-_lastNotifCount);
    newOnes.forEach(function(n){showNotifToast(n.title,n.body);});
  }
  _lastNotifCount=count;
  // Update badge
  var badge=document.getElementById('notif-badge');
  if(badge){
    if(count>0){badge.style.display='flex';badge.textContent=count>99?'99+':count;}
    else{badge.style.display='none';}
  }
  var bell=document.getElementById('notif-bell');
  if(bell)bell.classList.toggle('has-unread',count>0);
}
// Poll every 30s
setInterval(pollNotifications,30000);

// Close notif panel on outside click
document.addEventListener('click',function(e){
  if(_notifOpen&&!e.target.closest('#notif-panel')&&!e.target.closest('#notif-bell')){
    setNotifPanel(false);
  }
});

// ── Countdown helpers ──
function fmtCountdown(deadline){
  if(!deadline)return null;
  var diff=new Date(deadline)-Date.now();
  if(diff<=0)return{text:'Scaduto',en:'Expired',urgent:false,expired:true};
  var h=Math.floor(diff/3600000);var m=Math.floor((diff%3600000)/60000);var s=Math.floor((diff%60000)/1000);
  var urgent=diff<7200000; // < 2h
  if(h>=24){var d=Math.floor(h/24);h=h%24;return{text:d+'g '+h+'h '+m+'m',en:d+'d '+h+'h '+m+'m',urgent:urgent,expired:false};}
  return{text:h+'h '+m+'m '+s+'s',en:h+'h '+m+'m '+s+'s',urgent:urgent,expired:false};
}

function durationBadge(dtype){
  if(dtype==='flash')return '<div class="duration-badge flash">FLASH ⚡</div>';
  if(dtype==='extended')return '<div class="duration-badge extended">72H</div>';
  return '<div class="duration-badge standard">24H</div>';
}

function startCountdowns(){
  if(_countdownInterval)clearInterval(_countdownInterval);
  _countdownInterval=setInterval(function(){
    document.querySelectorAll('[data-deadline]').forEach(function(el){
      var cd=fmtCountdown(el.dataset.deadline);
      if(!cd)return;
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      el.textContent=lang==='it'?cd.text:cd.en;
      el.className='card-countdown'+(cd.urgent?' urgent':'')+(cd.expired?' expired':'');
    });
    // Detail countdown
    var dc=document.getElementById('detail-countdown');
    if(dc&&dc.dataset.deadline){
      var cd=fmtCountdown(dc.dataset.deadline);
      if(cd){
        var lang=document.documentElement.getAttribute('data-lang')||'it';
        if(dc.closest('.rm-chip')){
          // 19 lug: nel chip compatto solo il tempo, niente pillola dentro la pillola
          dc.textContent=cd.expired?(lang==='it'?'chiusa':'closed'):(lang==='it'?cd.text:cd.en);
          if(dc.parentElement)dc.parentElement.classList.toggle('urgent',!!cd.urgent&&!cd.expired);
        }else{
          dc.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> '
            +'<span class="it">'+(cd.expired?'Deadline scaduta':cd.text+' alla chiusura')+'</span>'
            +'<span class="en">'+(cd.expired?'Deadline expired':cd.en+' to close')+'</span>';
          dc.className='detail-countdown'+(cd.urgent?' urgent':'');
        }
      }
    }
  },1000);
}

// ── Grid ──
function renderGrid(){
  var grid=document.getElementById('grid');
  var empty=document.getElementById('empty');
  var list;
  if(_currentFilter==='all')list=_airdrops;
  else if(_currentFilter==='favorites')list=_airdrops.filter(function(a){return isInWatchlist(a.id)});
  else if(_currentFilter==='mine'){
    var myPartIds={};
    _myParts.forEach(function(p){var aid=p.airdrop_id||p.airdrops?.id;if(aid)myPartIds[aid]=true;});
    var uid=_session&&_session.user?_session.user.id:null;
    list=_airdrops.filter(function(a){return myPartIds[a.id]||(uid&&a.submitted_by===uid)});
  }
  else list=_airdrops.filter(function(a){return a.category===_currentFilter});

  // Search filter (title + category)
  if(_searchQuery){
    var q=_searchQuery.toLowerCase();
    list=list.filter(function(a){
      return (a.title||'').toLowerCase().indexOf(q)>-1
        || (a.category||'').toLowerCase().indexOf(q)>-1
        || (a.code||'').toLowerCase().indexOf(q)>-1;
    });
  }

  // Sort
  list=list.slice().sort(function(a,b){
    switch(_currentSort){
      case 'robi':
        var rA=a.total_blocks/(calcMiningRate(a)||50);
        var rB=b.total_blocks/(calcMiningRate(b)||50);
        return rB-rA;
      case 'popularity':
        return (b.blocks_sold||0)-(a.blocks_sold||0);
      case 'newest':
        return new Date(b.created_at||0)-new Date(a.created_at||0);
      case 'deadline':
      default:
        var dA=a.deadline?new Date(a.deadline):new Date('2099-01-01');
        var dB=b.deadline?new Date(b.deadline):new Date('2099-01-01');
        return dA-dB;
    }
  });

  // Update live count in hero slim
  var countEl=document.getElementById('ehs-count-val');
  if(countEl)countEl.textContent=list.length;

  renderCatDashboard();

  if(!list||list.length===0){
    grid.innerHTML='';
    // Nielsen audit 16 lug: con una ricerca/filtro attivo il messaggio deve dire
    // "nessun risultato", non "nessun airdrop attivo" (che sarebbe falso).
    var et=empty.querySelector('.empty-title');var es=empty.querySelector('.empty-sub');
    var hasFilter=_searchQuery||(_currentFilter&&_currentFilter!=='all');
    if(et&&es){
      if(hasFilter){
        var qLbl=_searchQuery?'&laquo;'+escHtml(_searchQuery)+'&raquo;':'';
        et.innerHTML='<span class="it">Nessun risultato '+(qLbl?'per '+qLbl:'')+'</span><span class="en">No results '+(qLbl?'for '+qLbl:'')+'</span>';
        es.innerHTML='<span class="it">Prova con un altro termine oppure </span><span class="en">Try another term or </span><a style="color:var(--accent,#e05252);cursor:pointer;text-decoration:underline" onclick="var i=document.getElementById(\'etb-search-input\');if(i){i.value=\'\';i.dispatchEvent(new Event(\'input\',{bubbles:true}));}_searchQuery=\'\';filterCat(\'all\')"><span class="it">azzera la ricerca</span><span class="en">clear the search</span></a>';
        if(_searchQuery)searchArchiveByQuery(_searchQuery,es);
      }else{
        et.innerHTML='<span class="it">Nessun airdrop attivo</span><span class="en">No active airdrops</span>';
        var _vc=window._pubCounters&&window._pubCounters.valutazioni_in_corso;
        es.innerHTML=_vc
          ?'<span class="it">Per&ograve; '+(_vc===1?'1 oggetto &egrave;':_vc+' oggetti sono')+' gi&agrave; in valutazione: i prossimi airdrop stanno arrivando.</span><span class="en">But '+(_vc===1?'1 item is':_vc+' items are')+' already under evaluation: the next airdrops are on their way.</span>'
          :'<span class="it">Torna presto — nuovi oggetti in arrivo.</span><span class="en">Come back soon — new items incoming.</span>';
      }
    }
    empty.style.display='block';
    return;
  }
  empty.style.display='none';

  var placeholderSvg='<svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>';

  grid.innerHTML=list.map(function(a){
    var pct=a.total_blocks>0?Math.round(a.blocks_sold/a.total_blocks*100):0;
    var remaining=a.total_blocks-a.blocks_sold;
    // Badge: presale vs sale, then fill status
    var badge='';
    var isPresale=a.status==='presale';
    if(isPresale)badge='<div class="card-badge presale">Presale · 2x Mining</div>';
    else if(pct>=80)badge='<div class="card-badge ending"><span class="it">Ultimi</span><span class="en">Ending</span></div>';
    else if(pct>=50)badge='<div class="card-badge hot">Hot</div>';
    else badge='<div class="card-badge sale">Live</div>';

    // Gallery images for card
    var cardImgs=[a.image_url];
    var cpi=a.product_info||{};
    var cExtra=cpi.extra_photos||[];
    for(var ci=0;ci<cExtra.length;ci++){if(cExtra[ci]&&cardImgs.indexOf(cExtra[ci])===-1)cardImgs.push(cExtra[ci]);}

    var imgHtml;
    if(cardImgs.length>1&&cardImgs[0]){
      var dotsHtml='<div class="card-gallery-dots">';
      var imgsHtml='';
      for(var gi=0;gi<cardImgs.length;gi++){
        imgsHtml+='<img src="'+cardImgs[gi]+'" alt="" loading="lazy"'+(gi===0?' class="active"':'')+' data-idx="'+gi+'">';
        dotsHtml+='<span class="card-gallery-dot'+(gi===0?' active':'')+'"></span>';
      }
      dotsHtml+='</div>';
      imgHtml='<div class="card-gallery" data-card-gallery>'+imgsHtml+dotsHtml+'</div>';
    } else if(a.image_url){
      imgHtml='<div class="card-gallery"><img class="active" src="'+a.image_url+'" alt="" loading="lazy"></div>';
    } else {
      imgHtml='<div class="card-img-placeholder">'+placeholderSvg+'</div>';
    }

    // Price display
    var currentPrice=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
    var priceHtml=currentPrice+' '+tokIcon('ARIA')+' / <span>Step</span>';
    if(isPresale&&a.presale_block_price)priceHtml+='<span class="card-presale-price">'+a.block_price_aria+'</span>';

    var cd=fmtCountdown(a.deadline);
    var cdHtml=cd?'<span class="card-countdown'+(cd.urgent?' urgent':'')+'" data-deadline="'+a.deadline+'">'+(cd.expired?'—':cd.text)+'</span>':'';
    var heartCls=isInWatchlist(a.id)?'heart-btn active':'heart-btn';
    var rankInfo=_myRanks[a.id];

    // ROBI projection for this user
    var miningRate=calcMiningRate(a);
    var myBlk=rankInfo?rankInfo.blocks:0;
    var myRobi=miningRate>0&&myBlk>0?(myBlk/miningRate):0;
    var robiEur=myRobi*_robiPrice;

    // Combined rank + ROBI row
    var myStatsHtml='';
    if(myBlk>0){
      myStatsHtml='<div class="card-my-stats">';
      if(rankInfo)myStatsHtml+='<div class="card-stat-pill rank"><div class="card-stat-icon">#</div><div class="card-stat-content"><div class="card-stat-value">'+rankInfo.rank+' / '+rankInfo.total+'</div><div class="card-stat-label"><span class="it">Posizione</span><span class="en">Rank</span></div></div></div>';
      // 19 lug (Skeezu): monogramma OO flat rossa/nera al posto del PNG con sfondo
      myStatsHtml+='<div class="card-stat-pill robi"><span class="info-i" onclick="event.stopPropagation();showInfoTip(this,\'robi-card-projection\')">i</span><div class="card-stat-icon"><svg viewBox="0 0 34 20" width="26" height="16" fill="none" stroke-width="3"><circle cx="10" cy="10" r="7" stroke="#EF3E4F"/><circle cx="24" cy="10" r="7" stroke="currentColor"/></svg></div><div class="card-stat-content"><div class="card-stat-value">'+myRobi.toFixed(1)+'</div><div class="card-stat-label">ROBI</div></div></div>';
      myStatsHtml+='</div>';
    }

    return '<div class="card" onclick="goToAirdrop(\''+a.id+'\')">'
      +'<span class="airdrop-badge-demo"><span class="it">DEMO ALPHA</span><span class="en">ALPHA DEMO</span></span>'
      +badge
      +durationBadge(a.duration_type)
      +imgHtml
      +'<div class="card-img-row">'
      +'<div class="card-cat">'+(CAT_ICONS[a.category]||'')+' '+(a.category||'')+(a.code?' <span class="card-code">#'+escHtml(a.code)+'</span>':'')+'</div>'
      +'<div class="card-actions">'
      +'<button class="share-btn" data-id="'+a.id+'" data-title="'+escHtml(a.title||'').replace(/"/g,'&quot;')+'" data-img="'+escHtml(a.image_url||'').replace(/"/g,'&quot;')+'" onclick="shareFromBtn(this,event)" title="Condividi"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>'
      +'<button class="'+heartCls+' card-heart" onclick="toggleWatchlist(\''+a.id+'\',event)">&#9825;</button>'
      +'</div>'
      +'</div>'
      +'<div class="card-body">'
      +'<div class="card-title">'+a.title+'</div>'
      +cdHtml
      +myStatsHtml
      +'<div class="card-progress"><div class="card-progress-bar" style="width:'+pct+'%"></div></div>'
      +'<div class="card-footer">'
      +'<span class="card-price">'+priceHtml+'</span>'
      +'<span class="card-remain">'+remaining+' <span class="it">rimasti</span><span class="en">left</span></span>'
      +'</div>'
      +'<div class="card-mining"><span style="color:var(--gold)">&#9935;</span> <span class="it">1 '+tokIcon('ROBI')+' ogni '+miningRate+' Step</span><span class="en">1 '+tokIcon('ROBI')+' per '+miningRate+' Steps</span></div>'
      +'</div></div>';
  }).join('');

  // Start card gallery autoplay
  startCardGalleries();
}

// ── Card gallery autoplay ──
var _cardGalleryInterval=null;
function startCardGalleries(){
  if(_cardGalleryInterval)clearInterval(_cardGalleryInterval);
  _cardGalleryInterval=setInterval(function(){
    var galleries=document.querySelectorAll('[data-card-gallery]');
    for(var i=0;i<galleries.length;i++){
      var g=galleries[i];
      var imgs=g.querySelectorAll('img');
      var dots=g.querySelectorAll('.card-gallery-dot');
      if(imgs.length<2)continue;
      var curr=-1;
      for(var j=0;j<imgs.length;j++){if(imgs[j].classList.contains('active')){curr=j;break;}}
      var next=(curr+1)%imgs.length;
      if(curr>=0)imgs[curr].classList.remove('active');
      imgs[next].classList.add('active');
      if(dots.length){
        if(curr>=0&&dots[curr])dots[curr].classList.remove('active');
        if(dots[next])dots[next].classList.add('active');
      }
    }
  },3000);
}

// ── Detail ──
var _gridData=[];
var _buyQty=1;

// SVG donut helpers
var DONUT_R=110;
var DONUT_C=2*Math.PI*DONUT_R; // circumference

function donutArc(pct){return (pct/100)*DONUT_C;}

// ── Gallery v2 · scroll-snap mobile-first, niente autoplay (20 lug, Skeezu) ──
var _galleryIdx=0,_galleryInterval=null;

function stopGalleryAutoplay(){ // stub: autoplay rimosso col carousel v2, restano i cleanup
  if(_galleryInterval){clearInterval(_galleryInterval);_galleryInterval=null;}
}

function galleryGoTo(idx){
  var tr=document.getElementById('gallery-track');if(!tr)return;
  var n=tr.children.length;if(!n)return;
  _galleryIdx=((idx%n)+n)%n;
  tr.scrollTo({left:_galleryIdx*tr.clientWidth,behavior:'smooth'});
}

function _gallerySync(){
  var tr=document.getElementById('gallery-track');if(!tr)return;
  var i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));
  _galleryIdx=i;
  document.querySelectorAll('.gallery-dot').forEach(function(d,k){d.classList.toggle('active',k===i)});
  var c=document.getElementById('gallery-idx');if(c)c.textContent=i+1;
}

function initGalleryV2(){
  _galleryIdx=0;
  var tr=document.getElementById('gallery-track');if(!tr)return;
  tr.addEventListener('scroll',_gallerySync,{passive:true});
}

function openGalleryLightbox(i){
  if(window.airLightbox&&window._galleryImgs&&window._galleryImgs.length)window.airLightbox(window._galleryImgs,i||0);
}

// ── EVALOBI consultabile dal dettaglio (20 lug, Skeezu) ──
async function loadDetailEvalobi(airdropId){
  window._detailEvalobi=null;
  var chip=document.getElementById('evalobi-chip');
  if(!chip)return;
  try{
    var r=await fetch(SB_URL+'/rest/v1/rpc/get_evalobi_for_airdrop',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_airdrop_id:airdropId})});
    var rows=r.ok?await r.json():[];
    if(rows&&rows.length&&rows[0].token_id!=null){
      window._detailEvalobi=rows[0];
      chip.style.display='inline-flex';
    }
  }catch(e){}
}

function openEvalobiPop(){
  var ev=window._detailEvalobi;if(!ev)return;
  var p=document.getElementById('evalobi-pop');
  if(!p){
    p=document.createElement('div');
    p.id='evalobi-pop';
    p.innerHTML='<iframe id="evalobi-frame" title="Certificato EVALOBI"></iframe>'
      +'<button class="ep-x" onclick="document.getElementById(\'evalobi-pop\').classList.remove(\'open\');document.body.style.overflow=\'\'" aria-label="Chiudi">&times;</button>';
    document.body.appendChild(p);
  }
  document.getElementById('evalobi-frame').src='/evalobi/'+ev.token_id;
  p.classList.add('open');
  document.body.style.overflow='hidden';
}

async function openDetail(id){
  var a=_airdrops.find(function(x){return x.id===id});
  if(!a){
    // PR-5 F7: gli airdrop conclusi non sono in _airdrops (solo presale/sale).
    // Li carico singolarmente per renderne il recap invece del fallback marketplace.
    var _tok0=_publicMode?SB_KEY:await getValidToken();
    if(_tok0){
      var _fetched=await sbGet('airdrops?id=eq.'+encodeURIComponent(id)+'&select=*&limit=1',_tok0);
      if(Array.isArray(_fetched)&&_fetched.length)a=_fetched[0];
    }
  }
  if(!a){
    // Fix 10 lug: niente return silenzioso — riallinea vista e URL alla lista
    closeDetailView();
    if(location.pathname.indexOf('/airdrop/')!==-1)history.replaceState({page:'explore'},null,_publicMode?'/airdrops':'/airdrops');
    return;
  }
  stopGalleryAutoplay();
  if(!_currentDetail||_currentDetail.id!==a.id){_salitaPrevRank=null;_rulloCounts=null;_lastScores=null;_salitaMyPrevT=null;}
  _currentDetail=a;
  _buyQty=1;
  document.getElementById('list-view').classList.add('hidden');
  var valBanner=document.getElementById('val-banner');
  if(valBanner)valBanner.style.display='none';
  document.getElementById('cat-filter').style.display='none';
  // GS-9 #1 · nascondi marketplace renderizzato sopra il dettaglio.
  // Reopen-2 24 May: classe body.detail-open + CSS !important (robusta a renderCatDashboard
  // async che ri-scrive display:block inline su #cat-dashboard).
  document.body.classList.add('detail-open');
  // Inline hide solo per marketplace-banner + search (non re-renderizzati async).
  var mbAlpha=document.querySelector('.marketplace-demo-banner');
  if(mbAlpha)mbAlpha.style.display='none';
  var searchWrap=document.getElementById('etb-search-wrap')||document.getElementById('etb-search-input');
  if(searchWrap){var w=searchWrap.closest('.etb-search-wrap, .search-wrap, .explore-search')||searchWrap;w.style.display='none';}
  document.getElementById('detail').classList.add('active');
  showTopbarCR(id);
  window.scrollTo({top:0,behavior:'smooth'});

  // Load grid data + participants
  var token=_publicMode?SB_KEY:await getValidToken();
  if(!token)return;
  var gridPromise=sbRpc('get_airdrop_grid',{p_airdrop_id:id},token);
  var partPromise=sbRpc('get_airdrop_participants',{p_airdrop_id:id},token);
  _gridData=await gridPromise||[];
  if(!Array.isArray(_gridData))_gridData=[];
  var participants=await partPromise||[];
  if(!Array.isArray(participants))participants=[];

  var remaining=a.total_blocks-a.blocks_sold;
  var pct=a.total_blocks>0?(a.blocks_sold/a.total_blocks*100):0;
  var isPresale=a.status==='presale';
  // PR-5 F7/F8: stati post-live · niente buy box, render del pannello esito.
  var isConcluded=['completed','annullato','closed','dropped','waiting_seller_acknowledge'].indexOf(a.status)!==-1;
  // 17 lug (Skeezu): dettaglio di una PROPOSTA in valutazione — niente inviti a
  // correre (Entra ora / salita / Step) su una corsa che non esiste ancora.
  var isValuation=['in_valutazione','valutazione_completata'].indexOf(a.status)!==-1;
  var myBlocks=_publicMode?0:_gridData.filter(function(b){return b.is_mine}).length;
  var myPct=a.total_blocks>0?(myBlocks/a.total_blocks*100):0;
  var othersPct=pct-myPct;
  var dl=a.deadline?new Date(a.deadline).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';
  // PR-5 F8: ROBI dell'utente da questo evento (per il pannello esito).
  var _outcomeRobi=0;
  if(isConcluded&&!_publicMode&&_session&&_session.user){
    var _nftRows=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&airdrop_id=eq.'+encodeURIComponent(id)+'&select=shares',token)||[];
    if(Array.isArray(_nftRows))_nftRows.forEach(function(n){_outcomeRobi+=Number(n.shares||0);});
  }

  // Image blur: 20px at 0%, 0px at 100%
  var blurVal=Math.max(0,20-(pct/100*20));
  var imgStyle='filter:blur('+blurVal.toFixed(1)+'px)';

  _bubbles=[];

  // F1: prezzo effettivo (presale-aware) — coerente con l'addebito server-side
  var effectivePrice=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
  var maxBuy=Math.min(remaining,Math.floor(_balance/effectivePrice));
  if(maxBuy<1)maxBuy=0;

  // Product info from JSONB
  var pi=a.product_info||{};
  var highlights=pi.highlights||[];
  var included=pi.whats_included||[];
  var brand=pi.brand||'';
  var model=pi.model||'';
  var condition=pi.condition||'';

  var productImgHtml=a.image_url
    ?'<img src="'+a.image_url+'" alt="'+a.title+'">'
    :'<img class="product-img-placeholder" src="/public/images/AIROOBI_Symbol_White.png" alt="">';

  // Gallery images: main + extra_photos (solo URL reali — mai <img src="null">)
  var galleryImgs=a.image_url?[a.image_url]:[];
  var extraPhotos=pi.extra_photos||[];
  for(var ei=0;ei<extraPhotos.length;ei++){
    if(extraPhotos[ei]&&galleryImgs.indexOf(extraPhotos[ei])===-1) galleryImgs.push(extraPhotos[ei]);
  }

  // Price: total ARIA cost for 1 block, and total to fill
  var totalAriaCost=a.block_price_aria*a.total_blocks;

  // Accordion helper
  function acc(id,labelIt,labelEn,bodyHtml,openByDefault){
    return '<div class="acc'+(openByDefault?' open':'')+'" id="acc-'+id+'">'
      +'<button class="acc-header" onclick="toggleAcc(\''+id+'\')">'
      +'<span><span class="it">'+labelIt+'</span><span class="en">'+labelEn+'</span></span>'
      +'<svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      +'</button>'
      +'<div class="acc-body"><div class="acc-inner">'+bodyHtml+'</div></div>'
      +'</div>';
  }

  // ── BUILD GALLERY SLIDES ── (senza foto: placeholder flat, niente img rotta)
  var slidesHtml=galleryImgs.length
    ?galleryImgs.map(function(src,i){
      return '<div class="gallery-slide'+(i===0?' active':'')+'" onclick="openGalleryLightbox('+i+')">'
        +'<img src="'+src+'" alt="'+a.title+' — '+(i+1)+'" loading="'+(i<2?'eager':'lazy')+'">'
        +'</div>';
    }).join('')
    :'<div class="gallery-slide active gallery-slide-placeholder">'
      +'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>'
      +'<span class="it">Foto in arrivo</span><span class="en">Photos coming soon</span>'
      +'</div>';

  var dotsHtml=galleryImgs.length>1
    ?'<div class="gallery-dots">'+galleryImgs.map(function(_,i){
      return '<button class="gallery-dot'+(i===0?' active':'')+'" onclick="galleryGoTo('+i+')"></button>';
    }).join('')+'</div>'
    :'';

  var playerHtml=galleryImgs.length>1
    ?'<div class="gallery-player">'
    +dotsHtml
    +'<span class="gallery-counter"><span id="gallery-idx">1</span>/'+galleryImgs.length+'</span>'
    +'</div>'
    :'';

  // Track B redesign (cluster GS-8/9/10/12/15 · mini-spec GS-9 LOCKED)
  // GS-9: gerarchia above-the-fold = competitivo · sotto = scheda prodotto
  // GS-9 layout: 2-col desktop con competitivo a SX (.detail-split-v2 invertito)
  // GS-12 banner top: detail-autobuy-banner-top, populated by updateAutoBuyBanner()
  // GS-8 header: .detail-header-v2 con categoria + ♡ + ⤴ (heart-btn-v2 sfondo chiaro, share-btn-v2 nuovo)
  // GS-15 riga soglia: detail-hint-soglia, populated by loadHintSoglia()
  // GS-10 A/B: detail-strategy collapsible, gestito in updateStrategyGuide()

  // Chip fase basato su status
  var phaseChip='';
  if(!isConcluded){
    if(isPresale)phaseChip='<span class="detail-chip-fase presale">● <span class="it">PRESALE · apre per il sale a chiusura</span><span class="en">PRESALE</span></span>';
    else if(a.status==='sale')phaseChip='<span class="detail-chip-fase active">● <span class="it">ATTIVO</span><span class="en">ACTIVE</span></span>';
  } else if(a.status==='completed')phaseChip='<span class="detail-chip-fase closed">● <span class="it">CONCLUSO</span><span class="en">CLOSED</span></span>';
  else if(a.status==='annullato')phaseChip='<span class="detail-chip-fase cancelled">● <span class="it">ANNULLATO</span><span class="en">CANCELLED</span></span>';
  else if(a.status==='waiting_seller_acknowledge')phaseChip='<span class="detail-chip-fase waiting">● <span class="it">IN ATTESA</span><span class="en">WAITING</span></span>';

  // Build pezzi riusabili (riordinati per nuova gerarchia)
  var galleryHtml=''
    +'<div class="detail-gallery detail-gallery-v2 detail-gallery-inline dtab-info" id="detail-gallery">'
    +'<div class="gallery-track gt-snap" id="gallery-track">'+slidesHtml+'</div>'
    +(galleryImgs.length>1?'<button class="gnav gnav-prev" onclick="galleryGoTo(_galleryIdx-1)" aria-label="Foto precedente">&lsaquo;</button><button class="gnav gnav-next" onclick="galleryGoTo(_galleryIdx+1)" aria-label="Foto successiva">&rsaquo;</button>':'')
    +playerHtml
    +'<div class="product-badge" style="position:absolute;top:14px;left:14px;z-index:2">Airdrop</div>'
    +'</div>';

  // GS-8 header: categoria + ♡ + ⤴ (heart sfondo chiaro)
  var titleSafe=(a.title||'').replace(/'/g,"\\'");
  // 19 lug (Skeezu): via l'eyebrow «AIRDROP · categoria» — è ovvio che è un airdrop. Resta il codice.
  var headerV2=''
    +'<div class="detail-header-v2">'
    +'<span class="detail-cat-v2">'
    +(a.code?'<span class="airdrop-code" onclick="navigator.clipboard&&navigator.clipboard.writeText(\''+a.code+'\');showToast(\'Codice copiato\',\'success\')" title="Codice airdrop — clicca per copiare" style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-400);border:1px solid var(--gray-700);border-radius:8px;padding:2px 8px;cursor:pointer;vertical-align:1px">#'+a.code+'</span>':'')
    // 20 lug (Skeezu): loghetto EVALOBI consultabile — compare se l'airdrop ha il certificato
    +'<button id="evalobi-chip" class="evalobi-chip" style="display:none" onclick="openEvalobiPop()" title="Certificato EVALOBI — consulta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.5 13l1.5 8-5-3-5 3 1.5-8"/></svg>EVALOBI</button>'
    +'</span>'
    +'<div class="detail-header-actions">'
    // 20 lug (Skeezu): il cuore vive nella riga badge coi tondini — qui resta solo lo share
    +'<button class="share-btn-v2" onclick="shareAirdrop(\''+a.id+'\',\''+titleSafe+'\')" title="Condividi" aria-label="Condividi airdrop">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
    +'</button>'
    +'</div>'
    +'</div>';

  // Hint + soglia (GS-15 §4.5) · async populated
  var hintSogliaStub=(!isConcluded&&!isValuation)?'<div id="detail-hint-soglia" class="detail-hint-soglia dtab-salita"></div>':'';

  // Buy box (acquisto subito sotto soglia — §4.6 above-the-fold)
  var _isMineVal=!_publicMode&&_session&&_session.user&&(a.submitted_by===_session.user.id||a.created_by===_session.user.id);
  var buyBoxHtml=isValuation
    ?'<div class="buy-box">'
    +'<div class="buy-box-label"><span class="it">Proposta in valutazione</span><span class="en">Proposal under evaluation</span></div>'
    +'<p class="buy-box-framing"><span class="it">Il team AIROOBI sta preparando la quotazione (24&ndash;48h). '+(a.status==='valutazione_completata'?'Quotazione pronta: attende la decisione del venditore. ':'')+'Appena il venditore d&agrave; l\'OK, la corsa parte da qui.</span><span class="en">The AIROOBI team is preparing the quotation (24&ndash;48h). Once the seller gives the OK, the climb starts here.</span></p>'
    +(_isMineVal?'<button class="buy-btn" onclick="navigateTo(\'my\')" style="display:block;width:100%"><span class="it">&Egrave; il tuo oggetto — segui lo stato &rarr;</span><span class="en">It\'s your item — track the status &rarr;</span></button>':'')
    +'</div>'
    :isConcluded
    ?_renderOutcomePanel(a,myBlocks,_outcomeRobi)
    :_isMineVal
    // 19 lug (decisione Skeezu): il venditore non corre la propria corsa — niente pannello AVANZA
    ?'<div class="detail-sellerbox dtab-salita">'
    +'<div class="dsb-title"><span class="it">Sei il venditore</span><span class="en">You\'re the seller</span></div>'
    +'<p class="dsb-copy"><span class="it">Questa corsa la guardi dalla vetta: niente Step per te. Puoi spingerla condividendola e, se serve, estenderla dalle Impostazioni.</span><span class="en">You watch this climb from the summit: no Steps for you. Push it by sharing, or extend it from Settings.</span></p>'
    +'<button class="buy-btn" style="display:block;width:100%" onclick="shareAirdrop(\''+a.id+'\',\''+titleSafe+'\')"><span class="it">Condividi la corsa</span><span class="en">Share the climb</span></button>'
    +'</div>'
    :_publicMode
    ?'<div class="buy-box">'
    +'<div class="buy-box-label"><span class="it">Vuoi partecipare?</span><span class="en">Want to participate?</span></div>'
    +'<p class="buy-box-framing"><span class="it">Registrati gratis per ricevere ARIA ogni giorno e fare i tuoi Step in questa corsa.</span><span class="en">Sign up free to earn ARIA every day and take your Steps in this climb.</span></p>'
    +'<a href="/signup?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" class="buy-btn" style="display:block;text-align:center;text-decoration:none"><span class="it">Registrati gratis &rarr;</span><span class="en">Sign up free &rarr;</span></a>'
    +'<a href="/login?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" style="display:block;text-align:center;margin-top:10px;color:var(--gray-400);font-size:13px;text-decoration:none"><span class="it">Hai gi&agrave; un account? Accedi</span><span class="en">Already have an account? Log in</span></a>'
    +'</div>'
    :'<div class="buy-box">'
    +'<div class="buy-box-label"><span class="it">Metti da parte i tuoi ARIA</span><span class="en">Set aside your ARIA</span></div>'
    +'<p class="buy-box-framing"><span class="it">Ogni Step ti avvicina alla vetta e lungo il percorso raccogli ROBI Reward — reward reali, riscattabili in KAS.</span><span class="en">Every Step brings you closer to the summit — and you pick up ROBI Reward along the trail, redeemable in KAS.</span></p>'
    +(isPresale?'<div style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.2);padding:6px 10px;margin-bottom:12px;font-size:11px;color:var(--aria)"><strong>&#9935; PRESALE 2x</strong> — <span class="it">In presale ogni Step raccoglie il doppio dei ROBI!</span><span class="en">In presale every Step picks up double ROBI!</span></div>':'')
    +'<div class="buy-display">'
    +'<div class="buy-display-count" id="buy-display-count">1 <span>Step</span></div>'
    +'<div class="buy-display-cost" id="buy-display-cost">= '+effectivePrice+' '+tokIcon('ARIA')+'</div>'
    +'<div class="buy-display-balance"><span class="it">Saldo:</span><span class="en">Balance:</span> '+_balance+' '+tokIcon('ARIA')+'</div>'
    +'</div>'
    +'<div class="buy-slider-wrap">'
    +'<input type="range" class="buy-slider" id="buy-slider" min="1" max="'+(maxBuy||1)+'" value="1" '+(maxBuy<1?'disabled':'')+' oninput="onSlider()">'
    +'<div class="buy-slider-labels"><span>1</span><span>'+(maxBuy||0)+'</span></div>'
    +'</div>'
    +'<div class="buy-presets">'
    +(maxBuy>=5?'<button class="buy-preset" onclick="setSlider(5)">5</button>':'')
    +(maxBuy>=10?'<button class="buy-preset" onclick="setSlider(10)">10</button>':'')
    +(maxBuy>=25?'<button class="buy-preset" onclick="setSlider(25)">25</button>':'')
    +(maxBuy>=50?'<button class="buy-preset" onclick="setSlider(50)">50</button>':'')
    +(maxBuy>0?'<button class="buy-preset" onclick="setSlider('+maxBuy+')">Max</button>':'')
    +'</div>'
    // Mockup v3: la nota soglia vive DOVE si decide (populated by loadHintSoglia)
    +hintSogliaStub
    +'<button class="bb-toggle" onclick="this.closest(\'.buy-box\').classList.toggle(\'bb-min\')" aria-label="Espandi/comprimi" title="Espandi/comprimi">&#8963;</button>'
    +'<button class="buy-btn" id="buy-btn" onclick="initBuy()"'+(remaining<=0||maxBuy<1?' disabled':'')+'>'
    +(remaining>0&&maxBuy>=1
      ?'<span class="it">Avanza</span><span class="en">Advance</span>'
      :(remaining<=0?'<span class="it">Percorso completo</span><span class="en">Trail complete</span>':'<span class="it">ARIA insufficienti</span><span class="en">Not enough ARIA</span>'))
    +'</button>'
    +'<div class="buy-msg" id="buy-msg"></div>'
    +'</div>';

  // 18 lug (Skeezu) · Mobile a tab: la pagina si spezza in Salita/Info/Impostazioni
  // via classi dtab-* + attributo data-dtab su #detail (CSS media ≤768px). Desktop invariato.
  var extendHtml=buildExtendBox(a);
  var hasSetTab=(!isConcluded&&myBlocks>0)||!!extendHtml;
  var _mrate=calcMiningRate(a);
  // Mockup v3 (19 lug): I TUOI NUMERI = unica casa dei dati personali, 4 valori con POSIZIONE
  var mystripHtml=(!isConcluded&&!isValuation&&!_publicMode)
    ?'<div class="detail-mystrip" id="detail-mystrip">'
    +'<div class="mystrip-eyebrow"><span class="it">I TUOI NUMERI</span><span class="en">YOUR NUMBERS</span></div>'
    +'<div class="mystrip-grid">'
    +'<div class="mystrip-cell"><b id="mystrip-aria" class="ms-aria">'+(myBlocks*effectivePrice)+'</b><span>'+tokIcon('ARIA')+' <span class="it">spesi</span><span class="en">spent</span></span></div>'
    +'<div class="mystrip-cell"><b id="mystrip-steps">'+myBlocks+'</b><span>Step</span></div>'
    +'<div class="mystrip-cell"><b id="mystrip-robi" class="ms-robi">'+(_mrate>0?(myBlocks/_mrate).toFixed(2):'0')+'</b><span>'+tokIcon('ROBI')+' <span class="it">in arrivo</span><span class="en">incoming</span></span></div>'
    +'<div class="mystrip-cell"><b id="mystrip-pos">&mdash;</b><span><span class="it">posizione</span><span class="en">position</span></span></div>'
    +'</div>'
    +'</div>'
    :'';
  var _dtbIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
  var tabbarHtml=''
    +'<nav class="detail-tabbar" id="detail-tabbar">'
    // 19 lug (Skeezu): AIRDROPS al posto di Home — torna alla lista degli airdrop
    +'<button class="dtb-btn" onclick="backToList()">'+_dtbIco+'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg><span class="it">Airdrops</span><span class="en">Airdrops</span></button>'
    +'<button class="dtb-btn active" data-dt="salita" onclick="detailTab(\'salita\')">'+_dtbIco+'<path d="M3 20l6-9 4 5 5-8 3 4"/></svg><span class="it">Salita</span><span class="en">Climb</span></button>'
    +'<button class="dtb-btn" data-dt="info" onclick="detailTab(\'info\')">'+_dtbIco+'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span class="it">Info</span><span class="en">Info</span></button>'
    +(hasSetTab?'<button class="dtb-btn" data-dt="set" onclick="detailTab(\'set\')">'+_dtbIco+'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg><span class="it">Impostazioni</span><span class="en">Settings</span></button>':'')
    +'</nav>';

  // 19 lug · Orientamento primo-arrivo: 3 righe su cos'è la corsa, dismissabile per sempre
  var introHtml='';
  try{
    if(!isConcluded&&!isValuation&&!localStorage.getItem('airoobi_intro_ok')){
      introHtml='<div class="detail-intro dtab-salita" id="detail-intro">'
        +'<button class="di-x" onclick="try{localStorage.setItem(\'airoobi_intro_ok\',\'1\')}catch(e){};var el=document.getElementById(\'detail-intro\');if(el)el.remove();" aria-label="Chiudi">&times;</button>'
        +'<div class="di-title"><span class="it">Prima volta su un airdrop?</span><span class="en">First time on an airdrop?</span></div>'
        +'<div class="di-row"><span class="it">Ogni oggetto è una <b>corsa in salita</b>: fai Step con i tuoi ARIA per salire.</span><span class="en">Every item is an <b>uphill climb</b>: take Steps with your ARIA to move up.</span></div>'
        +'<div class="di-row"><span class="it">Chi è <b>in vetta alla chiusura</b> ottiene l\'oggetto.</span><span class="en">Whoever is <b>at the summit at close</b> gets the item.</span></div>'
        +'<div class="di-row"><span class="it">Lungo il percorso raccogli <b>fiori ROBI</b> — tuoi comunque vada.</span><span class="en">Along the trail you pick up <b>ROBI flowers</b> — yours no matter what.</span></div>'
        +'<a class="di-link" href="/come-funziona-airdrop" target="_blank"><span class="it">Come funziona →</span><span class="en">How it works →</span></a>'
        +'</div>';
    }
  }catch(e){}

  // F · Scheda prodotto (20 lug Skeezu: tab INFO dashboard-style — i numeri chiave
  // vivono nelle tile KPI qui sotto; via la price-row e l'accordion Dettagli, zero doppioni)
  var _rate=calcMiningRate(a);
  var infoTilesHtml=''
    +'<div class="info-tiles dtab-info">'
    +'<div class="info-tile"><div class="it-label"><span class="it">Prezzo Step</span><span class="en">Step price</span></div><div class="it-value" style="color:var(--aria)">'+effectivePrice+' '+tokIcon('ARIA',16)+'</div><div class="it-sub">'+(isPresale&&a.presale_block_price?'<span style="text-decoration:line-through">'+a.block_price_aria+'</span> &middot; PRESALE':'<span class="it">per Step</span><span class="en">per Step</span>')+'</div></div>'
    +'<div class="info-tile"><div class="it-label"><span class="it">Percorso</span><span class="en">Trail</span></div><div class="it-value">'+a.total_blocks.toLocaleString('it-IT')+'</div><div class="it-sub"><span class="it">Step totali</span><span class="en">total Steps</span></div></div>'
    +'<div class="info-tile"><div class="it-label"><span class="it">Alla vetta</span><span class="en">To the summit</span></div><div class="it-value">'+remaining.toLocaleString('it-IT')+'</div><div class="it-sub"><span class="it">Step rimanenti</span><span class="en">Steps left</span></div></div>'
    +'<div class="info-tile"><div class="it-label"><span class="it">Raccolta ROBI</span><span class="en">ROBI pickup</span></div><div class="it-value" style="color:var(--gold)">1 '+tokIcon('ROBI',16)+' / '+_rate+'</div><div class="it-sub">'+(isPresale?'<span class="it">presale: 1 ogni '+Math.max(1,Math.ceil(_rate/2))+' Step</span><span class="en">presale: 1 every '+Math.max(1,Math.ceil(_rate/2))+' Steps</span>':'<span class="it">1 fiore ogni '+_rate+' Step</span><span class="en">1 flower every '+_rate+' Steps</span>')+'</div></div>'
    +(dl?'<div class="info-tile it-wide"><div class="it-label"><span class="it">Scadenza</span><span class="en">Deadline</span></div><div class="it-value it-date">'+dl+'</div><div class="it-sub"><span class="it">chiusura della corsa</span><span class="en">race closes</span></div></div>':'')
    +'</div>';
  // Scheda prodotto solo se ha contenuti reali — mai cornice vuota (il durationBadge
  // da solo non basta: la scadenza vive già nella tile KPI)
  var _hasProductInfo=!!(brand||model||condition||highlights.length||included.length||isPresale);
  var productHtml=!_hasProductInfo?'':''
    +'<div class="product-info-v2 dtab-info">'
    +(brand?'<div class="product-brand">'+brand+'</div>':'')
    +(isPresale?'<div style="background:rgba(74,158,255,.08);border:1px solid rgba(74,158,255,.25);padding:8px 12px;margin-top:8px;font-size:12px;color:var(--aria);letter-spacing:.5px"><strong>&#9935; PRESALE 2x</strong> — <span class="it">Ogni Step in presale raccoglie il doppio dei ROBI</span><span class="en">Every presale Step picks up double ROBI</span></div>':'')
    +(model?'<div class="product-model">'+model+'</div>':'')
    +(condition?'<div class="product-condition">'+condition+'</div>':'')
    +(highlights.length>0
      ?'<ul class="product-highlights">'+highlights.map(function(h){return '<li>'+h+'</li>'}).join('')+'</ul>'
      :'')
    +(included.length>0
      ?'<div class="product-included-label"><span class="it">Contenuto della confezione</span><span class="en">What\'s included</span></div>'
      +'<ul class="product-included">'+included.map(function(h){return '<li>'+h+'</li>'}).join('')+'</ul>'
      :'')
    +durationBadge(a.duration_type)
    +'</div>';

  var html=''
    // Layout 10 lug (richiesta Skeezu): SX = titolo/posizione/FOTO · DX = SALITA + buy box
    +'<div class="detail-split detail-split-v2">'

    // ── COL SX ──
    +'<div class="detail-right detail-competitive-col" id="detail-right">'

    // ═ 20 lug (Skeezu): testatina unica — codice+EVALOBI+azioni / badge / titolo
    //   fusi in un rettangolo summary su tre righe ═
    +'<div class="detail-masthead">'
    +headerV2

    // ═ Rifinitura 19 lug sera (Skeezu): badge fase + badge TUO prima del titolo,
    //   B fasi → meta compatta (ovunque) → Salita subito; numeri e posizione in colonna corsa ═
    +((phaseChip||(_isMineVal&&!isValuation)||!isConcluded)?
      '<div class="detail-badges">'
      +(phaseChip||'')
      +(_isMineVal&&!isValuation?'<button class="do-badge do-badge-btn" onclick="showOwnerPop()"><span class="it">IL TUO AIRDROP</span><span class="en">YOUR AIRDROP</span> ▾</button>':'')
      // 20 lug (Skeezu): meta di corsa a SOLE icone in riga coi badge — tap → popup informativo
      +(!isConcluded&&a.deadline?'<button class="rm-chip rm-ico" onclick="showRaceInfo(\'time\')" aria-label="Tempo rimanente" title="Tempo rimanente"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span id="detail-countdown" data-deadline="'+a.deadline+'"></span></button>':'')
      +(!isConcluded?'<button class="rm-chip rm-ico" onclick="showRaceInfo(\'racers\')" aria-label="In corsa" title="In corsa"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg><b id="race-meta-n">—</b></button>':'')
      // 20 lug (Skeezu): cuore preferiti in fila coi tondini della riga badge
      +'<button class="heart-btn-v2 hb-inline'+(isInWatchlist(a.id)?' active':'')+'" id="detail-heart" onclick="toggleWatchlist(\''+a.id+'\')" title="Preferito" aria-label="Aggiungi ai preferiti">&#9825;</button>'
      +'</div>':'')

    +'<h1 class="detail-title-v2">'+a.title+'</h1>'
    +'</div>' // close detail-masthead

    // 20 lug (Skeezu): mini carousel foto sotto il titolo — thumbnails swipabili, tap → lightbox
    +(galleryImgs.length?'<div class="mini-gal">'+galleryImgs.map(function(src,i){
      return '<img src="'+src+'" alt="'+(a.title||'')+' — '+(i+1)+'" loading="lazy" onclick="openGalleryLightbox('+i+')">';
    }).join('')+'</div>':'')
    +(a.description?'<div class="detail-desc"><span id="detail-desc-txt" class="dd-clamp">'+escHtml(a.description)+'</span> <button class="dd-toggle" onclick="var t=document.getElementById(\'detail-desc-txt\');var c=t.classList.toggle(\'dd-clamp\');this.innerHTML=c?\'<span class=\\\'it\\\'>più</span><span class=\\\'en\\\'>more</span>\':\'<span class=\\\'it\\\'>meno</span><span class=\\\'en\\\'>less</span>\';"><span class="it">più</span><span class="en">more</span></button></div>':'')

    +introHtml

    // B · Fasi subito
    +buildPhaseStepper(a)

    // F · Scheda prodotto (tab Info su mobile) — dashboard-style: galleria → KPI → scheda
    +galleryHtml
    +infoTilesHtml
    +productHtml

    // C · Estendi la corsa (Impostazioni su mobile, coda su desktop)
    +(extendHtml?'<div class="dtab-set">'+extendHtml+'</div>':'')

    +'</div>' // close detail-right

    // ── COL DX (colonna corsa): SALITA → i tuoi numeri → posizione → azione ──
    +'<div class="detail-race-col dtab-salita">'
    +(!isConcluded?'<div id="detail-salita"></div>':'')
    +(_isMineVal?'':mystripHtml)
    +(!_isMineVal&&(!isConcluded&&!isValuation)?
      '<div class="detail-hud">'
      +'<div class="detail-position" id="detail-position"></div>'
      +'<div id="detail-autobuy-banner" class="detail-autobuy-banner" style="display:none"></div>'
      +'</div>':'')
    +buyBoxHtml
    +(!isConcluded?'<div class="detail-rullo-hook" id="detail-rullo-hook"></div>':'')
    +'</div>'
    // Popup badge IL TUO AIRDROP
    +(_isMineVal&&!isValuation?
      '<div class="owner-pop" id="owner-pop" onclick="if(event.target===this)this.classList.remove(\'open\')">'
      +'<div class="op-card">'
      +'<div class="op-title"><span class="it">Il tuo airdrop</span><span class="en">Your airdrop</span></div>'
      +'<p class="op-txt"><span class="it">Sei il venditore: la corsa la guardi dalla vetta, non la corri. Puoi condividerla per spingerla e, se serve, estenderla.</span><span class="en">You\'re the seller: you watch the climb from the summit. Share it to push it, extend it if needed.</span></p>'
      +'<div class="op-acts">'
      +'<button class="buy-btn" style="flex:1" onclick="document.getElementById(\'owner-pop\').classList.remove(\'open\');typeof detailTab===\'function\'&&window.innerWidth<=768?detailTab(\'set\'):scrollToAutoBuyBox()"><span class="it">Gestisci</span><span class="en">Manage</span></button>'
      +'<button class="dd-toggle" style="padding:10px 14px" onclick="document.getElementById(\'owner-pop\').classList.remove(\'open\')"><span class="it">Chiudi</span><span class="en">Close</span></button>'
      +'</div></div></div>':'')
    // Popup informativo meta corsa (icone tempo / in corsa)
    +(!isConcluded?
      '<div class="owner-pop" id="race-pop" onclick="if(event.target===this)this.classList.remove(\'open\')">'
      +'<div class="op-card">'
      +'<div class="op-title" id="rp-title"></div>'
      +'<div class="rp-value" id="rp-value"></div>'
      +'<p class="op-txt" id="rp-txt"></p>'
      +'<div class="op-acts"><button class="dd-toggle" style="padding:10px 14px;margin-left:auto" onclick="document.getElementById(\'race-pop\').classList.remove(\'open\')"><span class="it">Chiudi</span><span class="en">Close</span></button></div>'
      +'</div></div>':'')

    +'</div>' // close detail-split

    // ══════════ FINE ABOVE-THE-FOLD · §4.8 SOTTO LA PIEGA ══════════
    +'<div class="detail-below-v2">'

    // Accordion "Dettagli airdrop" RIMOSSO (20 lug, Skeezu): i dati vivono nelle
    // tile KPI del tab Info (infoTilesHtml) — dashboard-style, zero doppioni.

    // Mockup v3 (mappa di consolidamento): detail-myblocks e detail-stats ELIMINATI —
    // i numeri personali vivono SOLO nel mystrip, i parametri SOLO nei Dettagli airdrop.
    // Mine Tower 3D — sostituita da LA SALITA (9 lug); funzione conservata per rollback

    // Come arrivare 1° → tab Info come da mockup (populated by updateStrategyGuide)
    +(!isConcluded?'<div class="detail-strategy detail-strategy-ab dtab-info" id="detail-strategy"></div>':'')

    // MY STATS panel (solo airdrop live)
    +(!isConcluded&&myBlocks>0&&!_publicMode?
    '<div class="detail-mystats dtab-set" id="detail-mystats">'
    +'<div class="mystats-header"><span class="it">Le tue statistiche</span><span class="en">Your stats</span></div>'
    +'<div class="mystats-grid" id="mystats-grid"></div>'
    +'<div class="mystats-history" id="mystats-history"></div>'
    +'</div>'
    :'')

    // AUTO-BUY config (solo airdrop live) — toggle attivazione resta in fondo (mini-spec §4.8)
    +(!isConcluded&&myBlocks>0?
    '<div class="auto-buy-box dtab-set" id="auto-buy-box">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--aria);margin-bottom:8px">'+UI_ICONS.steps+' <span class="it">MANTIENI IL PASSO</span><span class="en">KEEP THE PACE</span></div>'
    +'<p style="font-size:11px;color:var(--gray-400);margin-bottom:10px;line-height:1.4"><span class="it">Step automatici a intervalli regolari — la tua marcia in salita.</span><span class="en">Automatic Steps at regular intervals — your steady climbing pace.</span></p>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">STEP</span><span class="en">STEPS</span></label>'
    +'<select id="ab-qty" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"><option>1</option><option>2</option><option>3</option><option>5</option><option>10</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">OGNI</span><span class="en">EVERY</span></label>'
    +'<select id="ab-interval" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"><option value="0.25">15min</option><option value="0.5">30min</option><option value="1">1h</option><option value="2">2h</option><option value="4" selected>4h</option><option value="6">6h</option><option value="12">12h</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px">MAX</label>'
    +'<input type="number" id="ab-max" value="50" min="1" max="500" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"></div>'
    +'</div>'
    +'<button id="ab-toggle" onclick="toggleAutoBuy(\''+a.id+'\')" style="width:100%;padding:8px;background:var(--aria);color:var(--white);border:none;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;font-weight:700"><span class="it">MANTIENI IL PASSO</span><span class="en">KEEP THE PACE</span></button>'
    +'<div id="ab-status" style="margin-top:6px;font-size:10px;color:var(--gray-500);text-align:center"></div>'
    +'</div>'
    :'')

    // CTA 'Hai un oggetto di valore?' rimosso dal dettaglio (bug 5, 15 lug 2026):
    // resta il box unico .explore-cta-valuta a fine pagina.

    +'</div>' // close detail-below-v2

    // 18 lug · Tab bar fissa mobile (Salita / Info / Impostazioni)
    +tabbarHtml;

  document.getElementById('detail-content').innerHTML=html;
  document.body.classList.add('detail-open'); // il fab segnalazioni si alza sopra tab bar + buy box
  // 19 lug (Skeezu) · topbar specializzata nel dettaglio: breadcrumb ‹ Airdrops nello spazio libero
  if(!document.getElementById('tb-breadcrumb')){
    var _tb=document.querySelector('.topbar .topbar-right');
    if(_tb){
      var _bc=document.createElement('button');
      _bc.id='tb-breadcrumb';
      _bc.innerHTML='&lsaquo; <span class="it">Airdrops</span><span class="en">Airdrops</span>';
      _bc.onclick=function(){backToList();};
      _tb.parentNode.insertBefore(_bc,_tb);
    }
  }
  var _dEl=document.getElementById('detail');
  if(_dEl)_dEl.setAttribute('data-dtab','salita');
  // Mockup v3: su mobile il buy box parte compresso (pannello sticky sopra la tab bar)
  if(window.innerWidth<=768){
    var _bb=document.querySelector('#detail .buy-box');
    if(_bb)_bb.classList.add('bb-min');
  }

  // Start gallery auto-play
  window._galleryImgs=galleryImgs;
  initGalleryV2();
  loadDetailEvalobi(a.id);

  // Start physics simulation for bubbles
  if(_bubbles.length>0)startBubblePhysics();

  // Start countdown ticker
  startCountdowns();

  // Position / ROBI projection / auto-buy: solo airdrop live (PR-5 F7/F8).
  if(isValuation){
    // Salita in quiete: la corsa non è ancora partita (markup statico —
    // .salita-empty è position:absolute e collasserebbe il contenitore)
    var salEl=document.getElementById('detail-salita');
    if(salEl)salEl.innerHTML='<div style="position:static;padding:18px 4px;text-align:center">'
      +'<div style="font-family:var(--font-h);font-size:17px;font-weight:600;margin-bottom:6px"><span class="it">La corsa non &egrave; ancora partita</span><span class="en">The climb hasn\'t started yet</span></div>'
      +'<div style="font-size:12px;color:var(--gray-400)"><span class="it">Prima la quotazione, poi l\'OK del venditore — e la salita si apre.</span><span class="en">First the quotation, then the seller\'s OK — and the climb opens.</span></div></div>';
  }
  if(!isConcluded&&!isValuation){
    // Position live — initial + polling (uses calculate_winner_score for real rank)
    refreshPosition(a.id);
    if(_positionInterval)clearInterval(_positionInterval);
    _positionInterval=setInterval(function(){refreshPosition(a.id)},30000);

    // Detail stats (ROBI projection, %, history)
    if(myBlocks>0&&!_publicMode)loadDetailStats(a.id);

    // Auto-buy status (config btn label) + banner top GS-12
    if(myBlocks>0){
      loadAutoBuyStatus(a.id);
      updateAutoBuyBanner(a.id);
    }

    // GS-15 · hint blocchi per 1° + soglia threshold (loadHintSoglia)
    loadHintSoglia(a.id);
    // GS-16 · aggancio "scopri ROBI nel rullo" (loadRulloHook)
    loadRulloHook(a.id);
  }else if(_positionInterval){
    clearInterval(_positionInterval);_positionInterval=null;
  }
}

// GS-16 · aggancio "scopri ROBI nel rullo" — copy ROBY locked Skeezu (rullo formula B)
async function loadRulloHook(airdropId){
  var el=document.getElementById('detail-rullo-hook');
  if(!el)return;
  try{
    var token=_session?await getValidToken():null;
    var r=await sbRpc('get_airdrop_rullo_count',{p_airdrop_id:airdropId},token);
    if(!r||typeof r!=='object'){el.innerHTML='';return;}
    var total=Number(r.total||0);
    var outstanding=Number(r.outstanding||0);
    if(total<=0){el.innerHTML='';return;}
    // Mostra solo quanti ROBI il rullo nasconde · MAI dove (no spoiler)
    var countLine=outstanding>0
      ?'<strong>'+outstanding.toLocaleString('it-IT')+'</strong> <span class="it">ROBI ancora nascosti</span><span class="en">ROBI still hidden</span>'
      :'<span class="it">Tutti i ROBI nascosti sono stati trovati</span><span class="en">All hidden ROBI found</span>';
    el.innerHTML=''
      +'<div class="rullo-hook-head">'+UI_ICONS.flower+' <span class="rullo-hook-title"><span class="it">Fiori ROBI sul percorso</span><span class="en">ROBI flowers on the trail</span></span></div>'
      +'<p class="rullo-hook-copy"><span class="it">Lungo il percorso alcuni Step nascondono un fiore ROBI: raccoglilo avanzando — è subito tuo, sul portafoglio.</span><span class="en">Some Steps along the trail hide a ROBI flower: pick it up as you advance — instantly yours, in your wallet.</span></p>'
      +'<div class="rullo-hook-count">'+countLine+'</div>';
    _rulloCounts={total:total,outstanding:outstanding};
    if(_lastScores)renderSalita(_lastScores);
  }catch(e){el.innerHTML='';}
}

/* ══ LA SALITA v2 · la corsa verso la vetta (9-10 lug · Skeezu+CCP + mockup Claude Design) ══
   Sentiero bezier + quote altimetriche in € + fuori corsa (fairness guard replicato
   client-side: sqrt(blocchi+rimasti)×fedeltà+boost < leader ⇒ non può più arrivare 1°).
   Finestra (scelta Skeezu): top 3 + i 5 davanti a te + TU + ultimi 3, gap compressi (+N).
   Tono "spinta": sorpassi via toast, Boost = fiammella, VOLATA FINALE <24h. */
var _salitaAvatars={};
var _salitaAvatarsFor=null;
var _salitaPrevRank=null;
var _salitaJustBought=false;
var _salitaMyPrevT=null;
var _rulloCounts=null;
var _lastScores=null;

var SALITA_PATH_D='M40,492 C180,484 356,462 440,440 C332,414 156,382 58,356 C190,328 344,298 436,272 C332,246 168,220 72,196 C200,164 332,140 396,122 C424,114 436,98 440,82';
var SALITA_VB_W=480, SALITA_VB_H=520;
var _salitaMeasurePath=null;
function salitaPointAt(t){
  if(!_salitaMeasurePath){
    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    var p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',SALITA_PATH_D);
    svg.appendChild(p);svg.style.position='absolute';svg.style.width='0';svg.style.height='0';
    document.body.appendChild(svg);
    _salitaMeasurePath=p;
  }
  var L=_salitaMeasurePath.getTotalLength();
  var pt=_salitaMeasurePath.getPointAtLength(Math.max(0,Math.min(1,t))*L);
  return [pt.x/SALITA_VB_W*100,pt.y/SALITA_VB_H*100];
}

function salitaHue(uid){
  var h=0;uid=String(uid||'');
  for(var i=0;i<uid.length;i++){h=(h*31+uid.charCodeAt(i))>>>0;}
  return h%360;
}

function salitaAvatarHtml(uid,me){
  var url=_salitaAvatars[uid];
  if(url)return '<img class="salita-av" src="'+url+'" alt="" loading="lazy">';
  // Fallback: cerchio in tinta deterministica dall'id + «OO» (simbolo AIROOBI)
  return '<span class="salita-av" style="background:hsl('+salitaHue(uid)+' 45% 46%)">OO</span>';
}

async function salitaLoadAvatars(airdropId,ids){
  if(_salitaAvatarsFor===airdropId){
    ids=ids.filter(function(id){return !(id in _salitaAvatars)});
  }else{_salitaAvatars={};_salitaAvatarsFor=airdropId;}
  if(!ids.length)return;
  try{
    var token=_publicMode?SB_KEY:await getValidToken();if(!token)return;
    var rows=await sbGet('profiles?id=in.('+ids.join(',')+')&select=id,avatar_url',token)||[];
    ids.forEach(function(id){if(!(id in _salitaAvatars))_salitaAvatars[id]=null});
    if(Array.isArray(rows))rows.forEach(function(r){_salitaAvatars[r.id]=r.avatar_url||null});
  }catch(e){}
}

function salitaCountdown(deadline){
  var ms=new Date(deadline).getTime()-Date.now();
  if(ms<=0)return null;
  var g=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);
  return g>0?g+'g '+h+'h':(h>0?h+'h '+m+'m':m+'m');
}

async function renderSalita(scores){
  var el=document.getElementById('detail-salita');if(!el)return;
  var a=_currentDetail;if(!a)return;
  scores=Array.isArray(scores)?scores:[];
  _lastScores=scores;
  var n=scores.length;
  var uid=_session&&_session.user?_session.user.id:null;
  var myIdx=-1,i;
  for(i=0;i<n;i++){if(uid&&scores[i].user_id===uid){myIdx=i;break;}}

  // Sorpassi (tono spinta · motion-spec 2e: mai suoni, mai coriandoli)
  var myRank=myIdx>=0?scores[myIdx].rank:null;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(myRank&&_salitaPrevRank&&myRank!==_salitaPrevRank){
    showToast(myRank<_salitaPrevRank
      ?(lang==='it'?'Sorpasso! Ora sei '+myRank+'° in salita.':'Overtake! You are now #'+myRank+' on the climb.')
      :(lang==='it'?'Ti hanno superato — ora sei '+myRank+'°. Riprenditi la posizione!':'You\'ve been passed — now #'+myRank+'. Take it back!'));
  }
  if(myRank)_salitaPrevRank=myRank;

  var leader=n?parseFloat(scores[0].score)||0:0;
  var remaining=Math.max(0,(a.total_blocks||0)-(a.blocks_sold||0));

  // Fuori corsa: replica client del fairness guard (threshold -1)
  function isFuori(s){
    if(!s||s.rank===1||leader<=0)return false;
    var maxScore=Math.sqrt(Math.max(0,(Number(s.blocks)||0)+remaining))*(parseFloat(s.loyalty_mult)||1)+(parseFloat(s.pity_bonus)||0);
    return maxScore<leader;
  }
  var fuoriCount=0;
  for(i=0;i<n;i++){if(isFuori(scores[i]))fuoriCount++;}

  // Blocchi che servono a `who` per raggiungere il punteggio `target`
  function blocksToReach(who,target){
    if(!who)return null;
    var L=parseFloat(who.loyalty_mult)||1,P=parseFloat(who.pity_bonus)||0,B=Number(who.blocks)||0;
    return Math.max(1,Math.ceil(Math.pow(Math.max(0,target-P)/L,2)-B));
  }
  var me=myIdx>=0?scores[myIdx]:null;
  var meFuori=me?isFuori(me):false;
  var needTo1=me&&myIdx>0?blocksToReach(me,leader):null;                              // per superare il leader
  var needPrev=me&&myIdx>0?blocksToReach(me,parseFloat(scores[myIdx-1].score)||0):null; // per il corridore davanti
  var gap2nd=myIdx===0&&n>1?blocksToReach(scores[1],parseFloat(me.score)||0):null;     // quanto manca al 2° per prendermi

  // Finestra corridori: top3 + 5 davanti a me + me + ultimi 3
  var show={};
  [0,1,2].forEach(function(x){if(x<n)show[x]=true});
  if(myIdx>=0){for(var k=Math.max(0,myIdx-5);k<=myIdx;k++)show[k]=true;}
  [n-3,n-2,n-1].forEach(function(x){if(x>=0)show[x]=true});
  var idxs=Object.keys(show).map(Number).sort(function(x,y){return x-y});

  await salitaLoadAvatars(a.id,idxs.map(function(x){return scores[x].user_id}));
  el=document.getElementById('detail-salita');if(!el||!_currentDetail||_currentDetail.id!==a.id)return;

  var html='';
  // Quote altimetriche in € (75% · 50% · 25% del valore oggetto)
  var val=Number(a.object_value_eur)||0;
  if(val>0){
    [[26.9,.75],[53.8,.5],[78.8,.25]].forEach(function(q){
      html+='<div class="salita-quota" style="top:'+q[0]+'%"></div>'
        +'<span class="salita-quota-label" style="top:'+q[0]+'%">q. €'+Math.round(val*q[1]).toLocaleString('it-IT')+'</span>';
    });
  }
  // Sentiero
  html+='<svg class="salita-svg" viewBox="0 0 '+SALITA_VB_W+' '+SALITA_VB_H+'" preserveAspectRatio="none" aria-hidden="true"><path class="salita-path" d="'+SALITA_PATH_D+'" vector-effect="non-scaling-stroke"/></svg>';
  // Vetta (foto oggetto)
  var vettaHtml='<div class="salita-vetta">'
    +(a.image_url?'<img class="salita-vetta-img" src="'+a.image_url+'" alt="">':'<div class="salita-vetta-ph"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div>')
    +'<span class="salita-vetta-flag"><span class="it">VETTA</span><span class="en">SUMMIT</span></span></div>';
  html+=vettaHtml;
  // Bandierine ROBI (traguardi volanti)
  var robiFound=0,robiTotal=0;
  if(_rulloCounts&&_rulloCounts.total>0){
    robiTotal=_rulloCounts.total;robiFound=robiTotal-_rulloCounts.outstanding;
    var flagsN=Math.min(robiTotal,7);
    var foundFlags=Math.round(flagsN*(robiFound/robiTotal));
    for(var f=0;f<flagsN;f++){
      var ft=0.08+0.8*(f+1)/(flagsN+1);
      // Fiori ROBI sul sentiero (Skeezu 10 lug): raccolti = fiore pieno · da raccogliere = tratteggiato
      html+='<div class="salita-flagpin'+(f<foundFlags?' picked':'')+'" data-t="'+ft.toFixed(3)+'"><svg width="16" height="22" viewBox="0 0 24 24" fill="none" stroke="'+(f<foundFlags?'var(--gold)':'var(--gray-500)')+'" stroke-width="1.6"'+(f<foundFlags?'':' stroke-dasharray="2 2"')+'><path d="M12 13.5V22"/><circle cx="12" cy="4.6" r="1.8"/><circle cx="16.6" cy="8" r="1.8"/><circle cx="14.9" cy="12.6" r="1.8"/><circle cx="9.1" cy="12.6" r="1.8"/><circle cx="7.4" cy="8" r="1.8"/><circle cx="12" cy="8.8" r="2.7"'+(f<foundFlags?' fill="rgba(239,62,79,.15)"':'')+'/></svg></div>';
    }
  }
  // Stato limite: sentiero libero (2c)
  if(n===0){
    html+='<div class="salita-empty"><div class="salita-empty-t"><span class="it">Il sentiero è libero</span><span class="en">The trail is clear</span></div>'
      +'<div class="salita-empty-s"><span class="it">Parti per primo: il primo Step ti mette in vetta.</span><span class="en">Be the first: your first Step puts you at the summit.</span></div></div>';
  }
  // Chip distacco sul sentiero, accanto al corridore davanti a me (2c)
  var tMe=null;
  if(me){tMe=0.04+0.9*(leader>0?(parseFloat(me.score)||0)/leader:0);}
  if(myIdx>0&&needPrev){
    var tPrev=0.04+0.9*(leader>0?(parseFloat(scores[myIdx-1].score)||0)/leader:0);
    html+='<div class="salita-gap-chip" data-t="'+tPrev.toFixed(3)+'"><span class="it">distacco ~'+needPrev.toLocaleString('it-IT')+' Step</span><span class="en">gap ~'+needPrev.toLocaleString('en-US')+' Steps</span></div>';
  }
  // Corridori + gap compressi
  var prevShown=null;
  var miniRiders=[];
  idxs.forEach(function(x,ord){
    var s=scores[x];
    var rel=leader>0?(parseFloat(s.score)||0)/leader:0;
    var t=0.04+0.9*rel;
    if(prevShown!==null&&x-prevShown>1){
      var gap=x-prevShown-1;
      var tp=leader>0?0.04+0.9*((parseFloat(scores[prevShown].score)||0)/leader):0.04;
      html+='<div class="salita-plus" data-t="'+((t+tp)/2).toFixed(3)+'">+'+gap+'</div>';
      miniRiders.push({plus:gap,t:(t+tp)/2});
    }
    prevShown=x;
    var isMe=x===myIdx;
    var fuori=isFuori(s);
    var boost=isMe&&s.pity_phase&&s.pity_phase!=='normal';
    var aria=(isMe?(lang==='it'?'La tua posizione: ':'Your position: '):'')+s.rank+'ª';
    miniRiders.push({uid:s.user_id,me:isMe,fuori:fuori,t:t});
    if(isMe){
      // Motion-spec 2e: al buy l'avatar parte dalla posizione precedente e AVANZA lungo il sentiero
      var animate=_salitaJustBought&&_salitaMyPrevT!==null&&t>_salitaMyPrevT;
      html+='<div class="salita-rider me'+(fuori?' fuori':'')+(_salitaJustBought?' just-bought':'')+'" data-t="'+(animate?_salitaMyPrevT.toFixed(3):t.toFixed(3))+'"'+(animate?' data-t-final="'+t.toFixed(3)+'"':'')+' role="img" aria-label="'+aria+'">'
        +'<span style="position:relative;display:inline-block">'+salitaAvatarHtml(s.user_id,true)
        +(boost?'<span class="salita-boost" title="Boost di garanzia attivo"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></span>':'')
        +'</span><span class="salita-me-badge"><span class="it">TU · '+s.rank+'°'+(fuori?' · fuori corsa':'')+'</span><span class="en">YOU · '+s.rank+'°'+(fuori?' · out':'')+'</span></span></div>';
    }else{
      html+='<div class="salita-rider'+(fuori?' fuori':'')+'" data-t="'+t.toFixed(3)+'" data-dx="'+((ord%2?1:-1)*3)+'" role="img" aria-label="'+aria+'" title="'+s.rank+'°'+(fuori?(lang==='it'?' · fuori corsa':' · out'):'')+'">'
        +salitaAvatarHtml(s.user_id,false)+'</div>';
    }
  });
  _salitaJustBought=false;
  if(tMe!==null)_salitaMyPrevT=tMe;

  // ── Variante compatta (2d) — mobile: sparkline orizzontale ──
  var mini='<svg viewBox="0 0 480 88" preserveAspectRatio="none" aria-hidden="true"><path d="M8,74 C130,66 330,42 452,14" fill="none" stroke="var(--gray-600)" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/></svg>';
  mini+='<div class="salita-mini-vetta">'+(a.image_url?'<img src="'+a.image_url+'" alt="">':'<div class="salita-mini-ph"><svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div>')+'</div>';
  miniRiders.forEach(function(r){
    var mx=5+r.t*85, my=80-r.t*62;
    if(r.plus){mini+='<span class="salita-plus" style="left:'+mx.toFixed(1)+'%;top:'+my.toFixed(1)+'%">+'+r.plus+'</span>';return;}
    mini+='<div class="salita-rider mini'+(r.me?' me':'')+(r.fuori?' fuori':'')+'" style="left:'+mx.toFixed(1)+'%;top:'+my.toFixed(1)+'%">'+salitaAvatarHtml(r.uid,r.me)+'</div>';
  });

  // ── Header · badge · contatori · CTA (2c quick action) ──
  var cd=a.deadline?salitaCountdown(a.deadline):null;
  var volata=a.deadline&&(new Date(a.deadline).getTime()-Date.now())<86400000&&(new Date(a.deadline).getTime()-Date.now())>0;
  var inVetta=myIdx===0&&n>0;
  var counters='';
  if(robiTotal>0){
    counters+='<span class="sc-item" style="color:var(--gold)">'+UI_ICONS.flower+'<span style="color:var(--gray-400)"><strong>'+robiFound+'/'+robiTotal+' ROBI</strong> <span class="it">raccolti sul percorso</span><span class="en">picked up on the trail</span></span></span>';
  }
  if(inVetta&&gap2nd){
    counters+='<span class="sc-item"><span class="it">Il 2° è a <strong>~'+gap2nd.toLocaleString('it-IT')+' Step</strong> — difendi la posizione fino alla chiusura</span><span class="en">#2 is <strong>~'+gap2nd.toLocaleString('en-US')+' Steps</strong> away — defend until close</span></span>';
  }else if(myIdx>0&&needPrev){
    counters+='<span class="sc-item"><span class="it">distacco dal '+scores[myIdx-1].rank+'°: <strong>~'+needPrev.toLocaleString('it-IT')+' Step</strong></span><span class="en">gap to #'+scores[myIdx-1].rank+': <strong>~'+needPrev.toLocaleString('en-US')+' Steps</strong></span></span>';
  }
  if(fuoriCount>0){
    counters+='<span class="sc-item"><span class="it"><strong>'+fuoriCount+'</strong> fuori corsa</span><span class="en"><strong>'+fuoriCount+'</strong> out of the race</span></span>';
  }
  // Quick action contestuale (2c): imposta lo slider ai blocchi giusti e porta al box acquisto
  // Il venditore non corre la propria corsa (guardia SELLER_CANNOT_STEP + sellerbox): nessuna CTA
  var isSeller=!_publicMode&&uid&&(a.submitted_by===uid||a.created_by===uid);
  var cta='';
  if(remaining>0&&!isSeller){
    if(!uid||_publicMode){
      cta='<button class="salita-cta" onclick="salitaQuickBuy(1)"><span class="it">Entra in corsa</span><span class="en">Join the climb</span></button>';
    }else if(n===0){
      cta='<button class="salita-cta" onclick="salitaQuickBuy(1)"><span class="it">Parti per primo</span><span class="en">Be the first to climb</span></button>';
    }else if(inVetta){
      cta='<button class="salita-cta outline" onclick="salitaQuickBuy('+(gap2nd?Math.min(gap2nd,50):5)+')"><span class="it">Difendi la posizione</span><span class="en">Defend your position</span></button>';
    }else if(myIdx<0){
      cta='<button class="salita-cta" onclick="salitaQuickBuy(1)"><span class="it">Entra in corsa</span><span class="en">Join the climb</span></button>';
    }else if(!meFuori&&needTo1){
      cta='<button class="salita-cta" onclick="salitaQuickBuy('+needTo1+')"><span class="it">Attacca la 1ª posizione</span><span class="en">Attack the summit</span></button>';
    }
  }
  el.innerHTML='<div class="salita-wrap">'
    +'<div class="salita-head"><div><div class="salita-h1"><span class="it">La Salita</span><span class="en">The Climb</span></div>'
    +(n>0?'<div class="salita-sub"><span>'+n+' <span class="it">in corsa</span><span class="en">climbing</span></span>'
      +(fuoriCount>0?'<span>·</span><span>'+fuoriCount+' <span class="it">fuori corsa</span><span class="en">out</span></span>':'')
      +(cd?'<span>·</span><span><span class="it">chiusura tra</span><span class="en">closes in</span> '+cd+'</span>':'')
      +'</div>':'')
    +'</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">'
    +(inVetta?'<span class="salita-invetta"><span class="it">SEI IN VETTA</span><span class="en">AT THE SUMMIT</span></span>':'')
    +(volata?'<span class="salita-volata"><span class="it">VOLATA FINALE</span><span class="en">FINAL SPRINT</span></span>':'')
    +'</div></div>'
    +'<div class="salita-field">'+html+'</div>'
    +'<div class="salita-mini">'+mini+'</div>'
    +(counters?'<div class="salita-counters">'+counters+'</div>':'')
    +cta
    +'<p class="salita-legal"><span class="it">Posizione deterministica: punteggio = √Step × moltiplicatore fedeltà + boost di garanzia. Chi è in vetta alla chiusura ottiene l\'oggetto; a tutti gli altri, alla chiusura, va un ROBI Reward: il ringraziamento per aver corso.</span><span class="en">Deterministic position: score = √Steps × loyalty multiplier + guarantee boost. Whoever is at the summit at close gets the item; everyone else receives ROBI Reward at close — a thank-you for the climb.</span></p>'
    +'</div>';

  // Posizionamento sul sentiero via getPointAtLength
  el.querySelectorAll('.salita-field [data-t]').forEach(function(node){
    var p=salitaPointAt(parseFloat(node.getAttribute('data-t'))||0);
    var dx=parseFloat(node.getAttribute('data-dx'))||0;
    node.style.left=(p[0]+dx)+'%';
    node.style.top=p[1]+'%';
  });
  // Motion-spec 2e: avanzamento lungo il sentiero (900ms emphasized via CSS transition)
  var meNode=el.querySelector('.salita-rider.me[data-t-final]');
  if(meNode){
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      var p=salitaPointAt(parseFloat(meNode.getAttribute('data-t-final'))||0);
      meNode.style.left=p[0]+'%';meNode.style.top=p[1]+'%';
    });});
  }
}

// Quick action Salita (2c): preset dello slider + scroll al box acquisto
function salitaQuickBuy(qty){
  var slider=document.getElementById('buy-slider');
  if(slider&&!slider.disabled&&qty){
    var maxV=parseInt(slider.max||'1',10);
    slider.value=Math.max(1,Math.min(qty,maxV));
    if(typeof onSlider==='function')onSlider();
  }
  var box=document.querySelector('.buy-box');
  if(box){
    box.scrollIntoView({behavior:'smooth',block:'center'});
    box.classList.remove('salita-flash');void box.offsetWidth;box.classList.add('salita-flash');
  }
}

// GS-8 · Condividi airdrop (Web Share API native + clipboard fallback)
async function shareAirdrop(airdropId,title){
  var url=location.origin+'/dapp/airdrop/'+airdropId;
  var shareData={title:title?(title+' — AIROOBI'):'AIROOBI airdrop',text:'Guarda questa corsa su AIROOBI',url:url};
  try{
    if(navigator.share){await navigator.share(shareData);return;}
  }catch(e){if(e&&e.name==='AbortError')return;}
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(url);
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      showToast(lang==='it'?'Link copiato negli appunti':'Link copied to clipboard','success');
      return;
    }
  }catch(_){ }
  // ultimo fallback: prompt
  try{prompt('Copia il link:',url);}catch(_){ }
}

// GS-12 · Banner AUTO-BUY attivo on-top (mostra solo se rule attiva)
async function updateAutoBuyBanner(airdropId){
  var banner=document.getElementById('detail-autobuy-banner');
  if(!banner)return;
  var rule=await loadAutoBuyRule(airdropId);
  if(!rule||!rule.active){
    banner.style.display='none';
    banner.innerHTML='';
    return;
  }
  var h=parseFloat(rule.interval_hours);
  var intervalLabel=h<1?Math.round(h*60)+'min':h+'h';
  banner.style.display='';
  banner.innerHTML=''
    +'<span class="ab-banner-icon">'+UI_ICONS.zap+'</span>'
    +'<span class="ab-banner-text"><strong><span class="it">AUTO-STEP ATTIVO</span><span class="en">AUTO-STEP ACTIVE</span></strong> · '
    +'<span class="it">sta facendo '+rule.blocks_per_interval+' Step ogni '+intervalLabel+' per te</span>'
    +'<span class="en">advancing '+rule.blocks_per_interval+' Steps every '+intervalLabel+' for you</span>'
    +' · <span class="ab-banner-prog">'+rule.total_bought+'/'+rule.max_blocks+'</span></span>'
    +'<a href="#auto-buy-box" class="ab-banner-link" onclick="event.preventDefault();scrollToAutoBuyBox();return false;"><span class="it">gestisci</span><span class="en">manage</span></a>';
}

// GS-12 reopen 24 May · scroll robusto a #auto-buy-box con offset topbar (62px sticky).
// Reopen-2: smooth scroll era no-op su questa pagina (ROBY measured). Scroll istantaneo
// window.scrollTo(0, targetY) — instant è UX accettabile, smooth lo verifichi una volta
// trovato il conflitto (scroll-behavior CSS o altro che annulla il smooth).
// 18 lug (Skeezu) · Tab mobile del dettaglio airdrop: Salita / Info / Impostazioni
function showOwnerPop(){
  var p=document.getElementById('owner-pop');
  if(p)p.classList.add('open');
}
function showRaceInfo(type){
  // 20 lug: meta corsa a sole icone — il tap apre il popup informativo
  var p=document.getElementById('race-pop');if(!p)return;
  var t=document.getElementById('rp-title'),v=document.getElementById('rp-value'),x=document.getElementById('rp-txt');
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(type==='time'){
    var dc=document.getElementById('detail-countdown');
    var dl=dc?dc.dataset.deadline:null;
    var cd=dl?fmtCountdown(dl):null;
    var dtIt='',dtEn='';
    if(dl){var d=new Date(dl);
      dtIt=d.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})+' alle '+d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
      dtEn=d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+' at '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
    t.innerHTML='<span class="it">Tempo rimanente</span><span class="en">Time left</span>';
    v.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
      +'<b'+(dl?' data-deadline="'+dl+'"':'')+'>'+(cd?(cd.expired?(lang==='it'?'Corsa chiusa':'Race closed'):(lang==='it'?cd.text:cd.en)):'—')+'</b>';
    x.innerHTML='<span class="it">La corsa si chiude '+(dtIt||'a scadenza')+'. Ultimo momento utile per fare Step.</span>'
      +'<span class="en">The race closes '+(dtEn?'on '+dtEn:'at the deadline')+'. Last chance to make your Steps.</span>';
  }else{
    var n=document.getElementById('race-meta-n');
    t.innerHTML='<span class="it">In corsa</span><span class="en">Racing now</span>';
    v.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'
      +'<b id="rp-racers-n">'+((n&&n.textContent!=='—')?n.textContent:'0')+'</b>';
    x.innerHTML='<span class="it">Utenti che stanno facendo Step in questa corsa verso la vetta.</span>'
      +'<span class="en">Users currently making Steps in this climb to the summit.</span>';
  }
  p.classList.add('open');
}
function detailTab(t){
  var d=document.getElementById('detail');if(!d)return;
  d.setAttribute('data-dtab',t);
  document.querySelectorAll('#detail-tabbar .dtb-btn').forEach(function(b){
    b.classList.toggle('active',b.getAttribute('data-dt')===t);
  });
  window.scrollTo(0,0);
}
function scrollToAutoBuyBox(){
  // Su mobile l'auto-buy vive nel tab Impostazioni: prima cambia tab
  if(window.innerWidth<=768&&typeof detailTab==='function')detailTab('set');
  var el=document.getElementById('auto-buy-box');
  if(!el)return;
  var rect=el.getBoundingClientRect();
  var topOffset=62+8; // topbar height + small padding
  var targetY=window.pageYOffset+rect.top-topOffset;
  window.scrollTo(0,targetY);
}

// GS-15 · Hint "~X blocchi per il 1°" + riga soglia "⚠ Tra ~N blocchi venduti…"
async function loadHintSoglia(airdropId){
  var el=document.getElementById('detail-hint-soglia');
  if(!el||!_session||!_session.user)return;
  var token=await getValidToken();if(!token)return;
  try{
    var cm=await sbRpc('compute_checkmate_blocks',{p_user_id:_session.user.id,p_airdrop_id:airdropId},token);
    if(!cm||typeof cm!=='object'){el.innerHTML='';return;}
    var blocksToOvertake=Number(cm.blocks_to_overtake_leader||0);
    var ariaCost=Number(cm.aria_cost_to_overtake||0);
    // GS-15 minor reopen 24 May: rank dal box "Sei 1°…" è authoritative.
    // compute_checkmate_blocks può tornare blocks=1 anche con utente già 1°
    // (tie-breaker score). _myRanks[airdropId].rank===1 → utente è 1° davvero.
    var myRank=_myRanks[airdropId]&&_myRanks[airdropId].rank;
    var isLeader=(Number(cm.user_blocks_current)>0 && blocksToOvertake===0)
              || myRank===1;
    // Soglia via fairness_threshold_remaining
    var threshold=null;
    try{
      var t=await sbRpc('fairness_threshold_remaining',{p_airdrop_id:airdropId,p_user_id:_session.user.id},token);
      if(t!==null&&t!==undefined)threshold=Number(t);
    }catch(_){threshold=null;}
    // GS-15p1 + GS-15 reopen v3 · claim "corsa in salita" intestazione + 5 stati salita
    // threshold sentinel: -1 guard blocca · 0 limite (compra tutti) · 1-300 warning · >300 neutro
    var salitaStato='';
    if(isLeader){
      salitaStato='<div class="hint-salita-stato hint-salita-cima"><span class="it">Sei in cima alla salita.</span><span class="en">You\'re at the top of the climb.</span></div>';
    }else if(threshold===-1){
      salitaStato='<div class="hint-salita-stato hint-salita-fuori"><span class="it">La salita è chiusa per te.</span><span class="en">The climb is closed for you.</span></div>';
    }else if(threshold===0){
      salitaStato='<div class="hint-salita-stato hint-salita-limite"><span class="it">Sei al limite della salita.</span><span class="en">You\'re at the climb\'s edge.</span></div>';
    }else if(threshold!==null && threshold<=300){
      salitaStato='<div class="hint-salita-stato hint-salita-chiudendo"><span class="it">La salita si sta chiudendo.</span><span class="en">The climb is closing.</span></div>';
    }else{
      salitaStato='<div class="hint-salita-stato hint-salita-corsa"><span class="it">Sei ancora in corsa.</span><span class="en">You\'re still in the race.</span></div>';
    }
    var html=''
      +'<div class="hint-salita-head">'
      +'<span class="hint-salita-title"><span class="it">La tua salita</span><span class="en">Your climb</span></span>'
      +salitaStato
      +'</div>';
    if(isLeader){
      html+='<div class="hint-row hint-leader">'+UI_ICONS.star+' <span class="it">Sei in testa — difendi il primato con altri Step</span><span class="en">You\'re leading — defend it with more Steps</span></div>';
    }else if(blocksToOvertake>0){
      html+='<div class="hint-row hint-target">&#9658; <span class="it">~<strong>'+blocksToOvertake.toLocaleString('it-IT')+'</strong> Step alla vetta</span>'
        +'<span class="en">~<strong>'+blocksToOvertake.toLocaleString('en-US')+'</strong> Steps to the summit</span>'
        +(ariaCost>0?' <span class="hint-aria-cost">&middot; '+ariaCost.toLocaleString('it-IT')+' '+tokIcon('ARIA')+'</span>':'')
        +'</div>';
    }
    if(threshold!==null && !isLeader){
      if(threshold===-1){
        html+='<div class="hint-row hint-soglia hint-soglia-out">&#9888; <span class="it">Matematicamente fuori — il leader è irraggiungibile per te</span><span class="en">Mathematically out — leader unreachable</span></div>';
      }else if(threshold===0){
        html+='<div class="hint-row hint-soglia hint-soglia-limite">&#9888; <span class="it">Sei al limite — solo facendo tutti gli Step rimasti puoi ancora arrivare in vetta</span><span class="en">At the edge — only taking all remaining Steps keeps you in</span></div>';
      }else if(threshold<=300){
        html+='<div class="hint-row hint-soglia">&#9888; <span class="it">Tra ~<strong>'+threshold.toLocaleString('it-IT')+'</strong> Step fatti da altri non potrai più aggiudicartelo</span>'
          +'<span class="en">In ~<strong>'+threshold.toLocaleString('en-US')+'</strong> Steps taken by others you won\'t be able to reach the summit anymore</span>'
          +'</div>';
      }
    }
    el.innerHTML=html;
  }catch(e){el.innerHTML='';}
}

// PR-5 · Pannello esito per airdrop concluso (F7/F8): vincitore, consegna, ROBI.
// Sostituisce il buy box quando lo status è completed/annullato/closed/
// waiting_seller_acknowledge. Riusa lo styling buy-box e openClaimModal.
function _renderOutcomePanel(a,myBlocks,myRobi){
  var uid=_session&&_session.user&&_session.user.id;
  var st=a.status;
  var participated=myBlocks>0;
  var isWinner=st==='completed'&&a.winner_id&&uid&&a.winner_id===uid;
  var titleSafe=(a.title||'').replace(/'/g,"\\'");
  var storyLink=a.story_public_visible&&a.story_public_url
    ?'<a href="'+a.story_public_url+'" target="_blank" rel="noopener" style="color:var(--gold);font-size:11px;letter-spacing:.5px;text-decoration:none;font-family:var(--font-m)"><span class="it">STORIA PUBBLICA →</span><span class="en">PUBLIC STORY →</span></a>'
    :'';
  var chipIt,chipEn,chipColor;
  if(st==='completed'){chipIt='Airdrop concluso';chipEn='Airdrop closed';chipColor='#22c55e';}
  else if(st==='annullato'){chipIt='Airdrop annullato';chipEn='Airdrop cancelled';chipColor='#ef4444';}
  else if(st==='waiting_seller_acknowledge'){chipIt='In attesa del venditore';chipEn='Awaiting seller';chipColor='var(--gold)';}
  else {chipIt='Airdrop chiuso';chipEn='Airdrop closed';chipColor='var(--gray-400)';}
  var head='<div class="buy-box-label" style="display:flex;align-items:center;gap:8px">'
    +'<span style="width:8px;height:8px;border-radius:50%;background:'+chipColor+';display:inline-block;flex:none"></span>'
    +'<span class="it">'+chipIt+'</span><span class="en">'+chipEn+'</span></div>';
  var body;
  if(st==='waiting_seller_acknowledge'){
    body='<p class="buy-box-framing"><span class="it">L\'airdrop è concluso. Il venditore ha 72 ore per confermare la chiusura — l\'esito comparirà qui appena decide.</span><span class="en">The airdrop has closed. The seller has 72 hours to confirm — the outcome will appear here once decided.</span></p>';
  }else if(st==='annullato'){
    body='<p class="buy-box-framing"><span class="it">Questo airdrop è stato annullato. I partecipanti sono stati rimborsati in ARIA per intero; i fiori ROBI già raccolti sul percorso restano nel portafoglio.</span><span class="en">This airdrop was cancelled. Participants were fully refunded in ARIA; ROBI flowers already picked stay in the wallet.</span></p>';
  }else if(isWinner){
    body='<p class="buy-box-framing"><span class="it">Hai ottenuto l\'oggetto: <strong>'+a.title+'</strong>. Inserisci l\'indirizzo di spedizione per riceverlo.</span><span class="en">You got the item: <strong>'+a.title+'</strong>. Submit your shipping address to receive it.</span></p>'
      +'<button class="buy-btn" onclick="openClaimModal(\''+a.id+'\',\''+titleSafe+'\')"><span class="it">Reclama l\'oggetto →</span><span class="en">Claim the item →</span></button>';
  }else if(st==='completed'&&participated){
    body='<p class="buy-box-framing"><span class="it">L\'oggetto è stato assegnato a un altro partecipante. I tuoi ROBI Reward restano con te, riscattabili in KAS quando vuoi.</span><span class="en">The item went to another participant. Your ROBI Reward stay with you, redeemable in KAS anytime.</span></p>';
  }else{
    body='<p class="buy-box-framing"><span class="it">Questo airdrop si è concluso e l\'oggetto è andato al 1° in classifica.</span><span class="en">This airdrop has closed — the item went to the #1 in the ranking.</span></p>';
  }
  var robiLine='';
  if(st==='completed'&&participated&&!isWinner&&!_publicMode){
    robiLine=myRobi>0
      ?'<div style="font-size:13px;color:var(--gold);font-family:var(--font-m);letter-spacing:.5px;margin-top:6px"><strong>'+Number(myRobi).toFixed(2)+'</strong> '+tokIcon('ROBI')+' <span class="it">accumulate da questo evento</span><span class="en">earned from this event</span></div>'
      :'<div style="font-size:12px;color:var(--gray-400);margin-top:6px"><span class="it">Nessun ROBI accumulato da questo evento</span><span class="en">No ROBI earned from this event</span></div>';
  }
  return '<div class="buy-box">'+head+body+robiLine
    +(storyLink?'<div style="margin-top:10px">'+storyLink+'</div>':'')
    +'</div>';
}

async function loadAutoBuyStatus(airdropId){
  var rule=await loadAutoBuyRule(airdropId);
  var btn=document.getElementById('ab-toggle');
  var status=document.getElementById('ab-status');
  if(!rule||!rule.active){
    if(btn)btn.innerHTML='<span class="it">MANTIENI IL PASSO</span><span class="en">KEEP THE PACE</span>';
    if(status)status.textContent='';
    return;
  }
  if(btn){btn.innerHTML='<span class="it">FERMA IL PASSO</span><span class="en">STOP THE PACE</span>';btn.style.background='var(--red)';}
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var h=parseFloat(rule.interval_hours);
  var intervalLabel=h<1?Math.round(h*60)+'min':h+'h';
  if(status)status.textContent=(lang==='it'?'Attivo: ':'Active: ')+rule.blocks_per_interval+(lang==='it'?' Step ogni ':' Steps every ')+intervalLabel+' ('+rule.total_bought+'/'+rule.max_blocks+')';
  var qty=document.getElementById('ab-qty');if(qty)qty.value=rule.blocks_per_interval;
  var interval=document.getElementById('ab-interval');if(interval)interval.value=h;
  var max=document.getElementById('ab-max');if(max)max.value=rule.max_blocks;
}

// ── Position Live ──
function updateDetailPosition(airdropId,scores){
  renderSalita(scores);
  // Mockup v3: la POSIZIONE vive anche nel mystrip (rossa se 1°)
  var _msp=document.getElementById('mystrip-pos');
  if(_msp&&_session&&scores&&scores.length>0){
    var _mp=0;
    for(var _i=0;_i<scores.length;_i++){if(scores[_i].user_id===_session.user.id){_mp=scores[_i].rank;break;}}
    _msp.textContent=_mp>0?(_mp+'°'):'—';
    _msp.classList.toggle('ms-first',_mp===1);
  }
  // Meta di corsa compatta: quanti in corsa (visibile in tutti i tab)
  var _rmn=document.getElementById('race-meta-n');
  if(_rmn)_rmn.textContent=(scores&&scores.length)||0;
  var _rpn=document.getElementById('rp-racers-n');
  if(_rpn)_rpn.textContent=(scores&&scores.length)||0;
  // 20 lug: per il venditore non c'è l'HUD (#detail-position) ma la guida punteggio
  // nel tab Info va popolata comunque — prima restava una cornice vuota.
  var el=document.getElementById('detail-position');
  if(!el){updateStrategyGuide(scores,0,(scores&&scores.length)||0,null);return;}
  if(!_session||!scores||scores.length===0){
    var total=scores?scores.length:0;
    el.innerHTML='<span class="it">Entra ora — <strong>'+total+'</strong> partecipanti attivi</span>'
      +'<span class="en">Join now — <strong>'+total+'</strong> active participants</span>';
    el.className='detail-position not-in';
    updateStrategyGuide(scores,0,total,null);
    return;
  }
  // Find current user in scored ranking
  var pos=0,total=scores.length;
  for(var i=0;i<scores.length;i++){
    if(scores[i].user_id===_session.user.id){pos=scores[i].rank;break;}
  }
  if(pos===0){
    el.innerHTML='<span class="it">Entra ora — <strong>'+total+'</strong> partecipanti attivi</span>'
      +'<span class="en">Join now — <strong>'+total+'</strong> active participants</span>';
    el.className='detail-position not-in';
    updateStrategyGuide(scores,0,total,null);
    return;
  }
  var myScore=scores.find(function(s){return s.user_id===_session.user.id});
  var leaderScoreV=scores[0]?parseFloat(scores[0].score)||0:0;
  var myScoreV=myScore?parseFloat(myScore.score)||0:0;
  var scoreGap=pos>1?Math.max(0,leaderScoreV-myScoreV):0;
  var myPityPhase=myScore&&myScore.pity_phase?myScore.pity_phase:'normal';
  var pityBadge='';
  if(myPityPhase==='hard'){
    pityBadge=' <span class="pity-badge hard" title="Sei nel Boost di garanzia hard — il prossimo oggetto è quasi sicuramente tuo">'+UI_ICONS.zap+' <span class="it">Boost HARD</span><span class="en">HARD Boost</span></span>';
  } else if(myPityPhase==='soft'){
    pityBadge=' <span class="pity-badge soft" title="Boost di garanzia soft attivo">'+UI_ICONS.zap+' <span class="it">Boost soft</span><span class="en">Soft Boost</span></span>';
  }
  el.innerHTML='<div class="pos-main"><span class="it">Sei <strong>'+pos+'°</strong> su '+total+' partecipanti</span>'
    +'<span class="en">You are <strong>#'+pos+'</strong> of '+total+' participants</span>'+pityBadge+'</div>'
    +'<div class="pos-breakdown">'
    +'<span title="Tuo Punteggio (Step × fedeltà + boost)"><span class="pos-label"><span class="it">Punteggio</span><span class="en">Score</span></span> '+myScoreV.toFixed(2)+'</span>'
    +'<span title="Punteggio del primo in classifica"><span class="pos-label"><span class="it">Primo</span><span class="en">Leader</span></span> '+leaderScoreV.toFixed(2)+'</span>'
    +(scoreGap>0?'<span title="Distacco di Punteggio dal primo"><span class="pos-label"><span class="it">Gap</span><span class="en">Gap</span></span> '+scoreGap.toFixed(2)+'</span>':'')
    +'</div>';
  el.className='detail-position in';
  // Check if position worsened
  if(_lastPosition!==null&&pos>_lastPosition){
    el.classList.add('shake');
    setTimeout(function(){el.classList.remove('shake')},600);
    showToast('<span class="it">Sei stato superato — fai altri Step per risalire</span><span class="en">You\'ve been overtaken — take more Steps to climb back</span>');
    notifyPositionLost(airdropId);
  }
  _lastPosition=pos;
  // Update cached rank for grid cards
  var _ms=scores.find(function(s){return s.user_id===_session.user.id});
  _myRanks[airdropId]={rank:pos,total:total,score:_ms?.score||0,blocks:_ms?.blocks||0,aria_spent:_ms?.aria_spent||0};
  // Update strategy guide with live data
  updateStrategyGuide(scores,pos,total,myScore);
  // GS-15 minor reopen 24 May: re-sync hint soglia con rank live (path isLeader).
  if(_currentDetail&&_currentDetail.id===airdropId&&_session&&_session.user)loadHintSoglia(airdropId);
}

// ── Strategy Guide (engagement · Scoring v5) ──
function updateStrategyGuide(scores,pos,total,myScore){
  var el=document.getElementById('detail-strategy');if(!el)return;
  var a=_currentDetail;if(!a)return;

  // ── PUBLIC / NOT PARTICIPATING ──
  if(!_session||!myScore||pos===0){
    el.innerHTML=''
      +'<div class="strategy-box">'
      +'<div class="strategy-title"><span class="it">Come funziona il punteggio?</span><span class="en">How does scoring work?</span></div>'
      +'<div style="padding:14px 16px;background:rgba(239,62,79,.05);border:1px solid rgba(239,62,79,.2);border-radius:var(--radius-sm);margin-bottom:14px;line-height:1.55;font-size:13px;color:var(--gray-300)">'
      +'<span class="it">Il Punteggio combina tre cose: gli <strong style="color:var(--gold)">Step</strong> che fai (a radice quadrata), il <strong style="color:var(--gold)">Moltiplicatore Fedelt&agrave;</strong> sugli ARIA spesi in categoria, e un <strong style="color:var(--gold)">Boost di garanzia</strong> che si attiva se partecipi spesso senza ancora ottenere un oggetto. Tutto deterministico: conta il punteggio, non il caso.</span>'
      +'<span class="en">The Score combines three things: <strong style="color:var(--gold)">Steps</strong> you take (square-root), the <strong style="color:var(--gold)">Loyalty Multiplier</strong> on category ARIA spent, and a <strong style="color:var(--gold)">Guarantee Boost</strong> that kicks in if you participate often without getting an item yet. Fully deterministic: your score decides, not chance.</span>'
      +'</div>'
      +'<div class="strategy-tip">'
      +'<span class="it">Chi &egrave; in vetta alla chiusura ottiene l\'oggetto. Tutti raccolgono fiori ROBI sul percorso, e alla chiusura arriva il ROBI di ringraziamento per la corsa.</span>'
      +'<span class="en">Whoever is at the summit at close gets the item. Everyone picks up ROBI flowers on the trail, plus a thank-you ROBI at close.</span>'
      +'</div>'
      +'</div>';
    return;
  }

  // ── PARTICIPATING (Scoring v5) ──
  var myScoreV=parseFloat(myScore.score)||0;
  var myFBase=parseFloat(myScore.f_base||0);
  var myPityBonus=parseFloat(myScore.pity_bonus||0);
  var myPityPhase=myScore.pity_phase||'normal';
  var myLosses=parseInt(myScore.losses_count||0,10);
  var myPityThreshold=parseInt(myScore.pity_threshold||0,10)||30;
  var myLoyaltyMult=parseFloat(myScore.loyalty_mult||1);
  var myHistoricAria=parseFloat(myScore.historic_aria||0);
  var myCurrentAria=parseFloat(myScore.current_aria||myScore.aria_spent)||0;
  var myBlocks=myScore.blocks||0;

  var leader=scores[0];
  var leaderScoreV=leader?parseFloat(leader.score)||0:0;
  var isFirst=pos===1;

  // Loyalty tier next milestone
  var loyaltyNext=null;
  if(myHistoricAria<100)loyaltyNext=100;
  else if(myHistoricAria<1000)loyaltyNext=1000;
  else if(myHistoricAria<10000)loyaltyNext=10000;
  else if(myHistoricAria<100000)loyaltyNext=100000;

  // Pity UI values
  var pityPct=myPityThreshold>0?Math.min(100,Math.round(myLosses/myPityThreshold*100)):0;
  var softPitySoglia=Math.ceil(myPityThreshold*0.6);
  var pityStatusIt, pityStatusEn;
  if(myPityPhase==='hard'){
    pityStatusIt='Boost HARD attivo — il 1° posto è quasi sicuramente tuo, salvo altri utenti con pi&ugrave; partecipazioni di te in Hard';
    pityStatusEn='HARD Boost active — #1 is almost certainly yours, unless others have more participations in Hard';
  } else if(myPityPhase==='soft'){
    var softProg=Math.max(1,Math.round((myLosses-softPitySoglia)/Math.max(1,myPityThreshold-softPitySoglia)*100));
    pityStatusIt='Boost soft attivo ('+softProg+'%) — sei molto competitivo';
    pityStatusEn='Soft Boost active ('+softProg+'%) — you\'re very competitive';
  } else {
    var toSoft=Math.max(0,softPitySoglia-myLosses);
    pityStatusIt=toSoft>0?toSoft+' partecipazioni in categoria al prossimo Boost':'Boost in arrivo al prossimo airdrop!';
    pityStatusEn=toSoft>0?toSoft+' category participations to next Boost':'Boost at next airdrop!';
  }

  // Tips (sempre CTA partecipativo, mai "aspetta il pity")
  var tipsIt=[], tipsEn=[];
  if(isFirst){
    tipsIt.push('Sei in testa! Avanza di altri Step e continua a correre in categoria per difendere il primato.');
    tipsEn.push('You\'re leading! Advance more Steps and keep running in category to defend #1.');
    if(total>1){
      var second=scores[1];
      var gap=second?myScoreV-(parseFloat(second.score)||0):0;
      if(gap>0 && gap<myScoreV*0.15){
        tipsIt.push('Attenzione: il 2&deg; &egrave; a <strong>'+gap.toFixed(2)+'</strong> dal tuo Punteggio. Non mollare.');
        tipsEn.push('Watch out: #2 is <strong>'+gap.toFixed(2)+'</strong> behind you. Don\'t let up.');
      }
    }
  } else {
    if(myPityPhase==='hard'){
      tipsIt.push('Il tuo <strong>Boost HARD</strong> &egrave; attivo: continua ad avanzare di Step — il 1° posto è quasi sicuramente tuo.');
      tipsEn.push('Your <strong>HARD Boost</strong> is active: keep advancing Steps — #1 is almost certainly yours.');
    } else if(myPityPhase==='soft'){
      tipsIt.push('Sei nel <strong>Boost soft</strong>: molto competitivo. Avanza di altri Step per capitalizzare.');
      tipsEn.push('You\'re in <strong>soft Boost</strong>: very competitive. Advance more Steps to capitalize.');
    } else {
      // stima blocchi per superare (approssimata; ignora crescita leader)
      var targetFBase=Math.max(0,leaderScoreV-myPityBonus);
      var targetBlocks=myLoyaltyMult>0.01?Math.ceil(Math.pow(targetFBase/myLoyaltyMult,2)):0;
      var blocksNeeded=Math.max(0,targetBlocks-myBlocks);
      if(blocksNeeded>0 && blocksNeeded<=300){
        tipsIt.push('Stima: circa <strong>'+blocksNeeded+' Step</strong> in pi&ugrave; per raggiungere il 1&deg;.');
        tipsEn.push('Estimate: about <strong>'+blocksNeeded+' more Steps</strong> to reach #1.');
      } else if(blocksNeeded>300){
        tipsIt.push('Il distacco dal 1&deg; &egrave; ampio. Corri comunque: <strong>raccogli i fiori ROBI sul percorso</strong>, fai crescere il moltiplicatore fedelt&agrave;, e avvicinati al Boost.');
        tipsEn.push('Gap to #1 is wide. Run anyway: <strong>pick up the ROBI flowers along the trail</strong>, grow your Loyalty Multiplier, and approach the Boost.');
      }
    }
    if(myHistoricAria>0 && loyaltyNext){
      var toNext=loyaltyNext-myHistoricAria;
      tipsIt.push('Il tuo Moltiplicatore &egrave; <strong>&times;'+myLoyaltyMult.toFixed(2)+'</strong>. A '+loyaltyNext.toLocaleString('it-IT')+' ARIA (mancano '+Math.round(toNext).toLocaleString('it-IT')+') sale al prossimo tier.');
      tipsEn.push('Your Multiplier is <strong>&times;'+myLoyaltyMult.toFixed(2)+'</strong>. At '+loyaltyNext.toLocaleString('en-US')+' ARIA ('+Math.round(toNext).toLocaleString('en-US')+' to go) it moves to the next tier.');
    }
    if(a.status==='presale'){
      tipsIt.push('Presale: prezzo ridotto e doppi ROBI dal mining.');
      tipsEn.push('Presale: lower price and double mining ROBI.');
    }
    tipsIt.push('Anche se non arrivi 1°, <strong>raccogli i fiori ROBI sul percorso</strong> e ricevi i ROBI di ringraziamento alla chiusura.');
    tipsEn.push('Even if you don\'t finish #1, <strong>you pick up the ROBI flowers along the trail</strong> and receive the thank-you ROBI at close.');
  }

  // Loyalty bar progress (visual, log10 scaled)
  var loyaltyPctBar=Math.min(100,Math.round(Math.log10(1+myHistoricAria/100)*25));
  var pityFillColor=myPityPhase==='hard'?'var(--gold)':myPityPhase==='soft'?'var(--accent)':'';

  // GS-10 A/B collapsible: blocco A (header + Tuo Punteggio) sempre visibile,
  // blocco B (factors + tips) collassato di default. Clic su A toggle B.
  // Preserva stato open precedente dell'utente nel re-render (refreshPosition polling 30s)
  var prevOpen=el.querySelector('.strategy-box.gs10-open')?true:false;
  el.innerHTML=''
    +'<div class="strategy-box'+(isFirst?' first':'')+(prevOpen?' gs10-open':'')+'">'
    // Blocco A: header (clickable) + score · sempre visibile
    +'<button class="strategy-ab-header" type="button" onclick="this.parentElement.classList.toggle(\'gs10-open\')" aria-label="Espandi dettaglio scoring">'
    +'<div class="strategy-title">'+(isFirst?UI_ICONS.star:UI_ICONS.target)+' <span class="it">'+(isFirst?'Sei in 1ª posizione!':'Come arrivare 1&deg;')+'</span>'
    +'<span class="en">'+(isFirst?'You\'re winning!':'How to reach #1')+'</span></div>'
    +'<svg class="strategy-ab-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
    +'</button>'
    +'<div class="strategy-score-top">'
    +'<span class="it">Tuo Punteggio: <strong>'+myScoreV.toFixed(2)+'</strong>'+(pos>1?' &middot; primo: <strong>'+leaderScoreV.toFixed(2)+'</strong>':'')+'</span>'
    +'<span class="en">Your Score: <strong>'+myScoreV.toFixed(2)+'</strong>'+(pos>1?' &middot; leader: <strong>'+leaderScoreV.toFixed(2)+'</strong>':'')+'</span>'
    +'</div>'
    // Blocco B: factors + tips · collassato di default, espanso quando .gs10-open
    +'<div class="strategy-ab-body">'
    +'<div class="strategy-factors">'
    // 1. Blocchi (radice quadrata)
    +'<div class="strategy-factor-block van">'
    +'<div class="strategy-factor-head">'
    +'<span class="strategy-factor-heading">'+UI_ICONS.trophy+' <span class="it">Step correnti</span><span class="en">Current Steps</span></span>'
    +'<span class="strategy-factor-weight-badge">'+myBlocks+' &middot; &radic;='+Math.sqrt(Math.max(myBlocks,0)).toFixed(2)+'</span>'
    +'</div>'
    +'<div class="strategy-factor-hint">'+UI_ICONS.bulb
    +' <span class="it">Contributo a radice quadrata: 100 Step valgono 10, non 100.</span>'
    +'<span class="en">Square-root contribution: 100 Steps count as 10, not 100.</span>'
    +'</div>'
    +'</div>'
    // 2. Moltiplicatore Fedeltà
    +'<div class="strategy-factor-block van">'
    +'<div class="strategy-factor-head">'
    +'<span class="strategy-factor-heading">'+UI_ICONS.gem+' <span class="it">Moltiplicatore Fedelt&agrave;</span><span class="en">Loyalty Multiplier</span></span>'
    +'<span class="strategy-factor-weight-badge">&times;'+myLoyaltyMult.toFixed(2)+'</span>'
    +'</div>'
    +'<div class="strategy-factor-bar">'
    +'<div class="strategy-bar-track"><div class="strategy-bar-fill f1" style="width:'+loyaltyPctBar+'%"></div></div>'
    +'<div class="strategy-bar-val">'+Math.round(myHistoricAria).toLocaleString('it-IT')+' ARIA</div>'
    +'</div>'
    +'<div class="strategy-factor-hint">'+UI_ICONS.bulb
    +' <span class="it">Cresce con gli ARIA spesi in categoria (curva logaritmica, saturante).</span>'
    +'<span class="en">Grows with ARIA spent in category (log curve, saturating).</span>'
    +'</div>'
    +'</div>'
    // 3. Boost di garanzia (pity)
    +'<div class="strategy-factor-block van'+(myPityPhase==='hard'?' pity-hard':myPityPhase==='soft'?' pity-soft':'')+'">'
    +'<div class="strategy-factor-head">'
    +'<span class="strategy-factor-heading">'+UI_ICONS.zap+' <span class="it">Boost di garanzia</span><span class="en">Guarantee Boost</span></span>'
    +'<span class="strategy-factor-weight-badge">'+myLosses+'/'+myPityThreshold+'</span>'
    +'</div>'
    +'<div class="strategy-factor-bar">'
    +'<div class="strategy-bar-track"><div class="strategy-bar-fill f1" style="width:'+pityPct+'%'+(pityFillColor?';background:'+pityFillColor:'')+'"></div></div>'
    +'<div class="strategy-bar-val">+'+myPityBonus.toFixed(2)+'</div>'
    +'</div>'
    +'<div class="strategy-factor-hint">'+UI_ICONS.bulb
    +' <span class="it">'+pityStatusIt+'.</span>'
    +'<span class="en">'+pityStatusEn+'.</span>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div class="strategy-tips">'
    +tipsIt.map(function(t){return '<div class="strategy-tip"><span class="it">'+t+'</span></div>'}).join('')
    +tipsEn.map(function(t){return '<div class="strategy-tip"><span class="en">'+t+'</span></div>'}).join('')
    +'</div>'
    +'</div>' // close strategy-ab-body
    +'</div>';
}

async function refreshPosition(airdropId){
  try{
    var token=await getValidToken();if(!token)return;
    var scores=await sbRpc('calculate_winner_score',{p_airdrop_id:airdropId},token)||[];
    if(!Array.isArray(scores))scores=[];
    updateDetailPosition(airdropId,scores);
  }catch(e){}
}

// ── Detail Stats (ROBI projection, %, history) ──
async function loadDetailStats(airdropId){
  var panel=document.getElementById('detail-mystats');
  if(!panel||!_session)return;
  var token=await getValidToken();if(!token)return;
  var data=await sbRpc('get_my_airdrop_detail_stats',{p_airdrop_id:airdropId},token);
  if(!data||typeof data!=='object')return;
  var a=_currentDetail;if(!a)return;

  var presaleB=data.presale_blocks||0;
  var saleB=data.sale_blocks||0;
  var totalMyBlocks=presaleB+saleB;
  var pctOwned=a.total_blocks>0?(totalMyBlocks/a.total_blocks*100):0;

  // ROBI projection: same formula as execute_draw
  var divisor=Math.max(1,Math.ceil((a.object_value_eur||500)/100));
  var projectedRobi=(presaleB*2.0+saleB)/divisor;

  // Earned ROBI so far: from nft_rewards would need another RPC, use projection
  var miningRate=calcMiningRate(a);
  var robiNow=miningRate>0?totalMyBlocks/miningRate:0;

  // 18 lug · aggiorna la striscia I TUOI NUMERI (sempre in cima) coi dati veri
  var _stripSteps=document.getElementById('mystrip-steps');
  var _stripRobi=document.getElementById('mystrip-robi');
  var _stripAria=document.getElementById('mystrip-aria');
  if(_stripSteps)_stripSteps.textContent=totalMyBlocks;
  if(_stripRobi)_stripRobi.textContent=projectedRobi.toFixed(2);
  if(_stripAria&&Array.isArray(data.history)&&data.history.length>0){
    var _sumAria=data.history.reduce(function(s,p){return s+(Number(p.aria)||0)},0);
    if(_sumAria>0)_stripAria.textContent=Math.round(_sumAria);
  }

  var gridEl=document.getElementById('mystats-grid');
  if(gridEl){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    gridEl.innerHTML=''
      +'<div class="mystats-cell">'
      +'<div class="mystats-val" style="color:var(--gold)">'+projectedRobi.toFixed(2)+'</div>'
      +'<div class="mystats-label"><span class="it">ROBI che guadagni</span><span class="en">ROBI you earn</span></div>'
      +'</div>'
      +'<div class="mystats-cell">'
      +'<div class="mystats-val" style="color:var(--aria)">'+pctOwned.toFixed(1)+'%</div>'
      +'<div class="mystats-label"><span class="it">Step tuoi</span><span class="en">Your Steps</span></div>'
      +'</div>'
      +'<div class="mystats-cell">'
      +'<div class="mystats-val">'+presaleB+'<span style="font-size:10px;color:var(--gray-400)"> / '+saleB+'</span></div>'
      +'<div class="mystats-label"><span class="it">Presale / Sale</span><span class="en">Presale / Sale</span></div>'
      +'</div>';
  }

  // Purchase history
  var histEl=document.getElementById('mystats-history');
  var history=data.history||[];
  if(histEl&&history.length>0){
    var h='<div class="mystats-history-toggle" onclick="this.parentElement.classList.toggle(\'open\')">'
      +'<span class="it">Storico acquisti ('+history.length+')</span>'
      +'<span class="en">Purchase history ('+history.length+')</span>'
      +'<svg class="mystats-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      +'</div>'
      +'<div class="mystats-history-list">';
    history.forEach(function(p){
      var d=new Date(p.date);
      var dateStr=d.toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      h+='<div class="mystats-history-row">'
        +'<span>'+p.blocks+' Step</span>'
        +'<span style="color:var(--aria)">'+p.aria+' ARIA</span>'
        +'<span style="color:var(--gray-500)">'+dateStr+'</span>'
        +'</div>';
    });
    h+='</div>';
    histEl.innerHTML=h;
  }
}

// ── Push Notifications ──
var VAPID_PUBLIC_KEY='BOsfShhrYnISvRhpbCIlDvG1HuHMNDfggNKgyEFV_LATdT2-ocHOkmYPMexED0-yCv_z9uuPqlDCGYxVXOzQxko';

async function registerServiceWorker(){
  if(!('serviceWorker' in navigator))return null;
  try{
    var reg=await navigator.serviceWorker.register('/sw.js');
    return reg;
  }catch(e){return null;}
}

async function requestPushPermission(){
  if(!('Notification' in window)||!('PushManager' in window))return;
  if(Notification.permission==='granted'){await subscribePush();return;}
  if(Notification.permission==='denied')return;
  // Show custom prompt
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msg=lang==='it'
    ?'Vuoi essere avvisato quando esce un oggetto che ti interessa o quando sei stato superato in un airdrop?'
    :'Want to be notified when an item you like drops or when someone overtakes you?';
  var perm=await Notification.requestPermission();
  if(perm==='granted')await subscribePush();
}

async function subscribePush(){
  var reg=await registerServiceWorker();
  if(!reg||!VAPID_PUBLIC_KEY)return;
  try{
    var sub=await reg.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    var key=sub.toJSON();
    var token=await getValidToken();
    if(token){
      await sbRpc('save_push_subscription',{
        p_endpoint:key.endpoint,
        p_keys_p256dh:key.keys.p256dh,
        p_keys_auth:key.keys.auth
      },token);
    }
  }catch(e){}
}

async function notifyPositionLost(airdropId){
  try{
    var token=await getValidToken();if(!token)return;
    var a=_airdrops.find(function(x){return x.id===airdropId});
    await fetch(SB_URL+'/functions/v1/send-push',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({type:'position_lost',airdrop_id:airdropId,user_id:_session.user.id,title:a?a.title:''})
    });
  }catch(e){}
}

function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var raw=atob(base64);var arr=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
  return arr;
}

// ── Category Alerts ──
async function loadCategoryAlerts(){
  if(!_session)return[];
  var rows=await sbGet('user_preferences?user_id=eq.'+_session.user.id+'&select=category_slug',_session.access_token)||[];
  return rows.map(function(r){return r.category_slug});
}

async function saveCategoryAlerts(slugs){
  var token=await getValidToken();if(!token)return;
  await sbRpc('save_category_alerts',{p_slugs:slugs},token);
  showToast('<span class="it">Preferenze salvate</span><span class="en">Preferences saved</span>');
}

// ── Bubble Physics Engine ──
var _bubbles=[];
var _bubbleRaf=null;

function startBubblePhysics(){
  if(_bubbleRaf)cancelAnimationFrame(_bubbleRaf);
  var layer=document.getElementById('bubbles-layer');
  if(!layer||_bubbles.length===0)return;
  var containerSize=layer.offsetWidth;
  if(containerSize===0)containerSize=160;

  function tick(){
    for(var i=0;i<_bubbles.length;i++){
      var b=_bubbles[i];
      // Orbital motion
      b.angle+=b.speed;
      b.x=0.5+Math.cos(b.angle)*b.orbitR;
      b.y=0.5+Math.sin(b.angle)*b.orbitR;

      // Update DOM
      var el=document.getElementById('bubble-'+b.idx);
      if(el){
        var px=b.x*containerSize-b.r;
        var py=b.y*containerSize-b.r;
        el.style.transform='translate('+px.toFixed(1)+'px,'+py.toFixed(1)+'px)';
      }
    }
    _bubbleRaf=requestAnimationFrame(tick);
  }
  _bubbleRaf=requestAnimationFrame(tick);
}

function stopBubblePhysics(){
  if(_bubbleRaf){cancelAnimationFrame(_bubbleRaf);_bubbleRaf=null;}
  _bubbles=[];
}

// ── Accordion ──
function toggleAcc(id){
  var el=document.getElementById('acc-'+id);
  if(el)el.classList.toggle('open');
}

// ── Slider / Buy controls ──
function onSlider(){
  var sl=document.getElementById('buy-slider');
  _buyQty=parseInt(sl.value)||1;
  updateBuyDisplay();
}

function setSlider(n){
  var sl=document.getElementById('buy-slider');
  _buyQty=n;
  sl.value=n;
  updateBuyDisplay();
  // Highlight active preset
  document.querySelectorAll('.buy-preset').forEach(function(p){p.classList.remove('active')});
}

function updateBuyDisplay(){
  var a=_currentDetail;
  if(!a)return;
  var isPresale=a.status==='presale';
  var price=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
  var cost=_buyQty*price;
  var divisor=calcMiningRate(a);
  var mult=isPresale?2:1;
  var shares=(_buyQty*mult)/divisor;
  var sharesStr=shares%1===0?shares:shares.toFixed(2);
  var countEl=document.getElementById('buy-display-count');
  var costEl=document.getElementById('buy-display-cost');
  if(countEl)countEl.innerHTML=_buyQty+' <span>Step</span>';
  // CTA dinamica: «Avanza di N Step»
  var btnEl=document.getElementById('buy-btn');
  if(btnEl&&!btnEl.disabled&&!btnEl.classList.contains('loading'))btnEl.innerHTML='<span class="it">Avanza di '+_buyQty+' Step</span><span class="en">Advance '+_buyQty+' Step'+(_buyQty===1?'':'s')+'</span>';
  if(costEl)costEl.innerHTML='= '+cost+' '+tokIcon('ARIA')+' &middot; <span style="color:var(--gold)">'+sharesStr+' '+tokIcon('ROBI')+'</span>'+(isPresale?' <span style="color:var(--aria);font-size:10px">2x</span>':'');
}

function goToAirdrop(id){
  if(_publicMode){
    window.location.href='/airdrops/'+id;
    return;
  }
  // 17 lug (Skeezu): la vista detail vive dentro il tab Esplora — arrivando da
  // "I miei Airdrop" (ENTRA) o da altre pagine il tab restava nascosto: URL
  // aggiornato ma schermata ferma. Prima si porta in primo piano Esplora.
  var exploreTab=document.getElementById('tab-explore');
  if(exploreTab&&exploreTab.style.display==='none')showPage('explore');
  openDetail(id);
  history.pushState({page:'explore',detail:id},null,'/dapp/airdrop/'+id);
}

// Chiusura vista detail (fix 10 lug: unica via — riusata da backToList, navigateTo e fallback openDetail)
function closeDetailView(){
  stopGalleryAutoplay();
  stopBubblePhysics();
  if(_positionInterval){clearInterval(_positionInterval);_positionInterval=null;}
  document.body.classList.remove('detail-open'); // fab segnalazioni torna in basso
  var det=document.getElementById('detail');
  if(det){det.classList.remove('active');det.style.display='';}
  var lv=document.getElementById('list-view');
  if(lv){lv.classList.remove('hidden');lv.style.display='';}
  var cf=document.getElementById('cat-filter');
  if(cf)cf.style.display='';
  // GS-9 #1 · ripristina elementi marketplace nascosti in openDetail.
  document.body.classList.remove('detail-open');
  var mbAlpha=document.querySelector('.marketplace-demo-banner');
  if(mbAlpha)mbAlpha.style.display='';
  var searchWrap=document.getElementById('etb-search-wrap')||document.getElementById('etb-search-input');
  if(searchWrap){var w=searchWrap.closest('.etb-search-wrap, .search-wrap, .explore-search')||searchWrap;w.style.display='';}
  hideTopbarCR();
  _currentDetail=null;
}

// «Le mie corse» (10 lug, Skeezu PM): sezione partecipazioni su /miei-airdrop
function goToMyCorse(event){
  if(event){event.preventDefault();event.stopPropagation();}
  navigateTo('my');
  // doppio tentativo: il render delle card è async e sposta il layout
  [500,1200].forEach(function(ms){
    setTimeout(function(){
      var el=document.getElementById('my-corse');
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
    },ms);
  });
}

function backToList(){
  closeDetailView();
  loadValuationCount();
  history.pushState({page:'explore'},null,'/airdrops');
}

function showTopbarCR(airdropId){
  if(!_isAdmin)return;
  var right=document.getElementById('topbar-right');
  if(!right)return;
  var existing=document.getElementById('topbar-cr-btn');
  if(existing)existing.remove();
  var btn=document.createElement('button');
  btn.id='topbar-cr-btn';
  btn.className='topbar-cr-btn';
  btn.textContent='CONTROL ROOM';
  btn.onclick=function(){openControlRoom(airdropId)};
  right.insertBefore(btn,right.firstChild);
}
function hideTopbarCR(){
  var e=document.getElementById('topbar-cr-btn');
  if(e)e.remove();
}

function initBuy(){
  if(!_currentDetail||_buyQty<=0)return;
  // F1: costo presale-aware — il popup deve mostrare quello che il server addebita
  var _ip=_currentDetail.status==='presale';
  var _bp=_ip&&_currentDetail.presale_block_price?_currentDetail.presale_block_price:_currentDetail.block_price_aria;
  var cost=_buyQty*_bp;
  if(cost>_balance){
    showMsg('err','<span class="it">ARIA insufficienti.</span><span class="en">Not enough ARIA.</span>');
    return;
  }
  // Pick random available block numbers
  var soldSet={};
  _gridData.forEach(function(b){soldSet[b.block_number]=true});
  var available=[];
  for(var i=1;i<=_currentDetail.total_blocks;i++){if(!soldSet[i])available.push(i)}
  // Shuffle and pick
  for(var j=available.length-1;j>0;j--){
    var k=Math.floor(Math.random()*(j+1));
    var tmp=available[j];available[j]=available[k];available[k]=tmp;
  }
  var chosen=available.slice(0,_buyQty);

  _pendingBuy={airdropId:_currentDetail.id,blocks:chosen,cost:cost,qty:_buyQty};
  document.getElementById('modal-desc').innerHTML='<span class="it">Stai per avanzare di <strong>'+_buyQty+'</strong> Step.</span><span class="en">You are about to advance <strong>'+_buyQty+'</strong> Step'+(_buyQty===1?'':'s')+'.</span>';
  document.getElementById('modal-cost').textContent=cost+' ARIA';
  document.getElementById('modal-bg').classList.add('active');
}

function closeModal(e){
  if(e&&e.target!==document.getElementById('modal-bg'))return;
  document.getElementById('modal-bg').classList.remove('active');
  _pendingBuy=null;
}

async function confirmBuy(){
  if(!_pendingBuy)return;
  var buy=_pendingBuy;
  document.getElementById('modal-bg').classList.remove('active');
  var btn=document.getElementById('buy-btn');
  btn.disabled=true;
  btn.classList.add('loading');
  btn.innerHTML='<span class="it">Acquisto in corso...</span><span class="en">Processing...</span>';
  hideMsg();

  try{
    var token=await getValidToken();
    if(!token){showMsg('err','Sessione scaduta.');return;}
    var data=await sbRpc('buy_blocks',{p_airdrop_id:buy.airdropId,p_block_numbers:buy.blocks},token);
    console.log('buy_blocks response:',data);
    if(data&&data.ok){
      // Toast conferma acquisto
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      showToast(lang==='it'
        ?'+'+data.blocks_bought+' Step · '+data.aria_spent+' ARIA'
        :'+'+data.blocks_bought+' Step'+(data.blocks_bought===1?'':'s')+' · '+data.aria_spent+' ARIA');

      // GS-16 · ROBI nascosti nei blocchi (accredito istantaneo backend Chunk 3)
      var revealedRobi=Number(data.revealed_robi_total||0);
      if(revealedRobi>0){
        // Refresh saldo ROBI in topbar (delta-style · evita full re-fetch)
        var robiEl=document.getElementById('tb-robi-val');
        if(robiEl){
          var cur=parseFloat(robiEl.textContent)||0;
          robiEl.textContent=Math.round((cur+revealedRobi)*100)/100;
          robiEl.parentElement&&robiEl.parentElement.classList.add('robi-flash');
          setTimeout(function(){robiEl.parentElement&&robiEl.parentElement.classList.remove('robi-flash')},2400);
        }
      }

      // §5 · Reveal unboxing con l'esito reale dal server (mai stima client)
      playUnboxingReveal(data.blocks_bought,revealedRobi);
      _salitaJustBought=true; // step animato del tuo avatar al prossimo render della Salita

      _balance=data.new_balance;
      updateBalanceUI();

      // Refresh and re-render detail (after animation)
      var animDur=revealedRobi>0?3200:2400;
      setTimeout(async function(){
        await Promise.all([loadAirdrops(),loadMyParticipations(),loadBalance(),loadMyRanks()]);
        renderGrid();
        openDetail(buy.airdropId);
      },animDur);
    } else {
      var errMsg={
        'INSUFFICIENT_ARIA':'<span class="it">ARIA insufficienti (saldo: '+(data.balance||0)+', costo: '+(data.cost||0)+').</span><span class="en">Not enough ARIA (balance: '+(data.balance||0)+', cost: '+(data.cost||0)+').</span>',
        'NOT_ENOUGH_BLOCKS':'<span class="it">Step non disponibili.</span><span class="en">Steps not available.</span>',
        'BLOCKS_ALREADY_TAKEN':'<span class="it">Qualcuno ha fatto quegli Step prima di te. Riprova.</span><span class="en">Someone took those Steps first. Try again.</span>',
        'AIRDROP_NOT_ACTIVE':'<span class="it">Airdrop non attivo.</span><span class="en">Airdrop not active.</span>',
        'AIRDROP_EXPIRED':'<span class="it">Airdrop scaduto.</span><span class="en">Airdrop expired.</span>',
        'INVALID_BLOCK_NUMBER':'<span class="it">Errore Step.</span><span class="en">Step error.</span>'
      };
      showMsg('err',errMsg[data.error]||'Errore: '+(data.error||'unknown')+(data.detail?' — '+data.detail:''));
      btn.disabled=false;
      btn.classList.remove('loading');
      btn.innerHTML='<span class="it">Avanza</span><span class="en">Advance</span>';
    }
  }catch(e){
    showMsg('err','<span class="it">Errore di rete. Riprova.</span><span class="en">Network error. Try again.</span>');
    btn.disabled=false;
    btn.classList.remove('loading');
    btn.innerHTML='<span class="it">Avanza</span><span class="en">Advance</span>';
  }
  _pendingBuy=null;
}

// ── My airdrops ──
// ── Stati airdrop ──
// Attivi (partecipazione): presale, sale, pending_seller_decision
// Archivio (partecipazione): completed, dropped, closed, annullato, rifiutato_*
function _isPartActive(status){
  return status==='presale'||status==='sale'||status==='pending_seller_decision';
}

function switchMyTab(which){
  var pa=document.getElementById('my-pane-active');
  var pr=document.getElementById('my-pane-archive');
  var ta=document.getElementById('my-tab-active');
  var tr=document.getElementById('my-tab-archive');
  if(!pa||!pr||!ta||!tr)return;
  var on=which==='archive'?'archive':'active';
  pa.style.display=on==='active'?'':'none';
  pr.style.display=on==='archive'?'':'none';
  ta.classList.toggle('my-tab-on',on==='active');
  tr.classList.toggle('my-tab-on',on==='archive');
  ta.setAttribute('aria-selected',on==='active'?'true':'false');
  tr.setAttribute('aria-selected',on==='archive'?'true':'false');
  ta.style.borderBottomColor=on==='active'?'var(--gold)':'transparent';
  tr.style.borderBottomColor=on==='archive'?'var(--gold)':'transparent';
  ta.style.color=on==='active'?'var(--white)':'var(--gray-500)';
  tr.style.color=on==='archive'?'var(--white)':'var(--gray-500)';
  ta.style.fontWeight=on==='active'?'700':'500';
  tr.style.fontWeight=on==='archive'?'700':'500';
}

function renderMyAirdrops(){
  var list=document.getElementById('my-list');
  var empty=document.getElementById('my-empty');
  var listArc=document.getElementById('my-list-archive');
  var emptyArc=document.getElementById('my-list-archive-empty');
  // Aggregate by airdrop
  var map={};
  _myParts.forEach(function(p){
    var aid=p.airdrop_id||p.airdrops?.id;
    if(!aid)return;
    if(!map[aid])map[aid]={blocks:0,spent:0,airdrop:p.airdrops,lastDate:p.created_at};
    map[aid].blocks+=p.blocks_count;
    map[aid].spent+=p.aria_spent;
  });
  var items=Object.values(map);
  var active=[],archive=[];
  items.forEach(function(it){
    var st=it.airdrop&&it.airdrop.status;
    if(_isPartActive(st))active.push(it); else archive.push(it);
  });
  // Counts
  var cntA=document.getElementById('my-parts-active-count');
  var cntR=document.getElementById('my-parts-archive-count');
  if(cntA)cntA.textContent=active.length;
  if(cntR)cntR.textContent=archive.length;
  // Active pane
  if(!active.length){
    list.innerHTML='';
    empty.style.display='block';
  }else{
    empty.style.display='none';
    list.innerHTML=active.map(function(it){return _renderPartCard(it,false);}).join('');
  }
  // Archive pane
  if(listArc){
    if(!archive.length){
      listArc.innerHTML='';
      if(emptyArc)emptyArc.style.display='block';
    }else{
      if(emptyArc)emptyArc.style.display='none';
      listArc.innerHTML=archive.map(function(it){return _renderPartCard(it,true);}).join('');
    }
  }
  _updateMyTabCounts();
}

function _renderPartCard(item,isArchive){
  var placeholderSvg='<svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>';
  var a=item.airdrop;
  if(!a)return '';
  var imgHtml=a.image_url
    ?'<img class="my-card-img" src="'+a.image_url+'" alt="" loading="lazy" onerror="this.style.display=\'none\';if(this.nextSibling)this.nextSibling.style.display=\'flex\'"><div class="my-card-img-placeholder" style="display:none">'+placeholderSvg+'</div>'
    :'<div class="my-card-img-placeholder">'+placeholderSvg+'</div>';
  // Status badge
  var st=a.status;
  var badge='';
  var deadlineHtml='';
  if(st==='presale')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--aria);background:rgba(74,158,255,.1);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">Pre-vendita</span><span class="en">Pre-sale</span></span>';
  else if(st==='sale')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--kas);background:rgba(73,234,203,.1);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">Live</span><span class="en">Live</span></span>';
  else if(st==='pending_seller_decision')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--gold);background:rgba(239,62,79,.12);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">In attesa</span><span class="en">Pending</span></span>';
  else if(st==='completed'||st==='dropped')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:#22c55e;background:rgba(34,197,94,.1);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">Completato</span><span class="en">Completed</span></span>';
  else if(st==='annullato')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:#ef4444;background:rgba(239,68,68,.1);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">Annullato</span><span class="en">Cancelled</span></span>';
  else if(st==='closed')badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--gray-400);background:rgba(255,255,255,.05);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700"><span class="it">Chiuso</span><span class="en">Closed</span></span>';
  else badge='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--gray-400);background:rgba(255,255,255,.05);padding:3px 10px;border-radius:10px;text-transform:uppercase">'+st+'</span>';
  // In scadenza?
  if(!isArchive&&a.deadline&&(st==='presale'||st==='sale')){
    var diff=new Date(a.deadline)-Date.now();
    if(diff>0&&diff<24*60*60*1000){
      deadlineHtml='<span style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:#ef4444;background:rgba(239,68,68,.12);padding:3px 10px;border-radius:10px;text-transform:uppercase;font-weight:700;animation:pulse 2s ease-in-out infinite;margin-left:6px"><span class="it">In scadenza</span><span class="en">Expiring</span></span>';
    }
  }
  var cardOpacity=isArchive?'opacity:.92;':'';
  // Atto 6 buyer reveal post-completed/annullato
  var revealHtml='';
  if(isArchive&&(st==='completed'||st==='annullato')){
    revealHtml=_renderRevealBlock(a,item,st);
  }
  return '<div class="my-card" style="'+cardOpacity+'">'
    +'<div style="display:flex;gap:16px;padding:18px;align-items:center;cursor:pointer" onclick="goToAirdrop(\''+a.id+'\')">'
    +imgHtml
    +'<div class="my-card-info">'
    +'<div class="my-card-title">'+a.title+'</div>'
    +'<div class="my-card-meta" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'+((a.submitted_by&&_session&&_session.user&&a.submitted_by===_session.user.id)?'<span class="owner-pill"><span class="it">TUO · sei il venditore</span><span class="en">YOURS · you\'re the seller</span></span>':'')+a.category+' &middot; '+badge+deadlineHtml+'</div>'
    +'<div class="my-card-blocks"><strong>'+item.blocks+'</strong> Step &middot; '+item.spent+' ARIA</div>'
    +'</div></div>'
    +revealHtml
    +'<div style="display:flex;gap:8px;padding:8px 16px 12px;border-top:1px solid var(--gray-800);align-items:center">'
    +'<button style="display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:7px 14px;font-family:var(--font-b);font-size:11px;font-weight:500;letter-spacing:1px;cursor:pointer;transition:all .25s;border-radius:var(--radius-sm)" onclick="toggleMyChat(\''+a.id+'\')" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
    +'<span class="it">Messaggi</span><span class="en">Messages</span></button>'
    +'</div>'
    +'<div id="my-chat-'+a.id+'" style="display:none;padding:0 16px 16px">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500)"><span class="it">Risposte entro 24/48 ore</span><span class="en">Replies within 24/48 hours</span></div>'
    +'<button onclick="toggleMyChat(\''+a.id+'\')" style="background:none;border:none;color:var(--gray-500);cursor:pointer;font-family:var(--font-m);font-size:10px;letter-spacing:1px;padding:4px 8px;transition:color .2s" onmouseover="this.style.color=\'var(--white)\'" onmouseout="this.style.color=\'var(--gray-500)\'">✕ <span class="it">CHIUDI</span><span class="en">CLOSE</span></button>'
    +'</div>'
    +'</div>'
    +'</div>';
}

// ── W4 Day 10 · Claim address modal ──
function openClaimModal(airdropId,title){
  var modal=document.getElementById('claim-modal-bg');if(!modal)return;
  document.getElementById('claim-airdrop-id').value=airdropId;
  var titleEl=document.getElementById('claim-modal-title');
  if(titleEl)titleEl.textContent=title||'';
  var errEl=document.getElementById('claim-modal-error');
  if(errEl){errEl.style.display='none';errEl.textContent='';}
  modal.classList.add('active');
}
function closeClaimModal(e){
  if(e&&e.target&&e.target.id!=='claim-modal-bg')return;
  var modal=document.getElementById('claim-modal-bg');if(!modal)return;
  modal.classList.remove('active');
}
async function submitClaim(e){
  e.preventDefault();
  var btn=document.getElementById('claim-modal-submit');
  var errEl=document.getElementById('claim-modal-error');
  var airdropId=document.getElementById('claim-airdrop-id').value;
  var address={
    full_name:document.getElementById('claim-fullname').value.trim(),
    street:document.getElementById('claim-street').value.trim(),
    cap:document.getElementById('claim-cap').value.trim(),
    city:document.getElementById('claim-city').value.trim(),
    province:document.getElementById('claim-province').value.trim(),
    country:document.getElementById('claim-country').value.trim()
  };
  var phone=document.getElementById('claim-phone').value.trim();
  var notes=document.getElementById('claim-notes').value.trim()||null;
  if(!address.full_name||!address.street||!address.cap||!address.city||!address.province||!address.country||!phone){
    if(errEl){errEl.textContent='Compila tutti i campi obbligatori.';errEl.style.display='block';}
    return;
  }
  btn.disabled=true;var origLabel=btn.textContent;btn.textContent='Invio…';
  try{
    var token=(_session&&_session.access_token)||null;
    if(!token){throw new Error('Sessione scaduta · ricarica la pagina');}
    var res=await sbRpc('claim_airdrop_prize',{p_airdrop_id:airdropId,p_shipping_address:address,p_shipping_phone:phone,p_shipping_notes:notes},token);
    if(res&&res.ok===false)throw new Error(res.detail||res.error||'errore RPC');
    closeClaimModal();
    alert('Richiesta inviata. Il venditore è stato notificato. Riceverai aggiornamenti sulla spedizione.');
    if(typeof loadMyParticipations==='function')loadMyParticipations();
  }catch(err){
    if(errEl){errEl.textContent='Errore: '+(err.message||err);errEl.style.display='block';}
    btn.disabled=false;btn.textContent=origLabel;
  }
}

// ── Atto 6 · Buyer reveal post-completed/annullato ──
function _renderRevealBlock(a,item,status){
  var uid=_session&&_session.user&&_session.user.id;
  var robi=_myRobiByAirdrop[a.id]||{shares:0,sources:[],consolation_rank:null};
  var isWinner=status==='completed'&&a.winner_id&&uid&&a.winner_id===uid;
  var storyLink=a.story_public_visible&&a.story_public_url
    ?'<a href="'+a.story_public_url+'" target="_blank" rel="noopener" style="color:var(--gold);font-size:11px;letter-spacing:.5px;text-decoration:none;font-family:var(--font-m)">'
      +'<span class="it">STORIA PUBBLICA →</span><span class="en">PUBLIC STORY →</span></a>'
    :'';
  // Scenario 1: completed + winner
  if(isWinner){
    return '<div style="background:linear-gradient(135deg,rgba(239,62,79,.15),rgba(239,62,79,.02));border-top:1px solid var(--gold);padding:16px 18px;display:flex;flex-direction:column;gap:10px">'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<div style="font-family:var(--font-h);font-size:18px;color:var(--gold);font-weight:500"><span class="it">Hai ottenuto l\'oggetto · '+a.title+'</span><span class="en">You got the item · '+a.title+'</span></div>'
      +'</div>'
      +'<div style="font-size:12px;color:var(--gray-300);line-height:1.5"><span class="it">Inserisci l\'indirizzo di spedizione per ricevere l\'oggetto. Hai 14 giorni dalla data dell\'evento.</span><span class="en">Submit the shipping address to receive the item. You have 14 days from the event date.</span></div>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">'
      +'<button onclick="openClaimModal(\''+a.id+'\',\''+(a.title||'').replace(/\'/g,'\\\'')+'\')" style="background:var(--gold);color:var(--black);border:none;padding:9px 18px;font-family:var(--font-m);font-size:11px;letter-spacing:1.5px;font-weight:700;cursor:pointer;border-radius:var(--radius-sm)"><span class="it">RECLAMA L\'OGGETTO →</span><span class="en">CLAIM ITEM →</span></button>'
      +storyLink
      +'</div></div>';
  }
  // Scenario 2: completed + not winner
  if(status==='completed'){
    var sharesNum=robi.shares?Number(robi.shares).toFixed(2):'0';
    var sharesLine=robi.shares>0
      ?'<div style="font-size:13px;color:var(--gold);font-family:var(--font-m);letter-spacing:.5px"><strong>'+sharesNum+'</strong> <span class="it">ROBI accumulate da questo evento</span><span class="en">ROBI shares earned from this event</span></div>'
      :'<div style="font-size:12px;color:var(--gray-400)"><span class="it">Nessun ROBI accumulato da questo evento</span><span class="en">No ROBI earned from this event</span></div>';
    return '<div style="background:rgba(255,255,255,.02);border-top:1px solid var(--gray-800);padding:14px 18px;display:flex;flex-direction:column;gap:8px">'
      +'<div style="font-size:12px;color:var(--gray-300);line-height:1.5"><span class="it">Oggetto assegnato a un altro partecipante. I tuoi ROBI Reward restano con te, riscattabili in KAS quando vuoi.</span><span class="en">Item went to another participant. Your ROBI Reward stay with you, redeemable in KAS anytime.</span></div>'
      +sharesLine
      +(storyLink?'<div>'+storyLink+'</div>':'')
      +'</div>';
  }
  // Scenario 3: annullato
  if(status==='annullato'){
    var consoBlock='';
    if(robi.consolation_rank){
      consoBlock='<div style="font-size:13px;color:var(--gold);font-family:var(--font-m);letter-spacing:.5px"><strong>+1 ROBI</strong> <span class="it">di consolazione · top-3 partecipanti (rank '+robi.consolation_rank+')</span><span class="en">consolation · top-3 participants (rank '+robi.consolation_rank+')</span></div>';
    }
    return '<div style="background:rgba(255,255,255,.02);border-top:1px solid var(--gray-800);padding:14px 18px;display:flex;flex-direction:column;gap:8px">'
      +'<div style="font-size:12px;color:var(--gray-300);line-height:1.5"><span class="it">Evento annullato dal venditore. Hai ricevuto il rimborso completo: <strong>'+item.spent+' ARIA</strong> tornati nel saldo.</span><span class="en">Event cancelled by seller. You received full refund: <strong>'+item.spent+' ARIA</strong> back to your balance.</span></div>'
      +consoBlock
      +'</div>';
  }
  return '';
}

function _updateMyTabCounts(){
  var subsActive=parseInt(document.getElementById('my-subs-active-count')?.textContent||'0',10);
  var subsArc=parseInt(document.getElementById('my-subs-archive-count')?.textContent||'0',10);
  var partsActive=parseInt(document.getElementById('my-parts-active-count')?.textContent||'0',10);
  var partsArc=parseInt(document.getElementById('my-parts-archive-count')?.textContent||'0',10);
  var totA=subsActive+partsActive;
  var totR=subsArc+partsArc;
  var ca=document.getElementById('my-tab-active-count');
  var cr=document.getElementById('my-tab-archive-count');
  if(ca){ca.textContent=totA;ca.style.display=totA>0?'':'none';}
  if(cr){cr.textContent=totR;cr.style.display=totR>0?'':'none';}
}

// ── Cancel participation ──
var _pendingCancelId=null;
function confirmCancelParticipation(airdropId,title,blocks,ariaSpent){
  _pendingCancelId=airdropId;
  document.getElementById('cancel-modal-title').textContent='"'+title+'"';
  document.getElementById('cancel-modal-aria').textContent=ariaSpent;
  document.getElementById('cancel-modal-aria-en').textContent=ariaSpent;
  document.getElementById('cancel-modal-blocks').textContent=blocks;
  document.getElementById('cancel-modal-blocks-en').textContent=blocks;
  document.getElementById('cancel-modal-bg').classList.add('active');
}
function closeCancelModal(e){
  if(e&&e.target!==e.currentTarget)return;
  document.getElementById('cancel-modal-bg').classList.remove('active');
  _pendingCancelId=null;
}
function executeCancelFromModal(){
  if(_pendingCancelId){
    closeCancelModal();
    executeCancelParticipation(_pendingCancelId);
  }
}

async function executeCancelParticipation(airdropId){
  var token=await getValidToken();
  if(!token)return;
  var data=await sbRpc('cancel_my_participation',{p_airdrop_id:airdropId},token);
  if(data&&data.ok){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    showToast(lang==='it'
      ?'Partecipazione ritirata. '+data.blocks_released+' Step rilasciati. '+data.aria_lost+' ARIA non rimborsati.'
      :'Participation withdrawn. '+data.blocks_released+' Steps released. '+data.aria_lost+' ARIA not refunded.');
    // Refresh data
    await Promise.all([loadAirdrops(),loadMyParticipations(),loadMyRanks()]);
    renderGrid();
    renderMyAirdrops();
  } else {
    var err=data&&data.error?data.error:'UNKNOWN';
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    var msgs={
      'AIRDROP_NOT_ACTIVE':{it:'L\'airdrop non è più attivo.',en:'The airdrop is no longer active.'},
      'NO_PARTICIPATION':{it:'Nessuna partecipazione attiva.',en:'No active participation.'}
    };
    var m=msgs[err]||{it:'Errore: '+err,en:'Error: '+err};
    showToast('<span style="color:var(--red)">'+(lang==='it'?m.it:m.en)+'</span>');
  }
}

// ── Valuation banner ──
async function loadValuationCount(){
  var token=await getValidToken();
  if(!token)return;
  var count=await sbRpc('get_valuation_count',{},token);
  if(typeof count==='number'&&count>0){
    var banner=document.getElementById('val-banner');
    if(banner){
      banner.style.display='flex';
      document.getElementById('val-count').textContent=count;
    }
  }
}


// ── User roles ──
async function checkUserRoles(){
  var token=await getValidToken();
  if(!token)return;
  var roles=await sbRpc('get_my_roles',{},token);
  if(!Array.isArray(roles))return;
  roles.forEach(function(r){
    if(r.role==='admin'){
      _isAdmin=true;
    }
    if(r.role==='evaluator'){
      _isManager=true;
      _managerCats.push(r.category); // null = all
    }
  });
  if(_isAdmin||_isManager){
    document.getElementById('dapp-admin-link').style.display='';
  }
  // Se siamo gi&agrave; dentro a un detail airdrop, iniettare il pulsante topbar ora che sappiamo il ruolo
  if(_isAdmin&&_currentDetail&&document.getElementById('detail').classList.contains('active')){
    showTopbarCR(_currentDetail.id);
  }
}

// ── Control Room (CEO/Admin modal) ──
function closeControlRoom(){
  var ov=document.getElementById('cr-overlay');
  if(ov)ov.classList.remove('active');
  document.body.style.overflow='';
}

async function openControlRoom(airdropId){
  if(!_isAdmin)return;
  var overlay=document.getElementById('cr-overlay');
  var modal=document.getElementById('cr-modal');
  if(!overlay||!modal)return;
  overlay.classList.add('active');
  document.body.style.overflow='hidden';
  modal.innerHTML='<div style="text-align:center;padding:60px;color:var(--gray-400)">Loading...</div>';

  var token=await getValidToken();
  if(!token){closeControlRoom();return;}

  var preview=await sbRpc('get_draw_preview',{p_airdrop_id:airdropId},token);
  var parts=[];
  try{
    var pRes=await fetch(SB_URL+'/rest/v1/airdrop_participations?airdrop_id=eq.'+airdropId+'&select=user_id,blocks_count,aria_spent',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(pRes.ok)parts=await pRes.json();
  }catch(e){}

  var presaleBlocks=0,saleBlocks=0;
  try{
    var bRes=await fetch(SB_URL+'/rest/v1/airdrop_blocks?airdrop_id=eq.'+airdropId+'&select=purchased_phase',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(bRes.ok){
      var blocks=await bRes.json();
      blocks.forEach(function(b){
        if(b.purchased_phase==='presale')presaleBlocks++;
        else saleBlocks++;
      });
    }
  }catch(e){}

  var treasuryBal=0,nftCirc=0;
  try{
    var tRes=await fetch(SB_URL+'/rest/v1/treasury_stats?select=balance_eur,nft_circulating&order=created_at.desc&limit=1',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(tRes.ok){var tRows=await tRes.json();if(tRows&&tRows[0]){treasuryBal=parseFloat(tRows[0].balance_eur)||0;nftCirc=parseFloat(tRows[0].nft_circulating)||0;}}
  }catch(e){}

  var a=_currentDetail;
  if(!a||!preview||!preview.ok){
    modal.innerHTML='<div style="padding:40px;color:#ef4444;text-align:center">Errore caricamento dati</div>';
    return;
  }

  var uniqueUsers=[...new Set(parts.map(function(p){return p.user_id}))].length;
  var totalAria=parts.reduce(function(s,p){return s+p.aria_spent},0);
  var totalEur=(totalAria*0.10).toFixed(2);
  var totalBlks=parts.reduce(function(s,p){return s+p.blocks_count},0);
  var fillPct=a.total_blocks>0?Math.round(totalBlks/a.total_blocks*100):0;
  var avgPerUser=uniqueUsers>0?Math.round(totalAria/uniqueUsers):0;
  var presalePct=(presaleBlocks+saleBlocks)>0?Math.round(presaleBlocks*100/(presaleBlocks+saleBlocks)):0;
  var objectVal=a.object_value_eur||0;
  var divisor=Math.max(1,Math.ceil(objectVal/100));
  var nftPrice=nftCirc>0?(treasuryBal/nftCirc).toFixed(2):'N/A';
  var estShares=(presaleBlocks*2+saleBlocks)/divisor;

  var venditoreEur=preview.split?preview.split.venditore_eur:0;
  var sellerMin=preview.seller_min_price||0;
  var successLabel=preview.success
    ?'<span style="color:var(--kas)">SUCCESS</span>'
    :'<span style="color:#ef4444">BELOW MIN (&euro;'+venditoreEur+' vs &euro;'+sellerMin+')</span>';

  var userAgg={};
  parts.forEach(function(p){
    if(!userAgg[p.user_id])userAgg[p.user_id]={blocks:0,aria:0};
    userAgg[p.user_id].blocks+=p.blocks_count;
    userAgg[p.user_id].aria+=p.aria_spent;
  });
  var topParts=Object.keys(userAgg).map(function(uid){return{uid:uid.substring(0,6),blocks:userAgg[uid].blocks,aria:userAgg[uid].aria}}).sort(function(a,b){return b.aria-a.aria}).slice(0,5);

  function kpi(label,val,sub,color){
    var c=color||'var(--white)';
    return '<div class="cr-kpi">'
      +'<div class="cr-kpi-val" style="color:'+c+'">'+val+'</div>'
      +'<div class="cr-kpi-label">'+label+'</div>'
      +(sub?'<div class="cr-kpi-sub">'+sub+'</div>':'')
      +'</div>';
  }

  var scoresHtml='';
  if(preview.scores&&preview.scores.length){
    scoresHtml='<div class="cr-section"><div class="cr-section-title">Score Leaderboard</div>'
      +'<div style="font-size:10px;color:var(--gray-500);margin-bottom:8px">F1 = Step acquistati (70%) &middot; F2 = ARIA spesi nella categoria (30%)</div>'
      +'<table class="cr-table"><thead><tr><th>Rank</th><th style="text-align:center">F1</th><th style="text-align:center">F2</th><th style="text-align:center">Score</th><th style="text-align:center">Blocks</th><th style="text-align:center">ARIA</th></tr></thead><tbody>';
    preview.scores.slice(0,8).forEach(function(s){
      scoresHtml+='<tr'+(s.rank===1?' class="winner"':'')+'>'
        +'<td>#'+s.rank+(s.rank===1?' &#9733;':'')+'</td>'
        +'<td style="text-align:center">'+(parseFloat(s.f1)||0).toFixed(3)+'</td>'
        +'<td style="text-align:center">'+(parseFloat(s.f2)||0).toFixed(3)+'</td>'
        +'<td style="text-align:center;font-weight:600">'+(parseFloat(s.score)||0).toFixed(4)+'</td>'
        +'<td style="text-align:center">'+s.blocks+'</td>'
        +'<td style="text-align:center">'+s.aria_spent+'</td></tr>';
    });
    scoresHtml+='</tbody></table></div>';
  }

  var h=''
    +'<div class="cr-header"><h3>CONTROL ROOM</h3><button class="cr-close" onclick="closeControlRoom()">&times;</button></div>'

    +'<div class="cr-section"><div class="cr-section-title">Partecipazione</div>'
    +'<div class="cr-kpi-grid">'
    +kpi('Partecipanti',uniqueUsers,'utenti unici')
    +kpi('Fill Rate',fillPct+'%',totalBlks+'/'+a.total_blocks)
    +kpi('Revenue','&euro;'+totalEur,totalAria+' ARIA')
    +kpi('Media/Utente',avgPerUser+' AR','&euro;'+(avgPerUser*0.10).toFixed(0)+' eq.')
    +'</div></div>'

    +'<div class="cr-section"><div class="cr-section-title">Economia</div>'
    +'<div class="cr-kpi-grid">'
    +kpi('Presale',presaleBlocks+' bl.',presalePct+'%','var(--aria)')
    +kpi('Sale',saleBlocks+' bl.',(100-presalePct)+'%')
    +kpi('Mining','div '+divisor,'~'+estShares.toFixed(1)+' quote','var(--gold)')
    +kpi('Quota ROBI','&euro;'+nftPrice,nftCirc.toFixed(1)+' circ.','var(--gold)')
    +'</div></div>'

    +'<div class="cr-section"><div class="cr-section-title">Status</div>'
    +'<div class="cr-status">'
    +'<strong>Esito:</strong> '+successLabel
    +'<br><strong>Venditore:</strong> &euro;'+venditoreEur+' / min &euro;'+sellerMin
    +'<br><strong>Split:</strong> Fondo &euro;'+(preview.split?preview.split.fondo_eur:0)+' | Fee &euro;'+(preview.split?preview.split.airoobi_eur:0)
    +'<br><strong>Treasury:</strong> &euro;'+treasuryBal.toFixed(2)+' | Quota ROBI: &euro;'+nftPrice
    +'</div></div>'

    +'<div class="cr-section"><div class="cr-section-title">Top Partecipanti</div>'
    +'<table class="cr-table"><thead><tr><th>#</th><th>User</th><th style="text-align:center">Blocks</th><th style="text-align:center">ARIA</th><th style="text-align:right">&euro; eq.</th></tr></thead><tbody>'
    +topParts.map(function(p,i){return '<tr><td>'+(i+1)+'</td><td style="font-family:var(--font-mono,monospace)">'+p.uid+'&hellip;</td><td style="text-align:center">'+p.blocks+'</td><td style="text-align:center">'+p.aria+'</td><td style="text-align:right">&euro;'+(p.aria*0.10).toFixed(0)+'</td></tr>'}).join('')
    +'</tbody></table></div>'

    +scoresHtml;

  modal.innerHTML=h;
}

// ── Submit object ──
var _valuationCost=50;

async function loadValuationCost(){
  try{
    var token=await getValidToken();
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_valuation_cost',{
      method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}'
    });
    if(res.ok){var c=await res.json();if(typeof c==='number')_valuationCost=c;}
  }catch(e){}
}

function updateSubmitCostUI(){
  var costEl=document.getElementById('sub-cost-aria');
  var balEl=document.getElementById('sub-balance');
  var insEl=document.getElementById('sub-insufficient');
  var btnEl=document.getElementById('sub-btn');
  if(costEl)costEl.textContent=_valuationCost;
  if(balEl)balEl.textContent=_balance;
  if(_balance<_valuationCost){
    if(insEl)insEl.style.display='block';
    if(btnEl)btnEl.disabled=true;
  }else{
    if(insEl)insEl.style.display='none';
    if(btnEl)btnEl.disabled=false;
  }
}

// ── Duration type card selection ──
(function(){
  document.addEventListener('click',function(e){
    var card=e.target.closest('.sub-duration-card');
    if(!card)return;
    var grid=document.getElementById('sub-duration-grid');
    if(!grid)return;
    grid.querySelectorAll('.sub-duration-card').forEach(function(c){c.classList.remove('selected')});
    card.classList.add('selected');
    card.querySelector('input[type=radio]').checked=true;
  });
})();

function getSelectedDuration(){
  var r=document.querySelector('input[name="sub-duration"]:checked');
  return r?r.value:'standard';
}

// ══ Photo Wizard — slot-based guided upload ══
// _subPhotos: array di {slot, type, url, file?, caption?}
// Slot base (6, required): front, back, left, right, top, bottom
// Slot extra (6, opzionali): brand, box, certificate, accessories, defects, other
// 'other' supporta multipli con caption libera
var _subPhotos=[];
var SUB_MAX_PHOTOS=20; // limite alto: 6 base + 5 extra + N "altro"
var _pwCurrentSlotIdx=0;
var _pwPickedFile=null; // File | null

var PW_SLOT_SVG={
  front:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="10" width="40" height="44" rx="3"/><circle cx="32" cy="28" r="6"/><path d="M22 44c2-4 6-6 10-6s8 2 10 6"/></svg>',
  back:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="10" width="40" height="44" rx="3"/><path d="M20 22h24M20 30h24M20 38h16" stroke-dasharray="3 3"/></svg>',
  left:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="20" y="10" width="24" height="44" rx="3"/><path d="M28 22v20" stroke-dasharray="2 3"/><path d="M10 32l6-6M10 32l6 6M10 32h10"/></svg>',
  right:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="20" y="10" width="24" height="44" rx="3"/><path d="M36 22v20" stroke-dasharray="2 3"/><path d="M54 32l-6-6M54 32l-6 6M54 32H44"/></svg>',
  top:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="20" width="40" height="24" rx="2"/><path d="M32 8v10M26 14l6-6 6 6"/></svg>',
  bottom:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="12" y="20" width="40" height="24" rx="2"/><path d="M32 56v-10M26 50l6 6 6-6"/></svg>',
  brand:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="32" cy="32" r="16"/><path d="M24 28l4 6 12-10"/></svg>',
  box:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 22l22-10 22 10v20L32 52 10 42z"/><path d="M10 22l22 10 22-10M32 32v20"/></svg>',
  certificate:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 10h26l10 10v34a3 3 0 01-3 3H14z"/><path d="M40 10v10h10M22 32h20M22 40h20M22 48h14"/></svg>',
  accessories:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="20" r="6"/><circle cx="46" cy="20" r="6"/><path d="M24 20h16M18 26v22M46 26v22M12 48h12M40 48h12"/></svg>',
  defects:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M32 8l24 44H8z"/><line x1="32" y1="26" x2="32" y2="38"/><circle cx="32" cy="44" r="1.5" fill="currentColor"/></svg>',
  other:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="32" cy="32" r="20"/><path d="M32 22v10M32 40v2"/></svg>'
};

var PW_SLOTS=[
  {id:'front',    required:true, it:'Fronte',           en:'Front',        hint_it:'Vista frontale intera. Luce naturale, oggetto centrato, senza riflessi.', hint_en:'Full front view. Natural light, centered, no reflections.'},
  {id:'back',     required:true, it:'Retro',            en:'Back',         hint_it:'Vista posteriore intera.',                                                  hint_en:'Full back view.'},
  {id:'left',     required:true, it:'Lato sinistro',    en:'Left side',    hint_it:'Lato sinistro dell\'oggetto.',                                              hint_en:'Left side of the object.'},
  {id:'right',    required:true, it:'Lato destro',      en:'Right side',   hint_it:'Lato destro dell\'oggetto.',                                                hint_en:'Right side of the object.'},
  {id:'top',      required:true, it:'Dall\'alto',       en:'Top view',     hint_it:'Vista dall\'alto.',                                                         hint_en:'Top-down view.'},
  {id:'bottom',   required:true, it:'Dal basso',        en:'Bottom view',  hint_it:'Vista inferiore / base dell\'oggetto.',                                    hint_en:'Bottom / base of the object.'},
  {id:'brand',    required:false,it:'Marchio / logo',   en:'Brand / logo', hint_it:'Dettaglio marchio, seriale o logo.',                                        hint_en:'Close-up of brand, serial or logo.'},
  {id:'box',      required:false,it:'Scatola / imballo',en:'Box / packaging',hint_it:'Scatola originale o imballo.',                                           hint_en:'Original box or packaging.'},
  {id:'certificate',required:false,it:'Certificato',    en:'Certificate',  hint_it:'Certificato di garanzia, autenticità o provenance.',                        hint_en:'Warranty, authenticity or provenance certificate.'},
  {id:'accessories',required:false,it:'Accessori',      en:'Accessories',  hint_it:'Tutti gli accessori inclusi (cavi, libretti, telecomando…).',               hint_en:'All included accessories (cables, manuals, remote…).'},
  {id:'defects',  required:false,it:'Difetti',          en:'Defects',      hint_it:'Eventuali difetti o segni d\'usura. Meglio documentarli.',                  hint_en:'Any defects or wear marks. Better to document them.'},
  {id:'other',    required:false,it:'Altro',            en:'Other',        hint_it:'Foto libera. Aggiungi una descrizione breve.',                              hint_en:'Free shot. Add a short description.', freeform:true}
];

function pwFindPhoto(slotId){
  // Restituisce la prima foto (o undefined) per quello slot
  return _subPhotos.find(function(p){return p.slot===slotId});
}
function pwCountBase(){return PW_SLOTS.slice(0,6).filter(function(s){return !!pwFindPhoto(s.id)}).length}
function pwCountExtra(){
  var extras=PW_SLOTS.slice(6);
  var c=0;
  for(var i=0;i<extras.length;i++){
    var s=extras[i];
    if(s.id==='other'){
      c+=Math.min(1,_subPhotos.filter(function(p){return p.slot==='other'}).length>0?1:0);
    } else if(pwFindPhoto(s.id)) c++;
  }
  return c;
}

function renderSubPhotos(){
  var grid=document.getElementById('pw-slots-grid');
  if(!grid)return;
  var langIt=document.documentElement.getAttribute('data-lang')!=='en';
  var html='';
  PW_SLOTS.forEach(function(slot,idx){
    if(slot.id==='other'){
      // 'other' è multi-item: mostra tutte le foto caricate + un tile "+ Aggiungi"
      var others=_subPhotos.filter(function(p){return p.slot==='other'});
      others.forEach(function(p,oi){
        html+=pwRenderSlotTile(slot,idx,p,oi);
      });
      html+=pwRenderSlotTile(slot,idx,null,null,true);
    } else {
      var photo=pwFindPhoto(slot.id);
      html+=pwRenderSlotTile(slot,idx,photo,null);
    }
  });
  grid.innerHTML=html;
  // Progress
  var base=pwCountBase(), extra=pwCountExtra();
  var baseEl=document.getElementById('pw-prog-base-val'); if(baseEl)baseEl.textContent=base+'/6';
  var extraEl=document.getElementById('pw-prog-extra-val'); if(extraEl)extraEl.textContent=extra+'/6';
  var fill=document.getElementById('pw-prog-fill'); if(fill)fill.style.width=Math.round((base+extra)/12*100)+'%';
  // checklist requisiti sopra il bottone (8 lug, giro test Skeezu)
  var reqEl=document.getElementById('sub-req-photos');
  if(reqEl){reqEl.textContent=base+'/6';reqEl.style.color=base>=6?'#16A34A':'var(--red-alert)';}
}
// L'errore di submit non deve MAI passare inosservato (8 lug: 5 foto su 6,
// messaggio fuori viewport, Skeezu convinto di aver completato): scroll + toast.
function subErrFocus(msgEl,toastMsg){
  try{msgEl.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
  if(toastMsg)showToast(toastMsg);
}
function pwRenderSlotTile(slot,slotIdx,photo,otherIdx,isAddMore){
  var isExtra=!slot.required;
  var cls='pw-slot';
  if(isExtra)cls+=' extra';
  if(photo)cls+=' has-photo';
  var dataAttrs='data-slot="'+slot.id+'" data-slot-idx="'+slotIdx+'"';
  if(otherIdx!=null)dataAttrs+=' data-other-idx="'+otherIdx+'"';
  var html='<div class="'+cls+'" '+dataAttrs+' onclick="pwOpenForSlot('+slotIdx+(otherIdx!=null?','+otherIdx:'')+(isAddMore?',true':'')+')">';
  if(slot.required)html+='<span class="pw-slot-required-badge"><span class="it">OBBLIGATORIA</span><span class="en">REQUIRED</span></span>';
  if(photo){
    html+='<img src="'+(photo.url||'')+'" alt="" class="pw-slot-img">';
    html+='<div class="pw-slot-tag">'+(slot.id==='other'&&photo.caption?escHtml(photo.caption):(slot.it||slot.id))+'</div>';
    html+='<button type="button" class="pw-slot-remove" onclick="event.stopPropagation();pwRemoveSlotPhoto(\''+slot.id+'\''+(otherIdx!=null?','+otherIdx:'')+')" aria-label="Rimuovi">&times;</button>';
    html+='<div class="pw-slot-redo"><span class="it">Cambia</span><span class="en">Replace</span></div>';
  } else {
    html+='<div class="pw-slot-placeholder">'
      +'<span class="pw-slot-icon">'+(PW_SLOT_SVG[slot.id]||PW_SLOT_SVG.other)+'</span>'
      +'<span class="pw-slot-label"><span class="it">'+slot.it+'</span><span class="en">'+slot.en+'</span></span>';
    if(isAddMore)html+='<span style="font-family:var(--font-m);font-size:9px;letter-spacing:.5px;color:var(--gold);margin-top:2px">+</span>';
    html+='</div>';
  }
  html+='</div>';
  return html;
}

function pwOpenForSlot(slotIdx,otherIdx,isAddMore){
  _pwCurrentSlotIdx=slotIdx;
  _pwPickedFile=null;
  _pwEditingOtherIdx=(otherIdx!=null&&!isAddMore)?otherIdx:null;
  var slot=PW_SLOTS[slotIdx];
  var modal=document.getElementById('pw-modal');
  var lang=document.documentElement.getAttribute('data-lang')==='en'?'en':'it';
  document.getElementById('pw-modal-eyebrow').innerHTML=
    (slot.required?'<span class="it">FOTO TECNICA</span><span class="en">TECHNICAL SHOT</span>':'<span class="it">EXTRA · OPZIONALE</span><span class="en">EXTRA · OPTIONAL</span>')
    +' · '+(slotIdx+1)+'/'+PW_SLOTS.length;
  document.getElementById('pw-modal-title').innerHTML='<span class="it">'+slot.it+'</span><span class="en">'+slot.en+'</span>';
  document.getElementById('pw-modal-hint').innerHTML='<span class="it">'+slot.hint_it+'</span><span class="en">'+slot.hint_en+'</span>';
  var sil=document.getElementById('pw-silhouette'); sil.innerHTML=PW_SLOT_SVG[slot.id]||PW_SLOT_SVG.other;
  // Preview se esiste già
  var preview=document.getElementById('pw-preview'), prevImg=document.getElementById('pw-preview-img');
  var existing=null;
  if(slot.id==='other' && _pwEditingOtherIdx!=null){
    var others=_subPhotos.filter(function(p){return p.slot==='other'});
    existing=others[_pwEditingOtherIdx];
  } else {
    existing=pwFindPhoto(slot.id);
  }
  if(existing){
    preview.style.display='';
    prevImg.src=existing.url;
    sil.style.display='none';
  } else {
    preview.style.display='none';
    sil.style.display='';
  }
  // Caption per "other"
  var capWrap=document.getElementById('pw-caption-wrap');
  var capInput=document.getElementById('pw-caption-input');
  capWrap.style.display=slot.freeform?'block':'none';
  capInput.value=(existing&&existing.caption)?existing.caption:'';
  // Buttons
  var btnSkip=document.getElementById('pw-btn-skip');
  btnSkip.style.display=slot.required?'none':'';
  var btnConfirm=document.getElementById('pw-btn-confirm');
  btnConfirm.style.display='none'; // mostra solo dopo pick
  // Nav
  pwUpdateNav();
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}
var _pwEditingOtherIdx=null;

function pwUpdateNav(){
  var counter=document.getElementById('pw-nav-counter');
  if(counter)counter.textContent=(_pwCurrentSlotIdx+1)+' / '+PW_SLOTS.length;
  var prev=document.getElementById('pw-nav-prev');
  var next=document.getElementById('pw-nav-next');
  if(prev)prev.disabled=_pwCurrentSlotIdx<=0;
  if(next)next.disabled=_pwCurrentSlotIdx>=PW_SLOTS.length-1;
}
function pwPrevSlot(){if(_pwCurrentSlotIdx>0){pwOpenForSlot(_pwCurrentSlotIdx-1)}}
function pwNextSlot(){if(_pwCurrentSlotIdx<PW_SLOTS.length-1){pwOpenForSlot(_pwCurrentSlotIdx+1)}}
function pwSkip(){
  if(_pwCurrentSlotIdx<PW_SLOTS.length-1){pwNextSlot()}else{pwClose()}
}
function pwClose(){
  var modal=document.getElementById('pw-modal');
  modal.classList.remove('open');
  document.body.style.overflow='';
  _pwPickedFile=null;
}
function pwOpenCamera(){
  document.getElementById('pw-camera-input').click();
}
function pwPickFile(){
  document.getElementById('pw-file-input').click();
}
function pwHandleSlotFile(files){
  if(!files||!files.length)return;
  var f=files[0];
  if(!f.type.startsWith('image/')){showToast('<span class="it">File non valido</span><span class="en">Invalid file</span>');return}
  _pwPickedFile=f;
  // Preview
  var url=URL.createObjectURL(f);
  var preview=document.getElementById('pw-preview'), prevImg=document.getElementById('pw-preview-img');
  preview.style.display='';
  prevImg.src=url;
  document.getElementById('pw-silhouette').style.display='none';
  document.getElementById('pw-btn-confirm').style.display='';
  // Blur check async (non bloccante)
  pwBlurCheck(f,url);
  // reset file inputs
  document.getElementById('pw-camera-input').value='';
  document.getElementById('pw-file-input').value='';
}
function pwBlurCheck(file,objectUrl){
  // Variance check: foto molto sfocata → warning
  try{
    var img=new Image();
    img.onload=function(){
      var size=Math.min(96,img.width,img.height);
      var c=document.createElement('canvas');
      c.width=size;c.height=size;
      var ctx=c.getContext('2d');
      ctx.drawImage(img,0,0,size,size);
      var data=ctx.getImageData(0,0,size,size).data;
      var gray=[];
      for(var i=0;i<data.length;i+=4){gray.push(.299*data[i]+.587*data[i+1]+.114*data[i+2])}
      // Laplacian approx: somma delle differenze tra vicini
      var sum=0,count=0;
      for(var y=1;y<size-1;y++){
        for(var x=1;x<size-1;x++){
          var idx=y*size+x;
          var dx=gray[idx+1]-gray[idx-1];
          var dy=gray[idx+size]-gray[idx-size];
          sum+=Math.abs(dx)+Math.abs(dy);count++;
        }
      }
      var variance=count?sum/count:0;
      if(variance<6){
        showToast('<span class="it">Foto sembra sfocata — puoi confermare o rifare.</span><span class="en">Photo looks blurry — confirm or retake.</span>');
      }
    };
    img.src=objectUrl;
  }catch(e){}
}
function pwConfirmSlot(){
  var slot=PW_SLOTS[_pwCurrentSlotIdx];
  if(!_pwPickedFile){pwClose();return}
  var caption='';
  if(slot.freeform){
    caption=(document.getElementById('pw-caption-input').value||'').trim();
    if(!caption){showToast('<span class="it">Aggiungi una descrizione per ALTRO.</span><span class="en">Add a description for OTHER.</span>');return}
  }
  var entry={slot:slot.id,type:'file',url:URL.createObjectURL(_pwPickedFile),file:_pwPickedFile,caption:caption};
  if(slot.id==='other'){
    if(_pwEditingOtherIdx!=null){
      // Replace by index
      var others=_subPhotos.filter(function(p){return p.slot==='other'});
      var target=others[_pwEditingOtherIdx];
      var idx=_subPhotos.indexOf(target);
      if(idx>=0)_subPhotos[idx]=entry;
    } else {
      _subPhotos.push(entry);
    }
  } else {
    // Replace existing or push
    var existingIdx=_subPhotos.findIndex(function(p){return p.slot===slot.id});
    if(existingIdx>=0)_subPhotos[existingIdx]=entry;
    else _subPhotos.push(entry);
  }
  renderSubPhotos();
  // Auto-avanza se è uno slot obbligatorio e c'è uno slot successivo
  if(slot.required && _pwCurrentSlotIdx<PW_SLOTS.length-1){
    setTimeout(function(){pwNextSlot()},250);
  } else {
    pwClose();
  }
}
function pwRemoveSlotPhoto(slotId,otherIdx){
  if(slotId==='other' && otherIdx!=null){
    var others=_subPhotos.filter(function(p){return p.slot==='other'});
    var target=others[otherIdx];
    var idx=_subPhotos.indexOf(target);
    if(idx>=0)_subPhotos.splice(idx,1);
  } else {
    var i=_subPhotos.findIndex(function(p){return p.slot===slotId});
    if(i>=0)_subPhotos.splice(i,1);
  }
  renderSubPhotos();
}

// Legacy helpers (per retrocompat, chiamate da altre parti del codice)
function handlePhotoFiles(files){
  // Se viene usato il vecchio input, associa al primo slot vuoto utile
  for(var i=0;i<files.length;i++){
    if(_subPhotos.length>=SUB_MAX_PHOTOS)break;
    var f=files[i];
    if(!f.type.startsWith('image/'))continue;
    // Trova primo slot base vuoto, altrimenti 'other'
    var slotId='other';
    for(var s=0;s<6;s++){if(!pwFindPhoto(PW_SLOTS[s].id)){slotId=PW_SLOTS[s].id;break}}
    _subPhotos.push({slot:slotId,type:'file',url:URL.createObjectURL(f),file:f,caption:slotId==='other'?'Legacy':''});
  }
  renderSubPhotos();
}
function promptPhotoUrl(){
  var url=prompt('URL immagine:');
  if(!url||!url.trim())return;
  url=url.trim();
  _subPhotos.push({slot:'other',type:'url',url:url,caption:'Link esterno'});
  renderSubPhotos();
}

// 17 lug 2026 (flusso valutazione): le foto da fotocamera arrivano anche a 3-4 MB
// l'una — 7 foto = ~25 MB e su mobile il salvataggio sembrava congelato.
// Ricompressione client (max 1600px, JPEG .82) prima dell'upload: ~10-15x più leggero.
async function compressSubPhoto(file){
  try{
    if(!file.type||file.type.indexOf('image/')!==0)return {body:file,type:file.type,ext:(file.name||'').split('.').pop()||'jpg'};
    var bmp=await createImageBitmap(file);
    var MAX=1600;
    var scale=Math.min(1,MAX/Math.max(bmp.width,bmp.height));
    var w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale));
    var c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(bmp,0,0,w,h);
    var blob=await new Promise(function(r){c.toBlob(r,'image/jpeg',0.82)});
    if(blob&&blob.size<file.size)return {body:blob,type:'image/jpeg',ext:'jpg'};
    return {body:file,type:file.type,ext:(file.name||'').split('.').pop()||'jpg'};
  }catch(e){return {body:file,type:file.type,ext:(file.name||'').split('.').pop()||'jpg'};}
}

async function uploadSubPhotos(token,onProgress){
  // Ritorna {urls:[], photosBySlot:{}} per la nuova struttura
  var urls=[]; // legacy flat array per image_url / extra_photos
  var photosBySlot={};
  var others=[];
  var failed=0;
  for(var i=0;i<_subPhotos.length;i++){
    var p=_subPhotos[i];
    if(onProgress)onProgress(i+1,_subPhotos.length);
    var finalUrl;
    if(p.type==='url'){
      finalUrl=p.url;
    } else {
      var packed=await compressSubPhoto(p.file);
      var path=_session.user.id+'/'+Date.now()+'_'+(p.slot||'x')+'_'+i+'.'+packed.ext;
      var upRes=await fetch(SB_URL+'/storage/v1/object/submissions/'+path,{
        method:'POST',
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':packed.type,'x-upsert':'true'},
        body:packed.body
      });
      if(!upRes.ok){failed++;continue;}
      finalUrl=SB_URL+'/storage/v1/object/public/submissions/'+path;
    }
    urls.push(finalUrl);
    if(p.slot==='other'){
      others.push({url:finalUrl,caption:p.caption||''});
    } else if(p.slot){
      photosBySlot[p.slot]=finalUrl;
    }
  }
  if(others.length)photosBySlot.others=others;
  return {urls:urls,photosBySlot:photosBySlot,failed:failed};
}

async function submitObject(){
  var title=document.getElementById('sub-title').value.trim();
  var desc=document.getElementById('sub-desc').value.trim();
  var cat=document.getElementById('sub-cat').value;
  var desired=parseFloat(document.getElementById('sub-desired').value);
  var minP=parseFloat(document.getElementById('sub-min').value);
  var msgEl=document.getElementById('sub-msg');
  msgEl.innerHTML='';msgEl.className='';
  if(!title||!cat){
    msgEl.innerHTML='<span class="it">Compila titolo e categoria.</span><span class="en">Fill title and category.</span>';
    msgEl.className='submit-msg err';subErrFocus(msgEl);return;
  }
  if(!desired||desired<500){
    msgEl.innerHTML='<span class="it">Il prezzo desiderato deve essere almeno €500.</span><span class="en">Desired price must be at least €500.</span>';
    msgEl.className='submit-msg err';subErrFocus(msgEl);return;
  }
  if(!minP||minP<500){
    msgEl.innerHTML='<span class="it">Il prezzo minimo deve essere almeno €500.</span><span class="en">Min price must be at least €500.</span>';
    msgEl.className='submit-msg err';subErrFocus(msgEl);return;
  }
  if(minP>desired){
    msgEl.innerHTML='<span class="it">Il prezzo minimo non può superare il desiderato.</span><span class="en">Min price cannot exceed desired price.</span>';
    msgEl.className='submit-msg err';subErrFocus(msgEl);return;
  }
  // F4: le foto tecniche obbligatorie devono essere tutte caricate prima del submit
  var _missingReq=PW_SLOTS.filter(function(s){return s.required&&!pwFindPhoto(s.id)});
  document.querySelectorAll('.pw-slot.pw-missing').forEach(function(el){el.classList.remove('pw-missing')});
  if(_missingReq.length){
    var _mn=_missingReq.map(function(s){return s.it}).join(', ');
    var _mnEn=_missingReq.map(function(s){return s.en}).join(', ');
    _missingReq.forEach(function(s){var el=document.querySelector('.pw-slot[data-slot="'+s.id+'"]');if(el)el.classList.add('pw-missing')});
    msgEl.innerHTML='<span class="it">Carica tutte le foto tecniche obbligatorie. Mancano: '+_mn+'.</span><span class="en">Upload all required technical photos. Missing: '+_mnEn+'.</span>';
    msgEl.className='submit-msg err';
    subErrFocus(msgEl,(document.documentElement.getAttribute('data-lang')||'it')==='it'?('Mancano foto obbligatorie: '+_mn):('Missing required photos: '+_mnEn));
    return;
  }
  if(_balance<_valuationCost){
    msgEl.innerHTML='<span class="it">Saldo ARIA insufficiente. Servono '+_valuationCost+' ARIA.</span><span class="en">Insufficient ARIA balance. '+_valuationCost+' ARIA required.</span>';
    msgEl.className='submit-msg err';subErrFocus(msgEl);return;
  }
  var btn=document.getElementById('sub-btn');
  btn.disabled=true;btn.classList.add('loading');
  try{
    var token=await getValidToken();
    // Upload file photos to storage — returns {urls, photosBySlot}
    // feedback live: senza, su mobile il salvataggio sembrava congelato
    msgEl.className='submit-msg';
    var upload=await uploadSubPhotos(token,function(i,n){
      msgEl.innerHTML='<span class="it">Carico le foto&hellip; '+i+'/'+n+'</span><span class="en">Uploading photos&hellip; '+i+'/'+n+'</span>';
    });
    if(upload.failed){
      msgEl.innerHTML='<span class="it">'+upload.failed+' foto non caricate — controlla la connessione e riprova.</span><span class="en">'+upload.failed+' photos failed to upload — check your connection and retry.</span>';
      msgEl.className='submit-msg err';subErrFocus(msgEl);
      btn.disabled=false;btn.classList.remove('loading');
      return;
    }
    msgEl.innerHTML='<span class="it">Invio la richiesta&hellip;</span><span class="en">Sending request&hellip;</span>';
    // Ordine canonico dell'array per il valutatore ABO (preserva info di slot
    // anche senza migrazione DB): front, back, left, right, top, bottom,
    // brand, box, certificate, accessories, defects, others...
    var orderedUrls=[];
    var sbs=upload.photosBySlot||{};
    ['front','back','left','right','top','bottom','brand','box','certificate','accessories','defects'].forEach(function(k){
      if(sbs[k])orderedUrls.push(sbs[k]);
    });
    (sbs.others||[]).forEach(function(o){if(o.url)orderedUrls.push(o.url)});
    // fallback alle urls raw se per qualche motivo photosBySlot è vuoto (legacy)
    var photoUrls=orderedUrls.length?orderedUrls:(upload.urls||[]);
    var mainImg=sbs.front||(photoUrls.length>0?photoUrls[0]:null);
    var res=await fetch(SB_URL+'/rest/v1/rpc/submit_object_for_valuation',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({
        p_title:title,
        p_description:desc||null,
        p_category:cat,
        p_image_url:mainImg,
        p_seller_desired_price:desired,
        p_seller_min_price:minP,
        p_image_urls:photoUrls,
        p_duration_type:getSelectedDuration()
      })
    });
    if(res.ok){
      var result=await res.json();
      if(result.success){
        _balance=result.new_balance;
        updateBalanceUI();
        updateSubmitCostUI();
        msgEl.innerHTML='<span class="it">Valutazione acquistata! '+result.aria_spent+' ARIA dedotti. Riceverai un riscontro entro 24-48h. </span><span class="en">Valuation purchased! '+result.aria_spent+' ARIA deducted. You\'ll hear back within 24-48h. </span><a style="color:var(--accent,#e05252);font-weight:700;cursor:pointer;text-decoration:underline" onclick="navigateTo(\'my\')"><span class="it">Segui la tua valutazione &rarr;</span><span class="en">Track your valuation &rarr;</span></a>';
        msgEl.className='submit-msg ok';
        document.getElementById('sub-title').value='';document.getElementById('sub-desc').value='';
        document.getElementById('sub-cat').value='';document.getElementById('sub-desired').value='';
        document.getElementById('sub-min').value='';
        _subPhotos=[];renderSubPhotos();
        showToast('Valutazione acquistata!');
      }else{
        if(result.error==='INSUFFICIENT_ARIA'){
          msgEl.innerHTML='<span class="it">Saldo ARIA insufficiente. Servono '+result.required+' ARIA, hai '+result.available+'.</span><span class="en">Insufficient ARIA. Need '+result.required+', have '+result.available+'.</span>';
        }else{
          msgEl.innerHTML='<span class="it">Errore: '+result.error+'</span><span class="en">Error: '+result.error+'</span>';
        }
        msgEl.className='submit-msg err';
        subErrFocus(msgEl);
      }
    } else {
      console.error('Submit error:',await res.text());
      msgEl.innerHTML='<span class="it">Errore nell\'invio. Riprova.</span><span class="en">Submission error. Try again.</span>';
      msgEl.className='submit-msg err';
      subErrFocus(msgEl,'Errore nell\'invio');
    }
  }catch(e){
    console.error('submitObject catch:',e);
    msgEl.innerHTML='<span class="it">Errore di rete.</span><span class="en">Network error.</span>';
    msgEl.className='submit-msg err';
    subErrFocus(msgEl,'Errore di rete');
  }
  btn.disabled=false;btn.classList.remove('loading');
}

// ── My Submissions (Le mie proposte) ──
async function loadMySubmissions(){
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_my_submissions',{
      method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}'
    });
    if(res.ok){
      var subs=await res.json();
      renderMySubmissions(subs);
    }
  }catch(e){console.error('loadMySubmissions error:',e);}
}

// Stati submissions:
// Attivi: in_valutazione, valutazione_completata, presale, sale, pending_seller_decision
// Archivio: dropped, completed, annullato, rifiutato_min500, rifiutato_generico
function _isSubActive(status){
  return status==='in_valutazione'||status==='valutazione_completata'
       ||status==='presale'||status==='sale'
       ||status==='pending_seller_decision';
}
function _needsAction(status){
  return status==='valutazione_completata'||status==='pending_seller_decision';
}

function renderMySubmissions(subs){
  var container=document.getElementById('my-submissions');
  var emptyEl=document.getElementById('my-submissions-empty');
  var containerArc=document.getElementById('my-submissions-archive');
  var emptyArcEl=document.getElementById('my-submissions-archive-empty');
  if(!container)return;
  subs=subs||[];
  // Split attivi/archivio
  var active=[],archive=[];
  for(var k=0;k<subs.length;k++){
    if(_isSubActive(subs[k].status))active.push(subs[k]); else archive.push(subs[k]);
  }
  // Ordina attivi: prima quelli che richiedono azione, poi per data desc
  active.sort(function(a,b){
    var aa=_needsAction(a.status)?0:1;
    var bb=_needsAction(b.status)?0:1;
    if(aa!==bb)return aa-bb;
    return new Date(b.created_at)-new Date(a.created_at);
  });
  // Archivio: data desc
  archive.sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});
  // Counts + banner azioni
  var actionCount=0;
  for(var n=0;n<active.length;n++)if(_needsAction(active[n].status))actionCount++;
  var cntA=document.getElementById('my-subs-active-count');
  var cntR=document.getElementById('my-subs-archive-count');
  if(cntA)cntA.textContent=active.length;
  if(cntR)cntR.textContent=archive.length;
  var banner=document.getElementById('my-actions-banner');
  var bcnt=document.getElementById('my-actions-count');
  if(banner&&bcnt){
    bcnt.textContent=actionCount;
    banner.style.display=actionCount>0?'':'none';
  }
  // Empty states
  if(active.length===0){
    container.innerHTML='';
    if(emptyEl)emptyEl.style.display='block';
  }else{
    if(emptyEl)emptyEl.style.display='none';
    container.innerHTML=_renderSubsHtml(active,false);
  }
  if(containerArc){
    if(archive.length===0){
      containerArc.innerHTML='';
      if(emptyArcEl)emptyArcEl.style.display='block';
    }else{
      if(emptyArcEl)emptyArcEl.style.display='none';
      containerArc.innerHTML=_renderSubsHtml(archive,true);
    }
  }
  _updateMyTabCounts();
}

function _renderSubsHtml(subs,isArchive){
  if(!subs||!subs.length)return '';
  var statusLabels={
    'in_valutazione':{it:'In valutazione',en:'Under evaluation',cls:'status-pending'},
    'valutazione_completata':{it:'Valutazione completata',en:'Evaluation complete',cls:'status-ready'},
    'presale':{it:'Pre-vendita',en:'Pre-sale',cls:'status-live'},
    'sale':{it:'In vendita',en:'On sale',cls:'status-live'},
    'dropped':{it:'Draw eseguito',en:'Draw executed',cls:'status-done'},
    'completed':{it:'Completato',en:'Completed',cls:'status-done'},
    'rifiutato_min500':{it:'Rifiutato (min €500)',en:'Rejected (min €500)',cls:'status-rejected'},
    'rifiutato_generico':{it:'Rifiutato',en:'Rejected',cls:'status-rejected'},
    'annullato':{it:'Annullato',en:'Cancelled',cls:'status-rejected'},
    'pending_seller_decision':{it:'Chiusura anticipata — decidi',en:'Early close — your decision',cls:'status-ready'}
  };
  var html='';
  for(var i=0;i<subs.length;i++){
    var s=subs[i];
    var st=statusLabels[s.status]||{it:s.status,en:s.status,cls:'status-default'};
    var date=new Date(s.created_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'});
    var quotation=s.object_value_eur>0?'€'+parseFloat(s.object_value_eur).toFixed(2):'—';
    var subImgHtml=s.image_url
      ?'<img class="my-card-img" src="'+s.image_url+'" alt="" loading="lazy">'
      :'<div class="my-card-img-placeholder"><svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="1.5"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" stroke-width="1.5"/></svg></div>';
    var cardStyle='border:1px solid var(--gray-800);padding:16px 20px;margin-bottom:12px'+(isArchive?';opacity:.72':'');
    html+='<div style="'+cardStyle+'">';
    html+='<div style="display:flex;gap:16px;align-items:flex-start">';
    html+=subImgHtml;
    html+='<div style="flex:1;min-width:0">';
    html+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px">';
    html+='<div style="font-family:var(--font-h);font-size:18px;font-weight:400;color:var(--white)">'+escHtml(s.title)+'</div>';
    html+='<span class="'+st.cls+'" style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;white-space:nowrap"><span class="it">'+st.it+'</span><span class="en">'+st.en+'</span></span>';
    html+='</div>';
    html+='<div style="display:flex;gap:24px;font-size:12px;color:var(--gray-400);margin-bottom:8px">';
    html+='<span>'+date+'</span>';
    html+='<span>'+escHtml(s.category)+'</span>';
    html+='</div>';
    html+='<div style="display:flex;gap:24px;font-size:13px;flex-wrap:wrap">';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Desiderato:</span><span class="en">Desired:</span></span> <span style="color:var(--white)">€'+parseFloat(s.seller_desired_price).toFixed(2)+'</span></div>';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Minimo:</span><span class="en">Min:</span></span> <span style="color:var(--white)">€'+parseFloat(s.seller_min_price).toFixed(2)+'</span></div>';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Quotazione:</span><span class="en">Quote:</span></span> <span style="color:var(--gold)">'+quotation+'</span></div>';
    html+='</div>';
    html+='</div></div>';
    if(s.rejection_reason){
      html+='<div style="margin-top:8px;padding:8px 12px;border-left:3px solid #ef4444;background:rgba(239,68,68,.06);font-size:12px;color:#ef4444">'+escHtml(s.rejection_reason)+'</div>';
    }
    var canWithdraw=s.status!=='annullato'&&s.status!=='completed'&&s.status!=='closed'&&s.status!=='pending_seller_decision';
    var isValutazioneCompletata=s.status==='valutazione_completata';
    var isPendingSellerDecision=s.status==='pending_seller_decision';
    html+='<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">';
    html+='<button onclick="goToAirdrop(\''+s.id+'\')" style="background:var(--gold);color:#000;border:none;padding:7px 16px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;font-weight:700;cursor:pointer;transition:all .15s;border-radius:var(--radius-sm)" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'"><span class="it">ENTRA</span><span class="en">ENTER</span></button>';
    html+='<button onclick="this.style.display=\'none\';loadAirdropChat(\''+s.id+'\',\'sub-chat-'+s.id+'\')" style="background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'"><span class="it">MESSAGGI</span><span class="en">MESSAGES</span></button>';
    if(!isArchive){
      if(isValutazioneCompletata){
        html+='<button onclick="acceptValuation(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.4);color:#22c55e;padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;font-weight:600;cursor:pointer;transition:all .2s" onmouseover="this.style.background=\'rgba(34,197,94,.2)\';this.style.borderColor=\'#22c55e\'" onmouseout="this.style.background=\'rgba(34,197,94,.1)\';this.style.borderColor=\'rgba(34,197,94,.4)\'"><span class="it">ACCETTA</span><span class="en">ACCEPT</span></button>';
        html+='<button onclick="withdrawSubmission(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:none;border:1px solid rgba(239,68,68,.3);color:rgba(239,68,68,.7);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'rgba(239,68,68,.3)\';this.style.color=\'rgba(239,68,68,.7)\'"><span class="it">RIFIUTA</span><span class="en">REJECT</span></button>';
      } else if(isPendingSellerDecision){
        html+='<button onclick="openCompleteEarlyClose(\''+s.id+'\')" style="background:var(--gold);color:#000;border:none;padding:7px 16px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;font-weight:700;cursor:pointer;transition:all .15s;border-radius:var(--radius-sm)"><span class="it">COMPLETA</span><span class="en">COMPLETE</span></button>';
        html+='<button onclick="withdrawSubmission(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:none;border:1px solid rgba(239,68,68,.3);color:rgba(239,68,68,.7);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'rgba(239,68,68,.3)\';this.style.color=\'rgba(239,68,68,.7)\'"><span class="it">ANNULLA</span><span class="en">CANCEL</span></button>';
      } else if(canWithdraw){
        html+='<button onclick="withdrawSubmission(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:none;border:1px solid rgba(239,68,68,.3);color:rgba(239,68,68,.7);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'rgba(239,68,68,.3)\';this.style.color=\'rgba(239,68,68,.7)\'"><span class="it">RITIRA</span><span class="en">WITHDRAW</span></button>';
      }
    }
    html+='</div>';
    if(!isArchive&&isPendingSellerDecision){
      var reason=s.early_close_reason==='value_threshold'?'soglia valore raggiunta dal primo':'fairness lockdown (tutti i non-primi bloccati)';
      var reasonEn=s.early_close_reason==='value_threshold'?'value threshold reached by leader':'fairness lockdown (all non-leaders blocked)';
      html+='<div style="margin-top:10px;padding:12px 14px;background:rgba(239,62,79,.06);border:1px solid rgba(239,62,79,.25);border-radius:var(--radius-sm);font-size:12px;line-height:1.55;color:var(--gray-300)"><span class="it">&#9888; Airdrop chiuso anticipatamente ('+reason+'). Blocchi venduti: <strong>'+(s.blocks_sold||0)+'</strong>/<strong>'+(s.original_total_blocks||s.total_blocks||0)+'</strong>. Clicca COMPLETA per vedere il riepilogo e accettare il payout ridotto, o ANNULLA per ritirare (fee di valutazione NON rimborsata).</span><span class="en">&#9888; Airdrop closed early ('+reasonEn+'). Blocks sold: <strong>'+(s.blocks_sold||0)+'</strong>/<strong>'+(s.original_total_blocks||s.total_blocks||0)+'</strong>. Click COMPLETE to review the reduced payout, or CANCEL to withdraw (valuation fee NOT refunded).</span></div>';
    }
    html+='<div id="sub-chat-'+s.id+'" style="margin-top:8px"></div>';
    html+='</div>';
  }
  return html;
}

// ── Early-close completion (seller decide COMPLETA post-lockdown) ──
async function openCompleteEarlyClose(airdropId){
  var token=await getValidToken();if(!token)return;
  // Fetch airdrop per riepilogo
  var rows=await sbGet('airdrops?id=eq.'+airdropId+'&select=id,title,status,blocks_sold,total_blocks,original_total_blocks,block_price_aria,seller_min_price,seller_desired_price,early_close_reason,object_value_eur',token);
  if(!rows||!rows[0]){showToast('<span class="it">Airdrop non trovato</span><span class="en">Airdrop not found</span>');return;}
  var a=rows[0];
  if(a.status!=='pending_seller_decision'){showToast('<span class="it">Questo airdrop non è in attesa di decisione</span><span class="en">This airdrop is not pending decision</span>');return;}

  var blocksSold=a.blocks_sold||0;
  var originalBlocks=a.original_total_blocks||a.total_blocks||0;
  var burned=originalBlocks-blocksSold;
  var blockPrice=a.block_price_aria||0;
  var revenueAria=blocksSold*blockPrice;
  var revenueEur=revenueAria/10; // ARIA_EUR=0.10
  var sellerMin=parseFloat(a.seller_min_price)||0;
  var sellerDesired=parseFloat(a.seller_desired_price)||0;
  // Stima quota seller (78% del revenue se split std; fallback: tutto meno AIROOBI fee)
  var sellerShare=revenueEur*0.78;
  var belowMin=sellerShare<sellerMin;
  var belowDesired=sellerShare<sellerDesired;
  var reasonIt=a.early_close_reason==='value_threshold'?'Il primo ha raggiunto il valore dell\'oggetto in ARIA (protezione anti-gambling)':'Tutti gli altri partecipanti sono matematicamente bloccati (fairness lockdown)';
  var reasonEn=a.early_close_reason==='value_threshold'?'Leader reached object value in ARIA (anti-gambling protection)':'All non-leader participants are mathematically blocked (fairness lockdown)';

  var lang=document.documentElement.getAttribute('data-lang')==='en'?'en':'it';
  var existing=document.getElementById('ec-modal-overlay');
  if(existing)existing.remove();
  var ov=document.createElement('div');
  ov.id='ec-modal-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};

  var html=''
    +'<div style="max-width:540px;width:100%;max-height:90vh;overflow-y:auto;background:var(--card-bg);border:1px solid var(--gray-700);border-radius:var(--radius);padding:28px 24px">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:6px"><span class="it">Chiusura anticipata</span><span class="en">Early close</span></div>'
    +'<h3 style="font-family:var(--font-h);font-size:22px;font-weight:500;color:var(--white);margin:0 0 14px">'+escHtml(a.title)+'</h3>'
    +'<div style="padding:14px 16px;background:rgba(239,62,79,.05);border-left:3px solid var(--gold);border-radius:var(--radius-sm);margin-bottom:18px;font-size:13px;color:var(--gray-300);line-height:1.55"><span class="it">Motivo: '+reasonIt+'.</span><span class="en">Reason: '+reasonEn+'.</span></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;margin-bottom:18px;font-size:13px">'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Step fatti</span><span class="en">Steps taken</span></div><div style="color:var(--white);font-size:15px"><strong>'+blocksSold.toLocaleString('it-IT')+'</strong> / '+originalBlocks.toLocaleString('it-IT')+'</div></div>'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Step bruciati</span><span class="en">Burned</span></div><div style="color:var(--gray-400);font-size:15px">'+burned.toLocaleString('it-IT')+'</div></div>'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Revenue lordo</span><span class="en">Gross revenue</span></div><div style="color:var(--aria);font-size:15px"><strong>'+revenueAria.toLocaleString('it-IT')+' ARIA</strong><br><span style="font-size:12px;color:var(--gray-400)">&asymp; &euro;'+revenueEur.toFixed(2)+'</span></div></div>'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Tua quota stimata</span><span class="en">Your est. share</span></div><div style="color:var(--gold);font-size:15px"><strong>&euro;'+sellerShare.toFixed(2)+'</strong></div></div>'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Il tuo minimo</span><span class="en">Your minimum</span></div><div style="color:'+(belowMin?'#ef4444':'var(--gray-300)')+';font-size:15px">&euro;'+sellerMin.toFixed(2)+'</div></div>'
    +'<div><div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500);text-transform:uppercase;margin-bottom:3px"><span class="it">Il tuo desiderato</span><span class="en">Your desired</span></div><div style="color:var(--gray-400);font-size:15px">&euro;'+sellerDesired.toFixed(2)+'</div></div>'
    +'</div>'
    +(belowMin
      ?'<div style="padding:12px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:var(--radius-sm);margin-bottom:18px;font-size:13px;line-height:1.55;color:#ff9b70"><span class="it">&#9888; La quota stimata (&euro;'+sellerShare.toFixed(2)+') &egrave; <strong>sotto il tuo minimo</strong> (&euro;'+sellerMin.toFixed(2)+'). Se accetti, rinunci a parte di quello che speravi. Se annulli: ARIA rimborsata ai partecipanti, oggetto resta a te, fee di valutazione NON rimborsata.</span><span class="en">&#9888; Estimated share (&euro;'+sellerShare.toFixed(2)+') is <strong>below your minimum</strong> (&euro;'+sellerMin.toFixed(2)+'). If you accept, you give up part of what you hoped for. If you cancel: ARIA refunded to participants, item stays with you, valuation fee NOT refunded.</span></div>'
      :'<div style="padding:12px 14px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.3);border-radius:var(--radius-sm);margin-bottom:18px;font-size:13px;line-height:1.55;color:#22c55e"><span class="it">&#10003; La quota stimata copre il tuo minimo. Ricevi meno di quanto speravi ma l\'airdrop pu&ograve; chiudersi con successo.</span><span class="en">&#10003; Estimated share covers your minimum. Less than you hoped but the airdrop can close successfully.</span></div>')
    +'<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">'
    +'<button onclick="document.getElementById(\'ec-modal-overlay\').remove()" style="background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:12px 18px;font-family:var(--font-m);font-size:11px;letter-spacing:1.5px;cursor:pointer;border-radius:var(--radius-sm)"><span class="it">Chiudi</span><span class="en">Close</span></button>'
    +'<button onclick="confirmCompleteEarlyClose(\''+a.id+'\')" style="background:var(--gold);color:#000;border:none;padding:12px 24px;font-family:var(--font-m);font-size:11px;letter-spacing:2px;font-weight:700;cursor:pointer;border-radius:var(--radius-sm)"><span class="it">ACCETTA E COMPLETA</span><span class="en">ACCEPT & COMPLETE</span></button>'
    +'</div>'
    +'</div>';

  ov.innerHTML=html;
  document.body.appendChild(ov);
}

async function confirmCompleteEarlyClose(airdropId){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msg=lang==='it'
    ?'Confermi la chiusura dell\'airdrop? Riceverai il payout indicato, il 1° in classifica otterrà l\'oggetto e le partecipazioni saranno finalizzate.'
    :'Confirm airdrop completion? You\'ll receive the indicated payout, the #1 in the ranking gets the item, and participations are finalized.';
  if(!confirm(msg))return;
  var token=await getValidToken();if(!token)return;
  var res=await sbRpc('complete_airdrop_seller_accept',{p_airdrop_id:airdropId},token);
  if(res&&res.ok){
    showToast('<span class="it">Airdrop completato!</span><span class="en">Airdrop completed!</span>');
    var ov=document.getElementById('ec-modal-overlay');if(ov)ov.remove();
    loadMySubmissions();
  }else{
    showToast('<span class="it">Errore: '+(res&&res.error?res.error:'sconosciuto')+'</span><span class="en">Error: '+(res&&res.error?res.error:'unknown')+'</span>');
  }
}

// ── Withdraw submission (doppia conferma) ──
async function withdrawSubmission(airdropId,title){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msg1=lang==='it'
    ?'Vuoi ritirare la proposta "'+title+'"?\n\nL\'airdrop diventerà ANNULLATO. I 50 ARIA di valutazione non saranno rimborsati.\nTutti gli ARIA spesi dai partecipanti saranno rimborsati automaticamente.\nNessun ROBI verrà generato.'
    :'Withdraw proposal "'+title+'"?\n\nThe airdrop will be CANCELLED. The 50 ARIA valuation fee will not be refunded.\nAll ARIA spent by participants will be automatically refunded.\nNo ROBI will be generated.';
  if(!confirm(msg1))return;
  var msg2=lang==='it'
    ?'CONFERMA DEFINITIVA: Sei sicuro di voler annullare "'+title+'"?\n\nQuesta azione NON è reversibile.'
    :'FINAL CONFIRMATION: Are you sure you want to cancel "'+title+'"?\n\nThis action CANNOT be undone.';
  if(!confirm(msg2))return;
  var token=await getValidToken();if(!token)return;
  var res=await sbRpc('withdraw_my_submission',{p_airdrop_id:airdropId},token);
  if(res&&res.ok){
    var toast=lang==='it'
      ?'Proposta ritirata.'+(res.aria_refunded>0?' '+res.aria_refunded+' ARIA rimborsati a '+res.users_refunded+' partecipante/i.':'')
      :'Proposal withdrawn.'+(res.aria_refunded>0?' '+res.aria_refunded+' ARIA refunded to '+res.users_refunded+' participant(s).':'');
    showToast(toast);
    loadMySubmissions();
  }else{
    var err=res&&res.error?res.error:'UNKNOWN';
    var msgs={
      'ALREADY_FINALIZED':{it:'Proposta già finalizzata.',en:'Proposal already finalized.'},
      'NOT_AUTHORIZED':{it:'Non sei autorizzato.',en:'Not authorized.'}
    };
    var m=msgs[err]||{it:'Errore: '+err,en:'Error: '+err};
    showToast('<span style="color:var(--red)">'+(lang==='it'?m.it:m.en)+'</span>');
  }
}

// ── Accept valuation ──
async function acceptValuation(airdropId,title){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msg=lang==='it'
    ?'Accetti la valutazione per "'+title+'"? L\'airdrop verrà avviato.'
    :'Accept the valuation for "'+title+'"? The airdrop will go live.';
  if(!confirm(msg))return;
  var token=await getValidToken();if(!token)return;
  var res=await sbRpc('accept_airdrop_valuation',{p_airdrop_id:airdropId},token);
  if(res&&res.ok){
    showToast(lang==='it'
      ?'Airdrop avviato in '+res.new_status+'!'
      :'Airdrop launched in '+res.new_status+'!');
    loadMySubmissions();
  }else{
    var err=res&&res.error?res.error:'UNKNOWN';
    var msgs={
      'WRONG_STATUS':{it:'Lo stato non permette l\'accettazione.',en:'Status does not allow acceptance.'},
      'NOT_FOUND_OR_NOT_OWNER':{it:'Airdrop non trovato.',en:'Airdrop not found.'}
    };
    var m=msgs[err]||{it:'Errore: '+err,en:'Error: '+err};
    showToast('<span style="color:var(--red)">'+(lang==='it'?m.it:m.en)+'</span>');
  }
}

// ══════════════════════════════
// ── BACKOFFICE (manage tab) ──
// ══════════════════════════════
async function loadBoData(){
  var token=await getValidToken();
  if(!token)return;
  var all=await sbRpc('get_all_airdrops',{},token)||[];
  if(!Array.isArray(all))all=[];
  // Filter by evaluator categories (null in _managerCats = all categories)
  if(_isAdmin||_managerCats.indexOf(null)>=0){
    _allAirdrops=all;
  }else{
    _allAirdrops=all.filter(function(a){return _managerCats.indexOf(a.category)>=0});
  }
  renderBoCounts();
  renderBoTable();
}

function boFilter(status){
  _boFilter=status;
  document.querySelectorAll('.bo-tab').forEach(function(t){t.classList.toggle('active',t.getAttribute('data-bo')===status)});
  closeBoDetail();
  renderBoTable();
}

function getBoFiltered(){
  if(_boFilter==='all')return _allAirdrops;
  if(_boFilter==='rifiutato')return _allAirdrops.filter(function(a){return a.status==='rifiutato_min500'||a.status==='rifiutato_generico'});
  return _allAirdrops.filter(function(a){return a.status===_boFilter});
}

function renderBoCounts(){
  var c={in_valutazione:0,presale:0,sale:0,rifiutato:0,all:_allAirdrops.length};
  _allAirdrops.forEach(function(a){
    if(a.status==='in_valutazione')c.in_valutazione++;
    else if(a.status==='presale')c.presale++;
    else if(a.status==='sale')c.sale++;
    else if(a.status.startsWith('rifiutato'))c.rifiutato++;
  });
  Object.keys(c).forEach(function(k){var el=document.getElementById('cnt-'+k);if(el)el.textContent=c[k]});
}

function renderBoTable(){
  var list=getBoFiltered();
  var wrap=document.getElementById('bo-table-wrap');
  if(!list.length){wrap.innerHTML='<div class="bo-empty"><span class="it">Nessun airdrop in questa sezione</span><span class="en">No airdrops in this section</span></div>';return;}
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury',smartphone:'Smartphone',tablet:'Tablet',computer:'Computer',gaming:'Gaming',audio:'Audio',fotografia:'Fotografia',orologi:'Orologi',gioielli:'Gioielli',borse:'Borse',moda:'Moda',biciclette:'Biciclette',arredamento:'Arredamento',sport:'Sport',strumenti:'Strumenti',arte:'Arte',vino:'Vini'};
  var html='<table class="bo-table"><thead><tr><th>Oggetto</th><th>Cat.</th><th>Valore</th><th class="hide-mobile">Status</th><th class="hide-mobile">Blocchi</th><th class="hide-mobile">Data</th><th>Azioni</th></tr></thead><tbody>';
  list.forEach(function(a){
    var date=new Date(a.created_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short'});
    var blocksInfo=a.total_blocks>0?(a.blocks_sold+'/'+a.total_blocks):'—';
    html+='<tr><td class="truncate" title="'+a.title+'">'+a.title+'</td>'
      +'<td class="mono">'+(catLabels[a.category]||a.category)+'</td>'
      +'<td class="mono">€'+Number(a.object_value_eur).toLocaleString('it-IT')+'</td>'
      +'<td class="hide-mobile"><span class="bo-status '+a.status+'">'+a.status.replace(/_/g,' ')+'</span></td>'
      +'<td class="mono hide-mobile">'+blocksInfo+'</td>'
      +'<td class="mono hide-mobile">'+date+'</td>'
      +'<td><div class="bo-actions">'
      +'<button class="bo-btn" onclick="viewBoDetail(\''+a.id+'\')">&#9432;</button>';
    if(a.status==='in_valutazione'){
      html+='<button class="bo-btn approve" onclick="openApprove(\''+a.id+'\')">&#10003;</button>'
        +'<button class="bo-btn reject" onclick="openReject(\''+a.id+'\')">&#10005;</button>';
    }
    html+='</div></td></tr>';
  });
  html+='</tbody></table>';
  wrap.innerHTML=html;
}

function viewBoDetail(id){
  var a=_allAirdrops.find(function(x){return x.id===id});
  if(!a)return;
  var panel=document.getElementById('bo-detail-panel');
  var date=new Date(a.created_at).toLocaleString('it-IT');
  var dl=a.deadline?new Date(a.deadline).toLocaleDateString('it-IT'):'—';
  var html='<div class="bo-detail"><div class="bo-detail-header"><div class="bo-detail-title">'+a.title+' <span class="bo-status '+a.status+'">'+a.status.replace(/_/g,' ')+'</span> <button class="bo-btn" onclick="openEditAirdrop(\''+a.id+'\')" style="border-color:var(--aria);color:var(--aria);margin-left:8px">&#9998; <span class="it">Modifica</span><span class="en">Edit</span></button></div><button class="bo-detail-close" onclick="closeBoDetail()">&times;</button></div>';
  if(a.image_url)html+='<img class="bo-detail-img" src="'+a.image_url+'" alt="">';
  if(a.description)html+='<div class="bo-detail-desc">'+a.description+'</div>';
  html+='<div class="bo-detail-grid">'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">ID</div><div class="bo-detail-item-val mono" style="font-size:10px">'+a.id+'</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Categoria</div><div class="bo-detail-item-val">'+a.category+'</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Valore EUR</div><div class="bo-detail-item-val" style="color:var(--gold)">€'+Number(a.object_value_eur).toLocaleString('it-IT')+'</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Prezzo blocco</div><div class="bo-detail-item-val" style="color:var(--aria)">'+(a.block_price_aria||'—')+' ARIA</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Blocchi</div><div class="bo-detail-item-val">'+(a.total_blocks>0?a.blocks_sold+'/'+a.total_blocks:'—')+'</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Deadline</div><div class="bo-detail-item-val">'+dl+'</div></div>'
    +'<div class="bo-detail-item"><div class="bo-detail-item-label">Creato</div><div class="bo-detail-item-val">'+date+'</div></div>'
    +'</div>';
  if(a.rejection_reason)html+='<div style="color:var(--red);font-size:12px;margin-top:8px">Motivo: '+a.rejection_reason+'</div>';
  if(a.status==='in_valutazione')html+='<div class="bo-actions" style="margin-top:12px"><button class="bo-btn approve" onclick="openApprove(\''+a.id+'\')"><span class="it">Approva</span><span class="en">Approve</span></button><button class="bo-btn reject" onclick="openReject(\''+a.id+'\')"><span class="it">Rifiuta</span><span class="en">Reject</span></button></div>';
  // Chat section
  html+='<div style="margin-top:20px;border-top:1px solid var(--gray-800);padding-top:16px">';
  html+='<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--gray-400);text-transform:uppercase;margin-bottom:12px"><span class="it">Messaggi con il proponente</span><span class="en">Messages with submitter</span></div>';
  html+='<div id="bo-chat-'+a.id+'"></div>';
  html+='</div>';
  html+='</div>';
  panel.innerHTML=html;
  loadAirdropChat(a.id,'bo-chat-'+a.id);
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}

function closeBoDetail(){var p=document.getElementById('bo-detail-panel');if(p)p.innerHTML='';}

// ── Airdrop Chat ──
async function loadAirdropChat(airdropId,containerId){
  var el=document.getElementById(containerId);
  if(!el)return;
  try{
    var token=await getValidToken();
    var res=await fetch(SB_URL+'/rest/v1/airdrop_messages?airdrop_id=eq.'+airdropId+'&order=created_at.asc&select=id,airdrop_id,sender_id,body,is_admin,created_at',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    var msgs=res.ok?await res.json():[];
    var s=getSession();
    var myId=s&&s.user?s.user.id:null;
    var html='<div style="max-height:300px;overflow-y:auto;padding:8px 0" id="'+containerId+'-scroll">';
    if(msgs.length===0){
      html+='<div style="text-align:center;padding:20px;color:var(--gray-500);font-size:12px"><span class="it">Nessun messaggio</span><span class="en">No messages yet</span></div>';
    }else{
      for(var i=0;i<msgs.length;i++){
        var m=msgs[i];
        var isMine=m.sender_id===myId;
        var side=isMine?'msg-mine':'msg-theirs';
        var label=isMine?(m.is_admin?'AIROOBI':'Tu'):(m.is_admin?'AIROOBI':'Utente');
        var time=new Date(m.created_at).toLocaleString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
        html+='<div class="chat-msg '+side+'">';
        html+='<div class="chat-msg-bubble">';
        html+='<div class="chat-msg-head"><span class="chat-msg-author">'+label+'</span><span class="chat-msg-time">'+time+'</span></div>';
        html+='<div class="chat-msg-body">'+escHtml(m.body)+'</div>';
        html+='</div></div>';
      }
    }
    html+='</div>';
    html+='<div style="display:flex;gap:8px;margin-top:8px">';
    html+='<input id="'+containerId+'-input" type="text" placeholder="Scrivi un messaggio..." style="flex:1;padding:10px 14px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-family:var(--font-b);font-size:13px;border-radius:var(--radius-sm)" onkeydown="if(event.key===\'Enter\')sendChatMsg(\''+airdropId+'\',\''+containerId+'\')">';
    html+='<button onclick="sendChatMsg(\''+airdropId+'\',\''+containerId+'\')" style="padding:10px 18px;background:var(--gold);color:var(--black);border:none;font-family:var(--font-m);font-size:11px;letter-spacing:1px;font-weight:700;cursor:pointer;border-radius:var(--radius-sm);white-space:nowrap"><span class="it">INVIA</span><span class="en">SEND</span></button>';
    html+='</div>';
    el.innerHTML=html;
    var scroll=document.getElementById(containerId+'-scroll');
    if(scroll)scroll.scrollTop=scroll.scrollHeight;
  }catch(e){console.error('loadAirdropChat:',e);}
}

async function sendChatMsg(airdropId,containerId){
  var input=document.getElementById(containerId+'-input');
  if(!input)return;
  var body=input.value.trim();
  if(!body)return;
  input.disabled=true;
  try{
    var token=await getValidToken();
    var res=await sbRpc('send_airdrop_message',{p_airdrop_id:airdropId,p_body:body},token);
    if(res&&res.success){
      input.value='';
      await loadAirdropChat(airdropId,containerId);
    }else{
      showToast('Errore: '+(res?.error||'unknown'));
    }
  }catch(e){console.error('sendChatMsg:',e)}
  input.disabled=false;
  var newInput=document.getElementById(containerId+'-input');
  if(newInput)newInput.focus();
}

// ── Approve ──
function openApprove(id){
  var a=_allAirdrops.find(function(x){return x.id===id});
  if(!a)return;
  _boTarget=a;
  document.getElementById('approve-title').textContent=a.title;
  var val=Number(a.object_value_eur);
  var sugBlocks=Math.max(10,Math.round(val/4)*2);
  var sugPrice=Math.max(1,Math.round(val*1.43/sugBlocks));
  document.getElementById('approve-info').innerHTML='<strong>'+a.title+'</strong><br>Categoria: '+a.category+' &middot; Valore: <strong>€'+val.toLocaleString('it-IT')+'</strong><br>Suggerimento: ~'+sugBlocks+' Step × '+sugPrice+' ARIA = €'+(sugBlocks*sugPrice*0.20).toLocaleString('it-IT')+' revenue';
  document.getElementById('approve-price').value=sugPrice;
  document.getElementById('approve-blocks').value=sugBlocks;
  document.getElementById('approve-presale').value='';
  document.getElementById('approve-deadline').value='';
  document.getElementById('approve-status').value='presale';
  document.getElementById('approve-modal').classList.add('active');
}

async function doApprove(){
  if(!_boTarget)return;
  var price=parseInt(document.getElementById('approve-price').value);
  var blocks=parseInt(document.getElementById('approve-blocks').value);
  var presale=document.getElementById('approve-presale').value?parseInt(document.getElementById('approve-presale').value):null;
  var status=document.getElementById('approve-status').value;
  var deadline=document.getElementById('approve-deadline').value||null;
  if(!price||price<1||!blocks||blocks<1){alert('Prezzo e Step obbligatori');return;}
  var btn=document.getElementById('approve-ok');
  btn.disabled=true;
  var token=await getValidToken();
  var duration=document.getElementById('approve-duration')?document.getElementById('approve-duration').value:'standard';
  var args={p_airdrop_id:_boTarget.id,p_status:status,p_block_price_aria:price,p_total_blocks:blocks,p_duration_type:duration};
  if(presale)args.p_presale_block_price=presale;
  if(deadline)args.p_deadline=deadline+'T23:59:59Z';
  var res=await sbRpc('manager_update_airdrop',args,token);
  btn.disabled=false;
  if(res&&res.ok){
    closeBoModals();
    showToast('Approvato: '+_boTarget.title);
    await loadBoData();
    await loadAirdrops();renderGrid();renderCatDashboard();renderCategoryFilter();
  } else alert('Errore: '+JSON.stringify(res));
}

// ── Reject ──
function openReject(id){
  var a=_allAirdrops.find(function(x){return x.id===id});
  if(!a)return;
  _boTarget=a;
  document.getElementById('reject-title').textContent=a.title;
  document.getElementById('reject-reason').value='rifiutato_generico';
  document.getElementById('reject-note').value='';
  document.getElementById('reject-modal').classList.add('active');
}

async function doReject(){
  if(!_boTarget)return;
  var reason=document.getElementById('reject-reason').value;
  var note=document.getElementById('reject-note').value.trim()||null;
  var btn=document.getElementById('reject-ok');
  btn.disabled=true;
  var token=await getValidToken();
  var args={p_airdrop_id:_boTarget.id,p_status:reason};
  if(note)args.p_rejection_reason=note;
  var res=await sbRpc('manager_update_airdrop',args,token);
  btn.disabled=false;
  if(res&&res.ok){
    closeBoModals();
    showToast('Rifiutato: '+_boTarget.title);
    await loadBoData();
  } else alert('Errore: '+JSON.stringify(res));
}

function closeBoModals(){
  document.getElementById('approve-modal').classList.remove('active');
  document.getElementById('reject-modal').classList.remove('active');
  document.getElementById('edit-modal').classList.remove('active');
  _boTarget=null;
}

// ── Edit Airdrop ──
function openEditAirdrop(id){
  var a=_allAirdrops.find(function(x){return x.id===id});
  if(!a)return;
  _boTarget=a;
  document.getElementById('edit-airdrop-id').value=a.id;
  document.getElementById('edit-title').value=a.title||'';
  document.getElementById('edit-description').value=a.description||'';
  document.getElementById('edit-category').value=a.category||'altro';
  document.getElementById('edit-object-value').value=a.object_value_eur||'';
  document.getElementById('edit-block-price').value=a.block_price_aria||'';
  document.getElementById('edit-total-blocks').value=a.total_blocks||'';
  document.getElementById('edit-presale-price').value=a.presale_block_price||'';
  document.getElementById('edit-status').value=a.status||'draft';
  if(a.deadline){
    var d=new Date(a.deadline);
    var local=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+'T'+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    document.getElementById('edit-deadline').value=local;
  }else{
    document.getElementById('edit-deadline').value='';
  }
  document.getElementById('edit-modal').classList.add('active');
}

async function doEditAirdrop(){
  if(!_boTarget)return;
  var id=document.getElementById('edit-airdrop-id').value;
  if(!id)return;
  var title=document.getElementById('edit-title').value.trim();
  var description=document.getElementById('edit-description').value.trim();
  var category=document.getElementById('edit-category').value;
  var objectValue=parseFloat(document.getElementById('edit-object-value').value)||0;
  var blockPrice=parseInt(document.getElementById('edit-block-price').value)||null;
  var totalBlocks=parseInt(document.getElementById('edit-total-blocks').value)||null;
  var presalePrice=document.getElementById('edit-presale-price').value?parseInt(document.getElementById('edit-presale-price').value):null;
  var status=document.getElementById('edit-status').value;
  var deadlineVal=document.getElementById('edit-deadline').value;
  if(!title){alert('Titolo obbligatorio');return;}
  var btn=document.getElementById('edit-ok');
  btn.disabled=true;
  var token=await getValidToken();
  var args={
    p_airdrop_id:id,
    p_status:status,
    p_title:title,
    p_description:description,
    p_category:category,
    p_object_value_eur:objectValue
  };
  if(blockPrice)args.p_block_price_aria=blockPrice;
  if(totalBlocks)args.p_total_blocks=totalBlocks;
  if(presalePrice)args.p_presale_block_price=presalePrice;
  if(deadlineVal)args.p_deadline=deadlineVal+':00Z';
  var res=await sbRpc('manager_update_airdrop',args,token);
  btn.disabled=false;
  if(res&&res.ok){
    closeBoModals();
    showToast('<span class="it">Airdrop aggiornato</span><span class="en">Airdrop updated</span>');
    await loadBoData();
    await loadAirdrops();renderGrid();renderCatDashboard();renderCategoryFilter();
  }else{
    alert('Errore: '+JSON.stringify(res));
  }
}

// ── Messages & Toast ──
function showMsg(type,html){
  var el=document.getElementById('buy-msg');
  el.innerHTML=html;
  el.className='buy-msg active '+type;
}
function hideMsg(){
  var el=document.getElementById('buy-msg');
  el.className='buy-msg';
  el.innerHTML='';
}

function showToast(html){
  var t=document.getElementById('toast');
  t.innerHTML=html;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
}

// ── Transaction history (ARIA + ROBI) ──
var _txHistoryAll=[];
var _txHistoryFilter='all';

function formatTxDate(iso){
  var d=new Date(iso);
  return d.toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
}

function txReasonLabel(kind,reason){
  var mapAria={
    alphanet_welcome:{it:'Welcome grant Alpha-Net',en:'Alpha-Net welcome grant'},
    faucet:{it:'Faucet giornaliero',en:'Daily faucet'},
    streak_day:{it:'Sequenza giornaliera',en:'Daily streak'},
    daily_checkin:{it:'Check-in',en:'Check-in'},
    video_view:{it:'Video guardato',en:'Video watched'},
    referral_inviter:{it:'Referral (tu hai invitato)',en:'Referral (you invited)'},
    referral_welcome:{it:'Benvenuto referral',en:'Referral welcome'},
    valuation_request:{it:'Richiesta valutazione',en:'Valuation request'},
    block_purchase:{it:'Avanzamento Step',en:'Step advance'},
    refund:{it:'Rimborso',en:'Refund'},
    admin_grant:{it:'Assegnazione admin',en:'Admin grant'},
    admin_adjust:{it:'Admin adjust',en:'Admin adjust'}
  };
  var mapRobi={
    alphanet_welcome:{it:'Welcome grant Alpha-Net',en:'Alpha-Net welcome grant'},
    streak_week:{it:'Sequenza settimanale completa',en:'Weekly streak complete'},
    referral_inviter:{it:'Referral (tu hai invitato)',en:'Referral (you invited)'},
    referral_welcome:{it:'Benvenuto referral',en:'Referral welcome'},
    submission_accepted:{it:'Valutazione accettata',en:'Submission accepted'},
    airdrop_won:{it:'Airdrop vinto',en:'Airdrop won'},
    airdrop_seller:{it:'Airdrop completato (venditore)',en:'Airdrop completed (seller)'},
    block_purchase:{it:'Step acquistati',en:'Steps purchased'}
  };
  var m=kind==='aria'?mapAria:mapRobi;
  var r=m[reason];
  if(!r)return {it:reason||'—',en:reason||'—'};
  return r;
}

async function loadTxHistory(){
  var token=await getValidToken();
  if(!token||!_session||!_session.user)return;
  var userId=_session.user.id;
  var list=document.getElementById('tx-history-list');
  if(!list)return;

  var items=[];
  try{
    var ariaRes=await fetch(SB_URL+'/rest/v1/points_ledger?user_id=eq.'+userId+'&select=id,amount,reason,metadata,created_at&order=created_at.desc&limit=500',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(ariaRes.ok){
      var arr=await ariaRes.json();
      arr.forEach(function(r){
        items.push({kind:'aria',amount:r.amount,reason:r.reason,metadata:r.metadata,created_at:r.created_at,id:r.id});
      });
    }
  }catch(e){}
  try{
    var robiRes=await fetch(SB_URL+'/rest/v1/nft_rewards?user_id=eq.'+userId+'&nft_type=eq.ROBI&select=id,shares,source,name,metadata,created_at&order=created_at.desc&limit=500',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(robiRes.ok){
      var arr2=await robiRes.json();
      arr2.forEach(function(r){
        items.push({kind:'robi',amount:parseFloat(r.shares)||1,reason:r.source||'',name:r.name,metadata:r.metadata,created_at:r.created_at,id:r.id});
      });
    }
  }catch(e){}

  items.sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});
  _txHistoryAll=items;
  renderTxHistory();
}

function renderTxHistory(){
  var list=document.getElementById('tx-history-list');
  var summary=document.getElementById('tx-history-summary');
  if(!list)return;
  var filter=_txHistoryFilter;
  var items=_txHistoryAll.filter(function(i){return filter==='all'||i.kind===filter});
  if(items.length===0){
    list.innerHTML='<div style="color:var(--gray-500);font-size:12px;text-align:center;padding:20px"><span class="it">Nessuna transazione</span><span class="en">No transactions</span></div>';
    if(summary)summary.textContent='';
    return;
  }
  var ariaSum=0,robiSum=0;
  _txHistoryAll.forEach(function(i){
    if(i.kind==='aria')ariaSum+=parseInt(i.amount)||0;
    else robiSum+=parseFloat(i.amount)||0;
  });
  var h='';
  items.forEach(function(i){
    var amt=parseFloat(i.amount)||0;
    var sign=i.kind==='robi'?'+':(amt>=0?'+':'');
    var color=i.kind==='aria'?'var(--aria)':'var(--gold)';
    if(i.kind==='aria'&&amt<0)color='#e46';
    var symbol=i.kind==='aria'?'ARIA':'ROBI';
    var labels=txReasonLabel(i.kind,i.reason);
    var amtDisplay=i.kind==='robi'?(amt%1===0?amt:amt.toFixed(4)):amt.toLocaleString();
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 10px;border-bottom:1px solid var(--gray-800);gap:10px">';
    h+='<div style="flex:1;min-width:0">';
    h+='<div style="font-family:var(--font-b);font-size:13px;color:var(--white);margin-bottom:2px"><span class="it">'+labels.it+'</span><span class="en">'+labels.en+'</span></div>';
    h+='<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-500);letter-spacing:.5px">'+formatTxDate(i.created_at)+'</div>';
    h+='</div>';
    h+='<div style="text-align:right;white-space:nowrap"><span style="font-family:var(--font-m);font-size:13px;color:'+color+';font-weight:600">'+sign+amtDisplay+'</span> <span style="font-family:var(--font-m);font-size:9px;color:'+color+';letter-spacing:1px">'+symbol+'</span></div>';
    h+='</div>';
  });
  list.innerHTML=h;
  if(summary){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    summary.innerHTML=(lang==='it'?'Totale: ':'Total: ')+_txHistoryAll.length+' '+(lang==='it'?'transazioni · ':'transactions · ')+ariaSum.toLocaleString()+' ARIA netti · '+(robiSum%1===0?robiSum:robiSum.toFixed(4))+' ROBI accumulati';
  }
}

function filterTxHistory(f){
  _txHistoryFilter=f;
  document.querySelectorAll('.txh-filter-btn').forEach(function(b){
    var active=b.getAttribute('data-filter')===f;
    b.classList.toggle('txh-active',active);
    if(active){
      b.style.background=f==='aria'?'var(--aria)':(f==='robi'?'var(--gold)':'var(--gold)');
      b.style.color=f==='aria'?'var(--white)':'#000';
    }else{
      b.style.background='transparent';
      var filterType=b.getAttribute('data-filter');
      b.style.color=filterType==='aria'?'var(--aria)':(filterType==='robi'?'var(--gold)':'var(--gray-300)');
    }
  });
  renderTxHistory();
}

// ── Wallet tab ──
async function loadDappWallet(){
  var token=await getValidToken();
  if(!token||!_session||!_session.user)return;
  var userId=_session.user.id;

  // ARIA balance
  var el=document.getElementById('dapp-wcard-aria-amount');
  if(el)el.textContent=_balance.toLocaleString();
  var serial=document.getElementById('dapp-wcard-aria-serial');
  if(serial)serial.textContent=userId.substring(0,8).toUpperCase();

  // Transaction history (ARIA + ROBI dal giorno iscrizione)
  loadTxHistory();

  // NFT rewards
  var cards=[];
  try{
    var res=await fetch(SB_URL+'/rest/v1/nft_rewards?user_id=eq.'+userId+'&select=*',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(res.ok)cards=await res.json();
  }catch(e){}

  // NFT_REWARD con supporto shares frazionari
  var rendCards=cards.filter(function(c){return c.nft_type==='ROBI'||c.nft_type==='NFT_REWARD'||c.nft_type==='NFT_EARN'});
  var totalShares=0;
  for(var i=0;i<rendCards.length;i++){
    totalShares+=parseFloat(rendCards[i].shares)||1;
  }
  var hasRendimento=totalShares>0;

  var wc=document.getElementById('dapp-wcard-rendimento');
  var wl=document.getElementById('dapp-wcard-rendimento-locked');
  if(wc)wc.style.display=hasRendimento?'block':'none';
  if(wl)wl.style.display=hasRendimento?'none':'block';

  if(hasRendimento){
    var cn=document.getElementById('dapp-wcard-rend-count');
    // Mostra quote frazionarie (es. "12.50 quote" o "3 quote")
    if(cn)cn.textContent=totalShares%1===0?totalShares:totalShares.toFixed(4);
    var sn=document.getElementById('dapp-wcard-rend-serial');
    if(sn&&rendCards[0]){
      sn.textContent=rendCards[0].id.split('-')[0].substring(0,5).toUpperCase();
    }
  }

  // Treasury → valore nominale ROBI (da treasury_funds con split %)
  try{
    var snRes=await fetch(SB_URL+'/rest/v1/rpc/get_robi_snapshots_recent',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_limit:1})});
    var unitVal=0;
    if(snRes.ok){var sn=await snRes.json();if(sn&&sn.length)unitVal=parseFloat(sn[0].price_eur)||0;}
    var valEl=document.getElementById('dapp-wcard-rend-value');
    if(valEl){
      if(hasRendimento&&unitVal>0){
        var totalVal=(unitVal*totalShares).toFixed(2);
        valEl.innerHTML='<span style="font-family:var(--font-m);font-size:11px;color:var(--gray-400);letter-spacing:.5px">&euro; '+totalVal+'</span>';
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur').then(function(r){return r.json()}).then(function(d){
          if(d&&d.kaspa&&d.kaspa.eur>0){
            var kasEquiv=(parseFloat(totalVal)/d.kaspa.eur).toFixed(2);
            valEl.innerHTML='<span style="font-family:var(--font-m);font-size:11px;color:var(--gray-400);letter-spacing:.5px">&euro; '+totalVal+' &middot; &asymp; '+kasEquiv+' KAS</span>';
            // Show potential KAS on KAS card
            var kasPot=document.getElementById('dapp-wcard-kas-potential');
            var kasPotVal=document.getElementById('dapp-wcard-kas-potential-val');
            if(kasPot&&kasPotVal){
              kasPot.style.display='inline';
              kasPotVal.innerHTML='&asymp; '+kasEquiv+' KAS';
            }
          }
        }).catch(function(){});
      }else{
        valEl.innerHTML=hasRendimento?'<span style="font-family:var(--font-m);font-size:11px;color:var(--gray-400);letter-spacing:.5px">&euro; 0,00</span>':'<span class="it">Guadagna partecipando</span><span class="en">Earn by participating</span>';
      }
    }
  }catch(e){}

  // Badge collection (NFT non-REWARD, non-VALUATION)
  try{
    var badgeCards=cards.filter(function(c){return c.nft_type!=='ROBI'&&c.nft_type!=='NFT_REWARD'&&c.nft_type!=='NFT_EARN'&&c.nft_type!=='VALUATION'});
    var badgeGrid=document.getElementById('dapp-badge-grid');
    if(badgeGrid&&badgeCards.length>0){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      badgeGrid.innerHTML=badgeCards.map(function(b){
        var label=b.nft_type?b.nft_type.replace(/_/g,' '):'Badge';
        var isAlpha=b.nft_type==='ALPHA_BRAVE';
        var borderColor=isAlpha?'var(--gold)':'var(--gray-700)';
        var glowBg=isAlpha?'radial-gradient(ellipse at center,rgba(239,62,79,.08) 0%,transparent 70%)':'none';
        return '<div style="padding:24px 16px;border:1px solid '+borderColor+';border-radius:var(--radius-sm);text-align:center;background:'+glowBg+';position:relative;overflow:hidden">'+
          (isAlpha?'<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:100px;height:100px;background:radial-gradient(circle,rgba(239,62,79,.12) 0%,transparent 70%);pointer-events:none"></div>':'')+
          '<div style="font-size:36px;margin-bottom:10px;filter:drop-shadow(0 0 8px rgba(239,62,79,.3))'+(isAlpha?'':'')+'">'+(isAlpha?'&#9813;':'&#9734;')+'</div>'+
          '<div style="font-family:var(--font-h);font-size:14px;letter-spacing:2px;color:'+(isAlpha?'var(--gold)':'var(--white)')+';margin-bottom:4px;text-transform:uppercase">'+label+'</div>'+
          (isAlpha?'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:2px;color:rgba(239,62,79,.5);margin-bottom:6px">FOUNDER · TOP 1000</div>':'')+
          '<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-500)">'+new Date(b.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'})+'</div>'+
          '</div>';
      }).join('');
    }
  }catch(e){}

  // Valuation badges
  try{
    var valCards=cards.filter(function(c){return c.nft_type==='VALUATION'});
    // 18 lug (Skeezu): certificati EVALOBI veri col codice univoco EVA-XXXXXX,
    // mostrati PRIMA dei badge di richiesta (che non sono certificati).
    var _certs=[];
    try{
      var certRes=await fetch(SB_URL+'/rest/v1/rpc/get_my_evalobi',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}'});
      if(certRes.ok)_certs=await certRes.json()||[];
    }catch(e){}
    // 20 lug (Skeezu): l'EVALOBI è una cosa a sé — se per un oggetto esiste già il
    // certificato, la card della richiesta di valutazione è un doppione e sparisce.
    var _certTitles={};
    (_certs||[]).forEach(function(c){if(c.object_title)_certTitles[String(c.object_title).toLowerCase().trim()]=1;});
    valCards=valCards.filter(function(v){var m=v.metadata||{};var t=String(m.title||v.name||'').toLowerCase().trim();return !t||!_certTitles[t];});
    var _certHtml=(_certs||[]).map(function(c){
      var oc=c.evaluation_outcome==='GO'?{t:'Approvato',col:'var(--kas)'}:c.evaluation_outcome==='NO_GO'?{t:'Non idoneo',col:'#ef4444'}:{t:'Da rivedere',col:'#f0a030'};
      var cDate=c.evaluated_at?new Date(c.evaluated_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}):'';
      return '<a href="/evalobi/'+c.token_id+'" target="_blank" style="text-decoration:none;border:1px solid var(--gold);border-radius:var(--radius-sm);overflow:hidden;display:block;background:rgba(239,62,79,.04)">'
        +'<div style="padding:12px">'
        +'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:2px;color:var(--gold);margin-bottom:6px">CERTIFICATO EVALOBI</div>'
        +'<div style="font-family:var(--font-m);font-size:14px;letter-spacing:2px;color:var(--gold);font-weight:700;margin-bottom:4px">'+escHtml(c.cert_code||('#'+c.token_id))+'</div>'
        +'<div style="font-family:var(--font-h);font-size:13px;color:var(--white);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escHtml(c.object_title||'')+'</div>'
        +(c.airdrop_code?'<div style="font-family:var(--font-m);font-size:9px;color:var(--gray-400);margin-bottom:6px">airdrop #'+escHtml(c.airdrop_code)+'</div>':'')
        +'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1px;padding:3px 8px;display:inline-block;color:'+oc.col+';border:1px solid '+oc.col+'44">'+oc.t+(cDate?' · '+cDate:'')+'</div>'
        +'</div></a>';
    }).join('');
    var valGrid=document.getElementById('dapp-valuation-grid');
    if(valGrid&&_certHtml&&valCards.length===0){valGrid.innerHTML=_certHtml;}
    if(valGrid&&valCards.length>0){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      var statusLabels={
        'in_valutazione':{it:'In valutazione',en:'Under review',color:'#f0a030'},
        'presale':{it:'Presale',en:'Presale',color:'var(--aria)'},
        'sale':{it:'In vendita',en:'On sale',color:'var(--kas)'},
        'dropped':{it:'Assegnato',en:'Assigned',color:'var(--kas)'},
        'completed':{it:'Completato',en:'Completed',color:'var(--kas)'},
        'rifiutato_min500':{it:'Rifiutato',en:'Rejected',color:'#ef4444'},
        'rifiutato_generico':{it:'Rifiutato',en:'Rejected',color:'#ef4444'},
        'closed':{it:'Chiuso',en:'Closed',color:'var(--gray-400)'}
      };
      valGrid.innerHTML=_certHtml+valCards.map(function(v,i){
        var m=v.metadata||{};
        var st=m.status||'in_valutazione';
        var sl=statusLabels[st]||{it:st,en:st,color:'var(--gray-400)'};
        var title=m.title||v.name||'—';
        var cat=m.category||'';
        var imgUrl=m.image_url||'';
        var date=new Date(v.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
        var imgHtml=imgUrl
          ?'<img src="'+imgUrl+'" style="width:100%;height:80px;object-fit:cover;border-bottom:1px solid var(--gray-700)" loading="lazy">'
          :'<div style="height:80px;display:flex;align-items:center;justify-content:center;background:var(--gray-900);border-bottom:1px solid var(--gray-700)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div>';
        return '<div style="border:1px solid var(--gray-700);border-radius:var(--radius-sm);overflow:hidden;cursor:pointer;transition:border-color .2s" onclick="showValuationDetail('+i+')" onmouseover="this.style.borderColor=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\'">'
          +imgHtml
          +'<div style="padding:12px">'
          +'<div style="font-family:var(--font-h);font-size:14px;color:var(--white);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escHtml(title)+'</div>'
          +'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gray-500);margin-bottom:8px;text-transform:uppercase">'+cat+' · '+date+'</div>'
          +'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1px;padding:3px 8px;display:inline-block;background:'+sl.color+'22;color:'+sl.color+';border:1px solid '+sl.color+'44">'+(lang==='it'?sl.it:sl.en)+'</div>'
          +'</div></div>';
      }).join('');
      // Store for detail modal
      window._valCards=valCards;
    }
  }catch(e){}

  // Category alerts + ROBI history + Wishlist + gestione notifiche
  renderCategoryAlertsUI(token);
  loadRobiHistory(token);
  loadWishlistAlerts();
  renderNotifPrefsUI();
}

// ── COSA FARE OGGI (19 lug · Skeezu): 3 imprese, giornata completa = +1000 ARIA ──
async function renderDailyQuests(){
  var box=document.getElementById('daily-quests');
  if(!box)return;
  if(!_session){box.style.display='none';return;}
  document.body.classList.add('logged');
  // Installa APP: azione permanente nel menu utente (il banner una-tantum poteva essere chiuso)
  var um=document.getElementById('um-install');
  if(um){
    var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
    um.style.display=standalone?'none':'block';
  }
  try{
    var token=await getValidToken();if(!token)return;
    var q=await sbRpc('get_my_daily_quests',{},token);
    if(!q||!q.ok)return;
    box.style.display='';
    function setQ(id,done){
      var el=document.getElementById(id);if(!el)return;
      el.classList.toggle('done',!!done);
      el.disabled=!!done;
      var t=el.querySelector('.dq-tick');
      if(t)t.innerHTML=done?'&#10003;':'&#9675;';
    }
    setQ('dq-faucet',q.faucet);
    setQ('dq-checkin',q.checkin);
    setQ('dq-valuation',q.valuation);
    setQ('dq-steps',q.steps);
    setQ('dq-steps-one',q.steps_one);
    var c=document.getElementById('dq-steps-count');
    if(c)c.textContent=q.steps?'':('('+(q.steps_done||0)+'/5)');
    var c1=document.getElementById('dq-steps-one-count');
    if(c1)c1.textContent=q.steps_one?'':('('+(q.steps_one_done||0)+'/10)');
    var dn=document.getElementById('dq-done');
    if(dn)dn.style.display=q.granted?'block':'none';
  }catch(e){}
}
function dappInstallApp(){
  if(window._pwaDeferred){
    window._pwaDeferred.prompt();
    window._pwaDeferred.userChoice.then(function(){window._pwaDeferred=null;});
  }else if(/iphone|ipad|ipod/i.test(navigator.userAgent)){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    alert(lang==='it'?'Su iPhone: tocca Condividi (⬆) e poi «Aggiungi a schermata Home».':'On iPhone: tap Share (⬆) then "Add to Home Screen".');
  }else{
    var l2=document.documentElement.getAttribute('data-lang')||'it';
    alert(l2==='it'?'Dal menu del browser scegli «Installa app».':'From the browser menu choose "Install app".');
  }
}

// ── Gestione notifiche (censimento 18 lug): di sistema obbligatorie, le altre spegnibili ──
async function renderNotifPrefsUI(){
  var el=document.getElementById('notif-prefs-list');
  if(!el||!_session)return;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  try{
    var token=await getValidToken();if(!token)return;
    var rows=await sbRpc('get_my_notification_settings',{},token)||[];
    var conf=rows.filter(function(r){return !r.is_system});
    var sys=rows.filter(function(r){return r.is_system});
    var h=conf.map(function(r){
      return '<label style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-800);cursor:pointer">'
        +'<span style="color:var(--white)">'+escHtml(r.event_label)+'</span>'
        +'<input type="checkbox" '+(r.enabled_user?'checked':'')+' onchange="toggleNotifPref(\''+r.key+'\',this.checked)" style="accent-color:var(--gold);width:16px;height:16px">'
        +'</label>';
    }).join('');
    h+='<div style="font-size:11px;color:var(--gray-500);padding-top:10px">'
      +(lang==='it'?'Sempre attive (di sistema): ':'Always on (system): ')
      +escHtml(sys.map(function(r){return r.event_label}).join(' · '))
      +'</div>';
    el.innerHTML=h;
    var pr=document.getElementById('notif-push-row');
    if(pr&&('Notification' in window)&&Notification.permission==='granted'){
      pr.innerHTML='<div style="font-size:12px;color:var(--kas)">&#10003; <span class="it">Notifiche attive su questo dispositivo</span><span class="en">Notifications active on this device</span></div>';
    }
  }catch(e){el.textContent='—';}
}
async function toggleNotifPref(key,en){
  try{
    var token=await getValidToken();if(!token)return;
    await sbRpc('set_notification_pref',{p_key:key,p_enabled:en},token);
    showToast('<span class="it">Preferenza salvata</span><span class="en">Preference saved</span>');
  }catch(e){}
}

async function renderCategoryAlertsUI(token){
  var grid=document.getElementById('category-alerts-grid');
  if(!grid)return;
  var cats=await sbGet('categories?is_active=eq.true&order=sort_order',token)||[];
  var alerts=await loadCategoryAlerts();
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  grid.innerHTML=cats.map(function(c){
    var checked=alerts.indexOf(c.slug)!==-1;
    return '<label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid '+(checked?'rgba(239,62,79,.3)':'var(--gray-700)')+';background:'+(checked?'rgba(239,62,79,.04)':'transparent')+';cursor:pointer;font-size:12px;color:var(--white);transition:all .2s">'
      +'<input type="checkbox" data-slug="'+c.slug+'" '+(checked?'checked':'')+' style="accent-color:var(--gold);width:14px;height:14px">'
      +(c.icon?'<span>'+c.icon+'</span>':'')
      +'<span>'+(lang==='it'?c.name_it:c.name_en)+'</span>'
      +'</label>';
  }).join('');
}

// ── Valuation detail modal ──
function showValuationDetail(idx){
  var v=(window._valCards||[])[idx];
  if(!v)return;
  var m=v.metadata||{};
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var statusLabels={
    'in_valutazione':{it:'In valutazione',en:'Under review',color:'#f0a030'},
    'presale':{it:'Presale',en:'Presale',color:'var(--aria)'},
    'sale':{it:'In vendita',en:'On sale',color:'var(--kas)'},
    'dropped':{it:'Assegnato',en:'Assigned',color:'var(--kas)'},
    'completed':{it:'Completato',en:'Completed',color:'var(--kas)'},
    'rifiutato_min500':{it:'Rifiutato (min €500)',en:'Rejected (min €500)',color:'#ef4444'},
    'rifiutato_generico':{it:'Rifiutato',en:'Rejected',color:'#ef4444'},
    'closed':{it:'Chiuso',en:'Closed',color:'var(--gray-400)'}
  };
  var st=m.status||'in_valutazione';
  var sl=statusLabels[st]||{it:st,en:st,color:'var(--gray-400)'};
  var date=new Date(v.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});
  var imgUrl=m.image_url||'';
  var imgs=m.image_urls||[];
  var objVal=parseFloat(m.object_value_eur)||0;
  var desired=parseFloat(m.seller_desired_price)||0;
  var minPrice=parseFloat(m.seller_min_price)||0;

  var h='';
  // Image
  if(imgUrl)h+='<img src="'+imgUrl+'" style="width:100%;max-height:200px;object-fit:cover;border:1px solid var(--gray-700);margin-bottom:16px" loading="lazy">';
  // Title
  h+='<h3 style="font-family:var(--font-h);font-size:22px;font-weight:300;color:var(--white);margin-bottom:8px">'+escHtml(m.title||v.name||'')+'</h3>';
  // Status badge
  h+='<div style="margin-bottom:16px"><span style="font-family:var(--font-m);font-size:9px;letter-spacing:1px;padding:3px 10px;background:'+sl.color+'22;color:'+sl.color+';border:1px solid '+sl.color+'44">'+(lang==='it'?sl.it:sl.en)+'</span></div>';
  // Details grid
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
  h+='<div style="padding:10px;border:1px solid var(--gray-700)"><div style="font-family:var(--font-m);font-size:9px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">'+(lang==='it'?'Categoria':'Category')+'</div><div style="font-size:13px;color:var(--white)">'+(m.category||'—')+'</div></div>';
  h+='<div style="padding:10px;border:1px solid var(--gray-700)"><div style="font-family:var(--font-m);font-size:9px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">'+(lang==='it'?'Data':'Date')+'</div><div style="font-size:13px;color:var(--white)">'+date+'</div></div>';
  h+='<div style="padding:10px;border:1px solid var(--gray-700)"><div style="font-family:var(--font-m);font-size:9px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">'+(lang==='it'?'Prezzo desiderato':'Desired price')+'</div><div style="font-size:13px;color:var(--white)">€'+desired.toFixed(2)+'</div></div>';
  h+='<div style="padding:10px;border:1px solid var(--gray-700)"><div style="font-family:var(--font-m);font-size:9px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">'+(lang==='it'?'Prezzo minimo':'Min price')+'</div><div style="font-size:13px;color:var(--white)">€'+minPrice.toFixed(2)+'</div></div>';
  h+='</div>';
  // Quotation (if evaluated)
  if(objVal>0){
    h+='<div style="padding:12px;border:1px solid var(--gold);background:rgba(239,62,79,.04);margin-bottom:16px;text-align:center">';
    h+='<div style="font-family:var(--font-m);font-size:9px;letter-spacing:2px;color:var(--gold);margin-bottom:4px">'+(lang==='it'?'QUOTAZIONE AIROOBI':'AIROOBI QUOTATION')+'</div>';
    h+='<div style="font-family:var(--font-h);font-size:28px;color:var(--gold)">€'+objVal.toFixed(2)+'</div>';
    h+='</div>';
  }
  // Description
  if(m.description){
    h+='<div style="font-size:13px;color:var(--gray-400);line-height:1.6;margin-bottom:16px">'+escHtml(m.description)+'</div>';
  }
  // Rejection reason
  if(m.rejection_reason){
    h+='<div style="padding:10px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.06);font-size:12px;color:#f87171;margin-bottom:16px">';
    h+='<strong>'+(lang==='it'?'Motivo rifiuto:':'Rejection reason:')+'</strong> '+escHtml(m.rejection_reason);
    h+='</div>';
  }
  // Extra photos
  if(imgs.length>1){
    h+='<div style="display:flex;gap:8px;overflow-x:auto;margin-bottom:16px">';
    imgs.forEach(function(url){
      h+='<img src="'+url+'" style="width:80px;height:80px;object-fit:cover;border:1px solid var(--gray-700);flex-shrink:0" loading="lazy">';
    });
    h+='</div>';
  }
  // Badge info
  h+='<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-600);text-align:center;letter-spacing:1px;margin-top:8px">BADGE #'+(idx+1)+' · VALUATION · '+(v.airdrop_id?v.airdrop_id.substring(0,8):'—')+'</div>';

  document.getElementById('valuation-modal-content').innerHTML=h;
  document.getElementById('valuation-modal-bg').classList.add('active');
}
function closeValuationModal(e){
  if(e&&e.target!==e.currentTarget)return;
  document.getElementById('valuation-modal-bg').classList.remove('active');
}

async function saveAlertPreferences(){
  var checks=document.querySelectorAll('#category-alerts-grid input[type=checkbox]');
  var slugs=[];
  checks.forEach(function(c){if(c.checked)slugs.push(c.dataset.slug)});
  await saveCategoryAlerts(slugs);
}

// ── ROBI History + Sparkline ──
async function loadRobiHistory(token){
  try{
    var res=await sbRpc('get_robi_history',{},token);
    if(!res||!res.items)return;
    var items=res.items;
    var unitVal=res.unit_value_eur||0;

    // Sparkline
    var canvas=document.getElementById('robi-sparkline');
    if(canvas&&items.length===0){
      canvas.style.display='none';
    }
    if(canvas&&items.length>0){
      canvas.style.display='';
      var ctx=canvas.getContext('2d');
      var dpr=window.devicePixelRatio||1;
      var w=canvas.offsetWidth;var h=120;
      canvas.width=w*dpr;canvas.height=h*dpr;
      ctx.scale(dpr,dpr);

      // Padding per assi (sinistra Y labels, basso X labels)
      var pL=46, pR=8, pT=10, pB=22;
      var plotW=w-pL-pR, plotH=h-pT-pB;

      // Ordina cronologicamente + calcola cumulativo
      var sorted=items.slice().reverse();
      var cum=0; var pts=[];
      sorted.forEach(function(it){
        cum+=parseFloat(it.shares)||0;
        pts.push({val:cum, at:it.date});
      });
      // Estendi sempre la linea fino a oggi: il saldo ROBI resta costante
      // finché non arriva un nuovo evento. Senza questo, con 1 solo evento
      // la linea resterebbe su 1 punto e l'area sotto diventerebbe diagonale.
      var todayISO=new Date().toISOString();
      if(pts.length>0){
        var lastAt=pts[pts.length-1].at;
        if(new Date(lastAt).toISOString().slice(0,10)!==todayISO.slice(0,10)){
          pts.push({val:cum, at:todayISO});
        }else if(pts.length===1){
          // L'unico evento è oggi: aggiungi un punto d'inizio a sinistra (anche se coincide)
          pts.unshift({val:cum, at:lastAt});
        }
      }
      var max=Math.max.apply(null,pts.map(function(p){return p.val}))||1;
      // Scala Y arrotondata ai 5/10/50/100 per labels pulite
      function niceScale(v){
        var e=Math.pow(10,Math.floor(Math.log10(Math.max(1,v))));
        var n=v/e;
        if(n<=1)n=1;else if(n<=2)n=2;else if(n<=5)n=5;else n=10;
        return n*e;
      }
      var yMax=niceScale(max);

      // Grid + asse Y
      ctx.font='9px DM Mono, monospace';
      ctx.fillStyle='rgba(136,146,174,.7)';
      ctx.textAlign='right';
      ctx.textBaseline='middle';
      var yTicks=4;
      ctx.strokeStyle='rgba(255,255,255,.04)';
      ctx.lineWidth=1;
      for(var i=0;i<=yTicks;i++){
        var yVal=(yMax*i/yTicks);
        var yPx=pT+plotH-(yVal/yMax)*plotH;
        ctx.fillText(yVal.toFixed(yMax<5?2:yMax<20?1:0),pL-6,yPx);
        ctx.beginPath();ctx.moveTo(pL,yPx);ctx.lineTo(w-pR,yPx);ctx.stroke();
      }
      // Label asse Y
      ctx.save();
      ctx.translate(10,pT+plotH/2);
      ctx.rotate(-Math.PI/2);
      ctx.textAlign='center';
      ctx.fillStyle='rgba(239,62,79,.8)';
      ctx.fillText('ROBI',0,0);
      ctx.restore();

      // Asse X: label start/end (ed eventualmente midpoint)
      ctx.textBaseline='top';
      ctx.fillStyle='rgba(136,146,174,.7)';
      function fmtD(iso){var d=new Date(iso);return (d.getDate()+'/'+(d.getMonth()+1));}
      if(pts.length>=1){
        ctx.textAlign='left';
        ctx.fillText(fmtD(pts[0].at),pL,h-pB+5);
        if(pts.length>=3){
          var midIdx=Math.floor(pts.length/2);
          ctx.textAlign='center';
          ctx.fillText(fmtD(pts[midIdx].at),pL+plotW/2,h-pB+5);
        }
        ctx.textAlign='right';
        ctx.fillText(fmtD(pts[pts.length-1].at),w-pR,h-pB+5);
      }

      // Linea ROBI cumulativa
      ctx.strokeStyle='#EF3E4F';ctx.lineWidth=2;ctx.beginPath();
      pts.forEach(function(p,i){
        var x=pL+(i/(pts.length-1||1))*plotW;
        var y=pT+plotH-(p.val/yMax)*plotH;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();

      // Area sotto la linea
      ctx.lineTo(pL+plotW,pT+plotH);
      ctx.lineTo(pL,pT+plotH);
      ctx.closePath();
      ctx.fillStyle='rgba(239,62,79,.12)';
      ctx.fill();

      // Puntini sui dati
      ctx.fillStyle='#EF3E4F';
      pts.forEach(function(p,i){
        var x=pL+(i/(pts.length-1||1))*plotW;
        var y=pT+plotH-(p.val/yMax)*plotH;
        ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
      });
    }
    var valEl=document.getElementById('robi-sparkline-val');
    if(valEl){
      var totalShares=0;items.forEach(function(it){totalShares+=parseFloat(it.shares)||0;});
      valEl.textContent=totalShares%1===0?totalShares+' ROBI':totalShares.toFixed(4)+' ROBI';
    }

    // History list
    var list=document.getElementById('robi-history-list');
    if(list){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      if(items.length===0){
        list.innerHTML='<div style="color:var(--gray-500);font-size:11px;text-align:center;padding:12px">'+(lang==='it'?'Nessun ROBI ancora':'No ROBI yet')+'</div>';
      }else{
        list.innerHTML=items.map(function(it){
          var d=new Date(it.date).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
          var shares=parseFloat(it.shares)||0;
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-800);font-size:12px">'
            +'<div><span style="color:var(--gold);font-family:var(--font-m);font-weight:600">'+(shares%1===0?shares:shares.toFixed(4))+'</span> ROBI'
            +'<div style="font-size:10px;color:var(--gray-500);margin-top:2px">'+(it.airdrop_title||it.source||'—')+' · '+d+'</div></div>'
            +'<div style="text-align:right;font-family:var(--font-m);font-size:11px;color:var(--gray-400)">€'+parseFloat(it.value_eur||0).toFixed(4)+'</div>'
            +'</div>';
        }).join('');
      }
    }
  }catch(e){}
}

// ── Activity Feed ──
var _feedInterval=null;
async function loadActivityFeed(){
  try{
    var token=await getValidToken();if(!token)return;
    var data=await sbRpc('get_activity_feed',{},token);
    var el=document.getElementById('activity-feed');if(!el)return;
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    if(!data||!Array.isArray(data)||data.length===0){
      el.innerHTML='<div style="color:var(--gray-500);font-size:12px;text-align:center;padding:16px">'+(lang==='it'?'Nessuna attività recente':'No recent activity')+'</div>';
      return;
    }
    // Icone flat currentColor (regola: mai emoji colorate)
    var _fi='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px">';
    var icons={
      purchase:_fi+'<path d="M6 20l4-6 4 3 4-8"/></svg>',
      new_airdrop:_fi+'<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
      activity:_fi+'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
      robi:_fi+'<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>'
    };
    el.innerHTML=data.slice(0,6).map(function(item){
      var text=lang==='it'?(item.text_it||item.text_en):(item.text_en||item.text_it);
      var time=item.time?new Date(item.time).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'';
      // GS-5 reopen: feed è SEMPRE in tab-home (dapp.html:489), target (#list-view/#detail) in tab-explore.
      // Fix: navigateTo('explore') PRIMA, poi filterCat/openDetail. showPage è sincrono, no setTimeout.
      var clickAttr='';
      var cursor='default';
      var hoverCol='var(--gray-300)';
      if(item.type==='new_airdrop' && item.category){
        clickAttr='onclick="navigateTo(\'explore\');filterCat(\''+String(item.category).replace(/\'/g,"\\'")+'\')"';
        cursor='pointer';
        hoverCol='var(--gold)';
      }else if((item.type==='purchase'||item.type==='activity') && item.airdrop_id){
        // GS-5 follow-up bundle (ROBY_SignOff_GS5 §5): URL canonico /dapp/airdrop/:id per share/refresh
        var safeId=String(item.airdrop_id).replace(/\'/g,"\\'");
        clickAttr='onclick="navigateTo(\'explore\');openDetail(\''+safeId+'\');history.replaceState({page:\'explore\',detail:\''+safeId+'\'},null,\'/dapp/airdrop/\'+\''+safeId+'\')"';
        cursor='pointer';
        hoverCol='var(--gold)';
      }
      return '<div '+clickAttr+' style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--gray-800);font-size:12px;color:var(--gray-300);line-height:1.4;cursor:'+cursor+';transition:border-color .2s,color .2s"'
        +(clickAttr?' onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\''+hoverCol+'\'" onmouseout="this.style.borderColor=\'var(--gray-800)\';this.style.color=\'var(--gray-300)\'"':'')
        +'>'
        +'<span style="font-size:14px;flex-shrink:0">'+(icons[item.type]||'·')+'</span>'
        +'<span style="flex:1">'+escHtml(text)+'</span>'
        +'<span style="font-family:var(--font-m);font-size:9px;color:var(--gray-500);flex-shrink:0">'+time+'</span>'
        +'</div>';
    }).join('');
  }catch(e){}
}

function startFeedPolling(){
  loadActivityFeed();
  if(_feedInterval)clearInterval(_feedInterval);
  _feedInterval=setInterval(loadActivityFeed,60000);
}

// ── Auto-Buy ──
async function loadAutoBuyRule(airdropId){
  if(!_session)return null;
  var token=await getValidToken();if(!token)return null;
  var rows=await sbGet('auto_buy_rules?user_id=eq.'+_session.user.id+'&airdrop_id=eq.'+airdropId+'&select=*',token);
  return(rows&&rows[0])||null;
}

async function toggleAutoBuy(airdropId){
  var token=await getValidToken();if(!token)return;
  var existing=await loadAutoBuyRule(airdropId);
  if(existing&&existing.active){
    await sbRpc('disable_auto_buy',{p_airdrop_id:airdropId},token);
    showToast('<span class="it">Auto-buy disattivato</span><span class="en">Auto-buy disabled</span>');
  }else{
    var qty=parseInt(document.getElementById('ab-qty')?document.getElementById('ab-qty').value:1)||1;
    var interval=parseFloat(document.getElementById('ab-interval')?document.getElementById('ab-interval').value:4)||4;
    var max=parseInt(document.getElementById('ab-max')?document.getElementById('ab-max').value:50)||50;
    await sbRpc('upsert_auto_buy',{p_airdrop_id:airdropId,p_blocks_per_interval:qty,p_interval_hours:interval,p_max_blocks:max,p_active:true},token);
    showToast('<span class="it">Auto-buy attivato!</span><span class="en">Auto-buy activated!</span>');
  }
  if(_currentDetail)openDetail(_currentDetail.id);
}

// ── Wishlist Avanzata ──
async function saveWishlistAlert(){
  var kw=document.getElementById('wishlist-keywords');
  var mp=document.getElementById('wishlist-max-price');
  var keywords=(kw&&kw.value.trim())||null;
  var maxPrice=(mp&&parseInt(mp.value))||null;
  if(!keywords&&!maxPrice){showToast('<span class="it">Inserisci almeno un criterio</span><span class="en">Enter at least one criterion</span>');return;}
  var token=await getValidToken();if(!token)return;
  await sbRpc('upsert_wishlist_alert',{p_keywords:keywords,p_max_block_price:maxPrice},token);
  if(kw)kw.value='';if(mp)mp.value='';
  showToast('<span class="it">Alert aggiunto!</span><span class="en">Alert added!</span>');
  loadWishlistAlerts();
}

async function loadWishlistAlerts(){
  if(!_session)return;
  var token=await getValidToken();if(!token)return;
  var rows=await sbGet('wishlist_alerts?user_id=eq.'+_session.user.id+'&active=eq.true&order=created_at.desc',token);
  var el=document.getElementById('wishlist-alerts-list');if(!el)return;
  if(!rows||rows.length===0){el.innerHTML='';return;}
  el.innerHTML=rows.map(function(r){
    var desc=[];
    if(r.keywords)desc.push('🔍 '+r.keywords);
    if(r.max_block_price)desc.push('≤ '+r.max_block_price+' ARIA');
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border:1px solid var(--gray-800);margin-bottom:4px;font-size:12px">'
      +'<span style="color:var(--gray-300)">'+desc.join(' · ')+'</span>'
      +'<button onclick="deleteWishlistAlert(\''+r.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px">✕</button>'
      +'</div>';
  }).join('');
}

async function deleteWishlistAlert(id){
  var token=await getValidToken();if(!token)return;
  await sbRpc('delete_wishlist_alert',{p_id:id},token);
  loadWishlistAlerts();
}

// ── Battito valutazioni (17 lug 2026) ──
// footer.js carica get_public_counters e chiama questo hook: quante (mai quali)
// valutazioni in corso — sono i futuri airdrop. Punti UI: banner Esplora,
// pagina Fai valutare, empty-state (via _pubCounters), footer (in footer.js).
window._onPubCounters=function(c){
  try{
    var n=c&&c.valutazioni_in_corso;
    if(!n)return;
    var it='In questo momento '+(n===1?'1 oggetto è':n+' oggetti sono')+' in valutazione: sono i prossimi airdrop.';
    var en='Right now '+(n===1?'1 item is':n+' items are')+' under evaluation: the next airdrops.';
    var b=document.getElementById('banner-vals');
    if(b){b.innerHTML='<span class="it">'+it+'</span><span class="en">'+en+'</span>';b.style.display='block';}
    var p=document.getElementById('proponi-vals');
    if(p){p.innerHTML='<span class="it">&#9203; '+it+' Il tuo pu&ograve; essere il prossimo.</span><span class="en">&#9203; '+en+' Yours can be next.</span>';p.style.display='block';}
  }catch(e){}
};

// ── Archive tab ──
// 16 lug 2026: il codice parlante è la chiave del passato — se la ricerca in
// Esplora non trova attivi, si guarda nell'archivio (nessuna sezione nuova).
var _archCache=null;
async function searchArchiveByQuery(q,subEl){
  try{
    if(!_archCache){
      var res=await fetch(SB_URL+'/rest/v1/rpc/get_completed_airdrops',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:'{}'});
      _archCache=await res.json()||[];
    }
    var qq=q.toLowerCase().replace(/^#/,'');
    var hit=(_archCache||[]).find(function(a){return (a.code||'').toLowerCase().indexOf(qq)>-1||(a.title||'').toLowerCase().indexOf(qq)>-1});
    if(!hit||!subEl||!subEl.isConnected)return;
    if(_searchQuery.toLowerCase().replace(/^#/,'')!==qq)return; // query cambiata nel frattempo
    var note=document.createElement('div');
    note.style.cssText='margin-top:14px;font-size:13px';
    note.innerHTML='<span class="it">Però c\'è nell\'archivio: </span><span class="en">But it\'s in the archive: </span><a style="color:var(--accent,#e05252);cursor:pointer;text-decoration:underline" onclick="navigateTo(\'my\');setTimeout(function(){if(typeof switchMyTab===\'function\')switchMyTab(\'archive\');},400)"><b>'+escHtml(hit.title)+'</b>'+(hit.code?' #'+escHtml(hit.code):'')+'</a>';
    subEl.appendChild(note);
  }catch(e){}
}
var ARCH_CAT_LABELS={mobile:'Mobile / Tech',tech:'Tech / Strumenti',luxury:'Luxury / 2 Ruote',ultra_luxury:'Ultra Luxury'};
var _archiveLoaded=false;
async function loadDappArchive(){
  if(_archiveLoaded)return;
  var grid=document.getElementById('archive-grid');
  if(!grid)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_completed_airdrops',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
      body:'{}'
    });
    var data=await res.json();
    var isIt=document.documentElement.lang!=='en';
    if(!data||!data.length){
      grid.innerHTML='<div class="past-empty">'+(isIt?'Nessun airdrop completato ancora. Il primo è in arrivo!':'No completed airdrops yet. The first one is coming!')+'</div>';
      _archiveLoaded=true;
      return;
    }
    var esc=function(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):''};
    var html='';
    data.forEach(function(a){
      var catLabel=ARCH_CAT_LABELS[a.category]||a.category||'—';
      var imgSrc=a.image_url||'';
      var imgHtml=imgSrc?'<img class="past-card-img" src="'+esc(imgSrc)+'" alt="'+esc(a.title)+'" loading="lazy">':'<div class="past-card-img" style="display:flex;align-items:center;justify-content:center;color:var(--gray-600);font-family:var(--font-m);font-size:11px;letter-spacing:1.5px">'+(isIt?'NESSUNA IMMAGINE':'NO IMAGE')+'</div>';
      var drawDate=a.draw_executed_at?new Date(a.draw_executed_at).toLocaleDateString(isIt?'it-IT':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
      var winnerId=a.winner_public_id?a.winner_public_id.substring(0,8)+'...':'—';
      html+='<div class="past-card">';
      html+=imgHtml;
      html+='<div class="past-card-body">';
      html+='<div class="past-card-cat">'+esc(catLabel)+(a.code?' <span style="font-family:var(--font-m);font-size:9px;letter-spacing:1px;color:var(--gray-500)">#'+esc(a.code)+'</span>':'')+'</div>';
      html+='<div class="past-card-title">'+esc(a.title)+'</div>';
      html+='<div class="past-card-stats">';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">'+(isIt?'PARTECIPANTI':'PARTICIPANTS')+'</span><span class="past-card-stat-value">'+((a.partecipanti||0).toLocaleString())+'</span></div>';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">STEP</span><span class="past-card-stat-value">'+(a.blocks_sold||0)+'/'+(a.total_blocks||0)+'</span></div>';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">'+(isIt?'VALORE RACCOLTO':'VALUE RAISED')+'</span><span class="past-card-stat-value" style="color:var(--kas)">&euro;'+parseFloat(a.eur_raccolti||0).toFixed(2)+'</span></div>';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">DRAW</span><span class="past-card-stat-value">'+drawDate+'</span></div>';
      html+='</div>';
      if(winnerId!=='—'){
        html+='<div class="past-card-winner"><div class="past-card-winner-dot"></div><span class="past-card-winner-id">'+(isIt?'Ottenuto da ':'Got by ')+esc(winnerId)+'</span></div>';
      }
      html+='</div></div>';
    });
    grid.innerHTML=html;
    _archiveLoaded=true;
  }catch(e){
    console.error('loadDappArchive:',e);
    grid.innerHTML='<div class="past-empty">Errore caricamento</div>';
  }
}

// ══════════════════════════════════════════════════════════
//  SPLASH TOUR
// ══════════════════════════════════════════════════════════
var _splashStep=0;
var _splashTotal=5;

function showSplash(){
  var el=document.getElementById('splash-tour');
  if(!el)return;
  el.style.display='block';
  _splashStep=0;
  renderSplashStep();
}

function splashNav(dir){
  _splashStep+=dir;
  if(_splashStep>=_splashTotal){
    closeSplash();
    return;
  }
  if(_splashStep<0)_splashStep=0;
  renderSplashStep();
}

function renderSplashStep(){
  var slides=document.querySelectorAll('.splash-slide');
  slides.forEach(function(s){s.style.display='none'});
  var cur=document.querySelector('.splash-slide[data-step="'+_splashStep+'"]');
  if(cur)cur.style.display='block';
  // Dots
  var dots=document.getElementById('splash-dots');
  if(dots){
    var html='';
    for(var i=0;i<_splashTotal;i++){
      html+='<div style="width:8px;height:8px;border-radius:50%;background:'+(i===_splashStep?'var(--gold)':'var(--gray-700)')+'"></div>';
    }
    dots.innerHTML=html;
  }
  // Buttons
  var prev=document.getElementById('splash-prev');
  var next=document.getElementById('splash-next');
  if(prev)prev.style.display=_splashStep>0?'inline-block':'none';
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(next){
    if(_splashStep===_splashTotal-1){
      next.innerHTML=lang==='it'?'INIZIA →':'START →';
    }else{
      next.innerHTML=lang==='it'?'AVANTI →':'NEXT →';
    }
  }
  // Show dismiss only on last step
  var dw=document.getElementById('splash-dismiss-wrap');
  if(dw)dw.style.display=_splashStep===_splashTotal-1?'flex':'none';
}

function closeSplash(){
  var el=document.getElementById('splash-tour');
  if(el)el.style.display='none';
  var check=document.getElementById('splash-dismiss-check');
  if(check&&check.checked){
    localStorage.setItem('airoobi_splash_done','1');
  }
}

// Reopen splash from Learn
function reopenSplash(){
  localStorage.removeItem('airoobi_splash_done');
  showSplash();
}

// ══════════════════════════════════════════════════════════
//  INFO TOOLTIPS
// ══════════════════════════════════════════════════════════
var INFO_TIPS={
  'aria-balance':{
    it:'Il tuo saldo ARIA. In fase testnet non si acquistano: li guadagni gratis dal faucet (100/gg) e dal check-in (50/gg) e li usi per avanzare di Step. Al mainnet si compreranno e i saldi testnet saranno azzerati: usali per correre — ciò che resta tuo sono i ROBI.',
    en:'Your ARIA balance. In testnet you can\'t buy them: earn them free from the faucet (100/day) and check-in (50/day) and use them to advance Steps. At mainnet they\'ll be purchasable and testnet balances will reset: use them to run — what stays yours are the ROBI.'
  },
  'robi-balance':{
    it:'I tuoi ROBI — il vero guadagno di AIROOBI. Le frazioni si accumulano (es. 2.3750 ROBI). Riscuoti quando vuoi in KAS. Ogni airdrop a cui partecipi ti fa guadagnare frazioni di ROBI reali.',
    en:'Your ROBI — AIROOBI\'s real reward. Fractions accumulate (e.g. 2.3750 ROBI). Redeem anytime for KAS. Every airdrop you join earns you real ROBI fractions.'
  },
  'kas-potential':{
    it:'Il potenziale in KAS (Kaspa) dei tuoi ROBI al prezzo attuale. Questo è quanto riceveresti se riscuotessi ora. Il valore reale potrebbe essere diverso al momento della riscossione.',
    en:'The potential KAS (Kaspa) value of your ROBI at the current price. This is what you\'d receive if you redeemed now. Actual value may differ at redemption time.'
  },
  'portfolio':{
    it:'L\'andamento del tuo portafoglio negli ultimi 30 giorni. Blu = ARIA accumulati. Gold = valore ROBI. Verde = equivalente in KAS.',
    en:'Your portfolio trend over the last 30 days. Blue = ARIA accumulated. Gold = ROBI value. Green = KAS equivalent.'
  },
  'faucet':{
    it:'Il faucet ti dà 100 ARIA gratis ogni giorno. Si resetta a mezzanotte UTC. In futuro la quantità diminuirà progressivamente — approfittane ora.',
    en:'The faucet gives you 100 free ARIA every day. Resets at midnight UTC. The amount will decrease over time — take advantage now.'
  },
  'robi-card-projection':{
    it:'I ROBI che stai accumulando in questa corsa in base agli Step acquistati. Sono tuoi a prescindere dall\'esito: li riscuoti in KAS al termine, anche se non ottieni l\'oggetto.',
    en:'The ROBI you\'re accumulating in this race based on your Steps. They\'re yours regardless of outcome: redeem them for KAS when it ends, even if you don\'t get the object.'
  },
  // GS-1 · copy definitiva ROBY (ROBY_Reply_CCP_TrackA_Reopen_GO_2026-05-24.md §4)
  'evalobi':{
    it:'EVALOBI è il certificato di valutazione del tuo oggetto — esito, valore stimato e motivazione, firmati da AIROOBI. Non ha valore monetario e non si spende: è la prova, permanente e tua, del nostro giudizio. Resta nel Portafoglio anche dopo aver venduto o ritirato l\'oggetto.',
    en:'EVALOBI is your object\'s evaluation certificate — outcome, estimated value and reasoning, signed by AIROOBI. It has no monetary value and cannot be spent: it is a permanent, personal proof of our assessment. It stays in your Wallet even after you sell or withdraw the object.'
  }
};

function showInfoTip(el,key){
  var tip=document.getElementById('info-tooltip');
  var text=document.getElementById('info-tooltip-text');
  if(!tip||!text)return;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var info=INFO_TIPS[key];
  if(!info)return;
  text.textContent=info[lang]||info.it;
  tip.style.display='block';
  // Position near the clicked element
  var rect=el.getBoundingClientRect();
  var tipW=280;
  var left=Math.min(rect.left,window.innerWidth-tipW-16);
  left=Math.max(8,left);
  var top=rect.bottom+8;
  if(top+200>window.innerHeight)top=rect.top-200;
  tip.style.left=left+'px';
  tip.style.top=top+'px';
}

function closeInfoTip(){
  var tip=document.getElementById('info-tooltip');
  if(tip)tip.style.display='none';
}

// Close tooltip on outside click
document.addEventListener('click',function(e){
  if(!e.target.classList.contains('info-i')&&!e.target.closest('#info-tooltip')){
    closeInfoTip();
  }
});

// ── My Airdrop Chat toggle ──
function toggleMyChat(airdropId){
  var el=document.getElementById('my-chat-'+airdropId);
  if(!el)return;
  if(el.style.display==='none'){
    el.style.display='block';
    if(!el.dataset.loaded){
      loadAirdropChat(airdropId,'my-chat-'+airdropId);
      el.dataset.loaded='1';
    }
  }else{
    el.style.display='none';
  }
}

// ── Coming Soon (in valutazione) ──
async function loadComingSoon(){
  try{
    var res=await fetch(SB_URL+'/rest/v1/airdrops?status=eq.in_valutazione&select=id,title,image_url,category&order=created_at.desc&limit=12',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    });
    if(!res.ok)return;
    var items=await res.json();
    var section=document.getElementById('coming-soon-section');
    var grid=document.getElementById('coming-grid');
    if(!section||!grid)return;
    _comingSoonItems=items||[];
    renderCatDashboard();
    if(!items||items.length===0){section.style.display='none';return;}
    section.style.display='block';
    var phSvg='<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>';
    grid.innerHTML=items.map(function(a){
      var img=a.image_url
        ?'<img class="coming-tile-img" src="'+a.image_url+'" alt="" loading="lazy">'
        :'<div class="coming-tile-ph">'+phSvg+'</div>';
      return '<div class="coming-tile">'
        +'<div class="coming-tile-badge"><span class="it">presto</span><span class="en">soon</span></div>'
        +img
        +'<div class="coming-tile-name">'+escHtml(a.title)+'</div>'
        +'</div>';
    }).join('');
  }catch(e){console.error('loadComingSoon error:',e);}
}

// ── Change password ──
function showChangePw(){
  document.getElementById('changepw-modal').classList.add('active');
  document.getElementById('changepw-error').style.display='none';
  document.getElementById('changepw-success').style.display='none';
  document.getElementById('changepw-old').value='';
  document.getElementById('changepw-new').value='';
  document.getElementById('changepw-confirm').value='';
}
function hideChangePw(){
  document.getElementById('changepw-modal').classList.remove('active');
}
async function doChangePw(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var errEl=document.getElementById('changepw-error');
  var okEl=document.getElementById('changepw-success');
  errEl.style.display='none';okEl.style.display='none';

  var oldPw=document.getElementById('changepw-old').value;
  var newPw=document.getElementById('changepw-new').value;
  var confirmPw=document.getElementById('changepw-confirm').value;

  if(!oldPw){errEl.textContent=lang==='it'?'Inserisci la password attuale':'Enter current password';errEl.style.display='block';return;}
  if(!newPw||newPw.length<8){errEl.textContent=lang==='it'?'La nuova password deve avere almeno 8 caratteri':'New password must be at least 8 characters';errEl.style.display='block';return;}
  if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(newPw)){
    errEl.textContent=lang==='it'?'Servono maiuscola, minuscola, numero e carattere speciale (!@#$%^&*)':'Need uppercase, lowercase, number and special char (!@#$%^&*)';errEl.style.display='block';return;
  }
  if(newPw!==confirmPw){errEl.textContent=lang==='it'?'Le password non coincidono':'Passwords don\'t match';errEl.style.display='block';return;}

  document.getElementById('changepw-btn').disabled=true;

  // Verify old password by trying to login
  var email=_session&&_session.user?_session.user.email:'';
  try{
    var verifyRes=await fetch(SB_URL+'/auth/v1/token?grant_type=password',{
      method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({email:email,password:oldPw})
    });
    if(verifyRes.status!==200){
      errEl.textContent=lang==='it'?'Password attuale errata':'Current password is wrong';errEl.style.display='block';
      document.getElementById('changepw-btn').disabled=false;return;
    }

    // Update password
    var token=await getValidToken();
    var updateRes=await fetch(SB_URL+'/auth/v1/user',{
      method:'PUT',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({password:newPw})
    });
    if(updateRes.ok){
      okEl.textContent=lang==='it'?'Password cambiata con successo!':'Password changed successfully!';
      okEl.style.display='block';
      document.getElementById('changepw-old').value='';
      document.getElementById('changepw-new').value='';
      document.getElementById('changepw-confirm').value='';
      track('password_changed',{});
      setTimeout(hideChangePw,2000);
    }else{
      var d=await updateRes.json().catch(function(){return{}});
      errEl.textContent=d.msg||d.message||(lang==='it'?'Errore. Riprova.':'Error. Try again.');
      errEl.style.display='block';
    }
  }catch(e){
    errEl.textContent=lang==='it'?'Errore di rete. Riprova.':'Network error. Try again.';
    errEl.style.display='block';
  }
  document.getElementById('changepw-btn').disabled=false;
}

// ── Share airdrop (native + fallback menu) ──
function shareFromBtn(btn,event){
  shareAirdrop(btn.dataset.id,btn.dataset.title||'',btn.dataset.img||'',event);
}
function buildShareText(title,lang){
  var t=title||'';
  if(lang==='en'){
    return 'Check out this race on AIROOBI: '+t+'\n\n'
      +'Stack ARIA every day, advance Step by Step toward the summit and pick up real ROBI along the trail (redeemable in KAS on-chain).';
  }
  return 'Guarda questa corsa su AIROOBI: '+t+'\n\n'
    +'Accumula ARIA ogni giorno, avanza Step dopo Step verso la vetta e raccogli ROBI reali sul percorso (riscuotibili on-chain in KAS).';
}
async function shareAirdrop(id,title,imgUrl,event){
  if(event){event.stopPropagation();event.preventDefault();}
  var url=location.origin+'/airdrops/'+id;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var text=buildShareText(title,lang);
  if(navigator.share){
    var payload={title:title||'AIROOBI',text:text,url:url};
    if(imgUrl&&navigator.canShare){
      try{
        var r=await fetch(imgUrl,{mode:'cors'});
        if(r.ok){
          var blob=await r.blob();
          var file=new File([blob],'airdrop.jpg',{type:blob.type||'image/jpeg'});
          if(navigator.canShare({files:[file]}))payload.files=[file];
        }
      }catch(e){}
    }
    try{await navigator.share(payload);return;}catch(e){if(e&&e.name==='AbortError')return;}
  }
  openShareMenu(url,text,title,imgUrl);
}
function openShareMenu(url,text,title,imgUrl){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var old=document.getElementById('share-overlay');if(old)old.remove();
  var wa='https://wa.me/?text='+encodeURIComponent(text+' '+url);
  var tg='https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text);
  var tw='https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url);
  var fb='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
  var copyLbl=lang==='en'?'Copy link':'Copia link';
  var titleLbl=lang==='en'?'Share':'Condividi';
  var ov=document.createElement('div');
  ov.id='share-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  var thumbHtml=imgUrl?'<img src="'+imgUrl.replace(/"/g,'&quot;')+'" alt="" style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:12px">':'';
  var titleHtml=title?'<div style="font-family:var(--font-h);font-size:15px;color:var(--white);line-height:1.3;margin-bottom:14px">'+escHtml(title)+'</div>':'';
  ov.innerHTML='<div style="background:var(--card-bg);border:1px solid var(--gray-700);border-radius:var(--radius);padding:20px;max-width:360px;width:100%">'
    +thumbHtml+titleHtml
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:2px;color:var(--gray-400);margin-bottom:12px;text-transform:uppercase">'+titleLbl+'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'
    +shareBtnHtml(copyLbl,'copy','copyAirdropLink(this.dataset.url)',url)
    +shareBtnHtml('WhatsApp','wa','openShareUrl(this.dataset.url)',wa)
    +shareBtnHtml('Telegram','tg','openShareUrl(this.dataset.url)',tg)
    +shareBtnHtml('X','x','openShareUrl(this.dataset.url)',tw)
    +shareBtnHtml('Facebook','fb','openShareUrl(this.dataset.url)',fb)
    +shareBtnHtml(lang==='en'?'Close':'Chiudi','close','document.getElementById(\'share-overlay\').remove()','')
    +'</div></div>';
  document.body.appendChild(ov);
}
function shareBtnHtml(label,kind,handler,url){
  var icons={
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
    wa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M3 21l1.5-5A9 9 0 1120 12a9 9 0 01-13 7.7L3 21z"/><path d="M8.5 10c.2 1 .7 1.9 1.5 2.5.8.7 1.7 1.2 2.7 1.3l1-1c.2-.2.5-.3.8-.2l1.8.7c.3.1.4.4.3.6l-.3 1c-.3.7-1 1.2-1.8 1.1-1.5-.2-3-.9-4.2-2.2-1.2-1.3-1.9-2.8-2-4.2 0-.8.4-1.5 1.1-1.8l1-.3c.2 0 .5.1.6.3l.7 1.8c.1.3 0 .6-.2.8l-1 1z" fill="currentColor" stroke="none"/></svg>',
    tg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M22 3L2 11l5 2 2 6 3-3 5 4 5-17z"/><path d="M7 13l10-5-8 7"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.4l8-9.2L1 2h7l4.9 6.5L18.9 2zm-2.4 18h2L7.6 4H5.5l11 16z"/></svg>',
    fb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  return '<button data-url="'+(url||'').replace(/"/g,'&quot;')+'" onclick="'+handler+'" style="background:none;border:1px solid var(--gray-700);color:var(--gray-300);padding:12px 10px;border-radius:var(--radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-m);font-size:11px;letter-spacing:1px;text-transform:uppercase;transition:all .2s" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-300)\'">'+icons[kind]+'<span>'+label+'</span></button>';
}
function openShareUrl(u){if(u)window.open(u,'_blank','noopener');var ov=document.getElementById('share-overlay');if(ov)ov.remove();}
function copyAirdropLink(url){
  var done=function(){
    if(typeof showToast==='function')showToast('<span class="it">Link copiato</span><span class="en">Link copied</span>');
    var ov=document.getElementById('share-overlay');if(ov)ov.remove();
  };
  var legacy=function(){
    var ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);done();
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(done).catch(legacy);
  }else legacy();
}
