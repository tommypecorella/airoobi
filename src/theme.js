/*
 * AIROOBI · Theme toggle (light ↔ dark)
 * Companion to /src/tokens.css
 *
 * Auto-applies saved theme on load, attaches handler to #airoobi-theme-toggle.
 * Persists choice to localStorage.airoobi-theme.
 *
 * Usage: <script src="/src/theme.js" defer></script> nell'<head>.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'airoobi-theme';
  // v3: default = preferenza di sistema (§7 checklist), il toggle la sovrascrive
  var DEFAULT = (function () {
    try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  })();

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setSaved(val) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch (e) { /* ignore */ }
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // dapp-v2-g3.css e' la skin LIGHT della dApp (palette forzata con !important):
    // in dark va spenta, sotto vive la base dark + token theme-v3 (bug 4, 15 lug 2026)
    try {
      var g3 = document.querySelectorAll('link[href*="dapp-v2-g3"]');
      for (var i = 0; i < g3.length; i++) g3[i].disabled = (theme === 'dark');
    } catch (e) { /* ignore */ }
  }

  // Apply saved theme ASAP (avoid flash). Runs synchronously at script load.
  // ?theme=light|dark in URL = override non persistito (test/preview).
  var urlTheme = null;
  try { urlTheme = new URLSearchParams(location.search).get('theme'); } catch (e) { /* ignore */ }
  var saved = (urlTheme === 'dark' || urlTheme === 'light') ? urlTheme : (getSaved() || DEFAULT);
  apply(saved);

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || DEFAULT;
    var next = current === 'dark' ? 'light' : 'dark';
    // Smooth transition
    document.documentElement.classList.add('theme-transition');
    apply(next);
    setSaved(next);
    var btn = document.getElementById('airoobi-theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    setTimeout(function () {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }
  // v3: globale — le topbar rigenerate via JS usano onclick, niente listener persi
  window._airoobiThemeToggle = toggle;

  function attach() {
    var btn = document.getElementById('airoobi-theme-toggle');
    if (!btn || btn.getAttribute('data-wired')) return;
    btn.setAttribute('data-wired', '1');
    btn.addEventListener('click', toggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
