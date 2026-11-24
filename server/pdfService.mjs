import fs from "node:fs";
import path from "node:path";

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

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  const puppeteer = (await import("puppeteer")).default;
  const executablePath = findSystemChrome();
  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  };
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }
  browserInstance = await puppeteer.launch(launchOptions);
  return browserInstance;
}

/**
 * Generate PDF buffer from HTML string
 * @param {string} htmlContent - Full HTML string
 * @param {string} [outputPath] - Optional path to save on disk
 * @returns {Promise<Buffer>}
 */
export async function generatePdfFromHtml(htmlContent, outputPath = null) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, pdfBuffer);
    }

    return pdfBuffer;
  } finally {
    await page.close();
  }
}
