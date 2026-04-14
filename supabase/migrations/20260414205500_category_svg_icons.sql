-- ─────────────────────────────────────────────────────────
-- Icone SVG minimali per categorie (stroke-only, monocromatiche)
-- Sostituisce emoji con SVG inline 18x18
-- ─────────────────────────────────────────────────────────
UPDATE categories SET icon = CASE slug
  WHEN 'smartphone' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>'
  WHEN 'tablet' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>'
  WHEN 'computer' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="12" rx="1"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/></svg>'
  WHEN 'gaming' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11h4M8 9v4"/><circle cx="15" cy="10" r=".5" fill="currentColor"/><circle cx="17" cy="12" r=".5" fill="currentColor"/><path d="M2 13a2 2 0 002 2h2l2 3h4l2-3h2a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v4z"/></svg>'
  WHEN 'audio' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>'
  WHEN 'fotografia' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>'
  WHEN 'orologi' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>'
  WHEN 'gioielli' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12l4 7-10 11L2 10z"/><path d="M2 10h20M12 21L8 10l4-7 4 7z"/></svg>'
  WHEN 'borse' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V6a4 4 0 018 0v2"/></svg>'
  WHEN 'moda' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L8 6h8l-4-4zM8 6v4c0 2 1 4 4 4s4-2 4-4V6M8 22h8M10 14v8M14 14v8"/></svg>'
  WHEN 'biciclette' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h4l4 8M10 8l2 8"/></svg>'
  WHEN 'arredamento' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6"/><rect x="9" y="9" width="6" height="4"/></svg>'
  WHEN 'sport' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 000 18M12 3a14.5 14.5 0 010 18M3 12h18"/></svg>'
  WHEN 'strumenti' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
  WHEN 'arte' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="11.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12" r="1.5"/><path d="M12 22a10 10 0 110-20 10 10 0 010 20z"/></svg>'
  WHEN 'vino' THEN '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l-1 7a5 5 0 01-3 4.5 5 5 0 01-3-4.5L8 2zM12 13.5V21M8 21h8"/></svg>'
  ELSE icon
END
WHERE slug IN ('smartphone','tablet','computer','gaming','audio','fotografia','orologi','gioielli','borse','moda','biciclette','arredamento','sport','strumenti','arte','vino');
