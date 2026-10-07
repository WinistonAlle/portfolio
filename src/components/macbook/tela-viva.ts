/* Tela viva: o site de verdade colado na tela 3D enquanto ela ainda se mexe.
 *
 * Antes, o conteúdo HTML só podia acender quando a câmera parava: ele é um
 * retângulo fixo no meio da viewport, e a tela 3D só coincide com esse
 * retângulo no fim. Até lá a tela do notebook ficava azul e vazia.
 *
 * Agora, a cada quadro, os 4 cantos da tela 3D são projetados em pixels e o
 * elemento do portal recebe a homografia (matrix3d) que leva o retângulo dele
 * até esse quadrilátero. O HTML segue a tela em perspectiva durante toda a
 * abertura, e quando a câmera assenta a homografia vira a identidade: não há
 * troca nenhuma, sempre foi o mesmo site.
 *
 * Só funciona porque nada da cena fica NA FRENTE da tela vista de onde a
 * câmera passa (ela está acima da base e de frente). Quando a tela vira de
 * costas para a câmera, o HTML some; ver `opacidadeDeFrente`. */

import * as THREE from 'three';

export type Ponto = { x: number; y: number };
export type Caixa = { left: number; top: number; width: number; height: number };

/** matrix3d que leva o retângulo (0,0)-(w,h) para o quadrilátero
 *  [cima-esq, cima-dir, baixo-dir, baixo-esq], com transform-origin 0 0. */
export function homografia(w: number, h: number, q: Ponto[]): string {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  let a, b, c, d, e, f, g, i;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = p1.x - p0.x; b = p3.x - p0.x; c = p0.x;
    d = p1.y - p0.y; e = p3.y - p0.y; f = p0.y;
    g = 0; i = 0;
  } else {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det;
    i = (dx1 * dy3 - dx3 * dy1) / det;
    a = p1.x - p0.x + g * p1.x; b = p3.x - p0.x + i * p3.x; c = p0.x;
    d = p1.y - p0.y + g * p1.y; e = p3.y - p0.y + i * p3.y; f = p0.y;
  }
  /* Do quadrado unitário para pixels do elemento: divide as colunas de u
     por w e as de v por h. */
  a /= w; d /= w; g /= w;
  b /= h; e /= h; i /= h;
  const n = (v: number) => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(10));
  return `matrix3d(${n(a)},${n(d)},0,${n(g)},${n(b)},${n(e)},0,${n(i)},0,0,1,0,${n(c)},${n(f)},0,1)`;
}

const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _c = new THREE.Vector3();

/** Cantos de um retângulo w x h centrado na origem da malha, em pixels. */
export function projetarCantos(
  malha: THREE.Object3D, w: number, h: number, camera: THREE.Camera, vw: number, vh: number,
): Ponto[] {
  return [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => {
    _v.set((sx * w) / 2, (sy * h) / 2, 0);
    malha.localToWorld(_v).project(camera);
    return { x: (_v.x * 0.5 + 0.5) * vw, y: (-_v.y * 0.5 + 0.5) * vh };
  });
}

/** 1 com a tela de frente para a câmera, 0 de lado ou de costas. A rampa
 *  existe porque de quina o quadrilátero degenera e a matriz explode. */
export function opacidadeDeFrente(malha: THREE.Object3D, camera: THREE.Camera): number {
  _n.set(0, 0, 1).transformDirection(malha.matrixWorld);
  malha.getWorldPosition(_c);
  const olhar = _v.copy(camera.position).sub(_c).normalize();
  const k = (_n.dot(olhar) - 0.12) / 0.2;
  return k < 0 ? 0 : k > 1 ? 1 : k;
}

/** Aplica a tela viva ao elemento. `caixa` é onde ele está SEM transform. */
export function colarNaTela(
  el: HTMLElement, caixa: Caixa, cantos: Ponto[] | null, opacidade: number,
) {
  /* Nunca 0 de verdade: com opacidade zero o navegador não desenha a camada,
     e o primeiro desenho da mesa inteira (~130ms) caía bem no instante em
     que a tela acende. Com 0,002 ela já é desenhada no carregamento, e
     ninguém enxerga. */
  el.style.opacity = Math.max(0.002, opacidade).toFixed(3);
  if (!cantos || opacidade <= 0) {
    el.style.transform = '';
    return;
  }
  const rel = cantos.map((p) => ({ x: p.x - caixa.left, y: p.y - caixa.top }));
  el.style.transformOrigin = '0 0';
  el.style.transform = homografia(caixa.width, caixa.height, rel);
}

/** Onde o elemento fica sem a transformação da tela viva.
 *
 *  Calculado, não medido: o portal centraliza a tela num `fixed inset: 0`, e
 *  getBoundingClientRect incluiria a transformação dos ancestrais. Logo que a
 *  página abre, o `.portal__viewport` ainda está na subida de entrada (1,1s
 *  de transição), e a medida feita nessa hora deslocava o site para cima da
 *  tela 3D pelo resto da abertura. */
export function medirCaixa(el: HTMLElement, largura?: number, altura?: number): Caixa {
  const width = el.offsetWidth, height = el.offsetHeight;
  const raiz = document.documentElement;
  /* `largura`/`altura`: o tamanho da cena (100svh). No celular ele difere da
     altura da janela, que muda com a barra de endereço; centralizar por ela
     faria o site escorregar em relação à tela 3D durante a rolagem. */
  return {
    left: ((largura ?? raiz.clientWidth) - width) / 2,
    top: ((altura ?? raiz.clientHeight) - height) / 2,
    width,
    height,
  };
}

/** Devolve o elemento ao CSS (fim da abertura, desmontagem, perda de
 *  contexto): quem manda nele daí em diante é o portal. */
export function soltarTela(el: HTMLElement | null) {
  if (!el) return;
  el.style.transform = '';
  el.style.transformOrigin = '';
  el.style.opacity = '';
  /* O will-change fica: tirá-lo rebaixa a camada e obriga o navegador a
     redesenhar o hero inteiro justo no quadro em que a abertura termina. */
}
