import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/final', { recursive: true });
const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });

// ── 1. Login desktop — wait 5s for video + animations ────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'screenshots/final/01-login-desktop.png' });

  const c = await page.evaluate(() => {
    const form = document.querySelector('#login-form');
    const cs   = form ? window.getComputedStyle(form) : null;
    const vid  = document.querySelector('video');
    const fireflies = document.querySelectorAll('[class*="rounded-full"][style*="fireflyFloat"]');
    const aurora    = document.querySelector('[style*="auroraShift"]');
    return {
      cardBg:        cs ? cs.backgroundColor : 'missing',
      videoPresent:  !!vid,
      videoAutoplay: vid ? vid.autoplay : false,
      fireflyCount:  fireflies.length,
      auroraPresent: !!aurora,
    };
  });
  console.log('1. Login checks:', JSON.stringify(c));

  // Book open then close
  const bookEl = await page.$('#book-area');
  if (bookEl) {
    await bookEl.click();
    await new Promise(r => setTimeout(r, 4500));
    await page.screenshot({ path: 'screenshots/final/02-book-open.png' });
    console.log('2. Book open screenshot taken');

    await bookEl.click();
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: 'screenshots/final/03-book-closed-again.png' });
    console.log('3. Book closed-again screenshot taken');
  } else {
    console.log('   WARN: #book-area not found');
  }
  await page.close();
}

// ── 2. Dashboard ─────────────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/final/04-dashboard.png' });

  const dbCheck = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')];
    const found = divs.some(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('1a3a10') || s.includes('2d5016');
    });
    return { vintageBookInDom: found };
  });
  console.log('4. Dashboard:', JSON.stringify(dbCheck));
  await page.close();
}

// ── 3. Categories ─────────────────────────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/categories', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/final/05-categories.png' });

  const catCheck = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')];
    const found = divs.some(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('1a3a10') || s.includes('2d5016');
    });
    return { vintageBookInDom: found };
  });
  console.log('5. Categories:', JSON.stringify(catCheck));
  await page.close();
}

// ── 4. Mobile — no horizontal scroll ─────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/final/06-mobile-login.png' });

  const scrollCheck = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth:   window.innerWidth,
    hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
  }));
  console.log('6. Mobile scroll:', JSON.stringify(scrollCheck));
  await page.close();
}

await browser.close();
console.log('\nAll screenshots saved to screenshots/final/');
