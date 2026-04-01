// ── Nav scroll effect ──


// ── Reveal on scroll ──
const obs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// ── Supabase ──
const SUPABASE_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';
// ── Fullscreen video ──
function goFullscreen(id){
  var el=document.getElementById(id||'video-wrap');
  if(el.requestFullscreen)el.requestFullscreen();
  else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
  else if(el.msRequestFullscreen)el.msRequestFullscreen();
}

// ── Analytics & Event Tracking ──
async function track(event, props={}) {
  // 1. Vercel Analytics
  if(window.va) window.va('event', {name: event, ...props});

  // 2. Supabase events table (fire & forget)
  try {
    const session = window._currentSession;
    const payload = {
      event,
      user_id: session?.user?.id || null,
      props: Object.keys(props).length ? props : null,
      url: location.pathname + location.hash,
      referrer: document.referrer || null,
      ua: navigator.userAgent.substring(0,120),
      created_at: new Date().toISOString()
    };
    fetch(SUPABASE_URL+'/rest/v1/events', {
      method:'POST',
      headers:{
        'apikey':SUPABASE_KEY,
        'Authorization':'Bearer '+SUPABASE_KEY,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(()=>{}); // silenzioso, non blocca nulla
  } catch(e){}
}

// Track pageview al caricamento
window.addEventListener('DOMContentLoaded', ()=>{
  track('pageview', {lang: document.documentElement.lang || 'it'});
  // Path + hash routing
  var DAPP_ROUTES=['/dashboard','/profilo','/portafoglio','/guadagni','/referral','/classifica','/vendi'];
  var DAPP_HASHES=['#dashboard','#profilo','#portafoglio','#guadagni','#referral','#classifica','#vendi'];
  function handleRoute(){
    var pp=location.pathname;
    var hh=location.hash;
    // Dashboard routes → redirect to dApp
    if(DAPP_ROUTES.indexOf(pp)!==-1){location.href='https://airoobi.app'+pp;return;}
    if(DAPP_HASHES.indexOf(hh)!==-1){location.href='https://airoobi.app/'+hh.substring(1);return;}
    // Settings
    if(pp==='/settings'||hh==='#settings'){openSettings();return;}
    // Admin
    if(pp==='/admin'){openAdmin();return;}
    // Auth → separate pages
    if(hh==='#login')openAuth('login');
    else if(hh==='#signup')openAuth('signup');
    else if(hh==='#admin'){openAdmin();}
    else if(hh==='#contatti'){location.href='/contatti.html';return;}
    else if(hh==='#privacy'){location.href='/privacy.html';return;}
    else if(hh==='#termini'){location.href='/termini.html';return;}
    else if(hh==='#investitori'){location.href='/investitori.html';return;}
    else if(hh==='#blog'){openBlog();}
    else if(hh.startsWith('#blog-')){openBlogArticle(hh.substring(1));}
  }
  handleRoute();
  window.addEventListener('hashchange',handleRoute);
});

async function sbPost(table,data){
  const res=await fetch(SUPABASE_URL+'/rest/v1/'+table,{
    method:'POST',headers:{
      'apikey':SUPABASE_KEY,
      'Authorization':'Bearer '+SUPABASE_KEY,
      'Content-Type':'application/json',
      
    },body:JSON.stringify(data)
  });
  return res
}
async function sbCount(){
  const res=await fetch(SUPABASE_URL+'/rest/v1/profiles?select=id&is_test_user=not.is.true',{
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}
  });
  if(res.ok){const d=await res.json();return d.length}
  return 0
}

// ── Waitlist handler ──
async function handleWaitlist(inputId){
  const input=document.getElementById(inputId);
  const btn=input.parentElement.querySelector('button');
  const email=input.value.trim();
  if(!email||!email.includes('@')||!email.includes('.')){
    input.style.borderColor='#B91C1C';
    setTimeout(()=>input.style.borderColor='',2000);
    return
  }
  btn.disabled=true;
  const lang=document.documentElement.getAttribute('data-lang')||'it';
  const ref=new URLSearchParams(window.location.search).get('ref')||null;
  const res=await sbPost('waitlist',{email,lang,referred_by:ref});
  if(res.ok){
    input.value='';
    input.placeholder=lang==='it'?'\u2713 Sei dentro! Ti contatteremo.':'\u2713 You\'re in! We\'ll be in touch.';
    input.style.borderColor='var(--gold)';
    updateCounter();
  }else if(res.status===409){
    input.value='';
    input.placeholder=lang==='it'?'Sei gi\u00e0 in lista!':'Already on the list!';
  }else{
    input.placeholder=lang==='it'?'Errore, riprova':'Error, try again';
  }
  btn.disabled=false;
}

// ── Counter ──
var ALPHA_BRAVE_MAX=1000;
var _alphaBraveFull=false;
async function updateCounter(){
  const count=await sbCount();
  const remaining=Math.max(0,ALPHA_BRAVE_MAX-count);
  const pct=Math.min(100,(count/ALPHA_BRAVE_MAX)*100);
  _alphaBraveFull=remaining<=0;

  // Hero fomo
  const heroIt=document.getElementById('fomo-text-hero-it');
  const heroEn=document.getElementById('fomo-text-hero-en');
  if(_alphaBraveFull){
    if(heroIt)heroIt.textContent='Alpha Brave: POSTI ESAURITI';
    if(heroEn)heroEn.textContent='Alpha Brave: SOLD OUT';
  }else{
    if(heroIt)heroIt.textContent='Alpha Brave: '+remaining+' posti rimasti';
    if(heroEn)heroEn.textContent='Alpha Brave: '+remaining+' spots left';
  }
  const heroBar=document.getElementById('fomo-bar-hero');
  if(heroBar)setTimeout(()=>heroBar.style.width=pct+'%',500);

  // CTA fomo
  const bigNum=document.getElementById('fomo-big-num');
  if(_alphaBraveFull){
    if(bigNum)bigNum.innerHTML='0<span> / 1.000</span>';
  }else{
    if(bigNum)bigNum.innerHTML=remaining+'<span> / 1.000</span>';
  }
  const ctaIt=document.getElementById('fomo-text-cta-it');
  const ctaEn=document.getElementById('fomo-text-cta-en');
  if(_alphaBraveFull){
    if(ctaIt)ctaIt.textContent='registrazioni chiuse';
    if(ctaEn)ctaEn.textContent='registrations closed';
  }else{
    if(ctaIt)ctaIt.textContent='posti rimasti — non aspettare';
    if(ctaEn)ctaEn.textContent='spots remaining — don\'t wait';
  }
  const ctaBar=document.getElementById('fomo-bar-cta');
  if(ctaBar)setTimeout(()=>ctaBar.style.width=pct+'%',500);

  // Disable signup buttons if full
  if(_alphaBraveFull){
    var signupBtn=document.getElementById('nav-signup-btn');
    if(signupBtn){signupBtn.style.opacity='.5';signupBtn.style.pointerEvents='none';}
  }
}
updateCounter();

// ── Language toggle ──
function toggleLang(){
  const root=document.documentElement;
  const btn=document.getElementById('lang-btn');
  const current=root.getAttribute('data-lang');
  const next=current==='it'?'en':'it';
  root.setAttribute('data-lang',next);
  root.setAttribute('lang',next);
  btn.textContent=next==='it'?'EN':'IT';
  // Sync all lang buttons
  document.querySelectorAll('.lang-toggle').forEach(function(b){b.textContent=next==='it'?'EN':'IT';});
  // Update placeholders
  document.querySelectorAll('input[data-it]').forEach(el=>{
    el.placeholder=next==='it'?el.dataset.it:el.dataset.en;
  });
  localStorage.setItem('airoobi_lang',next);
}

function toggleBurger(){
  var btn=document.getElementById('burger-btn');
  var menu=document.getElementById('mobile-menu');
  btn.classList.toggle('open');
  menu.classList.toggle('open');
}
function closeBurger(){
  document.getElementById('burger-btn').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
}
function scrollToSection(sel){var el=document.querySelector(sel);if(el)el.scrollIntoView({behavior:'smooth'});}
// Close burger on scroll
window.addEventListener('scroll',function(){closeBurger();},{passive:true});

// Restore saved language
(function(){
  const saved=localStorage.getItem('airoobi_lang');
  if(saved&&saved!=='it'){toggleLang();}
})();

// ── Glossary ──
var glossary={
  'NFT':{tag:'Tecnologia · Dietro le quinte',def:'NFT sta per "Non-Fungible Token": un oggetto digitale unico registrato sulla blockchain, impossibile da copiare o falsificare. Su AIROOBI il tuo NFT si chiama ROBI — è la chiave per riscuotere KAS reali. Non devi capire la tecnologia per usarlo.'},
  'ARIA':{tag:'Valuta AIROOBI',def:'ARIA è la valuta di AIROOBI. La guadagni gratis ogni giorno con check-in e referral. Quando vuoi partecipare a un airdrop, usi i tuoi ARIA per acquistare blocchi.'},
  'Airdrop':{tag:'Meccanismo core',def:'Un airdrop su AIROOBI è la distribuzione di un oggetto reale di valore (da €500 in su) alla community. Chi partecipa accumula ARIA e guadagna ROBI che crescono di valore nel tempo.'},
  'Blockchain':{tag:'Tecnologia',def:'Una blockchain è un registro digitale distribuito e immutabile: ogni operazione viene registrata in modo permanente e verificabile da chiunque. Su AIROOBI usiamo Kaspa — una blockchain di nuova generazione, veloce e sicura — per garantire che le regole del gioco non possano essere cambiate.'},
  'Kaspa':{tag:'Blockchain · Tecnologia',def:'Kaspa è la blockchain su cui è costruito AIROOBI. È una delle più veloci e scalabili in assoluto, con blocchi confermati in meno di un secondo. A differenza di Ethereum, le fee di transazione sono bassissime — ideale per un marketplace come il nostro.'},
  'Treasury':{tag:'Finanza · Garanzia',def:'Il fondo di garanzia di AIROOBI è il fondo che copre il valore dei ROBI emessi. Una parte di ogni transazione viene accantonata qui. Se il fondo cresce, cresce anche il valore dei tuoi ROBI.'},
  'Alpha Brave':{tag:'Fase · Community',def:'Gli Alpha Brave sono i primi 1.000 utenti di AIROOBI. Ottengono vantaggi permanenti su tutti gli airdrop futuri, Badge Fondatore + ROBI di benvenuto e un moltiplicatore sugli ARIA guadagnati. È un riconoscimento per chi crede nel progetto prima che diventi ovvio.'},
  'Buyback':{tag:'Garanzia · Rimborso',def:'Il rimborso garantito è l\'impegno di AIROOBI a riacquistare i tuoi ROBI al 95% del loro valore calcolato. Significa che puoi sempre "uscire" e recuperare ciò che hai accumulato. Non è un\'opzione teorica — è una garanzia scritta nelle regole.'},
  'Token':{tag:'Tecnologia · Crypto',def:'Un token è un\'unità digitale registrata su blockchain che rappresenta un diritto, un valore o un\'utilità. Su AIROOBI ci sono due tipi: ARIA (la valuta della piattaforma) e ROBI (il tuo NFT per riscuotere KAS).'},
  'Wallet':{tag:'Strumento · Crypto',def:'Un wallet (portafoglio digitale) è il tuo "conto" sulla blockchain: conserva i tuoi ARIA e ROBI in modo sicuro. Su AIROOBI nelle fasi iniziali non serve un wallet crypto — puoi usare email e password come un normale sito. Il wallet sarà introdotto gradualmente.'},
  'Smart Contract':{tag:'Tecnologia · Blockchain',def:'Un smart contract è un programma che vive sulla blockchain ed esegue automaticamente le regole scritte nel codice. Su AIROOBI gestisce la distribuzione degli airdrop, il calcolo degli ARIA e il valore dei ROBI — senza possibilità di manipolazione da parte di nessuno, nemmeno del team.'},
  'Market Cap':{tag:'Finanza',def:'Il market cap (capitalizzazione di mercato) dei ROBI è il valore totale di tutti i ROBI in circolazione: valore singolo × numero emesso. È un indicatore della "dimensione" del progetto, simile a come si misura una società in borsa.'},
  'Fase Alpha':{tag:'Roadmap · Community',def:'La Fase Alpha è la prima fase di AIROOBI — quella in cui sei adesso. È live. Ogni azione che fai genera ARIA reali che puoi già usare. Chi partecipa in Alpha accumula di più e ottiene vantaggi permanenti su tutte le fasi successive.'},
  'Referral':{tag:'Community · Bonus',def:'Il referral è il meccanismo con cui porti nuovi utenti su AIROOBI usando il tuo codice personale. Quando un amico si registra con il tuo codice e fa il primo login, tu ricevi +10 ARIA e lui +15 ARIA. Nessun limite al numero di referral — più amici porti, più ARIA accumuli.'}
};

function openGloss(term){
  var g=glossary[term];
  if(!g)return;
  document.getElementById('gloss-term').textContent=term;
  document.getElementById('gloss-tag').textContent=g.tag;
  document.getElementById('gloss-def').textContent=g.def;
  document.getElementById('gloss-popup').classList.add('active');
  document.getElementById('gloss-overlay').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeGloss(){
  document.getElementById('gloss-popup').classList.remove('active');
  document.getElementById('gloss-overlay').classList.remove('active');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeGloss();});

// Auto-inject glossary icons into page text
(function(){
  // Terms to highlight and their exact match strings (order matters — longer first)
  var terms=[
    'Alpha Brave','Smart Contract','Market Cap','Fase Alpha',
    'Buyback','buyback','Treasury','treasury',
    'blockchain','Blockchain','Kaspa','Wallet','wallet',
    'Referral','referral','Airdrop','airdrop',
    'ARIA','NFT','Token','token'
  ];
  // Canonical key for glossary lookup
  var canonical={
    'buyback':'Buyback','treasury':'Treasury','blockchain':'Blockchain',
    'wallet':'Wallet','referral':'Referral','airdrop':'Airdrop',
    'token':'Token'
  };
  function getKey(t){return canonical[t]||t;}

  // Sections to process (avoid nav, footer, scripts, modals internals)
  var roots=['#what','#how','#why','#kaspa','#roadmap','.hero-badge','.faq','#earn-tab','.earn-rules'];

  function wrapTermsInNode(node,term,key){
    if(node.nodeType===3){
      var txt=node.nodeValue;
      var re=new RegExp('\\b'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g');
      if(!re.test(txt))return;
      re.lastIndex=0;
      var frag=document.createDocumentFragment();
      var last=0,m;
      while((m=re.exec(txt))!==null){
        if(m.index>last)frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
        var s=document.createElement('span');
        s.className='gloss-word';
        s.textContent=m[0];
        s.onclick=function(k){return function(){openGloss(k);};}(key);
        var ic=document.createElement('i');
        ic.className='gloss-icon';
        ic.textContent='i';
        ic.onclick=function(k){return function(e){e.stopPropagation();openGloss(k);};}(key);
        s.appendChild(ic);
        frag.appendChild(s);
        last=re.lastIndex;
      }
      if(last<txt.length)frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag,node);
    } else if(node.nodeType===1){
      // Skip script, style, already-wrapped, buttons, inputs
      var tag=node.tagName.toLowerCase();
      if(tag==='script'||tag==='style'||tag==='button'||tag==='input'||tag==='a'||node.classList.contains('gloss-word')||node.classList.contains('gloss-popup'))return;
      Array.from(node.childNodes).forEach(function(c){wrapTermsInNode(c,term,key);});
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    // Build a flat list of sections to process
    var sections=[];
    document.querySelectorAll('section, .hero-badge, .faq-item, .earn-rules').forEach(function(el){sections.push(el);});
    terms.forEach(function(term){
      var key=getKey(term);
      sections.forEach(function(section){
        wrapTermsInNode(section,term,key);
      });
    });
  });
})();


// ── Modals ──
function openModal(id){document.getElementById(id).style.display='block';document.body.style.overflow='hidden';}
function closeModal(id){document.getElementById(id).style.display='none';document.body.style.overflow='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('[id$="-modal"]').forEach(m=>closeModal(m.id));closeLegalPage();closeBlog();}});

// ── Legal Pages (inline, not popup) ──
var _legalPageContents={};
function buildLegalPageContents(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  _legalPageContents={
    contatti:{
      it:'<h2 style="font-family:var(--font-h);font-size:32px;font-weight:300;margin-bottom:32px">Contatti</h2><div style="font-size:14px;line-height:1.8;color:var(--gray-300)"><p style="margin-bottom:24px">Per qualsiasi domanda o informazione su AIROOBI:</p><p style="margin-bottom:16px"><strong style="color:var(--white)">Info:</strong> <a href="mailto:info@airoobi.com" style="color:var(--gold)">info@airoobi.com</a></p><p style="margin-bottom:16px"><strong style="color:var(--white)">Comunicazione per gli utenti:</strong> <a href="mailto:hello@airoobi.com" style="color:var(--gold)">hello@airoobi.com</a></p></div>',
      en:'<h2 style="font-family:var(--font-h);font-size:32px;font-weight:300;margin-bottom:32px">Contact</h2><div style="font-size:14px;line-height:1.8;color:var(--gray-300)"><p style="margin-bottom:24px">For any questions or information about AIROOBI:</p><p style="margin-bottom:16px"><strong style="color:var(--white)">Info:</strong> <a href="mailto:info@airoobi.com" style="color:var(--gold)">info@airoobi.com</a></p><p style="margin-bottom:16px"><strong style="color:var(--white)">User communications:</strong> <a href="mailto:hello@airoobi.com" style="color:var(--gold)">hello@airoobi.com</a></p></div>'
    }
  };
}
function openLegalPage(page){
  buildLegalPageContents();
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var container=document.getElementById('legal-page-content');
  // Hide main site sections
  document.querySelectorAll('section, .hero, .dash-overlay, .investor-overlay').forEach(function(el){el.dataset.legalHidden=el.style.display||'';el.style.display='none';});
  // For privacy and terms, clone content from existing modals
  if(page==='privacy'){
    var src=document.querySelector('#privacy-modal .legal-modal-inner');
    container.innerHTML=src?src.innerHTML:'';
    // Remove close button from cloned content
    var closeBtn=container.querySelector('button[onclick*="closeModal"]');
    if(closeBtn)closeBtn.style.display='none';
  }else if(page==='termini'){
    var src=document.querySelector('#terms-modal .legal-modal-inner');
    container.innerHTML=src?src.innerHTML:'';
    var closeBtn=container.querySelector('button[onclick*="closeModal"]');
    if(closeBtn)closeBtn.style.display='none';
  }else if(page==='investitori'){
    openInvestor();return;
  }else if(page==='contatti'){
    container.innerHTML=_legalPageContents.contatti[lang]||_legalPageContents.contatti.it;
  }
  document.getElementById('legal-page').classList.add('active');
  window.scrollTo(0,0);
}
function closeLegalPage(){
  document.getElementById('legal-page').classList.remove('active');
  // Restore hidden sections
  document.querySelectorAll('[data-legal-hidden]').forEach(function(el){el.style.display=el.dataset.legalHidden;delete el.dataset.legalHidden;});
  if(location.hash.match(/^#(contatti|privacy|termini|blog)/))history.replaceState(null,null,' ');
}




// ── Blog ──
var _blogArticles=[
{slug:'cosa-sono-gli-airdrop-crypto',title:'Cosa sono gli airdrop crypto e perché la maggior parte non è equa',date:'10 Marzo 2026',meta:'Scopri cosa sono gli airdrop crypto, come funzionano e perché la maggior parte non garantisce equità ai partecipanti.',body:'<p>Gli airdrop sono uno degli strumenti più usati nel mondo delle criptovalute per distribuire token a un pubblico ampio. In teoria, l\'idea è semplice e democratica: un progetto distribuisce gratuitamente una parte dei propri token a chiunque soddisfi determinati requisiti. In pratica, però, la realtà è spesso molto diversa.</p><h2>Come funzionano gli airdrop tradizionali</h2><p>Un airdrop classico prevede che un progetto blockchain annunci la distribuzione di token a chi possiede già una determinata criptovaluta, a chi si iscrive a una lista, oppure a chi compie azioni specifiche come seguire un account social o invitare amici. Il problema nasce quando le regole del gioco non sono trasparenti o quando chi ha più risorse riesce a ottenere vantaggi sproporzionati rispetto agli altri partecipanti.</p><h2>Il problema della fairness</h2><p>Negli ultimi anni, molti airdrop si sono rivelati tutt\'altro che equi. I cosiddetti "whale" — utenti con grandi quantità di criptovalute già in portafoglio — ricevono quote enormi rispetto ai piccoli partecipanti. I bot automatizzati riescono a iscriversi a decine di account contemporaneamente, sottraendo quote a utenti reali. Le regole cambiano in corsa, spesso a svantaggio di chi aveva partecipato in buona fede fin dall\'inizio.</p><h2>Il valore che scompare</h2><p>Un altro problema strutturale degli airdrop tradizionali è il valore. I token distribuiti spesso non hanno un valore reale o garantito al momento della distribuzione. Chi li riceve si ritrova con asset di valore incerto, soggetti a speculazione e volatilità estrema. In molti casi, il prezzo crolla subito dopo la distribuzione perché i partecipanti vendono immediatamente tutto quello che hanno ricevuto.</p><h2>Una nuova visione</h2><p>AIROOBI nasce proprio per rispondere a questi problemi. La piattaforma introduce un modello di airdrop equo, dove ogni partecipante ha le stesse opportunità indipendentemente dalla propria ricchezza pregressa, e dove il valore distribuito è garantito da un meccanismo trasparente. Non si tratta di speculazione, ma di un sistema dove la partecipazione attiva viene premiata in modo proporzionale e verificabile.</p>'},
{slug:'cos-e-airoobi-piattaforma-airdrop-equi',title:'Cos\'è AIROOBI: la piattaforma che reinventa gli airdrop',date:'11 Marzo 2026',meta:'Cos\'è AIROOBI, come funziona la piattaforma di airdrop equi su blockchain Kaspa e perché è diversa da tutto il resto.',body:'<p>AIROOBI è una piattaforma di commercio basata sugli airdrop di oggetti fisici reali, costruita sulla blockchain Kaspa. Il principio fondante è semplice: invece di vendere un oggetto al miglior offerente, il venditore lo "airdroppa" — lo distribuisce attraverso un meccanismo equo che garantisce valore a tutti i partecipanti, non solo a chi vince.</p><h2>Come funziona in pratica</h2><p>Un venditore carica il proprio oggetto su AIROOBI e avvia un airdrop. I partecipanti accumulano punti ARIA attraverso attività quotidiane sulla piattaforma: check-in giornalieri, visualizzazione di contenuti, referral di nuovi utenti. Questi punti determinano la posizione di ciascun partecipante nella competizione per l\'oggetto.</p><p>La caratteristica che distingue AIROOBI da qualsiasi altra piattaforma è la garanzia: anche chi non ottiene l\'oggetto fisico riceve un valore certificato sotto forma di NFT. Non si perde mai completamente. Il sistema è progettato per essere equo per definizione.</p><h2>La blockchain Kaspa</h2><p>La scelta di costruire AIROOBI su Kaspa non è casuale. Kaspa è una delle blockchain più innovative nel panorama attuale, caratterizzata da velocità di transazione eccezionale e costi minimi. Queste caratteristiche la rendono ideale per una piattaforma che deve gestire micropagamenti, distribuzioni di valore e certificazioni di proprietà in tempo reale.</p><h2>Chi può partecipare</h2><p>AIROOBI è pensato per tutti. Non servono conoscenze tecniche avanzate, non servono grandi capitali, non serve essere esperti di criptovalute. La piattaforma è accessibile da qualsiasi dispositivo, con un\'interfaccia semplice e intuitiva. L\'unico requisito è la voglia di partecipare in modo costante e attivo.</p><h2>Lo stato attuale</h2><p>AIROOBI è attualmente in fase Alpha Brave, la prima fase di accesso alla piattaforma riservata ai primi mille utenti. Questa fase permette ai partecipanti più precoci di accumulare punti ARIA, familiarizzare con la piattaforma e ottenere vantaggi esclusivi che non saranno più disponibili nelle fasi successive.</p>'},
{slug:'kaspa-blockchain-commercio-digitale',title:'Kaspa: perché è la blockchain giusta per il futuro del commercio digitale',date:'12 Marzo 2026',meta:'Perché Kaspa è la blockchain ideale per il commercio digitale: architettura GHOSTDAG, velocità e costi minimi.',body:'<p>Quando si parla di blockchain, i nomi più noti sono Bitcoin ed Ethereum. Eppure nel panorama delle tecnologie distribuite esiste un progetto che sta attirando sempre più attenzione per le sue caratteristiche tecniche uniche: Kaspa.</p><h2>Il problema delle blockchain tradizionali</h2><p>Bitcoin e Ethereum hanno dimostrato al mondo che le blockchain funzionano. Ma entrambe portano con sé limitazioni significative quando si tratta di scalabilità. Bitcoin processa circa 7 transazioni al secondo. Ethereum, anche dopo il passaggio al Proof of Stake, fatica a superare le 30 transazioni al secondo nei momenti di picco. Quando la rete è congestionata, i costi di transazione esplodono e i tempi di conferma si allungano enormemente.</p><h2>L\'architettura GHOSTDAG di Kaspa</h2><p>Kaspa risolve questi problemi attraverso un\'architettura radicalmente diversa chiamata GHOSTDAG — un protocollo che permette di processare blocchi in parallelo invece che in sequenza. Mentre le blockchain tradizionali devono scegliere un solo blocco per ogni slot temporale, scartando tutti gli altri, Kaspa li include tutti in un grafo aciclico diretto (DAG). Il risultato è una velocità di transazione nettamente superiore, con costi che rimangono minimi anche sotto carico elevato.</p><h2>Velocità e costi reali</h2><p>Kaspa è in grado di processare decine di blocchi al secondo, con tempi di conferma che si misurano in secondi, non in minuti. I costi di transazione sono frazioni di centesimo. Per una piattaforma come AIROOBI, che deve gestire distribuzioni di valore a migliaia di utenti simultaneamente, queste caratteristiche non sono un lusso ma una necessità.</p><h2>Decentralizzazione senza compromessi</h2><p>A differenza di molte blockchain di nuova generazione che aumentano la velocità sacrificando la decentralizzazione, Kaspa mantiene un alto grado di distribuzione dei nodi. Chiunque può partecipare alla validazione della rete con hardware accessibile, senza dover investire in hardware specializzato da migliaia di euro.</p><h2>Il futuro di Kaspa</h2><p>Kaspa è un progetto relativamente giovane ma con una comunità di sviluppatori attiva e una visione tecnica solida. Le roadmap future includono miglioramenti ulteriori alla scalabilità e l\'introduzione di smart contract, aprendo la strada a un ecosistema applicativo completo. AIROOBI ha scelto Kaspa non solo per ciò che è oggi, ma per ciò che diventerà.</p>'},
{slug:'nft-garanzia-uso-concreto',title:'NFT come garanzia: un uso concreto oltre la speculazione',date:'13 Marzo 2026',meta:'Come gli NFT possono essere usati come certificati di garanzia reali, oltre la speculazione. Il modello ROBI di AIROOBI.',body:'<p>Gli NFT hanno avuto anni di hype, crolli di mercato e reputazione controversa. Eppure, al di là della speculazione sulle immagini digitali, esiste un utilizzo degli NFT profondamente pratico e utile: come certificati di garanzia verificabili su blockchain.</p><h2>Cosa è andato storto con gli NFT</h2><p>Tra il 2021 e il 2022 il mercato degli NFT ha vissuto una bolla speculativa senza precedenti. Immagini di scimmie digitali venivano vendute per milioni di dollari. Progetti senza sostanza raccoglievano capitali enormi promettendo utilità che non è mai arrivata. Il crollo è stato inevitabile e ha lasciato milioni di investitori con asset di valore quasi nullo.</p><p>Il problema non era la tecnologia degli NFT in sé, ma il modo in cui veniva utilizzata: come veicolo di speculazione pura, senza un valore sottostante reale e verificabile.</p><h2>NFT come certificato di valore</h2><p>Un NFT è fondamentalmente un certificato di proprietà digitale registrato su blockchain. Questa caratteristica — immutabile, trasparente e verificabile da chiunque — lo rende uno strumento ideale per rappresentare garanzie reali.</p><p>Immagina di ricevere un certificato che attesta: "questo documento garantisce che tu riceverai un valore specifico entro un tempo definito". Se quel certificato è registrato su blockchain, nessuno può alterarlo, cancellarlo o negarti quanto promesso. È questo il principio che AIROOBI ha adottato.</p><h2>Come funziona il ROBI di AIROOBI</h2><p>Nel sistema AIROOBI, il ROBI è un NFT che certifica il diritto del possessore a ricevere un valore garantito dal fondo di garanzia della piattaforma. Non è un asset speculativo il cui valore dipende dal mercato secondario. È un certificato con un valore minimo garantito, convertibile in KAS — la criptovaluta nativa di Kaspa.</p><p>Questo meccanismo garantisce che nessun partecipante agli airdrop di AIROOBI perda completamente. Chi non ottiene l\'oggetto fisico riceve comunque un valore reale, certificato e verificabile.</p><h2>Perché questo modello è sostenibile</h2><p>La sostenibilità del meccanismo dipende dal fondo di garanzia, alimentato da una percentuale di ogni airdrop completato sulla piattaforma. Più la piattaforma cresce, più il fondo si consolida, aumentando la solidità della garanzia offerta a ogni partecipante. È un sistema che si autorafforza con la crescita.</p>'},
{slug:'come-guadagnare-punti-aria-airoobi',title:'Come guadagnare punti ARIA su AIROOBI: la guida completa',date:'14 Marzo 2026',meta:'Guida completa per guadagnare punti ARIA su AIROOBI: check-in, video, referral, streak settimanale e strategia.',body:'<p>ARIA è la valuta di piattaforma di AIROOBI. Accumularla è semplice, ma farlo in modo strategico può fare la differenza tra aggiudicarsi un oggetto ambito o lasciarlo ad altri. Ecco tutto quello che devi sapere.</p><h2>Cos\'è ARIA</h2><p>ARIA è la valuta interna di AIROOBI che misura il tuo livello di partecipazione alla piattaforma. Non si compra — si guadagna attraverso attività concrete. Questo principio è fondamentale per la filosofia di AIROOBI: il valore non dipende da quanto sei ricco, ma da quanto sei presente e attivo.</p><h2>I modi per guadagnare ARIA</h2><h3>Check-in giornaliero</h3><p>Ogni giorno che accedi alla piattaforma e completi il check-in guadagni 10 ARIA. Sembra poco, ma la costanza è premiata: chi entra ogni giorno accumula un vantaggio significativo rispetto a chi partecipa in modo irregolare. Il check-in vale solo per il giorno corrente — non è possibile recuperare i giorni persi.</p><h3>Bonus di benvenuto</h3><p>Al momento della registrazione ricevi 100 ARIA come bonus iniziale. È un punto di partenza, non un traguardo.</p><h3>Visualizzazione video</h3><p>Guardare i contenuti informativi sulla piattaforma vale 10 ARIA per video, fino a un massimo di 5 video al giorno. Non si tratta di contenuti casuali ma di materiali che approfondiscono il funzionamento della piattaforma e del mondo crypto.</p><h3>Streak settimanale</h3><p>Chi completa il check-in per sette giorni consecutivi riceve un bonus di 100 ARIA aggiuntivi. La regolarità viene premiata in modo esponenziale.</p><h3>Programma referral</h3><p>Invitare un amico che si registra e conferma il proprio account vale 100 ARIA per entrambi. Il referral è uno degli strumenti più potenti per chi vuole scalare rapidamente la classifica.</p><h2>Strategia per i nuovi utenti</h2><p>Il consiglio per chi inizia è semplice: priorità assoluta alla costanza. Un utente che non salta mai un check-in per trenta giorni accumula più ARIA di uno che partecipa in modo intensivo per una settimana e poi sparisce. Il sistema è progettato per premiare chi costruisce un\'abitudine, non chi brucia energie in sprint.</p><h2>ARIA nella fase Alpha Brave</h2><p>Durante la fase Alpha Brave — riservata ai primi mille utenti — tutti gli ARIA accumulati sono simbolici in attesa dell\'attivazione del Treasury. Questo significa che stai costruendo la tua posizione in anticipo rispetto a quando la piattaforma sarà completamente operativa. Chi accumula oggi avrà un vantaggio strutturale sugli utenti che arriveranno dopo.</p>'},
{slug:'alpha-brave-airoobi-prima-fase',title:'Cos\'è la fase Alpha Brave di AIROOBI e perché dovresti farne parte',date:'15 Marzo 2026',meta:'Scopri la fase Alpha Brave di AIROOBI: vantaggi esclusivi, badge fondatore e perché entrare tra i primi 1000 utenti.',body:'<p>Ogni grande piattaforma ha una fase zero — quel momento iniziale in cui tutto è ancora in costruzione ma le fondamenta vengono gettate. Per AIROOBI, quella fase si chiama Alpha Brave, ed è aperta ai primi mille utenti che scelgono di credere nel progetto prima che diventi mainstream.</p><h2>Cosa significa Alpha Brave</h2><p>Alpha Brave è il primo tier di accesso a AIROOBI, riservato alle prime mille persone che completano la registrazione. Non è solo un numero d\'ordine: gli utenti Alpha Brave ricevono vantaggi permanenti che nessun utente futuro potrà ottenere, indipendentemente da quanto sarà disposto a pagare.</p><h2>I vantaggi esclusivi</h2><p>Gli utenti Alpha Brave ricevono il Badge Fondatore — un riconoscimento permanente nel profilo che attesta la loro presenza fin dall\'inizio. Ricevono un NFT Alpha Tier 0, certificato della loro posizione nella prima generazione di utenti della piattaforma. Accumulano ARIA fin da subito, costruendo un vantaggio sulla classifica che gli utenti futuri non potranno mai colmare completamente.</p><h2>Perché essere early mover conta</h2><p>Nella storia di internet, chi è entrato presto nei progetti giusti ha sempre avuto un vantaggio enorme. Non si tratta di fortuna ma di lungimiranza. AIROOBI sta costruendo qualcosa di nuovo nel settore degli airdrop e del commercio digitale equo. Essere presenti nella fase Alpha significa fare parte della storia del progetto, non solo usufruire di un servizio già maturo.</p><h2>Come iscriversi</h2><p>La registrazione è aperta su airoobi.com. Il processo richiede pochi minuti: un indirizzo email, una password sicura e la conferma via email. Non serve inserire dati di pagamento, non serve possedere criptovalute, non serve alcuna competenza tecnica. L\'unico requisito è voler essere tra i primi.</p><h2>I prossimi passi</h2><p>Dopo Alpha Brave arriverà Alpha Wise — il secondo tier — e successivamente le fasi di lancio completo della piattaforma con i primi airdrop reali di oggetti fisici. Chi è già dentro con Alpha Brave avrà un posto in prima fila per ogni novità.</p>'}
];

function openBlog(){
  // Hide main site sections
  document.querySelectorAll('section, .hero, .dash-overlay, .investor-overlay').forEach(function(el){el.dataset.blogHidden=el.style.display||'';el.style.display='none';});
  var c=document.getElementById('blog-content');
  var html='<button class="blog-back" onclick="closeBlog()">&larr; <span class="it">Torna alla home</span><span class="en">Back to home</span></button>';
  html+='<h1 class="blog-list-title"><span class="it">Il <em>Blog</em> di AIROOBI</span><span class="en">The AIROOBI <em>Blog</em></span></h1>';
  html+='<p class="blog-list-sub"><span class="it">Approfondimenti su airdrop, blockchain Kaspa, NFT e il futuro del commercio digitale equo.</span><span class="en">Insights on airdrops, Kaspa blockchain, NFTs and the future of fair digital commerce.</span></p>';
  html+='<div class="blog-grid">';
  _blogArticles.forEach(function(a){
    var excerpt=a.body.replace(/<[^>]+>/g,'').substring(0,150)+'...';
    html+='<div class="blog-card" onclick="location.hash=\'blog-'+a.slug+'\'">'
      +'<div class="blog-card-date">'+a.date+'</div>'
      +'<div class="blog-card-title">'+a.title+'</div>'
      +'<div class="blog-card-excerpt">'+excerpt+'</div>'
      +'<span class="blog-card-link"><span class="it">Leggi &rarr;</span><span class="en">Read &rarr;</span></span>'
      +'</div>';
  });
  html+='</div>';
  c.innerHTML=html;
  document.getElementById('blog-overlay').classList.add('active');
  window.scrollTo(0,0);
}

function openBlogArticle(hashSlug){
  // hashSlug is like "blog-cosa-sono-gli-airdrop-crypto"
  var slug=hashSlug.replace('blog-','');
  var a=_blogArticles.find(function(x){return x.slug===slug});
  if(!a){openBlog();return;}
  // Update meta description
  var metaDesc=document.querySelector('meta[name="description"]');
  if(metaDesc)metaDesc.setAttribute('content',a.meta);
  // Hide main site sections
  document.querySelectorAll('section, .hero, .dash-overlay, .investor-overlay').forEach(function(el){el.dataset.blogHidden=el.style.display||'';el.style.display='none';});
  var c=document.getElementById('blog-content');
  var html='<nav class="blog-breadcrumb"><a href="#" onclick="closeBlog();return false">AIROOBI</a><span class="sep">&rsaquo;</span><a href="#blog">Blog</a><span class="sep">&rsaquo;</span><span style="color:var(--white)">'+a.title+'</span></nav>';
  html+='<article>';
  html+='<h1 class="blog-article-title">'+a.title+'</h1>';
  html+='<div class="blog-article-date">'+a.date+'</div>';
  html+='<div class="blog-article-body">'+a.body+'</div>';
  html+='</article>';
  // CTA
  html+='<div class="blog-cta"><div class="blog-cta-title"><span class="it">Scopri <em>AIROOBI</em></span><span class="en">Discover <em>AIROOBI</em></span></div><p class="blog-cta-sub"><span class="it">Registrati gratis e inizia a guadagnare ARIA per partecipare agli airdrop.</span><span class="en">Sign up for free and start earning ARIA to join airdrops.</span></p><a href="#signup" class="blog-cta-btn"><span class="it">Registrati</span><span class="en">Sign Up</span></a></div>';
  c.innerHTML=html;
  document.getElementById('blog-overlay').classList.add('active');
  document.title='AIROOBI — '+a.title;
  window.scrollTo(0,0);
}

function closeBlog(){
  document.getElementById('blog-overlay').classList.remove('active');
  document.querySelectorAll('[data-blog-hidden]').forEach(function(el){el.style.display=el.dataset.blogHidden;delete el.dataset.blogHidden;});
  document.title='AIROOBI — Airdrop Marketplace su Kaspa';
  // Restore default meta description
  var metaDesc=document.querySelector('meta[name="description"]');
  if(metaDesc)metaDesc.setAttribute('content','AIROOBI è il marketplace dove realizzi i tuoi desideri. Oggetti reali di valore, a un prezzo che non crederesti. Guadagni ARIA ogni giorno — gratis.');
  if(location.hash.match(/^#blog/))history.replaceState(null,null,' ');
}

// == VIDEO INTERSTITIAL ==
const VIDEO_DURATION=15;
let videoTimer=null;
let videoSeconds=0;
let videoCallback=null;
let videoSeenThisSession=false;

function showVideoAd(onComplete){
  track('video_start');
  videoCallback=onComplete;
  videoSeconds=0;
  const overlay=document.getElementById('video-overlay');
  const container=document.getElementById('video-container');
  const bar=document.getElementById('video-progress-bar');
  const skipBtn=document.getElementById('video-skip');
  const lang=document.documentElement.getAttribute('data-lang')||'it';
  bar.style.width='0%';
  skipBtn.classList.remove('ready');
  overlay.classList.add('active');
  document.body.style.overflow='hidden';
  container.innerHTML='<iframe src="/video-intro.html?autoplay=1" style="width:100%;height:100%;border:none;" allow="autoplay"></iframe>';
  updateVideoCountdown(lang);
  videoTimer=setInterval(function(){
    videoSeconds++;
    bar.style.width=Math.min(100,(videoSeconds/VIDEO_DURATION)*100)+'%';
    updateVideoCountdown(lang);
    if(videoSeconds>=VIDEO_DURATION){
      clearInterval(videoTimer);
      skipBtn.classList.add('ready');
      var nosee=document.getElementById('video-nosee-wrap');
      if(nosee)nosee.classList.add('show');
    }
  },1000);
}
function updateVideoCountdown(lang){
  var r=Math.max(0,VIDEO_DURATION-videoSeconds);
  var el=document.getElementById('video-countdown');
  if(r>0)el.textContent=lang==='it'?'Puoi continuare tra '+r+'s':'You can continue in '+r+'s';
  else el.innerHTML=lang==='it'?'<span>Video completato</span>':'<span>Video complete</span>';
}
function skipVideo(){
  if(!document.getElementById('video-skip').classList.contains('ready'))return;
  clearInterval(videoTimer);
  // Save "don't show again" if checked
  if(document.getElementById('video-nosee-check')&&document.getElementById('video-nosee-check').checked){
    localStorage.setItem('airoobi_explainer_seen','1');
  }
  document.getElementById('video-overlay').classList.remove('active');
  document.body.style.overflow='';
  if(videoCallback)videoCallback();
  videoCallback=null;
}

function openExplainerVideo(){
  track('explainer_video_viewed');
  showVideoAd(function(){});
}

// ══ SUPABASE AUTH ══
const SB_URL='https://vuvlmlpuhovipfwtquux.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';

async function sbAuth(endpoint, body){
  const res=await fetch(SB_URL+'/auth/v1/'+endpoint,{
    method:'POST',
    headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  return {status:res.status, data:await res.json()};
}

async function sbGet(path,token){
  const h={'apikey':SB_KEY,'Authorization':'Bearer '+(token||SB_KEY)};
  const res=await fetch(SB_URL+'/rest/v1/'+path,{headers:h});
  return res.ok?await res.json():[];
}
async function sbPatch(path,data,token){
  var res=await fetch(SB_URL+'/rest/v1/'+path,{method:'PATCH',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+(token||SB_KEY),'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(data)});
  if(!res.ok)throw new Error('PATCH failed: '+res.status);
}
async function sbDel(path,token){
  var res=await fetch(SB_URL+'/rest/v1/'+path,{method:'DELETE',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+(token||SB_KEY),'Prefer':'return=minimal'}});
  if(!res.ok)throw new Error('DELETE failed: '+res.status);
}

// ── Auth UI ──
function openAuth(mode){
  track('cta_click', {mode, source: location.hash || 'landing'});
  var ref=new URLSearchParams(window.location.search).get('ref')||window._airoobi_ref||'';
  var params=new URLSearchParams();
  if(ref)params.set('ref',ref);
  var returnTo=location.pathname;
  if(returnTo&&returnTo!=='/'&&returnTo!=='/login.html'&&returnTo!=='/signup.html')params.set('returnTo',returnTo);
  var qs=params.toString();
  var suffix=qs?'?'+qs:'';
  if(mode==='login'){window.location.href='/login.html'+suffix}
  else{window.location.href='/signup.html'+suffix}
}

// ── Session ──
function saveSession(s){localStorage.setItem('airoobi_session',JSON.stringify(s))}
function getSession(){try{return JSON.parse(localStorage.getItem('airoobi_session'))}catch{return null}}
function clearSession(){localStorage.removeItem('airoobi_session')}

// ── Token refresh (mirrors dapp.html) ──
async function refreshToken(){
  var s=getSession();
  if(!s||!s.refresh_token)return false;
  try{
    var res=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:s.refresh_token})
    });
    if(!res.ok)return false;
    var data=await res.json();
    s.access_token=data.access_token;
    s.refresh_token=data.refresh_token;
    s.user=data.user||s.user;
    saveSession(s);
    return true;
  }catch(e){return false}
}
async function ensureFreshToken(){
  var s=getSession();
  if(!s)return null;
  try{
    var payload=JSON.parse(atob(s.access_token.split('.')[1]));
    if(payload.exp*1000<Date.now()+60000){
      var ok=await refreshToken();
      if(!ok){clearSession();return null;}
      return getSession();
    }
  }catch(e){}
  return s;
}

// ── Logout ──
function doLogout(){
  clearSession();
  window.location.href='/';
}

// ── Hide auth buttons when logged in ──
(function(){
  var s=getSession();
  if(s&&s.access_token){
    var lb=document.getElementById('nav-login-btn');
    if(lb)lb.style.display='none';
    document.querySelectorAll('.mm-auth-btn').forEach(function(el){el.style.display='none';});
    // Add settings button to nav
    var nav=document.querySelector('.nav-menu');
    if(nav&&lb){
      var settingsBtn=document.createElement('a');
      settingsBtn.href='#settings';
      settingsBtn.className='nav-link-btn';
      settingsBtn.style.textDecoration='none';
      settingsBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      nav.insertBefore(settingsBtn,lb);
    }
    // Add settings link to mobile menu
    var mmActions=document.getElementById('mm-actions');
    if(mmActions){
      var settingsLink=document.createElement('a');
      settingsLink.href='#settings';
      settingsLink.className='nav-cta';
      settingsLink.onclick=function(){closeBurger();};
      settingsLink.style.cssText='text-decoration:none;text-align:center;background:none;border:1px solid var(--gold);color:var(--gold)';
      settingsLink.innerHTML='<span class="it">Impostazioni</span><span class="en">Settings</span>';
      mmActions.insertBefore(settingsLink,mmActions.firstChild);
    }
  }
})();

// ── Auto-fill ref code on page load ──
(function(){
  var params=new URLSearchParams(window.location.search);
  var ref=params.get('ref');
  if(ref){
    window._airoobi_ref=ref;
    localStorage.setItem('airoobi_pending_ref',ref); // persists across email confirmation redirect
  }
})();

async function sbRpc(fn,body,token){
  const res=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{
    method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  if(res.ok)return await res.json();
  return null;
}

// ══ INVESTOR PAGE ══
var _invChartsRendered=false;
function openInvestor(){
  track('investor_page_viewed');
  document.getElementById('investor-overlay').classList.add('active');
  document.body.style.overflow='hidden';
  // Load waitlist count
  sbCount().then(function(c){var el=document.getElementById('inv-waitlist');if(el)el.textContent=c||'—';});
  // Render charts (once)
  if(!_invChartsRendered&&typeof Chart!=='undefined'){
    _invChartsRendered=true;
    renderInvestorCharts();
  }else if(!_invChartsRendered){
    // Chart.js might not be loaded yet — wait
    var ci=setInterval(function(){if(typeof Chart!=='undefined'){clearInterval(ci);_invChartsRendered=true;renderInvestorCharts();}},200);
    setTimeout(function(){clearInterval(ci);},5000);
  }
}
function closeInvestor(){
  document.getElementById('investor-overlay').classList.remove('active');
  document.body.style.overflow='';
}

function renderInvestorCharts(){
  // Roadmap phases visual (horizontal bar)
  var roadCtx=document.getElementById('inv-chart-roadmap');
  if(roadCtx){
    new Chart(roadCtx,{
      type:'bar',
      data:{
        labels:['Alpha Brave','Alpha Wise','Beta','Pre-Prod','Mainnet'],
        datasets:[{
          label:'Target utenti',
          data:[1000,2500,5000,10000,15000],
          backgroundColor:['#B8960C','rgba(184,150,12,.7)','rgba(184,150,12,.5)','rgba(184,150,12,.3)','rgba(184,150,12,.15)'],
          borderColor:'#B8960C',
          borderWidth:1
        }]
      },
      options:{
        indexAxis:'y',
        responsive:true,
        plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:'#888',font:{family:'DM Mono',size:10},callback:function(v){return v>=1000?(v/1000)+'K':v}},grid:{color:'rgba(255,255,255,.05)'}},
          y:{ticks:{color:'#B8960C',font:{family:'DM Mono',size:11,weight:'bold'}},grid:{display:false}}
        }
      }
    });
  }
}


// ══ ADMIN AREA ══
const ADMIN_EMAILS=['tommaso.pecorella+ceo@outlook.com','ceo@airoobi.com'];

var _adminRefreshInterval=null;
async function openAdmin(){
  var s=await ensureFreshToken();
  if(!s){openAuth('login');return;}
  if(ADMIN_EMAILS.indexOf(s.user?.email)===-1)return;
  document.getElementById('admin-overlay').classList.add('active');
  document.body.style.overflow='hidden';
  history.replaceState(null,null,'/admin');
  loadAdminData().then(function(){
    refreshAriaCircolante();
    refreshNftCircolante();
  });
  if(_adminRefreshInterval)clearInterval(_adminRefreshInterval);
  _adminRefreshInterval=setInterval(loadAdminData,60000);
}
function closeAdmin(){
  document.getElementById('admin-overlay').classList.remove('active');
  document.body.style.overflow='';
  if(_adminRefreshInterval){clearInterval(_adminRefreshInterval);_adminRefreshInterval=null;}
  window.location.href='https://airoobi.app';
}

// ══ USER SETTINGS ══
async function openSettings(){
  var s=await ensureFreshToken();
  if(!s){openAuth('login');return;}
  track('settings_opened');
  document.getElementById('settings-overlay').classList.add('active');
  document.body.style.overflow='hidden';
  // Fill fields
  var email=s.user.email||'';
  document.getElementById('settings-email').value=email;
  document.getElementById('settings-email-show').textContent=email;
  // Load profile from Supabase
  var firstName='',lastName='';
  try{
    var res=await sbGet('profiles?id=eq.'+s.user.id+'&select=first_name,last_name',s.access_token);
    if(res&&res.length>0){
      firstName=res[0].first_name||'';
      lastName=res[0].last_name||'';
      document.getElementById('settings-first-name').value=firstName;
      document.getElementById('settings-last-name').value=lastName;
    }
  }catch(e){}
  // Avatar initials
  var initials=((firstName.charAt(0)||'')+(lastName.charAt(0)||'')).toUpperCase()||email.charAt(0).toUpperCase()||'?';
  document.getElementById('settings-avatar').textContent=initials;
  // Display name
  var displayName=firstName||(email.split('@')[0]);
  var dnIt=document.getElementById('settings-display-name');
  var dnEn=document.getElementById('settings-display-name-en');
  if(dnIt)dnIt.textContent=displayName;
  if(dnEn)dnEn.textContent=displayName;
  // Clear password fields
  document.getElementById('settings-new-pw').value='';
  document.getElementById('settings-confirm-pw').value='';
  document.getElementById('settings-msg').textContent='';
  // Update lang buttons
  updateSettingsLangButtons();
}
function closeSettings(){
  document.getElementById('settings-overlay').classList.remove('active');
  document.body.style.overflow='';
  history.replaceState(null,null,'/');
}
function updateSettingsLangButtons(){
  var cur=document.documentElement.getAttribute('data-lang')||'it';
  var it=document.getElementById('settings-lang-it');
  var en=document.getElementById('settings-lang-en');
  if(it){it.classList.toggle('active',cur==='it');}
  if(en){en.classList.toggle('active',cur==='en');}
}
function setSettingsLang(lang){
  document.documentElement.setAttribute('data-lang',lang);
  localStorage.setItem('airoobi_lang',lang);
  updateSettingsLangButtons();
}
async function saveSettings(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msgEl=document.getElementById('settings-msg');
  msgEl.textContent='';
  msgEl.style.color='';
  var s=await ensureFreshToken();
  if(!s){openAuth('login');return;}
  var btn=document.getElementById('settings-save-btn');
  btn.disabled=true;
  var firstName=document.getElementById('settings-first-name').value.trim();
  var lastName=document.getElementById('settings-last-name').value.trim();
  var newPw=document.getElementById('settings-new-pw').value;
  var confirmPw=document.getElementById('settings-confirm-pw').value;
  try{
    // Update profile name
    await sbPatch('profiles?id=eq.'+s.user.id,{first_name:firstName,last_name:lastName},s.access_token);
    // Change password if provided
    if(newPw){
      if(newPw.length<6){
        msgEl.textContent=lang==='it'?'La password deve avere almeno 6 caratteri.':'Password must be at least 6 characters.';
        msgEl.style.color='#f87171';
        btn.disabled=false;
        return;
      }
      if(newPw!==confirmPw){
        msgEl.textContent=lang==='it'?'Le password non coincidono.':'Passwords do not match.';
        msgEl.style.color='#f87171';
        btn.disabled=false;
        return;
      }
      var pwRes=await fetch(SB_URL+'/auth/v1/user',{
        method:'PUT',
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
        body:JSON.stringify({password:newPw})
      });
      if(!pwRes.ok){
        msgEl.textContent=lang==='it'?'Errore nel cambio password.':'Error changing password.';
        msgEl.style.color='#f87171';
        btn.disabled=false;
        return;
      }
      document.getElementById('settings-new-pw').value='';
      document.getElementById('settings-confirm-pw').value='';
    }
    track('settings_saved',{changed_password:!!newPw});
    msgEl.textContent=lang==='it'?'Salvato \u2713':'Saved \u2713';
    msgEl.style.color='#34d399';
  }catch(e){
    msgEl.textContent=lang==='it'?'Errore. Riprova.':'Error. Try again.';
    msgEl.style.color='#f87171';
  }
  btn.disabled=false;
}
async function confirmDeleteAccount(){
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var msg=lang==='it'
    ?'Sei sicuro di voler eliminare il tuo account? Tutti i dati verranno persi. Scrivi ELIMINA per confermare.'
    :'Are you sure you want to delete your account? All data will be lost. Type DELETE to confirm.';
  var confirmation=prompt(msg);
  if(!confirmation)return;
  if(lang==='it'&&confirmation.toUpperCase()!=='ELIMINA')return;
  if(lang==='en'&&confirmation.toUpperCase()!=='DELETE')return;
  var s=await ensureFreshToken();
  if(!s)return;
  try{
    // Delete profile (cascade should handle the rest via DB)
    await sbDel('profiles?id=eq.'+s.user.id,s.access_token);
    track('account_deleted');
    clearSession();
    alert(lang==='it'?'Account eliminato.':'Account deleted.');
    window.location.href='/';
  }catch(e){
    alert(lang==='it'?'Errore. Contatta support@airoobi.com':'Error. Contact support@airoobi.com');
  }
}

function adminNav(sectionId){
  document.querySelectorAll('.admin-section').forEach(function(s){s.classList.remove('active')});
  document.querySelectorAll('.admin-sidebar-item').forEach(function(b){b.classList.remove('active');b.blur()});
  var sec=document.getElementById(sectionId);
  if(sec)sec.classList.add('active');
  var btn=document.querySelector('.admin-sidebar-item[onclick*="\''+sectionId+'\'"]');
  if(btn){btn.classList.add('active');btn.blur();}
  var main=document.getElementById('admin-main');
  if(main){main.scrollTop=0;main.focus();}
  // Close mobile sidebar
  var sb=document.getElementById('admin-sidebar');
  if(sb)sb.classList.remove('open');
}

function toggleAdminSidebar(){
  var sb=document.getElementById('admin-sidebar');
  if(sb)sb.classList.toggle('open');
}

async function toggleUserDetail(row,uid){
  var existing=row.nextElementSibling;
  if(existing&&existing.classList.contains('adm-detail-row')){
    existing.remove();
    row.classList.remove('expanded');
    return;
  }
  // Close any other open detail
  document.querySelectorAll('.adm-detail-row').forEach(function(r){r.previousElementSibling.classList.remove('expanded');r.remove();});
  row.classList.add('expanded');
  var detailRow=document.createElement('tr');
  detailRow.className='adm-detail-row';
  detailRow.innerHTML='<td colspan="5"><div class="adm-detail-inner" style="color:var(--gray-400)">Caricamento...</div></td>';
  row.after(detailRow);
  var s=getSession();
  if(!s)return;
  var t=s.access_token;
  try{
    var [ledger,nfts]=await Promise.all([
      sbGet('points_ledger?user_id=eq.'+uid+'&select=amount,reason,created_at&order=created_at.desc&limit=50',t),
      sbGet('nft_rewards?user_id=eq.'+uid+'&select=nft_type,created_at&order=created_at.desc',t)
    ]);
    var html='<div class="adm-detail-inner">';
    // Points ledger
    html+='<h4>Storico ARIA (ultimi 50)</h4>';
    if(ledger&&ledger.length>0){
      html+='<table><thead><tr><th>Data</th><th>Motivo</th><th>ARIA</th></tr></thead><tbody>';
      ledger.forEach(function(e){
        var d=new Date(e.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
        var reason=e.reason||'altro';
        var cls='adm-r-default';
        if(reason.indexOf('checkin')>=0)cls='adm-r-checkin';
        else if(reason.indexOf('referral')>=0)cls='adm-r-referral';
        else if(reason.indexOf('welcome')>=0)cls='adm-r-welcome';
        else if(reason.indexOf('video')>=0)cls='adm-r-video';
        else if(reason.indexOf('streak')>=0)cls='adm-r-streak';
        html+='<tr><td>'+d+'</td><td><span class="adm-reason '+cls+'">'+reason+'</span></td><td style="color:var(--gold)">+'+e.amount+'</td></tr>';
      });
      html+='</tbody></table>';
    }else{
      html+='<p style="font-size:12px;color:var(--gray-500)">Nessun movimento</p>';
    }
    // ROBI
    html+='<h4>ROBI</h4>';
    if(nfts&&nfts.length>0){
      nfts.forEach(function(n){
        var d=new Date(n.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
        html+='<span class="adm-nft-badge">'+n.nft_type+' — '+d+'</span> ';
      });
    }else{
      html+='<p style="font-size:12px;color:var(--gray-500)">Nessun NFT</p>';
    }
    html+='</div>';
    detailRow.innerHTML='<td colspan="5">'+html+'</td>';
  }catch(e){
    detailRow.innerHTML='<td colspan="5"><div class="adm-detail-inner" style="color:#ef4444">Errore caricamento dati</div></td>';
  }
}

async function loadAdminData(){
  const s=await ensureFreshToken();
  if(!s)return;
  const t=s.access_token;
  
  try{
    // Users (exclude test users from stats)
    const allProfiles=await sbGet('profiles?select=*&order=created_at.desc',t);
    const users=allProfiles?allProfiles.filter(function(u){return !u.is_test_user}):[];
    var userCount=users.length;
    document.getElementById('adm-users').textContent=userCount;

    // Posti rimasti Alpha Brave
    var remaining=Math.max(0,1000-userCount);
    var remEl=document.getElementById('adm-remaining');
    if(remEl){remEl.textContent=remaining;remEl.style.color=remaining<=0?'#B91C1C':remaining<=100?'#F59E0B':'var(--gold)';}

    // Total ARIA in circolazione (exclude test users)
    const totalPts=users.reduce(function(a,b){return a+(b.total_points||0)},0);
    document.getElementById('adm-points').textContent=totalPts.toLocaleString();
    var aicoIn=document.getElementById('adm-aico-input');if(aicoIn)aicoIn.value=totalPts;
    var coinSup=document.getElementById('adm-coin-supply');if(coinSup)coinSup.textContent=totalPts.toLocaleString();
    
    // Today's checkins
    var today=new Date().toISOString().split('T')[0];
    const cks=await sbGet('checkins?checked_at=eq.'+today+'&select=id',t);
    document.getElementById('adm-checkins').textContent=cks?cks.length:0;
    
    // Today's videos
    const vids=await sbGet('video_views?viewed_at=gte.'+today+'T00:00:00&select=id',t);
    document.getElementById('adm-videos').textContent=vids?vids.length:0;
    
    // Confirmed referrals
    const refs=await sbGet('referral_confirmations?status=eq.confirmed&select=id',t);
    document.getElementById('adm-referrals').textContent=refs?refs.length:0;

    // Users with profile image
    var withAvatar=users?users.filter(function(u){return !!u.avatar_url}).length:0;
    document.getElementById('adm-avatars').textContent=withAvatar+'/'+userCount;

    // ROBI in circolazione
    try{
      var nfts=await sbGet('nft_rewards?select=id,nft_type',t);
      var earnCount=nfts?nfts.filter(function(n){return n.nft_type==='NFT_EARN'}).length:0;
      document.getElementById('adm-nft-circulating-ov').textContent=earnCount;
    }catch(e){document.getElementById('adm-nft-circulating-ov').textContent='—';}

    // Users table (clickable rows with detail expansion)
    if(users&&users.length>0){
      var tbody=document.getElementById('adm-users-body');
      tbody.innerHTML=users.slice(0,50).map(function(u){
        var d=new Date(u.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
        return '<tr class="adm-user-row" onclick="toggleUserDetail(this,\''+u.id+'\')" data-uid="'+u.id+'"><td>'+u.email+'</td><td>'+(u.total_points||0)+'</td><td>'+(u.current_streak||0)+'</td><td>'+(u.referral_count||0)+'</td><td>'+d+'</td></tr>';
      }).join('');
    }
    
    // Stats
    if(users&&users.length>0){
      var avgPts=Math.round(totalPts/users.length);
      document.getElementById('adm-avg-points').textContent=avgPts;
      var maxStreak=Math.max.apply(null,users.map(function(u){return u.longest_streak||0}));
      document.getElementById('adm-max-streak').textContent=maxStreak+'d';
      var wl=await sbGet('waitlist?select=id',t);
      document.getElementById('adm-conversion').textContent=users.length+'/'+(wl?wl.length:0);
    }
    
    // Investor leads
    try{
      const leads=await sbGet('investor_leads?select=id',t);
      document.getElementById('adm-inv-leads').textContent=leads?leads.length:0;
    }catch(e){document.getElementById('adm-inv-leads').textContent='—';}
    
    // Cost Tracker + Treasury
    loadCostTracker();
    await loadAdminTreasury();
    loadAdminAirdrops();
    loadFairnessAirdrops();

  }catch(e){console.error('Admin load error:',e);}
}

// ── Notifications ──
function showToast(message,type){
  type=type||'info';
  var container=document.getElementById('notif-toast-container');
  if(!container)return;
  var t=document.createElement('div');
  t.className='notif-toast toast-'+type;
  t.textContent=message;
  container.appendChild(t);
  setTimeout(function(){t.classList.add('fade-out');setTimeout(function(){t.remove()},300)},5000);
}

async function loadNotifications(){
  var s=window._currentSession||getSession();
  if(!s)return;
  try{
    var notifs=await sbGet('notifications?user_id=eq.'+s.user.id+'&order=created_at.desc&limit=30',s.access_token);
    var badges=document.querySelectorAll('#dash-notif-badge');
    var lists=document.querySelectorAll('#dash-notif-list');
    if(!notifs||!notifs.length){
      badges.forEach(function(b){b.textContent=''});
      lists.forEach(function(l){l.innerHTML='<div class="notif-empty">Nessuna notifica</div>'});
      return;
    }
    var unread=notifs.filter(function(n){return !n.read}).length;
    badges.forEach(function(b){b.textContent=unread>0?unread:''});
    var html='';
    notifs.forEach(function(n){
      var ago=timeAgo(n.created_at);
      html+='<div class="notif-item'+(n.read?'':' unread')+'" onclick="markNotifRead(\''+n.id+'\')">';
      html+='<div class="notif-item-dot"></div>';
      html+='<div class="notif-item-content"><div class="notif-item-title">'+escHtml(n.title)+'</div>';
      if(n.body)html+='<div class="notif-item-body">'+escHtml(n.body)+'</div>';
      html+='</div><div class="notif-item-time">'+ago+'</div></div>';
    });
    lists.forEach(function(l){l.innerHTML=html});
  }catch(e){console.error('Notif load:',e);}
}

function escHtml(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'';}

function timeAgo(dateStr){
  var d=new Date(dateStr);var now=new Date();var diff=Math.floor((now-d)/1000);
  if(diff<60)return 'ora';if(diff<3600)return Math.floor(diff/60)+'m';
  if(diff<86400)return Math.floor(diff/3600)+'h';return Math.floor(diff/86400)+'g';
}

function toggleDashNotifPanel(e){
  if(e)e.stopPropagation();
  var panel=document.getElementById('dash-notif-panel');
  if(!panel)return;
  panel.classList.toggle('open');
  if(panel.classList.contains('open'))loadNotifications();
}

async function markNotifRead(id){
  var s=window._currentSession||getSession();
  if(!s)return;
  try{
    await sbPatch('notifications?id=eq.'+id,{read:true},s.access_token);
    loadNotifications();
  }catch(e){console.error('Mark read:',e);}
}

async function markAllRead(){
  var s=window._currentSession||getSession();
  if(!s)return;
  try{
    await sbPatch('notifications?user_id=eq.'+s.user.id+'&read=eq.false',{read:true},s.access_token);
    loadNotifications();
  }catch(e){console.error('Mark all read:',e);}
}

// Close notif panel on outside click
document.addEventListener('click',function(e){
  var panel=document.getElementById('dash-notif-panel');
  var bell=document.getElementById('dash-notif-bell');
  if(panel&&panel.classList.contains('open')&&!panel.contains(e.target)&&(!bell||!bell.contains(e.target))){
    panel.classList.remove('open');
  }
  // Close dApp mobile menu on outside click
  var mm=document.getElementById('dash-mobile-menu');
  var burger=document.getElementById('dash-burger');
  if(mm&&mm.classList.contains('open')&&!mm.contains(e.target)&&(!burger||!burger.contains(e.target))){
    mm.classList.remove('open');
  }
});


// ── Admin Airdrop Management ──
async function loadAdminAirdrops(){
  var s=getSession();if(!s)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_all_airdrops',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    if(!res.ok)throw new Error('RPC failed: '+res.status);
    var airdrops=await res.json();
    var tbody=document.getElementById('adm-airdrop-body');
    if(!airdrops||!airdrops.length){
      tbody.innerHTML='<tr><td colspan="8" style="color:var(--gray-400)">Nessun airdrop</td></tr>';
      return;
    }
    var html='';
    airdrops.forEach(function(a){
      var statusColor=a.status==='sale'?'#49b583':a.status==='presale'?'var(--gold)':a.status==='completed'?'#4A9EFF':a.status==='annullato'?'#ef4444':a.status.indexOf('rifiutato')===0?'#ef4444':'var(--gray-400)';
      var canDraw=(['sale','presale','active'].indexOf(a.status)!==-1)&&!a.draw_executed_at;
      var isDone=a.draw_executed_at!=null;
      html+='<tr>';
      html+='<td style="font-weight:600">'+escHtml(a.title)+'</td>';
      html+='<td>'+escHtml(a.category||'—')+'</td>';
      html+='<td style="color:'+statusColor+'">'+escHtml(a.status)+(isDone?' ✓':'')+'</td>';
      html+='<td>'+(a.seller_desired_price?'€'+parseFloat(a.seller_desired_price).toFixed(0):'—')+'</td>';
      html+='<td>'+(a.seller_min_price?'€'+parseFloat(a.seller_min_price).toFixed(0):'—')+'</td>';
      html+='<td style="color:var(--gold)">'+(a.object_value_eur?'€'+parseFloat(a.object_value_eur).toFixed(0):'—')+'</td>';
      html+='<td>'+((a.blocks_sold||0)+'/'+(a.total_blocks||'—'))+'</td>';
      html+='<td style="display:flex;gap:4px;flex-wrap:wrap">';
      html+='<button onclick="adOpenModal(\''+a.id+'\')" style="background:none;border:1px solid var(--gray-700);color:var(--gray-400);padding:4px 10px;font-family:var(--font-m);font-size:10px;cursor:pointer;letter-spacing:1px;transition:all .2s" onmouseover="this.style.borderColor=\'var(--gold)\';this.style.color=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--gray-700)\';this.style.color=\'var(--gray-400)\'">MODIFICA</button>';
      if(canDraw){
        html+='<button onclick="adDrawPreview(\''+a.id+'\')" style="background:none;border:1px solid #4A9EFF;color:#4A9EFF;padding:4px 10px;font-family:var(--font-m);font-size:10px;cursor:pointer;letter-spacing:1px;transition:all .2s" onmouseover="this.style.background=\'#4A9EFF\';this.style.color=\'#000\'" onmouseout="this.style.background=\'none\';this.style.color=\'#4A9EFF\'">ANTEPRIMA</button>';
        html+='<button data-id="'+a.id+'" data-title="'+escHtml(a.title).replace(/"/g,'&quot;')+'" onclick="adExecuteDraw(this.dataset.id,this.dataset.title)" style="background:none;border:1px solid #49b583;color:#49b583;padding:4px 10px;font-family:var(--font-m);font-size:10px;cursor:pointer;letter-spacing:1px;transition:all .2s" onmouseover="this.style.background=\'#49b583\';this.style.color=\'#000\'" onmouseout="this.style.background=\'none\';this.style.color=\'#49b583\'">DRAW</button>';
      }
      if(isDone){
        html+='<button onclick="adDrawPreview(\''+a.id+'\')" style="background:none;border:1px solid var(--gray-600);color:var(--gray-400);padding:4px 10px;font-family:var(--font-m);font-size:10px;cursor:pointer;letter-spacing:1px">RISULTATI</button>';
      }
      html+='</td>';
      html+='</tr>';
    });
    tbody.innerHTML=html;
  }catch(e){
    console.error('Admin airdrops load:',e);
    document.getElementById('adm-airdrop-body').innerHTML='<tr><td colspan="8" style="color:#ef4444">Errore: '+escHtml(e.message)+'</td></tr>';
  }
}

var _adAirdropsCache=[];
async function adOpenModal(id){
  var s=getSession();if(!s)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_all_airdrops',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    var all=await res.json();
    var a=all.find(function(x){return x.id===id});
    if(!a){showToast('Airdrop non trovato','error');return;}
    document.getElementById('ad-edit-id').value=a.id;
    document.getElementById('ad-desired-price').value=a.seller_desired_price||'';
    document.getElementById('ad-min-price').value=a.seller_min_price||'';
    document.getElementById('ad-object-value').value=a.object_value_eur||'';
    document.getElementById('ad-block-price').value=a.block_price_aria||'';
    document.getElementById('ad-total-blocks').value=a.total_blocks||'';
    document.getElementById('ad-presale-price').value=a.presale_block_price||'';
    document.getElementById('ad-deadline').value=a.deadline?a.deadline.substring(0,16):'';
    document.getElementById('ad-status').value=a.status||'in_valutazione';
    document.getElementById('ad-rejection').value=a.rejection_reason||'';
    document.getElementById('ad-auto-draw').checked=!!a.auto_draw;
    document.getElementById('ad-modal-title').textContent='Modifica: '+a.title;
    // Show/hide simulation section
    var simSection=document.getElementById('ad-sim-section');
    var canSim=['presale','sale'].indexOf(a.status)!==-1&&!a.draw_executed_at;
    simSection.style.display=canSim?'block':'none';
    if(canSim){
      var remaining=(a.total_blocks||0)-(a.blocks_sold||0);
      document.getElementById('ad-sim-info').innerHTML='Blocchi: <strong>'+(a.blocks_sold||0)+'/'+(a.total_blocks||0)+'</strong> — Rimanenti: <strong style="color:#f59e0b">'+remaining+'</strong>';
      document.getElementById('ad-sim-pct').value=50;
      document.getElementById('ad-sim-pct-label').textContent='50%';
      document.getElementById('ad-sim-spread').checked=false;
      document.getElementById('ad-sim-result').innerHTML='';
      document.getElementById('ad-sim-btn-run').disabled=false;
      document.getElementById('ad-sim-btn-run').textContent='RUN SIMULATION';
    }
    document.getElementById('ad-modal-bg').classList.add('active');
  }catch(e){console.error('adOpenModal:',e);showToast('Errore caricamento','error');}
}

function adCloseModal(){document.getElementById('ad-modal-bg').classList.remove('active');}

function adAutoCalcBlocks(){
  var val=parseFloat(document.getElementById('ad-object-value').value)||0;
  var bp=parseInt(document.getElementById('ad-block-price').value)||0;
  if(val>0&&bp>0){
    var blocks=Math.ceil(val/(bp*0.10));
    document.getElementById('ad-total-blocks').value=blocks;
  }
}

async function adSaveAirdrop(){
  var s=getSession();if(!s)return;
  var id=document.getElementById('ad-edit-id').value;
  if(!id)return;
  var params={
    p_airdrop_id:id,
    p_status:document.getElementById('ad-status').value,
    p_block_price_aria:parseInt(document.getElementById('ad-block-price').value)||null,
    p_total_blocks:parseInt(document.getElementById('ad-total-blocks').value)||null,
    p_presale_block_price:parseInt(document.getElementById('ad-presale-price').value)||null,
    p_deadline:document.getElementById('ad-deadline').value?new Date(document.getElementById('ad-deadline').value).toISOString():null,
    p_rejection_reason:document.getElementById('ad-rejection').value.trim()||null,
    p_object_value_eur:parseFloat(document.getElementById('ad-object-value').value)||null
  };
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/manager_update_airdrop',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify(params)
    });
    var result=await res.json();
    if(result&&result.ok){
      showToast('Airdrop aggiornato','success');
      adCloseModal();
      loadAdminAirdrops();
    }else{
      showToast('Errore: '+(result.error||'sconosciuto'),'error');
    }
  }catch(e){console.error('adSave:',e);showToast('Errore salvataggio: '+e.message,'error');}
}

// ── Draw Engine ──
async function adDrawPreview(airdropId){
  var s=getSession();if(!s)return;
  var modal=document.getElementById('draw-modal-bg');
  var body=document.getElementById('draw-modal-body');
  body.innerHTML='<p style="color:var(--gray-400);text-align:center;padding:24px">Calcolo in corso...</p>';
  document.getElementById('draw-modal-title').textContent='Anteprima Draw';
  modal.classList.add('active');
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_draw_preview',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_airdrop_id:airdropId})
    });
    var d=await res.json();
    if(!d||!d.ok){body.innerHTML='<p style="color:#ef4444">Errore: '+(d&&d.error?d.error:'sconosciuto')+'</p>';return;}
    var h='';
    // Header info
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
    h+='<div style="background:var(--gray-900);padding:12px;border:1px solid var(--gray-700)">';
    h+='<div style="font-size:10px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;font-family:var(--font-m)">ARIA Incassato</div>';
    h+='<div style="font-size:20px;color:#4A9EFF;font-weight:600">'+d.aria_incassato.toLocaleString()+' <span style="font-size:12px;color:var(--gray-400)">ARIA</span></div>';
    h+='<div style="font-size:12px;color:var(--gray-400)">€'+d.eur_incassato+'</div>';
    h+='</div>';
    h+='<div style="background:var(--gray-900);padding:12px;border:1px solid var(--gray-700)">';
    h+='<div style="font-size:10px;color:var(--gray-500);letter-spacing:1px;text-transform:uppercase;font-family:var(--font-m)">Esito</div>';
    h+='<div style="font-size:20px;color:'+(d.success?'#49b583':'#ef4444')+';font-weight:600">'+(d.success?'SUCCESSO':'ANNULLAMENTO')+'</div>';
    if(d.seller_min_price)h+='<div style="font-size:12px;color:var(--gray-400)">Min venditore: €'+d.seller_min_price+'</div>';
    h+='</div>';
    h+='</div>';
    // Split economica
    if(d.split){
      h+='<div style="margin-bottom:16px">';
      h+='<div style="font-size:10px;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;font-family:var(--font-m);margin-bottom:8px">SPLIT ECONOMICA</div>';
      h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-800);text-align:center"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">VENDITORE</div><div style="color:#49b583;font-weight:600">€'+d.split.venditore_eur+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-800);text-align:center"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">FONDO</div><div style="color:var(--gold);font-weight:600">€'+d.split.fondo_eur+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-800);text-align:center"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">AIROOBI</div><div style="color:var(--white);font-weight:600">€'+d.split.airoobi_eur+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-800);text-align:center"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">CHARITY</div><div style="color:var(--gray-300);font-weight:600">€'+d.split.charity_eur+'</div></div>';
      h+='</div></div>';
    }
    // Classifica score
    if(d.scores&&d.scores.length){
      h+='<div style="font-size:10px;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;font-family:var(--font-m);margin-bottom:8px">CLASSIFICA SCORE</div>';
      h+='<table style="width:100%;border-collapse:collapse;font-size:12px">';
      h+='<thead><tr style="border-bottom:1px solid var(--gray-700)">';
      h+='<th style="text-align:left;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">#</th>';
      h+='<th style="text-align:left;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">UTENTE</th>';
      h+='<th style="text-align:right;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">BLOCCHI</th>';
      h+='<th style="text-align:right;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">F1</th>';
      h+='<th style="text-align:right;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">F2</th>';
      h+='<th style="text-align:right;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">F3</th>';
      h+='<th style="text-align:right;padding:6px 8px;color:var(--gold);font-family:var(--font-m);font-size:10px">SCORE</th>';
      h+='</tr></thead><tbody>';
      d.scores.forEach(function(sc){
        var isWinner=sc.rank===1&&d.success;
        var rowBg=isWinner?'rgba(73,181,131,.1)':'transparent';
        var rowBorder=isWinner?'1px solid rgba(73,181,131,.3)':'none';
        h+='<tr style="background:'+rowBg+';border:'+rowBorder+'">';
        h+='<td style="padding:6px 8px;color:var(--gray-400)">'+(isWinner?'👑 ':'')+sc.rank+'</td>';
        h+='<td style="padding:6px 8px;color:var(--gray-300);font-family:var(--font-mono);font-size:11px">'+sc.user_id.substring(0,8)+'...</td>';
        h+='<td style="padding:6px 8px;color:#4A9EFF;text-align:right">'+sc.blocks+'</td>';
        h+='<td style="padding:6px 8px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f1).toFixed(3)+'</td>';
        h+='<td style="padding:6px 8px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f2).toFixed(3)+'</td>';
        h+='<td style="padding:6px 8px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f3).toFixed(3)+'</td>';
        h+='<td style="padding:6px 8px;color:'+(isWinner?'#49b583':'var(--white)')+';text-align:right;font-weight:600">'+parseFloat(sc.score).toFixed(4)+'</td>';
        h+='</tr>';
      });
      h+='</tbody></table>';
    }
    if(d.draw_executed){
      h+='<p style="color:var(--gray-500);font-size:11px;margin-top:12px;font-style:italic">Draw già eseguito</p>';
    }
    body.innerHTML=h;
  }catch(e){
    console.error('drawPreview:',e);
    body.innerHTML='<p style="color:#ef4444">Errore: '+e.message+'</p>';
  }
}

async function adExecuteDraw(airdropId,title){
  if(!confirm('⚠️ ESEGUI DRAW per "'+title+'"?\n\nQuesta azione è IRREVERSIBILE.\n- Seleziona il vincitore\n- Distribuisce NFT ai perdenti\n- Aggiorna il treasury\n\nConfermi?'))return;
  if(!confirm('Seconda conferma: sei sicuro di eseguire il draw?'))return;
  var s=getSession();if(!s)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/execute_draw',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_airdrop_id:airdropId})
    });
    var d=await res.json();
    if(!d||!d.ok){showToast('Errore draw: '+(d&&d.error?d.error:'sconosciuto'),'error');return;}
    showToast('Draw completato! '+(d.success?'Vincitore selezionato':'Airdrop annullato — ARIA rimborsati'),'success');
    // Mostra risultati nel modal
    var modal=document.getElementById('draw-modal-bg');
    var body=document.getElementById('draw-modal-body');
    document.getElementById('draw-modal-title').textContent='Risultati Draw';
    var h='<div style="text-align:center;padding:16px">';
    h+='<div style="font-size:28px;margin-bottom:8px">'+(d.success?'🏆':'❌')+'</div>';
    h+='<div style="font-size:18px;font-weight:600;color:'+(d.success?'#49b583':'#ef4444')+';margin-bottom:16px">'+(d.success?'AIRDROP COMPLETATO':'AIRDROP ANNULLATO')+'</div>';
    if(d.success&&d.winner_id){
      h+='<div style="background:rgba(73,181,131,.1);border:1px solid rgba(73,181,131,.3);padding:12px;margin-bottom:12px">';
      h+='<div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m);letter-spacing:1px">VINCITORE</div>';
      h+='<div style="font-family:var(--font-mono);font-size:13px;color:#49b583;margin-top:4px">'+d.winner_id+'</div>';
      h+='<div style="font-size:12px;color:var(--gray-400);margin-top:4px">Score: '+d.winner_score+'</div>';
      h+='</div>';
    }
    h+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px">';
    h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">ARIA</div><div style="color:#4A9EFF;font-weight:600">'+d.aria_incassato.toLocaleString()+'</div></div>';
    h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">EUR</div><div style="color:var(--gold);font-weight:600">€'+d.eur_incassato+'</div></div>';
    h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">NFT DISTRIBUITI</div><div style="color:var(--white);font-weight:600">'+d.nft_distribuiti+'</div></div>';
    h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">FONDO +</div><div style="color:var(--gold);font-weight:600">€'+d.split.fondo_eur+'</div></div>';
    h+='</div>';
    if(d.refund){
      h+='<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);padding:10px;margin-bottom:12px">';
      h+='<div style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">RIMBORSO</div>';
      h+='<div style="color:#ef4444;font-size:13px">'+d.refund.users_refunded+' utenti — '+d.refund.total_aria_refunded+' ARIA rimborsati</div>';
      h+='</div>';
    }
    h+='</div>';
    body.innerHTML=h;
    modal.classList.add('active');
    loadAdminAirdrops();
  }catch(e){
    console.error('executeDraw:',e);
    showToast('Errore draw: '+e.message,'error');
  }
}

function drawModalClose(){document.getElementById('draw-modal-bg').classList.remove('active');}

// ── Test Pool & Simulation ──
async function adCreateTestPool(){
  var s=getSession();if(!s)return;
  var btn=document.getElementById('btn-create-test-pool');
  if(btn){btn.disabled=true;btn.textContent='CREAZIONE...';}
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/create_test_pool',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    var d=await res.json();
    if(d&&d.ok){
      showToast('Test pool: '+d.created+' utenti creati (totale: '+d.total+')','success');
      if(btn){btn.textContent='POOL CREATO ('+d.total+')';}
    }else{
      showToast('Errore: '+(d.error||d.message||'sconosciuto'),'error');
      if(btn){btn.disabled=false;btn.textContent='CREA TEST POOL';}
    }
  }catch(e){
    console.error('createTestPool:',e);
    showToast('Errore: '+e.message,'error');
    if(btn){btn.disabled=false;btn.textContent='CREA TEST POOL';}
  }
}

async function adSimulateRunInModal(){
  var s=getSession();if(!s)return;
  var airdropId=document.getElementById('ad-edit-id').value;
  var pct=parseInt(document.getElementById('ad-sim-pct').value);
  var spread=document.getElementById('ad-sim-spread').checked;
  var btn=document.getElementById('ad-sim-btn-run');
  var result=document.getElementById('ad-sim-result');
  btn.disabled=true;btn.textContent='SIMULAZIONE...';
  result.innerHTML='<p style="color:var(--gray-400)">Acquisto blocchi in corso...</p>';
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/simulate_airdrop_participation',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_airdrop_id:airdropId,p_fill_pct:pct,p_spread_days:spread})
    });
    var d=await res.json();
    if(d&&d.ok){
      var h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px">';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-700);text-align:center"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">BLOCCHI</div><div style="color:#f59e0b;font-weight:600;font-size:16px">'+d.blocks_filled+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-700);text-align:center"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">UTENTI</div><div style="color:#4A9EFF;font-weight:600;font-size:16px">'+d.participants+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:8px;border:1px solid var(--gray-700);text-align:center"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">RIMANENTI</div><div style="color:var(--gray-300);font-weight:600;font-size:16px">'+d.blocks_remaining+'/'+d.total_blocks+'</div></div>';
      h+='</div>';
      result.innerHTML=h;
      showToast('Simulazione: '+d.blocks_filled+' blocchi, '+d.participants+' partecipanti','success');
      // Update info line
      document.getElementById('ad-sim-info').innerHTML='Blocchi: <strong>'+(d.total_blocks-d.blocks_remaining)+'/'+d.total_blocks+'</strong> — Rimanenti: <strong style="color:#f59e0b">'+d.blocks_remaining+'</strong>';
      loadAdminAirdrops();
    }else{
      result.innerHTML='<p style="color:#ef4444">Errore: '+(d.error||'sconosciuto')+'</p>';
    }
  }catch(e){
    console.error('simulate:',e);
    result.innerHTML='<p style="color:#ef4444">'+e.message+'</p>';
  }
  btn.disabled=false;btn.textContent='RUN SIMULATION';
}

// ── Airdrop Analysis ──
async function loadAirdropAnalysis(){
  var s=getSession();if(!s)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_all_airdrops',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    var airdrops=await res.json();
    var tbody=document.getElementById('analysis-body');
    if(!airdrops||!airdrops.length){
      tbody.innerHTML='<tr><td colspan="7" style="color:var(--gray-400)">Nessun airdrop</td></tr>';
      return;
    }
    var html='';
    airdrops.forEach(function(a){
      var statusColor=a.status==='completed'?'#4A9EFF':a.status==='annullato'?'#ef4444':a.status==='sale'?'#49b583':a.status==='presale'?'var(--gold)':'var(--gray-400)';
      var hasParticipants=(a.blocks_sold||0)>0;
      var drawDate=a.draw_executed_at?new Date(a.draw_executed_at).toLocaleDateString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
      var winnerEmail='—';
      if(a.draw_scores&&a.winner_id){
        var scores=typeof a.draw_scores==='string'?JSON.parse(a.draw_scores):a.draw_scores;
        if(scores&&scores[0])winnerEmail=scores[0].user_id?scores[0].user_id.substring(0,8)+'...':'—';
      }
      html+='<tr class="analysis-row" onclick="'+(hasParticipants?'toggleAnalysisDetail(this,\''+a.id+'\')':'')+'" style="cursor:'+(hasParticipants?'pointer':'default')+'">';
      html+='<td style="font-weight:600">'+escHtml(a.title)+(hasParticipants?' <span style="color:var(--gray-500);font-size:10px">&#9660;</span>':'')+'</td>';
      html+='<td>'+escHtml(a.category||'—')+'</td>';
      html+='<td style="color:'+statusColor+'">'+escHtml(a.status)+'</td>';
      html+='<td>'+drawDate+'</td>';
      html+='<td>'+winnerEmail+'</td>';
      html+='<td>'+((a.blocks_sold||0)+'/'+(a.total_blocks||'—'))+'</td>';
      html+='<td>'+(a.winner_score?parseFloat(a.winner_score).toFixed(4):'—')+'</td>';
      html+='</tr>';
    });
    tbody.innerHTML=html;
  }catch(e){
    console.error('loadAirdropAnalysis:',e);
    document.getElementById('analysis-body').innerHTML='<tr><td colspan="7" style="color:#ef4444">Errore: '+escHtml(e.message)+'</td></tr>';
  }
}

async function toggleAnalysisDetail(row,airdropId){
  var next=row.nextElementSibling;
  if(next&&next.classList.contains('analysis-detail')){
    next.remove();
    return;
  }
  document.querySelectorAll('.analysis-detail').forEach(function(el){el.remove();});

  var detailRow=document.createElement('tr');
  detailRow.className='analysis-detail';
  detailRow.innerHTML='<td colspan="7" style="padding:16px;background:rgba(255,255,255,.02);border:1px solid var(--gray-800)"><p style="color:var(--gray-400);text-align:center">Caricamento analisi...</p></td>';
  row.parentNode.insertBefore(detailRow,row.nextSibling);

  var s=getSession();if(!s)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_airdrop_analysis',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_airdrop_id:airdropId})
    });
    var d=await res.json();
    if(!d||!d.ok){
      detailRow.querySelector('td').innerHTML='<p style="color:#ef4444">Errore: '+(d.error||'sconosciuto')+'</p>';
      return;
    }
    var h='';

    // ═══ [1] RISULTATO DRAW ═══
    h+='<div style="font-size:10px;color:#49b583;letter-spacing:1.5px;font-family:var(--font-m);margin-bottom:8px">1. RISULTATO DRAW</div>';
    if(d.draw_executed&&d.scores&&d.scores.length){
      var winner=d.scores[0];
      var winnerDetail=d.participants?d.participants.find(function(p){return p.user_id===winner.user_id}):null;
      var winnerEmail=winnerDetail?winnerDetail.email:winner.user_id.substring(0,12)+'...';
      h+='<div style="background:rgba(73,181,131,.08);border:1px solid rgba(73,181,131,.3);padding:12px;margin-bottom:16px">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      h+='<div><span style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">VINCITORE</span><br><span style="color:#49b583;font-family:var(--font-mono);font-size:13px">'+escHtml(winnerEmail)+'</span></div>';
      h+='<div style="text-align:right"><span style="font-size:10px;color:var(--gray-500);font-family:var(--font-m)">SCORE</span><br><span style="color:#49b583;font-weight:600;font-size:18px">'+parseFloat(winner.score).toFixed(4)+'</span></div>';
      h+='</div>';
      h+='<div style="font-size:12px;color:var(--gray-400);margin-bottom:8px">Decomposizione: <span style="color:#4A9EFF">F1='+parseFloat(winner.f1).toFixed(2)+'</span> | <span style="color:var(--gold)">F2='+parseFloat(winner.f2).toFixed(2)+'</span> | <span style="color:#f59e0b">F3='+parseFloat(winner.f3).toFixed(2)+'</span></div>';
      if(d.winner_explanation){
        h+='<div style="color:var(--gray-200);font-size:12px;font-style:italic;border-top:1px solid rgba(73,181,131,.2);padding-top:8px">'+escHtml(d.winner_explanation)+'</div>';
      }
      h+='</div>';
    }else{
      h+='<div style="color:var(--gray-400);font-size:12px;margin-bottom:16px">Draw non ancora eseguito. Dati calcolati in tempo reale dall\'algoritmo.</div>';
    }

    // ═══ [2] TOP 5 CLASSIFICA SCORE ═══
    if(d.scores&&d.scores.length){
      h+='<div style="font-size:10px;color:var(--gold);letter-spacing:1.5px;font-family:var(--font-m);margin-bottom:8px">2. CLASSIFICA SCORE'+(d.scores.length>5?' (TOP 5 di '+d.scores.length+')':'')+'</div>';
      h+='<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">';
      h+='<thead><tr style="border-bottom:1px solid var(--gray-700)">';
      h+='<th style="text-align:left;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">RANK</th>';
      h+='<th style="text-align:left;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">EMAIL</th>';
      h+='<th style="text-align:right;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">SCORE</th>';
      h+='<th style="text-align:right;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">F1</th>';
      h+='<th style="text-align:right;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">F2</th>';
      h+='<th style="text-align:right;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">F3</th>';
      h+='<th style="text-align:right;padding:6px;color:var(--gold);font-family:var(--font-m);font-size:9px">BLOCCHI</th>';
      h+='</tr></thead><tbody>';
      var top5=d.scores.slice(0,5);
      top5.forEach(function(sc){
        var isWinner=sc.rank===1&&d.draw_executed;
        var rowBg=isWinner?'rgba(73,181,131,.1)':'transparent';
        var pDetail=d.participants?d.participants.find(function(p){return p.user_id===sc.user_id}):null;
        var isTest=pDetail&&pDetail.is_test_user;
        var email=pDetail?pDetail.email:sc.user_id.substring(0,8)+'...';
        var emailTrunc=email.length>25?email.substring(0,25)+'...':email;
        h+='<tr style="background:'+rowBg+';border-bottom:1px solid var(--gray-800)">';
        h+='<td style="padding:5px 6px;color:var(--gray-400)">'+(isWinner?'&#x1F451; ':'')+sc.rank+'</td>';
        h+='<td style="padding:5px 6px;color:var(--gray-300);font-family:var(--font-mono);font-size:10px" title="'+escHtml(email)+'">'+escHtml(emailTrunc)+' <span style="font-size:8px;color:'+(isTest?'#f59e0b':'#4A9EFF')+'">'+(isTest?'TEST':'REAL')+'</span></td>';
        h+='<td style="padding:5px 6px;color:'+(isWinner?'#49b583':'var(--white)')+';text-align:right;font-weight:600">'+parseFloat(sc.score).toFixed(4)+'</td>';
        h+='<td style="padding:5px 6px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f1).toFixed(3)+'</td>';
        h+='<td style="padding:5px 6px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f2).toFixed(3)+'</td>';
        h+='<td style="padding:5px 6px;color:var(--gray-400);text-align:right">'+parseFloat(sc.f3).toFixed(3)+'</td>';
        h+='<td style="padding:5px 6px;color:#4A9EFF;text-align:right">'+sc.blocks+'</td>';
        h+='</tr>';
      });
      h+='</tbody></table>';
    }

    // ═══ [3] DISTRIBUZIONE NFT ═══
    h+='<div style="font-size:10px;color:var(--gold);letter-spacing:1.5px;font-family:var(--font-m);margin-bottom:8px">3. DISTRIBUZIONE NFT</div>';
    if(d.nft){
      h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">PERDENTI CON NFT</div><div style="color:var(--gold);font-weight:600;font-size:16px">'+d.nft.nft_recipients+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">NFT TOTALI</div><div style="color:var(--gold);font-weight:600;font-size:16px">'+d.nft.nft_distributed+'</div></div>';
      var deltaPct=d.nft.treasury_before_eur>0?((d.nft.treasury_delta_eur/d.nft.treasury_before_eur)*100).toFixed(1):'—';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">TREASURY</div><div style="color:#49b583;font-weight:600;font-size:14px">&euro;'+parseFloat(d.nft.treasury_before_eur).toFixed(2)+' &rarr; &euro;'+parseFloat(d.nft.treasury_after_eur).toFixed(2)+'</div><div style="font-size:10px;color:#49b583">(+&euro;'+parseFloat(d.nft.treasury_delta_eur).toFixed(2)+' / +'+deltaPct+'%)</div></div>';
      h+='</div>';
    }else{
      h+='<div style="color:var(--gray-400);font-size:12px;margin-bottom:16px">NFT non ancora distribuiti (draw non eseguito).</div>';
    }

    // ═══ [4] SPLIT ECONOMICA ═══
    h+='<div style="font-size:10px;color:var(--gold);letter-spacing:1.5px;font-family:var(--font-m);margin-bottom:8px">4. SPLIT ECONOMICA</div>';
    if(d.split){
      h+='<div style="display:grid;grid-template-columns:1fr repeat(4,1fr);gap:8px;margin-bottom:8px">';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">ARIA TOTALE</div><div style="color:#4A9EFF;font-weight:600;font-size:16px">'+d.aria_incassato.toLocaleString()+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">VENDITORE (67,99%)</div><div style="color:#49b583;font-weight:600">&euro;'+parseFloat(d.split.venditore_eur).toFixed(2)+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">FONDO (22%)</div><div style="color:var(--gold);font-weight:600">&euro;'+parseFloat(d.split.fondo_eur).toFixed(2)+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">AIROOBI (10%)</div><div style="color:var(--white);font-weight:600">&euro;'+parseFloat(d.split.airoobi_eur).toFixed(2)+'</div></div>';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-700)"><div style="font-size:9px;color:var(--gray-500);font-family:var(--font-m)">CHARITY (0,01%)</div><div style="color:var(--gray-300);font-weight:600">&euro;'+parseFloat(d.split.charity_eur).toFixed(4)+'</div></div>';
      h+='</div>';
    }else{
      h+='<div style="color:var(--gray-400);font-size:12px;margin-bottom:16px">Split non disponibile (draw non eseguito).</div>';
    }

    detailRow.querySelector('td').innerHTML=h;
  }catch(e){
    console.error('analysisDetail:',e);
    detailRow.querySelector('td').innerHTML='<p style="color:#ef4444">'+e.message+'</p>';
  }
}

// ── Test Users Table ──
async function loadTestUsersTable(){
  var s=getSession();if(!s)return;
  var tbody=document.getElementById('test-users-body');
  var countEl=document.getElementById('test-users-count');
  tbody.innerHTML='<tr><td colspan="7" style="color:var(--gray-400)">Caricamento...</td></tr>';
  try{
    var profiles=await sbGet('profiles?is_test_user=eq.true&select=id,email,total_points,created_at&order=total_points.desc&limit=200',s.access_token);
    if(!profiles||!profiles.length){
      tbody.innerHTML='<tr><td colspan="7" style="color:var(--gray-400)">Nessun utente test</td></tr>';
      countEl.textContent='0 utenti';
      return;
    }
    // Get participation stats for test users
    var parts=await sbGet('airdrop_participations?select=user_id,blocks_count,aria_spent,airdrop_id',s.access_token);
    var partMap={};
    if(parts)parts.forEach(function(p){
      if(!partMap[p.user_id])partMap[p.user_id]={airdrops:{},blocks:0,aria:0};
      partMap[p.user_id].airdrops[p.airdrop_id]=true;
      partMap[p.user_id].blocks+=(p.blocks_count||0);
      partMap[p.user_id].aria+=(p.aria_spent||0);
    });
    var html='';
    profiles.forEach(function(u,i){
      var pm=partMap[u.id]||{airdrops:{},blocks:0,aria:0};
      var nAirdrops=Object.keys(pm.airdrops).length;
      var regDate=new Date(u.created_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short'});
      html+='<tr>';
      html+='<td style="color:var(--gray-500)">'+(i+1)+'</td>';
      html+='<td style="font-family:var(--font-m);font-size:10px">'+escHtml(u.email)+'</td>';
      html+='<td style="color:var(--aria)">'+u.total_points.toLocaleString()+'</td>';
      html+='<td>'+regDate+'</td>';
      html+='<td style="color:'+(nAirdrops>0?'var(--gold)':'var(--gray-600)')+'">'+nAirdrops+'</td>';
      html+='<td style="color:#4A9EFF">'+(pm.blocks||0)+'</td>';
      html+='<td style="color:#f59e0b">'+(pm.aria||0)+'</td>';
      html+='</tr>';
    });
    tbody.innerHTML=html;
    countEl.textContent=profiles.length+' utenti (top 200 per ARIA)';
  }catch(e){
    console.error('loadTestUsers:',e);
    tbody.innerHTML='<tr><td colspan="7" style="color:#ef4444">'+escHtml(e.message)+'</td></tr>';
  }
}

// ── Fairness Analysis ──
async function loadFairnessAirdrops(){
  var s=getSession();if(!s)return;
  var sel=document.getElementById('fairness-airdrop-select');
  if(!sel)return;
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_all_airdrops',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    var airdrops=await res.json();
    if(!airdrops)return;
    sel.innerHTML='<option value="">— Seleziona —</option>';
    airdrops.forEach(function(a){
      if(a.blocks_sold>0){
        var opt=document.createElement('option');
        opt.value=a.id;
        opt.textContent=a.title+' ('+a.status+', '+a.blocks_sold+'/'+a.total_blocks+' blocchi)';
        sel.appendChild(opt);
      }
    });
  }catch(e){}
}

async function loadFairnessAnalysis(){
  var s=getSession();if(!s)return;
  var sel=document.getElementById('fairness-airdrop-select');
  var airdropId=sel.value;
  if(!airdropId){showToast('Seleziona un airdrop','warning');return;}
  var resultEl=document.getElementById('fairness-result');
  resultEl.innerHTML='<p style="color:var(--gray-400)">Calcolo in corso...</p>';
  try{
    var res=await fetch(SB_URL+'/rest/v1/rpc/get_fairness_analysis',{
      method:'POST',
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({p_airdrop_id:airdropId})
    });
    var d=await res.json();
    if(!d||!d.ok){
      resultEl.innerHTML='<p style="color:#ef4444">Errore: '+(d.error||d.warning||'sconosciuto')+'</p>';
      return;
    }
    var fs=d.fairness_score;
    var gradeColor=fs.grade==='A'?'#49b583':fs.grade==='B'?'#4A9EFF':fs.grade==='C'?'var(--gold)':fs.grade==='D'?'#f59e0b':'#ef4444';

    var h='';
    // Big score
    h+='<div style="display:flex;align-items:center;gap:24px;margin-bottom:20px;padding:20px;background:rgba(255,255,255,.02);border:1px solid var(--gray-800)">';
    h+='<div style="text-align:center">';
    h+='<div style="font-family:var(--font-m);font-size:48px;font-weight:300;color:'+gradeColor+';line-height:1">'+fs.value+'</div>';
    h+='<div style="font-family:var(--font-m);font-size:10px;letter-spacing:2px;color:var(--gray-500);margin-top:4px">FAIRNESS SCORE</div>';
    h+='</div>';
    h+='<div style="text-align:center">';
    h+='<div style="font-family:var(--font-h);font-size:36px;font-weight:300;color:'+gradeColor+'">'+fs.grade+'</div>';
    h+='<div style="font-family:var(--font-m);font-size:10px;color:var(--gray-400)">'+fs.label+'</div>';
    h+='</div>';
    h+='<div style="flex:1;font-size:12px;color:var(--gray-400)">';
    h+='<strong>'+d.participants+'</strong> partecipanti · <strong>'+d.total_blocks_sold+'</strong> blocchi venduti<br>';
    h+='Gini: <strong>'+d.gini.value+'</strong> ('+d.gini.interpretation+')';
    h+='</div>';
    h+='</div>';

    // Sub-scores bar chart
    var subs=d.sub_scores;
    var subLabels={gini:'Gini',conc_top1:'Top 1',conc_top5:'Top 5',conc_top10:'Top 10',gap_1_2:'Gap 1°-2°',factor_bal:'Factor Bal.',spread:'Spread',diversity:'Diversity'};
    var subWeights={gini:25,conc_top1:15,conc_top5:10,conc_top10:5,gap_1_2:20,factor_bal:15,spread:5,diversity:5};
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">';
    Object.keys(subLabels).forEach(function(k){
      var val=subs[k];
      var barColor=val>=70?'#49b583':val>=50?'var(--gold)':val>=30?'#f59e0b':'#ef4444';
      h+='<div style="background:var(--gray-900);padding:10px;border:1px solid var(--gray-800)">';
      h+='<div style="font-family:var(--font-m);font-size:8px;letter-spacing:1.5px;color:var(--gray-500)">'+subLabels[k]+' <span style="color:var(--gray-600)">('+subWeights[k]+'%)</span></div>';
      h+='<div style="font-family:var(--font-m);font-size:18px;font-weight:600;color:'+barColor+'">'+val+'</div>';
      h+='<div style="height:3px;background:var(--gray-800);margin-top:6px"><div style="height:100%;width:'+val+'%;background:'+barColor+';transition:width .5s"></div></div>';
      h+='</div>';
    });
    h+='</div>';

    // Detail cards
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';

    // Concentration
    var c=d.concentration;
    h+='<div style="background:var(--gray-900);padding:14px;border:1px solid var(--gray-800)">';
    h+='<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gold);margin-bottom:8px">CONCENTRAZIONE BLOCCHI</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Top 1: <strong>'+(c.top1_share*100).toFixed(1)+'%</strong> ('+c.top1_blocks+' blocchi)</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Top 5: <strong>'+(c.top5_share*100).toFixed(1)+'%</strong> ('+c.top5_blocks+' blocchi)</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Top 10: <strong>'+(c.top10_share*100).toFixed(1)+'%</strong> ('+c.top10_blocks+' blocchi)</div>';
    h+='</div>';

    // Factor balance
    var fb=d.factor_balance;
    h+='<div style="background:var(--gray-900);padding:14px;border:1px solid var(--gray-800)">';
    h+='<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gold);margin-bottom:8px">BILANCIAMENTO FATTORI (VINCITORE)</div>';
    h+='<div style="font-size:12px;color:#4A9EFF">F1 Blocchi: <strong>'+fb.f1_pct+'%</strong> (raw: '+fb.winner_f1+')</div>';
    h+='<div style="font-size:12px;color:var(--gold)">F2 Fedeltà: <strong>'+fb.f2_pct+'%</strong> (raw: '+fb.winner_f2+')</div>';
    h+='<div style="font-size:12px;color:#f59e0b">F3 Seniority: <strong>'+fb.f3_pct+'%</strong> (raw: '+fb.winner_f3+')</div>';
    h+='<div style="font-size:11px;color:var(--gray-400);margin-top:6px">Dominante: <strong style="color:var(--white)">'+fb.dominant+'</strong> · Sbilanciamento: '+(fb.imbalance*100).toFixed(1)+'%</div>';
    h+='</div>';

    // Score spread
    var ss=d.score_spread;
    h+='<div style="background:var(--gray-900);padding:14px;border:1px solid var(--gray-800)">';
    h+='<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gold);margin-bottom:8px">DISTRIBUZIONE SCORE</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Media: <strong>'+ss.mean+'</strong> · Std dev: <strong>'+ss.std_dev+'</strong></div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Min: '+ss.min+' · Max: '+ss.max+'</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Gap 1°-2°: <strong style="color:'+(ss.gap_1st_2nd>0.1?'#f59e0b':'#49b583')+'">'+ss.gap_1st_2nd+'</strong></div>';
    h+='</div>';

    // Diversity
    var dv=d.diversity;
    h+='<div style="background:var(--gray-900);padding:14px;border:1px solid var(--gray-800)">';
    h+='<div style="font-family:var(--font-m);font-size:9px;letter-spacing:1.5px;color:var(--gold);margin-bottom:8px">DIVERSITÀ PARTECIPAZIONE</div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Acquirenti unici: <strong>'+dv.unique_buyers+'</strong></div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Media blocchi/utente: <strong>'+dv.avg_blocks_per_buyer+'</strong></div>';
    h+='<div style="font-size:12px;color:var(--gray-300)">Rapporto diversità: <strong>'+(dv.ratio*100).toFixed(1)+'%</strong></div>';
    h+='</div>';

    h+='</div>';

    resultEl.innerHTML=h;
  }catch(e){
    console.error('fairness:',e);
    resultEl.innerHTML='<p style="color:#ef4444">'+escHtml(e.message)+'</p>';
  }
}

// ── Engine Config ──
async function loadEngineConfig(){
  var s=getSession();if(!s)return;
  try{
    var rows=await sbGet('airdrop_config?order=key.asc',s.access_token);
    var tbody=document.getElementById('engine-config-body');
    if(!rows||!rows.length){tbody.innerHTML='<tr><td colspan="3" style="color:var(--gray-400)">Nessuna config trovata</td></tr>';return;}
    var h='';
    rows.forEach(function(r){
      var isSplit=r.key.indexOf('split_')===0;
      var isWeight=r.key.indexOf('score_')===0;
      var isNft=r.key.indexOf('nft_')===0;
      var tagColor=isSplit?'#49b583':isWeight?'#4A9EFF':isNft?'var(--gold)':'var(--gray-400)';
      var tag=isSplit?'SPLIT':isWeight?'SCORE':isNft?'NFT':'SYS';
      h+='<tr>';
      h+='<td><span style="background:'+tagColor+';color:#000;padding:1px 5px;font-size:9px;font-family:var(--font-m);letter-spacing:1px;margin-right:6px">'+tag+'</span>'+escHtml(r.key)+'</td>';
      h+='<td><input type="text" value="'+escHtml(r.value)+'" data-key="'+escHtml(r.key)+'" class="engine-cfg-input" style="background:var(--gray-900);border:1px solid var(--gray-700);color:var(--white);padding:4px 8px;font-family:var(--font-mono);font-size:12px;width:100px"></td>';
      h+='<td style="color:var(--gray-500);font-size:11px">'+escHtml(r.description||'')+'</td>';
      h+='</tr>';
    });
    tbody.innerHTML=h;
  }catch(e){
    console.error('loadEngineConfig:',e);
  }
}

async function saveEngineConfig(){
  var s=getSession();if(!s)return;
  var inputs=document.querySelectorAll('.engine-cfg-input');
  var updates=[];
  inputs.forEach(function(inp){updates.push({key:inp.dataset.key,value:inp.value});});
  try{
    for(var i=0;i<updates.length;i++){
      await fetch(SB_URL+'/rest/v1/airdrop_config?key=eq.'+encodeURIComponent(updates[i].key),{
        method:'PATCH',
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({value:updates[i].value,updated_at:new Date().toISOString()})
      });
    }
    showToast('Engine config salvata','success');
  }catch(e){
    console.error('saveEngineConfig:',e);
    showToast('Errore salvataggio config: '+e.message,'error');
  }
}

// ── Cost Tracker ──
var CT_STATUS_LABELS={'da_pagare':'Da pagare','pagato':'Pagato','free':'Free','freemium':'Freemium','a_pagamento':'A pagamento','abbandonato':'Abbandonato','in_ritardo':'In ritardo','non_pagato':'Non pagato'};
var CT_CAT_LABELS={'fisso':'Fisso','variabile':'Variabile','una_tantum':'Una tantum'};
var CT_FREQ_LABELS={'mensile':'Mensile','annuale':'Annuale','una_tantum':'Una tantum'};

async function loadCostTracker(){
  var s=getSession();if(!s)return;
  var t=s.access_token;
  var monthEl=document.getElementById('ct-month-filter');
  if(!monthEl.value){var now=new Date();monthEl.value=now.getFullYear()+'-'+(''+(now.getMonth()+1)).padStart(2,'0');}
  var ym=monthEl.value;
  var startDate=ym+'-01';
  var endY=parseInt(ym.split('-')[0]),endM=parseInt(ym.split('-')[1]);
  if(endM===12){endY++;endM=1;}else{endM++;}
  var endDate=endY+'-'+((''+endM).padStart(2,'0'))+'-01';

  try{
    var rows=await sbGet('cost_tracker?ref_month=gte.'+startDate+'&ref_month=lt.'+endDate+'&order=name.asc',t);
    var allRows=await sbGet('cost_tracker?select=amount,frequency,status,ref_month&order=ref_month.asc',t);
    renderCostTable(rows||[]);
    calcCostSummary(rows||[],allRows||[]);
  }catch(e){console.error('CT load error:',e);}
}

function renderCostTable(rows){
  var tbody=document.getElementById('ct-body');
  if(!rows.length){tbody.innerHTML='<tr><td colspan="8" style="color:var(--gray-400)">Nessun costo per questo mese.</td></tr>';return;}
  tbody.innerHTML=rows.map(function(r){
    var month=r.ref_month?new Date(r.ref_month+'T00:00:00').toLocaleDateString('it-IT',{month:'short',year:'numeric'}):'—';
    var paid=r.paid_date?new Date(r.paid_date+'T00:00:00').toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}):'—';
    return '<tr>'+
      '<td>'+(r.name||'')+(r.notes?'<br><span style="font-size:10px;color:var(--gray-400)">'+r.notes+'</span>':'')+'</td>'+
      '<td>'+(CT_CAT_LABELS[r.category]||r.category)+'</td>'+
      '<td style="font-family:var(--font-m)">€'+(parseFloat(r.amount)||0).toFixed(2)+'</td>'+
      '<td>'+(CT_FREQ_LABELS[r.frequency]||r.frequency)+'</td>'+
      '<td>'+month+'</td>'+
      '<td><span class="ct-status ct-s-'+r.status+'">'+(CT_STATUS_LABELS[r.status]||r.status)+'</span></td>'+
      '<td>'+paid+'</td>'+
      '<td class="ct-actions"><button onclick="ctEdit(\''+r.id+'\')">EDIT</button></td>'+
    '</tr>';
  }).join('');
}

function calcCostSummary(monthRows,allRows){
  var prev=0,paid=0;
  monthRows.forEach(function(r){
    var a=parseFloat(r.amount)||0;
    if(r.status!=='abbandonato')prev+=a;
    if(r.status==='pagato')paid+=a;
  });
  document.getElementById('ct-total-prev').textContent='€'+prev.toFixed(2);
  document.getElementById('ct-total-paid').textContent='€'+paid.toFixed(2);
  // Annual estimate: sum all monthly + annuals prorated
  var yearTotal=0;
  allRows.forEach(function(r){
    var a=parseFloat(r.amount)||0;
    if(r.status==='abbandonato')return;
    if(r.frequency==='mensile')yearTotal+=a;
    else if(r.frequency==='annuale')yearTotal+=a/12;
    else yearTotal+=a/12;
  });
  // Use unique months count to get avg monthly, then x12
  var months={};allRows.forEach(function(r){if(r.status!=='abbandonato')months[r.ref_month]=true;});
  var nMonths=Object.keys(months).length||1;
  var totalAll=0;allRows.forEach(function(r){if(r.status!=='abbandonato')totalAll+=parseFloat(r.amount)||0;});
  var annualEst=(totalAll/nMonths)*12;
  document.getElementById('ct-total-year').textContent='€'+annualEst.toFixed(2);
}

function ctOpenModal(editData){
  document.getElementById('ct-edit-id').value='';
  document.getElementById('ct-name').value='';
  document.getElementById('ct-category').value='fisso';
  document.getElementById('ct-amount').value='';
  document.getElementById('ct-frequency').value='mensile';
  document.getElementById('ct-ref-month').value=document.getElementById('ct-month-filter').value;
  document.getElementById('ct-status').value='da_pagare';
  document.getElementById('ct-paid-date').value='';
  document.getElementById('ct-notes').value='';
  document.getElementById('ct-del-btn').style.display='none';
  document.getElementById('ct-modal-title').textContent='Aggiungi costo';
  if(editData){
    document.getElementById('ct-edit-id').value=editData.id;
    document.getElementById('ct-name').value=editData.name||'';
    document.getElementById('ct-category').value=editData.category||'fisso';
    document.getElementById('ct-amount').value=editData.amount||'';
    document.getElementById('ct-frequency').value=editData.frequency||'mensile';
    document.getElementById('ct-ref-month').value=editData.ref_month?editData.ref_month.substring(0,7):'';
    document.getElementById('ct-status').value=editData.status||'da_pagare';
    document.getElementById('ct-paid-date').value=editData.paid_date||'';
    document.getElementById('ct-notes').value=editData.notes||'';
    document.getElementById('ct-del-btn').style.display='';
    document.getElementById('ct-modal-title').textContent='Modifica costo';
  }
  document.getElementById('ct-modal-bg').classList.add('active');
}

function ctCloseModal(){document.getElementById('ct-modal-bg').classList.remove('active');}

async function ctEdit(id){
  var s=getSession();if(!s)return;
  try{
    var rows=await sbGet('cost_tracker?id=eq.'+id,s.access_token);
    if(rows&&rows.length)ctOpenModal(rows[0]);
  }catch(e){console.error('CT edit load:',e);}
}

async function ctSave(){
  var s=getSession();if(!s)return;
  var id=document.getElementById('ct-edit-id').value;
  var refMonth=document.getElementById('ct-ref-month').value;
  var data={
    name:document.getElementById('ct-name').value.trim(),
    category:document.getElementById('ct-category').value,
    amount:parseFloat(document.getElementById('ct-amount').value)||0,
    frequency:document.getElementById('ct-frequency').value,
    ref_month:refMonth?refMonth+'-01':null,
    status:document.getElementById('ct-status').value,
    paid_date:document.getElementById('ct-paid-date').value||null,
    notes:document.getElementById('ct-notes').value.trim()||null,
    updated_at:new Date().toISOString()
  };
  if(!data.name){alert('Inserisci un nome');return;}
  try{
    if(id){
      await sbPatch('cost_tracker?id=eq.'+id,data,s.access_token);
    }else{
      // POST with auth token for RLS
      var res=await fetch(SB_URL+'/rest/v1/cost_tracker',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(data)});
      if(!res.ok)throw new Error('POST failed: '+res.status);
    }
    ctCloseModal();
    loadCostTracker();
  }catch(e){console.error('CT save error:',e);alert('Errore salvataggio: '+e.message);}
}

async function ctDelete(){
  if(!confirm('Eliminare questo costo?'))return;
  var s=getSession();if(!s)return;
  var id=document.getElementById('ct-edit-id').value;
  if(!id)return;
  try{
    await sbDel('cost_tracker?id=eq.'+id,s.access_token);
    ctCloseModal();
    loadCostTracker();
  }catch(e){console.error('CT delete error:',e);alert('Errore eliminazione: '+e.message);}
}

// ── Admin Treasury (persist to DB) ──
async function loadAdminTreasury(){
  var s=getSession();if(!s)return;
  var tk=s.access_token;
  try{
    var rows=await sbGet('treasury_stats?select=*&order=created_at.desc&limit=1',tk);
    var t=(rows&&rows.length)?rows[0]:{};
    // Populate first form (NFT Metrics)
    var i1=document.getElementById('adm-input-treasury');if(i1)i1.value=t.balance_eur||0;
    var i2=document.getElementById('adm-input-minted');if(i2)i2.value=t.nft_minted||0;
    var i4=document.getElementById('adm-input-maxsupply');if(i4)i4.value=t.nft_max_supply||1000;
    // Populate second form (Tokenomics)
    var i5=document.getElementById('adm-treasury-input');if(i5)i5.value=t.balance_eur||0;
    // Populate revenue cards
    var ra=document.getElementById('adm-revenue-ads');if(ra)ra.textContent='$'+(parseFloat(t.revenue_ads)||0).toFixed(2);
    var rs=document.getElementById('adm-revenue-adsense');if(rs)rs.textContent='$'+(parseFloat(t.revenue_adsense)||0).toFixed(2);
    var tb=document.getElementById('adm-treasury-balance');if(tb)tb.textContent='€'+(parseFloat(t.balance_eur)||0).toFixed(2);

    // Auto-calculate CIRCOLANTE (NFT) from nft_rewards
    try{
      var nfts=await sbGet('nft_rewards?select=id,nft_type,user_id',tk);
      // Circulating/minted = solo NFT_EARN (reward), non badge come ALPHA_BRAVE
      var earnOnly=nfts?nfts.filter(function(n){return n.nft_type==='NFT_EARN'}):[];
      var nftCount=earnOnly.length;
      var i3=document.getElementById('adm-input-circulating');if(i3)i3.value=nftCount;
      var i2m=document.getElementById('adm-input-minted');if(i2m)i2m.value=nftCount;
      var nu=document.getElementById('adm-nft-updated');if(nu)nu.textContent='Aggiornato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
      // NFT breakdown per tipo — GROUP BY nft_type da nft_rewards
      var bTbody=document.getElementById('adm-nft-breakdown');
      if(bTbody){
        bTbody.innerHTML='<tr><td colspan="3" style="color:var(--gray-400)"><span style="display:inline-block;width:12px;height:12px;border:2px solid var(--gray-600);border-top-color:var(--gold);border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px"></span>Caricamento...</td></tr>';
        var breakdown={};var owners={};
        if(nfts&&nfts.length){
          nfts.forEach(function(n){
            var tp=n.nft_type||'unknown';
            breakdown[tp]=(breakdown[tp]||0)+1;
            if(!owners[tp])owners[tp]={};
            if(n.user_id)owners[tp][n.user_id]=true;
          });
        }
        var types=Object.keys(breakdown);
        if(types.length>0){
          types.sort(function(a,b){return breakdown[b]-breakdown[a]});
          bTbody.innerHTML=types.map(function(tp){
            var cnt=breakdown[tp];
            var ownerCount=Object.keys(owners[tp]||{}).length;
            return '<tr><td>'+tp+'</td><td>'+ownerCount+'</td><td>'+cnt+'</td></tr>';
          }).join('');
        }else{
          bTbody.innerHTML='<tr><td colspan="3" style="color:var(--gray-400)">Nessun NFT emesso ancora</td></tr>';
        }
      // Update NFT Tracker cards
      var braveEl=document.getElementById('adm-nft-brave-count');
      if(braveEl)braveEl.textContent=breakdown['NFT_ALPHA_BRAVE']||0;
      var earnEl=document.getElementById('adm-nft-earn-count');
      if(earnEl)earnEl.textContent=breakdown['NFT_EARN']||0;
      }
    }catch(e){console.error('NFT auto-calc error:',e);}

    // Auto-calculate ARIA IN CIRCOLAZIONE from profiles.total_points
    try{
      var ariaProfiles=await sbGet('profiles?select=total_points',tk);
      var totalAria=ariaProfiles?ariaProfiles.reduce(function(a,b){return a+(b.total_points||0)},0):0;
      var i6=document.getElementById('adm-aico-input');if(i6)i6.value=totalAria;
      var au=document.getElementById('adm-aria-updated');if(au)au.textContent='Aggiornato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    }catch(e){console.error('ARIA auto-calc error:',e);}

    // Trigger calculations
    recalcNFTValue();
    updateNftMetrics();
  }catch(e){console.error('Admin treasury load:',e);}
}

async function refreshAriaCircolante(){
  var s=getSession();if(!s)return;
  try{
    var p=await sbGet('profiles?select=total_points',s.access_token);
    var total=p?p.reduce(function(a,b){return a+(b.total_points||0)},0):0;
    var i=document.getElementById('adm-aico-input');if(i)i.value=total;
    var u=document.getElementById('adm-aria-updated');if(u)u.textContent='Aggiornato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    recalcNFTValue();
  }catch(e){console.error('Refresh ARIA error:',e);}
}
async function refreshNftCircolante(){
  var s=getSession();if(!s)return;
  try{
    var nfts=await sbGet('nft_rewards?select=id,nft_type,user_id',s.access_token);
    var earnOnly=nfts?nfts.filter(function(n){return n.nft_type==='NFT_EARN'}):[];
    var cnt=earnOnly.length;
    var i=document.getElementById('adm-input-circulating');if(i)i.value=cnt;
    var i2m=document.getElementById('adm-input-minted');if(i2m)i2m.value=cnt;
    var u=document.getElementById('adm-nft-updated');if(u)u.textContent='Aggiornato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    // Aggiorna anche la tabella NFT per tipo
    var bTbody=document.getElementById('adm-nft-breakdown');
    if(bTbody&&nfts){
      var breakdown={};var owners={};
      nfts.forEach(function(n){
        var tp=n.nft_type||'unknown';
        breakdown[tp]=(breakdown[tp]||0)+1;
        if(!owners[tp])owners[tp]={};
        if(n.user_id)owners[tp][n.user_id]=true;
      });
      var types=Object.keys(breakdown);
      if(types.length>0){
        types.sort(function(a,b){return breakdown[b]-breakdown[a]});
        bTbody.innerHTML=types.map(function(tp){
          return '<tr><td>'+tp+'</td><td>'+Object.keys(owners[tp]||{}).length+'</td><td>'+breakdown[tp]+'</td></tr>';
        }).join('');
      }else{
        bTbody.innerHTML='<tr><td colspan="3" style="color:var(--gray-400)">Nessun NFT emesso ancora</td></tr>';
      }
      // Update NFT Tracker cards
      var braveEl=document.getElementById('adm-nft-brave-count');
      if(braveEl)braveEl.textContent=breakdown['NFT_ALPHA_BRAVE']||0;
      var earnEl=document.getElementById('adm-nft-earn-count');
      if(earnEl)earnEl.textContent=breakdown['NFT_EARN']||0;
    }
    updateNftMetrics();
  }catch(e){console.error('Refresh NFT error:',e);}
}

function recalcNFTValue(){
  var treasury=parseFloat(document.getElementById('adm-treasury-input')?.value)||0;
  var aria=parseInt(document.getElementById('adm-aico-input')?.value)||0;
  var price=0.10;
  // Update coin metrics cards
  var cs=document.getElementById('adm-coin-supply');if(cs)cs.textContent=aria.toLocaleString();
  var mc=document.getElementById('adm-coin-marketcap');if(mc)mc.textContent='€'+(aria*price).toFixed(2);
  var fdv=document.getElementById('adm-coin-fdv');if(fdv)fdv.textContent='€'+(10000000*price).toFixed(2);
  var tr=document.getElementById('adm-coin-treasury-ratio');
  if(tr)tr.textContent=aria>0?((treasury/(aria*price))*100).toFixed(1)+'%':'—%';
  // ARIA per NFT
  var minted=parseInt(document.getElementById('adm-input-minted')?.value)||0;
  var nr=document.getElementById('adm-coin-nft-ratio');
  if(nr)nr.textContent=minted>0?Math.round(aria/minted):'—';
  // Backing ratio
  var br=document.getElementById('adm-coin-backing');
  if(br)br.textContent=aria>0?((treasury*0.95/(aria*price))*100).toFixed(1)+'%':'—%';
  // Treasury cards
  var nt=document.getElementById('adm-nft-treasury');if(nt)nt.textContent='€'+treasury.toFixed(2);
}

function updateNftMetrics(){
  var treasury=parseFloat(document.getElementById('adm-input-treasury')?.value)||0;
  var minted=parseInt(document.getElementById('adm-input-minted')?.value)||0;
  var circulating=parseInt(document.getElementById('adm-input-circulating')?.value)||0;
  var maxSupply=parseInt(document.getElementById('adm-input-maxsupply')?.value)||1000;
  var nftValue=minted>0?treasury/minted:0;
  // Update cards
  var v1=document.getElementById('adm-treasury-val');if(v1)v1.textContent='€ '+treasury.toFixed(2);
  var v2=document.getElementById('adm-nft-minted');if(v2)v2.textContent=minted;
  var v2b=document.getElementById('adm-nft-minted-2');if(v2b)v2b.textContent=minted;
  var v3=document.getElementById('adm-nft-value');if(v3)v3.textContent='€ '+nftValue.toFixed(2);
  var v3b=document.getElementById('adm-nft-value-2');if(v3b)v3b.textContent='€ '+nftValue.toFixed(2);
  var v4=document.getElementById('adm-nft-marketcap');if(v4)v4.textContent='€ '+(nftValue*circulating).toFixed(2);
  var v5=document.getElementById('adm-nft-circulating');if(v5)v5.textContent=circulating+' NFT';
  var v6=document.getElementById('adm-nft-fully-diluted');if(v6)v6.textContent='€ '+(nftValue*maxSupply).toFixed(2);
  var v7=document.getElementById('adm-nft-buyback');if(v7)v7.textContent='€ '+(nftValue*0.95).toFixed(2);
  var v8=document.getElementById('adm-nft-upside');if(v8)v8.textContent='€ '+(nftValue*0.05).toFixed(2);
  // Sync treasury input in second form
  var i5=document.getElementById('adm-treasury-input');if(i5&&i5.value!=treasury)i5.value=treasury;
  recalcNFTValue();
}

async function saveAdminTokenomics(){
  var s=getSession();if(!s)return;
  // Refresh AUTO values before saving
  await refreshAriaCircolante();
  await refreshNftCircolante();
  recalcNFTValue();
  updateNftMetrics();
  // Build payload with ALL values (manual + auto)
  var data={
    balance_eur:parseFloat(document.getElementById('adm-input-treasury')?.value)||0,
    nft_minted:parseInt(document.getElementById('adm-input-minted')?.value)||0,
    nft_circulating:parseInt(document.getElementById('adm-input-circulating')?.value)||0,
    nft_max_supply:parseInt(document.getElementById('adm-input-maxsupply')?.value)||1000,
    aico_circulating:parseInt(document.getElementById('adm-aico-input')?.value)||0,
    updated_at:new Date().toISOString()
  };
  try{
    var rows=await sbGet('treasury_stats?select=id&order=created_at.desc&limit=1',s.access_token);
    if(rows&&rows.length){
      await sbPatch('treasury_stats?id=eq.'+rows[0].id,data,s.access_token);
    }else{
      var postRes=await fetch(SB_URL+'/rest/v1/treasury_stats',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+s.access_token,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(data)});
      if(!postRes.ok)throw new Error('POST failed: '+postRes.status+' '+(await postRes.text()));
    }
    // Feedback
    document.querySelectorAll('[onclick*="saveAdminTokenomics"]').forEach(function(btn){
      var orig=btn.textContent;btn.textContent='SALVATO ✓';btn.style.background='#49b583';
      setTimeout(function(){btn.textContent=orig;btn.style.background='var(--gold)';},1500);
    });
  }catch(e){console.error('Save treasury error:',e);alert('Errore salvataggio: '+e.message);}
}


// ── Roadmap Detail ──
var RD_PHASES={
  alpha:{
    tag:'Alpha',active:true,
    title_it:'Fase Alpha — Alpha Brave',
    title_en:'Alpha Phase — Alpha Brave',
    desc_it:'La prima fase di AIROOBI. Sei tra i primi 1.000 utenti a testare la piattaforma. Ogni azione che fai genera ARIA reali. Chi partecipa in Alpha accumula di più e ottiene vantaggi permanenti su tutte le fasi successive.',
    desc_en:'The first phase of AIROOBI. You are among the first 1,000 users to test the platform. Every action you take generates real ARIA. Alpha participants accumulate more and get permanent advantages in all subsequent phases.',
    features_it:['Guadagna ARIA con check-in e referral','Badge Fondatore NFT gratuito per i primi 1.000','Accesso prioritario ai primi airdrop','Moltiplicatori ARIA più alti di qualsiasi tier futuro','Partecipazione alla governance community'],
    features_en:['Earn ARIA through check-ins and referrals','Free Founder NFT Badge for the first 1,000','Priority access to first airdrops','Highest ARIA multipliers of any future tier','Community governance participation'],
    showStats:true
  },
  beta:{
    tag:'Beta',active:false,
    title_it:'Fase Beta — Community Bootstrap',
    title_en:'Beta Phase — Community Bootstrap',
    desc_it:'DApp navigabile con dati simulati. Primi airdrop di test. Community building e programma referral attivo. Target: 5.000 utenti.',
    desc_en:'Navigable DApp with simulated data. First test airdrops. Community building and active referral program. Target: 5,000 users.',
    features_it:['Marketplace con oggetti simulati','Primi airdrop di test (no valore reale)','Sistema referral potenziato','Community voting sulle categorie','NFT Reveal Event per i primi supporter'],
    features_en:['Marketplace with simulated objects','First test airdrops (no real value)','Enhanced referral system','Community voting on categories','NFT Reveal Event for early supporters'],
    showStats:false
  },
  preprod:{
    tag:'Pre-Prod',active:false,
    title_it:'Fase Pre-Produzione',
    title_en:'Pre-Production Phase',
    desc_it:'Test reali con community ristretta. Integrazione pagamenti, verifica identità, stress test del sistema. Tutto viene validato prima del lancio pubblico.',
    desc_en:'Real testing with restricted community. Payment integration, identity verification, system stress testing. Everything is validated before public launch.',
    features_it:['KYC e verifica identità','Integrazione pagamenti reali','Smart contract su Kaspa testnet','Stress test con airdrop reali limitati','Audit sicurezza completo'],
    features_en:['KYC and identity verification','Real payment integration','Smart contracts on Kaspa testnet','Stress testing with limited real airdrops','Complete security audit'],
    showStats:false
  },
  mainnet:{
    tag:'Mainnet',active:false,
    title_it:'Mainnet — Lancio Reale',
    title_en:'Mainnet — Real Launch',
    desc_it:'Blockchain live su Kaspa. Primo airdrop con oggetto reale. ARIA, ROBI, KAS — tutto operativo. Target: 15.000+ utenti.',
    desc_en:'Live blockchain on Kaspa. First airdrop with a real object. ARIA, ROBI, KAS — all operational. Target: 15,000+ users.',
    features_it:['Smart contract KRC-20 on-chain','Primo airdrop con oggetto fisico reale','ROBI riscuotibili in KAS','Fondo di garanzia trasparente e verificabile','Marketplace aperto a venditori P2P e business'],
    features_en:['KRC-20 on-chain smart contracts','First airdrop with a real physical object','ROBI redeemable in KAS','Transparent and verifiable guarantee fund','Marketplace open to P2P and business sellers'],
    showStats:false
  }
};

async function openRoadmapDetail(phaseKey){
  var phase=RD_PHASES[phaseKey];if(!phase)return;
  track('roadmap_detail_viewed',{phase:phaseKey});
  var lang=document.documentElement.getAttribute('data-lang')||'it';
  var isIt=lang==='it';
  var html='';
  html+='<span class="rd-phase-tag'+(phase.active?' rd-active':'')+'">'+phase.tag+'</span>';
  html+='<h1>'+(isIt?phase.title_it:phase.title_en)+'</h1>';
  html+='<p class="rd-desc">'+(isIt?phase.desc_it:phase.desc_en)+'</p>';

  if(phase.showStats){
    html+='<div class="rd-stats">';
    html+='<div class="rd-stat"><div class="rd-stat-val" id="rd-stat-users">—</div><div class="rd-stat-label">'+(isIt?'Utenti registrati':'Registered users')+'</div></div>';
    html+='<div class="rd-stat"><div class="rd-stat-val" id="rd-stat-waitlist">—</div><div class="rd-stat-label">'+(isIt?'Waitlist':'Waitlist')+'</div></div>';
    html+='<div class="rd-stat"><div class="rd-stat-val" id="rd-stat-target">1,000</div><div class="rd-stat-label">'+(isIt?'Target Alpha Brave':'Alpha Brave target')+'</div></div>';
    html+='<div class="rd-stat"><div class="rd-stat-val" id="rd-stat-aria">—</div><div class="rd-stat-label">'+(isIt?'ARIA distribuiti':'ARIA distributed')+'</div></div>';
    html+='</div>';
  }else{
    html+='<div class="rd-coming"><h3>'+(isIt?'Prossimamente':'Coming Soon')+'</h3>';
    html+='<p>'+(isIt?'Questa fase non è ancora attiva. Registrati per essere tra i primi a sapere quando verrà lanciata.':'This phase is not yet active. Sign up to be among the first to know when it launches.')+'</p></div>';
  }

  var feats=isIt?phase.features_it:phase.features_en;
  html+='<div class="rd-features"><h3>'+(isIt?'Cosa include':'What\'s included')+'</h3><ul>';
  feats.forEach(function(f){html+='<li>'+f+'</li>';});
  html+='</ul></div>';


  document.getElementById('rd-content').innerHTML=html;
  document.getElementById('rd-overlay').classList.add('active');
  document.body.style.overflow='hidden';

  // Load live stats for Alpha
  if(phase.showStats){
    try{
      var s=getSession();
      var token=s?s.access_token:SB_KEY;
      var users=await sbGet('profiles?select=id',token);
      var wl=await sbGet('waitlist?select=id',token);
      var pts=await sbGet('points_ledger?select=amount',token);
      var totalAria=pts?pts.reduce(function(a,b){return a+(b.amount||0)},0):0;
      var ue=document.getElementById('rd-stat-users');if(ue)ue.textContent=users?users.length:0;
      var we=document.getElementById('rd-stat-waitlist');if(we)we.textContent=wl?wl.length:0;
      var ae=document.getElementById('rd-stat-aria');if(ae)ae.textContent=totalAria.toLocaleString();
    }catch(e){console.error('RD stats error:',e);}
  }
}

function closeRoadmapDetail(){
  document.getElementById('rd-overlay').classList.remove('active');
  document.body.style.overflow='';
}

// Check JWT expiry at app startup
(function(){
  var s=getSession();
  if(s&&s.access_token){
    try{
      var payload=JSON.parse(atob(s.access_token.split('.')[1]));
      if(payload.exp&&payload.exp<Date.now()/1000){
        clearSession();
      }
    }catch(e){clearSession();}
  }
})();

// Listen for auth state changes (token refresh failure, signout)
(function(){
  setInterval(function(){
    var s=getSession();
    if(!s||!s.access_token)return;
    try{
      var payload=JSON.parse(atob(s.access_token.split('.')[1]));
      if(payload.exp&&payload.exp<Date.now()/1000){
        doLogout();
      }
    }catch(e){doLogout();}
  },60000);
})();

(function(){
  var params=new URLSearchParams(window.location.search);
  var ref=params.get('ref');
  if(ref){
    track('referral_link_clicked',{ref_code:ref});
  }
})();


