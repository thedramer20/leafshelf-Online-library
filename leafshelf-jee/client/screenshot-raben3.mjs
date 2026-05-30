import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/raben', { recursive: true });
const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 4000));
await page.screenshot({ path: 'screenshots/raben/02-falling-books.png' });

const checks = await page.evaluate(() => {
  const bookDivs = document.querySelectorAll('[style*="bookFall"]');
  const landedArea = document.querySelector('.absolute.bottom-8.left-12');
  return {
    booksRendering: bookDivs.length,
    landedBooksPresent: !!landedArea,
  };
});
console.log('RABEN-3 checks:', JSON.stringify(checks, null, 2));
await browser.close();
console.log('Screenshot: screenshots/raben/02-falling-books.png');
