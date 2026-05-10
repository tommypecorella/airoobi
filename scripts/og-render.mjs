// OG image renderer · Playwright headless
// Renders /og-image.svg → /og-image.png at 1200x630
// Usage: node scripts/og-render.mjs

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const svgPath = resolve(repoRoot, 'og-image.svg');
const pngPath = resolve(repoRoot, 'og-image.png');

const svgContent = readFileSync(svgPath, 'utf-8');

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin:0; padding:0; background:#000; }
  body { width:1200px; height:630px; overflow:hidden; }
  svg { display:block; width:1200px; height:630px; }
</style>
</head><body>${svgContent}</body></html>`;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const page = await context.newPage();

await page.setContent(html, { waitUntil: 'networkidle' });
// Extra wait for Google Fonts swap-in
await page.waitForTimeout(2000);
await page.evaluate(() => document.fonts.ready);

const buf = await page.screenshot({ type: 'png', fullPage: false, clip: { x: 0, y: 0, width: 1200, height: 630 } });
writeFileSync(pngPath, buf);

await browser.close();
console.log(`Rendered ${pngPath} (${buf.length} bytes)`);
