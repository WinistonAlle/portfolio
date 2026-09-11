/* Decide se vale rodar a cena 3D da abertura.
 *
 * Mora num arquivo SÓ dela, sem importar `three`, e esse é o ponto inteiro.
 * Ela nasceu dentro do `laptop-scene.ts`, que faz `import * as THREE`, e o
 * MacbookPortal a importava de lá: import estático de uma função de vinte
 * linhas arrastava a biblioteca inteira pro bundle da home. Medido em
 * produção: 725 KB de three.js como <script> no primeiro paint, justamente o
 * que o `dynamic(ssr:false)` da cena existia pra evitar.
 *
 * Regra que vale pro repo todo: o que decide SE carrega não pode morar no
 * mesmo módulo do que é carregado.
 */
/* --------------------------------------------------------- capacidade
 * Detecção por CAPACIDADE, não por largura: um iPad Pro roda isto melhor que
 * um notebook de escritório com GPU integrada antiga.
 */
export function canRun3D(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  if (cores < 4 || mem < 4) return false;
  try {
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    /* Renderizadores de software: rodam, mas a 5fps. Melhor o SVG. */
    if (/swiftshader|llvmpipe|software|basic render/i.test(name)) return false;
    return true;
  } catch {
    return false;
  }
}
