import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://localhost:3000';
const out = process.argv[3] ?? '/tmp/shot.png';
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell',
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
    '--hide-scrollbars',
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
// let the rope physics settle before capturing
await new Promise((r) => setTimeout(r, 6000));
await page.screenshot({ path: out });
await browser.close();
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
console.log('saved', out);
