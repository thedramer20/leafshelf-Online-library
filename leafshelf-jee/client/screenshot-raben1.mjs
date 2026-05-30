import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/raben', { recursive: true });
const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 5000));
await page.screenshot({ path: 'screenshots/raben/01-meadow-login.png' });

const checks = await page.evaluate(() => {
  const video = document.querySelector('video');
  const src = video?.querySelector('source')?.src ?? '';
  const bookArea = document.querySelector('#book-area');
  const leaves = [...document.querySelectorAll('[style*="leafFallSwirl"]')];
  return {
    videoSrc: src.includes('4763824') ? 'grass-ok' : src,
    book3dHidden: !bookArea,
    fallingLeavesGone: leaves.length === 0,
    videoFilter: video ? window.getComputedStyle(video).filter : 'missing',
  };
});
console.log('RABEN-1 checks:', JSON.stringify(checks, null, 2));
await browser.close();
console.log('\nScreenshot: screenshots/raben/01-meadow-login.png');
