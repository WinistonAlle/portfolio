/* phone-scene.ts — o celular da abertura no mobile: modelo, pose e câmera.
 *
 * É o irmão do `laptop-scene.ts` e segue as mesmas regras: three.js puro, sem
 * React, tudo função pura do progresso da rolagem, e o fim calibrado por
 * equação para a tela 3D cair EXATAMENTE no retângulo onde o portal acende a
 * tela inicial do iPhone.
 *
 * A diferença que manda em tudo: a tela do celular tem o aspecto da própria
 * viewport. O que acende dentro dela é a home em tamanho de celular reduzida
 * por igual nos dois eixos, então a tela 3D precisa ter a mesma proporção da
 * viewport de quem está olhando. Por isso o modelo é montado a partir do
 * aspecto medido, e não de medidas fixas de um iPhone.
 *
 * Unidades: metros, y para cima, tela virada para +z.
 */

import * as THREE from 'three';
import { desenharWA, type Pose } from '@/components/macbook/laptop-scene';

const DEG = Math.PI / 180;

/* Largura da tela acesa de um iPhone 16 Pro, e as bordas em volta dela. */
const SCREEN_W = 0.0664;
const BEZEL = 0.0021;
const BODY_T = 0.0083;
/* Raio dos cantos da tela em fração da largura: é o mesmo número que o CSS
   usa para arredondar o portal (--screen-round), senão o conteúdo e a tela 3D
   teriam cantos diferentes no instante da troca. */
export const SCREEN_ROUND = 0.13;

export type PhoneModel = {
  root: THREE.Group;
  screen: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>;
  screenW: number;
  screenH: number;
};

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Monta o celular para uma tela de aspecto `alto / largo`. */
export function buildPhone(aspect: number): PhoneModel {
  const root = new THREE.Group();
  root.name = 'phone';

  const screenH = SCREEN_W * aspect;
  const bodyW = SCREEN_W + BEZEL * 2;
  const bodyH = screenH + BEZEL * 2;
  const bodyR = SCREEN_W * SCREEN_ROUND + BEZEL;

  /* Titânio natural, no tom do alumínio do notebook: um titânio preto sumia
     no fundo escuro e o giro virava uma silhueta. Polido na moldura. */
  const titanio = new THREE.MeshStandardMaterial({
    name: 'titanium', color: 0xb0b4bc, metalness: 0.9, roughness: 0.24, envMapIntensity: 1.35,
  });
  /* Vidro traseiro fosco com verniz por cima (clearcoat): o fosco dá a cor, e
     o verniz dá o brilho que corre pela peça enquanto ela gira. */
  const vidroTras = new THREE.MeshPhysicalMaterial({
    name: 'back-glass', color: 0x8f949e, metalness: 0.25, roughness: 0.5,
    clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1.1,
  });
  /* O platô das câmeras é o mesmo vidro, só que polido. */
  const vidroPlato = new THREE.MeshPhysicalMaterial({
    name: 'camera-plateau', color: 0x9a9fa9, metalness: 0.3, roughness: 0.2,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.3,
  });
  const aco = new THREE.MeshStandardMaterial({
    name: 'steel', color: 0xdfe2e7, metalness: 0.78, roughness: 0.3, envMapIntensity: 1.6,
  });
  const preto = new THREE.MeshStandardMaterial({
    name: 'black', color: 0x020203, metalness: 0, roughness: 0.3, envMapIntensity: 0.5,
  });
  const escuro = new THREE.MeshStandardMaterial({
    name: 'dark', color: 0x16181d, metalness: 0.3, roughness: 0.6,
  });
  /* Faixas de antena: plástico um tom mais escuro que o titânio. */
  const antena = new THREE.MeshStandardMaterial({
    name: 'antenna', color: 0x7e838c, metalness: 0.2, roughness: 0.6,
  });

  /* Vidro das lentes: uma textura radial com os anéis internos da objetiva,
     o reflexo azulado do tratamento e um brilho de janela. Um círculo preto
     chapado, como era, lê como furo e não como lente. */
  const lc = document.createElement('canvas');
  lc.width = lc.height = 256;
  const lx = lc.getContext('2d')!;
  const g = lx.createRadialGradient(128, 128, 4, 128, 128, 128);
  g.addColorStop(0, '#0b1226');
  g.addColorStop(0.22, '#05070e');
  g.addColorStop(0.34, '#1b2c55');
  g.addColorStop(0.42, '#060810');
  g.addColorStop(0.6, '#0a0e1a');
  g.addColorStop(0.68, '#27324f');
  g.addColorStop(0.74, '#05060b');
  g.addColorStop(1, '#010103');
  lx.fillStyle = g;
  lx.fillRect(0, 0, 256, 256);
  lx.globalCompositeOperation = 'lighter';
  const rf = lx.createRadialGradient(92, 84, 2, 92, 84, 60);
  rf.addColorStop(0, 'rgba(150,190,255,0.75)');
  rf.addColorStop(0.4, 'rgba(110,120,255,0.22)');
  rf.addColorStop(1, 'rgba(0,0,0,0)');
  lx.fillStyle = rf;
  lx.fillRect(0, 0, 256, 256);
  lx.strokeStyle = 'rgba(255,255,255,0.5)';
  lx.lineWidth = 5;
  lx.lineCap = 'round';
  lx.beginPath();
  lx.arc(128, 128, 96, Math.PI * 1.08, Math.PI * 1.38);
  lx.stroke();
  const lenteTex = new THREE.CanvasTexture(lc);
  lenteTex.colorSpace = THREE.SRGBColorSpace;
  const lente = new THREE.MeshStandardMaterial({
    name: 'lens', map: lenteTex, metalness: 0.5, roughness: 0.08, envMapIntensity: 1.8,
  });

  /* Igual à tela do notebook: acende com o giro, e só até um ponto, porque é
     o fundo do conteúdo que vai entrar por cima. */
  const tela = new THREE.MeshStandardMaterial({
    name: 'screen', color: 0x05070e, metalness: 0, roughness: 0.25, envMapIntensity: 0.4,
    emissive: new THREE.Color(0x0d1b3a), emissiveIntensity: 0,
  });

  /* Corpo: laje de cantos arredondados com bisel generoso, que é a borda
     lateral do aparelho. */
  const bevel = 0.0016;
  const corpoGeo = new THREE.ExtrudeGeometry(
    roundedRect(bodyW - bevel * 2, bodyH - bevel * 2, bodyR - bevel),
    { depth: BODY_T - bevel * 2, bevelEnabled: true, bevelThickness: bevel,
      bevelSize: bevel, bevelSegments: 4, curveSegments: 24 },
  );
  corpoGeo.center();
  corpoGeo.computeVertexNormals();
  root.add(new THREE.Mesh(corpoGeo, titanio));

  /* Frente: vidro preto inteiro, e a tela acesa por cima com os mesmos cantos
     do portal. */
  const frente = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(bodyW - 0.0006, bodyH - 0.0006, bodyR - 0.0003), 24), preto);
  frente.position.z = BODY_T / 2 + 0.0002;
  root.add(frente);

  const screen = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(SCREEN_W, screenH, SCREEN_W * SCREEN_ROUND), 24),
    tela,
  );
  screen.name = 'screen';
  screen.position.z = BODY_T / 2 + 0.0004;
  root.add(screen);

  /* Ilha dinâmica: só aparece enquanto a tela 3D está à vista. Quando o
     conteúdo acende por cima, quem desenha o topo do celular é o próprio iOS
     da página. */
  const ilha = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(SCREEN_W * 0.3, SCREEN_W * 0.09, SCREEN_W * 0.045), 16),
    preto,
  );
  ilha.position.set(0, screenH / 2 - SCREEN_W * 0.075, BODY_T / 2 + 0.0006);
  root.add(ilha);

  /* Traseira: vidro fosco, e o platô das câmeras no canto de cima. */
  const tras = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(bodyW - 0.0008, bodyH - 0.0008, bodyR - 0.0004), 24),
    vidroTras,
  );
  tras.rotation.y = Math.PI;
  tras.position.z = -BODY_T / 2 - 0.0002;
  root.add(tras);

  /* Monograma WA no centro das costas, onde o iPhone leva a maçã. Um plano
     com textura transparente, rente ao vidro; material liso e metálico, pra
     ele pegar reflexo no giro como um logo espelhado. */
  const waCv = document.createElement('canvas');
  waCv.width = waCv.height = 512;
  desenharWA(waCv.getContext('2d')!, 256, 256, 440);
  const waTex = new THREE.CanvasTexture(waCv);
  waTex.colorSpace = THREE.SRGBColorSpace;
  waTex.anisotropy = 8;
  const waLado = bodyW * 0.42;
  const wa = new THREE.Mesh(
    new THREE.PlaneGeometry(waLado, waLado),
    new THREE.MeshStandardMaterial({
      name: 'wa-logo', map: waTex, transparent: true, depthWrite: false,
      metalness: 0.5, roughness: 0.25, envMapIntensity: 1.3,
    }),
  );
  wa.rotation.y = Math.PI;
  wa.position.set(0, 0, -BODY_T / 2 - 0.0005);
  wa.renderOrder = 1;
  root.add(wa);

  /* ---------------------------------------------------------------- câmeras
     Platô de vidro polido no canto de cima, levantado do vidro fosco, com
     três objetivas, flash, sensor de profundidade e microfone. Cada objetiva
     é um anel de aço que sobe do platô, um aro preto por dentro e o vidro. */
  const platoLado = bodyW * 0.5;
  const platoAlt = 0.0011;
  const platoGeo = new THREE.ExtrudeGeometry(roundedRect(platoLado, platoLado, platoLado * 0.27), {
    depth: platoAlt, bevelEnabled: true, bevelThickness: 0.0005, bevelSize: 0.0005,
    bevelSegments: 3, curveSegments: 20,
  });
  const plato = new THREE.Mesh(platoGeo, vidroPlato);
  /* Visto de trás, o platô fica no canto de cima à esquerda; no sistema do
     modelo (tela para +z) isso é x positivo. */
  const platoX = bodyW / 2 - platoLado / 2 - 0.003;
  const platoY = bodyH / 2 - platoLado / 2 - 0.003;
  plato.rotation.y = Math.PI;
  plato.position.set(platoX, platoY, -BODY_T / 2 - 0.0002);
  root.add(plato);

  const zPlato = -BODY_T / 2 - 0.0002 - platoAlt - 0.0005;   // face de fora do platô
  const r = platoLado * 0.215;
  const deCostas = (m: THREE.Mesh, x: number, y: number, z: number) => {
    m.rotation.y = Math.PI;
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  const lentes: [number, number][] = [
    [platoX + platoLado * 0.215, platoY + platoLado * 0.215],
    [platoX + platoLado * 0.215, platoY - platoLado * 0.215],
    [platoX - platoLado * 0.215, platoY],
  ];
  for (const [x, y] of lentes) {
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r, 0.002, 40), aco);
    anel.rotation.x = Math.PI / 2;
    anel.position.set(x, y, zPlato - 0.001);
    root.add(anel);
    /* O aro de aço fica com 20% do raio à vista: mais fino que isso ele some
       a esta distância e a objetiva volta a parecer um furo preto. */
    deCostas(new THREE.Mesh(new THREE.CircleGeometry(r * 0.8, 40), preto), x, y, zPlato - 0.00202);
    deCostas(new THREE.Mesh(new THREE.CircleGeometry(r * 0.7, 40), lente), x, y, zPlato - 0.00206);
  }

  /* Flash (dois tons, com aro), sensor de profundidade e microfone, na
     coluna livre do platô. */
  const colX = platoX - platoLado * 0.215;
  const flashY = platoY + platoLado * 0.3;
  deCostas(new THREE.Mesh(new THREE.CircleGeometry(r * 0.36, 28), aco), colX, flashY, zPlato - 0.00004);
  deCostas(
    new THREE.Mesh(
      new THREE.CircleGeometry(r * 0.29, 28),
      new THREE.MeshStandardMaterial({ name: 'flash', color: 0xf3e9c8, roughness: 0.35, emissive: 0x4a3f1c, emissiveIntensity: 0.5 }),
    ),
    colX, flashY, zPlato - 0.00008,
  );
  deCostas(new THREE.Mesh(new THREE.CircleGeometry(r * 0.32, 28), preto), colX, platoY - platoLado * 0.3, zPlato - 0.00004);
  deCostas(new THREE.Mesh(new THREE.CircleGeometry(r * 0.07, 12), preto), platoX + platoLado * 0.02, platoY + platoLado * 0.02, zPlato - 0.00004);

  /* ------------------------------------------------------------- moldura */
  /* Botões em pílula: a cápsula é achatada na largura e esticada na
     espessura do aparelho, como o botão de verdade. Ação e volume à esquerda
     (visto de frente), power à direita. */
  const botao = (y: number, h: number, lado: 1 | -1, mat: THREE.Material = titanio, salto = 0.00035) => {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.0008, h, 6, 14), mat);
    b.scale.set(0.55, 1, 2.1);
    b.position.set(lado * (bodyW / 2 + salto), y, 0);
    root.add(b);
  };
  botao(bodyH * 0.31, bodyH * 0.03, -1);
  botao(bodyH * 0.2, bodyH * 0.065, -1);
  botao(bodyH * 0.095, bodyH * 0.065, -1);
  botao(bodyH * 0.17, bodyH * 0.1, 1);
  /* Controle da câmera: rente à moldura e mais escuro, embaixo do power. */
  botao(-bodyH * 0.12, bodyH * 0.06, 1, escuro, -0.0002);

  /* Linhas de antena: quatro faixas finas que cortam a moldura perto dos
     cantos, duas nas laterais e duas em cima e embaixo. */
  const faixa = 0.0011, fundo = BODY_T * 0.86;
  for (const lado of [-1, 1]) {
    for (const y of [bodyH / 2 - bodyR * 1.25, -bodyH / 2 + bodyR * 1.25]) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.0006, faixa, fundo), antena);
      f.position.set(lado * (bodyW / 2 - 0.00022), y, 0);
      root.add(f);
    }
  }
  for (const [x, y] of [[-bodyW / 2 + bodyR * 1.3, bodyH / 2], [bodyW / 2 - bodyR * 1.3, -bodyH / 2]] as const) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(faixa, 0.0006, fundo), antena);
    f.position.set(x, y - Math.sign(y) * 0.00022, 0);
    root.add(f);
  }

  /* Base: porta USB-C no centro e os furos do alto-falante e do microfone. */
  const usb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0012, 0.0058, 6, 14), preto);
  usb.rotation.z = Math.PI / 2;
  usb.scale.set(1, 1, 0.9);
  usb.position.set(0, -bodyH / 2 + 0.0005, 0);
  root.add(usb);
  const furo = new THREE.CylinderGeometry(0.00052, 0.00052, 0.0012, 12);
  for (const lado of [-1, 1]) {
    for (let i = 0; i < (lado === 1 ? 5 : 3); i++) {
      const f = new THREE.Mesh(furo, preto);
      f.position.set(lado * (0.0085 + i * 0.0021), -bodyH / 2 + 0.0004, 0);
      root.add(f);
    }
  }

  /* Câmera frontal dentro da ilha dinâmica: um ponto de vidro com reflexo. */
  const selfie = new THREE.Mesh(new THREE.CircleGeometry(SCREEN_W * 0.028, 24), lente);
  selfie.position.set(SCREEN_W * 0.085, screenH / 2 - SCREEN_W * 0.075, BODY_T / 2 + 0.00075);
  root.add(selfie);

  return { root, screen, screenW: SCREEN_W, screenH };
}

/* ------------------------------------------------------------- coreografia */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* O celular começa de costas, inclinado, mostrando as câmeras, e gira até a
   tela ficar de frente. A câmera aproxima junto e assenta antes de a tela
   acender: a regra é a mesma do notebook, conteúdo não acende sobre uma tela
   que ainda se mexe. */
export const PHASES = {
  spin: [0.0, 0.72] as [number, number],
  luz: [0.3, 0.72] as [number, number],
  camera: [0.05, 0.8] as [number, number],
};
export const BOOT: [number, number] = [0.8, 0.97];

export const cameraT = (p: number) => easeInOut(range(p, ...PHASES.camera));

/** O quanto a tela já acendeu; é também a opacidade da tela inicial colada
 *  nela (tela-viva.ts). */
export const brilhoTela = (p: number) => easeOut(range(p, ...PHASES.luz));

export function posePhone(model: PhoneModel, p: number) {
  const giro = 1 - easeInOut(range(p, ...PHASES.spin));
  /* Mais de meia volta: começa passando das costas, de lado, e o giro
     atravessa a traseira inteira antes de mostrar a tela. */
  model.root.rotation.y = (180 + 32) * DEG * giro;
  model.root.rotation.x = 14 * DEG * giro;
  model.root.rotation.z = -9 * DEG * giro;
  model.screen.material.emissiveIntensity = 1.15 * brilhoTela(p);
}

/* ------------------------------------------------------------- câmera */
export const FOV_HERO = 30;
export const FOV_FINAL = 18;

export function lerpFov(t: number): number {
  const a = Math.tan((FOV_HERO * DEG) / 2), b = Math.tan((FOV_FINAL * DEG) / 2);
  return (2 * Math.atan(a + (b - a) * t)) / DEG;
}

/** Pose final: perpendicular à tela, na distância em que a altura dela
 *  ocupa exatamente `alvoH` dos `vh` pixels da viewport. */
export function solveFinalPose(model: PhoneModel, alvoH: number, vh: number): Pose {
  model.root.rotation.set(0, 0, 0);
  model.root.updateWorldMatrix(true, true);
  const c = new THREE.Vector3().setFromMatrixPosition(model.screen.matrixWorld);
  const visivelH = model.screenH * (vh / alvoH);
  const d = visivelH / 2 / Math.tan((FOV_FINAL * DEG) / 2);
  return {
    position: c.clone().add(new THREE.Vector3(0, 0, d)),
    target: c.clone(),
    up: new THREE.Vector3(0, 1, 0),
  };
}

/** Pose de abertura: um pouco mais longe e de lado, com a lente aberta, pra
 *  o giro ter volume. */
export function heroPose(final: Pose): Pose {
  const d = final.position.distanceTo(final.target);
  return {
    position: final.target.clone().add(new THREE.Vector3(d * 0.16, d * 0.08, d * 0.8)),
    target: final.target.clone().add(new THREE.Vector3(0, -0.004, 0)),
    up: new THREE.Vector3(0, 1, 0),
  };
}
