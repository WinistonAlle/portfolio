import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('console', (m) => { const t=m.text(); if (/lost|error|warn|fail/i.test(t)) console.log('[c]', t.slice(0,160)); });
page.on('pageerror', (e) => console.log('[err]', String(e).slice(0,200)));
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
for (const ms of [2000, 3000, 3000]) {
  await new Promise((r) => setTimeout(r, ms));
  console.log(await page.evaluate(() => {
    const cs = [...document.querySelectorAll('canvas')];
    return 'canvases=' + cs.length + ' ' + cs.map((c) => `${c.width}x${c.height}:ctxlost=${!!(c.getContext('webgl2')?.isContextLost?.() ?? 'n/a')}`).join(' | ');
  }));
}
await browser.close();
