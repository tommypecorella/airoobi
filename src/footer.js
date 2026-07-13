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
+'html[data-lang="en"] .app-footer .it{display:none}';

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

function init(){
  var st=document.createElement('style');
  st.textContent=CSS;
  document.head.appendChild(st);
  var mounts=document.querySelectorAll('#footer-mount,[data-footer-mount]');
  for(var i=0;i<mounts.length;i++)render(mounts[i]);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
