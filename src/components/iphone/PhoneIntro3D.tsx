'use client';

/* PhoneIntro3D: a abertura do mobile. Um celular girando enquanto a pessoa
 * rola, que termina com a tela exatamente onde a tela inicial do iPhone
 * acende, e daí o portal dá o zoom pra dentro dela.
 *
 * Mesmo desenho do MacbookIntro3D (ver os comentários de lá): three.js puro,
 * guiado pela rolagem, só redesenha quando algo mudou, e avisa o portal por
 * `onHandoff` o quanto o conteúdo já deve estar aceso. */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { applyCamera, makeEnvironment } from '@/components/macbook/laptop-scene';
import {
  BOOT, brilhoTela, buildPhone, cameraT, heroPose, lerpFov, posePhone, solveFinalPose, FOV_HERO,
} from './phone-scene';
import {
  colarNaTela, medirCaixa, opacidadeDeFrente, projetarCantos, soltarTela, type Caixa,
} from '@/components/macbook/tela-viva';
import { alturaVh } from '@/components/macbook/altura-estavel';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export default function PhoneIntro3D({
  startScale,
  introVh,
  onHandoff,
  onReady,
}: {
  /** O MESMO valor passado ao portal: a fração da altura que a tela ocupa. */
  startScale: number;
  introVh: number;
  onHandoff?: (boot: number) => void;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHandoff, onReady });
  useEffect(() => {
    cbRef.current = { onHandoff, onReady };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    /* Celular tem tela 3x: 1.5 já é nítido numa cena lisa e custa metade. */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const env = makeEnvironment(renderer);
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(FOV_HERO, 1, 0.005, 10);

    const key = new THREE.DirectionalLight(0xdce6ff, 3); key.position.set(0.5, 1, 1.2);
    const rim = new THREE.DirectionalLight(0x5b9cff, 3); rim.position.set(-1.2, 0.4, -0.8);
    const hemi = new THREE.HemisphereLight(0x9fb6ff, 0x0a1020, 1.1);
    scene.add(key, rim, hemi);

    let model: ReturnType<typeof buildPhone> | null = null;
    /* A tela inicial vai colada na tela 3D desde que ela acende
       (tela-viva.ts), como no notebook. */
    const telaHtml = canvas.closest('.portal')?.querySelector<HTMLElement>('.portal__screen') ?? null;
    if (telaHtml) telaHtml.style.willChange = 'transform, opacity';
    let caixa: Caixa | null = null;
    let vw = 0, vh = 0, dirty = true, first = true, lastIntro = -1, lastBoot = -1;
    let final = { position: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) };
    let hero = final;

    const descartar = (m: NonNullable<typeof model>) => {
      scene.remove(m.root);
      m.root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          (x as THREE.MeshStandardMaterial).map?.dispose();
          x.dispose();
        }
      });
    };

    /* O canvas mede 100svh (CSS), e é dele que sai tudo: a barra de endereço
       do Safari aparece e some durante a rolagem e mudaria innerHeight a cada
       vez, refazendo o modelo no meio do giro. Só largura nova refaz. */
    function resize() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      if (!w || !h) return;
      /* A caixa do portal muda quando ele descobre o aspecto da tela, que
         chega depois deste componente montar: mede sempre. */
      if (telaHtml) caixa = medirCaixa(telaHtml, canvas!.clientWidth, canvas!.clientHeight);
      if (w === vw && h === vh && model) return;
      vw = w; vh = h;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      if (model) descartar(model);
      model = buildPhone(vh / vw);
      scene.add(model.root);
      final = solveFinalPose(model, vh * startScale, vh);
      hero = heroPose(final);
      dirty = true;
    }

    function tick() {
      if (!model) { resize(); if (!model) return; }
      const travel = (introVh / 100) * alturaVh();
      const intro = travel > 0 ? clamp01(window.scrollY / travel) : 1;
      const boot = range(intro, ...BOOT);
      if (boot !== lastBoot) cbRef.current.onHandoff?.(boot);
      if (!dirty && intro === lastIntro && boot === lastBoot) return;
      lastIntro = intro; lastBoot = boot; dirty = false;

      posePhone(model, intro);
      const t = cameraT(intro);
      camera.fov = lerpFov(t);
      camera.updateProjectionMatrix();
      applyCamera(camera, hero, final, t >= 0.999 ? 1 : t);
      renderer.render(scene, camera);

      if (telaHtml && caixa) {
        if (t >= 0.999) colarNaTela(telaHtml, caixa, null, 1);
        else {
          const brilho = brilhoTela(intro) * opacidadeDeFrente(model.screen, camera);
          const cantos = brilho > 0
            ? projetarCantos(model.screen, model.screenW, model.screenH, camera, vw, vh)
            : null;
          colarNaTela(telaHtml, caixa, cantos, brilho);
        }
      }
      if (first) { first = false; cbRef.current.onReady?.(); }
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      canvas.style.display = 'none';
      soltarTela(telaHtml);
      cbRef.current.onHandoff?.(1);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    let raf = 0;
    function loop() { raf = requestAnimationFrame(loop); tick(); }
    const onScroll = () => { dirty = true; tick(); };
    const ro = new ResizeObserver(() => { resize(); tick(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    ro.observe(canvas);
    /* Observador só da caixa do portal, separado do de cima: durante o zoom
       ela cresce a cada quadro, e isso não pode refazer a cena inteira. */
    const roCaixa = new ResizeObserver(() => {
      if (telaHtml) { caixa = medirCaixa(telaHtml, canvas.clientWidth, canvas.clientHeight); dirty = true; }
    });
    if (telaHtml) roCaixa.observe(telaHtml);
    resize();
    loop();

    return () => {
      soltarTela(telaHtml);
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      roCaixa.disconnect();
      if (model) descartar(model);
      env.dispose();
      renderer.dispose();
    };
  }, [startScale, introVh]);

  return <canvas ref={canvasRef} aria-hidden className="portal__scene" />;
}
