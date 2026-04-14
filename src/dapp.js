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

async function loadRobiPrice(){
  try{
    var tfRes=await fetch(SB_URL+'/rest/v1/treasury_funds?select=amount_eur,treasury_pct',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}});
    var treasuryBal=0;
    if(tfRes.ok){var tf=await tfRes.json();if(tf)tf.forEach(function(r){var a=parseFloat(r.amount_eur)||0;var p=r.treasury_pct!=null?parseInt(r.treasury_pct):100;treasuryBal+=a*(p/100);});}
    var robiRes=await fetch(SB_URL+'/rest/v1/rpc/admin_get_all_robi',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'}});
    var totalRobi=0;
    if(robiRes.ok){var rd=await robiRes.json();rd.forEach(function(r){totalRobi+=parseFloat(r.shares)||0;});}
    if(totalRobi>0&&treasuryBal>0)_robiPrice=(treasuryBal*0.999)/totalRobi;
  }catch(e){}
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
var _robiPrice=0; // treasury×0.999/robi_circolanti
var _currentFilter='all';
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
}
// Restore saved language
(function(){
  var saved=localStorage.getItem('airoobi_lang');
  if(saved&&saved!=='it'){toggleLang();}
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
  var page=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')?'explore':null);
  return page&&PUBLIC_PAGES.indexOf(page)!==-1;
}

// ── Init ──
document.addEventListener('DOMContentLoaded',async function(){
  var pp=location.pathname;
  var initialPage=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')?'explore':'home');
  var airdropMatch=pp.match(/^\/airdrops\/([0-9a-f-]{36})$/);
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
    await Promise.all([loadBalance(),loadAirdrops(),loadMyParticipations(),checkUserRoles(),loadWatchlist(),loadRobiPrice(),loadMyRanks()]);
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
  if(!urlId){
    history.replaceState({page:initialPage},null,PAGE_PATHS[initialPage]||'/dapp');
  }
  if(urlId){
    openDetail(urlId);
    history.replaceState({page:'explore',detail:urlId},null,'/airdrops/'+urlId);
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
  var page=(e.state&&e.state.page)?e.state.page:(PATH_TO_PAGE[location.pathname]||'home');
  showPage(page);
  if(e.state&&e.state.detail){
    openDetail(e.state.detail);
  } else if(page==='explore'){
    try{stopBubblePhysics();}catch(ex){}
    document.getElementById('detail').classList.remove('active');
    document.getElementById('detail').style.display='';
    document.getElementById('list-view').classList.remove('hidden');
    document.getElementById('list-view').style.display='';
    document.getElementById('cat-filter').style.display='';
    loadValuationCount();
  }
});

// ── Home Dashboard ──
async function loadHomeDashboard(){
  var token=await getValidToken();
  if(!token)return;
  var email=_session.user?.email||'';
  var name=email.split('@')[0]||'—';
  var elIt=document.getElementById('home-user-name');
  var elEn=document.getElementById('home-user-name-en');
  if(elIt)elIt.textContent=name;
  if(elEn)elEn.textContent=name;
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
      var tfRes=await fetch(SB_URL+'/rest/v1/treasury_funds?select=amount_eur,treasury_pct',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}});
      var tBal=0;
      if(tfRes.ok){var tf=await tfRes.json();tf.forEach(function(r){tBal+=(parseFloat(r.amount_eur)||0)*((r.treasury_pct!=null?parseInt(r.treasury_pct):100)/100);});}
      var rrRes=await fetch(SB_URL+'/rest/v1/rpc/admin_get_all_robi',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}});
      var tRobi=0;
      if(rrRes.ok){var rrd=await rrRes.json();rrd.forEach(function(r){tRobi+=parseFloat(r.shares)||0;});}
      var uVal=tRobi>0?(tBal/tRobi):0;
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
  document.getElementById('home-airdrops').textContent=_myParts.length;
  document.getElementById('home-blocks').textContent=totalBlocks;
  document.getElementById('home-spent').textContent=totalSpent+' ARIA';
  // Check-in status
  checkCheckinStatus();
  // Check faucet status
  checkFaucetStatus();
  // Portfolio chart
  loadPortfolioChart(token,robiCount);
}

// ── Portfolio Chart ──
async function loadPortfolioChart(token,userRobi){
  var canvas=document.getElementById('portfolio-chart');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  // HiDPI
  var rect=canvas.parentElement.getBoundingClientRect();
  canvas.width=rect.width*2;canvas.height=rect.height*2;
  ctx.scale(2,2);
  var W=rect.width,H=rect.height;

  // Fetch last 30 days of points_ledger
  var days=30;
  var since=new Date();since.setDate(since.getDate()-days);
  var sinceStr=since.toISOString().slice(0,10);
  var ledger=[];
  try{
    ledger=await sbGet('points_ledger?user_id=eq.'+_session.user.id+'&created_at=gte.'+sinceStr+'T00:00:00&select=amount,created_at&order=created_at.asc',token)||[];
  }catch(e){}

  // Build daily ARIA cumulative from current balance backwards
  var dailyMap={};
  ledger.forEach(function(e){
    var d=e.created_at.slice(0,10);
    dailyMap[d]=(dailyMap[d]||0)+(e.amount||0);
  });
  // Generate date labels
  var labels=[];
  for(var i=days;i>=0;i--){
    var d=new Date();d.setDate(d.getDate()-i);
    labels.push(d.toISOString().slice(0,10));
  }
  // Build ARIA running balance (work backwards from current)
  var ariaData=[];
  var runningBack=_balance;
  for(var i=labels.length-1;i>=0;i--){
    ariaData[i]=runningBack;
    if(i>0)runningBack-=(dailyMap[labels[i]]||0);
  }
  // Clamp negatives
  ariaData=ariaData.map(function(v){return Math.max(0,v)});

  // Get ROBI value + KAS price
  var robiValEur=0,kasPrice=0;
  try{
    var tfRes=await fetch(SB_URL+'/rest/v1/treasury_funds?select=amount_eur,treasury_pct',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}});
    var tBal=0;
    if(tfRes.ok){var tf=await tfRes.json();tf.forEach(function(r){tBal+=(parseFloat(r.amount_eur)||0)*((r.treasury_pct!=null?parseInt(r.treasury_pct):100)/100);});}
    var rrRes=await fetch(SB_URL+'/rest/v1/rpc/admin_get_all_robi',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}});
    var tRobi=0;
    if(rrRes.ok){var rrd=await rrRes.json();rrd.forEach(function(r){tRobi+=parseFloat(r.shares)||0;});}
    if(tRobi>0)robiValEur=(tBal/tRobi)*userRobi;
  }catch(e){}
  try{
    var kRes=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur');
    var kd=await kRes.json();
    if(kd&&kd.kaspa&&kd.kaspa.eur>0)kasPrice=kd.kaspa.eur;
  }catch(e){}

  // ROBI line (flat — same value across all days for now)
  var robiData=labels.map(function(){return robiValEur});
  // KAS potential line
  var kasData=kasPrice>0?labels.map(function(){return robiValEur/kasPrice}):[];

  // Portfolio summary — mostra solo valore ROBI in EUR (no ARIA EUR)
  var eurEl=document.getElementById('portfolio-eur-val');
  if(eurEl)eurEl.innerHTML='&euro; '+robiValEur.toFixed(2)+'<span style="font-family:var(--font-m);font-size:11px;color:var(--gray-400);margin-left:8px;letter-spacing:1px">ROBI</span>';

  // Check if there's any data to show
  var hasData=ariaData.some(function(v){return v>0})||robiValEur>0;
  if(!hasData){
    // No data — show empty state message instead of blank chart
    canvas.parentElement.style.display='flex';
    canvas.parentElement.style.alignItems='center';
    canvas.parentElement.style.justifyContent='center';
    canvas.style.display='none';
    var emptyMsg=document.createElement('div');
    emptyMsg.style.cssText='text-align:center;padding:16px;font-size:12px;color:var(--gray-500);line-height:1.5';
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    emptyMsg.innerHTML=lang==='it'
      ?'Nessun dato ancora.<br>Usa il <strong style="color:var(--aria)">faucet</strong> e il <strong style="color:var(--gold)">check-in</strong> per accumulare ARIA,<br>poi partecipa agli airdrop per guadagnare ROBI.'
      :'No data yet.<br>Use the <strong style="color:var(--aria)">faucet</strong> and <strong style="color:var(--gold)">check-in</strong> to accumulate ARIA,<br>then join airdrops to earn ROBI.';
    if(!canvas.parentElement.querySelector('.portfolio-empty')){
      emptyMsg.className='portfolio-empty';
      canvas.parentElement.appendChild(emptyMsg);
    }
    if(eurEl)eurEl.textContent='€ 0,00';
    return;
  }
  // Ensure canvas is visible if we have data
  canvas.style.display='';
  var existingEmpty=canvas.parentElement.querySelector('.portfolio-empty');
  if(existingEmpty)existingEmpty.remove();

  // Draw
  var pad={top:10,right:10,bottom:20,left:10};
  var cW=W-pad.left-pad.right;
  var cH=H-pad.top-pad.bottom;

  // Find max values for each axis
  var maxAria=Math.max.apply(null,ariaData)||1;
  var maxRobi=Math.max.apply(null,robiData)||1;
  var maxKas=kasData.length?Math.max.apply(null,kasData)||1:1;

  function drawLine(data,maxVal,color,alpha){
    if(!data.length)return;
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=1.5;
    ctx.globalAlpha=1;
    var step=cW/(data.length-1||1);
    for(var i=0;i<data.length;i++){
      var x=pad.left+i*step;
      var y=pad.top+cH-(data[i]/maxVal)*cH;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
    // Fill
    ctx.lineTo(pad.left+(data.length-1)*step,pad.top+cH);
    ctx.lineTo(pad.left,pad.top+cH);
    ctx.closePath();
    ctx.globalAlpha=alpha;
    ctx.fillStyle=color;
    ctx.fill();
    ctx.globalAlpha=1;
  }

  // Clear
  ctx.clearRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=0.5;
  for(var g=0;g<4;g++){
    var gy=pad.top+(cH/3)*g;
    ctx.beginPath();ctx.moveTo(pad.left,gy);ctx.lineTo(W-pad.right,gy);ctx.stroke();
  }

  // Draw lines
  drawLine(ariaData,maxAria,'#4A9EFF',0.06);
  drawLine(robiData,maxRobi,'#B8960C',0.08);
  if(kasData.length)drawLine(kasData,maxKas,'#49EACB',0.05);

  // Date labels (first, mid, last)
  ctx.font='9px monospace';ctx.fillStyle='rgba(255,255,255,.2)';ctx.textBaseline='top';
  var ly=H-pad.bottom+4;
  ctx.textAlign='left';ctx.fillText(labels[0].slice(5),pad.left,ly);
  ctx.textAlign='center';ctx.fillText(labels[Math.floor(labels.length/2)].slice(5),W/2,ly);
  ctx.textAlign='right';ctx.fillText(labels[labels.length-1].slice(5),W-pad.right,ly);
}

// ── Check-in ──
async function claimCheckin(){
  var btn=document.getElementById('checkin-btn');
  btn.disabled=true;btn.style.opacity='.5';btn.style.cursor='not-allowed';
  btn.textContent='...';
  try{
    var token=await getValidToken();
    if(!token)return;
    var res=await sbRpc('claim_checkin',{},token);
    if(res&&res.ok){
      _balance+=res.amount;
      updateBalanceUI();
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      btn.style.background='var(--kas)';btn.style.color='var(--black)';
      btn.textContent=lang==='it'?'+50 ARIA fatto!':'+50 ARIA done!';
      showToast('<span style="color:var(--kas)">+50 ARIA</span> — <span class="it">ogni ARIA è un passo verso il tuo ROBI</span><span class="en">every ARIA is a step toward your ROBI</span>');
      var homeAria=document.getElementById('home-aria');
      if(homeAria)homeAria.innerHTML=_balance;
    }else if(res&&res.error==='already_checked'){
      showCheckinDone();
    }else{
      btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
      var _l=document.documentElement.getAttribute('data-lang')||'it';
      btn.innerHTML=_l==='it'?'<span class="it">+50 ARIA</span>':'<span class="en">+50 ARIA</span>';
    }
  }catch(e){
    btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';
    btn.textContent='+50 ARIA';
  }
}

function showCheckinDone(){
  var btn=document.getElementById('checkin-btn');
  if(!btn)return;
  btn.disabled=true;btn.style.opacity='.5';btn.style.cursor='not-allowed';
  btn.style.background='var(--gray-700)';btn.style.color='var(--gray-400)';
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  btn.textContent=lang==='it'?'Fatto oggi ✓':'Done today ✓';
  markDailyTask('checkin',true);
}

async function checkCheckinStatus(){
  try{
    var token=await getValidToken();
    if(!token)return;
    var today=new Date().toISOString().slice(0,10);
    var rows=await sbGet('checkins?user_id=eq.'+_session.user.id+'&checked_at=eq.'+today+'&select=id&limit=1',token);
    if(rows&&rows.length>0)showCheckinDone();
  }catch(e){}
}

function markDailyTask(task,done){
  var icon=document.getElementById('dt-'+task+'-icon');
  var row=document.getElementById('dt-'+task);
  if(icon){
    if(done){
      icon.style.borderColor='var(--kas)';icon.style.background='var(--kas)';icon.style.color='var(--black)';
      icon.innerHTML='✓';
    }else{
      icon.style.borderColor='var(--gray-600)';icon.style.background='none';icon.style.color='';
      icon.innerHTML='';
    }
  }
  if(row&&done){row.style.borderColor='rgba(73,234,203,.15)';row.style.opacity='.6';}
  updateDailyTasksScore();
}

function updateDailyTasksScore(){
  var done=0,total=2;
  if(document.getElementById('dt-faucet-icon')&&document.getElementById('dt-faucet-icon').innerHTML==='✓')done++;
  if(document.getElementById('dt-checkin-icon')&&document.getElementById('dt-checkin-icon').innerHTML==='✓')done++;
  var el=document.getElementById('daily-tasks-score');
  if(el)el.textContent=done+'/'+total;
  if(el)el.style.color=done===total?'var(--kas)':'var(--gray-500)';
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
      showToast('<span style="color:var(--kas)">+100 ARIA</span> — <span class="it">più blocchi, più ROBI</span><span class="en">more blocks, more ROBI</span>');
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
  // Load referral link
  var prof=await sbGet('profiles?id=eq.'+uid+'&select=referral_code,referral_count',token);
  if(prof&&prof[0]){
    var code=prof[0].referral_code||'';
    var link=(_isApp?'https://airoobi.app/signup':'https://airoobi.com/signup.html')+'?ref='+code;
    var el=document.getElementById('dapp-ref-link');
    if(el){el.textContent=link;el.dataset.link=link;el.dataset.code=code;}
    document.getElementById('dapp-ref-count').textContent=prof[0].referral_count||0;
  }
  // Confirmed count
  var confirmed=await sbGet('referral_confirmations?referrer_id=eq.'+uid+'&status=eq.confirmed&select=id',token);
  document.getElementById('dapp-ref-confirmed').textContent=confirmed?confirmed.length:0;
  // History: who you invited
  var invList=document.getElementById('dapp-ref-invited-list');
  try{
    var confs=await sbGet('referral_confirmations?referrer_id=eq.'+uid+'&select=*,referred:referred_id(email)',token);
    if(confs&&confs.length>0){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      invList.innerHTML=confs.map(function(c){
        var email=c.referred&&c.referred.email?truncEmail(c.referred.email):'***';
        var date=c.confirmed_at?new Date(c.confirmed_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):(c.created_at?new Date(c.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):'—');
        var ok=c.status==='confirmed';
        return '<div class="ref-history-row"><span class="ref-history-email">'+email+'</span><span class="ref-history-status '+(ok?'ref-history-confirmed':'ref-history-pending')+'">'+(ok?(lang==='it'?'Confermato':'Confirmed'):(lang==='it'?'In attesa':'Pending'))+'</span><span class="ref-history-aria">'+(ok?'+10 ARIA':'—')+'</span><span style="font-size:11px;color:var(--gray-400)">'+date+'</span></div>';
      }).join('');
    }else{
      invList.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Nessun invitato ancora.</span><span class="en">No invitees yet.</span></p>';
    }
  }catch(e){invList.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Nessun invitato ancora.</span><span class="en">No invitees yet.</span></p>';}
  // History: who invited you
  var inviterEl=document.getElementById('dapp-ref-inviter-info');
  try{
    var myP=await sbGet('profiles?id=eq.'+uid+'&select=referred_by',token);
    if(myP&&myP[0]&&myP[0].referred_by){
      var refCode=myP[0].referred_by;
      var rProf=await sbGet('profiles?referral_code=eq.'+refCode+'&select=email',token);
      var rEmail=rProf&&rProf[0]?truncEmail(rProf[0].email):'***';
      var myConfs=await sbGet('referral_confirmations?referred_id=eq.'+uid+'&status=eq.confirmed&select=confirmed_at',token);
      var cDate=myConfs&&myConfs[0]&&myConfs[0].confirmed_at?new Date(myConfs[0].confirmed_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):'—';
      var isOk=myConfs&&myConfs.length>0;
      inviterEl.innerHTML='<div class="ref-history-row"><span class="ref-history-email">'+rEmail+'</span><span class="ref-history-status '+(isOk?'ref-history-confirmed':'ref-history-pending')+'">'+(isOk?(document.documentElement.getAttribute('data-lang')==='en'?'Confirmed':'Confermato'):(document.documentElement.getAttribute('data-lang')==='en'?'Pending':'In attesa'))+'</span><span class="ref-history-aria">'+(isOk?'+15 ARIA':'—')+'</span><span style="font-size:11px;color:var(--gray-400)">'+cDate+'</span></div>';
    }else{
      inviterEl.innerHTML='<p style="font-size:13px;color:var(--gray-400)"><span class="it">Non sei stato invitato da nessuno.</span><span class="en">You were not invited by anyone.</span></p>';
    }
  }catch(e){inviterEl.innerHTML='';}
}

function dappCopyRef(){
  var link=document.getElementById('dapp-ref-link').dataset.link;
  if(!link)return;
  navigator.clipboard.writeText(link).then(function(){
    var btn=document.querySelector('#tab-referral .ref-copy');
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    btn.textContent=lang==='it'?'COPIATO!':'COPIED!';
    setTimeout(function(){btn.innerHTML='<span class="it">COPIA</span><span class="en">COPY</span>'},2000);
  });
}

function dappShareRef(platform){
  var el=document.getElementById('dapp-ref-link');
  var link=el.dataset.link;
  var refCode=el.dataset.code||'';
  if(!link)return;
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msgs={
    it:{
      whatsapp:'Ho trovato *AIROOBI*.\n\nOggetti di valore — iPhone, orologi, borse — e blocchi di opportunità per portarseli a casa a un prezzo che non crederesti.\n\nEntri gratis, ogni giorno ricevi ARIA e con quelli acquisti i blocchi. Semplice.\n\nProva col mio codice *'+refCode+'*\n',
      telegram:'Ho trovato AIROOBI.\n\nOggetti di valore — iPhone, orologi, borse — e blocchi di opportunità per portarseli a casa a un prezzo che non crederesti.\n\nEntri gratis, ogni giorno ricevi ARIA e con quelli acquisti i blocchi. Semplice.\n\nProva col mio codice '+refCode+'\n',
      x:'Oggetti di valore. Blocchi di opportunità. Prezzi che non crederesti.\n\nEntri gratis, ricevi ARIA ogni giorno e partecipi. Semplice.\n\n@airoobi_com · codice: '+refCode+' ',
      email_subject:'Devi vedere AIROOBI',
      email_body:'Ciao,\n\nti giro una cosa che ho trovato: AIROOBI.\n\nFunziona così: ci sono oggetti di valore (iPhone, orologi, borse). Tu entri gratis, ogni giorno ricevi ARIA, e con quelli acquisti blocchi di opportunità per portarti a casa l\'oggetto che vuoi.\n\nPiù blocchi prendi, più sei vicino. E chi non porta a casa l\'oggetto guadagna comunque qualcosa di reale.\n\nProva col mio codice '+refCode+'\n\n'+link
    },
    en:{
      whatsapp:'I found *AIROOBI*.\n\nValuable items — iPhones, watches, bags — and opportunity blocks to take them home at a price you wouldn\'t believe.\n\nJoin for free, get ARIA every day and use them to buy blocks. Simple.\n\nTry it with my code *'+refCode+'*\n',
      telegram:'I found AIROOBI.\n\nValuable items — iPhones, watches, bags — and opportunity blocks to take them home at a price you wouldn\'t believe.\n\nJoin for free, get ARIA every day and use them to buy blocks. Simple.\n\nTry it with my code '+refCode+'\n',
      x:'Valuable items. Opportunity blocks. Prices you won\'t believe.\n\nJoin free, get ARIA daily and participate. Simple.\n\n@airoobi_com · code: '+refCode+' ',
      email_subject:'You need to see AIROOBI',
      email_body:'Hey,\n\nsharing something I found: AIROOBI.\n\nHere\'s how it works: there are valuable items (iPhones, watches, bags). You join for free, get ARIA every day, and use them to buy opportunity blocks to take home the item you want.\n\nMore blocks you get, the closer you are. And those who don\'t take home the item still earn something real.\n\nTry it with my code '+refCode+'\n\n'+link
    }
  };
  var m=msgs[lang]||msgs.it;
  var urls={
    whatsapp:'https://wa.me/?text='+encodeURIComponent(m.whatsapp+link),
    telegram:'https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(m.telegram),
    x:'https://x.com/intent/tweet?text='+encodeURIComponent(m.x+link),
    email:'mailto:?subject='+encodeURIComponent(m.email_subject)+'&body='+encodeURIComponent(m.email_body)
  };
  window.open(urls[platform],'_blank');
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
      var hb=document.getElementById('detail-heart');
      if(hb)hb.className=isInWatchlist(id)?'heart-btn active':'heart-btn';
    }
  }
}

async function loadMyParticipations(){
  _myParts=await sbGet('airdrop_participations?user_id=eq.'+_session.user.id+'&cancelled_at=is.null&select=*,airdrops(id,title,category,image_url,block_price_aria,total_blocks,blocks_sold,status)&order=created_at.desc',_session.access_token)||[];
}

async function loadMyRanks(){
  _myRanks={};
  if(!_session)return;
  var token=await getValidToken();if(!token)return;
  var data=await sbRpc('get_my_airdrop_ranks',{},token)||[];
  if(!Array.isArray(data))return;
  data.forEach(function(r){_myRanks[r.airdrop_id]={rank:r.rank,total:r.total,score:r.score};});
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
    +'<div class="mine-label"><span style="color:#B8960C">⛏</span> <span class="it">La tua miniera</span><span class="en">Your mine</span></div>'
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

// ── Mining Animation ──
function playMiningAnimation(blocksBought,oldMyBlocks,miningRate){
  var oldRobi=Math.floor(oldMyBlocks/miningRate);
  var newRobi=Math.floor((oldMyBlocks+blocksBought)/miningRate);
  var foundRobi=newRobi>oldRobi;

  var overlay=document.createElement('div');
  overlay.className='mining-overlay';
  overlay.innerHTML='<div class="mining-pickaxe">⛏</div>'
    +'<div class="mining-blocks-text">'+blocksBought+' <span class="it">blocchi minati!</span><span class="en">blocks mined!</span></div>'
    +(foundRobi?'<div class="mining-robi-text">✦ ROBI <span class="it">TROVATO</span><span class="en">FOUND</span>! ✦</div>':'');
  document.body.appendChild(overlay);

  // Speed up tower rotation
  var tower=document.getElementById('mine-tower');
  if(tower)tower.classList.add('mining');

  requestAnimationFrame(function(){
    overlay.classList.add('active');
    if(foundRobi)spawnConfetti();
    var dur=foundRobi?2800:1600;
    setTimeout(function(){
      overlay.classList.remove('active');
      if(tower)tower.classList.remove('mining');
      setTimeout(function(){overlay.remove()},500);
    },dur);
  });
}

function spawnConfetti(){
  var c=document.createElement('div');
  c.className='confetti-container';
  document.body.appendChild(c);
  for(var i=0;i<40;i++){
    var p=document.createElement('div');
    p.className='confetti';
    p.style.left=(30+Math.random()*40)+'%';
    p.style.animationDelay=(Math.random()*0.4)+'s';
    p.style.animationDuration=(1.5+Math.random()*1)+'s';
    p.style.setProperty('--x',(Math.random()*300-150)+'px');
    c.appendChild(p);
  }
  setTimeout(function(){c.remove()},3500);
}

// ── Page routing ──
var _isApp=location.hostname==='airoobi.app'||location.hostname==='www.airoobi.app';
var PAGE_PATHS=_isApp
  ?{home:'/',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/invita',wallet:'/portafoglio',archive:'/archivio',learn:'/impara'}
  :{home:'/dapp',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/invita',wallet:'/portafoglio-dapp',archive:'/archivio',learn:'/impara'};
var PATH_TO_PAGE={'/':'home','/dapp':'home','/dapp.html':'home','/airdrops':'explore','/esplora':'explore','/miei-airdrop':'my','/proponi':'submit','/referral-dapp':'referral','/referral':'referral','/invita':'referral','/portafoglio-dapp':'wallet','/portafoglio':'wallet','/archivio':'archive','/impara':'learn'};
var PAGE_HEADERS={
  explore:{it:'<em>Airdrops</em>',en:'<em>Airdrops</em>',sub_it:'Usa i tuoi ARIA per partecipare. Ogni blocco acquistato ti avvicina all\'oggetto.',sub_en:'Use your ARIA to participate. Each block purchased brings you closer.'},
  my:{it:'I miei <em>Airdrop</em>',en:'My <em>Airdrops</em>',sub_it:'Segui le tue partecipazioni e i blocchi acquistati.',sub_en:'Track your participations and purchased blocks.'},
  submit:{it:'<b>Valuta</b> il tuo <em>oggetto</em>',en:'<b>Evaluate</b> your <em>item</em>',sub_it:'Hai un oggetto di valore? Mettilo in airdrop su AIROOBI.',sub_en:'Have a valuable item? Put it on airdrop on AIROOBI.'},
  referral:{it:'<em>Referral</em>',en:'<em>Referral</em>',sub_it:'Invita amici e ricevi ARIA bonus. Più accumuli, più ROBI guadagni.',sub_en:'Invite friends and earn bonus ARIA. The more you accumulate, the more ROBI you earn.'},
  wallet:{it:'<em>Portafoglio</em>',en:'<em>Wallet</em>',sub_it:'I tuoi asset: ARIA, ROBI e KAS.',sub_en:'Your assets: ARIA, ROBI and KAS.'},
  archive:{it:'<em>Archivio</em> Airdrop',en:'Airdrop <em>Archive</em>',sub_it:'Tutti gli airdrop completati. Trasparenza totale.',sub_en:'All completed airdrops. Full transparency.'},
  learn:{it:'<em>Impara</em>',en:'<em>Learn</em>',sub_it:'Scopri come funzionano ARIA, ROBI e il motore airdrop.',sub_en:'Learn how ARIA, ROBI and the airdrop engine work.'},
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
  showPage(page);
  var path=PAGE_PATHS[page]||'/esplora';
  if(location.pathname!==path)history.pushState({page:page},null,path);
  // Close mobile menu
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
}

function showPage(page){
  ['home','explore','my','submit','referral','wallet','archive','learn'].forEach(function(t){
    var panel=document.getElementById('tab-'+t);
    if(panel)panel.style.display=page===t?'block':'none';
  });
  // Show/hide page header (not on home page)
  var pageHeader=document.getElementById('page-header');
  if(pageHeader)pageHeader.style.display=page==='home'?'none':'block';
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
  if(page==='home'){loadHomeDashboard();startFeedPolling();}
  if(page==='my'){renderMyAirdrops();loadMySubmissions();}
  if(page==='submit'){loadValuationCost().then(function(){updateSubmitCostUI();});}
  if(page==='referral')loadDappReferral();
  if(page==='wallet')loadDappWallet();
  if(page==='archive')loadDappArchive();
}

// ── Category filter ──
function renderCategoryFilter(){
  var cats=new Set();
  _airdrops.forEach(function(a){if(a.category)cats.add(a.category)});
  var wrap=document.getElementById('cat-filter');
  var html='<button class="cat-pill active" onclick="filterCat(\'all\')"><span class="it">Tutti</span><span class="en">All</span></button>';
  html+='<button class="cat-pill" onclick="filterCat(\'favorites\')">♡ <span class="it">Preferiti</span><span class="en">Favorites</span></button>';
  if(_session&&_session.user)html+='<button class="cat-pill" onclick="filterCat(\'mine\')"><span class="it">Solo miei</span><span class="en">My own</span></button>';
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury',smartphone:'Smartphone',tablet:'Tablet',computer:'Computer',gaming:'Gaming',audio:'Audio',fotografia:'Fotografia',orologi:'Orologi',gioielli:'Gioielli',borse:'Borse',moda:'Moda',biciclette:'Biciclette',arredamento:'Arredamento',sport:'Sport',strumenti:'Strumenti',arte:'Arte',vino:'Vini'};
  cats.forEach(function(c){
    html+='<button class="cat-pill" onclick="filterCat(\''+c+'\')">'+( catLabels[c]||c)+'</button>';
  });
  wrap.innerHTML=html;
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

// ── Category Dashboard ──
var _comingSoonItems=[];
function renderCatDashboard(){
  var wrap=document.getElementById('cat-dashboard');
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

  var html='<div style="flex:0 0 auto;padding:10px 16px;border:1px solid rgba(184,150,12,.2);background:rgba(184,150,12,.04);border-radius:var(--radius-sm);text-align:center;min-width:90px">'
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

function toggleNotifPanel(){
  var panel=document.getElementById('notif-panel');
  if(!panel)return;
  _notifOpen=!_notifOpen;
  panel.style.display=_notifOpen?'block':'none';
  if(_notifOpen)loadNotifications();
}

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
  _notifOpen=false;
  var panel=document.getElementById('notif-panel');
  if(panel)panel.style.display='none';
  // Navigate to miei-airdrop and open all chats
  navigateTo('my');
}

function notifGoToAirdrop(airdropId){
  _notifOpen=false;
  var panel=document.getElementById('notif-panel');
  if(panel)panel.style.display='none';
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
    document.getElementById('notif-panel').style.display='none';
    _notifOpen=false;
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
        dc.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> '
          +'<span class="it">'+(cd.expired?'Deadline scaduta':cd.text+' alla chiusura')+'</span>'
          +'<span class="en">'+(cd.expired?'Deadline expired':cd.en+' to close')+'</span>';
        dc.className='detail-countdown'+(cd.urgent?' urgent':'');
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
  renderCatDashboard();

  if(!list||list.length===0){
    grid.innerHTML='';
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

    var imgHtml=a.image_url
      ?'<img class="card-img" src="'+a.image_url+'" alt="" loading="lazy">'
      :'<div class="card-img-placeholder">'+placeholderSvg+'</div>';

    // Price display: presale shows discounted price + strikethrough sale price
    var currentPrice=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
    var priceHtml=currentPrice+' ARIA / <span class="it">blocco</span><span class="en">block</span>';
    if(isPresale&&a.presale_block_price)priceHtml+='<span class="card-presale-price">'+a.block_price_aria+'</span>';

    var cd=fmtCountdown(a.deadline);
    var cdHtml=cd?'<span class="card-countdown'+(cd.urgent?' urgent':'')+'" data-deadline="'+a.deadline+'">'+(cd.expired?'—':cd.text)+'</span>':'';
    var heartCls=isInWatchlist(a.id)?'heart-btn active':'heart-btn';
    var rankInfo=_myRanks[a.id];
    var rankHtml=rankInfo
      ?'<div class="card-rank"><span class="it">'+rankInfo.rank+'° su '+rankInfo.total+'</span><span class="en">#'+rankInfo.rank+' of '+rankInfo.total+'</span></div>'
      :'';

    return '<div class="card" onclick="goToAirdrop(\''+a.id+'\')">'
      +badge
      +durationBadge(a.duration_type)
      +'<button class="'+heartCls+'" onclick="toggleWatchlist(\''+a.id+'\',event)">♡</button>'
      +imgHtml
      +'<div class="card-body">'
      +'<div class="card-cat">'+(CAT_ICONS[a.category]||'')+' '+(a.category||'')+'</div>'
      +'<div class="card-title">'+a.title+'</div>'
      +cdHtml
      +rankHtml
      +'<div class="card-progress"><div class="card-progress-bar" style="width:'+pct+'%"></div></div>'
      +'<div class="card-footer">'
      +'<span class="card-price">'+priceHtml+'</span>'
      +'<span class="card-remain">'+remaining+' <span class="it">rimasti</span><span class="en">left</span></span>'
      +'</div>'
      +'<div class="card-mining"><span style="color:var(--gold)">⛏</span> '+calcMiningRate(a)+' bl / 1 ROBI</div>'
      +'</div></div>';
  }).join('');
}

// ── Detail ──
var _gridData=[];
var _buyQty=1;

// SVG donut helpers
var DONUT_R=110;
var DONUT_C=2*Math.PI*DONUT_R; // circumference

function donutArc(pct){return (pct/100)*DONUT_C;}

async function openDetail(id){
  var a=_airdrops.find(function(x){return x.id===id});
  if(!a)return;
  _currentDetail=a;
  _buyQty=1;
  document.getElementById('list-view').classList.add('hidden');
  var valBanner=document.getElementById('val-banner');
  if(valBanner)valBanner.style.display='none';
  document.getElementById('cat-filter').style.display='none';
  document.getElementById('detail').classList.add('active');
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
  var myBlocks=_publicMode?0:_gridData.filter(function(b){return b.is_mine}).length;
  var myPct=a.total_blocks>0?(myBlocks/a.total_blocks*100):0;
  var othersPct=pct-myPct;
  var dl=a.deadline?new Date(a.deadline).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';

  // Image blur: 20px at 0%, 0px at 100%
  var blurVal=Math.max(0,20-(pct/100*20));
  var imgStyle='filter:blur('+blurVal.toFixed(1)+'px)';

  _bubbles=[];

  var maxBuy=Math.min(remaining,Math.floor(_balance/a.block_price_aria));
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

  var html=''
    // ── PRODUCT SHEET ──
    +'<div class="product-hero">'
    +'<div class="product-img-wrap">'
    +productImgHtml
    +'<div class="product-badge">Airdrop</div>'
    +'</div>'
    +'<div class="product-info">'
    +(brand?'<div class="product-brand">'+brand+'</div>':'')
    +'<h2 class="product-title">'+a.title+'</h2>'
    +(model?'<div class="product-model">'+model+'</div>':'')
    +'<div class="product-price-row">'
    +'<div class="product-price">'+(isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria)+' ARIA</div>'
    +'<div class="product-price-aria">'
    +(isPresale&&a.presale_block_price?'<span style="text-decoration:line-through;color:var(--gray-400);margin-right:6px">'+a.block_price_aria+'</span>':'')
    +'<span class="it">per blocco</span><span class="en">per block</span> &middot; '+a.total_blocks.toLocaleString('it-IT')+' <span class="it">blocchi totali</span><span class="en">total blocks</span>'
    +(isPresale?' &middot; <span style="color:var(--aria)">PRESALE</span>':'')
    +'</div>'
    +'</div>'
    +(isPresale?'<div style="background:rgba(74,158,255,.08);border:1px solid rgba(74,158,255,.25);padding:8px 12px;margin-top:8px;font-size:12px;color:var(--aria);letter-spacing:.5px"><strong>⛏ 2x MINING BOOST</strong> — <span class="it">Compra in presale e guadagna il doppio dei ROBI</span><span class="en">Buy in presale and earn 2x ROBI</span></div>':'')
    +(condition?'<div class="product-condition">'+condition+'</div>':'')
    +'<div class="detail-cat"><a href="#" onclick="event.preventDefault();backToList();filterCat(\''+a.category+'\');return false" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s" onmouseover="this.style.opacity=\'.7\'" onmouseout="this.style.opacity=\'1\'">'+(CAT_ICONS[a.category]||'')+' '+a.category+'</a></div>'
    +durationBadge(a.duration_type)
    +'</div>'
    +'<button class="'+(isInWatchlist(a.id)?'heart-btn detail active':'heart-btn detail')+'" id="detail-heart" onclick="toggleWatchlist(\''+a.id+'\')">♡</button>'
    +'</div>'

    // ── ACCORDION SECTIONS ──
    // Description (open by default)
    +(a.description?acc('desc','Descrizione','Description','<p class="acc-desc">'+a.description+'</p>',true):'')

    // Highlights
    +(highlights.length>0?acc('highlights','Caratteristiche','Highlights',
      '<ul class="acc-list">'+highlights.map(function(h){return '<li>'+h+'</li>'}).join('')+'</ul>',false)
    :'')

    // What's included
    +(included.length>0?acc('included','Contenuto della confezione','What\'s included',
      '<ul class="acc-list neutral">'+included.map(function(h){return '<li>'+h+'</li>'}).join('')+'</ul>',false)
    :'')

    // Airdrop details
    +acc('airdrop','Dettagli airdrop','Airdrop details',
      '<ul class="acc-list neutral">'
      +'<li><span class="it">Prezzo per blocco:</span><span class="en">Price per block:</span> <strong style="color:var(--aria)">'+a.block_price_aria+' ARIA</strong></li>'
      +'<li><span class="it">Blocchi totali:</span><span class="en">Total blocks:</span> <strong>'+a.total_blocks.toLocaleString('it-IT')+'</strong></li>'
      +'<li><span class="it">Blocchi rimasti:</span><span class="en">Blocks left:</span> <strong>'+remaining.toLocaleString('it-IT')+'</strong></li>'
      +'<li><span class="it">Costo totale airdrop:</span><span class="en">Total airdrop cost:</span> <strong style="color:var(--aria)">'+totalAriaCost.toLocaleString('it-IT')+' ARIA</strong></li>'
      +'<li><span class="it">Mining:</span><span class="en">Mining:</span> <strong style="color:var(--gold)">1 ROBI ogni '+calcMiningRate(a)+' blocchi</strong>'+(isPresale?' <span style="color:var(--aria)">(presale: ogni '+Math.max(1,Math.ceil(calcMiningRate(a)/2))+' blocchi)</span>':'')+'</li>'
      +(dl?'<li><span class="it">Scadenza:</span><span class="en">Deadline:</span> <strong>'+dl+'</strong></li>':'')
      +'</ul>',false)

    // DIVIDER → PARTECIPA
    +'<div class="product-divider">'
    +'<div class="product-participate-label"><span class="it">Partecipa all\'<em>airdrop</em></span><span class="en">Join the <em>airdrop</em></span></div>'
    +'<p class="product-participate-sub"><span class="it">Ogni blocco ti fa guadagnare ROBI — il loro valore cresce nel tempo</span><span class="en">Each block earns you ROBI — their value grows over time</span></p>'
    +'</div>'

    // MY BLOCKS badge
    +(myBlocks>0?'<div class="detail-myblocks"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><span class="it">I tuoi blocchi:</span><span class="en">Your blocks:</span> <strong>'+myBlocks+'</strong> &middot; '+(myBlocks*a.block_price_aria)+' ARIA <span class="it">investiti</span><span class="en">invested</span></div>':'')

    // MINE TOWER 3D
    +buildMineTower(a,myBlocks)

    // STATS
    +'<div class="detail-stats">'
    +'<div class="detail-stat"><div class="detail-stat-val">'+remaining+'</div><div class="detail-stat-label"><span class="it">Rimasti</span><span class="en">Left</span></div></div>'
    +'<div class="detail-stat"><div class="detail-stat-val">'+a.block_price_aria+'</div><div class="detail-stat-label">ARIA/<span class="it">blocco</span><span class="en">block</span></div></div>'
    +'<div class="detail-stat"><div class="detail-stat-val">'+a.total_blocks.toLocaleString('it-IT')+'</div><div class="detail-stat-label"><span class="it">Totali</span><span class="en">Total</span></div></div>'
    +'</div>'

    // Live countdown
    +(a.deadline?'<div class="detail-countdown" id="detail-countdown" data-deadline="'+a.deadline+'"></div>':'')

    // Position live
    +'<div class="detail-position" id="detail-position"></div>'

    // MY STATS panel (solo se partecipante)
    +(myBlocks>0&&!_publicMode?
    '<div class="detail-mystats" id="detail-mystats">'
    +'<div class="mystats-header"><span class="it">Le tue statistiche</span><span class="en">Your stats</span></div>'
    +'<div class="mystats-grid" id="mystats-grid"></div>'
    +'<div class="mystats-history" id="mystats-history"></div>'
    +'</div>'
    :'')

    // BUY BOX — show login CTA in public mode
    +(_publicMode
      ?'<div class="buy-box">'
      +'<div class="buy-box-label"><span class="it">Vuoi partecipare?</span><span class="en">Want to participate?</span></div>'
      +'<p class="buy-box-framing"><span class="it">Registrati gratis per ricevere ARIA ogni giorno e acquistare blocchi in questo airdrop.</span><span class="en">Sign up free to earn ARIA every day and buy blocks in this airdrop.</span></p>'
      +'<a href="/signup?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" class="buy-btn" style="display:block;text-align:center;text-decoration:none"><span class="it">Registrati gratis &rarr;</span><span class="en">Sign up free &rarr;</span></a>'
      +'<a href="/login?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" style="display:block;text-align:center;margin-top:10px;color:var(--gray-400);font-size:13px;text-decoration:none"><span class="it">Hai gi&agrave; un account? Accedi</span><span class="en">Already have an account? Log in</span></a>'
      +'</div>'
      :'<div class="buy-box">'
      +'<div class="buy-box-label"><span class="it">Metti da parte i tuoi ARIA</span><span class="en">Set aside your ARIA</span></div>'
      +'<p class="buy-box-framing"><span class="it">Ogni blocco acquistato ti avvicina all\'oggetto e ti fa guadagnare ROBI — il loro valore cresce nel tempo.</span><span class="en">Each block brings you closer to the item and earns you ROBI — their value grows over time.</span></p>'
      +(isPresale?'<div style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.2);padding:6px 10px;margin-bottom:12px;font-size:11px;color:var(--aria)"><strong>⛏ PRESALE 2x</strong> — <span class="it">In presale ogni blocco guadagna il doppio dei ROBI!</span><span class="en">In presale each block earns double ROBI!</span></div>':'')

      // DISPLAY
      +'<div class="buy-display">'
      +'<div class="buy-display-count" id="buy-display-count">1 <span><span class="it">blocco</span><span class="en">block</span></span></div>'
      +'<div class="buy-display-cost" id="buy-display-cost">= '+a.block_price_aria+' ARIA</div>'
      +'<div class="buy-display-balance"><span class="it">Saldo:</span><span class="en">Balance:</span> '+_balance+' ARIA</div>'
      +'</div>'

      // SLIDER
      +'<div class="buy-slider-wrap">'
      +'<input type="range" class="buy-slider" id="buy-slider" min="1" max="'+(maxBuy||1)+'" value="1" '+(maxBuy<1?'disabled':'')+' oninput="onSlider()">'
      +'<div class="buy-slider-labels"><span>1</span><span>'+(maxBuy||0)+'</span></div>'
      +'</div>'

      // PRESETS
      +'<div class="buy-presets">'
      +(maxBuy>=5?'<button class="buy-preset" onclick="setSlider(5)">5</button>':'')
      +(maxBuy>=10?'<button class="buy-preset" onclick="setSlider(10)">10</button>':'')
      +(maxBuy>=25?'<button class="buy-preset" onclick="setSlider(25)">25</button>':'')
      +(maxBuy>=50?'<button class="buy-preset" onclick="setSlider(50)">50</button>':'')
      +(maxBuy>0?'<button class="buy-preset" onclick="setSlider('+maxBuy+')">Max</button>':'')
      +'</div>'

      // BUY BUTTON
      +'<button class="buy-btn" id="buy-btn" onclick="initBuy()"'+(remaining<=0||maxBuy<1?' disabled':'')+'>'
      +(remaining>0&&maxBuy>=1
        ?'<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>'
        :(remaining<=0?'<span class="it">Esaurito</span><span class="en">Sold out</span>':'<span class="it">ARIA insufficienti</span><span class="en">Not enough ARIA</span>'))
      +'</button>'
      +'<div class="buy-msg" id="buy-msg"></div>'
      +'</div>'
    )

    // ── AUTO-BUY (solo se già partecipante) ──
    +(myBlocks>0?
    '<div class="auto-buy-box" id="auto-buy-box">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--aria);margin-bottom:8px"><span class="it">⚡ AUTO-BUY</span><span class="en">⚡ AUTO-BUY</span></div>'
    +'<p style="font-size:11px;color:var(--gray-400);margin-bottom:10px;line-height:1.4"><span class="it">Compra automaticamente blocchi a intervalli regolari.</span><span class="en">Automatically buy blocks at regular intervals.</span></p>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">BLOCCHI</span><span class="en">BLOCKS</span></label>'
    +'<select id="ab-qty" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"><option>1</option><option>2</option><option>3</option><option>5</option><option>10</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">OGNI</span><span class="en">EVERY</span></label>'
    +'<select id="ab-interval" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"><option value="1">1h</option><option value="2">2h</option><option value="4" selected>4h</option><option value="6">6h</option><option value="12">12h</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px">MAX</label>'
    +'<input type="number" id="ab-max" value="50" min="1" max="500" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px"></div>'
    +'</div>'
    +'<button id="ab-toggle" onclick="toggleAutoBuy(\''+a.id+'\')" style="width:100%;padding:8px;background:var(--aria);color:var(--white);border:none;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;font-weight:700"><span class="it">ATTIVA AUTO-BUY</span><span class="en">ACTIVATE AUTO-BUY</span></button>'
    +'<div id="ab-status" style="margin-top:6px;font-size:10px;color:var(--gray-500);text-align:center"></div>'
    +'</div>'
    :'')

    +'</div>' // close product-divider wrapper

    // ── CONTROL ROOM (solo admin/CEO) ──
    +(_isAdmin?'<div style="margin-top:24px;text-align:center"><button onclick="openControlRoom(\''+id+'\')" style="background:none;border:1px solid var(--gold);color:var(--gold);padding:10px 24px;font-family:var(--font-m);font-size:10px;letter-spacing:2px;cursor:pointer;transition:all .3s" onmouseover="this.style.background=\'var(--gold)\';this.style.color=\'var(--black)\'" onmouseout="this.style.background=\'none\';this.style.color=\'var(--gold)\'">CONTROL ROOM</button></div>':'')
    +'<div id="control-room-panel" style="display:none"></div>';

  document.getElementById('detail-content').innerHTML=html;

  // Start physics simulation for bubbles
  if(_bubbles.length>0)startBubblePhysics();

  // Start countdown ticker
  startCountdowns();

  // Position live — initial + polling (uses calculate_winner_score for real rank)
  refreshPosition(a.id);
  if(_positionInterval)clearInterval(_positionInterval);
  _positionInterval=setInterval(function(){refreshPosition(a.id)},30000);

  // Detail stats (ROBI projection, %, history)
  if(myBlocks>0&&!_publicMode)loadDetailStats(a.id);

  // Auto-buy status
  if(myBlocks>0)loadAutoBuyStatus(a.id);
}

async function loadAutoBuyStatus(airdropId){
  var rule=await loadAutoBuyRule(airdropId);
  var btn=document.getElementById('ab-toggle');
  var status=document.getElementById('ab-status');
  if(!rule||!rule.active){
    if(btn)btn.innerHTML='<span class="it">ATTIVA AUTO-BUY</span><span class="en">ACTIVATE AUTO-BUY</span>';
    if(status)status.textContent='';
    return;
  }
  if(btn){btn.innerHTML='<span class="it">DISATTIVA AUTO-BUY</span><span class="en">DISABLE AUTO-BUY</span>';btn.style.background='var(--red)';}
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  if(status)status.textContent=(lang==='it'?'Attivo: ':'Active: ')+rule.blocks_per_interval+' blocchi ogni '+rule.interval_hours+'h ('+rule.total_bought+'/'+rule.max_blocks+')';
  var qty=document.getElementById('ab-qty');if(qty)qty.value=rule.blocks_per_interval;
  var interval=document.getElementById('ab-interval');if(interval)interval.value=rule.interval_hours;
  var max=document.getElementById('ab-max');if(max)max.value=rule.max_blocks;
}

// ── Position Live ──
function updateDetailPosition(airdropId,scores){
  var el=document.getElementById('detail-position');if(!el)return;
  if(!_session||!scores||scores.length===0){
    var total=scores?scores.length:0;
    el.innerHTML='<span class="it">Entra ora — <strong>'+total+'</strong> partecipanti attivi</span>'
      +'<span class="en">Join now — <strong>'+total+'</strong> active participants</span>';
    el.className='detail-position not-in';
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
    return;
  }
  var myScore=scores.find(function(s){return s.user_id===_session.user.id});
  var f1=myScore?parseFloat(myScore.f1):0;
  var f2=myScore?parseFloat(myScore.f2):0;
  var sc=myScore?parseFloat(myScore.score):0;
  el.innerHTML='<div class="pos-main"><span class="it">Sei <strong>'+pos+'°</strong> su '+total+' partecipanti</span>'
    +'<span class="en">You are <strong>#'+pos+'</strong> of '+total+' participants</span></div>'
    +'<div class="pos-breakdown">'
    +'<span title="Blocchi / Blocks"><span class="pos-label">F1</span> '+f1.toFixed(2)+'</span>'
    +'<span title="Fedeltà categoria / Category loyalty"><span class="pos-label">F2</span> '+f2.toFixed(2)+'</span>'
    +'<span title="Score"><span class="pos-label">S</span> '+sc.toFixed(3)+'</span>'
    +'</div>';
  el.className='detail-position in';
  // Check if position worsened
  if(_lastPosition!==null&&pos>_lastPosition){
    el.classList.add('shake');
    setTimeout(function(){el.classList.remove('shake')},600);
    showToast('<span class="it">Sei stato superato — acquista altri blocchi per risalire</span><span class="en">You\'ve been overtaken — buy more blocks to climb back</span>');
    notifyPositionLost(airdropId);
  }
  _lastPosition=pos;
  // Update cached rank for grid cards
  _myRanks[airdropId]={rank:pos,total:total,score:scores.find(function(s){return s.user_id===_session.user.id})?.score||0};
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

  var gridEl=document.getElementById('mystats-grid');
  if(gridEl){
    var lang=document.documentElement.getAttribute('data-lang')||'it';
    gridEl.innerHTML=''
      +'<div class="mystats-cell">'
      +'<div class="mystats-val" style="color:var(--gold)">'+projectedRobi.toFixed(2)+'</div>'
      +'<div class="mystats-label"><span class="it">ROBI proiettati</span><span class="en">Projected ROBI</span></div>'
      +'</div>'
      +'<div class="mystats-cell">'
      +'<div class="mystats-val" style="color:var(--aria)">'+pctOwned.toFixed(1)+'%</div>'
      +'<div class="mystats-label"><span class="it">Blocchi tuoi</span><span class="en">Your blocks</span></div>'
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
        +'<span>'+p.blocks+' <span class="it">blocchi</span><span class="en">blocks</span></span>'
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
  if(countEl)countEl.innerHTML=_buyQty+' <span><span class="it">'+(_buyQty===1?'blocco':'blocchi')+'</span><span class="en">block'+(_buyQty===1?'':'s')+'</span></span>';
  if(costEl)costEl.innerHTML='= '+cost+' ARIA &middot; <span style="color:var(--gold)">'+sharesStr+' ROBI</span>'+(isPresale?' <span style="color:var(--aria);font-size:10px">2x</span>':'');
}

function goToAirdrop(id){
  window.location.href='/airdrops/'+id;
}

function backToList(){
  stopBubblePhysics();
  document.getElementById('detail').classList.remove('active');
  document.getElementById('detail').style.display='';
  document.getElementById('list-view').classList.remove('hidden');
  document.getElementById('list-view').style.display='';
  document.getElementById('cat-filter').style.display='';
  loadValuationCount();
  history.pushState({page:'explore'},null,'/airdrops');
}

function initBuy(){
  if(!_currentDetail||_buyQty<=0)return;
  var cost=_buyQty*_currentDetail.block_price_aria;
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
  document.getElementById('modal-desc').innerHTML='<span class="it">Stai per acquisire <strong>'+_buyQty+'</strong> '+(_buyQty===1?'blocco':'blocchi')+'.</span><span class="en">You are about to acquire <strong>'+_buyQty+'</strong> block'+(_buyQty===1?'':'s')+'.</span>';
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
        ?data.blocks_bought+' '+(data.blocks_bought===1?'blocco acquisito':'blocchi acquisiti')+' per '+data.aria_spent+' ARIA'
        :data.blocks_bought+' block'+(data.blocks_bought===1?'':'s')+' purchased for '+data.aria_spent+' ARIA');

      // Mining animation — calculate ROBI discovery
      var oldMyBlocks=_gridData?_gridData.filter(function(b){return b.is_mine}).length:0;
      var rate=_currentDetail?calcMiningRate(_currentDetail):50;
      playMiningAnimation(data.blocks_bought,oldMyBlocks,rate);

      _balance=data.new_balance;
      updateBalanceUI();

      // Refresh and re-render detail (after animation)
      var animDur=Math.floor(oldMyBlocks/rate)<Math.floor((oldMyBlocks+data.blocks_bought)/rate)?3200:2000;
      setTimeout(async function(){
        await Promise.all([loadAirdrops(),loadMyParticipations(),loadBalance(),loadMyRanks()]);
        renderGrid();
        openDetail(buy.airdropId);
      },animDur);
    } else {
      var errMsg={
        'INSUFFICIENT_ARIA':'<span class="it">ARIA insufficienti (saldo: '+(data.balance||0)+', costo: '+(data.cost||0)+').</span><span class="en">Not enough ARIA (balance: '+(data.balance||0)+', cost: '+(data.cost||0)+').</span>',
        'NOT_ENOUGH_BLOCKS':'<span class="it">Blocchi non disponibili.</span><span class="en">Blocks not available.</span>',
        'BLOCKS_ALREADY_TAKEN':'<span class="it">Qualcuno ha preso quei blocchi. Riprova.</span><span class="en">Someone took those blocks. Try again.</span>',
        'AIRDROP_NOT_ACTIVE':'<span class="it">Airdrop non attivo.</span><span class="en">Airdrop not active.</span>',
        'AIRDROP_EXPIRED':'<span class="it">Airdrop scaduto.</span><span class="en">Airdrop expired.</span>',
        'INVALID_BLOCK_NUMBER':'<span class="it">Errore blocco.</span><span class="en">Block error.</span>'
      };
      showMsg('err',errMsg[data.error]||'Errore: '+(data.error||'unknown')+(data.detail?' — '+data.detail:''));
      btn.disabled=false;
      btn.classList.remove('loading');
      btn.innerHTML='<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>';
    }
  }catch(e){
    showMsg('err','<span class="it">Errore di rete. Riprova.</span><span class="en">Network error. Try again.</span>');
    btn.disabled=false;
    btn.classList.remove('loading');
    btn.innerHTML='<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>';
  }
  _pendingBuy=null;
}

// ── My airdrops ──
function renderMyAirdrops(){
  var list=document.getElementById('my-list');
  var empty=document.getElementById('my-empty');
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
  if(!items.length){
    list.innerHTML='';
    empty.style.display='block';
    return;
  }
  empty.style.display='none';
  var placeholderSvg='<svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>';
  list.innerHTML=items.map(function(item){
    var a=item.airdrop;
    if(!a)return '';
    var imgHtml=a.image_url
      ?'<img class="my-card-img" src="'+a.image_url+'" alt="" loading="lazy">'
      :'<div class="my-card-img-placeholder">'+placeholderSvg+'</div>';
    var canCancel=true;
    return '<div class="my-card">'
      +'<div style="display:flex;gap:16px;padding:18px;align-items:center;cursor:pointer" onclick="goToAirdrop(\''+a.id+'\')">'
      +imgHtml
      +'<div class="my-card-info">'
      +'<div class="my-card-title">'+a.title+'</div>'
      +'<div class="my-card-meta">'+a.category+' &middot; '+(a.status==='presale'?'<span style="color:var(--aria)">Presale</span>':a.status==='sale'?'<span style="color:var(--kas)">Live</span>':'<span>'+a.status+'</span>')+'</div>'
      +'<div class="my-card-blocks"><strong>'+item.blocks+'</strong> <span class="it">blocchi</span><span class="en">blocks</span> &middot; '+item.spent+' ARIA</div>'
      +'</div></div>'
      +'<div style="display:flex;gap:8px;padding:8px 16px 12px;border-top:1px solid var(--gray-800);align-items:center">'
      +'<button style="display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:7px 14px;font-family:var(--font-b);font-size:11px;font-weight:500;letter-spacing:1px;cursor:pointer;transition:all .25s;border-radius:var(--radius-sm)" onclick="toggleMyChat(\''+a.id+'\')" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'">'
      +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
      +'<span class="it">Messaggi</span><span class="en">Messages</span></button>'
      +(canCancel?'<button class="cancel-part-btn" onclick="confirmCancelParticipation(\''+a.id+'\',\''+escHtml(a.title)+'\','+item.blocks+','+item.spent+')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> <span class="it">Ritira</span><span class="en">Withdraw</span></button>':'')
      +'</div>'
      +'<div id="my-chat-'+a.id+'" style="display:none;padding:0 16px 16px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
      +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:var(--gray-500)"><span class="it">Risposte entro 24/48 ore</span><span class="en">Replies within 24/48 hours</span></div>'
      +'<button onclick="toggleMyChat(\''+a.id+'\')" style="background:none;border:none;color:var(--gray-500);cursor:pointer;font-family:var(--font-m);font-size:10px;letter-spacing:1px;padding:4px 8px;transition:color .2s" onmouseover="this.style.color=\'var(--white)\'" onmouseout="this.style.color=\'var(--gray-500)\'">✕ <span class="it">CHIUDI</span><span class="en">CLOSE</span></button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
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
      ?'Partecipazione ritirata. '+data.blocks_released+' blocchi rilasciati. '+data.aria_lost+' ARIA non rimborsati.'
      :'Participation withdrawn. '+data.blocks_released+' blocks released. '+data.aria_lost+' ARIA not refunded.');
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
}

// ── Control Room (CEO/Admin) ──
async function openControlRoom(airdropId){
  if(!_isAdmin)return;
  var panel=document.getElementById('control-room-panel');
  if(!panel)return;
  panel.style.display='block';
  panel.innerHTML='<div style="text-align:center;padding:40px;color:var(--gray-400)">Loading...</div>';

  var token=await getValidToken();
  if(!token)return;

  // Fetch draw preview (scores, split, success check)
  var preview=await sbRpc('get_draw_preview',{p_airdrop_id:airdropId},token);

  // Fetch participations
  var parts=[];
  try{
    var pRes=await fetch(SB_URL+'/rest/v1/airdrop_participations?airdrop_id=eq.'+airdropId+'&select=user_id,blocks_count,aria_spent',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(pRes.ok)parts=await pRes.json();
  }catch(e){}

  // Fetch presale vs sale blocks
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

  // Fetch treasury
  var treasuryBal=0,nftCirc=0;
  try{
    var tRes=await fetch(SB_URL+'/rest/v1/treasury_stats?select=balance_eur,nft_circulating&order=created_at.desc&limit=1',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(tRes.ok){var tRows=await tRes.json();if(tRows&&tRows[0]){treasuryBal=parseFloat(tRows[0].balance_eur)||0;nftCirc=parseFloat(tRows[0].nft_circulating)||0;}}
  }catch(e){}

  var a=_currentDetail;
  if(!a||!preview||!preview.ok){
    panel.innerHTML='<div style="padding:20px;color:#ef4444">Errore caricamento dati</div>';
    return;
  }

  // KPIs
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

  // Success prediction
  var venditoreEur=preview.split?preview.split.venditore_eur:0;
  var sellerMin=preview.seller_min_price||0;
  var successLabel=preview.success
    ?'<span style="color:var(--kas)">✓ SUCCESS</span>'
    :'<span style="color:#ef4444">✗ BELOW MIN (€'+venditoreEur+' vs €'+sellerMin+')</span>';

  // Top participants (anonymized)
  var userAgg={};
  parts.forEach(function(p){
    if(!userAgg[p.user_id])userAgg[p.user_id]={blocks:0,aria:0};
    userAgg[p.user_id].blocks+=p.blocks_count;
    userAgg[p.user_id].aria+=p.aria_spent;
  });
  var topParts=Object.keys(userAgg).map(function(uid){return{uid:uid.substring(0,6),blocks:userAgg[uid].blocks,aria:userAgg[uid].aria}}).sort(function(a,b){return b.aria-a.aria}).slice(0,5);

  // Scores preview
  var scoresHtml='';
  if(preview.scores&&preview.scores.length){
    scoresHtml='<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:8px">'
      +'<tr style="color:var(--gray-500);border-bottom:1px solid var(--gray-800)"><th style="text-align:left;padding:4px">Rank</th><th>F1</th><th>F2</th><th>F3</th><th>Score</th><th>Blocks</th><th>ARIA</th></tr>';
    preview.scores.slice(0,8).forEach(function(s){
      var isWinner=s.rank===1;
      var rowColor=isWinner?'color:var(--kas)':'';
      scoresHtml+='<tr style="border-bottom:1px solid var(--gray-800);'+rowColor+'">'
        +'<td style="padding:4px">#'+s.rank+(isWinner?' ★':'')+'</td>'
        +'<td style="text-align:center">'+s.f1+'</td>'
        +'<td style="text-align:center">'+s.f2+'</td>'
        +'<td style="text-align:center">'+s.f3+'</td>'
        +'<td style="text-align:center;font-weight:600">'+s.score+'</td>'
        +'<td style="text-align:center">'+s.blocks+'</td>'
        +'<td style="text-align:center">'+s.aria_spent+'</td></tr>';
    });
    scoresHtml+='</table>';
  }

  // Build panel
  var h='<div style="border:1px solid var(--gold);padding:20px;margin-top:12px;background:rgba(184,150,12,.03)">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:2px;color:var(--gold);margin-bottom:16px;display:flex;justify-content:space-between;align-items:center"><span>CONTROL ROOM</span><button onclick="document.getElementById(\'control-room-panel\').style.display=\'none\'" style="background:none;border:none;color:var(--gray-400);cursor:pointer;font-size:16px">&times;</button></div>'

    // KPI grid
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    +crKpi('Partecipanti',uniqueUsers,'utenti unici')
    +crKpi('Fill Rate',fillPct+'%',totalBlks+'/'+a.total_blocks)
    +crKpi('Revenue','€'+totalEur,totalAria+' ARIA')
    +crKpi('Media/Utente',avgPerUser+' AR','€'+(avgPerUser*0.10).toFixed(0)+' eq.')
    +'</div>'

    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">'
    +crKpi('Presale',presaleBlocks+' bl.',presalePct+'% interesse','var(--aria)')
    +crKpi('Sale',saleBlocks+' bl.',(100-presalePct)+'%')
    +crKpi('Mining','div '+divisor,'~'+estShares.toFixed(1)+' quote est.','var(--gold)')
    +crKpi('NFT Price','€'+nftPrice,nftCirc.toFixed(1)+' circ.','var(--gold)')
    +'</div>'

    // Status
    +'<div style="padding:10px 14px;border:1px solid var(--gray-800);margin-bottom:16px;font-size:12px">'
    +'<strong>Status:</strong> '+successLabel
    +'<br><strong>Venditore:</strong> €'+venditoreEur+' / min €'+sellerMin
    +'<br><strong>Split:</strong> Fondo €'+(preview.split?preview.split.fondo_eur:0)+' | Fee €'+(preview.split?preview.split.airoobi_eur:0)
    +'<br><strong>Treasury:</strong> €'+treasuryBal.toFixed(2)+' | Quota: €'+nftPrice
    +'</div>'

    // Top participants
    +'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gray-400);margin-bottom:6px">TOP PARTECIPANTI</div>'
    +'<div style="font-size:11px">'
    +topParts.map(function(p,i){return '<div style="padding:3px 0;border-bottom:1px solid var(--gray-800)">#'+(i+1)+' <span style="font-family:var(--font-mono,monospace)">'+p.uid+'…</span> — '+p.blocks+' bl. — '+p.aria+' AR (€'+(p.aria*0.10).toFixed(0)+')</div>'}).join('')
    +'</div>'

    // Scores leaderboard
    +(scoresHtml?'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gray-400);margin:12px 0 6px">SCORE LEADERBOARD</div>'+scoresHtml:'')

    +'</div>';

  panel.innerHTML=h;
}

function crKpi(label,val,sub,color){
  var c=color||'var(--white)';
  return '<div style="text-align:center">'
    +'<div style="font-size:18px;font-weight:600;color:'+c+'">'+val+'</div>'
    +'<div style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-400);margin-top:2px">'+label+'</div>'
    +(sub?'<div style="font-size:10px;color:var(--gray-500);margin-top:1px">'+sub+'</div>':'')
    +'</div>';
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

// ── Photo management for submission form ──
var _subPhotos=[]; // {type:'url'|'file', url:string, file?:File}
var SUB_MAX_PHOTOS=5;

function renderSubPhotos(){
  var grid=document.getElementById('sub-photos-grid');
  grid.innerHTML='';
  _subPhotos.forEach(function(p,i){
    var div=document.createElement('div');
    div.style.cssText='position:relative;width:80px;height:80px;border-radius:6px;overflow:hidden;border:1px solid var(--gray-700)';
    var img=document.createElement('img');
    img.src=p.url;
    img.style.cssText='width:100%;height:100%;object-fit:cover';
    img.onerror=function(){this.style.display='none';div.style.background='var(--gray-800)';div.innerHTML+='<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--gray-500)">ERR</span>'};
    var del=document.createElement('button');
    del.innerHTML='&times;';
    del.style.cssText='position:absolute;top:2px;right:2px;width:20px;height:20px;background:rgba(0,0,0,.7);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center';
    del.onclick=function(){_subPhotos.splice(i,1);renderSubPhotos()};
    div.appendChild(img);div.appendChild(del);grid.appendChild(div);
  });
}

function handlePhotoFiles(files){
  for(var i=0;i<files.length;i++){
    if(_subPhotos.length>=SUB_MAX_PHOTOS)break;
    var f=files[i];
    if(!f.type.startsWith('image/'))continue;
    _subPhotos.push({type:'file',url:URL.createObjectURL(f),file:f});
  }
  renderSubPhotos();
  document.getElementById('sub-file-input').value='';
}

function promptPhotoUrl(){
  if(_subPhotos.length>=SUB_MAX_PHOTOS){showToast('Max '+SUB_MAX_PHOTOS+' foto');return}
  var url=prompt('URL immagine:');
  if(!url||!url.trim())return;
  url=url.trim();
  _subPhotos.push({type:'url',url:url});
  renderSubPhotos();
}

async function uploadSubPhotos(token){
  var urls=[];
  for(var i=0;i<_subPhotos.length;i++){
    var p=_subPhotos[i];
    if(p.type==='url'){urls.push(p.url);continue}
    var ext=p.file.name.split('.').pop()||'jpg';
    var path=_session.user.id+'/'+Date.now()+'_'+i+'.'+ext;
    var upRes=await fetch(SB_URL+'/storage/v1/object/submissions/'+path,{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':p.file.type,'x-upsert':'true'},
      body:p.file
    });
    if(upRes.ok){
      urls.push(SB_URL+'/storage/v1/object/public/submissions/'+path);
    }
  }
  return urls;
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
    msgEl.className='submit-msg err';return;
  }
  if(!desired||desired<500){
    msgEl.innerHTML='<span class="it">Il prezzo desiderato deve essere almeno €500.</span><span class="en">Desired price must be at least €500.</span>';
    msgEl.className='submit-msg err';return;
  }
  if(!minP||minP<500){
    msgEl.innerHTML='<span class="it">Il prezzo minimo deve essere almeno €500.</span><span class="en">Min price must be at least €500.</span>';
    msgEl.className='submit-msg err';return;
  }
  if(minP>desired){
    msgEl.innerHTML='<span class="it">Il prezzo minimo non può superare il desiderato.</span><span class="en">Min price cannot exceed desired price.</span>';
    msgEl.className='submit-msg err';return;
  }
  if(_balance<_valuationCost){
    msgEl.innerHTML='<span class="it">Saldo ARIA insufficiente. Servono '+_valuationCost+' ARIA.</span><span class="en">Insufficient ARIA balance. '+_valuationCost+' ARIA required.</span>';
    msgEl.className='submit-msg err';return;
  }
  var btn=document.getElementById('sub-btn');
  btn.disabled=true;btn.classList.add('loading');
  try{
    var token=await getValidToken();
    // Upload file photos to storage, collect all URLs
    var photoUrls=await uploadSubPhotos(token);
    var mainImg=photoUrls.length>0?photoUrls[0]:null;
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
        p_image_urls:photoUrls
      })
    });
    if(res.ok){
      var result=await res.json();
      if(result.success){
        _balance=result.new_balance;
        updateBalanceUI();
        updateSubmitCostUI();
        msgEl.innerHTML='<span class="it">Valutazione acquistata! '+result.aria_spent+' ARIA dedotti. Riceverai un riscontro entro 24-48h.</span><span class="en">Valuation purchased! '+result.aria_spent+' ARIA deducted. You\'ll hear back within 24-48h.</span>';
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
      }
    } else {
      console.error('Submit error:',await res.text());
      msgEl.innerHTML='<span class="it">Errore nell\'invio. Riprova.</span><span class="en">Submission error. Try again.</span>';
      msgEl.className='submit-msg err';
    }
  }catch(e){
    console.error('submitObject catch:',e);
    msgEl.innerHTML='<span class="it">Errore di rete.</span><span class="en">Network error.</span>';
    msgEl.className='submit-msg err';
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

function renderMySubmissions(subs){
  var container=document.getElementById('my-submissions');
  var emptyEl=document.getElementById('my-submissions-empty');
  if(!container)return;
  if(!subs||subs.length===0){
    container.innerHTML='';
    if(emptyEl)emptyEl.style.display='block';
    return;
  }
  if(emptyEl)emptyEl.style.display='none';
  var statusLabels={
    'in_valutazione':{it:'In valutazione',en:'Under evaluation',cls:'status-pending'},
    'valutazione_completata':{it:'Valutazione completata',en:'Evaluation complete',cls:'status-ready'},
    'presale':{it:'Pre-vendita',en:'Pre-sale',cls:'status-live'},
    'sale':{it:'In vendita',en:'On sale',cls:'status-live'},
    'dropped':{it:'Draw eseguito',en:'Draw executed',cls:'status-done'},
    'completed':{it:'Completato',en:'Completed',cls:'status-done'},
    'rifiutato_min500':{it:'Rifiutato (min €500)',en:'Rejected (min €500)',cls:'status-rejected'},
    'rifiutato_generico':{it:'Rifiutato',en:'Rejected',cls:'status-rejected'},
    'annullato':{it:'Annullato',en:'Cancelled',cls:'status-rejected'}
  };
  var html='';
  for(var i=0;i<subs.length;i++){
    var s=subs[i];
    var st=statusLabels[s.status]||{it:s.status,en:s.status,cls:'status-default'};
    var date=new Date(s.created_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'});
    var quotation=s.object_value_eur>0?'€'+parseFloat(s.object_value_eur).toFixed(2):'—';
    html+='<div style="border:1px solid var(--gray-800);padding:16px 20px;margin-bottom:12px">';
    html+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
    html+='<div style="font-family:var(--font-h);font-size:18px;font-weight:400;color:var(--white)">'+escHtml(s.title)+'</div>';
    html+='<span class="'+st.cls+'" style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;white-space:nowrap"><span class="it">'+st.it+'</span><span class="en">'+st.en+'</span></span>';
    html+='</div>';
    html+='<div style="display:flex;gap:24px;font-size:12px;color:var(--gray-400);margin-bottom:8px">';
    html+='<span>'+date+'</span>';
    html+='<span>'+escHtml(s.category)+'</span>';
    html+='</div>';
    html+='<div style="display:flex;gap:24px;font-size:13px">';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Desiderato:</span><span class="en">Desired:</span></span> <span style="color:var(--white)">€'+parseFloat(s.seller_desired_price).toFixed(2)+'</span></div>';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Minimo:</span><span class="en">Min:</span></span> <span style="color:var(--white)">€'+parseFloat(s.seller_min_price).toFixed(2)+'</span></div>';
    html+='<div><span style="color:var(--gray-500)"><span class="it">Quotazione:</span><span class="en">Quote:</span></span> <span style="color:var(--gold)">'+quotation+'</span></div>';
    html+='</div>';
    if(s.rejection_reason){
      html+='<div style="margin-top:8px;padding:8px 12px;border-left:3px solid #ef4444;background:rgba(239,68,68,.06);font-size:12px;color:#ef4444">'+escHtml(s.rejection_reason)+'</div>';
    }
    var canWithdraw=s.status!=='annullato'&&s.status!=='completed'&&s.status!=='closed';
    var isValutazioneCompletata=s.status==='valutazione_completata';
    html+='<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">';
    html+='<button onclick="this.style.display=\'none\';loadAirdropChat(\''+s.id+'\',\'sub-chat-'+s.id+'\')" style="background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'"><span class="it">MESSAGGI</span><span class="en">MESSAGES</span></button>';
    if(isValutazioneCompletata){
      html+='<button onclick="acceptValuation(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.4);color:#22c55e;padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;font-weight:600;cursor:pointer;transition:all .2s" onmouseover="this.style.background=\'rgba(34,197,94,.2)\';this.style.borderColor=\'#22c55e\'" onmouseout="this.style.background=\'rgba(34,197,94,.1)\';this.style.borderColor=\'rgba(34,197,94,.4)\'"><span class="it">ACCETTA</span><span class="en">ACCEPT</span></button>';
      html+='<button onclick="withdrawSubmission(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:none;border:1px solid rgba(239,68,68,.3);color:rgba(239,68,68,.7);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'rgba(239,68,68,.3)\';this.style.color=\'rgba(239,68,68,.7)\'"><span class="it">RIFIUTA</span><span class="en">REJECT</span></button>';
    }else if(canWithdraw){
      html+='<button onclick="withdrawSubmission(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\'")+'\')" style="background:none;border:1px solid rgba(239,68,68,.3);color:rgba(239,68,68,.7);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'rgba(239,68,68,.3)\';this.style.color=\'rgba(239,68,68,.7)\'"><span class="it">RITIRA</span><span class="en">WITHDRAW</span></button>';
    }
    html+='</div>';
    html+='<div id="sub-chat-'+s.id+'" style="margin-top:8px"></div>';
    html+='</div>';
  }
  container.innerHTML=html;
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
        var align=isMine?'flex-end':'flex-start';
        var bg=isMine?'rgba(184,150,12,.12)':'rgba(74,158,255,.08)';
        var border=isMine?'var(--gold)':'var(--aria)';
        var label=isMine?(m.is_admin?'AIROOBI':'Tu'):(m.is_admin?'AIROOBI':'Utente');
        var time=new Date(m.created_at).toLocaleString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
        html+='<div style="display:flex;justify-content:'+align+';margin-bottom:8px">';
        html+='<div style="max-width:80%;padding:10px 14px;background:'+bg+';border-left:3px solid '+border+';font-size:13px">';
        html+='<div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:4px"><span style="font-family:var(--font-m);font-size:10px;letter-spacing:1px;color:'+border+'">'+label+'</span><span style="font-family:var(--font-m);font-size:9px;color:var(--gray-500)">'+time+'</span></div>';
        html+='<div style="color:var(--white);line-height:1.5">'+escHtml(m.body)+'</div>';
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
  document.getElementById('approve-info').innerHTML='<strong>'+a.title+'</strong><br>Categoria: '+a.category+' &middot; Valore: <strong>€'+val.toLocaleString('it-IT')+'</strong><br>Suggerimento: ~'+sugBlocks+' blocchi × '+sugPrice+' ARIA = €'+(sugBlocks*sugPrice*0.20).toLocaleString('it-IT')+' revenue';
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
  if(!price||price<1||!blocks||blocks<1){alert('Prezzo e blocchi obbligatori');return;}
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
    var tRes=await fetch(SB_URL+'/rest/v1/treasury_funds?select=amount_eur,treasury_pct',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    var treasuryBal=0;
    if(tRes.ok){
      var tRows=await tRes.json();
      if(tRows)tRows.forEach(function(r){
        var amt=parseFloat(r.amount_eur)||0;
        var pct=r.treasury_pct!=null?parseInt(r.treasury_pct):100;
        treasuryBal+=amt*(pct/100);
      });
    }
    // Get total ROBI via RPC (bypasses RLS)
    var robiRes=await fetch(SB_URL+'/rest/v1/rpc/admin_get_all_robi',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}});
    var totalRobi=0;
    if(robiRes.ok){var rd=await robiRes.json();rd.forEach(function(r){totalRobi+=parseFloat(r.shares)||0;});}
    var unitVal=totalRobi>0?(treasuryBal/totalRobi):0;
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
        var glowBg=isAlpha?'radial-gradient(ellipse at center,rgba(184,150,12,.08) 0%,transparent 70%)':'none';
        return '<div style="padding:24px 16px;border:1px solid '+borderColor+';border-radius:var(--radius-sm);text-align:center;background:'+glowBg+';position:relative;overflow:hidden">'+
          (isAlpha?'<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:100px;height:100px;background:radial-gradient(circle,rgba(184,150,12,.12) 0%,transparent 70%);pointer-events:none"></div>':'')+
          '<div style="font-size:36px;margin-bottom:10px;filter:drop-shadow(0 0 8px rgba(184,150,12,.3))'+(isAlpha?'':'')+'">'+(isAlpha?'&#9813;':'&#9734;')+'</div>'+
          '<div style="font-family:var(--font-h);font-size:14px;letter-spacing:2px;color:'+(isAlpha?'var(--gold)':'var(--white)')+';margin-bottom:4px;text-transform:uppercase">'+label+'</div>'+
          (isAlpha?'<div style="font-family:var(--font-m);font-size:9px;letter-spacing:2px;color:rgba(184,150,12,.5);margin-bottom:6px">FOUNDER · TOP 1000</div>':'')+
          '<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-500)">'+new Date(b.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'})+'</div>'+
          '</div>';
      }).join('');
    }
  }catch(e){}

  // Valuation badges
  try{
    var valCards=cards.filter(function(c){return c.nft_type==='VALUATION'});
    var valGrid=document.getElementById('dapp-valuation-grid');
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
      valGrid.innerHTML=valCards.map(function(v,i){
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

  // Category alerts + ROBI history + Wishlist
  renderCategoryAlertsUI(token);
  loadRobiHistory(token);
  loadWishlistAlerts();
}

async function renderCategoryAlertsUI(token){
  var grid=document.getElementById('category-alerts-grid');
  if(!grid)return;
  var cats=await sbGet('categories?is_active=eq.true&order=sort_order',token)||[];
  var alerts=await loadCategoryAlerts();
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  grid.innerHTML=cats.map(function(c){
    var checked=alerts.indexOf(c.slug)!==-1;
    return '<label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid '+(checked?'rgba(184,150,12,.3)':'var(--gray-700)')+';background:'+(checked?'rgba(184,150,12,.04)':'transparent')+';cursor:pointer;font-size:12px;color:var(--white);transition:all .2s">'
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
    h+='<div style="padding:12px;border:1px solid var(--gold);background:rgba(184,150,12,.04);margin-bottom:16px;text-align:center">';
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
      var w=canvas.offsetWidth;var h=48;
      canvas.width=w*dpr;canvas.height=h*dpr;
      ctx.scale(dpr,dpr);
      // Cumulative ROBI over time
      var sorted=items.slice().reverse();
      var cum=0;var pts=[];
      sorted.forEach(function(it){cum+=parseFloat(it.shares)||0;pts.push(cum);});
      var max=Math.max.apply(null,pts)||1;
      ctx.strokeStyle='#B8960C';ctx.lineWidth=1.5;ctx.beginPath();
      pts.forEach(function(v,i){
        var x=(i/(pts.length-1||1))*w;var y=h-(v/max)*(h-4)-2;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();
      // Fill
      ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
      ctx.fillStyle='rgba(184,150,12,.08)';ctx.fill();
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
    var icons={purchase:'◆',new_airdrop:'⚡',activity:'👥',robi:'🏆'};
    el.innerHTML=data.slice(0,6).map(function(item){
      var text=lang==='it'?(item.text_it||item.text_en):(item.text_en||item.text_it);
      var time=item.time?new Date(item.time).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'';
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--gray-800);font-size:12px;color:var(--gray-300);line-height:1.4">'
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
    var interval=parseInt(document.getElementById('ab-interval')?document.getElementById('ab-interval').value:4)||4;
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

// ── Archive tab ──
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
      html+='<div class="past-card-cat">'+esc(catLabel)+'</div>';
      html+='<div class="past-card-title">'+esc(a.title)+'</div>';
      html+='<div class="past-card-stats">';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">'+(isIt?'PARTECIPANTI':'PARTICIPANTS')+'</span><span class="past-card-stat-value">'+((a.partecipanti||0).toLocaleString())+'</span></div>';
      html+='<div class="past-card-stat"><span class="past-card-stat-label">'+(isIt?'BLOCCHI':'BLOCKS')+'</span><span class="past-card-stat-value">'+(a.blocks_sold||0)+'/'+(a.total_blocks||0)+'</span></div>';
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
    it:'Il tuo saldo ARIA. Ora siamo in fase testnet: li ricevi gratis dal faucet (100/gg) e dal check-in (50/gg). Li usi per acquistare blocchi negli airdrop.',
    en:'Your ARIA balance. We\'re in testnet: get them free from the faucet (100/day) and check-in (50/day). Use them to buy blocks in airdrops.'
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
