import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const inputArg = process.argv[2] ?? "cv_frontend_tekton_en.html";
const inputPath = path.resolve(process.cwd(), inputArg);

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

if (!inputPath.toLowerCase().endsWith(".html") && !inputPath.toLowerCase().endsWith(".htm")) {
  console.error(`Expected an HTML file, got: ${inputPath}`);
  process.exit(1);
}

const pdfDir = path.resolve(process.cwd(), "pdf");
fs.mkdirSync(pdfDir, { recursive: true });

const baseName = path.basename(inputPath).replace(/\.html?$/i, ".pdf");
const outputPath = path.join(pdfDir, baseName);
const fileUrl = pathToFileURL(inputPath).href;

function findSystemChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  return candidates.find((p) => fs.existsSync(p));
}

async function launchBrowser() {
  try {
    return await puppeteer.launch({ headless: true });
  } catch (err) {
    const executablePath = findSystemChrome();
    if (!executablePath) throw err;
    console.warn(`Bundled Chrome not found; using system browser: ${executablePath}`);
    return puppeteer.launch({ headless: true, executablePath });
  }
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  console.log(`PDF written: ${outputPath}`);
} finally {
  await browser.close();
}
