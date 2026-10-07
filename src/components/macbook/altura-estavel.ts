/* Alturas de viewport que NÃO mudam com a barra de endereço do celular.
 *
 * `window.innerHeight` encolhe e cresce conforme a barra do Safari/Chrome
 * some e reaparece durante a rolagem. A abertura calculava o progresso em
 * cima dele: cada mudança dava um salto no giro e deslocava a tela do
 * aparelho, que é a piscada que se via ao rolar no celular.
 *
 * O espaçador da abertura é medido em `vh` (no celular, a viewport GRANDE,
 * fixa) e a cena em `svh` (a PEQUENA, fixa). As duas saem de uma régua
 * invisível, medida de novo só quando a largura muda (girar o aparelho).
 */

let largura = -1;
let vh = 0;
let svh = 0;

function medir() {
  const w = document.documentElement.clientWidth;
  if (w === largura && vh && svh) return;
  const regua = document.createElement('div');
  regua.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(regua);
  regua.style.height = '100vh';
  vh = regua.getBoundingClientRect().height || window.innerHeight;
  regua.style.height = '100svh';
  svh = regua.getBoundingClientRect().height || window.innerHeight;
  regua.remove();
  largura = w;
}

/** 100vh em pixels: a unidade do espaçador da abertura. */
export function alturaVh(): number {
  medir();
  return vh;
}

/** 100svh em pixels: a altura da cena e da tela do portal. */
export function alturaSvh(): number {
  medir();
  return svh;
}
