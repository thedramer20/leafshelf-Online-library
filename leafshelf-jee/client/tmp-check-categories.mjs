import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:/Users/zayed/.cache/puppeteer/chrome/win64-148.0.7778.167/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
page.setDefaultNavigationTimeout(15000);
await page.goto('http://localhost:8081/categories', { waitUntil: 'domcontentloaded' });
await new Promise(resolve => setTimeout(resolve, 5000));

const data = await page.evaluate(() => ({
  h1s: Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim()),
  h2s: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()),
  buttons: Array.from(document.querySelectorAll('button')).map(el => el.textContent.replace(/\s+/g, ' ').trim()).slice(0, 40),
  cards: Array.from(document.querySelectorAll('button')).filter(el => /Classic|Dystopian|Fantasy|Fiction|Horror|Romance/.test(el.textContent)).map(el => ({
    text: el.textContent.replace(/\s+/g, ' ').trim(),
    html: el.innerHTML,
  })).slice(0, 10),
  topHtml: Array.from(document.querySelectorAll('h2')).find(el => /Top Categories/.test(el.textContent))?.parentElement?.outerHTML || null,
  trendingHtml: Array.from(document.querySelectorAll('h2')).find(el => /Trending|Popular Authors/.test(el.textContent))?.parentElement?.outerHTML || null,
}));

console.log(JSON.stringify(data, null, 2));
await browser.close();
