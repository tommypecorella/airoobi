/* ══ Shared Topbar Component — airoobi.app ══
   Usage: <div id="topbar-mount" data-active="home"></div>
          <script src="/src/topbar.js"></script>
   data-active: home | explore | learn | blog                          */
(function(){
'use strict';

var SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDkwNjQsImV4cCI6MjA1NjQyNTA2NH0.dB02umuZbVFnVVMVEZu8cn9ybiAH0Zl04hzAGXg-vTE';

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
  login:'<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>'
};

var PUBLIC_LINKS=[
  {href:'/',        page:'home',    icon:ICONS.home,    it:'Home',    en:'Home'},
  {href:'/airdrops',page:'explore', icon:ICONS.explore, it:'Airdrops',en:'Airdrops', primary:true},
  {href:'/impara',  page:'learn',   icon:ICONS.learn,   it:'Impara',  en:'Learn'},
  {href:'/blog',    page:'blog',    icon:ICONS.blog,    it:'Blog',    en:'Blog'}
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

function buildTopbar(active,links){
  var navHtml=links.map(function(l){return linkHtml(l,active)}).join('');
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
  var html=links.map(function(l){return linkHtml(l,active)}).join('');
  html+='<div class="topbar-mobile-auth" id="topbar-mobile-auth">'
    +'<a href="/login">'+ICONS.login+' <span class="it">Accedi</span><span class="en">Log in</span></a>'
    +'<a href="/signup" class="topbar-auth-cta">'+ICONS.referral+' <span class="it">Registrati gratis</span><span class="en">Sign up free</span></a>'
    +'</div>';
  return '<div class="topbar-mobile-menu" id="topbar-mobile-menu">'+html+'</div>';
}

/* ── Public API ── */

window._topbarToggle=function(){
  var m=document.getElementById('topbar-mobile-menu');
  if(m)m.classList.toggle('active');
};

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

function upgradeToLoggedIn(session){
  var email=session.user&&session.user.email?session.user.email:'';
  var letter=email?email.charAt(0).toUpperCase():'?';
  var uid=session.user?session.user.id:'';
  var token=session.access_token;

  // Expand nav with auth links (insert before Impara)
  var nav=document.getElementById('topbar-nav');
  if(nav){
    var active=document.querySelector('#topbar-mount')?.getAttribute('data-active')||'';
    var allLinks=PUBLIC_LINKS.slice(0,2).concat(AUTH_LINKS).concat(PUBLIC_LINKS.slice(2));
    nav.innerHTML=allLinks.map(function(l){return linkHtml(l,active)}).join('');
  }

  // Replace auth buttons with balance + avatar
  var topRight=document.getElementById('topbar-right');
  if(topRight){
    var lang=(document.documentElement.getAttribute('data-lang')||'it')==='it'?'EN':'IT';
    topRight.innerHTML=
      '<span class="topbar-bal" id="tb-aria"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="#4A9EFF" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="#4A9EFF" font-size="9" font-weight="700">A</text></svg><span id="tb-aria-val">\u2014</span></span>'
      +'<span class="topbar-bal topbar-bal-robi" id="tb-robi"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="#B8960C" stroke-width="1.5"/><text x="8" y="11.5" text-anchor="middle" fill="#B8960C" font-size="9" font-weight="700">R</text></svg><span id="tb-robi-val">\u2014</span></span>'
      +'<button class="lang-toggle" id="lang-btn" onclick="window._topbarLang()">'+lang+'</button>'
      +'<a href="/airdrops" class="topbar-avatar">'+letter+'</a>';
  }

  // Update mobile menu
  var mm=document.getElementById('topbar-mobile-menu');
  if(mm){
    var active2=document.querySelector('#topbar-mount')?.getAttribute('data-active')||'';
    var allLinks2=PUBLIC_LINKS.slice(0,2).concat(AUTH_LINKS).concat(PUBLIC_LINKS.slice(2));
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

  // Fetch balances
  if(token&&uid){
    fetch(SB_URL+'/rest/v1/profiles?id=eq.'+uid+'&select=total_points',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}})
      .then(function(r){return r.json()}).then(function(d){
        if(d&&d[0]){var el=document.getElementById('tb-aria-val');if(el)el.textContent=d[0].total_points||0;}
      }).catch(function(){});
    fetch(SB_URL+'/rest/v1/nft_rewards?user_id=eq.'+uid+'&nft_type=in.(ROBI,NFT_REWARD)&select=shares',{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token}})
      .then(function(r){return r.json()}).then(function(d){
        var t=0;if(d)d.forEach(function(n){t+=parseFloat(n.shares)||0;});
        var el=document.getElementById('tb-robi-val');if(el)el.textContent=Math.round(t*100)/100;
      }).catch(function(){});
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
