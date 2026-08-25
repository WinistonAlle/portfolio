import puppeteer from 'puppeteer-core';
const [url, out, size, scrollY, waitMs] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0,200)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0,200)));
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, Number(waitMs)));
if (Number(scrollY)) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Number(scrollY));
  await new Promise((r) => setTimeout(r, 1200));
}
console.log('docHeight', await page.evaluate(() => document.body.scrollHeight));
await page.screenshot({ path: out });
await browser.close();
if (errs.length) console.log('ERRORS:', errs.slice(0,5).join(' | '));
