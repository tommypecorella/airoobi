#!/bin/bash
# AIROOBI Project Setup — run on Pi
# Usage: bash setup-project.sh

REPO="/home/drskeezu/projects/airoobi"
cd "$REPO" || exit 1

echo "🚀 Setting up AIROOBI project structure..."

# === DIRECTORIES ===

# Prototype (standalone HTML demos)
mkdir -p prototype

# Source (production code — Next.js when ready)
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/styles
mkdir -p src/lib
mkdir -p src/hooks

# Public assets
mkdir -p public/images
mkdir -p public/fonts
mkdir -p public/icons

# Documentation (business docs, specs)
mkdir -p docs/business
mkdir -p docs/product
mkdir -p docs/legal
mkdir -p docs/tech

# Design assets (SVG, logos, brand)
mkdir -p design/logo
mkdir -p design/brand

# Scripts (utility, deploy, automation)
mkdir -p scripts

# === FILES ===

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.production
.env.*.local

# OS
.DS_Store
Thumbs.db
*.swp
*~

# IDE
.vscode/
.idea/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# Supabase
supabase/.temp/
EOF

# Updated README
cat > README.md << 'EOF'
# AIROOBI

Fair airdrop marketplace per oggetti fisici reali su blockchain Kaspa.

## Structure

```
prototype/     → Standalone HTML demos (file:// protocol)
src/           → Production source code (Next.js)
public/        → Static assets (images, fonts, icons)
docs/          → Business, product, legal, tech documentation
design/        → Logo, brand assets, SVG
scripts/       → Utility and automation scripts
```

## Stack

- **Prototype:** Single-file HTML + React CDN
- **Production:** Next.js + Supabase + Vercel
- **Blockchain:** Kaspa
- **Design:** BLACK #000000 + GOLD #B8960C + WHITE #FFFFFF

## Brand

- Font titoli: Cormorant Garamond
- Font body: Instrument Sans
- Dark mode default
- 1 ARIA = €0.10 (unica certezza comunicabile)
EOF

# Brand colors CSS custom properties
cat > src/styles/brand.css << 'EOF'
/* AIROOBI Brand System — TASSATIVO: solo questi colori */
:root {
  /* Core palette */
  --airoobi-black: #000000;
  --airoobi-white: #FFFFFF;
  --airoobi-gold: #B8960C;

  /* Semantic */
  --bg-primary: var(--airoobi-black);
  --bg-secondary: var(--airoobi-white);
  --text-primary: var(--airoobi-white);
  --text-secondary: var(--airoobi-black);
  --accent: var(--airoobi-gold);

  /* Typography */
  --font-heading: 'Cormorant Garamond', serif;
  --font-body: 'Instrument Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
EOF

echo ""
echo "✅ Project structure created!"
echo ""
echo "📁 Tree:"
find . -not -path './.git/*' -not -name '.git' | head -40
echo ""
echo "Next: git add -A && git commit -m 'chore: project structure setup' && git push"