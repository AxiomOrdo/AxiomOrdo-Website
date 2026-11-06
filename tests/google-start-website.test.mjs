import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test, { after, before } from "node:test";

import playwright from "../apps/aopdf/node_modules/playwright/index.js";

const require = createRequire(import.meta.url);
const { PDFDocument } = require("../apps/aopdf/node_modules/pdf-lib");
const { chromium } = playwright;

const baseUrl = "http://127.0.0.1:4176";
let server;
let browser;

test("architecture breadcrumbs preserve URL encoding and configured routes cannot execute path markup", async () => {
  const configuration = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  // Local fixture serves actual public assets using the checked-in architecture
  // rewrite rules. Vite's SPA fallback does not implement Vercel rewrites.
  const fixture = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://fixture.invalid').pathname;
      let destination = pathname;
      for (const rule of configuration.rewrites) {
        if (rule.source === pathname) { destination = rule.destination; break; }
        const prefix = rule.source.split('/:path*')[0];
        if (rule.source.endsWith('/:path*') && pathname.startsWith(`${prefix}/`)) {
          destination = rule.destination.replace(':path*', pathname.slice(prefix.length + 1));
          break;
        }
      }
      // Do not decode attacker input or synthesize a fallback template. Unknown
      // routes must resolve to an existing asset, just as configured in Vercel.
      const asset = new URL(`../public${destination}`, import.meta.url);
      if (!asset.href.startsWith(new URL('../public/', import.meta.url).href)) throw new Error('outside public');
      const content = await readFile(asset);
      response.writeHead(200, { 'Content-Type': destination.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
      response.end(content);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found');
    }
  });
  await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${fixture.address().port}`;
  const page = await browser.newPage();
  try {
    await page.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.addInitScript(() => { window.__breadcrumbExecuted = false; });
    const ordinary = await page.goto(`${origin}/platforms/meriden`);
    assert.equal(ordinary.status(), 200);
    assert.deepEqual(await page.locator('#crumbs a').evaluateAll((links) => links.map((link) => [link.textContent, link.getAttribute('href')])), [
      ['Home', '/'], ['Platforms', '/platforms'], ['Meriden', '/platforms/meriden'],
    ]);
    for (const payload of [
      '<img src=x onerror="window.__breadcrumbExecuted=true">',
      '%3Csvg%20onload%3Dwindow.__breadcrumbExecuted%3Dtrue%3E',
      '&lt;img src=x onerror=window.__breadcrumbExecuted=true&gt;',
      'space label', '日本語', 'nested/child', '%2522%253E%253Cscript%253E',
    ]) {
      const target = new URL(`/platforms/${payload}`, origin);
      const result = await page.goto(target.href);
      assert.equal(result.status(), 404, target.pathname);
      assert.equal(await page.evaluate(() => window.location.pathname), target.pathname);
      assert.equal(await page.evaluate(() => window.__breadcrumbExecuted), false);
      assert.equal(await page.locator('#crumbs img, #crumbs svg, #crumbs script').count(), 0);
      // The actual template remains reachable with arbitrary query/hash input;
      // those inputs must not become breadcrumb labels or HTML nodes.
      await page.goto(`${origin}/architecture-v2/index.html?label=${encodeURIComponent(payload)}#${encodeURIComponent(payload)}`);
      assert.deepEqual(await page.locator('#crumbs a').evaluateAll((links) => links.map((link) => [link.textContent, link.getAttribute('href')])), [
        ['Home', '/'], ['Architecture V2', '/architecture-v2'], ['Index.html', '/architecture-v2/index.html'],
      ]);
      assert.equal(await page.evaluate(() => window.__breadcrumbExecuted), false);
      assert.equal(await page.locator('#crumbs img, #crumbs svg, #crumbs script').count(), 0);
    }
  } finally {
    await page.close();
    await new Promise((resolve) => fixture.close(resolve));
  }
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Vite did not start within 15 seconds");
}

before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4176"],
    { cwd: new URL("..", import.meta.url), stdio: "pipe" },
  );
  await waitForServer();
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  server?.kill("SIGTERM");
});

test("homepage leads reviewers to the working AO-PDF interface and synthetic files", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(5_000);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await assert.doesNotReject(() =>
    page.getByRole("link", { name: /open ao-pdf/i }).waitFor(),
  );
  assert.equal(
    await page.getByRole("link", { name: /open ao-pdf/i }).getAttribute("href"),
    "/ao-pdf/",
  );
  assert.equal(
    await page.getByRole("link", { name: /synthetic source document a/i }).getAttribute("href"),
    "/samples/axiomordo-synthetic-source-a.pdf",
  );
  assert.equal(
    await page.getByRole("link", { name: /synthetic source document b/i }).getAttribute("href"),
    "/samples/axiomordo-synthetic-source-b.pdf",
  );

  await page.close();
});

test("homepage makes company identity, founder verification and funding intent public", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(5_000);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await assert.doesNotReject(() =>
    page.getByRole("heading", { name: /axiomordo is seeking venture funding/i }).waitFor(),
  );
  assert.equal(
    await page.getByRole("link", { name: /sales@axiomordo\.com/i }).first().getAttribute("href"),
    "mailto:sales@axiomordo.com?subject=Venture%20funding%20enquiry",
  );
  await assert.doesNotReject(() =>
    page.getByRole("heading", { name: /phillip inzaghi/i }).waitFor(),
  );
  assert.equal(
    await page.getByRole("link", { name: /verify.*companies house/i }).getAttribute("href"),
    "https://find-and-update.company-information.service.gov.uk/company/17179868/officers",
  );

  await page.close();
});

test("Gate Zero is described as a paid SaaS product in pilot qualification", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(5_000);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const body = await page.locator("body").innerText();

  assert.match(body, /paid SaaS product/i);
  assert.match(body, /pilot qualification/i);
  assert.match(body, /recurring workspace subscriptions/i);
  assert.doesNotMatch(body, /download a sample handover/i);
  assert.doesNotMatch(body, /recorded engine results/i);

  await page.close();
});

test("JavaScript-independent fallback exposes the same verification path", async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  page.setDefaultTimeout(5_000);
  await page.goto(baseUrl, { waitUntil: "load" });
  const body = await page.locator("body").innerText();

  assert.match(body, /AO-PDF/);
  assert.match(body, /Phillip Inzaghi/);
  assert.match(body, /seeking venture funding/i);
  assert.equal(
    await page.getByRole("link", { name: /open ao-pdf/i }).getAttribute("href"),
    "/ao-pdf/",
  );

  await context.close();
});

test("reviewer journey remains visible on a mobile viewport", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(5_000);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await assert.doesNotReject(() =>
    page.getByRole("link", { name: /open ao-pdf/i }).waitFor(),
  );
  await assert.doesNotReject(() =>
    page.getByRole("heading", { name: /axiomordo is seeking venture funding/i }).waitFor(),
  );

  await page.close();
});

test("both public sample files are distinct, synthetic one-page PDFs", async () => {
  const paths = [
    new URL("../public/samples/axiomordo-synthetic-source-a.pdf", import.meta.url),
    new URL("../public/samples/axiomordo-synthetic-source-b.pdf", import.meta.url),
  ];
  const files = await Promise.all(paths.map((path) => readFile(path)));
  const documents = await Promise.all(files.map((file) => PDFDocument.load(file)));

  assert.deepEqual(documents.map((document) => document.getPageCount()), [1, 1]);
  assert.deepEqual(
    documents.map((document) => document.getTitle()),
    ["Synthetic Gateway 2 Source A", "Synthetic Gateway 2 Source B"],
  );
  assert.notEqual(
    createHash("sha256").update(files[0]).digest("hex"),
    createHash("sha256").update(files[1]).digest("hex"),
  );
});

test("AO-PDF merges both public samples into a downloaded two-page file", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(15_000);
  await page.addInitScript(() => {
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      value: undefined,
    });
  });
  const transmittedMethods = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method())) {
      transmittedMethods.push(request.method());
    }
  });
  await page.goto(`${baseUrl}/ao-pdf/tools/merge/index.html`, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles([
    new URL("../public/samples/axiomordo-synthetic-source-a.pdf", import.meta.url).pathname,
    new URL("../public/samples/axiomordo-synthetic-source-b.pdf", import.meta.url).pathname,
  ]);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Process locally" }).click();
  const download = await Promise.race([
    downloadPromise,
    page.getByText(/\([A-Z_]+\)$/).waitFor().then(async () => {
      throw new Error(`AO-PDF workflow failed: ${await page.getByText(/\([A-Z_]+\)$/).textContent()}`);
    }),
  ]);
  const outputPath = await download.path();
  assert.ok(outputPath);
  const output = await PDFDocument.load(await readFile(outputPath));

  assert.equal(output.getPageCount(), 2);
  assert.deepEqual(transmittedMethods, []);
  await page.close();
});

test("pre-rendered company page connects the founder, products and funding contact", async () => {
  const html = await readFile(
    new URL("../public/architecture-v2/routes/company/about.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /Phillip Inzaghi/);
  assert.match(html, /company\/17179868\/officers/);
  assert.match(html, /AO-PDF/);
  assert.match(html, /https:\/\/gate-zero\.tech\//);
  assert.match(html, /AxiomOrdo is seeking venture funding/);
  assert.match(html, /mailto:sales@axiomordo\.com\?subject=Venture%20funding%20enquiry/);
});
