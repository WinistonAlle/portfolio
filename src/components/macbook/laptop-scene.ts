/* laptop-scene.js — modelo + pose + solve de câmera.
 *
 * Este arquivo é three.js puro, SEM React e SEM @react-three/fiber. Foi uma
 * escolha, não preguiça: esta cena é a primeira coisa que pinta no site, e o
 * reconciler do R3F + drei custa ~150KB gz e um passo de reconciliação por
 * quadro para uma cena que tem 9 malhas e nenhuma interatividade. Nada aqui
 * precisa de árvore React. O componente .tsx é só uma casca de ciclo de vida
 * em volta destas funções — e a vantagem prática é que este mesmo arquivo
 * roda na prévia HTML e no Next, sem duas versões para divergir.
 *
 * Unidades: metros, y para cima, laptop centrado na origem em X/Z.
 */

import * as THREE from 'three';

export type Rect = { w: number; h: number; cx: number; cy: number; x: number; y: number };
export type Pose = { position: THREE.Vector3; target: THREE.Vector3; up: THREE.Vector3 };
export type LaptopModel = {
  root: THREE.Group;
  lid: THREE.Group;
  screen: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  stickers: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  backlight: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  materials: Record<string, THREE.MeshStandardMaterial>;
};

const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ medidas
 * Vêm do SVG (viewBox 650x400) para que o 3D e o fallback SVG descrevam o
 * MESMO objeto. Se a moldura SVG mudar, mude aqui e o handoff continua de pé.
 */
export const SVG = {
  screenW: 501.22, screenH: 323.85,          // área acesa
  lidTop: 13.18, lidBottom: 363, lidLeft: 66.46, lidRight: 584,
  screenTop: 21.32, screenBottom: 345.17,
  baseLeft: 19.04, baseRight: 630.96, baseStripTop: 350.51, baseBottom: 387,
};
export const SCREEN_ASPECT = SVG.screenW / SVG.screenH;      // 1.5477

const SCREEN_H = 0.216;                                      // ~13" na diagonal
const SCREEN_W = SCREEN_H * SCREEN_ASPECT;
const LID_W = SCREEN_W * ((SVG.lidRight - SVG.lidLeft) / SVG.screenW);
const LID_H = SCREEN_H * ((SVG.lidBottom - SVG.lidTop) / SVG.screenH);
/* A tela não é centrada na tampa: sobra mais queixo embaixo que testa em
   cima. Mesmo desalinho do SVG, em fração da altura da tampa. */
const SCREEN_OFFSET_Y =
  (((SVG.lidBottom - SVG.screenBottom) - (SVG.screenTop - SVG.lidTop)) / 2 /
    (SVG.lidBottom - SVG.lidTop)) * LID_H;

const LID_T = 0.0042;      // espessura da tampa
const BASE_W = LID_W * 1.06;
const BASE_D = LID_H * 0.955;
const BASE_T = 0.016;

export const GEO = { SCREEN_W, SCREEN_H, LID_W, LID_H, BASE_W, BASE_D, BASE_T };

/* --------------------------------------------------------------- primitivas */
function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);        s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);        s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);            s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* Laje de cantos arredondados com bisel nas quinas — é o bisel que faz o
   alumínio pegar luz na borda; sem ele a peça lê como caixa de papelão. */
function slab(w: number, h: number, d: number, r: number, bevel = 0.0012): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, r), {
    depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 2, curveSegments: 10,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/* Perfil de cunha visto de lado: topo reto (o deck precisa ser plano para o
   teclado), barriga subindo em direção à frente. É esse recorte que faz a
   peça ler como notebook fino em vez de tijolo — a silhueta carrega o objeto
   muito mais que qualquer material. */
function wedgeProfile(d: number, tBack: number, lift: number, r: number) {
  const s = new THREE.Shape();
  const x0 = -d / 2, x1 = d / 2;
  s.moveTo(x0 + r, 0);
  s.lineTo(x1 - r * 2, lift * 0.72);
  s.quadraticCurveTo(x1, lift, x1, lift + r);
  s.lineTo(x1, tBack - r);
  s.quadraticCurveTo(x1, tBack, x1 - r, tBack);
  s.lineTo(x0 + r, tBack);
  s.quadraticCurveTo(x0, tBack, x0, tBack - r);
  s.lineTo(x0, r);
  s.quadraticCurveTo(x0, 0, x0 + r, 0);
  return s;
}

/* --------------------------------------------------------------- adesivos
 * TÉCNICA: atlas único montado em <canvas> em runtime.
 *
 * Por que não Decal do drei: cada decal faz raycast na malha e gera geometria
 * nova projetada; são 6 malhas + 6 materiais transparentes a mais, e o custo
 * de projeção acontece exatamente no pior momento (primeiro paint).
 * Por que não 6 planos: 6 draw calls, 6 materiais e z-fighting a resolver um
 * a um contra uma superfície que tem bisel.
 * O atlas é UMA textura, UM material, UM draw call, e a "bagunça de propósito"
 * é só rotate/scale no contexto 2D — mais fácil de ajustar do que transform 3D.
 * Custo medido: ~25ms uma vez, fora do caminho do primeiro paint (a textura
 * entra quando carrega; até lá a tampa é só alumínio).
 */
const STICKERS = [
  // x, y em fração do atlas; s = largura em fração da largura do atlas; rot em graus
  { file: 'react.png',    x: 0.29, y: 0.40, s: 0.205, rot: -9 },
  { file: 'python.png',   x: 0.615, y: 0.28, s: 0.170, rot: 7 },
  { file: 'docker.png',   x: 0.455, y: 0.665, s: 0.190, rot: -16 },
  { file: 'claude.png',   x: 0.795, y: 0.615, s: 0.150, rot: 12 },   // quase na borda
  { file: 'n8n.png',      x: 0.185, y: 0.735, s: 0.150, rot: -4 },
  { file: 'apple-v2.png', x: 0.795, y: 0.215, s: 0.155, rot: 19 },
];

export async function makeStickerAtlas(baseUrl = '/tech-stickers/'): Promise<THREE.CanvasTexture> {
  const W = 1024, H = Math.round(1024 * (LID_H / LID_W));
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  const imgs = await Promise.all(STICKERS.map((s) => new Promise<HTMLImageElement | null>((res) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = baseUrl + s.file;
  })));

  imgs.forEach((im, i) => {
    if (!im) return;
    const s = STICKERS[i];
    const w = s.s * W, h = w * (im.height / im.width);
    ctx.save();
    ctx.translate(s.x * W, s.y * H);
    ctx.rotate(s.rot * DEG);
    /* Sombra curta: adesivo colado tem espessura, e sem isso ele lê como
       textura impressa no alumínio em vez de vinil por cima. */
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = w * 0.05;
    ctx.shadowOffsetY = w * 0.012;
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ----------------------------------------------------------------- modelo */
export function buildLaptop(): LaptopModel {
  const root = new THREE.Group();
  root.name = 'laptop';

  const alu = new THREE.MeshStandardMaterial({
    name: 'aluminum', color: 0xb2b7bf, metalness: 0.78, roughness: 0.31,
    envMapIntensity: 1.15,
  });
  const aluDark = new THREE.MeshStandardMaterial({
    name: 'anodized', color: 0x1a1d23, metalness: 0.6, roughness: 0.5,
  });
  /* `emissive` existe porque, enquanto o site não acende, esta malha era um
     painel preto: o notebook abria mostrando uma tela morta. Agora ela acende
     junto com a tampa, então em nenhum momento parece desligado. A intensidade
     é dirigida em poseLaptop. */
  const glass = new THREE.MeshStandardMaterial({
    name: 'screen', color: 0x05070e, metalness: 0.0, roughness: 0.42,
    envMapIntensity: 0.35,
    emissive: new THREE.Color(0x0d1b3a), emissiveIntensity: 0,
  });
  const rubber = new THREE.MeshStandardMaterial({
    name: 'rubber', color: 0x0b0d11, metalness: 0, roughness: 0.9,
  });
  const keycap = new THREE.MeshStandardMaterial({
    name: 'keycap', color: 0x17191e, metalness: 0.25, roughness: 0.72,
  });

  /* --- base ---
     Cunha extrudada na largura, não laje: topo plano para o teclado, barriga
     subindo para a frente. */
  const baseGeo = new THREE.ExtrudeGeometry(
    wedgeProfile(BASE_D, BASE_T, BASE_T * 0.46, 0.0045),
    { depth: BASE_W, bevelEnabled: true, bevelThickness: 0.0012,
      bevelSize: 0.0012, bevelSegments: 2, curveSegments: 10 },
  );
  baseGeo.translate(0, 0, -BASE_W / 2);
  baseGeo.rotateY(-Math.PI / 2);          // eixo do perfil vira Z, extrusão vira X
  baseGeo.computeVertexNormals();
  const base = new THREE.Mesh(baseGeo, alu);
  base.name = 'base';
  root.add(base);

  /* ------------------------------------------------------------- teclado
   * Layout de verdade, não grade. O que faz um teclado ler como teclado é
   * justamente o que não é regular: fileira de função em meia altura, teclas
   * de largura variável nas pontas de cada fileira, barra de espaço, e o
   * cluster de setas em T invertido com cima/baixo em meia altura. Uma grade
   * NxM regular denuncia o render em qualquer tamanho.
   *
   * Larguras em "u" (1u = uma tecla comum). Toda fileira soma 14,5u, que é
   * o que mantém as bordas alinhadas sem eu posicionar nada na mão.
   */
  const U = 14.5;                       // largura do teclado, em u
  /* Anotado, e não inferido: sem isto `w` vira `(string | number)[]`, o
     `item === 'arrows'` não estreita o ramo `else` para número, e a conta de
     largura não compila. */
  type Row = { h: number; w: (number | 'arrows')[] };
  const ROWS: Row[] = [
    { h: 0.62, w: [1.25, 1,1,1,1,1,1,1,1,1,1,1,1, 1.25] },
    { h: 1,    w: [1,1,1,1,1,1,1,1,1,1,1,1,1, 1.5] },
    { h: 1,    w: [1.5, 1,1,1,1,1,1,1,1,1,1,1,1] },
    { h: 1,    w: [1.75, 1,1,1,1,1,1,1,1,1,1, 1.75] },
    { h: 1,    w: [2.25, 1,1,1,1,1,1,1,1,1, 2.25] },
    { h: 1,    w: [1,1,1, 1.25, 5, 1.25, 1, 'arrows'] },
  ];

  const KB_W = BASE_W * 0.80;
  const u = KB_W / U;
  const KB_D = ROWS.reduce((a, r) => a + r.h, 0) * u;
  const KB_Z = -BASE_D / 2 + 0.019 + KB_D / 2;   // logo abaixo da dobradiça
  const GAP = 0.13;                              // fresta entre teclas, em u

  /** Cada tecla como {x, z, w, d} em metros, relativo ao centro do teclado. */
  const layout: { x: number; z: number; w: number; d: number }[] = [];
  let cz = -KB_D / 2;
  for (const row of ROWS) {
    const rh = row.h * u;
    let cx = -KB_W / 2;
    for (const item of row.w) {
      if (item === 'arrows') {
        /* T invertido: esquerda e direita inteiras, cima e baixo empilhadas
           na mesma coluna, cada uma com metade da altura. */
        layout.push({ x: cx + u / 2, z: cz + rh / 2, w: u, d: rh });
        layout.push({ x: cx + u * 1.5, z: cz + rh * 0.25, w: u, d: rh / 2 });
        layout.push({ x: cx + u * 1.5, z: cz + rh * 0.75, w: u, d: rh / 2 });
        layout.push({ x: cx + u * 2.5, z: cz + rh / 2, w: u, d: rh });
        cx += u * 3;
      } else {
        layout.push({ x: cx + item * u / 2, z: cz + rh / 2, w: item * u, d: rh });
        cx += item * u;
      }
    }
    cz += rh;
  }

  /* +1.8mm e não +0.4mm: o bisel da extrusão levanta o topo da base em
     1.2mm, e abaixo disso o deck fica enterrado dentro da peça. */
  const deckY = BASE_T + 0.0018;

  /* Retroiluminação: um canvas pintado com o halo de cada tecla, num plano
     logo abaixo delas. As teclas por cima tapam o miolo do halo e sobra o
     contorno aceso — que é exatamente como retroiluminação aparece de fora.
     Material básico (não recebe luz) para a luz não escurecer junto com a
     cena; o brilho é modulado por cor no poseLaptop, então o teclado ACENDE
     conforme a tampa abre. Custo: uma textura, um draw call. */
  const PX = 1400;
  const bl = document.createElement('canvas');
  bl.width = PX; bl.height = Math.round(PX * KB_D / KB_W);
  const bx = bl.getContext('2d')!;
  const sx = PX / KB_W, sz = bl.height / KB_D;
  bx.fillStyle = '#07090d';
  bx.fillRect(0, 0, bl.width, bl.height);
  bx.shadowColor = 'rgba(198,222,255,0.85)';
  for (const k of layout) {
    const w = (k.w - GAP * u) * sx, h = (k.d - GAP * u) * sz;
    const x = (k.x + KB_W / 2) * sx - w / 2, y = (k.z + KB_D / 2) * sz - h / 2;
    bx.shadowBlur = u * sx * 0.42;
    bx.fillStyle = 'rgba(206,226,255,0.92)';
    bx.beginPath();
    bx.roundRect(x, y, w, h, u * sx * 0.16);
    bx.fill();
  }
  const blTex = new THREE.CanvasTexture(bl);
  blTex.colorSpace = THREE.SRGBColorSpace;
  blTex.anisotropy = 8;
  const backlight = new THREE.Mesh(
    new THREE.PlaneGeometry(KB_W, KB_D),
    new THREE.MeshBasicMaterial({ name: 'backlight', map: blTex, toneMapped: false }),
  );
  backlight.name = 'backlight';
  backlight.rotation.x = -90 * DEG;
  backlight.position.set(0, deckY, KB_Z);
  backlight.material.color.setScalar(0.18);
  root.add(backlight);

  /* Teclas agrupadas por tamanho: uma InstancedMesh por formato. Escalar uma
     geometria única deformaria o arredondamento das teclas largas (a barra de
     espaço tem 5u), e são só ~7 grupos — 7 draw calls para ~78 teclas. */
  const groups = new Map<string, typeof layout>();
  for (const k of layout) {
    const id = k.w.toFixed(4) + 'x' + k.d.toFixed(4);
    (groups.get(id) ?? groups.set(id, []).get(id)!).push(k);
  }
  const mtx = new THREE.Matrix4();
  const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(-90 * DEG, 0, 0));
  const one = new THREE.Vector3(1, 1, 1);
  for (const [, list] of groups) {
    const { w, d } = list[0];
    const geo = slab(w - GAP * u, d - GAP * u, 0.0013, u * 0.13, 0.00035);
    const im = new THREE.InstancedMesh(geo, keycap, list.length);
    im.name = 'keys';
    list.forEach((k, n) => {
      mtx.compose(new THREE.Vector3(k.x, deckY + 0.0011, KB_Z + k.z), rot, one);
      im.setMatrixAt(n, mtx);
    });
    im.instanceMatrix.needsUpdate = true;
    root.add(im);
  }

  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(KB_W * 0.38, BASE_D * 0.27), aluDark);
  pad.name = 'trackpad';
  pad.rotation.x = -90 * DEG;
  pad.position.set(0, deckY, KB_Z + KB_D / 2 + 0.010 + BASE_D * 0.135);
  root.add(pad);

  for (const [sx, sz] of [[-1, -1], [1, -1]]) {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0035, 0.0035, 0.0022, 12), rubber);
    foot.name = 'foot';
    foot.position.set(sx * BASE_W * 0.42, -0.0011, sz * BASE_D * 0.40);
    root.add(foot);
  }

  /* --- tampa ---
     Pivô na dobradiça, no fundo da base. A tampa cresce em +Y a partir do
     pivô, então rotation.x = (90 - ângulo) graus: 90 = fechada, 0 = vertical,
     -15 = aberta a 105. */
  const lid = new THREE.Group();
  lid.name = 'lid';
  lid.position.set(0, BASE_T + LID_T / 2 + 0.0009, -BASE_D / 2 + 0.006);
  root.add(lid);

  const shell = new THREE.Mesh(slab(LID_W, LID_H, LID_T, 0.011), alu);
  shell.name = 'lid-shell';
  shell.position.y = LID_H / 2;
  lid.add(shell);

  /* Moldura preta + área acesa. A malha 'screen' é a referência de tudo: é
     dela que saem os 4 cantos usados na conferência do handoff. */
  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(LID_W - 0.004, LID_H - 0.004), aluDark);
  bezel.name = 'bezel';
  bezel.position.set(0, LID_H / 2, LID_T / 2 + 0.0004);
  lid.add(bezel);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), glass);
  screen.name = 'screen';
  screen.position.set(0, LID_H / 2 + SCREEN_OFFSET_Y, LID_T / 2 + 0.0009);
  lid.add(screen);

  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, LID_W * 0.55, 20), aluDark);
  hinge.name = 'hinge';
  hinge.rotation.z = 90 * DEG;
  hinge.position.copy(lid.position);
  root.add(hinge);

  /* Plano dos adesivos na face de TRÁS da tampa, 0.6mm afastado. Girado 180°
     em Y: assim o texto do atlas lê certo para quem está atrás. */
  const stickers = new THREE.Mesh(
    new THREE.PlaneGeometry(LID_W, LID_H),
    new THREE.MeshStandardMaterial({
      name: 'stickers', transparent: true, roughness: 0.55, metalness: 0.05,
      depthWrite: false, opacity: 0,
    }),
  );
  stickers.name = 'stickers';
  stickers.rotation.y = 180 * DEG;
  stickers.position.set(0, LID_H / 2, -LID_T / 2 - 0.0006);
  stickers.renderOrder = 1;
  lid.add(stickers);

  return { root, lid, screen, stickers, backlight,
    materials: { alu, aluDark, glass, rubber, keycap } };
}

/* Ambiente sem HDRI: um degradê equiretangular 16x64 passado pelo PMREM.
   Custa ~3ms e uns poucos KB de RAM, contra 1-4MB de um .hdr baixado. É o
   suficiente para o alumínio ter céu em cima e chão embaixo. */
export function makeEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const w = 16, h = 64, data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    /* Estúdio, não noite: alumínio com metalness alto é quase 100% reflexo do
       ambiente — com env escuro ele fica preto por mais luz direta que se
       jogue. Topo claro (softbox), horizonte aceso, chão escuro. */
    const top = [196, 210, 236], bot = [10, 13, 22], horizon = [120, 150, 205];
    const k = Math.pow(Math.max(0, 1 - Math.abs(t - 0.46) / 0.5), 2.2);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const base = top[c] + (bot[c] - top[c]) * Math.pow(t, 0.9);
        data[i + c] = Math.min(255, base + horizon[c] * k * 0.55);
      }
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, w, h);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

/* ------------------------------------------------------------- coreografia
 * Tudo é função pura de p (0..1). Nenhum tween, nenhuma duração: rolar rápido
 * pula, rolar de volta desfaz, e o quadro nunca "deve" animação a ninguém.
 */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* Ângulo final da tampa: os 105 graus pedidos.
 *
 * Já foram 84 por um tempo. O motivo era o handoff para a moldura SVG: com a
 * câmera perpendicular à tela (o que garante retângulo em vez de trapézio),
 * uma tampa em 105 deixa a câmera ~15° acima do plano da base e mostra o
 * teclado inteiro embaixo da tela — coisa que o SVG não tinha, então a
 * silhueta pulava na troca.
 *
 * Sem a moldura SVG no fim, essa restrição deixou de existir: não há silhueta
 * para casar, só o RETÂNGULO DA TELA, que continua exato por construção. O
 * teclado aparecendo embaixo do site agora é o efeito desejado, não um
 * problema. Fica registrado porque é a única razão pela qual voltar aos 105
 * é seguro.
 */
export const LID_OPEN = 105;
export const LID_FINAL = 105;

/* Quanto o SVG mostra de deck escuro entre a tela e a aresta da frente, e
   quanto mostra de base no total. O primeiro é o alvo do solver. */
export const SVG_DECK_RATIO = (SVG.baseStripTop - SVG.screenBottom) / SVG.screenH;
export const SVG_BASE_RATIO = (SVG.baseBottom - SVG.screenBottom) / SVG.screenH;

/* A câmera termina em 0.62, e não em 0.86 como na primeira versão.
   A regra continua valendo (o conteúdo só pode acender depois de a câmera
   assentar, senão aparece desencaixado da tela que ainda se move), mas antes
   isso deixava 87% da rolagem de intro com a tela do notebook apagada. A
   coreografia inteira foi comprimida para a frente: o site entra em 0.62 e
   sobra um terço da intro já com ele aceso. */
/* As fases ocupam a rolagem INTEIRA da intro, e não o primeiro terço dela.

   A versão anterior terminava o movimento em 42% e deixava os 58% restantes
   sem ação nenhuma, só esperando o zoom engatar. Agora o giro e a abertura são
   esticados até o fim: descer a tela é o que faz o notebook girar e abrir, do
   primeiro ao último pixel de rolagem, e o zoom começa assim que a tampa
   termina. Nenhum trecho de rolagem sem nada acontecendo. */
export const PHASES: Record<string, [number, number]> = {
  spin:   [0.00, 0.42],
  open:   [0.24, 0.82],
  settle: [0.62, 0.84],
  camera: [0.14, 0.84],
  fade:   [0.84, 1.00],
};

/* A home acende no fim da abertura e termina de acender junto com a intro, de
   modo que o zoom engata no quadro seguinte.

   A regra física continua de pé: não dá pra acender antes de a câmera parar,
   senão o conteúdo (que está preso num retângulo fixo e centrado) aparece
   descolado da tela 3D, que ainda está se movendo. Por isso `camera` termina
   em 0.84 e o conteúdo entra em 0.84. */
export const BOOT: [number, number] = [0.84, 0.99];

/** Curva do movimento de câmera. Exposta porque a página precisa da MESMA
 *  curva para a lente e para a pose. */
export const cameraT = (p: number) => easeInOut(range(p, ...PHASES.camera));

export function poseLaptop(model: LaptopModel, p: number, lidFinal = LID_FINAL) {
  const spin = 1 - easeInOut(range(p, ...PHASES.spin));
  model.root.rotation.y = 180 * DEG * spin;
  /* Uma inclinação sobrando no começo, que zera junto com o giro: é ela que
     faz a coisa parecer um objeto pousado na mesa e não um poster girando. */
  model.root.rotation.z = -3.5 * DEG * spin;

  const opened = easeOut(range(p, ...PHASES.open));
  const settled = easeInOut(range(p, ...PHASES.settle));
  const angle = LID_OPEN * opened + (lidFinal - LID_OPEN) * settled;
  model.lid.rotation.x = (90 - angle) * DEG;
  model.root.rotation.x = 4 * DEG * spin;
  /* A retroiluminação acende junto com a abertura — a tampa levantando é o
     gesto que liga o aparelho. */
  model.backlight.material.color.setScalar(0.18 + 0.82 * opened);
  /* A tela acende com a tampa. Vai só até 1.15 porque ela é o FUNDO do site
     que entra por cima: acesa demais, vazaria uma borda clara em volta do
     conteúdo no momento do handoff. */
  model.screen.material.emissiveIntensity = 1.15 * opened;

  /* Os adesivos só existem enquanto dá para vê-los: apagar o material depois
     do giro tira um blend transparente de cada quadro da parte mais pesada. */
  model.stickers.material.opacity = model.stickers.material.map
    ? clamp01(1 - range(p, 0.30, 0.44) * 1) * 1
    : 0;
  model.stickers.visible = model.stickers.material.opacity > 0.01;
  return { p, angle, spin };
}

/* ------------------------------------------------------- solve de câmera
 * O HANDOFF.
 *
 * O portal já sabe onde a tela vai ficar: no p=0 dele, `.portal__screen` é
 * centrada na viewport, largura 100vw * startScale, altura dividida pelo
 * aspecto. Então o alvo é um retângulo conhecido em pixels — e em vez de medir
 * o 3D e mandar para o CSS, resolvo a câmera para cair nesse retângulo.
 *
 * Duas coisas fazem isso ser exato e não calibração no olho:
 *
 * 1. A câmera termina OLHANDO NA NORMAL DA TELA. Um plano paralelo ao plano de
 *    imagem projeta sempre um retângulo perfeito (nunca trapézio), com
 *    qualquer FOV e qualquer distância. Sem isso, nenhum recorte retangular
 *    de CSS encosta nos 4 cantos.
 * 2. A distância sai de uma equação, não de tentativa: a altura visível no
 *    plano da tela precisa ser alturaTela * (viewportH / alvoH), e
 *    d = (visívelH/2) / tan(fov/2).
 *
 * Consequência: resize, mudança de aspecto, mudança de startScale ou de FOV
 * são todos absorvidos automaticamente. Não existe número mágico para
 * envelhecer.
 */
export function screenRectTarget(vw: number, vh: number, startScale: number): Rect {
  const w = vw * startScale;
  const h = w / SCREEN_ASPECT;
  return { w, h, cx: vw / 2, cy: vh / 2, x: (vw - w) / 2, y: (vh - h) / 2 };
}

const _c = new THREE.Vector3(), _n = new THREE.Vector3(), _u = new THREE.Vector3();

/** Pose de câmera que faz `screen` cair exatamente em `rect`. */
export function solveCameraPose(
  model: LaptopModel, camera: THREE.PerspectiveCamera, rect: Rect, vh: number,
): Pose {
  model.root.updateWorldMatrix(true, true);
  const m = model.screen.matrixWorld;
  _c.setFromMatrixPosition(m);
  _n.set(0, 0, 1).transformDirection(m).normalize();
  _u.set(0, 1, 0).transformDirection(m).normalize();
  const visibleH = SCREEN_H * (vh / rect.h);
  const d = visibleH / 2 / Math.tan(camera.fov * DEG / 2);
  return {
    position: _c.clone().addScaledVector(_n, d),
    target: _c.clone(),
    up: _u.clone(),
  };
}

/* Duas lentes, não uma.
 *
 * Abertura em grande-angular (34°): dá volume, faz a tampa vir na direção de
 * quem olha, é o que torna o giro interessante.
 * Fim em teleobjetiva (14°): com a câmera quase no plano da base, uma
 * grande-angular ampliaria a aresta da frente (mais perto da lente) e a base
 * sairia 40% mais larga que a tela — o SVG mostra 22%. Fechando para 14° a
 * ampliação cai para ~9% e as duas silhuetas encostam.
 * A lente é interpolada junto com a câmera, então é um zoom, não um corte. */
export const FOV_HERO = 34;
export const FOV_FINAL = 20;

/** Pose de abertura: órbita alta em grande-angular, enquadrando o objeto
 *  fechado. Não precisa ser exata — exata só a final. */
export function heroPose(model?: LaptopModel, az = -24, el = 44): Pose {
  const target = new THREE.Vector3(0, GEO.BASE_T * 0.5, -GEO.BASE_D * 0.06);
  const d = (GEO.LID_H * 1.95 / 2) / Math.tan(FOV_HERO * DEG / 2);
  const off = new THREE.Vector3(0, 0, d);
  off.applyAxisAngle(new THREE.Vector3(1, 0, 0), -el * DEG);
  off.applyAxisAngle(new THREE.Vector3(0, 1, 0), az * DEG);
  return { position: target.clone().add(off), target, up: new THREE.Vector3(0, 1, 0) };
}

/* Pose final da câmera.
 *
 * O handoff, em duas garantias:
 *  1. A câmera termina PERPENDICULAR ao plano da tela. Um plano paralelo ao
 *     plano de imagem projeta sempre um retângulo perfeito — nunca trapézio —
 *     com qualquer FOV e qualquer distância.
 *  2. A distância sai de equação, não de tentativa (ver solveCameraPose).
 * Resize, aspecto, startScale e FOV são todos absorvidos. Sem número mágico.
 */
export function solveFinalPose(
  model: LaptopModel, camera: THREE.PerspectiveCamera, rect: Rect, vh: number,
): { pose: Pose; lidFinal: number } {
  camera.fov = FOV_FINAL;
  camera.updateProjectionMatrix();
  model.root.rotation.set(0, 0, 0);
  model.lid.rotation.x = (90 - LID_FINAL) * DEG;
  return { pose: solveCameraPose(model, camera, rect, vh), lidFinal: LID_FINAL };
}

const _sa = new THREE.Spherical(), _sb = new THREE.Spherical(), _v = new THREE.Vector3();
const _t = new THREE.Vector3();

/** Mistura duas poses; em t=1 a câmera é EXATAMENTE a resolvida.
 *
 * Interpolação esférica em volta do alvo, não linear entre as posições: a reta
 * entre a órbita alta e a pose final passa POR DENTRO do notebook — no meio
 * do caminho a câmera furava a tampa e o enquadramento perdia o objeto. Em
 * coordenadas esféricas o mesmo movimento vira um arco por fora. O raio
 * interpola em log porque vai de ~0,4m a ~2,4m: linear passaria quase todo o
 * percurso longe e a aproximação ficaria toda no fim. */
export function applyCamera(
  camera: THREE.PerspectiveCamera, hero: Pose, final: Pose, t: number,
): void {
  if (t >= 1) {
    camera.position.copy(final.position);
    camera.up.copy(final.up);
    camera.lookAt(final.target);
    return;
  }
  _sa.setFromVector3(_v.copy(hero.position).sub(hero.target));
  _sb.setFromVector3(_v.copy(final.position).sub(final.target));
  _t.lerpVectors(hero.target, final.target, t);
  let dTheta = _sb.theta - _sa.theta;
  while (dTheta > Math.PI) dTheta -= Math.PI * 2;
  while (dTheta < -Math.PI) dTheta += Math.PI * 2;
  camera.position.setFromSphericalCoords(
    Math.exp(Math.log(_sa.radius) + (Math.log(_sb.radius) - Math.log(_sa.radius)) * t) *
      /* barriga no meio do arco: a tampa abrindo cresce em quadro justo
         quando a câmera passa mais perto, e sem isso ela sai cortada */
      (1 + 0.3 * Math.sin(Math.PI * t)),
    _sa.phi + (_sb.phi - _sa.phi) * t,
    _sa.theta + dTheta * t,
  ).add(_t);
  camera.up.lerpVectors(hero.up, final.up, t).normalize();
  camera.lookAt(_t);
}

/** Lente interpolada em espaço de tangente — é o que faz o zoom parecer
 *  contínuo em vez de acelerar no fim. */
export function lerpFov(t: number): number {
  const a = Math.tan(FOV_HERO * DEG / 2), b = Math.tan(FOV_FINAL * DEG / 2);
  return 2 * Math.atan(a + (b - a) * t) / DEG;
}

/** Os 4 cantos da tela em pixels de viewport — só para conferência/debug. */
export function projectScreen(
  model: LaptopModel, camera: THREE.PerspectiveCamera, vw: number, vh: number,
) {
  const g = model.screen.geometry.parameters as { width: number; height: number };
  const pts = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => {
    const v = new THREE.Vector3(sx * g.width / 2, sy * g.height / 2, 0);
    model.screen.localToWorld(v).project(camera);
    return { x: (v.x * 0.5 + 0.5) * vw, y: (-v.y * 0.5 + 0.5) * vh };
  });
  return pts;
}

