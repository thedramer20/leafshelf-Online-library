import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots', { recursive: true });

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 1440, height: 900 },
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: 'screenshots/login-forest-full.png' });
console.log('Login full shot done');

// Register tab
await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'screenshots/register-forest-full.png' });
console.log('Register shot done');

await browser.close();
console.log('\nScreenshots saved to client/screenshots/');
