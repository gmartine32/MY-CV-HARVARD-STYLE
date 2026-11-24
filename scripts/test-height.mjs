import puppeteer from 'puppeteer';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const fileUrl = pathToFileURL(path.resolve('cv_frontend_makai_en.html')).href;
const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const page = await browser.newPage();
await page.goto(fileUrl, { waitUntil: 'networkidle0' });

const info = await page.evaluate(() => {
  const elements = Array.from(document.querySelectorAll('h1, h2, .section, .job-block'));
  return elements.map(el => ({
    tag: el.tagName,
    text: el.innerText.slice(0, 30),
    top: el.offsetTop,
    height: el.offsetHeight,
    bottom: el.offsetTop + el.offsetHeight
  }));
});

console.log('Total scrollHeight:', await page.evaluate(() => document.body.scrollHeight));
console.log('Elements:');
console.log(info);

await browser.close();
process.exit(0);
