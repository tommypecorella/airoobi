/* GLOSSARIO VIVO — AIROOBI (Skeezu 23 lug 2026)
   Sottolinea (tratteggiato) i termini del mondo AIROOBI ovunque nell'app; al tap
   apre una spiegazione "da nonna". Zero dipendenze, si auto-installa.
   Concetto guida: AIRDROP = un oggetto da qualcuno per qualcuno.
   Guardie forti: mai dentro link/bottoni/input/svg/testate/menu, mai ri-decorare,
   una sola volta per nodo di testo, cap per non appesantire l'app viva. */
(function(){
  if(window.__airoobiGloss)return; window.__airoobiGloss=true;

  // dizionario: chiave = regex-safe · MAIUSCOLI = match case-sensitive (evita "aria"=air)
  var GLOSS={
    'AIRDROP':{ci:true, it:'Su AIROOBI un airdrop è <b>un oggetto da qualcuno, per qualcuno</b>: uno lo mette in gioco, e chi lo desidera corre la salita con gli ARIA. Chi è in vetta alla chiusura se lo porta a casa; tutti gli altri raccolgono ROBI lungo la strada.'},
    'AIRDROPPA':{ci:true, it:'Vuol dire mettere un tuo oggetto su AIROOBI perché diventi il premio di una corsa. Non lo vendi: lo <b>airdroppi</b> — un oggetto da te, per qualcuno.'},
    'ARIA':{ci:false, it:'La moneta di AIROOBI (per ora in prova). Non si compra: la <b>guadagni gratis ogni giorno</b> e la usi per fare Step nelle corse.'},
    'ROBI':{ci:false, it:'La <b>ricompensa vera</b> di AIROOBI. La raccogli correndo le corse, resta tua comunque vada, e potrai riscattarla in KAS.'},
    'Step':{ci:true, it:'Un <b>passo avanti</b> nella corsa verso la vetta. Ogni Step costa un po\' di ARIA e ti fa salire in classifica.'},
    'Salita':{ci:true, it:'La gara di un airdrop, disegnata come una <b>salita verso la vetta</b>. Più sali, più sei vicino a portarti a casa l\'oggetto.'},
    'vetta':{ci:true, it:'Il <b>primo posto</b> della corsa. Chi è in vetta quando la corsa chiude ottiene l\'oggetto.'},
    'KAS':{ci:false, it:'Kaspa: la <b>criptovaluta vera</b> con cui un domani potrai riscattare i tuoi ROBI.'},
    'EVALOBI':{ci:false, it:'Il <b>certificato di valutazione</b> di un oggetto, firmato da AIROOBI: dice quanto vale e perché.'},
    'faucet':{ci:true, it:'Il <b>rubinetto degli ARIA</b>: ogni giorno te ne regala un po\', gratis. Basta passare a prenderli.'},
    'presale':{ci:true, it:'La fase <b>prima che la corsa parta davvero</b>: entri in anticipo e i ROBI che raccogli valgono doppio.'},
    'anteprima':{ci:true, it:'La fase prima che la corsa parta davvero: entri in anticipo e i ROBI valgono doppio.'},
    'AIROOBI TREASURY FUND':{ci:true, it:'Il <b>fondo di garanzia</b> di AIROOBI: i soldi veri, messi da parte, che coprono il valore dei ROBI.'},
    'over-collateralizzat':{ci:true, it:'Vuol dire che nel fondo di garanzia c\'è <b>più valore di quanto serva</b> a coprire i ROBI: una sicurezza in più per te.'}
  };
  // ordine per lunghezza decrescente: match prima "AIROOBI TREASURY FUND" di "ROBI"
  var TERMS=Object.keys(GLOSS).sort(function(a,b){return b.length-a.length;});

  var SKIP_SEL='a,button,input,textarea,select,label,script,style,svg,code,pre,'
    +'.gloss,.info-i,.topbar,.topbar-nav,.user-menu,.detail-tabbar,.bottom-nav,'
    +'h1,[data-no-gloss],[contenteditable]';

  // ── stile + tooltip ──
  var st=document.createElement('style');
  st.textContent=
    '.gloss{border-bottom:1px dotted currentColor;cursor:help;text-underline-offset:2px}'
    +'.gloss:hover{opacity:.85}'
    +'#gloss-pop{position:fixed;z-index:10000;max-width:300px;display:none;'
    +'background:var(--gray-900,#141a21);color:var(--white,#eef2f6);border:1px solid var(--gold,#E8B84A);'
    +'border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.55;box-shadow:0 12px 40px rgba(0,0,0,.5)}'
    +'#gloss-pop.on{display:block}'
    +'#gloss-pop .gp-t{font-family:var(--font-m,monospace);font-size:10px;letter-spacing:1.5px;'
    +'text-transform:uppercase;color:var(--gold,#E8B84A);margin-bottom:5px}'
    +'#gloss-pop .gp-x{position:absolute;top:6px;right:8px;cursor:pointer;color:var(--gray-500,#8a97a8);font-size:15px;line-height:1}';
  document.head.appendChild(st);
  var pop=document.createElement('div');pop.id='gloss-pop';
  pop.innerHTML='<span class="gp-x">&times;</span><div class="gp-t" id="gloss-pop-t"></div><div id="gloss-pop-b"></div>';
  document.body.appendChild(pop);
  pop.querySelector('.gp-x').addEventListener('click',function(e){e.stopPropagation();pop.classList.remove('on');});
  function showPop(el){
    var k=el.getAttribute('data-gloss'); var g=GLOSS[k]; if(!g)return;
    document.getElementById('gloss-pop-t').textContent=el.textContent;
    document.getElementById('gloss-pop-b').innerHTML=g.it;
    pop.classList.add('on');
    var r=el.getBoundingClientRect(), pw=Math.min(300,window.innerWidth-24);
    var left=Math.max(12,Math.min(r.left, window.innerWidth-pw-12));
    var top=r.bottom+8; pop.style.width=pw+'px';
    // se sfora sotto, mettilo sopra
    pop.style.left=left+'px'; pop.style.top=top+'px';
    if(top+pop.offsetHeight>window.innerHeight-8)pop.style.top=Math.max(8,r.top-pop.offsetHeight-8)+'px';
  }
  document.addEventListener('click',function(e){
    var g=e.target.closest&&e.target.closest('.gloss');
    if(g){e.stopPropagation();showPop(g);return;}
    if(!e.target.closest||!e.target.closest('#gloss-pop'))pop.classList.remove('on');
  });
  window.addEventListener('scroll',function(){pop.classList.remove('on');},true);

  // ── decorazione ──
  var obs=null, seenTerm; // seenTerm: Set per-pass, così ogni termine si sottolinea una volta sola a giro (niente muro di tratteggi)
  function skip(node){
    var p=node.parentElement;
    return !p || p.closest(SKIP_SEL);
  }
  function decorate(root){
    if(!root||root.nodeType!==1)root=document.body;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        if(!n.nodeValue||n.nodeValue.length<3)return NodeFilter.FILTER_REJECT;
        if(skip(n))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes=[],n,cap=6000;
    while((n=walker.nextNode())&&cap-->0)nodes.push(n);
    nodes.forEach(function(node){
      var text=node.nodeValue, hit=null, idx=-1, term=null;
      for(var i=0;i<TERMS.length;i++){
        var t=TERMS[i]; if(seenTerm.has(t))continue;
        var re=new RegExp('(^|[^\\w])('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?=[^\\w]|$)', GLOSS[t].ci?'i':'');
        var m=re.exec(text);
        if(m){ var at=m.index+m[1].length; if(idx===-1||at<idx){idx=at;hit=m[2];term=t;} }
      }
      if(term===null)return;
      seenTerm.add(term);
      var before=text.slice(0,idx), matched=text.slice(idx,idx+hit.length), after=text.slice(idx+hit.length);
      var span=document.createElement('span');
      span.className='gloss'; span.setAttribute('data-gloss',term); span.textContent=matched;
      var frag=document.createDocumentFragment();
      if(before)frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if(after)frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag,node);
    });
  }
  function runAll(){
    seenTerm=new Set();
    if(obs)obs.disconnect();
    try{decorate(document.body);}catch(e){}
    if(obs)obs.observe(document.body,{childList:true,subtree:true});
  }
  // primo giro + ri-giro debounced quando l'app inietta nuovo contenuto (navigazione, render)
  var deb=null;
  obs=new MutationObserver(function(){clearTimeout(deb);deb=setTimeout(runAll,600);});
  window.airoobiGlossRun=runAll;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(runAll,800);});
  else setTimeout(runAll,800);
})();
