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
  var DEFAULT = 'light';

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setSaved(val) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch (e) { /* ignore */ }
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Apply saved theme ASAP (avoid flash). Runs synchronously at script load.
  var saved = getSaved() || DEFAULT;
  apply(saved);

  function attach() {
    var btn = document.getElementById('airoobi-theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || DEFAULT;
      var next = current === 'dark' ? 'light' : 'dark';
      // Smooth transition
      document.documentElement.classList.add('theme-transition');
      apply(next);
      setSaved(next);
      setTimeout(function () {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
