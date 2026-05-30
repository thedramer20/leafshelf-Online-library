import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/cine3', { recursive: true });

const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

// 1. Book closed — verify vintage cover + bookmark ribbon
await page.screenshot({ path: 'screenshots/cine3/01-book-closed.png' });
console.log('1. Closed book screenshot taken');

const closedChecks = await page.evaluate(() => {
  const bookArea = document.querySelector('#book-area');
  const ribbon = bookArea ? bookArea.querySelector('[style*="clipPath"]') : null;
  const flourishes = bookArea ? [...bookArea.querySelectorAll('div')].filter(el =>
    el.textContent?.trim() === '❦'
  ) : [];
  return {
    bookAreaFound: !!bookArea,
    ribbonFound: !!ribbon,
    flourishCount: flourishes.length,
  };
});
console.log('  Closed checks:', JSON.stringify(closedChecks));

// 2. Click to open
const bookEl = await page.$('#book-area');
if (bookEl) {
  await bookEl.click();
  console.log('  Book clicked — opening');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/cine3/02-book-opening.png' });
  console.log('2. Opening sequence screenshot taken');

  // Wait for all pages to flip
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'screenshots/cine3/03-book-fully-open.png' });
  console.log('3. Fully open screenshot taken');

  // 3. Click again to close
  await bookEl.click();
  console.log('  Book clicked — closing');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/cine3/04-book-closing.png' });
  console.log('4. Closing sequence screenshot taken');

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/cine3/05-book-closed-again.png' });
  console.log('5. Closed again screenshot taken');
}

await browser.close();
console.log('\nAll screenshots saved to client/screenshots/cine3/');
