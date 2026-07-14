/* ══ Shared Footer Component — airoobi.app ══
   Usage: <div id="footer-mount" data-version="alfa-GG.MM.AAAA-x.y.z"></div>
          <script src="/src/footer.js"></script>
   Self-contained: inietta il proprio CSS, gestisce it/en via data-lang
   sul <html> (stessa convenzione delle pagine), versione per-pagina
   letta da data-version — la regola footer-version-per-file resta.   */
(function(){
'use strict';

var CSS=''
+'.app-footer{border-top:1px solid var(--gray-800,#E3E8EF);padding:40px 24px 34px;text-align:center;'
+'font-family:var(--font,\'Inter\',\'Instrument Sans\',sans-serif);background:transparent}'
+'.app-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 22px;margin-bottom:18px}'
+'.app-footer-links a{color:var(--gray-400,#5B6A7D);text-decoration:none;font-size:12px;letter-spacing:.04em;transition:color .2s}'
+'.app-footer-links a:hover{color:var(--gold,#EF3E4F)}'
+'.app-footer-copy{font-size:12px;color:var(--gray-400,#5B6A7D)}'
+'.app-footer-18{font-size:11px;color:var(--gray-500,#8A97A8);margin-top:4px}'
+'.app-footer-motto{font-family:var(--font-m,\'JetBrains Mono\',monospace);font-size:10px;letter-spacing:1.5px;color:var(--gold,#EF3E4F);margin-top:10px;text-transform:uppercase}'
+'.app-footer-ver{font-family:var(--font-m,\'JetBrains Mono\',monospace);font-size:9px;letter-spacing:1px;color:var(--gray-500,#8A97A8);margin-top:6px}'
/* it/en self-contained: non dipende dal CSS della pagina */
+'.app-footer .en{display:none}'
+'html[data-lang="en"] .app-footer .en{display:inline}'
+'html[data-lang="en"] .app-footer .it{display:none}'
/* punto 13 (15 lug 2026): simbolini (A)ria / (R)obi inline nei testi */+'.tok-coin{white-space:nowrap}'+'.tok-coin::before{content:"";display:inline-block;width:.92em;height:.92em;margin-right:.22em;vertical-align:-0.1em;background-size:contain;background-repeat:no-repeat}'+'.tok-aria::before{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%277%27 fill=%27none%27 stroke=%27%234A9EFF%27 stroke-width=%271.6%27/%3E%3Ctext x=%278%27 y=%2711.6%27 text-anchor=%27middle%27 fill=%27%234A9EFF%27 font-size=%279.5%27 font-weight=%27700%27 font-family=%27Inter,sans-serif%27%3EA%3C/text%3E%3C/svg%3E")}'+'.tok-robi::before{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%277%27 fill=%27none%27 stroke=%27%23EF3E4F%27 stroke-width=%271.6%27/%3E%3Ctext x=%278%27 y=%2711.6%27 text-anchor=%27middle%27 fill=%27%23EF3E4F%27 font-size=%279.5%27 font-weight=%27700%27 font-family=%27Inter,sans-serif%27%3ER%3C/text%3E%3C/svg%3E")}';

var LINKS=[
  {href:'https://airoobi.com', it:'airoobi.com', en:'airoobi.com'},
  {href:'/airdrops',           it:'Airdrops',    en:'Airdrops'},
  {href:'/come-funziona-airdrop', it:'Come funziona', en:'How it works'},
  {href:'/blog',               it:'Blog',        en:'Blog'},
  {href:'/faq',                it:'FAQ',         en:'FAQ'},
  {href:'/tokens',             it:'Tokenomics',  en:'Tokenomics'},
  {href:'/termini',            it:'Termini',     en:'Terms'},
  {href:'/privacy',            it:'Privacy',     en:'Privacy'},
  {href:'/contatti',           it:'Contatti',    en:'Contact'}
];

function span(l){return '<span class="it">'+l.it+'</span><span class="en">'+l.en+'</span>';}

function render(mount){
  var ver=mount.getAttribute('data-version')||'';
  var links=LINKS.map(function(l){
    return '<a href="'+l.href+'">'+span(l)+'</a>';
  }).join('');
  mount.outerHTML='<footer class="app-footer">'
    +'<div class="app-footer-links">'+links+'</div>'
    +'<div class="app-footer-copy">&copy; 2026 AIROOBI &mdash; Dream Robe E-Commerce. <span class="it">Tutti i diritti riservati.</span><span class="en">All rights reserved.</span></div>'
    +'<div class="app-footer-18"><span class="it">Piattaforma riservata ai maggiorenni (18+).</span><span class="en">Platform for adults only (18+).</span></div>'
    +'<div class="app-footer-motto"><span class="it">Stiamo costruendo. Ogni giorno.</span><span class="en">Building. Every day.</span></div>'
    +(ver?'<div class="app-footer-ver">'+ver+'</div>':'')
    +'</footer>';
}


/* ── punto 13: simbolini ARIA/ROBI accanto alle citazioni nei testi ── */
var TOK_SKIP='script,style,code,pre,textarea,input,svg,select,option,.tok-coin,.no-tok,.topbar,.topbar-bal,.dash-stat-label,.abo-todo-item,[contenteditable]';
function tokenizeCoins(root){
  if(!root||!root.querySelectorAll)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    if(!/\b(ARIA|ROBI)\b/.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
    var p=n.parentElement;
    if(!p||p.closest(TOK_SKIP))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  var nodes=[];var nd;
  while((nd=walker.nextNode()))nodes.push(nd);
  nodes.forEach(function(node){
    var parts=node.nodeValue.split(/\b(ARIA|ROBI)\b/);
    if(parts.length<2)return;
    var frag=document.createDocumentFragment();
    parts.forEach(function(part){
      if(part==='ARIA'||part==='ROBI'){
        var sp=document.createElement('span');
        sp.className='tok-coin tok-'+(part==='ARIA'?'aria':'robi');
        sp.textContent=part;
        frag.appendChild(sp);
      }else if(part){
        frag.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(frag,node);
  });
}
var _tokTimer=null;
function scheduleTokenize(){
  if(_tokTimer)clearTimeout(_tokTimer);
  _tokTimer=setTimeout(function(){tokenizeCoins(document.body);},400);
}


/* ── punto 17 (15 lug 2026): PWA — proponi l'installazione, desktop e mobile ── */
function initPwa(){
  if('serviceWorker' in navigator){
    try{navigator.serviceWorker.register('/sw.js');}catch(e){}
  }
  if(localStorage.getItem('airoobi_pwa_dismissed'))return;
  if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)return;
  var deferred=null;
  function showBanner(onInstall){
    if(document.getElementById('pwa-banner'))return;
    var b=document.createElement('div');
    b.id='pwa-banner';
    b.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:12px;background:var(--black,#fff);color:var(--white,#0F1417);border:1px solid rgba(239,62,79,.35);border-radius:14px;padding:12px 16px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-family:Inter,sans-serif;font-size:13px;max-width:92vw';
    var isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
    b.innerHTML='<span style="font-weight:600">AIR<span style="color:#EF3E4F">OO</span>BI</span>'
      +'<span>'+(onInstall?'Installa l\'app sul tuo dispositivo':(isIos?'Aggiungi alla Home: Condividi &rarr; \u201cAggiungi alla schermata Home\u201d':''))+'</span>'
      +(onInstall?'<button id="pwa-install-btn" style="background:#EF3E4F;color:#fff;border:none;border-radius:9px;padding:8px 16px;font-weight:700;font-size:12px;letter-spacing:.06em;cursor:pointer">INSTALLA</button>':'')
      +'<button id="pwa-close-btn" style="background:none;border:none;color:inherit;opacity:.55;font-size:16px;cursor:pointer;padding:4px">\u2715</button>';
    document.body.appendChild(b);
    document.getElementById('pwa-close-btn').onclick=function(){b.remove();localStorage.setItem('airoobi_pwa_dismissed','1');};
    if(onInstall)document.getElementById('pwa-install-btn').onclick=function(){
      b.remove();
      if(deferred){deferred.prompt();deferred.userChoice.then(function(){localStorage.setItem('airoobi_pwa_dismissed','1');});}
    };
  }
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();deferred=e;
    setTimeout(function(){showBanner(true);},2500);
  });
  // iOS: nessun beforeinstallprompt — hint manuale una tantum
  if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone){
    setTimeout(function(){showBanner(false);},4000);
  }
}

function init(){
  var st=document.createElement('style');
  st.textContent=CSS;
  document.head.appendChild(st);
  var mounts=document.querySelectorAll('#footer-mount,[data-footer-mount]');
  for(var i=0;i<mounts.length;i++)render(mounts[i]);
  tokenizeCoins(document.body);
  try{
    new MutationObserver(scheduleTokenize).observe(document.body,{childList:true,subtree:true});
  }catch(e){}
  initPwa();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
