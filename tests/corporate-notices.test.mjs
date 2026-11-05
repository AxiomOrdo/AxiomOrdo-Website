import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import test, { before, after } from "node:test";
import playwright from "../apps/aopdf/node_modules/playwright/index.js";

const root = new URL("..", import.meta.url);
const corporate = JSON.parse(await readFile(new URL("../src/lib/corporate-notices.json", import.meta.url), "utf8"));
const base = "http://127.0.0.1:4187";
let server;
let browser;
before(async () => {
  execFileSync(process.execPath, ["scripts/prerender-architecture.mjs"], { cwd: root });
  server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4187", "--strictPort"], { cwd: root, stdio: "pipe" });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, "Vite should be available");
  browser = await playwright.chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); server?.kill("SIGTERM"); });

async function verifyNotice(page, notice, path) {
  const response = await page.goto(`${base}${path}`);
  assert.equal(response.status(), 200);
  await page.getByRole("heading", { level: 1, name: notice.title, exact: true }).waitFor();
  for (const section of notice.sections) {
    assert.equal(await page.getByRole("heading", { name: section.heading, exact: true }).count(), 1);
    assert.ok((await page.locator("main").innerText()).includes(section.paragraphs[0]));
  }
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), `https://www.axiomordo.com/legal/${notice.slug}`);
  assert.equal(await page.locator('a[href="/da/privacy"]').count() > 0, true);
  const footer = page.locator("footer");
  const text = await footer.innerText();
  for (const value of [corporate.company.legalName, corporate.company.companyNumber, corporate.company.registeredOffice, corporate.company.contactEmail, "England and Wales"]) assert.ok(text.includes(value), value);
  assert.ok(!text.includes("VAT number"));
  for (const item of corporate.notices) assert.equal(await footer.locator(`nav[aria-label="Corporate policies"] a[href="/legal/${item.slug}"]`).count(), 1);
  assert.ok(!(await page.locator("main").innerText()).includes("Route scope"));
}

test("all four corporate notices render substantive React routes and company identity", async () => {
  const page = await browser.newPage();
  for (const notice of corporate.notices) await verifyNotice(page, notice, `/legal/${notice.slug}`);
  await page.goto(base);
  await page.locator("footer").getByText(corporate.company.registeredOffice, { exact: false }).waitFor();
  await page.close();
});

test("production rewrite targets contain the same notices without JavaScript", async () => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  for (const notice of corporate.notices) await verifyNotice(page, notice, `/architecture-v2/routes/legal/${notice.slug}.html`);
  await page.goto(`${base}/architecture-v2/routes/company/about.html`);
  assert.ok((await page.locator("footer").innerText()).includes(corporate.company.registeredOffice));
  await page.close();
});

test("static policy remains intact when architecture navigation JavaScript runs", async () => {
  const page = await browser.newPage();
  await verifyNotice(page, corporate.notices[0], "/architecture-v2/routes/legal/privacy.html");
  assert.equal(await page.locator('script[src*="speed-insights"]').count(), 0);
  await page.close();
});

test("corporate entrypoint does not automatically load optional ads, performance or trace collection", async () => {
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(index, /googletagmanager|gtag\(|<script[^>]+src=["'][^"']*trace-inspector\.js/);
  assert.doesNotMatch(app, /@vercel\/speed-insights|<SpeedInsights/);
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(base);
  await page.locator("footer").getByText(corporate.company.registeredOffice, { exact: false }).waitFor();
  assert.ok(!requests.some((url) => /googletagmanager|googleadservices|speed-insights|trace-inspector\.js/.test(url)), requests.join("\n"));
  assert.equal(await page.evaluate(() => sessionStorage.getItem("axiomordo.trace.v1")), null);
  // The release disables future collection; it must not claim to erase pre-existing tab data.
  await page.evaluate(() => sessionStorage.setItem("axiomordo.trace.v1", "legacy-example"));
  await page.reload();
  assert.equal(await page.evaluate(() => sessionStorage.getItem("axiomordo.trace.v1")), "legacy-example");
  await context.close();
});
