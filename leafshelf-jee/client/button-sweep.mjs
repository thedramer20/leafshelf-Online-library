import puppeteer from "puppeteer";

const routes = [
  "/",
  "/categories",
  "/books",
  "/downloads",
  "/favorites",
  "/settings",
  "/support",
  "/login",
  "/register",
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
const results = [];

page.on("pageerror", (err) => {
  results.push({ type: "pageerror", route: page.url(), message: err.message });
});

page.on("console", (msg) => {
  if (msg.type() === "error") {
    results.push({ type: "console", route: page.url(), message: msg.text() });
  }
});

async function getControls() {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("a, button"))
      .map((el, index) => {
        const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none";

        return {
          index,
          tag: el.tagName.toLowerCase(),
          text,
          href: el.tagName.toLowerCase() === "a" ? el.getAttribute("href") : null,
          disabled: !!el.disabled,
          visible,
        };
      })
      .filter((item) => item.visible && item.text);
  });
}

for (const route of routes) {
  await page.goto(`http://localhost:8081${route}`, { waitUntil: "networkidle2", timeout: 60000 });
  const controls = await getControls();
  results.push({ type: "route", route, controls });
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
