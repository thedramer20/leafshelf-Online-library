import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/raben', { recursive: true });
const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });

// Desktop
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'screenshots/raben/03-desktop-final.png' });

  const checks = await page.evaluate(() => {
    const video = document.querySelector('video');
    const bookFalling = document.querySelectorAll('[style*="bookFall"]');
    const landedBooks = document.querySelector('.hidden.lg\\:flex.absolute.bottom-8');
    const form = document.querySelector('#login-form');
    const formBg = form ? window.getComputedStyle(form).backgroundColor : 'missing';
    const brandH1 = document.querySelector('h1');
    const brandShadow = brandH1 ? window.getComputedStyle(brandH1).textShadow : 'missing';
    const leavesWithFallSwirl = document.querySelectorAll('[style*="leafFallSwirl"]');
    const leavesWithLeafSway = document.querySelectorAll('[style*="leafSway"]');
    const bookArea = document.querySelector('#book-area');
    return {
      '1_videoPresent': !!video,
      '2_fallingBooksCount': bookFalling.length,
      '5_landedBooksPresent': !!landedBooks,
      '6_formBg': formBg,
      '7_brandTextShadow': brandShadow !== 'none' && brandShadow !== 'missing',
      '8_noFallingLeaves': leavesWithFallSwirl.length === 0,
      '8b_noSwayLeaves': leavesWithLeafSway.length === 0,
      '9_noBook3D': !bookArea,
    };
  });
  console.log('Desktop checks:', JSON.stringify(checks, null, 2));
  await page.close();
}

// Mobile
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/raben/04-mobile-final.png' });

  const mobileChecks = await page.evaluate(() => {
    const fallingBooksWrapper = document.querySelector('.hidden.lg\\:block.absolute');
    const form = document.querySelector('#login-form');
    const video = document.querySelector('video');
    return {
      '11_fallingBooksHiddenMobile': !!fallingBooksWrapper,
      '12_formPresent': !!form,
      '13_videoPresent': !!video,
      'bodyScrollWidth': document.body.scrollWidth,
      'viewportWidth': window.innerWidth,
      'noHorizontalScroll': document.body.scrollWidth <= window.innerWidth,
    };
  });
  console.log('Mobile checks:', JSON.stringify(mobileChecks, null, 2));
  await page.close();
}

await browser.close();
console.log('\nScreenshots: screenshots/raben/03-desktop-final.png, 04-mobile-final.png');
