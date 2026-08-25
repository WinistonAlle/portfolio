import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on('console', (m) => console.log('[console:%s] %s', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
page.on('requestfailed', (r) => console.log('[reqfail]', r.url(), r.failure()?.errorText));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 11000));
console.log(await page.evaluate(() => {
  const c = document.querySelector('canvas');
  const gl = document.createElement('canvas').getContext('webgl2');
  return JSON.stringify({
    canvas: c ? { w: c.width, h: c.height, cs: getComputedStyle(c).display } : null,
    img: !!document.querySelector('img[src="/badge-front.png"]'),
    webgl2: !!gl,
    renderer: gl ? gl.getParameter(gl.RENDERER) : null,
  }, null, 2);
}));
await browser.close();
