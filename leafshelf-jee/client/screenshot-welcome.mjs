import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots', { recursive: true });

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 1440, height: 900 },
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

// Clear first-login flag so we get the full 5s scene
await page.evaluateOnNewDocument(() => {
  localStorage.removeItem('leafshelf_welcome_seen');
});

await page.goto('http://localhost:5173/welcome', { waitUntil: 'domcontentloaded' });

// Dismiss Vite error overlay if present
await new Promise(r => setTimeout(r, 500));
await page.keyboard.press('Escape');

// Shot 1 — particles + early leaf (1.2s)
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: 'screenshots/welcome-1-early.png' });
console.log('Shot 1 done');

// Shot 2 — hero text fully revealed (3s)
await new Promise(r => setTimeout(r, 1800));
await page.screenshot({ path: 'screenshots/welcome-2-hero.png' });
console.log('Shot 2 done');

// Shot 3 — CTA button with BorderBeam (4.5s in)
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: 'screenshots/welcome-3-cta.png' });
console.log('Shot 3 done');

// Click the Skip button (it has no animation delay, always present)
const skipBtn = await page.$('button');
if (skipBtn) {
  await skipBtn.click();
} else {
  // fallback: trigger navigation via JS
  await page.evaluate(() => window.history.pushState({}, '', '/'));
}

// Shot 4 — cream flash (300ms after click)
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: 'screenshots/welcome-4-flash.png' });
console.log('Shot 4 done');

// Shot 5 — homepage after transition (900ms after click)
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: 'screenshots/welcome-5-home.png' });
console.log('Shot 5 done');

await browser.close();
console.log('\nAll 5 screenshots saved to client/screenshots/');
