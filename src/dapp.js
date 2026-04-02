// ── Config ──
var SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

// ── State ──
var _session=null;
var _balance=0;
var ARIA_EUR=0.20; // 1 ARIA = €0.20
function eur(aria){return '€'+(aria*ARIA_EUR).toFixed(2).replace('.',',')}
function escHtml(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'';}
function updateBalanceUI(){document.getElementById('topbar-bal').textContent=_balance+' ARIA ('+eur(_balance)+')';}
var _airdrops=[];
var _myParts=[];
var _currentFilter='all';
var _currentDetail=null;
var _pendingBuy=null;
var _isAdmin=false;
var _isManager=false;
var _managerCats=[];
var _allAirdrops=[];
var _boFilter='in_valutazione';
var _boTarget=null;

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
  // Check if token is expired by decoding JWT
  try{
    var payload=JSON.parse(atob(_session.access_token.split('.')[1]));
    if(payload.exp*1000<Date.now()+60000){
      // Token expires in less than 60s, refresh it
      var ok=await refreshToken();
      if(!ok){window.location.href='/login';return null;}
    }
  }catch(e){}
  return _session.access_token;
}

// ── Init ──
document.addEventListener('DOMContentLoaded',async function(){
  if(!requireAuth())return;
  // Refresh token if needed before anything
  var token=await getValidToken();
  if(!token)return;
  setupUI();
  await Promise.all([loadBalance(),loadAirdrops(),loadMyParticipations(),checkUserRoles()]);
  renderGrid();
  renderStats();
  renderCategoryFilter();
  loadValuationCount();
  // Route to correct page based on URL path
  var pp=location.pathname;
  var initialPage=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')?'explore':'home');
  // Check for /airdrops/UUID deep link
  var airdropMatch=pp.match(/^\/airdrops\/([0-9a-f-]{36})$/);
  // Also support legacy ?id= param
  var urlId=airdropMatch?airdropMatch[1]:new URLSearchParams(location.search).get('id');
  if(urlId){
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
  document.getElementById('topbar-mobile-menu').classList.toggle('active');
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
  // ARIA balance
  document.getElementById('home-aria').innerHTML=_balance+'<small style="display:block;font-size:11px;color:var(--gray-400);font-family:var(--font-m);margin-top:2px">'+eur(_balance)+'</small>';
  // ROBI count (nft_type = ROBI or NFT_REWARD)
  try{
    var nfts=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&nft_type=in.(ROBI,NFT_REWARD)&select=id,shares',token);
    var robiCount=0;
    if(nfts)for(var ni=0;ni<nfts.length;ni++){
      robiCount+=parseFloat(nfts[ni].shares)||1;
    }
    document.getElementById('home-robi').textContent=robiCount%1===0?robiCount:robiCount.toFixed(2);
  }catch(e){document.getElementById('home-robi').textContent='0'}
  // Participations count + blocks + spent
  var totalBlocks=0,totalSpent=0;
  _myParts.forEach(function(p){totalBlocks+=p.blocks_count||0;totalSpent+=p.aria_spent||0});
  document.getElementById('home-airdrops').textContent=_myParts.length;
  document.getElementById('home-blocks').textContent=totalBlocks;
  document.getElementById('home-spent').textContent=totalSpent+' ARIA ('+eur(totalSpent)+')';
  // Today's points
  try{
    var today=new Date().toISOString().slice(0,10);
    var pts=await sbGet('points_ledger?user_id=eq.'+_session.user.id+'&created_at=gte.'+today+'T00:00:00&select=points',token);
    var todayPts=0;
    if(pts)pts.forEach(function(p){todayPts+=p.points||0});
    document.getElementById('home-today').textContent=todayPts+' ARIA ('+eur(todayPts)+')';
  }catch(e){}
  // Streak
  try{
    var prof=await sbGet('profiles?id=eq.'+_session.user.id+'&select=streak_count',token);
    if(prof&&prof[0])document.getElementById('home-streak').innerHTML=prof[0].streak_count+' <span class="it">giorni</span><span class="en">days</span>';
  }catch(e){}
  // Check faucet status
  checkFaucetStatus();
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
      btn.textContent=lang==='it'?'+100 ARIA di test ricevuti!':'+100 test ARIA received!';
      showToast('<span style="color:var(--kas)">+100 ARIA</span> faucet');
      // Refresh dashboard stats
      var homeAria=document.getElementById('home-aria');
      if(homeAria)homeAria.innerHTML=_balance+'<small style="display:block;font-size:11px;color:var(--gray-400);font-family:var(--font-m);margin-top:2px">'+eur(_balance)+'</small>';
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
  // Calculate time to midnight UTC
  var now=new Date();
  var midnight=new Date(now);midnight.setUTCHours(24,0,0,0);
  var diff=midnight-now;
  var h=Math.floor(diff/3600000);var m=Math.floor((diff%3600000)/60000);
  status.style.display='block';status.style.color='var(--gray-400)';
  status.innerHTML=(lang==='it'?'Prossimi ARIA tra ':'Next ARIA in ')+h+'h '+m+'m';
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
      whatsapp:'*AIROOBI* — Realizza il tuo desiderio.\n\nOggetti reali di valore, a un prezzo ridicolo. Ricevi ARIA di test gratis ogni giorno e usali per partecipare. Più ARIA muovi, più conti per l\'airdrop finale.\n\nRegistrati col mio link e inserisci il codice amico *'+refCode+'*.\n\nAlpha Brave: solo 1.000 posti.\n',
      telegram:'AIROOBI — Realizza il tuo desiderio.\n\nOggetti reali di valore, a un prezzo ridicolo. Ricevi ARIA di test gratis ogni giorno e usali per partecipare. Più ARIA muovi, più conti per l\'airdrop finale.\n\nRegistrati col mio link e inserisci il codice amico '+refCode+'.\n\nAlpha Brave: solo 1.000 posti.\n',
      x:'Realizza il tuo desiderio su @airoobi_com\n\nOggetti reali di valore, a un prezzo ridicolo. ARIA di test gratis.\n\nCodice amico: '+refCode+'. Alpha Brave: 1.000 posti. ',
      email_subject:'AIROOBI — Realizza il tuo desiderio.',
      email_body:'Ciao,\n\nsono entrato in AIROOBI e volevo portarti dentro. Oggetti reali di valore, a un prezzo ridicolo. Ricevi ARIA di test gratis ogni giorno e usali per partecipare. Più ARIA muovi, più conti per l\'airdrop finale.\n\nRegistrati col mio link e inserisci il codice amico '+refCode+'.\n\nAlpha Brave: solo 1.000 posti.\n\n'+link
    },
    en:{
      whatsapp:'*AIROOBI* — Make your desire real.\n\nReal valuable objects, at an unbelievable price. Get free test ARIA every day and use them to participate. The more you move, the more you count for the final airdrop.\n\nSign up with my link and enter friend code *'+refCode+'*.\n\nAlpha Brave: only 1,000 spots.\n',
      telegram:'AIROOBI — Make your desire real.\n\nReal valuable objects, at an unbelievable price. Get free test ARIA every day and use them to participate. The more you move, the more you count for the final airdrop.\n\nSign up with my link and enter friend code '+refCode+'.\n\nAlpha Brave: only 1,000 spots.\n',
      x:'Make your desire real on @airoobi_com\n\nReal valuable objects, unbelievable prices. Free test ARIA daily.\n\nFriend code: '+refCode+'. Alpha Brave: 1,000 spots. ',
      email_subject:'AIROOBI — Make your desire real.',
      email_body:'Hey,\n\nI joined AIROOBI and wanted to bring you in. Real valuable objects, at an unbelievable price. Get free test ARIA every day and use them to participate. The more you move, the more you count for the final airdrop.\n\nSign up with my link and enter friend code '+refCode+'.\n\nAlpha Brave: only 1,000 spots.\n\n'+link
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
  if(profs&&profs.length>0)_balance=profs[0].total_points||0;
  document.getElementById('topbar-bal').textContent=_balance+' ARIA ('+eur(_balance)+')';
}

async function loadAirdrops(){
  _airdrops=await sbGet('airdrops?status=in.(presale,sale)&order=created_at.desc',_session.access_token)||[];
}

async function loadMyParticipations(){
  _myParts=await sbGet('airdrop_participations?user_id=eq.'+_session.user.id+'&select=*,airdrops(id,title,category,image_url,block_price_aria,total_blocks,blocks_sold,status)&order=created_at.desc',_session.access_token)||[];
}

// ── Page routing ──
var _isApp=location.hostname==='airoobi.app'||location.hostname==='www.airoobi.app';
var PAGE_PATHS=_isApp
  ?{home:'/',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/referral',wallet:'/portafoglio',archive:'/archivio',learn:'/impara',manage:'/gestione'}
  :{home:'/dapp',explore:'/airdrops',my:'/miei-airdrop',submit:'/proponi',referral:'/referral-dapp',wallet:'/portafoglio-dapp',archive:'/archivio',learn:'/impara',manage:'/gestione'};
var PATH_TO_PAGE={'/':'home','/dapp':'home','/dapp.html':'home','/airdrops':'explore','/esplora':'explore','/miei-airdrop':'my','/proponi':'submit','/referral-dapp':'referral','/referral':'referral','/portafoglio-dapp':'wallet','/portafoglio':'wallet','/archivio':'archive','/impara':'learn','/gestione':'manage'};
var PAGE_HEADERS={
  explore:{it:'<em>Airdrops</em>',en:'<em>Airdrops</em>',sub_it:'Usa i tuoi ARIA per partecipare. Ogni blocco acquistato ti avvicina all\'oggetto.',sub_en:'Use your ARIA to participate. Each block purchased brings you closer.'},
  my:{it:'I miei <em>Airdrop</em>',en:'My <em>Airdrops</em>',sub_it:'Segui le tue partecipazioni e i blocchi acquistati.',sub_en:'Track your participations and purchased blocks.'},
  submit:{it:'<b>Valuta</b> il tuo <em>oggetto</em>',en:'<b>Evaluate</b> your <em>item</em>',sub_it:'Hai un oggetto di valore? Mettilo in airdrop su AIROOBI.',sub_en:'Have a valuable item? Put it on airdrop on AIROOBI.'},
  referral:{it:'<em>Referral</em>',en:'<em>Referral</em>',sub_it:'Invita amici e ricevi ARIA di test bonus.',sub_en:'Invite friends and get bonus test ARIA.'},
  wallet:{it:'<em>Portafoglio</em>',en:'<em>Wallet</em>',sub_it:'I tuoi asset: ARIA, ROBI e KAS.',sub_en:'Your assets: ARIA, ROBI and KAS.'},
  archive:{it:'<em>Archivio</em> Airdrop',en:'Airdrop <em>Archive</em>',sub_it:'Tutti gli airdrop completati. Trasparenza totale.',sub_en:'All completed airdrops. Full transparency.'},
  learn:{it:'<em>Impara</em>',en:'<em>Learn</em>',sub_it:'Scopri come funzionano ARIA, ROBI e il motore airdrop.',sub_en:'Learn how ARIA, ROBI and the airdrop engine work.'},
  manage:{it:'<em>Gestione</em> Airdrop',en:'Airdrop <em>Management</em>',sub_it:'Backoffice valutazione e gestione airdrop.',sub_en:'Evaluation and airdrop management backoffice.'}
};

function navigateTo(page,event){
  if(event)event.preventDefault();
  showPage(page);
  var path=PAGE_PATHS[page]||'/esplora';
  if(location.pathname!==path)history.pushState({page:page},null,path);
  // Close mobile menu
  var mob=document.getElementById('topbar-mobile-menu');
  if(mob)mob.classList.remove('active');
}

function showPage(page){
  ['home','explore','my','submit','referral','wallet','archive','learn','manage'].forEach(function(t){
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
  if(page==='home')loadHomeDashboard();
  if(page==='my'){renderMyAirdrops();loadMySubmissions();}
  if(page==='submit'){loadValuationCost().then(function(){updateSubmitCostUI();});}
  if(page==='referral')loadDappReferral();
  if(page==='wallet')loadDappWallet();
  if(page==='archive')loadDappArchive();
  if(page==='manage'&&_isManager)loadBoData();
}

// ── Category filter ──
function renderCategoryFilter(){
  var cats=new Set();
  _airdrops.forEach(function(a){if(a.category)cats.add(a.category)});
  var wrap=document.getElementById('cat-filter');
  var html='<button class="cat-pill active" onclick="filterCat(\'all\')"><span class="it">Tutti</span><span class="en">All</span></button>';
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury'};
  cats.forEach(function(c){
    html+='<button class="cat-pill" onclick="filterCat(\''+c+'\')">'+( catLabels[c]||c)+'</button>';
  });
  wrap.innerHTML=html;
}

function filterCat(cat){
  _currentFilter=cat;
  // Update pills
  document.querySelectorAll('.cat-pill').forEach(function(p){
    var isCat=cat==='all'?p.textContent.match(/Tutti|All/):p.textContent.toLowerCase()===cat.toLowerCase();
    p.classList.toggle('active',!!isCat);
  });
  renderGrid();
}

// ── Stats ──
function renderStats(){
  // stats-bar removed from UI — function kept for internal use
}

// ── Grid ──
function renderGrid(){
  var grid=document.getElementById('grid');
  var empty=document.getElementById('empty');
  var list=_currentFilter==='all'?_airdrops:_airdrops.filter(function(a){return a.category===_currentFilter});
  renderStats();

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
    var priceHtml=currentPrice+' ARIA <span class="card-eur">('+eur(currentPrice)+')</span> / <span class="it">blocco</span><span class="en">block</span>';
    if(isPresale&&a.presale_block_price)priceHtml+='<span class="card-presale-price">'+a.block_price_aria+'</span>';

    return '<div class="card" onclick="goToAirdrop(\''+a.id+'\')">'
      +badge+imgHtml
      +'<div class="card-body">'
      +'<div class="card-cat">'+(a.category||'')+'</div>'
      +'<div class="card-title">'+a.title+'</div>'
      +'<div class="card-progress"><div class="card-progress-bar" style="width:'+pct+'%"></div></div>'
      +'<div class="card-footer">'
      +'<span class="card-price">'+priceHtml+'</span>'
      +'<span class="card-remain">'+remaining+' <span class="it">rimasti</span><span class="en">left</span></span>'
      +'</div>'
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
  document.getElementById('val-banner').style.display='none';
  document.getElementById('cat-filter').style.display='none';
  document.getElementById('detail').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});

  // Load grid data + participants
  var token=await getValidToken();
  var gridPromise=sbRpc('get_airdrop_grid',{p_airdrop_id:id},token);
  var partPromise=sbRpc('get_airdrop_participants',{p_airdrop_id:id},token);
  _gridData=await gridPromise||[];
  if(!Array.isArray(_gridData))_gridData=[];
  var participants=await partPromise||[];
  if(!Array.isArray(participants))participants=[];

  var remaining=a.total_blocks-a.blocks_sold;
  var pct=a.total_blocks>0?(a.blocks_sold/a.total_blocks*100):0;
  var isPresale=a.status==='presale';
  var myBlocks=_gridData.filter(function(b){return b.is_mine}).length;
  var myPct=a.total_blocks>0?(myBlocks/a.total_blocks*100):0;
  var othersPct=pct-myPct;
  var dl=a.deadline?new Date(a.deadline).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';

  // Image blur: 20px at 0%, 0px at 100%
  var blurVal=Math.max(0,20-(pct/100*20));
  var imgStyle='filter:blur('+blurVal.toFixed(1)+'px)';

  var centerImgHtml=a.image_url
    ?'<img class="donut-center-img" src="'+a.image_url+'" alt="" style="'+imgStyle+'" id="donut-img">'
    :'';

  // Build floating bubbles HTML — physics-driven
  var symbolUrl='/public/images/AIROOBI_Symbol_White.png';
  var bubblesHtml='<div class="bubbles-layer" id="bubbles-layer">';
  var maxP=Math.min(participants.length,12);
  _bubbles=[];
  for(var pi=0;pi<maxP;pi++){
    var pp=participants[pi];
    var sz=Math.max(26,Math.min(46,20+pp.blocks*3));
    var innerHtml=pp.avatar_url
      ?'<img src="'+pp.avatar_url+'" alt="">'
      :'<img class="bubble-symbol" src="'+symbolUrl+'" alt="">';
    bubblesHtml+='<div class="bubble" id="bubble-'+pi+'" style="width:'+sz+'px;height:'+sz+'px">'+innerHtml+'</div>';
    // Init physics: random position inside circle, random velocity
    var angle=Math.random()*Math.PI*2;
    var dist=Math.random()*0.25; // start near center (normalized 0-0.5 = edge)
    _bubbles.push({
      idx:pi, r:sz/2,
      x:0.5+Math.cos(angle)*dist, y:0.5+Math.sin(angle)*dist, // normalized 0..1
      vx:(Math.random()-0.5)*0.0008,
      vy:(Math.random()-0.5)*0.0008
    });
  }
  bubblesHtml+='</div>';

  var centerHtml=centerImgHtml+bubblesHtml;

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
    +'<div class="detail-cat">'+a.category+'</div>'
    +'</div>'
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
      +'<li><span class="it">Mining:</span><span class="en">Mining:</span> <strong style="color:var(--gold)">1 quota ogni '+Math.max(1,Math.ceil((a.object_value_eur||500)/100))+' blocchi</strong>'+(isPresale?' <span style="color:var(--aria)">(presale: ogni '+Math.max(1,Math.ceil((a.object_value_eur||500)/200))+' blocchi)</span>':'')+'</li>'
      +(dl?'<li><span class="it">Scadenza:</span><span class="en">Deadline:</span> <strong>'+dl+'</strong></li>':'')
      +'</ul>',false)

    // DIVIDER → PARTECIPA
    +'<div class="product-divider">'
    +'<div class="product-participate-label"><span class="it">Partecipa all\'<em>airdrop</em></span><span class="en">Join the <em>airdrop</em></span></div>'
    +'<p class="product-participate-sub"><span class="it">Ogni blocco ti fa guadagnare ROBI — il loro valore cresce nel tempo</span><span class="en">Each block earns you ROBI — their value grows over time</span></p>'
    +'</div>'

    // MY BLOCKS (above donut)
    +(myBlocks>0?'<div class="detail-myblocks"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><span class="it">I tuoi blocchi:</span><span class="en">Your blocks:</span> <strong>'+myBlocks+'</strong> &middot; '+(myBlocks*a.block_price_aria)+' ARIA <span class="it">investiti</span><span class="en">invested</span></div>':'')

    // DONUT
    +'<div class="donut-wrap">'
    +'<svg class="donut-svg" viewBox="0 0 240 240">'
    +'<circle class="donut-bg" cx="120" cy="120" r="'+DONUT_R+'" />'
    +'<circle class="donut-others" cx="120" cy="120" r="'+DONUT_R+'" stroke-dasharray="'+donutArc(othersPct)+' '+DONUT_C+'" />'
    +'<circle class="donut-mine" id="donut-mine" cx="120" cy="120" r="'+DONUT_R+'" stroke-dasharray="'+donutArc(myPct)+' '+DONUT_C+'" stroke-dashoffset="-'+donutArc(othersPct)+'" />'
    +'</svg>'
    +'<div class="donut-center">'+centerHtml+'</div>'
    +'<div class="donut-pct">'+Math.round(pct)+'%</div>'
    +'</div>'

    // LEGEND
    +'<div class="donut-legend">'
    +'<div class="donut-legend-item"><div class="donut-legend-dot mine"></div><span class="it">Tuoi ('+myBlocks+')</span><span class="en">Yours ('+myBlocks+')</span></div>'
    +'<div class="donut-legend-item"><div class="donut-legend-dot others"></div><span class="it">Altri ('+(a.blocks_sold-myBlocks)+')</span><span class="en">Others ('+(a.blocks_sold-myBlocks)+')</span></div>'
    +'<div class="donut-legend-item"><div class="donut-legend-dot avail"></div><span class="it">Disponibili ('+remaining+')</span><span class="en">Available ('+remaining+')</span></div>'
    +'</div>'

    // STATS
    +'<div class="detail-stats">'
    +'<div class="detail-stat"><div class="detail-stat-val">'+remaining+'</div><div class="detail-stat-label"><span class="it">Rimasti</span><span class="en">Left</span></div></div>'
    +'<div class="detail-stat"><div class="detail-stat-val">'+a.block_price_aria+'<small style="font-size:50%;color:var(--gray-400)"> ('+eur(a.block_price_aria)+')</small></div><div class="detail-stat-label">ARIA/<span class="it">blocco</span><span class="en">block</span></div></div>'
    +'<div class="detail-stat"><div class="detail-stat-val">'+a.total_blocks.toLocaleString('it-IT')+'</div><div class="detail-stat-label"><span class="it">Totali</span><span class="en">Total</span></div></div>'
    +'</div>'

    +(dl?'<div class="detail-deadline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span class="it">Scadenza: '+dl+'</span><span class="en">Deadline: '+dl+'</span></div>':'')

    // BUY BOX
    +'<div class="buy-box">'
    +'<div class="buy-box-label"><span class="it">Metti da parte i tuoi ARIA</span><span class="en">Set aside your ARIA</span></div>'
    +'<p class="buy-box-framing"><span class="it">Ogni blocco acquistato ti avvicina all\'oggetto e ti fa guadagnare ROBI — il loro valore cresce nel tempo.</span><span class="en">Each block brings you closer to the item and earns you ROBI — their value grows over time.</span></p>'
    +(isPresale?'<div style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.2);padding:6px 10px;margin-bottom:12px;font-size:11px;color:var(--aria)"><strong>⛏ PRESALE 2x</strong> — <span class="it">In presale ogni blocco guadagna il doppio dei ROBI!</span><span class="en">In presale each block earns double ROBI!</span></div>':'')


    // DISPLAY
    +'<div class="buy-display">'
    +'<div class="buy-display-count" id="buy-display-count">1 <span><span class="it">blocco</span><span class="en">block</span></span></div>'
    +'<div class="buy-display-cost" id="buy-display-cost">= '+a.block_price_aria+' ARIA ('+eur(a.block_price_aria)+')</div>'
    +'<div class="buy-display-balance"><span class="it">Saldo:</span><span class="en">Balance:</span> '+_balance+' ARIA ('+eur(_balance)+')</div>'
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
    +'</div>' // close product-divider wrapper

    // ── CONTROL ROOM (solo admin/CEO) ──
    +(_isAdmin?'<div style="margin-top:24px;text-align:center"><button onclick="openControlRoom(\''+id+'\')" style="background:none;border:1px solid var(--gold);color:var(--gold);padding:10px 24px;font-family:var(--font-m);font-size:10px;letter-spacing:2px;cursor:pointer;transition:all .3s" onmouseover="this.style.background=\'var(--gold)\';this.style.color=\'var(--black)\'" onmouseout="this.style.background=\'none\';this.style.color=\'var(--gold)\'">CONTROL ROOM</button></div>':'')
    +'<div id="control-room-panel" style="display:none"></div>';

  document.getElementById('detail-content').innerHTML=html;

  // Start physics simulation for bubbles
  if(_bubbles.length>0)startBubblePhysics();
}

// ── Bubble Physics Engine ──
var _bubbles=[];
var _bubbleRaf=null;

function startBubblePhysics(){
  if(_bubbleRaf)cancelAnimationFrame(_bubbleRaf);
  var layer=document.getElementById('bubbles-layer');
  if(!layer||_bubbles.length===0)return;
  var containerSize=layer.offsetWidth; // px (it's a circle)
  if(containerSize===0)containerSize=160;
  var center=containerSize/2;
  var boundaryR=center-4; // slightly inside the circle edge

  function tick(){
    var dt=1; // fixed timestep
    // Move bubbles
    for(var i=0;i<_bubbles.length;i++){
      var b=_bubbles[i];
      b.x+=b.vx*dt;
      b.y+=b.vy*dt;

      // Boundary collision (circular)
      var dx=(b.x-0.5)*containerSize;
      var dy=(b.y-0.5)*containerSize;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var maxDist=boundaryR-b.r;
      if(dist>maxDist&&dist>0){
        // Reflect velocity along the normal (center→bubble)
        var nx=dx/dist, ny=dy/dist;
        var dot=b.vx*nx+b.vy*ny;
        if(dot>0){
          b.vx-=2*dot*nx;
          b.vy-=2*dot*ny;
          // Dampen slightly
          b.vx*=0.9; b.vy*=0.9;
        }
        // Push back inside
        b.x=0.5+(nx*maxDist)/containerSize;
        b.y=0.5+(ny*maxDist)/containerSize;
      }

      // Bubble-bubble collisions
      for(var j=i+1;j<_bubbles.length;j++){
        var b2=_bubbles[j];
        var bx=(b.x-b2.x)*containerSize;
        var by=(b.y-b2.y)*containerSize;
        var bDist=Math.sqrt(bx*bx+by*by);
        var minDist=b.r+b2.r+2; // +2 for border
        if(bDist<minDist&&bDist>0){
          // Normal
          var cnx=bx/bDist, cny=by/bDist;
          // Relative velocity
          var dvx=b.vx-b2.vx, dvy=b.vy-b2.vy;
          var dvDot=dvx*cnx+dvy*cny;
          if(dvDot>0){
            // Mass proportional to radius
            var m1=b.r*b.r, m2=b2.r*b2.r;
            var totalM=m1+m2;
            var impulse=dvDot/totalM;
            b.vx-=impulse*m2*cnx;
            b.vy-=impulse*m2*cny;
            b2.vx+=impulse*m1*cnx;
            b2.vy+=impulse*m1*cny;
          }
          // Separate
          var overlap=(minDist-bDist)/2;
          b.x+=cnx*overlap/containerSize;
          b.y+=cny*overlap/containerSize;
          b2.x-=cnx*overlap/containerSize;
          b2.y-=cny*overlap/containerSize;
        }
      }

      // Tiny random force to keep things moving
      b.vx+=(Math.random()-0.5)*0.00005;
      b.vy+=(Math.random()-0.5)*0.00005;

      // Speed limit
      var speed=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
      var maxSpeed=0.0015;
      if(speed>maxSpeed){b.vx=(b.vx/speed)*maxSpeed;b.vy=(b.vy/speed)*maxSpeed;}

      // Min speed (keep them moving)
      var minSpeed=0.0003;
      if(speed<minSpeed&&speed>0){b.vx=(b.vx/speed)*minSpeed;b.vy=(b.vy/speed)*minSpeed;}

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
  var divisor=Math.max(1,Math.ceil((a.object_value_eur||500)/100));
  var mult=isPresale?2:1;
  var shares=(_buyQty*mult)/divisor;
  var sharesStr=shares%1===0?shares:shares.toFixed(2);
  var countEl=document.getElementById('buy-display-count');
  var costEl=document.getElementById('buy-display-cost');
  if(countEl)countEl.innerHTML=_buyQty+' <span><span class="it">'+(_buyQty===1?'blocco':'blocchi')+'</span><span class="en">block'+(_buyQty===1?'':'s')+'</span></span>';
  if(costEl)costEl.innerHTML='= '+cost+' ARIA ('+eur(cost)+') &middot; <span style="color:var(--gold)">'+sharesStr+' ROBI</span>'+(isPresale?' <span style="color:var(--aria);font-size:10px">2x</span>':'');
}

function goToAirdrop(id){
  openDetail(id);
  history.pushState({page:'explore',detail:id},null,'/airdrops/'+id);
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
  document.getElementById('modal-cost').textContent=cost+' ARIA ('+eur(cost)+')';
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
      _balance=data.new_balance;
      document.getElementById('topbar-bal').textContent=_balance+' ARIA ('+eur(_balance)+')';
      showToast(data.blocks_bought+' <span class="it">blocchi acquisiti!</span><span class="en">blocks acquired!</span>');

      // Animate donut: pulse the gold ring
      var mineRing=document.getElementById('donut-mine');
      if(mineRing)mineRing.classList.add('pulse');

      // Refresh and re-render detail
      await Promise.all([loadAirdrops(),loadMyParticipations(),loadBalance()]);
      renderGrid();
      setTimeout(function(){openDetail(buy.airdropId)},400);
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
    return '<div class="my-card" onclick="goToAirdrop(\''+a.id+'\')">'
      +imgHtml
      +'<div class="my-card-info">'
      +'<div class="my-card-title">'+a.title+'</div>'
      +'<div class="my-card-meta">'+a.category+' &middot; '+(a.status==='presale'?'<span style="color:var(--aria)">Presale</span>':a.status==='sale'?'<span style="color:var(--kas)">Live</span>':'<span>'+a.status+'</span>')+'</div>'
      +'<div class="my-card-blocks"><strong>'+item.blocks+'</strong> <span class="it">blocchi</span><span class="en">blocks</span> &middot; '+item.spent+' ARIA</div>'
      +'</div></div>';
  }).join('');
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
      document.getElementById('dapp-admin-link').style.display='';
    }
    if(r.role==='evaluator'){
      _isManager=true;
      _managerCats.push(r.category); // null = all
    }
  });
  if(_isManager){
    var nm=document.getElementById('nav-manage');
    var nmm=document.getElementById('nav-manage-mobile');
    if(nm)nm.style.display='';
    if(nmm)nmm.style.display='';
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
    html+='<div style="margin-top:12px"><button onclick="this.style.display=\'none\';loadAirdropChat(\''+s.id+'\',\'sub-chat-'+s.id+'\')" style="background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:6px 14px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'"><span class="it">MESSAGGI</span><span class="en">MESSAGES</span></button></div>';
    html+='<div id="sub-chat-'+s.id+'" style="margin-top:8px"></div>';
    html+='</div>';
  }
  container.innerHTML=html;
}

// ══════════════════════════════
// ── BACKOFFICE (manage tab) ──
// ══════════════════════════════
async function loadBoData(){
  var token=await getValidToken();
  if(!token)return;
  _allAirdrops=await sbRpc('get_all_airdrops',{},token)||[];
  if(!Array.isArray(_allAirdrops))_allAirdrops=[];
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
  var catLabels={mobile:'Mobile',tech:'Tech',luxury:'Luxury',ultra_luxury:'Ultra Luxury'};
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
    var msgs=await sbRpc('get_airdrop_messages',{p_airdrop_id:airdropId},token)||[];
    var html='<div style="max-height:300px;overflow-y:auto;padding:8px 0" id="'+containerId+'-scroll">';
    if(msgs.length===0){
      html+='<div style="text-align:center;padding:20px;color:var(--gray-500);font-size:12px"><span class="it">Nessun messaggio</span><span class="en">No messages yet</span></div>';
    }else{
      for(var i=0;i<msgs.length;i++){
        var m=msgs[i];
        var align=m.is_admin?'flex-end':'flex-start';
        var bg=m.is_admin?'rgba(184,150,12,.12)':'rgba(74,158,255,.08)';
        var border=m.is_admin?'var(--gold)':'var(--aria)';
        var label=m.is_admin?'AIROOBI':escHtml(m.sender_name||'Utente');
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
  var args={p_airdrop_id:_boTarget.id,p_status:status,p_block_price_aria:price,p_total_blocks:blocks};
  if(presale)args.p_presale_block_price=presale;
  if(deadline)args.p_deadline=deadline+'T23:59:59Z';
  var res=await sbRpc('manager_update_airdrop',args,token);
  btn.disabled=false;
  if(res&&res.ok){
    closeBoModals();
    showToast('Approvato: '+_boTarget.title);
    await loadBoData();
    await loadAirdrops();renderGrid();renderStats();renderCategoryFilter();
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
    await loadAirdrops();renderGrid();renderStats();renderCategoryFilter();
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
  if(wc)wc.style.display=hasRendimento?'flex':'none';
  if(wl)wl.style.display=hasRendimento?'none':'flex';

  if(hasRendimento){
    var cn=document.getElementById('dapp-wcard-rend-count');
    // Mostra quote frazionarie (es. "12.50 quote" o "3 quote")
    if(cn)cn.textContent=totalShares%1===0?totalShares:totalShares.toFixed(2);
    var sn=document.getElementById('dapp-wcard-rend-serial');
    if(sn&&rendCards[0]){
      sn.textContent=rendCards[0].id.split('-')[0].substring(0,5).toUpperCase();
    }
  }

  // Treasury → valore per quota + controvalore KAS
  try{
    var tRes=await fetch(SB_URL+'/rest/v1/treasury_stats?select=*&order=created_at.desc&limit=1',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(tRes.ok){
      var tRows=await tRes.json();
      if(tRows&&tRows.length){
        var treasury=parseFloat(tRows[0].balance_eur)||0;
        var nftCirc=parseFloat(tRows[0].nft_circulating)||totalShares||1;
        var unitVal=nftCirc>0?(treasury/nftCirc):0;
        var valEl=document.getElementById('dapp-wcard-rend-value');
        if(valEl){
          if(hasRendimento){
            var totalVal=(unitVal*totalShares).toFixed(2);
            valEl.innerHTML='&euro; '+totalVal;
            // Fetch KAS price and show equivalent
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=eur').then(function(r){return r.json()}).then(function(d){
              if(d&&d.kaspa&&d.kaspa.eur>0){
                var kasEquiv=(parseFloat(totalVal)/d.kaspa.eur).toFixed(2);
                valEl.innerHTML='&euro; '+totalVal+'<div style="font-family:var(--font-m);font-size:11px;color:var(--kas);margin-top:4px;letter-spacing:1px">&asymp; '+kasEquiv+' KAS</div>';
              }
            }).catch(function(){});
          }else{
            valEl.textContent='—';
          }
        }
      }
    }
  }catch(e){}

  // Badge collection (NFT non-REWARD)
  try{
    var badgeCards=cards.filter(function(c){return c.nft_type!=='ROBI'&&c.nft_type!=='NFT_REWARD'&&c.nft_type!=='NFT_EARN'});
    var badgeGrid=document.getElementById('dapp-badge-grid');
    if(badgeGrid&&badgeCards.length>0){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      badgeGrid.innerHTML=badgeCards.map(function(b){
        var label=b.nft_type?b.nft_type.replace(/_/g,' '):'Badge';
        return '<div style="padding:16px;border:1px solid var(--gray-700);border-radius:var(--radius-sm);text-align:center">'+
          '<div style="font-family:var(--font-m);font-size:20px;color:var(--gold);margin-bottom:8px">&#9733;</div>'+
          '<div style="font-family:var(--font-m);font-size:11px;letter-spacing:1px;color:var(--white);margin-bottom:4px">'+label+'</div>'+
          '<div style="font-size:10px;color:var(--gray-400)">'+new Date(b.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'})+'</div>'+
          '</div>';
      }).join('');
    }
  }catch(e){}
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
