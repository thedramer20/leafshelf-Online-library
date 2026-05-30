import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
const findings = [];

page.on("pageerror", (err) => {
  findings.push({ type: "pageerror", route: page.url(), message: err.message });
});

async function clickByText(route, selector, text) {
  await page.goto(`http://localhost:8081${route}`, { waitUntil: "networkidle2", timeout: 60000 });
  const beforeUrl = page.url();
  const beforeText = await page.evaluate(() => document.body.innerText);

  const clicked = await page.evaluate(
    ({ selector, text }) => {
      const el = Array.from(document.querySelectorAll(selector)).find((node) =>
        (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim() === text,
      );
      if (!el) return false;
      el.click();
      return true;
    },
    { selector, text },
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const afterUrl = page.url();
  const afterText = await page.evaluate(() => document.body.innerText);

  findings.push({
    type: "click",
    route,
    text,
    clicked,
    urlChanged: beforeUrl !== afterUrl,
    textChanged: beforeText !== afterText,
    afterUrl,
  });
}

await clickByText("/", "button", "Audio Books");
await clickByText("/", "button", "Upgrade Now");
await clickByText("/downloads", "button", "Open");
await clickByText("/downloads", "button", "Delete");
await clickByText("/settings", "button", "Notifications");
await clickByText("/settings", "button", "Save Changes");
await clickByText("/support", "button", "View Articles →");
await clickByText("/support", "button", "Start Chat");

console.log(JSON.stringify(findings, null, 2));
await browser.close();
