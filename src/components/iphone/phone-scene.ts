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
import type { Pose } from '@/components/macbook/laptop-scene';

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
     no fundo escuro e o giro virava uma silhueta. */
  const titanio = new THREE.MeshStandardMaterial({
    name: 'titanium', color: 0xa4a8b0, metalness: 0.82, roughness: 0.3, envMapIntensity: 1.25,
  });
  const vidroTras = new THREE.MeshStandardMaterial({
    name: 'back-glass', color: 0x8c9099, metalness: 0.35, roughness: 0.42, envMapIntensity: 1,
  });
  const preto = new THREE.MeshStandardMaterial({
    name: 'black', color: 0x020203, metalness: 0, roughness: 0.3, envMapIntensity: 0.5,
  });
  const lente = new THREE.MeshStandardMaterial({
    name: 'lens', color: 0x10141f, metalness: 0.6, roughness: 0.06, envMapIntensity: 2.2,
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

  const platoLado = bodyW * 0.47;
  const plato = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(platoLado, platoLado, platoLado * 0.24), {
      depth: 0.0012, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004, bevelSegments: 2, curveSegments: 16,
    }),
    titanio,
  );
  /* Visto de trás, o platô fica no canto de cima à esquerda; no sistema do
     modelo (tela para +z) isso é x positivo. */
  const platoX = bodyW / 2 - platoLado / 2 - 0.0028;
  const platoY = bodyH / 2 - platoLado / 2 - 0.0028;
  plato.rotation.y = Math.PI;
  plato.position.set(platoX, platoY, -BODY_T / 2 - 0.0002);
  root.add(plato);

  const r = platoLado * 0.2;
  const lentes: [number, number][] = [
    [platoX + platoLado * 0.22, platoY + platoLado * 0.22],
    [platoX + platoLado * 0.22, platoY - platoLado * 0.22],
    [platoX - platoLado * 0.22, platoY],
  ];
  for (const [x, y] of lentes) {
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, 0.0022, 32), titanio);
    anel.rotation.x = Math.PI / 2;
    anel.position.set(x, y, -BODY_T / 2 - 0.0018);
    root.add(anel);
    const vidro = new THREE.Mesh(new THREE.CircleGeometry(r * 0.78, 32), lente);
    vidro.rotation.y = Math.PI;
    vidro.position.set(x, y, -BODY_T / 2 - 0.0030);
    root.add(vidro);
  }
  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(r * 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0xe8e2cf, roughness: 0.4 }),
  );
  flash.rotation.y = Math.PI;
  flash.position.set(platoX - platoLado * 0.22, platoY + platoLado * 0.3, -BODY_T / 2 - 0.0016);
  root.add(flash);

  /* Botões laterais: ação e volume à esquerda, power à direita. */
  const botao = (y: number, h: number, lado: 1 | -1) => {
    const b = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.0007, h, 4, 10),
      titanio,
    );
    b.position.set(lado * (bodyW / 2 + 0.0003), y, 0);
    root.add(b);
  };
  botao(bodyH * 0.3, bodyH * 0.035, -1);
  botao(bodyH * 0.19, bodyH * 0.07, -1);
  botao(bodyH * 0.08, bodyH * 0.07, -1);
  botao(bodyH * 0.16, bodyH * 0.11, 1);

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
