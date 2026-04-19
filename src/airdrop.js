// ── airdrop.js — Standalone detail page JS ──
// Self-contained: no dependency on dapp.js globals.

// ── Config ──
var SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

// ── State ──
var _session=null;
var _balance=0;
var _publicMode=false;
var ARIA_EUR=0.10;
function eur(aria){return '€'+(aria*ARIA_EUR).toFixed(2).replace('.',',')}
function escHtml(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):''}

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

var _robiPrice=0;
var _buyQty=1;
var _currentDetail=null;
var _watchlist=[];
var _lastPosition=null;
var _positionInterval=null;
var _countdownInterval=null;
var _isAdmin=false;
var _gridData=[];
var _pendingBuy=null;
var _robi=0;

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
    return {ok:false,error:'HTTP_'+res.status,detail:errText};
  }
  return res.json();
}

// ── Session ──
function getSession(){
  try{return JSON.parse(localStorage.getItem('airoobi_session'))}catch(e){return null}
}

// ── User menu (topbar dropdown) ──
function toggleApUserMenu(e){
  if(e){e.stopPropagation();}
  var menu=document.getElementById('ap-user-menu');
  var btn=document.getElementById('ap-user-btn');
  if(!menu||!btn)return;
  var open=menu.classList.toggle('open');
  btn.classList.toggle('open',open);
}
document.addEventListener('click',function(e){
  var menu=document.getElementById('ap-user-menu');
  var btn=document.getElementById('ap-user-btn');
  if(!menu||!menu.classList.contains('open'))return;
  if(menu.contains(e.target)||(btn&&btn.contains(e.target)))return;
  menu.classList.remove('open');
  if(btn)btn.classList.remove('open');
});
function apLogout(){
  try{localStorage.removeItem('airoobi_session');}catch(e){}
  window.location.href='/';
}
async function loadApAvatar(){
  if(!_session||!_session.user)return;
  try{
    var token=await getValidToken();if(!token)return;
    var res=await fetch(SB_URL+'/rest/v1/profiles?id=eq.'+_session.user.id+'&select=avatar_url',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(!res.ok)return;
    var rows=await res.json();
    if(!rows||!rows[0]||!rows[0].avatar_url)return;
    var btn=document.getElementById('ap-user-btn');
    var letterEl=document.getElementById('ap-user-btn-letter');
    if(!btn)return;
    if(letterEl)letterEl.style.display='none';
    var img=document.createElement('img');
    img.src=rows[0].avatar_url+'?t='+Date.now();
    img.alt='';
    btn.appendChild(img);
  }catch(e){}
}

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
    localStorage.setItem('airoobi_session',JSON.stringify(_session));
    return true;
  }catch(e){return false}
}

async function getValidToken(){
  if(!_session||!_session.access_token)return null;
  try{
    var payload=JSON.parse(atob(_session.access_token.split('.')[1]));
    if(payload.exp*1000<Date.now()+60000){
      var ok=await refreshToken();
      if(!ok)return null;
    }
  }catch(e){}
  return _session.access_token;
}

// ── Language ──
function toggleLang(){
  var root=document.documentElement;
  var current=root.getAttribute('data-lang');
  var next=current==='it'?'en':'it';
  root.setAttribute('data-lang',next);
  root.setAttribute('lang',next);
  var btn=document.getElementById('lang-btn');
  if(btn)btn.textContent=next==='it'?'EN':'IT';
  localStorage.setItem('airoobi_lang',next);
}
// Restore saved language
(function(){
  var saved=localStorage.getItem('airoobi_lang');
  if(saved&&saved!=='it'){
    document.documentElement.setAttribute('data-lang',saved);
    document.documentElement.setAttribute('lang',saved);
    var btn=document.getElementById('lang-btn');
    if(btn)btn.textContent='IT';
  }
})();

// ── Balance UI ──
function updateBalanceUI(){
  var ariaEl=document.getElementById('topbar-aria-val');
  var robiEl=document.getElementById('topbar-robi-val');
  if(ariaEl)ariaEl.textContent=_balance;
  if(robiEl)robiEl.textContent=_robi;
}

// ── ROBI price ──
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
  if(_robiPrice>0&&a.total_blocks>0&&a.block_price_aria>0){
    var treasuryPrevisto=a.total_blocks*a.block_price_aria*ARIA_EUR*0.22;
    var maxRobi=treasuryPrevisto/_robiPrice;
    if(maxRobi>0)return Math.max(1,Math.ceil(a.total_blocks/maxRobi));
  }
  return Math.max(1,Math.ceil((a.object_value_eur||500)/100));
}

// ── Balance loading ──
async function loadBalance(){
  if(!_session||!_session.user)return;
  var profs=await sbGet('profiles?id=eq.'+_session.user.id+'&select=total_points',_session.access_token);
  if(profs&&profs.length>0){_balance=profs[0].total_points||0;}
  var nfts=await sbGet('nft_rewards?user_id=eq.'+_session.user.id+'&nft_type=in.(ROBI,NFT_REWARD)&select=shares',_session.access_token);
  if(nfts&&nfts.length>0){_robi=0;nfts.forEach(function(n){_robi+=parseFloat(n.shares)||0;});_robi=Math.round(_robi*100)/100;}
  updateBalanceUI();
}

// ── Admin check ──
async function checkAdmin(){
  var token=await getValidToken();if(!token)return;
  var roles=await sbRpc('get_my_roles',{},token);
  if(!Array.isArray(roles))return;
  roles.forEach(function(r){if(r.role==='admin')_isAdmin=true;});
  if(_isAdmin&&_currentDetail)showTopbarCR(_currentDetail.id);
}

// ── Watchlist ──
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
    // Update heart button in detail
    var hb=document.getElementById('detail-heart');
    if(hb)hb.className=isInWatchlist(id)?'heart-btn detail active':'heart-btn detail';
  }
}

// ── Mine Tower 3D ──
function hashStr(s){var h=0;for(var i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i);return h;}

function buildMineTower(a,myBlocks){
  var total=a.total_blocks;
  var sold=a.blocks_sold;
  var others=sold-myBlocks;
  var rate=calcMiningRate(a)||50;

  var BPR=8;
  var RINGS=Math.min(12,Math.max(4,Math.ceil(total/(BPR*20))));
  var vis=RINGS*BPR;

  var vOthers=Math.round(others/total*vis);
  var vMine=Math.round(myBlocks/total*vis);
  if(vMine>0&&vMine<1)vMine=1;
  if(vOthers+vMine>vis)vOthers=vis-vMine;

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
  // Horizontal tower: virtual tower (towerW × towerH) is rotated -90° via CSS,
  // so on screen it appears as a lying cylinder of size towerH × towerW.
  var towerW=190;           // virtual width  → becomes display height (cylinder diameter)
  var towerH=totalH+60;     // virtual height → becomes display width (cylinder length)
  var html='<div class="mine-scene horizontal" style="height:'+towerW+'px">'
    +'<div class="mine-tower" id="mine-tower" style="width:'+towerW+'px;height:'+towerH+'px;margin:0">';

  // Center rings vertically in the virtual tower so the cylinder is
  // centered horizontally on screen after the -90° rotation.
  var ringsSpan=(RINGS-1)*ringH;
  var ringOffset=(towerH-ringsSpan)/2;
  var idx=0;
  for(var ring=0;ring<RINGS;ring++){
    var y=ringOffset+ring*ringH;
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

// ── Gallery ──
var _galleryIdx=0,_galleryInterval=null,_galleryPlaying=true;

function galleryGoTo(idx){
  var slides=document.querySelectorAll('.gallery-slide');
  var dots=document.querySelectorAll('.gallery-dot');
  if(!slides.length)return;
  _galleryIdx=((idx%slides.length)+slides.length)%slides.length;
  slides.forEach(function(s,i){s.classList.toggle('active',i===_galleryIdx)});
  dots.forEach(function(d,i){d.classList.toggle('active',i===_galleryIdx)});
  var counter=document.getElementById('gallery-idx');
  if(counter)counter.textContent=_galleryIdx+1;
}

function startGalleryAutoplay(){
  stopGalleryAutoplay();
  _galleryIdx=0;_galleryPlaying=true;
  _galleryInterval=setInterval(function(){galleryGoTo(_galleryIdx+1)},3500);
  var iconPause=document.getElementById('gallery-icon-pause');
  var iconPlay=document.getElementById('gallery-icon-play');
  if(iconPause)iconPause.style.display='';
  if(iconPlay)iconPlay.style.display='none';
  var gal=document.getElementById('detail-gallery');
  if(gal){
    var sx=0;
    gal.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    gal.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].clientX-sx;
      if(Math.abs(dx)>40){
        galleryGoTo(_galleryIdx+(dx<0?1:-1));
        if(_galleryPlaying){stopGalleryAutoplay();_galleryPlaying=true;_galleryInterval=setInterval(function(){galleryGoTo(_galleryIdx+1)},3500);}
      }
    },{passive:true});
  }
}

function stopGalleryAutoplay(){
  if(_galleryInterval){clearInterval(_galleryInterval);_galleryInterval=null;}
  _galleryPlaying=false;
}

function toggleGalleryPlay(){
  if(_galleryPlaying){
    stopGalleryAutoplay();
    var iconPause=document.getElementById('gallery-icon-pause');
    var iconPlay=document.getElementById('gallery-icon-play');
    if(iconPause)iconPause.style.display='none';
    if(iconPlay)iconPlay.style.display='';
  } else {
    _galleryPlaying=true;
    _galleryInterval=setInterval(function(){galleryGoTo(_galleryIdx+1)},3500);
    var iconPause2=document.getElementById('gallery-icon-pause');
    var iconPlay2=document.getElementById('gallery-icon-play');
    if(iconPause2)iconPause2.style.display='';
    if(iconPlay2)iconPlay2.style.display='none';
  }
}

// ── Duration badge ──
function durationBadge(dtype){
  if(dtype==='flash')return '<div class="duration-badge flash">FLASH ⚡</div>';
  if(dtype==='extended')return '<div class="duration-badge extended">72H</div>';
  return '<div class="duration-badge standard">24H</div>';
}

// ── Countdown ──
function fmtCountdown(deadline){
  if(!deadline)return null;
  var diff=new Date(deadline)-Date.now();
  if(diff<=0)return{text:'Scaduto',en:'Expired',urgent:false,expired:true};
  var h=Math.floor(diff/3600000);var m=Math.floor((diff%3600000)/60000);var s=Math.floor((diff%60000)/1000);
  var urgent=diff<7200000;
  if(h>=24){var d=Math.floor(h/24);h=h%24;return{text:d+'g '+h+'h '+m+'m',en:d+'d '+h+'h '+m+'m',urgent:urgent,expired:false};}
  return{text:h+'h '+m+'m '+s+'s',en:h+'h '+m+'m '+s+'s',urgent:urgent,expired:false};
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

// ── Toast ──
function showToast(html){
  var t=document.getElementById('ap-toast');
  if(!t){t=document.getElementById('toast');}
  if(!t)return;
  t.innerHTML=html;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
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

// ── Buy flow ──
function showMsg(type,html){
  var el=document.getElementById('buy-msg');
  if(!el)return;
  el.innerHTML=html;
  el.className='buy-msg active '+type;
}

function hideMsg(){
  var el=document.getElementById('buy-msg');
  if(!el)return;
  el.className='buy-msg';
  el.innerHTML='';
}

function initBuy(){
  if(!_currentDetail||_buyQty<=0)return;
  // Fairness guard: acquisto bloccato se matematicamente impossibile arrivare 1°
  var bb=document.querySelector('.buy-box');
  if(bb&&bb.classList.contains('fair-blocked')){
    showMsg('err',UI_ICONS.ban+' <span class="it">Acquisto bloccato per fairness: non potresti arrivare 1&deg;.</span><span class="en">Purchase blocked for fairness: you can\'t reach #1.</span>');
    return;
  }
  var a=_currentDetail;
  var isPresale=a.status==='presale';
  var price=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
  var cost=_buyQty*price;
  if(cost>_balance){
    showMsg('err','<span class="it">ARIA insufficienti.</span><span class="en">Not enough ARIA.</span>');
    return;
  }
  var soldSet={};
  _gridData.forEach(function(b){soldSet[b.block_number]=true});
  var available=[];
  for(var i=1;i<=a.total_blocks;i++){if(!soldSet[i])available.push(i)}
  for(var j=available.length-1;j>0;j--){
    var k=Math.floor(Math.random()*(j+1));
    var tmp=available[j];available[j]=available[k];available[k]=tmp;
  }
  var chosen=available.slice(0,_buyQty);

  _pendingBuy={airdropId:a.id,blocks:chosen,cost:cost,qty:_buyQty};
  var modalDesc=document.getElementById('modal-desc');
  var modalCost=document.getElementById('modal-cost');
  var modalBg=document.getElementById('modal-bg');
  if(modalDesc)modalDesc.innerHTML='<span class="it">Stai per acquisire <strong>'+_buyQty+'</strong> '+(_buyQty===1?'blocco':'blocchi')+'.</span><span class="en">You are about to acquire <strong>'+_buyQty+'</strong> block'+(_buyQty===1?'':'s')+'.</span>';
  if(modalCost)modalCost.textContent=cost+' ARIA';
  if(modalBg)modalBg.classList.add('active');
}

function closeModal(e){
  if(e&&e.target!==document.getElementById('modal-bg'))return;
  var modalBg=document.getElementById('modal-bg');
  if(modalBg)modalBg.classList.remove('active');
  _pendingBuy=null;
}

function closeModalBtn(){
  var modalBg=document.getElementById('modal-bg');
  if(modalBg)modalBg.classList.remove('active');
  _pendingBuy=null;
}

async function confirmBuy(){
  if(!_pendingBuy)return;
  var buy=_pendingBuy;
  var modalBg=document.getElementById('modal-bg');
  if(modalBg)modalBg.classList.remove('active');
  var btn=document.getElementById('buy-btn');
  if(btn){btn.disabled=true;btn.classList.add('loading');btn.innerHTML='<span class="it">Acquisto in corso...</span><span class="en">Processing...</span>';}
  hideMsg();

  try{
    var token=await getValidToken();
    if(!token){showMsg('err','Sessione scaduta.');return;}
    var data=await sbRpc('buy_blocks',{p_airdrop_id:buy.airdropId,p_block_numbers:buy.blocks},token);
    if(data&&data.ok){
      var lang=document.documentElement.getAttribute('data-lang')||'it';
      showToast(lang==='it'
        ?data.blocks_bought+' '+(data.blocks_bought===1?'blocco acquisito':'blocchi acquisiti')+' per '+data.aria_spent+' ARIA'
        :data.blocks_bought+' block'+(data.blocks_bought===1?'':'s')+' purchased for '+data.aria_spent+' ARIA');

      var oldMyBlocks=_gridData?_gridData.filter(function(b){return b.is_mine}).length:0;
      var rate=_currentDetail?calcMiningRate(_currentDetail):50;
      playMiningAnimation(data.blocks_bought,oldMyBlocks,rate);

      _balance=data.new_balance;
      updateBalanceUI();

      var animDur=Math.floor(oldMyBlocks/rate)<Math.floor((oldMyBlocks+data.blocks_bought)/rate)?3200:2000;
      setTimeout(async function(){
        await Promise.all([loadBalance()]);
        await renderDetail();
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
      if(btn){btn.disabled=false;btn.classList.remove('loading');btn.innerHTML='<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>';}
    }
  }catch(e){
    showMsg('err','<span class="it">Errore di rete. Riprova.</span><span class="en">Network error. Try again.</span>');
    if(btn){btn.disabled=false;btn.classList.remove('loading');btn.innerHTML='<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>';}
  }
  _pendingBuy=null;
}

// ── Auto-buy ──
async function loadAutoBuyRule(airdropId){
  if(!_session)return null;
  var token=await getValidToken();if(!token)return null;
  var rows=await sbGet('auto_buy_rules?user_id=eq.'+_session.user.id+'&airdrop_id=eq.'+airdropId+'&select=*',token);
  return(rows&&rows[0])||null;
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
  if(_currentDetail)await renderDetail();
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
    await fetch(SB_URL+'/functions/v1/send-push',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({type:'position_lost',airdrop_id:airdropId,user_id:_session.user.id,title:_currentDetail?_currentDetail.title:''})
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

// ── Position Live ──
function updateDetailPosition(airdropId,scores){
  var el=document.getElementById('detail-position');if(!el)return;
  if(!_session||!scores||scores.length===0){
    var total=scores?scores.length:0;
    el.innerHTML='<span class="it">Entra ora — <strong>'+total+'</strong> partecipanti attivi</span>'
      +'<span class="en">Join now — <strong>'+total+'</strong> active participants</span>';
    el.className='detail-position not-in';
    updateStrategyGuide(scores,0,total,null);
    return;
  }
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
  var f1=myScore?parseFloat(myScore.f1):0;
  var f2=myScore?parseFloat(myScore.f2):0;
  var sc=myScore?parseFloat(myScore.score):0;
  el.innerHTML='<div class="pos-main"><span class="it">Sei <strong>'+pos+'°</strong> su '+total+' partecipanti</span>'
    +'<span class="en">You are <strong>#'+pos+'</strong> of '+total+' participants</span></div>'
    +'<div class="pos-breakdown">'
    +'<span title="Vantaggio sul primo in classifica (pesa 70%)"><span class="pos-label"><span class="it">Vantaggio</span><span class="en">Advantage</span></span> '+f1.toFixed(2)+'</span>'
    +'<span title="Impegno nella categoria (pesa 30%)"><span class="pos-label"><span class="it">Impegno</span><span class="en">Commitment</span></span> '+f2.toFixed(2)+'</span>'
    +'<span title="Punteggio totale"><span class="pos-label"><span class="it">Punteggio</span><span class="en">Score</span></span> '+sc.toFixed(3)+'</span>'
    +'</div>';
  el.className='detail-position in';
  if(_lastPosition!==null&&pos>_lastPosition){
    el.classList.add('shake');
    setTimeout(function(){el.classList.remove('shake')},600);
    showToast('<span class="it">Sei stato superato — acquista altri blocchi per risalire</span><span class="en">You\'ve been overtaken — buy more blocks to climb back</span>');
    notifyPositionLost(airdropId);
  }
  _lastPosition=pos;
  updateStrategyGuide(scores,pos,total,myScore);
}

// ── Fairness guard: blocca acquisto se matematicamente impossibile arrivare 1° ──
function applyFairnessBlock(blocked,needed,remaining){
  var buyBtn=document.getElementById('buy-btn');
  if(!buyBtn)return;
  var buyBox=buyBtn.closest('.buy-box');
  var buySlider=document.getElementById('buy-slider');
  var buyMsg=document.getElementById('buy-msg');
  if(blocked){
    if(buyBox)buyBox.classList.add('fair-blocked');
    buyBtn.disabled=true;
    buyBtn.innerHTML=UI_ICONS.ban+' <span class="it">Fairness: impossibile arrivare 1&deg;</span><span class="en">Fairness: can\'t reach #1</span>';
    if(buySlider)buySlider.disabled=true;
    document.querySelectorAll('.buy-preset').forEach(function(b){b.disabled=true;b.style.opacity='.4';b.style.cursor='not-allowed';});
    if(buyMsg)buyMsg.innerHTML='<div style="margin-top:10px;padding:10px 12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:6px;font-size:12px;line-height:1.55;color:#ff9b70"><span class="it">Ti servono <strong>'+needed+'</strong> blocchi ma ne restano solo <strong>'+remaining+'</strong>. Acquisto bloccato per non farti sprecare ARIA.</span><span class="en">You need <strong>'+needed+'</strong> blocks but only <strong>'+remaining+'</strong> remain. Purchase blocked to save your ARIA.</span></div>';
  }
  // Nota: non ri-abilitiamo mai (la condizione è monotona — una volta impossibile, resta impossibile).
}

// ── Strategy Guide ──
function updateStrategyGuide(scores,pos,total,myScore){
  var el=document.getElementById('detail-strategy');if(!el)return;
  var a=_currentDetail;if(!a)return;

  if(!_session||!myScore||pos===0){
    var topScore=scores&&scores.length>0?scores[0]:null;
    el.innerHTML=''
      +'<div class="strategy-box">'
      +'<div class="strategy-title"><span class="it">Come funziona la classifica</span><span class="en">How the ranking works</span></div>'
      +'<div class="strategy-formula">'
      +'<div class="strategy-factor">'
      +'<div class="strategy-factor-pct">70%</div>'
      +'<div class="strategy-factor-name"><span class="it">Vantaggio</span><span class="en">Advantage</span></div>'
      +'<div class="strategy-factor-desc"><span class="it">Quanto sei vicino al primo in classifica per blocchi acquistati</span><span class="en">How close you are to #1 by blocks bought</span></div>'
      +'</div>'
      +'<div class="strategy-factor">'
      +'<div class="strategy-factor-pct">30%</div>'
      +'<div class="strategy-factor-name"><span class="it">Impegno</span><span class="en">Commitment</span></div>'
      +'<div class="strategy-factor-desc"><span class="it">ARIA spesi in questa categoria nel tempo</span><span class="en">ARIA spent in this category over time</span></div>'
      +'</div>'
      +'</div>'
      +'<div class="strategy-tip">'
      +UI_ICONS.zap+' <span class="it">Pi&ugrave; blocchi compri, pi&ugrave; sali in classifica. Chi &egrave; al 1&deg; posto quando l\'airdrop si chiude ottiene l\'oggetto.</span>'
      +'<span class="en">The more blocks you buy, the higher you climb. Whoever is #1 when the airdrop closes gets the item.</span>'
      +'</div>'
      +'</div>';
    return;
  }

  var f1=parseFloat(myScore.f1)||0;
  var f2=parseFloat(myScore.f2)||0;
  var myBlocks=myScore.blocks||0;

  var leader=scores[0];
  var leaderBlocks=leader?leader.blocks:myBlocks;
  var blocksToFirst=0;
  if(pos>1&&leader){
    blocksToFirst=Math.max(0,leaderBlocks-myBlocks+1);
  }

  // Fairness: matematicamente impossibile arrivare 1° con i blocchi rimanenti?
  var remainingBlocks=Math.max(0,(a.total_blocks||0)-(a.blocks_sold||0));
  var mathImpossible=pos>1&&blocksToFirst>0&&blocksToFirst>remainingBlocks;
  applyFairnessBlock(mathImpossible,blocksToFirst,remainingBlocks);

  var f1weak=f1<f2;
  var isFirst=pos===1;

  var tipsIt=[];
  var tipsEn=[];

  if(isFirst){
    tipsIt.push(UI_ICONS.star+' Sei in testa! Continua ad accumulare blocchi per difendere la posizione.');
    tipsEn.push(UI_ICONS.star+' You\'re in the lead! Keep buying blocks to defend your position.');
    if(a.status==='presale'){
      tipsIt.push(UI_ICONS.zap+' Approfitta della presale: ogni blocco vale 2x ROBI e costa meno.');
      tipsEn.push(UI_ICONS.zap+' Take advantage of presale: each block earns 2x ROBI and costs less.');
    }
    if(total>1){
      var second=scores[1];
      var gap=second?myBlocks-(second.blocks||0):0;
      if(gap<=5){
        tipsIt.push(UI_ICONS.alert+' Il 2&deg; &egrave; a soli <strong>'+gap+'</strong> blocchi — margine stretto!');
        tipsEn.push(UI_ICONS.alert+' #2 is only <strong>'+gap+'</strong> blocks behind — tight margin!');
      }
    }
  } else if(mathImpossible){
    tipsIt.push(UI_ICONS.ban+' <strong>Matematicamente impossibile arrivare 1&deg;</strong>: ti servono '+blocksToFirst+' blocchi ma ne restano solo '+remainingBlocks+'. Acquisto bloccato per fairness — la tua ARIA resta al sicuro.');
    tipsEn.push(UI_ICONS.ban+' <strong>Mathematically impossible to reach #1</strong>: you need '+blocksToFirst+' blocks but only '+remainingBlocks+' remain. Purchase blocked for fairness — your ARIA stays safe.');
  } else {
    if(blocksToFirst>0){
      tipsIt.push(UI_ICONS.target+' Ti servono circa <strong>'+blocksToFirst+'</strong> blocchi in pi&ugrave; per raggiungere il 1&deg; posto.');
      tipsEn.push(UI_ICONS.target+' You need about <strong>'+blocksToFirst+'</strong> more blocks to reach #1.');
    }
    if(f1weak){
      tipsIt.push(UI_ICONS.up+' Il tuo <strong>Vantaggio</strong> &egrave; il fattore pi&ugrave; debole — compra pi&ugrave; blocchi per salire.');
      tipsEn.push(UI_ICONS.up+' Your <strong>Advantage</strong> is your weaker factor — buy more blocks to climb.');
    } else {
      tipsIt.push(UI_ICONS.up+' Il tuo <strong>Impegno</strong> &egrave; pi&ugrave; basso — partecipa ad altri airdrop della stessa categoria per migliorarlo.');
      tipsEn.push(UI_ICONS.up+' Your <strong>Commitment</strong> is lower — join other airdrops in this category to improve it.');
    }
    if(a.status==='presale'){
      tipsIt.push(UI_ICONS.zap+' La presale &egrave; il momento migliore: prezzo ridotto e 2x ROBI.');
      tipsEn.push(UI_ICONS.zap+' Presale is the best time: lower price and 2x ROBI.');
    }
  }

  var f1Pct=Math.round(f1*100);
  var f2Pct=Math.round(f2*100);

  var scoreVal=(parseFloat(myScore.score)||0).toFixed(3);

  el.innerHTML=''
    +'<div class="strategy-box'+(isFirst?' first':'')+'">'
    +'<div class="strategy-title">'+(isFirst?UI_ICONS.star:UI_ICONS.target)+' <span class="it">'+(isFirst?'Stai vincendo':'Come arrivare 1&deg;')+'</span>'
    +'<span class="en">'+(isFirst?'You\'re winning':'How to reach #1')+'</span></div>'
    +'<div class="strategy-score-top">'
    +'<span class="it">Il tuo punteggio: <strong>'+scoreVal+'</strong></span>'
    +'<span class="en">Your score: <strong>'+scoreVal+'</strong></span>'
    +'</div>'
    +'<div class="strategy-factors">'
    +'<div class="strategy-factor-block van">'
    +'<div class="strategy-factor-head">'
    +'<span class="strategy-factor-heading">'+UI_ICONS.trophy+' <span class="it">Vantaggio sul primo in classifica</span><span class="en">Advantage over #1</span></span>'
    +'<span class="strategy-factor-weight-badge"><span class="it">pesa 70%</span><span class="en">weight 70%</span></span>'
    +'</div>'
    +'<div class="strategy-factor-bar">'
    +'<div class="strategy-bar-track"><div class="strategy-bar-fill f1" style="width:'+f1Pct+'%"></div></div>'
    +'<div class="strategy-bar-val">'+f1.toFixed(2)+'</div>'
    +'</div>'
    +'<div class="strategy-factor-hint">'+UI_ICONS.bulb
    +' <span class="it">Acquista pi&ugrave; blocchi per colmare il distacco dal primo</span>'
    +'<span class="en">Buy more blocks to close the gap with #1</span>'
    +'</div>'
    +'</div>'
    +'<div class="strategy-factor-block imp">'
    +'<div class="strategy-factor-head">'
    +'<span class="strategy-factor-heading">'+UI_ICONS.gem+' <span class="it">Impegno nella categoria</span><span class="en">Commitment in this category</span></span>'
    +'<span class="strategy-factor-weight-badge"><span class="it">pesa 30%</span><span class="en">weight 30%</span></span>'
    +'</div>'
    +'<div class="strategy-factor-bar">'
    +'<div class="strategy-bar-track"><div class="strategy-bar-fill f2" style="width:'+f2Pct+'%"></div></div>'
    +'<div class="strategy-bar-val">'+f2.toFixed(2)+'</div>'
    +'</div>'
    +'<div class="strategy-factor-hint">'+UI_ICONS.bulb
    +' <span class="it">Partecipa spesso agli airdrop di questa categoria per accumulare impegno nel tempo</span>'
    +'<span class="en">Join airdrops in this category often to build commitment over time</span>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div class="strategy-tips">'
    +tipsIt.map(function(t){return '<div class="strategy-tip"><span class="it">'+t+'</span>'}).join('')
    +tipsEn.map(function(t){return '<div class="strategy-tip"><span class="en">'+t+'</span>'}).join('')
    +'</div>'
    +'</div>';
}

async function refreshPosition(airdropId){
  try{
    var token=_publicMode?SB_KEY:await getValidToken();
    if(!token)return;
    var scores=await sbRpc('calculate_winner_score',{p_airdrop_id:airdropId},token)||[];
    if(!Array.isArray(scores))scores=[];
    updateDetailPosition(airdropId,scores);
  }catch(e){}
}

// ── Detail Stats ──
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

  var divisor=Math.max(1,Math.ceil((a.object_value_eur||500)/100));
  var projectedRobi=(presaleB*2.0+saleB)/divisor;

  var miningRate=calcMiningRate(a);

  var gridEl=document.getElementById('mystats-grid');
  if(gridEl){
    gridEl.innerHTML=''
      +'<div class="mystats-cell">'
      +'<div class="mystats-val" style="color:var(--gold)">'+projectedRobi.toFixed(2)+'</div>'
      +'<div class="mystats-label"><span class="it">ROBI che guadagni</span><span class="en">ROBI you earn</span></div>'
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

// ── Error state ──
function showError(){
  var page=document.getElementById('ap-content');
  if(!page)return;
  page.innerHTML='<div class="ap-error">'
    +'<h2><span class="it">Airdrop non trovato</span><span class="en">Airdrop not found</span></h2>'
    +'<p style="margin-bottom:24px"><span class="it">L\'airdrop richiesto non esiste o non è disponibile.</span><span class="en">The requested airdrop does not exist or is not available.</span></p>'
    +'<a href="/airdrops" style="display:inline-block;padding:10px 24px;border:1px solid var(--gray-700);color:var(--gray-400);text-decoration:none;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px"><span class="it">Torna agli airdrop</span><span class="en">Back to airdrops</span></a>'
    +'</div>';
}

// ── Render Detail ──
async function renderDetail(){
  var a=_currentDetail;
  if(!a)return;

  stopGalleryAutoplay();
  _buyQty=1;

  var token=_publicMode?SB_KEY:await getValidToken();
  if(!token&&!_publicMode)return;

  var gridPromise=sbRpc('get_airdrop_grid',{p_airdrop_id:a.id},token||SB_KEY);
  var partPromise=sbRpc('get_airdrop_participants',{p_airdrop_id:a.id},token||SB_KEY);
  _gridData=await gridPromise||[];
  if(!Array.isArray(_gridData))_gridData=[];
  var participants=await partPromise||[];
  if(!Array.isArray(participants))participants=[];

  var remaining=a.total_blocks-a.blocks_sold;
  var pct=a.total_blocks>0?(a.blocks_sold/a.total_blocks*100):0;
  var isPresale=a.status==='presale';
  var myBlocks=_publicMode?0:_gridData.filter(function(b){return b.is_mine}).length;
  var dl=a.deadline?new Date(a.deadline).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';

  var maxBuy=Math.min(remaining,Math.floor(_balance/(isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria)));
  if(maxBuy<1)maxBuy=0;

  var pi=a.product_info||{};
  var highlights=pi.highlights||[];
  var included=pi.whats_included||[];
  var brand=pi.brand||'';
  var model=pi.model||'';
  var condition=pi.condition||'';

  var galleryImgs=[a.image_url];
  var extraPhotos=pi.extra_photos||[];
  for(var ei=0;ei<extraPhotos.length;ei++){
    if(extraPhotos[ei]&&galleryImgs.indexOf(extraPhotos[ei])===-1)galleryImgs.push(extraPhotos[ei]);
  }
  galleryImgs=galleryImgs.filter(Boolean);
  if(!galleryImgs.length)galleryImgs=[null];

  var totalAriaCost=a.block_price_aria*a.total_blocks;

  function acc(id,labelIt,labelEn,bodyHtml,openByDefault){
    return '<div class="acc'+(openByDefault?' open':'')+'" id="acc-'+id+'">'
      +'<button class="acc-header" onclick="toggleAcc(\''+id+'\')">'
      +'<span><span class="it">'+labelIt+'</span><span class="en">'+labelEn+'</span></span>'
      +'<svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      +'</button>'
      +'<div class="acc-body"><div class="acc-inner">'+bodyHtml+'</div></div>'
      +'</div>';
  }

  var slidesHtml=galleryImgs.map(function(src,i){
    return '<div class="gallery-slide'+(i===0?' active':'')+'">'
      +(src
        ?'<img src="'+src+'" alt="'+escHtml(a.title)+' — '+(i+1)+'" loading="'+(i<2?'eager':'lazy')+'">'
        :'<img class="product-img-placeholder" src="/public/images/AIROOBI_Symbol_White.png" alt="">')
      +'</div>';
  }).join('');

  var dotsHtml=galleryImgs.length>1
    ?'<div class="gallery-dots">'+galleryImgs.map(function(_,i){
      return '<button class="gallery-dot'+(i===0?' active':'')+'" onclick="galleryGoTo('+i+')"></button>';
    }).join('')+'</div>'
    :'';

  var playerHtml=galleryImgs.length>1
    ?'<div class="gallery-player">'
    +'<button class="gallery-play-btn" id="gallery-play-btn" onclick="toggleGalleryPlay()">'
    +'<svg id="gallery-icon-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
    +'<svg id="gallery-icon-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M8 5v14l11-7z"/></svg>'
    +'</button>'
    +dotsHtml
    +'<span class="gallery-counter"><span id="gallery-idx">1</span>/'+galleryImgs.length+'</span>'
    +'</div>'
    :'';

  var currentPrice=isPresale&&a.presale_block_price?a.presale_block_price:a.block_price_aria;
  var miningRate=calcMiningRate(a);
  var pct=a.total_blocks>0?Math.round(a.blocks_sold/a.total_blocks*100):0;

  var html=''
    +'<div class="detail-split">'

    // ── LEFT: GALLERY ──
    +'<div class="detail-gallery" id="detail-gallery">'
    +'<div class="gallery-track" id="gallery-track">'+slidesHtml+'</div>'
    +playerHtml
    +'<div class="product-badge" style="position:absolute;top:14px;left:14px;z-index:2">Airdrop</div>'
    +'</div>'
    +'<div class="detail-below-gallery"><button class="'+(isInWatchlist(a.id)?'heart-btn detail active':'heart-btn detail')+'" id="detail-heart" onclick="toggleWatchlist(\''+a.id+'\')">&#9825;</button></div>'

    // ══════════════════════════════════════════════════
    // ── RIGHT: CONTENT ──
    // ══════════════════════════════════════════════════
    +'<div class="detail-right" id="detail-right">'

    // ┌─────────────────────────────────────┐
    // │  1. PRODUCT INFO                    │
    // └─────────────────────────────────────┘
    +'<div class="product-info">'
    +'<div class="detail-cat"><a href="/airdrops?cat='+encodeURIComponent(a.category)+'" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s" onmouseover="this.style.opacity=\'.7\'" onmouseout="this.style.opacity=\'1\'">'+(CAT_ICONS[a.category]||'')+' '+escHtml(a.category)+'</a></div>'
    +(brand?'<div class="product-brand">'+escHtml(brand)+(model?' &middot; '+escHtml(model):'')+'</div>':'')
    +'<h2 class="product-title">'+escHtml(a.title)+'</h2>'
    +(a.description?'<p class="product-desc">'+escHtml(a.description)+'</p>':'')
    +(condition?'<div class="product-condition">'+escHtml(condition)+'</div>':'')
    +(highlights.length>0
      ?'<ul class="product-highlights">'+highlights.map(function(h){return '<li>'+escHtml(h)+'</li>'}).join('')+'</ul>'
      :'')
    +(included.length>0
      ?'<div class="product-included-label"><span class="it">Contenuto della confezione</span><span class="en">What\'s included</span></div>'
      +'<ul class="product-included">'+included.map(function(h){return '<li>'+escHtml(h)+'</li>'}).join('')+'</ul>'
      :'')
    +durationBadge(a.duration_type)
    +'</div>'

    // ┌─────────────────────────────────────┐
    // │  1b. MINE TOWER (horizontal visual) │
    // └─────────────────────────────────────┘
    +buildMineTower(a,myBlocks)

    // ┌─────────────────────────────────────┐
    // │  2. PRICE + PROGRESS                │
    // └─────────────────────────────────────┘
    +'<div class="ap-price-section">'
    +'<div class="ap-price-main">'+currentPrice+' <span class="ap-price-unit">ARIA</span></div>'
    +'<div class="ap-price-detail">'
    +(isPresale&&a.presale_block_price?'<span style="text-decoration:line-through;color:var(--gray-500);margin-right:6px">'+a.block_price_aria+'</span>':'')
    +'<span class="it">per blocco</span><span class="en">per block</span>'
    +(isPresale?' &middot; <span style="color:var(--aria);font-weight:600">PRESALE</span>':'')
    +'</div>'
    +(isPresale?'<div class="ap-presale-boost"><strong>&#9935; 2x MINING</strong> — <span class="it">Ogni blocco presale guadagna il doppio dei ROBI</span><span class="en">Each presale block earns double ROBI</span></div>':'')
    +'</div>'

    // Progress bar
    +'<div class="ap-progress">'
    +'<div class="ap-progress-bar"><div class="ap-progress-fill" style="width:'+pct+'%"></div></div>'
    +'<div class="ap-progress-stats">'
    +'<span>'+a.blocks_sold+' / '+a.total_blocks+' <span class="it">blocchi venduti</span><span class="en">blocks sold</span></span>'
    +'<span style="color:var(--accent)">'+remaining+' <span class="it">rimasti</span><span class="en">left</span></span>'
    +'</div>'
    +'</div>'

    // Quick stats row
    +'<div class="ap-quick-stats">'
    +'<div class="ap-qstat"><div class="ap-qstat-val" style="color:var(--accent)">'+currentPrice+'</div><div class="ap-qstat-label">ARIA/<span class="it">blocco</span><span class="en">block</span></div></div>'
    +'<div class="ap-qstat"><div class="ap-qstat-val" style="color:var(--gold)">'+miningRate+'</div><div class="ap-qstat-label"><span class="it">blocchi per ROBI</span><span class="en">blocks per ROBI</span></div></div>'
    +'<div class="ap-qstat"><div class="ap-qstat-val">'+a.total_blocks.toLocaleString('it-IT')+'</div><div class="ap-qstat-label"><span class="it">Totali</span><span class="en">Total</span></div></div>'
    +'</div>'

    // Countdown
    +(a.deadline?'<div class="detail-countdown" id="detail-countdown" data-deadline="'+a.deadline+'"></div>':'')

    // ┌─────────────────────────────────────┐
    // │  3. BUY BOX (CTA prominente)        │
    // └─────────────────────────────────────┘
    +(_publicMode
      // ── Non loggato: CTA registrazione ──
      ?'<div class="buy-box">'
      +'<div class="buy-box-label"><span class="it">Vuoi partecipare?</span><span class="en">Want to participate?</span></div>'
      +'<p class="buy-box-framing"><span class="it">Registrati gratis per ricevere ARIA ogni giorno e acquistare blocchi.</span><span class="en">Sign up free to earn ARIA every day and buy blocks.</span></p>'
      +'<a href="/signup?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" class="buy-btn" style="display:block;text-align:center;text-decoration:none"><span class="it">Registrati gratis &rarr;</span><span class="en">Sign up free &rarr;</span></a>'
      +'<a href="/login?returnTo='+encodeURIComponent('/airdrops/'+a.id)+'" style="display:block;text-align:center;margin-top:10px;color:var(--gray-400);font-size:13px;text-decoration:none"><span class="it">Hai gi&agrave; un account? Accedi</span><span class="en">Already have an account? Log in</span></a>'
      +'</div>'
      // ── Loggato: buy box con slider ──
      :'<div class="buy-box">'
      +'<div class="buy-box-label"><span class="it">Acquista blocchi</span><span class="en">Buy blocks</span></div>'
      +(isPresale?'<div class="ap-presale-boost" style="margin-bottom:16px"><strong>&#9935; PRESALE 2x</strong> — <span class="it">Ogni blocco guadagna il doppio dei ROBI!</span><span class="en">Each block earns double ROBI!</span></div>':'')
      +'<div class="buy-display">'
      +'<div class="buy-display-count" id="buy-display-count">1 <span><span class="it">blocco</span><span class="en">block</span></span></div>'
      +'<div class="buy-display-cost" id="buy-display-cost">= '+currentPrice+' ARIA</div>'
      +'<div class="buy-display-balance"><span class="it">Saldo:</span><span class="en">Balance:</span> '+_balance+' ARIA</div>'
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
      +'<button class="buy-btn" id="buy-btn" onclick="initBuy()"'+(remaining<=0||maxBuy<1?' disabled':'')+'>'
      +(remaining>0&&maxBuy>=1
        ?'<span class="it">Acquista blocchi</span><span class="en">Buy blocks</span>'
        :(remaining<=0?'<span class="it">Esaurito</span><span class="en">Sold out</span>':'<span class="it">ARIA insufficienti</span><span class="en">Not enough ARIA</span>'))
      +'</button>'
      +'<div class="buy-msg" id="buy-msg"></div>'
      +'</div>'
    )

    // ┌─────────────────────────────────────┐
    // │  4. POSIZIONE + STRATEGY            │
    // └─────────────────────────────────────┘
    +'<div class="detail-position" id="detail-position"></div>'
    +'<div class="detail-strategy" id="detail-strategy"></div>'

    // ┌─────────────────────────────────────┐
    // │  5. LE TUE STATISTICHE              │
    // └─────────────────────────────────────┘
    +(myBlocks>0&&!_publicMode?
    '<div class="detail-mystats" id="detail-mystats">'
    +'<div class="mystats-header"><span class="it">Le tue statistiche</span><span class="en">Your stats</span></div>'
    +'<div class="ap-myblocks-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> <strong>'+myBlocks+'</strong> <span class="it">blocchi</span><span class="en">blocks</span> &middot; '+(myBlocks*currentPrice)+' ARIA <span class="it">investiti</span><span class="en">invested</span></div>'
    +'<div class="mystats-grid" id="mystats-grid"></div>'
    +'<div class="mystats-history" id="mystats-history"></div>'
    +'</div>'
    :'')

    // ┌─────────────────────────────────────┐
    // │  6. DETTAGLI AIRDROP (accordion)    │
    // └─────────────────────────────────────┘
    +acc('airdrop','Dettagli airdrop','Airdrop details',
      '<ul class="acc-list neutral">'
      +'<li><span class="it">Prezzo per blocco:</span><span class="en">Price per block:</span> <strong style="color:var(--aria)">'+a.block_price_aria+' ARIA</strong></li>'
      +'<li><span class="it">Blocchi totali:</span><span class="en">Total blocks:</span> <strong>'+a.total_blocks.toLocaleString('it-IT')+'</strong></li>'
      +'<li><span class="it">Blocchi rimasti:</span><span class="en">Blocks left:</span> <strong>'+remaining.toLocaleString('it-IT')+'</strong></li>'
      +'<li><span class="it">Costo totale airdrop:</span><span class="en">Total airdrop cost:</span> <strong style="color:var(--aria)">'+totalAriaCost.toLocaleString('it-IT')+' ARIA</strong></li>'
      +'<li><span class="it">Mining:</span><span class="en">Mining:</span> <strong style="color:var(--gold)">1 ROBI ogni '+miningRate+' blocchi</strong>'+(isPresale?' <span style="color:var(--aria)">(presale: ogni '+Math.max(1,Math.ceil(miningRate/2))+' blocchi)</span>':'')+'</li>'
      +(dl?'<li><span class="it">Scadenza:</span><span class="en">Deadline:</span> <strong>'+dl+'</strong></li>':'')
      +'</ul>',false)

    // ┌─────────────────────────────────────┐
    // │  7. AUTO-BUY (advanced)             │
    // └─────────────────────────────────────┘
    +(myBlocks>0&&!_publicMode?
    '<div class="auto-buy-box" id="auto-buy-box">'
    +'<div style="font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;color:var(--aria);margin-bottom:8px">'+UI_ICONS.zap+' AUTO-BUY</div>'
    +'<p style="font-size:11px;color:var(--gray-400);margin-bottom:10px;line-height:1.4"><span class="it">Compra automaticamente blocchi a intervalli regolari.</span><span class="en">Automatically buy blocks at regular intervals.</span></p>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">BLOCCHI</span><span class="en">BLOCKS</span></label>'
    +'<select id="ab-qty" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px;border-radius:var(--radius-sm)"><option>1</option><option>2</option><option>3</option><option>5</option><option>10</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px"><span class="it">OGNI</span><span class="en">EVERY</span></label>'
    +'<select id="ab-interval" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px;border-radius:var(--radius-sm)"><option value="1">1h</option><option value="2">2h</option><option value="4" selected>4h</option><option value="6">6h</option><option value="12">12h</option></select></div>'
    +'<div><label style="font-family:var(--font-m);font-size:8px;letter-spacing:1px;color:var(--gray-500);display:block;margin-bottom:3px">MAX</label>'
    +'<input type="number" id="ab-max" value="50" min="1" max="500" style="width:100%;padding:6px;background:var(--gray-800);border:1px solid var(--gray-700);color:var(--white);font-size:12px;border-radius:var(--radius-sm)"></div>'
    +'</div>'
    +'<button id="ab-toggle" onclick="toggleAutoBuy(\''+a.id+'\')" style="width:100%;padding:10px;background:var(--aria);color:var(--white);border:none;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;cursor:pointer;font-weight:700;border-radius:var(--radius-sm)"><span class="it">ATTIVA AUTO-BUY</span><span class="en">ACTIVATE AUTO-BUY</span></button>'
    +'<div id="ab-status" style="margin-top:6px;font-size:10px;color:var(--gray-500);text-align:center"></div>'
    +'</div>'
    :'')

    +'</div>' // close detail-right

    +'</div>'; // close detail-split

  var content=document.getElementById('ap-content');
  if(content)content.innerHTML=html;

  // Start gallery autoplay
  if(galleryImgs.length>1)startGalleryAutoplay();

  // Start countdown ticker
  startCountdowns();

  // Position live + polling
  refreshPosition(a.id);
  if(_positionInterval)clearInterval(_positionInterval);
  _positionInterval=setInterval(function(){refreshPosition(a.id)},30000);

  // Detail stats
  if(myBlocks>0&&!_publicMode)loadDetailStats(a.id);

  // Auto-buy status
  if(myBlocks>0&&!_publicMode)loadAutoBuyStatus(a.id);

  // Topbar CONTROL ROOM (admin only)
  if(_isAdmin)showTopbarCR(a.id);
}

function showTopbarCR(airdropId){
  if(!_isAdmin)return;
  var right=document.querySelector('.topbar-right');
  if(!right)return;
  var existing=document.getElementById('topbar-cr-btn');
  if(existing)existing.remove();
  var btn=document.createElement('button');
  btn.id='topbar-cr-btn';
  btn.className='topbar-btn topbar-cr-btn';
  btn.textContent='CONTROL ROOM';
  btn.onclick=function(){openControlRoom(airdropId)};
  right.insertBefore(btn,right.firstChild);
}

// ── Control Room (admin modal) ──
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

  var token=await getValidToken();if(!token){closeControlRoom();return;}
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
    if(bRes.ok){var blocks=await bRes.json();blocks.forEach(function(b){if(b.purchased_phase==='presale')presaleBlocks++;else saleBlocks++;});}
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
      +'<div style="font-size:10px;color:var(--gray-500);margin-bottom:8px">F1 = Blocchi acquistati (70%) &middot; F2 = ARIA spesi nella categoria (30%)</div>'
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
    // Header
    +'<div class="cr-header"><h3>CONTROL ROOM</h3><button class="cr-close" onclick="closeControlRoom()">&times;</button></div>'

    // KPI — Partecipazione
    +'<div class="cr-section"><div class="cr-section-title">Partecipazione</div>'
    +'<div class="cr-kpi-grid">'
    +kpi('Partecipanti',uniqueUsers,'utenti unici')
    +kpi('Fill Rate',fillPct+'%',totalBlks+'/'+a.total_blocks)
    +kpi('Revenue','&euro;'+totalEur,totalAria+' ARIA')
    +kpi('Media/Utente',avgPerUser+' AR','&euro;'+(avgPerUser*0.10).toFixed(0)+' eq.')
    +'</div></div>'

    // KPI — Economia
    +'<div class="cr-section"><div class="cr-section-title">Economia</div>'
    +'<div class="cr-kpi-grid">'
    +kpi('Presale',presaleBlocks+' bl.',presalePct+'%','var(--aria)')
    +kpi('Sale',saleBlocks+' bl.',(100-presalePct)+'%')
    +kpi('Mining','div '+divisor,'~'+estShares.toFixed(1)+' quote','var(--gold)')
    +kpi('Quota ROBI','&euro;'+nftPrice,nftCirc.toFixed(1)+' circ.','var(--gold)')
    +'</div></div>'

    // Status
    +'<div class="cr-section"><div class="cr-section-title">Status</div>'
    +'<div class="cr-status">'
    +'<strong>Esito:</strong> '+successLabel
    +'<br><strong>Venditore:</strong> &euro;'+venditoreEur+' / min &euro;'+sellerMin
    +'<br><strong>Split:</strong> Fondo &euro;'+(preview.split?preview.split.fondo_eur:0)+' | Fee &euro;'+(preview.split?preview.split.airoobi_eur:0)
    +'<br><strong>Treasury:</strong> &euro;'+treasuryBal.toFixed(2)+' | Quota ROBI: &euro;'+nftPrice
    +'</div></div>'

    // Top partecipanti
    +'<div class="cr-section"><div class="cr-section-title">Top Partecipanti</div>'
    +'<table class="cr-table"><thead><tr><th>#</th><th>User</th><th style="text-align:center">Blocks</th><th style="text-align:center">ARIA</th><th style="text-align:right">&euro; eq.</th></tr></thead><tbody>'
    +topParts.map(function(p,i){return '<tr><td>'+(i+1)+'</td><td style="font-family:var(--font-mono,monospace)">'+p.uid+'&hellip;</td><td style="text-align:center">'+p.blocks+'</td><td style="text-align:center">'+p.aria+'</td><td style="text-align:right">&euro;'+(p.aria*0.10).toFixed(0)+'</td></tr>'}).join('')
    +'</tbody></table></div>'

    // Score leaderboard
    +scoresHtml;

  modal.innerHTML=h;
}

// ── Get airdrop ID from URL path ──
var _airdropId=(function(){
  var parts=location.pathname.split('/');
  // strip empty trailing segment
  var last=parts[parts.length-1]||parts[parts.length-2]||null;
  return last;
})();

// ── Init ──
(async function(){
  _session=getSession();
  _publicMode=!_session;

  // Update topbar: show user menu button when logged in, hide Login button
  if(_session&&_session.user){
    var loginBtn=document.getElementById('ap-login-btn');
    if(loginBtn)loginBtn.style.display='none';
    var userBtn=document.getElementById('ap-user-btn');
    if(userBtn)userBtn.style.display='inline-flex';
    var email=_session.user.email||'';
    var emailEl=document.getElementById('ap-user-menu-email');
    if(emailEl)emailEl.textContent=email;
    var letterEl=document.getElementById('ap-user-btn-letter');
    if(letterEl)letterEl.textContent=email?email[0].toUpperCase():'?';
    loadApAvatar();
  }

  if(!_airdropId){
    showError();
    return;
  }

  try{
    var res=await fetch(SB_URL+'/rest/v1/airdrops?id=eq.'+_airdropId+'&select=*',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    });
    if(!res.ok){showError();return;}
    var rows=await res.json();
    if(!rows||rows.length===0){showError();return;}
    _currentDetail=rows[0];

    // Update page meta
    document.title=_currentDetail.title+' — AIROOBI Airdrop';
    var metaDesc=document.querySelector('meta[name="description"]');
    if(metaDesc)metaDesc.setAttribute('content','Partecipa all\'airdrop "'+_currentDetail.title+'" su AIROOBI. Compra blocchi con ARIA e guadagna ROBI.');
    var ogTitle=document.querySelector('meta[property="og:title"]');
    if(ogTitle)ogTitle.setAttribute('content',_currentDetail.title+' — AIROOBI Airdrop');
    var ogImage=document.querySelector('meta[property="og:image"]');
    if(ogImage&&_currentDetail.image_url)ogImage.setAttribute('content',_currentDetail.image_url);

    // Load everything in parallel
    await Promise.all([
      loadRobiPrice(),
      _session?loadBalance():Promise.resolve(),
      _session?loadWatchlist():Promise.resolve(),
      _session?checkAdmin():Promise.resolve()
    ]);

    // Register push SW
    if(_session){
      registerServiceWorker();
      setTimeout(requestPushPermission,3000);
    }

    // Hide loading, render
    var loading=document.getElementById('ap-loading');
    if(loading)loading.style.display='none';

    await renderDetail();
  }catch(e){
    showError();
  }
})();
