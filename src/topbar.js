/* ══ Shared Topbar Component — airoobi.app ══
   Usage: <div id="topbar-mount" data-active="home"></div>
          <script src="/src/topbar.js"></script>
   data-active: home | explore | learn | blog                          */
(function(){
'use strict';

var SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

/* ── Token icon helper (cerchiate ARIA/ROBI/KAS) ── */
window.tokIcon=function(t,sz){
  sz=sz||14;
  var c=t==='ARIA'?'#4A9EFF':t==='ROBI'?'#B8893D':t==='KAS'?'#49EACB':'var(--gray-500)';
  var l=t==='ARIA'?'A':t==='ROBI'?'R':t==='KAS'?'K':'?';
  return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 16 16" style="vertical-align:-2px;flex-shrink:0"><circle cx="8" cy="8" r="7" fill="none" stroke="'+c+'" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="'+c+'" font-size="9" font-weight="700" font-family="Instrument Sans,sans-serif">'+l+'</text></svg>';
};

/* ── SVG Icons ── */
var ICONS={
  home:'<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2"/></svg>',
  explore:'<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>',
  learn:'<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
  blog:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  submit:'<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  referral:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  my:'<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  wallet:'<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>',
  login:'<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
  faq:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  rules:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
  edu:'<svg viewBox="0 0 24 24"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 10v6"/></svg>',
  caret:'<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
  logout:'<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>'
};

var PUBLIC_LINKS=[
  {href:'/',        page:'home',    icon:ICONS.home,    it:'Home',    en:'Home'},
  {href:'/airdrops',page:'explore', icon:ICONS.explore, it:'Airdrops',en:'Airdrops', primary:true},
  {href:'/come-funziona-airdrop',page:'rules', icon:ICONS.rules, it:'Come funziona', en:'How it works'}
];

var EDU_LINKS=[
  {href:'/impara',  page:'learn',   icon:ICONS.learn,   it:'Impara',  en:'Learn'},
  {href:'/blog',    page:'blog',    icon:ICONS.blog,    it:'Blog',    en:'Blog'},
  {href:'/faq',     page:'faq',     icon:ICONS.faq,     it:'FAQ',     en:'FAQ'}
];

var AUTH_LINKS=[
  {href:'/proponi',         page:'submit',  icon:ICONS.submit,  it:'<b>Valuta</b>',   en:'<b>Evaluate</b>',  bold:true},
  {href:'/invita',          page:'referral',icon:ICONS.referral, it:'<b>+Invita</b>',  en:'<b>+Invite</b>',   invite:true},
  {href:'/miei-airdrop',    page:'my',      icon:ICONS.my,       it:'I miei',          en:'My drops'},
  {href:'/portafoglio-dapp',page:'wallet',  icon:ICONS.wallet,   it:'Portafoglio',     en:'Wallet'}
];

function linkHtml(l,active){
  var cls=[];
  if(l.page===active)cls.push('active');
  if(l.primary)cls.push('nav-primary');
  if(l.bold)cls.push('nav-bold');
  if(l.invite)cls.push('nav-invite');
  var c=cls.length?' class="'+cls.join(' ')+'"':'';
  return '<a href="'+l.href+'" data-page="'+l.page+'"'+c+'>'
    +l.icon+' <span class="it">'+l.it+'</span><span class="en">'+l.en+'</span></a>';
}

function eduDropdownHtml(active){
  var isActive=EDU_LINKS.some(function(l){return l.page===active});
  var items=EDU_LINKS.map(function(l){
    var ac=l.page===active?' active':'';
    return '<a href="'+l.href+'" data-page="'+l.page+'" class="topbar-edu-item'+ac+'">'
      +l.icon+' <span class="it">'+l.it+'</span><span class="en">'+l.en+'</span></a>';
  }).join('');
  return '<div class="topbar-dropdown" id="topbar-edu-wrap">'
    +'<button class="topbar-edu-btn'+(isActive?' active':'')+'" id="topbar-edu-btn" type="button" onclick="window._topbarToggleEdu(event)">'
    +ICONS.edu+' <span class="it">EDU</span><span class="en">EDU</span> '+ICONS.caret
    +'</button>'
    +'<div class="topbar-edu-menu" id="topbar-edu-menu">'+items+'</div>'
    +'</div>';
}

function buildTopbar(active,links){
  var navHtml=links.map(function(l){return linkHtml(l,active)}).join('');
  navHtml+=eduDropdownHtml(active);
  return '<header class="topbar">'
    +'<button class="topbar-burger" id="topbar-burger" onclick="window._topbarToggle()"><span></span><span></span><span></span></button>'
    +'<nav class="topbar-nav" id="topbar-nav">'+navHtml+'</nav>'
    +'<div class="topbar-right" id="topbar-right">'
    +'<button class="lang-toggle" id="lang-btn" onclick="window._topbarLang()">EN</button>'
    +'<a href="/login" class="topbar-auth-link" id="topbar-login"><span class="it">Accedi</span><span class="en">Log in</span></a>'
    +'<a href="/signup" class="topbar-auth-cta" id="topbar-signup"><span class="it">Registrati</span><span class="en">Sign up</span></a>'
    +'</div></header>';
}

function buildMobile(active,links){
  // Mobile resta piatto: include PUBLIC + EDU come lista verticale
  var all=links.concat(EDU_LINKS);
  var html=all.map(function(l){return linkHtml(l,active)}).join('');
  html+='<div class="topbar-mobile-auth" id="topbar-mobile-auth">'
    +'<a href="/login">'+ICONS.login+' <span class="it">Accedi</span><span class="en">Log in</span></a>'
    +'<a href="/signup" class="topbar-auth-cta">'+ICONS.referral+' <span class="it">Registrati gratis</span><span class="en">Sign up free</span></a>'
    +'</div>';
  return '<div class="topbar-mobile-menu" id="topbar-mobile-menu">'+html+'</div>';
}

/* ── Public API ── */

window._topbarToggle=function(){
  var m=document.getElementById('topbar-mobile-menu');
  if(m){
    m.classList.toggle('active');
    document.body.style.overflow=m.classList.contains('active')?'hidden':'';
  }
};

window._topbarToggleUserMenu=function(e){
  if(e){e.stopPropagation();}
  var menu=document.getElementById('tb-user-menu');
  var btn=document.getElementById('tb-avatar-btn');
  if(!menu||!btn)return;
  var open=menu.classList.toggle('open');
  btn.classList.toggle('open',open);
};
window._topbarToggleEdu=function(e){
  if(e){e.stopPropagation();}
  var menu=document.getElementById('topbar-edu-menu');
  var btn=document.getElementById('topbar-edu-btn');
  if(!menu||!btn)return;
  var open=menu.classList.toggle('open');
  btn.classList.toggle('open',open);
};
window._topbarLogout=function(){
  try{localStorage.removeItem('airoobi_session');}catch(e){}
  window.location.href='/';
};
document.addEventListener('click',function(e){
  var menu=document.getElementById('tb-user-menu');
  var btn=document.getElementById('tb-avatar-btn');
  if(!menu||!menu.classList.contains('open'))return;
  if(menu.contains(e.target)||(btn&&btn.contains(e.target)))return;
  menu.classList.remove('open');
  if(btn)btn.classList.remove('open');
});
document.addEventListener('click',function(e){
  var menu=document.getElementById('topbar-edu-menu');
  var btn=document.getElementById('topbar-edu-btn');
  if(!menu||!menu.classList.contains('open'))return;
  if(menu.contains(e.target)||(btn&&btn.contains(e.target)))return;
  menu.classList.remove('open');
  if(btn)btn.classList.remove('open');
});

async function loadTopbarAvatar(session){
  if(!session||!session.user||!session.user.id)return;
  try{
    var token=await getValidTokenFromSession(session);
    if(!token)return;
    var res=await fetch(SB_URL+'/rest/v1/profiles?id=eq.'+session.user.id+'&select=avatar_url',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}
    });
    if(!res.ok)return;
    var rows=await res.json();
    if(!rows||!rows[0]||!rows[0].avatar_url)return;
    var btn=document.getElementById('tb-avatar-btn');
    var letter=document.getElementById('tb-avatar-letter');
    if(!btn)return;
    if(letter)letter.style.display='none';
    var img=document.createElement('img');
    img.src=rows[0].avatar_url+'?t='+Date.now();
    img.alt='';
    btn.appendChild(img);
  }catch(e){}
}

window._topbarLang=function(){
  var root=document.documentElement;
  var c=root.getAttribute('data-lang')||'it';
  var n=c==='it'?'en':'it';
  root.setAttribute('data-lang',n);
  root.setAttribute('lang',n);
  document.getElementById('lang-btn').textContent=n==='it'?'EN':'IT';
  localStorage.setItem('airoobi_lang',n);
};
// Alias for pages that call toggleLang() directly
window.toggleLang=window._topbarLang;

function getValidTokenFromSession(session){
  if(!session||!session.access_token)return Promise.resolve(null);
  try{
    var payload=JSON.parse(atob(session.access_token.split('.')[1]));
    if(payload.exp*1000>Date.now()+60000) return Promise.resolve(session.access_token);
  }catch(e){return Promise.resolve(session.access_token);}
  // Token expired — try refresh
  if(!session.refresh_token)return Promise.resolve(null);
  return fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{
    method:'POST',
    headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({refresh_token:session.refresh_token})
  }).then(function(r){return r.json()}).then(function(d){
    if(d&&d.access_token){
      session.access_token=d.access_token;
      session.refresh_token=d.refresh_token||session.refresh_token;
      if(d.expires_at)session.expires_at=d.expires_at;
      localStorage.setItem('airoobi_session',JSON.stringify(session));
      return d.access_token;
    }
    return null;
  }).catch(function(){return null;});
}

function upgradeToLoggedIn(session){
  var email=session.user&&session.user.email?session.user.email:'';
  var letter=email?email.charAt(0).toUpperCase():'?';
  var uid=session.user?session.user.id:'';

  // Expand nav: [Home, Airdrops] + AUTH + [Come funziona] + EDU dropdown
  var nav=document.getElementById('topbar-nav');
  if(nav){
    var active=document.querySelector('#topbar-mount')?.getAttribute('data-active')||'';
    // Override Home link → /dashboard for logged users
    var homeLogged=Object.assign({},PUBLIC_LINKS[0],{href:'/dashboard'});
    var allLinks=[homeLogged,PUBLIC_LINKS[1]].concat(AUTH_LINKS).concat(PUBLIC_LINKS.slice(2));
    nav.innerHTML=allLinks.map(function(l){return linkHtml(l,active)}).join('')+eduDropdownHtml(active);
  }

  // Replace auth buttons with balance + avatar (with contextual dropdown menu)
  var topRight=document.getElementById('topbar-right');
  if(topRight){
    var lang=(document.documentElement.getAttribute('data-lang')||'it')==='it'?'EN':'IT';
    topRight.innerHTML=
      '<span class="topbar-bal" id="tb-aria"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="#4A9EFF" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="#4A9EFF" font-size="9" font-weight="700">A</text></svg><span id="tb-aria-val">\u2014</span></span>'
      +'<span class="topbar-bal topbar-bal-robi" id="tb-robi"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="#B8893D" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="#B8893D" font-size="9" font-weight="700">R</text></svg><span id="tb-robi-val">\u2014</span></span>'
      +'<button class="lang-toggle" id="lang-btn" onclick="window._topbarLang()">'+lang+'</button>'
      +'<button class="topbar-avatar" id="tb-avatar-btn" onclick="window._topbarToggleUserMenu(event)" aria-label="Menu utente"><span id="tb-avatar-letter">'+letter+'</span></button>';
  }

  // Build user dropdown menu (mounted as sibling, fixed position)
  if(!document.getElementById('tb-user-menu')){
    var menu=document.createElement('div');
    menu.id='tb-user-menu';
    menu.className='tb-user-menu';
    menu.innerHTML=
      '<div class="tb-user-menu-email" id="tb-user-menu-email">'+(email||'')+'</div>'
      +'<a href="/dashboard" class="tb-user-menu-item">'+ICONS.home+' <span class="it">Home</span><span class="en">Home</span></a>'
      +'<a href="/airdrops" class="tb-user-menu-item">'+ICONS.explore+' <span class="it">Esplora airdrop</span><span class="en">Explore airdrops</span></a>'
      +'<a href="/miei-airdrop" class="tb-user-menu-item">'+ICONS.my+' <span class="it">I miei airdrop</span><span class="en">My airdrops</span></a>'
      +'<a href="/portafoglio-dapp" class="tb-user-menu-item">'+ICONS.wallet+' <span class="it">Portafoglio</span><span class="en">Wallet</span></a>'
      +'<a href="/proponi" class="tb-user-menu-item">'+ICONS.submit+' <span class="it">Vendi (airdroppa)</span><span class="en">Sell (airdrop)</span></a>'
      +'<a href="/invita" class="tb-user-menu-item">'+ICONS.referral+' <span class="it">+Invita amici</span><span class="en">+Invite friends</span></a>'
      +'<div class="tb-user-menu-sep"></div>'
      +'<a href="/come-funziona-airdrop" class="tb-user-menu-item">'+ICONS.rules+' <span class="it">Come funziona</span><span class="en">How it works</span></a>'
      +'<a href="/faq" class="tb-user-menu-item">'+ICONS.faq+' FAQ</a>'
      +'<button class="tb-user-menu-item tb-user-menu-logout" onclick="window._topbarLogout()">'+ICONS.logout+' Logout</button>';
    document.body.appendChild(menu);
  }

  // Load avatar image if present in profile
  loadTopbarAvatar(session);

  // Update mobile menu (flat: [Home, Airdrops] + AUTH + [ComeFunziona] + EDU_LINKS)
  var mm=document.getElementById('topbar-mobile-menu');
  if(mm){
    var active2=document.querySelector('#topbar-mount')?.getAttribute('data-active')||'';
    var homeLogged2=Object.assign({},PUBLIC_LINKS[0],{href:'/dashboard'});
    var allLinks2=[homeLogged2,PUBLIC_LINKS[1]].concat(AUTH_LINKS).concat(PUBLIC_LINKS.slice(2)).concat(EDU_LINKS);
    // Remove auth section, add full links
    var mobileAuth=document.getElementById('topbar-mobile-auth');
    if(mobileAuth)mobileAuth.remove();
    // Rebuild links
    var existingLinks=mm.querySelectorAll('a');
    existingLinks.forEach(function(a){a.remove()});
    allLinks2.forEach(function(l){
      var tmp=document.createElement('div');
      tmp.innerHTML=linkHtml(l,active2);
      mm.appendChild(tmp.firstChild);
    });
  }

  // Fetch balances with valid token
  if(uid){
    getValidTokenFromSession(session).then(function(validToken){
      if(!validToken)return;
      fetch(SB_URL+'/rest/v1/profiles?id=eq.'+uid+'&select=total_points',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+validToken}})
        .then(function(r){return r.json()}).then(function(d){
          if(d&&d[0]){var el=document.getElementById('tb-aria-val');if(el)el.textContent=d[0].total_points||0;}
        }).catch(function(){});
      fetch(SB_URL+'/rest/v1/nft_rewards?user_id=eq.'+uid+'&nft_type=in.(ROBI,NFT_REWARD)&select=shares',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+validToken}})
        .then(function(r){return r.json()}).then(function(d){
          var t=0;if(d)d.forEach(function(n){t+=parseFloat(n.shares)||0;});
          var el=document.getElementById('tb-robi-val');if(el)el.textContent=Math.round(t*100)/100;
        }).catch(function(){});
    });
  }
}

/* ── Init ── */
function init(){
  var mount=document.getElementById('topbar-mount');
  if(!mount)return;
  var active=mount.getAttribute('data-active')||'';

  mount.innerHTML=buildTopbar(active,PUBLIC_LINKS)+buildMobile(active,PUBLIC_LINKS);

  // Restore lang preference
  var savedLang=localStorage.getItem('airoobi_lang');
  if(savedLang&&savedLang!=='it')window._topbarLang();

  // Check if user is logged in — upgrade topbar
  try{
    var s=localStorage.getItem('airoobi_session');
    if(s){
      var session=JSON.parse(s);
      if(session&&session.access_token){
        upgradeToLoggedIn(session);
      }
    }
  }catch(e){}
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

})();
