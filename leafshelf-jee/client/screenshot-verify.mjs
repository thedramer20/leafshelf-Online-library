import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/verify', { recursive: true });

const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// ── 1. Desktop (1440×900) ────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/verify/01-desktop-initial.png' });
  console.log('1. Desktop initial done');

  // Check: background image set, particles rendered, book present, glass card
  const checks = await page.evaluate(() => {
    const bg = document.querySelector('[style*="1448375240586"]') ||
                document.querySelector('[style*="unsplash"]');
    const book = document.querySelector('#book-area');
    const formCard = document.querySelector('#login-form');
    const cardStyle = formCard ? window.getComputedStyle(formCard) : null;
    const particles = document.querySelectorAll('canvas');
    return {
      hasBackground: !!bg,
      hasBook: !!book,
      hasFormCard: !!formCard,
      particleCount: particles.length,
      cardBg: cardStyle ? cardStyle.backgroundColor : 'not found',
    };
  });
  console.log('  DOM checks:', JSON.stringify(checks));

  // ── 2. Book click — page flip ──────────────────────────────────────────────
  const bookEl = await page.$('#book-area');
  if (bookEl) {
    await bookEl.click();
    console.log('  Book clicked');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/verify/02-book-page1.png' });
    console.log('2. Book page 1 done');

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/verify/03-book-page2.png' });
    console.log('3. Book page 2 done');

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshots/verify/04-book-page3.png' });
    console.log('4. Book page 3 done');

    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: 'screenshots/verify/05-book-final.png' });
    console.log('5. Book final (Welcome) done');
  }

  // ── 3. Create Account tab ──────────────────────────────────────────────────
  const tabs = await page.$$('button');
  for (const btn of tabs) {
    const text = await btn.evaluate(el => el.textContent?.trim());
    if (text === 'Create Account') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshots/verify/06-register-tab.png' });
  console.log('6. Register tab done');

  await page.close();
}

// ── 4. Mobile (375×812) ──────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/verify/07-mobile.png' });
  console.log('7. Mobile view done');

  const mobileChecks = await page.evaluate(() => {
    const book = document.querySelector('#book-area');
    const bookVisible = book ? window.getComputedStyle(book.parentElement).display !== 'none' : false;
    const leafIcon = [...document.querySelectorAll('span')].find(el => el.textContent === '🍃');
    return {
      bookHidden: !bookVisible,
      leafIconVisible: !!leafIcon,
    };
  });
  console.log('  Mobile checks:', JSON.stringify(mobileChecks));

  await page.close();
}

await browser.close();
console.log('\nAll verification screenshots saved to client/screenshots/verify/');
