'use client';

/* MacbookIntro3D — a cena que roda ANTES do MacbookPortal e termina exatamente
 * onde ele começa.
 *
 * ---------------------------------------------------------------- decisões
 *
 * 1. three.js puro, sem @react-three/fiber.
 *    É a primeira coisa que pinta no site. R3F + drei custam ~150KB gz e um
 *    passo de reconciliação por quadro para uma cena de 9 malhas sem
 *    interatividade nenhuma. Nada aqui precisa de árvore React. Bônus: o
 *    mesmo `laptop-scene.ts` roda numa página HTML solta, o que foi como a
 *    calibração do handoff foi conferida (erro medido: 0,00 px).
 *
 * 2. Guiada por rolagem, sem tween.
 *    Tudo é função pura de `intro` (0..1), lido de scrollY a cada quadro.
 *    Rolar rápido pula, rolar de volta desfaz, e nenhum quadro "deve"
 *    animação: dá para chegar ao site na velocidade que a pessoa quiser.
 *
 * 3. O handoff é calibração de câmera, não medição.
 *    Ver o comentário grande em `solveFinalPose` / `solveCameraPose`.
 *    Resumo: a câmera termina PERPENDICULAR ao plano da tela (plano paralelo
 *    ao plano de imagem projeta retângulo, nunca trapézio) e a distância sai
 *    de equação, não de tentativa. O retângulo alvo é o que o CSS do portal
 *    já desenha no p=0: centrado, largura 100vw*startScale, aspecto do SVG.
 *
 * 4. Adesivos: atlas único montado em canvas. Ver comentário em STICKERS.
 *
 * O componente não renderiza o portal nem o SVG — ele só ocupa a tela com um
 * <canvas> fixo e avisa, por `onHandoff`, o quanto o portal já deve estar
 * aparecendo. Quem monta o quê continua sendo o MacbookPortal.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  buildLaptop, makeStickerAtlas, makeEnvironment, poseLaptop, PHASES, BOOT, cameraT,
  lerpFov, screenRectTarget, solveFinalPose, heroPose, applyCamera,
  FOV_HERO, GEO, type LaptopModel, type Pose,
} from './laptop-scene';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export type MacbookIntro3DProps = {
  /** O MESMO valor passado ao MacbookPortal. É o alvo do handoff. */
  startScale?: number;
  /** Quanta rolagem a cena 3D consome, em vh. */
  introVh?: number;
  /** Pasta dos PNGs dos adesivos. */
  stickersBase?: string;
  /** 0..1: o quanto o conteúdo HTML já deve estar aceso DENTRO da tela do
   *  laptop. Não é cross-fade — o canvas continua na tela, atrás. */
  onHandoff?: (boot: number) => void;
  /** Primeiro quadro pintado: o pai pode esconder o SVG de espera. */
  onReady?: () => void;
};

export default function MacbookIntro3D({
  startScale = 0.56,
  introVh = 100,
  stickersBase = '/tech-stickers/',
  onHandoff,
  onReady,
}: MacbookIntro3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Callbacks em ref: o loop não deve remontar quando o pai re-renderiza. */
  const cbRef = useRef({ onHandoff, onReady });
  cbRef.current = { onHandoff, onReady };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    /* Teto de 1.75: em telas 3x o custo de fragmento triplica sem ganho
       visível numa cena de superfícies lisas. */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const env = makeEnvironment(renderer);
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(FOV_HERO, 1, 0.02, 30);

    const key = new THREE.DirectionalLight(0xdce6ff, 3.2); key.position.set(0.6, 1.1, 0.9);
    const rim = new THREE.DirectionalLight(0x5b9cff, 2.4); rim.position.set(-1.1, 0.5, -1.0);
    const hemi = new THREE.HemisphereLight(0x9fb6ff, 0x0a1020, 1.1);
    scene.add(key, rim, hemi);

    const model: LaptopModel = buildLaptop();
    scene.add(model.root);

    /* Sombra de contato falsa: um plano com degradê radial. Um shadow map de
       verdade custaria um passe de render inteiro por quadro para uma mancha
       que sai de quadro antes do handoff. */
    const shadowCv = document.createElement('canvas');
    shadowCv.width = shadowCv.height = 128;
    const sctx = shadowCv.getContext('2d')!;
    const rg = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = rg; sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCv);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(GEO.BASE_W * 2.1, GEO.BASE_D * 2.3),
      new THREE.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false, map: shadowTex,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.0016;
    scene.add(shadow);

    /* O atlas chega quando chega. Até lá a tampa é alumínio limpo — nada
       bloqueia o primeiro quadro esperando imagem. */
    let disposed = false;
    makeStickerAtlas(stickersBase).then((tex) => {
      if (disposed) { tex.dispose(); return; }
      model.stickers.material.map = tex;
      model.stickers.material.needsUpdate = true;
      dirty = true;
    });

    let vw = 0, vh = 0, dirty = true, lastIntro = -1, lastFade = -1, first = true;
    let finalPose: Pose = heroPose(model), hero: Pose = finalPose, lidFinal = 84;

    /* O solve é caro (18 bissecções). Depende só de viewport e startScale,
       então roda no resize — nunca por quadro. */
    function solve() {
      const rect = screenRectTarget(vw, vh, startScale);
      const saved = model.lid.rotation.x;
      const out = solveFinalPose(model, camera, rect, vh);
      finalPose = out.pose; lidFinal = out.lidFinal;
      hero = heroPose(model);
      model.lid.rotation.x = saved;
      model.root.rotation.set(0, 0, 0);
    }

    function resize() {
      /* Mede do elemento raiz: num mount dentro de iframe ou antes do layout,
         innerHeight pode ser 0, e TODO o resto deriva daqui — uma divisão por
         zero aqui contamina câmera e CSS com NaN de forma irreversível. */
      vw = document.documentElement.clientWidth || window.innerWidth;
      vh = document.documentElement.clientHeight || window.innerHeight;
      if (!vw || !vh) return;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      solve();
      dirty = true;
    }

    let raf = 0;
    function tick() {
      if (!vw || !vh) { resize(); return; }
      const travel = (introVh / 100) * vh;
      const intro = reduced || travel <= 0
        ? 1
        : clamp01(window.scrollY / travel);
      /* "boot": o conteúdo acende DENTRO da tela do laptop. Começa só depois
         de a câmera assentar (PHASES.camera termina em 0.86) — antes disso a
         tela 3D ainda se move e o conteúdo, que está fixo no retângulo
         resolvido, apareceria desencaixado dela. */
      const boot = reduced ? 1 : range(intro, ...BOOT);

      if (boot !== lastFade) cbRef.current.onHandoff?.(boot);
      /* Nada mudou: não redesenha. Numa rolagem parada o custo por quadro cai
         a zero e a GPU do celular para de esquentar. */
      if (!dirty && intro === lastIntro && boot === lastFade) return;
      lastIntro = intro; lastFade = boot; dirty = false;

      poseLaptop(model, intro, lidFinal);
      const t = reduced ? 1 : cameraT(intro);
      camera.fov = lerpFov(t);
      camera.updateProjectionMatrix();
      applyCamera(camera, hero, finalPose, t >= 0.999 ? 1 : t);

      shadow.material.opacity = 0.5 * (1 - range(intro, ...PHASES.settle));
      shadow.visible = shadow.material.opacity > 0.01;

      renderer.render(scene, camera);
      if (first) { first = false; cbRef.current.onReady?.(); }
    }

    /* Perda de contexto (troca de GPU, aba em segundo plano por muito tempo):
       em vez de deixar um canvas preto por cima do site, entrega o portal. */
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      canvas.style.display = 'none';
      cbRef.current.onHandoff?.(1);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    /* O desenho não depende só de rAF: em aba em segundo plano ou iframe
       oculto o rAF pode disparar uma vez e nunca mais, e a cena congelaria no
       primeiro quadro. rAF quando há, e scroll/resize chamando tick() direto. */
    function loop() { raf = requestAnimationFrame(loop); tick(); }
    const onScroll = () => { dirty = true; tick(); };
    const ro = new ResizeObserver(() => { resize(); dirty = true; tick(); });
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    ro.observe(document.documentElement);
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      /* Libera tudo: depois do handoff o portal é de mão única, então nada
         disso volta a ser usado e não faz sentido segurar VRAM. */
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          const std = m as THREE.MeshStandardMaterial;
          std.map?.dispose();
          m.dispose();
        }
      });
      env.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, [startScale, introVh, stickersBase]);

  return (
    /* Posicionamento e escala vivem no CSS (.portal__scene), não aqui: quem
       precisa mandar neles é o zoom do portal, que é CSS puro. Ver globals. */
    <canvas ref={canvasRef} aria-hidden className="portal__scene" />
  );
}
