import puppeteer from 'puppeteer';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
const page = await browser.newPage();
const targetFile = process.argv[2] ?? 'cv_fullstack.html';
const fileUrl = pathToFileURL(path.resolve(targetFile)).href;
await page.goto(fileUrl, { waitUntil: 'networkidle0' });

const elements = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('h2, div[style*="display: flex"], ul')).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: el.innerText.substring(0, 50).replace(/\n/g, ' '),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      height: Math.round(rect.height)
    };
  });
});

console.log(JSON.stringify(elements, null, 2));
await browser.close();
