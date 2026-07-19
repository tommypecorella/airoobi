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
/* punto 10 (15 lug 2026): box condivisione su tutte le pagine */+'.app-share{max-width:680px;margin:36px auto 0;padding:16px 20px;border:1px solid var(--gray-800,#E3E8EF);border-radius:14px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:center;font-family:var(--font-b,Inter,sans-serif)}'+'.app-share-label{font-family:var(--font-m,monospace);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray-500,#8A97A8);width:100%;text-align:center;margin-bottom:2px}'+'.app-share a,.app-share button{display:inline-flex;align-items:center;gap:6px;border:1px solid #D4DBE3;background:none;color:#33404F;font-size:12px;font-weight:600;padding:8px 14px;border-radius:999px;cursor:pointer;text-decoration:none;transition:all .15s}'
+'html[data-theme="dark"] .app-share a,html[data-theme="dark"] .app-share button{border-color:#6B7686;color:#8A94A6}'
/* ── Audit 19 lug · contrasti condivisi theme-espliciti (scanner WCAG) ── */
+'html:not([data-theme="dark"]) .topbar-nav a{color:#455364!important}'
+'html[data-theme="dark"] .topbar-nav a{color:#AEB9C6!important}'
+'.topbar-nav a.active,.topbar-nav a:hover{color:#EF3E4F!important}'
+'html:not([data-theme="dark"]) .lang-toggle{color:#455364!important;border-color:#D4DBE3!important}'
+'html[data-theme="dark"] .lang-toggle{color:#AEB9C6!important}'
/* KAS: teal scuro in light, ovunque (inline var(--kas) compreso) */
+'html:not([data-theme="dark"]) body{--kas:#0FA88C}'
+'html:not([data-theme="dark"]) .kas,html:not([data-theme="dark"]) .cf-kas{color:#0FA88C!important}'
/* Explorer ROBI: range grafico leggibile in entrambi i temi */
+'html:not([data-theme="dark"]) .exp-chart-range{color:#455364!important}'
+'html[data-theme="dark"] .exp-chart-range{color:#AEB9C6!important}'
/* Treasury: semaforo Green leggibile in light */
+'html:not([data-theme="dark"]) .band-status{color:#0B6B37!important}'
/* round-3: cat-pill globale (anche hub pubblico), ticker dashboard, tok-coin in light */
+'html:not([data-theme="dark"]) .cat-pill{color:#455364!important;border-color:#D4DBE3!important}'
+'html[data-theme="dark"] .cat-pill{color:#AEB9C6!important}'
+'html[data-theme="dark"] .cat-pill.active,html:not([data-theme="dark"]) .cat-pill.active{background:#EF3E4F!important;border-color:#EF3E4F!important;color:#fff!important}'
+'html:not([data-theme="dark"]) #activity-feed>div{color:#455364!important}'
+'html:not([data-theme="dark"]) .tok-coin{color:#33404F!important}'+'.app-share a:hover,.app-share button:hover{border-color:var(--gold,#EF3E4F);color:var(--gold,#EF3E4F)}'
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
    +'<div class="app-footer-vals" id="footer-vals" style="display:none;font-family:var(--font-m,\'JetBrains Mono\',monospace);font-size:10px;letter-spacing:1px;color:var(--gray-400,#5B6A7D);margin-top:8px"></div>'
    +(ver?'<div class="app-footer-ver">'+ver+'</div>':'')
    +'</footer>';
}

/* ── QUICK NAV MOBILE (19 lug, Skeezu): Home · Airdrop · Portafoglio · Invita ──
   Su tutte le pagine .app tranne ABO. Nel dettaglio airdrop (body.detail-open)
   si nasconde: lì comanda la tab bar del dettaglio, che ha la sua voce HOME. */
function initQuickNav(){
  if(_isAboPage())return;
  if(document.getElementById('aqn'))return;
  var logged=false;try{logged=!!localStorage.getItem('airoobi_session');}catch(e){}
  var p=location.pathname;
  var _i=function(paths){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';};
  var items=[
    {href:logged?'/dashboard':'/',act:(p==='/'||p.indexOf('/dashboard')===0||p==='/home'),ic:_i('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'),it:'Home',en:'Home'},
    // Loggato → /esplora (marketplace in-app): /airdrops è la pagina pubblica che rimbalza i loggati
    {href:logged?'/esplora':'/airdrops',act:(p.indexOf('/airdrops')===0||p.indexOf('/esplora')===0||p.indexOf('/airdrop')===0),ic:_i('<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'),it:'Airdrop',en:'Airdrops'},
    {href:'/portafoglio',act:(p.indexOf('/portafoglio')===0),ic:_i('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01M2 9h20"/>'),it:'Portafoglio',en:'Wallet'},
    {href:'/invita',act:(p.indexOf('/invita')===0||p.indexOf('/referral')===0),ic:_i('<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),it:'Invita',en:'Invite'}
  ];
  var st=document.createElement('style');
  st.textContent='#aqn{display:none}'
    +'@media(max-width:768px){'
    +'#aqn{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9980;background:var(--color-surface,#171B21);border-top:1px solid var(--color-border,#2A313A);padding:4px 8px calc(6px + env(safe-area-inset-bottom))}'
    +'html:not([data-theme="dark"]) #aqn{background:var(--color-surface,#FFFFFF);border-top-color:var(--color-border,#D4DBE3)}'
    +'#aqn a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 2px;min-height:46px;text-decoration:none;color:var(--color-text-muted,#8A94A6);font-family:\'JetBrains Mono\',monospace;font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}'
    +'#aqn a.act{color:var(--color-primary,#EF3E4F)}'
    +'#aqn svg{width:19px;height:19px}'
    +'body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}'
    +'body.detail-open #aqn{display:none}'
    +'}';
  document.head.appendChild(st);
  var nav=document.createElement('nav');
  nav.id='aqn';
  nav.setAttribute('aria-label','Navigazione rapida');
  nav.innerHTML=items.map(function(x){
    return '<a href="'+x.href+'"'+(x.act?' class="act"':'')+'>'+x.ic+'<span class="it">'+x.it+'</span><span class="en">'+x.en+'</span></a>';
  }).join('');
  document.body.appendChild(nav);
}

/* ── SEGNALAZIONI (18 lug 2026, GO Skeezu) ──
   Bottone flottante identico su ogni pagina (desktop+mobile): form minimale,
   il ticket porta con sé utente e pagina in automatico. Gestione in ABO. */
var SB_URL_F='https://vuvlmlpuhovipfwtquux.supabase.co';
var SB_KEY_F='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';
function _isAboPage(){return location.pathname.indexOf('abo.html')!==-1||location.pathname.indexOf('/abo')===0}
function initSegnala(){
  if(_isAboPage())return; // vale anche per /abo/<pagina>.html (rewrite 18 lug)
  // 19 lug (Skeezu): niente segnalazioni anonime — il bottone appare SOLO da loggati
  try{var _s=JSON.parse(localStorage.getItem('airoobi_session'));if(!_s||!_s.access_token)return;}catch(e){return;}
  if(document.getElementById('segnala-fab'))return;
  var st=document.createElement('style');
  st.textContent='#segnala-fab{position:fixed;right:16px;bottom:16px;z-index:9990;width:46px;height:46px;border-radius:50%;border:none;background:#EF3E4F;color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;transition:transform .15s}'
    +'@media(max-width:768px){#segnala-fab{bottom:calc(72px + env(safe-area-inset-bottom))}}'
    +'#segnala-fab:hover{transform:scale(1.08)}'
    +'#segnala-fab svg{width:21px;height:21px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    +'#segnala-modal{display:none;position:fixed;right:16px;bottom:72px;z-index:9991;width:min(330px,calc(100vw - 32px));background:var(--gray-800,#1D2630);border:1px solid #EF3E4F;border-radius:14px;padding:16px;box-shadow:0 10px 32px rgba(0,0,0,.45);color:var(--white,#F2F5F8)}'
    +'#segnala-modal.open{display:block}'
    +'#segnala-modal h4{font-size:14px;margin:0 0 4px;font-family:inherit}'
    +'#segnala-modal p{font-size:11px;color:var(--gray-400,#9AA7B2);margin:0 0 10px}'
    +'#segnala-modal textarea{width:100%;min-height:92px;background:rgba(0,0,0,.25);border:1px solid var(--gray-700,#36424F);border-radius:8px;color:inherit;font:inherit;font-size:13px;padding:8px;resize:vertical;box-sizing:border-box}'
    +'#segnala-send{margin-top:10px;width:100%;background:#EF3E4F;color:#fff;border:none;border-radius:8px;padding:10px;font-size:12px;letter-spacing:1.5px;font-weight:700;cursor:pointer;text-transform:uppercase}'
    +'#segnala-send:disabled{opacity:.5}'
    +'#segnala-msg{font-size:12px;margin-top:8px;display:none}';
  document.head.appendChild(st);
  // 19 lug (Skeezu): la bandierina vive in TOPBAR quando c'è (.topbar-right); fab solo come fallback
  var topRight=document.querySelector('.topbar-right');
  var fab=document.createElement('button');
  fab.setAttribute('aria-label','Segnala un problema');
  fab.title='Segnala un problema';
  fab.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';
  if(topRight){
    fab.id='segnala-top';
    st.textContent+='#segnala-top{width:30px;height:30px;flex-shrink:0;border-radius:50%;border:1px solid rgba(239,62,79,.45);background:none;color:#EF3E4F;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}'
      +'#segnala-top svg{width:15px;height:15px;stroke:#EF3E4F;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
      +'#segnala-modal.sg-top{bottom:auto;top:64px}';
  }else{
    fab.id='segnala-fab';
  }
  var modal=document.createElement('div');
  modal.id='segnala-modal';
  modal.innerHTML='<div id="segnala-head" style="display:flex;align-items:center;gap:8px;margin:-2px 0 4px;cursor:grab;touch-action:none">'
    +'<h4 style="flex:1;margin:0"><span class="it">Segnala un problema</span><span class="en">Report an issue</span></h4>'
    +'<button id="segnala-close" aria-label="Chiudi" style="width:26px;height:26px;flex:none;background:none;border:1px solid var(--gray-700,#36424F);border-radius:8px;color:inherit;font-size:14px;line-height:1;cursor:pointer">&times;</button>'
    +'</div>'
    +'<p><span class="it">Racconta cosa non va: pagina e utente li alleghiamo noi. Le segnalazioni utili vengono ringraziate in ROBI.</span><span class="en">Tell us what\'s wrong: page and user are attached automatically. Useful reports get thanked in ROBI.</span></p>'
    +'<textarea id="segnala-text" maxlength="2000" placeholder="Cosa non funziona? / What\'s wrong?"></textarea>'
    +'<button id="segnala-send"><span class="it">Invia segnalazione</span><span class="en">Send report</span></button>'
    +'<div id="segnala-msg"></div>';
  if(topRight){
    // 20 lug (Skeezu): bandierina PRIMA della campanella
    topRight.insertBefore(fab, topRight.querySelector('#notif-bell')||topRight.querySelector('.topbar-avatar')||null);
    modal.classList.add('sg-top');
  }else{
    document.body.appendChild(fab);
  }
  document.body.appendChild(modal);
  fab.addEventListener('click',function(){modal.classList.toggle('open');if(modal.classList.contains('open'))document.getElementById('segnala-text').focus();});
  document.addEventListener('click',function(e){
    if(modal.classList.contains('open')&&!modal.contains(e.target)&&e.target!==fab&&!fab.contains(e.target))modal.classList.remove('open');
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')modal.classList.remove('open');});
  document.getElementById('segnala-close').addEventListener('click',function(e){e.stopPropagation();modal.classList.remove('open');});
  // Balloon trascinabile dalla testata (pointer events: mouse + touch)
  (function(){
    var head=document.getElementById('segnala-head');
    var sx=0,sy=0,ox=0,oy=0,drag=false;
    head.addEventListener('pointerdown',function(e){
      if(e.target.id==='segnala-close')return;
      drag=true;sx=e.clientX;sy=e.clientY;
      var r=modal.getBoundingClientRect();ox=r.left;oy=r.top;
      modal.style.right='auto';modal.style.bottom='auto';
      modal.style.left=ox+'px';modal.style.top=oy+'px';
      head.setPointerCapture(e.pointerId);
      head.style.cursor='grabbing';
    });
    head.addEventListener('pointermove',function(e){
      if(!drag)return;
      var nx=Math.min(Math.max(0,ox+e.clientX-sx),window.innerWidth-modal.offsetWidth);
      var ny=Math.min(Math.max(0,oy+e.clientY-sy),window.innerHeight-60);
      modal.style.left=nx+'px';modal.style.top=ny+'px';
    });
    head.addEventListener('pointerup',function(){drag=false;head.style.cursor='grab';});
    head.addEventListener('pointercancel',function(){drag=false;head.style.cursor='grab';});
  })();
  document.getElementById('segnala-send').addEventListener('click',function(){
    var btn=this,txt=document.getElementById('segnala-text'),msg=document.getElementById('segnala-msg');
    var v=(txt.value||'').trim();
    if(v.length<5){msg.style.display='block';msg.style.color='#f87171';msg.innerHTML='<span class="it">Scrivi almeno qualche parola.</span><span class="en">Write at least a few words.</span>';return;}
    btn.disabled=true;
    var tok=SB_KEY_F;
    try{var sess=JSON.parse(localStorage.getItem('airoobi_session'));if(sess&&sess.access_token)tok=sess.access_token;}catch(e){}
    fetch(SB_URL_F+'/rest/v1/rpc/submit_user_report',{
      method:'POST',
      headers:{'apikey':SB_KEY_F,'Authorization':'Bearer '+tok,'Content-Type':'application/json'},
      body:JSON.stringify({p_message:v,p_page:location.pathname+location.search,p_user_agent:(navigator.userAgent||'').slice(0,250)})
    }).then(function(r){return r.json()}).then(function(d){
      btn.disabled=false;
      msg.style.display='block';
      if(d&&d.ok){
        msg.style.color='var(--kas,#49EACB)';
        msg.innerHTML='<span class="it">Grazie! Il team AIROOBI la legger&agrave; presto.</span><span class="en">Thanks! The AIROOBI team will read it soon.</span>';
        txt.value='';
        setTimeout(function(){modal.classList.remove('open');msg.style.display='none';},2600);
      }else{
        msg.style.color='#f87171';
        msg.innerHTML=(d&&d.error==='RATE_LIMIT')
          ?'<span class="it">Hai gi&agrave; inviato molte segnalazioni oggi — grazie! Riprova domani.</span><span class="en">You\'ve sent many reports today — thanks! Try again tomorrow.</span>'
          :'<span class="it">Invio non riuscito. Riprova.</span><span class="en">Send failed. Try again.</span>';
      }
    }).catch(function(){btn.disabled=false;msg.style.display='block';msg.style.color='#f87171';msg.innerHTML='<span class="it">Errore di rete. Riprova.</span><span class="en">Network error. Try again.</span>';});
  });
}

/* 17 lug 2026 · battito della piattaforma: quante valutazioni in corso
   (= i prossimi airdrop). Solo il numero, mai quali. */
function loadFooterCounters(){
  try{
    fetch('https://vuvlmlpuhovipfwtquux.supabase.co/rest/v1/rpc/get_public_counters',{
      method:'POST',
      headers:{'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co','Content-Type':'application/json'},
      body:'{}'
    }).then(function(r){return r.json()}).then(function(c){
      var n=c&&c.valutazioni_in_corso;
      window._pubCounters=c||null;
      if(!n)return;
      var el=document.getElementById('footer-vals');
      if(!el)return;
      el.innerHTML='<span class="it">In questo momento: '+n+(n===1?' oggetto':' oggetti')+' in valutazione &mdash; i prossimi airdrop.</span>'
        +'<span class="en">Right now: '+n+(n===1?' item':' items')+' under evaluation &mdash; the next airdrops.</span>';
      el.style.display='block';
      try{if(typeof window._onPubCounters==='function')window._onPubCounters(c);}catch(e){}
    }).catch(function(){});
  }catch(e){}
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
/* FIX freeze mobile 16 lug 2026: l'observer rifaceva la scansione di TUTTO il
   body a ogni mutazione (il countdown della dApp muta ogni secondo) — main
   thread saturo, tap morti. Ora: solo i nodi AGGIUNTI, observer staccato
   durante il lavoro, coda cappata. */
var _tokQueue=[];var _tokTimer=null;var _tokObs=null;
window.__tokStats={runs:0,nodes:0};
function scheduleTokenize(muts){
  for(var i=0;i<muts.length;i++){
    var added=muts[i].addedNodes;
    for(var j=0;j<added.length;j++){
      var n=added[j];
      if(n.nodeType!==1)continue;
      if(n.closest&&n.closest('.tok-coin'))continue;
      if(_tokQueue.length<80)_tokQueue.push(n);
    }
  }
  if(!_tokQueue.length)return;
  if(_tokTimer)clearTimeout(_tokTimer);
  _tokTimer=setTimeout(function(){
    var q=_tokQueue;_tokQueue=[];
    if(_tokObs)_tokObs.disconnect();
    for(var k=0;k<q.length;k++){
      try{if(q[k].isConnected){tokenizeCoins(q[k]);window.__tokStats.nodes++;}}catch(e){}
    }
    window.__tokStats.runs++;
    if(_tokObs)_tokObs.observe(document.body,{childList:true,subtree:true});
  },350);
}


/* ── punto 17 (15 lug 2026): PWA — proponi l'installazione, desktop e mobile ── */

/* ── punto 10: condivisione — quick share social da loggato, copia link da ospite ── */
function buildShareBar(){
  if(document.getElementById('app-share'))return;
  var foot=document.querySelector('.app-footer');
  if(!foot)return;
  var logged=false;
  try{logged=!!localStorage.getItem('airoobi_session');}catch(e){}
  var url=location.origin+location.pathname;
  var wrap=document.createElement('div');
  wrap.id='app-share';wrap.className='app-share';
  var label='<span class="app-share-label"><span class="it">Condividi AIROOBI</span><span class="en">Share AIROOBI</span></span>';
  function finish(shareUrl){
    var txt=encodeURIComponent('Ogni oggetto \u00e8 una corsa \u2014 AIROOBI');
    var enc=encodeURIComponent(shareUrl);
    if(logged){
      wrap.innerHTML=label
        +'<a href="https://wa.me/?text='+txt+'%20'+enc+'" target="_blank" rel="noopener">WhatsApp</a>'
        +'<a href="https://t.me/share/url?url='+enc+'&text='+txt+'" target="_blank" rel="noopener">Telegram</a>'
        +'<a href="https://twitter.com/intent/tweet?text='+txt+'&url='+enc+'" target="_blank" rel="noopener">X</a>'
        +'<a href="mailto:?subject='+txt+'&body='+enc+'">Email</a>'
        +'<button type="button" id="app-share-copy"><span class="it">Copia link</span><span class="en">Copy link</span></button>';
    }else{
      wrap.innerHTML=label
        +'<button type="button" id="app-share-copy"><span class="it">Copia link</span><span class="en">Copy link</span></button>';
    }
    foot.parentNode.insertBefore(wrap,foot);
    var cb=document.getElementById('app-share-copy');
    if(cb)cb.onclick=function(){
      (navigator.clipboard?navigator.clipboard.writeText(shareUrl):Promise.reject()).then(function(){
        cb.innerHTML='<span class="it">Copiato ✓</span><span class="en">Copied ✓</span>';
        setTimeout(function(){cb.innerHTML='<span class="it">Copia link</span><span class="en">Copy link</span>';},1800);
      }).catch(function(){});
    };
  }
  if(logged){
    // link col referral personale, se recuperabile
    try{
      var sess=JSON.parse(localStorage.getItem('airoobi_session'));
      fetch('https://vuvlmlpuhovipfwtquux.supabase.co/rest/v1/profiles?id=eq.'+sess.user.id+'&select=referral_code',{
        headers:{'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co','Authorization':'Bearer '+sess.access_token}
      }).then(function(r){return r.json()}).then(function(rows){
        var ref=rows&&rows[0]&&rows[0].referral_code;
        finish(ref?url+'?ref='+ref:url);
      }).catch(function(){finish(url);});
    }catch(e){finish(url);}
  }else{
    finish(url);
  }
}

function initPwa(){
  if('serviceWorker' in navigator){
    try{navigator.serviceWorker.register('/sw.js');}catch(e){}
  }
  if(localStorage.getItem('airoobi_pwa_dismissed'))return;
  if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)return;
  var deferred=null;
  function showBanner(onInstall){
    if(document.getElementById('pwa-banner'))return;
    // 19 lug (Skeezu): da toast in basso (si tagliava sotto la quick-nav) a SIDE BAR laterale
    var b=document.createElement('div');
    b.id='pwa-banner';
    b.style.cssText='position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:9000;display:flex;flex-direction:column;align-items:stretch;gap:8px;background:var(--black,#fff);color:var(--white,#0F1417);border:1px solid rgba(239,62,79,.35);border-right:none;border-radius:14px 0 0 14px;padding:14px 14px 12px;box-shadow:-8px 0 28px rgba(0,0,0,.22);font-family:Inter,sans-serif;font-size:12px;max-width:210px';
    var isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
    b.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="font-weight:600">AIR<span style="color:#EF3E4F">OO</span>BI</span>'
      +'<button id="pwa-close-btn" style="background:none;border:none;color:inherit;opacity:.55;font-size:15px;cursor:pointer;padding:2px">\u2715</button></div>'
      +(onInstall?'':(isIos?'<span style="line-height:1.4">Condividi &rarr; \u201cAggiungi alla schermata Home\u201d</span>':''))
      +(onInstall?'<button id="pwa-install-btn" style="background:#EF3E4F;color:#fff;border:none;border-radius:9px;padding:9px 12px;font-weight:700;font-size:12px;letter-spacing:.05em;cursor:pointer">INSTALLA L\'APP</button>':'');
    document.body.appendChild(b);
    document.getElementById('pwa-close-btn').onclick=function(){b.remove();localStorage.setItem('airoobi_pwa_dismissed','1');};
    if(onInstall)document.getElementById('pwa-install-btn').onclick=function(){
      b.remove();
      if(deferred){deferred.prompt();deferred.userChoice.then(function(){localStorage.setItem('airoobi_pwa_dismissed','1');});}
    };
  }
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();deferred=e;
    window._pwaDeferred=e; // 19 lug: azione «Installa APP» permanente nel menu utente della dapp
    setTimeout(function(){showBanner(true);},2500);
  });
  // iOS: nessun beforeinstallprompt — hint manuale una tantum
  if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone){
    setTimeout(function(){showBanner(false);},4000);
  }
}

// ── Lightbox foto globale (20 lug, Skeezu): fullscreen, swipe scroll-snap, counter ──
// API: window.airLightbox([src,...], startIdx). Auto-bind: click su img[data-lb] (gruppo = valore attributo).
function ensureLightbox(){
  var lb=document.getElementById('air-lb');
  if(lb)return lb;
  var st=document.createElement('style');
  st.textContent='#air-lb{display:none;position:fixed;inset:0;z-index:200;background:rgba(4,7,12,.96)}'
    +'#air-lb.open{display:block}'
    +'#air-lb-track{display:flex;width:100%;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}'
    +'#air-lb-track::-webkit-scrollbar{display:none}'
    +'.air-lb-slide{flex:0 0 100%;width:100%;height:100%;scroll-snap-align:center;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;padding:34px 8px 44px;box-sizing:border-box}'
    +'.air-lb-slide img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}'
    +'#air-lb-x{position:absolute;top:12px;right:12px;z-index:2;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.5);color:#fff;font-size:22px;line-height:1;cursor:pointer}'
    +'#air-lb-n{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:2;font-family:monospace;font-size:12px;letter-spacing:1px;color:#fff;background:rgba(0,0,0,.55);padding:5px 12px;border-radius:14px}'
    +'.air-lb-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.5);color:#fff;font-size:24px;line-height:1;cursor:pointer;padding:0 0 4px;display:none}'
    +'@media(hover:hover){.air-lb-nav{display:block}}'
    +'#air-lb-prev{left:12px}#air-lb-next{right:12px}';
  document.head.appendChild(st);
  lb=document.createElement('div');
  lb.id='air-lb';
  lb.innerHTML='<div id="air-lb-track"></div>'
    +'<button id="air-lb-x" aria-label="Chiudi">&times;</button>'
    +'<button class="air-lb-nav" id="air-lb-prev" aria-label="Precedente">&lsaquo;</button>'
    +'<button class="air-lb-nav" id="air-lb-next" aria-label="Successiva">&rsaquo;</button>'
    +'<div id="air-lb-n"></div>';
  document.body.appendChild(lb);
  var track=lb.querySelector('#air-lb-track');
  function idx(){return Math.round(track.scrollLeft/Math.max(1,track.clientWidth));}
  function go(i,smooth){
    var n=track.children.length;if(!n)return;
    i=((i%n)+n)%n;
    track.scrollTo({left:i*track.clientWidth,behavior:smooth===false?'auto':'smooth'});
  }
  function syncN(){
    var n=track.children.length;
    lb.querySelector('#air-lb-n').textContent=(idx()+1)+' / '+n;
  }
  function close(){lb.classList.remove('open');document.body.style.overflow='';}
  track.addEventListener('scroll',syncN,{passive:true});
  lb.querySelector('#air-lb-x').addEventListener('click',close);
  lb.querySelector('#air-lb-prev').addEventListener('click',function(){go(idx()-1);});
  lb.querySelector('#air-lb-next').addEventListener('click',function(){go(idx()+1);});
  // tap sul fondo (fuori dall'immagine) chiude
  track.addEventListener('click',function(e){if(e.target&&e.target.tagName!=='IMG')close();});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')go(idx()-1);
    else if(e.key==='ArrowRight')go(idx()+1);
  });
  lb._go=go;lb._syncN=syncN;
  return lb;
}
window.airLightbox=function(imgs,startIdx){
  if(!imgs||!imgs.length)return;
  var lb=ensureLightbox();
  var track=lb.querySelector('#air-lb-track');
  track.innerHTML=imgs.map(function(src){
    return '<div class="air-lb-slide"><img src="'+String(src).replace(/"/g,'&quot;')+'" alt=""></div>';
  }).join('');
  lb.classList.add('open');
  document.body.style.overflow='hidden';
  requestAnimationFrame(function(){lb._go(startIdx||0,false);lb._syncN();});
};
function initLightboxDelegate(){
  document.addEventListener('click',function(e){
    var im=e.target&&e.target.closest?e.target.closest('img[data-lb]'):null;
    if(!im)return;
    e.preventDefault();
    var group=im.getAttribute('data-lb')||'';
    var all=[].slice.call(document.querySelectorAll('img[data-lb="'+group+'"]'));
    window.airLightbox(all.map(function(x){return x.currentSrc||x.src}),Math.max(0,all.indexOf(im)));
  });
}

function init(){
  var st=document.createElement('style');
  st.textContent=CSS;
  document.head.appendChild(st);
  var mounts=document.querySelectorAll('#footer-mount,[data-footer-mount]');
  for(var i=0;i<mounts.length;i++)render(mounts[i]);
  tokenizeCoins(document.body);
  try{
    _tokObs=new MutationObserver(scheduleTokenize);
    _tokObs.observe(document.body,{childList:true,subtree:true});
  }catch(e){}
  buildShareBar();
  initPwa();
  loadFooterCounters();
  initSegnala();
  initQuickNav();
  initLightboxDelegate();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
