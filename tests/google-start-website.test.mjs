import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import test, { after, before } from "node:test";

import playwright from "../apps/aopdf/node_modules/playwright/index.js";

const require = createRequire(import.meta.url);
const { PDFDocument } = require("../apps/aopdf/node_modules/pdf-lib");
const { chromium } = playwright;

const baseUrl = "http://127.0.0.1:4176";
let server;
let browser;

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
