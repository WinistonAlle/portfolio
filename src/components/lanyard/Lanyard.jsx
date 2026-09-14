'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRapier,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

// Next serves these from /public, so they are plain URLs — no bundler asset
// rule (the Vite `assetsInclude` step from the React Bits README) is needed.
const CARD_GLB = '/card.glb';
const BAND_PNG = '/lanyard.png';

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

/**
 * R3F sizes the canvas from a ResizeObserver on its parent, but when the
 * scene remounts fast (e.g. navigating back to the home page, where the
 * chunk is already cached) that observer can miss its first callback and
 * the canvas is left stuck at the browser's 300x150 default — the badge
 * renders into a box a fraction of its real size and reads as "not there".
 * This mirrors the same measurement by hand so sizing never depends on
 * that race.
 */
function ForceCanvasSize() {
  const { gl, camera } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      gl.setSize(width, height, false);
      if (camera.isPerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [gl, camera]);

  return null;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  anchor = [0, 4, 0],
  paused = false,
  onReveal,
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* A cena renderiza desde o primeiro quadro (a física precisa rodar pra
     assentar), mas só APARECE depois que a corda para. Esconder por opacidade,
     e não desmontando, é o que permite a queda acontecer fora de vista. */
  const [visivel, setVisivel] = useState(false);
  /* Em ref porque quem chama passa função nova a cada render, e isso não pode
     virar motivo pra reexecutar o efeito de revelação. */
  const revelarRef = useRef(onReveal);
  revelarRef.current = onReveal;

  return (
    <div
      data-lanyard
      className={`relative z-0 flex h-full w-full items-center justify-center transition-opacity duration-500 ${
        visivel ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        /* No dedo o crachá é enfeite, não brinquedo.
         *
         * Arrastar o cartão chama `setPointerCapture`, e a partir daí o
         * gesto pertence ao canvas: quem encostava no crachá para rolar
         * ficava balançando o cordão no lugar de descer a página. O
         * `touch-action: pan-y` devolve a rolagem vertical ao navegador, e
         * os handlers do cartão saem no toque (mais abaixo), para o gesto
         * nunca chegar a ser capturado. */
        style={{ touchAction: isMobile ? 'pan-y' : 'none' }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ForceCanvasSize />
        <ambientLight intensity={Math.PI} />
        <Physics
          gravity={gravity}
          timeStep={isMobile ? 1 / 30 : 1 / 60}
          paused={paused}
        >
          <Band
            onSettled={() => {
              setVisivel(true);
              revelarRef.current?.();
            }}
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            anchor={anchor}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

// Purely cosmetic: the physics rope starts at `anchor`, which sits well
// inside the visible frame, leaving a gap of empty sky above the strap. This
// extends the same strip straight up past the anchor so it reads as
// disappearing off the top of the page instead of dangling from nothing.
const ANCHOR_EXTENSION = 14;

// Comprimento de cada um dos três trechos de corda entre a âncora e o crachá.
const ROPE_SEGMENT = 0.72;

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  anchor = [0, 4, 0],
  onSettled,
}) {
  const extension = useRef();
  /* Os corpos da corda nascem DEITADOS na horizontal ([0.5,0,0] até [2,0,0]),
     na altura da âncora, e é a gravidade que os derruba até o lugar. Desenhar
     esses primeiros quadros é a piscada do crachá "num lugar aleatório" antes
     de ele assentar. Aqui a gente avisa quando parou; quem esconde até lá é o
     componente de fora. */
  const assentado = useRef(false);
  const caiu = useRef(false);
  const quadros = useRef(0);
  const quietos = useRef(0);
  const [extensionCurve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = 'chordal';
    return c;
  });
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };
  const { nodes, materials } = useGLTF(CARD_GLB);
  const texture = useTexture(lanyardImage || BAND_PNG);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving.
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);

  // The band texture has to tile along the strap. Wrapping is set on a clone so
  // the cached texture useTexture hands back is never mutated.
  const bandTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [texture]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = 'chordal';
    return c;
  });
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useEffect(() => {
    extensionCurve.points[0].set(anchor[0], anchor[1], anchor[2]);
    extensionCurve.points[1].set(
      anchor[0],
      anchor[1] + ANCHOR_EXTENSION,
      anchor[2],
    );
    extension.current?.geometry.setPoints(extensionCurve.getPoints(2));
  }, [anchor, extensionCurve]);

  /* Comprimento de cada trecho da corda. Como são três, cada 0.1 daqui tira
     0.3 unidade de mundo da fita, o que é bastante: a altura visível toda do
     canvas tem só ~4.8 unidades. */
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ROPE_SEGMENT]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  /* Adianta a simulação antes do primeiro quadro visível.
   *
   * A corda leva cerca de um segundo de tempo real pra parar de balançar, e
   * como a cena fica escondida até lá, esse segundo virava "carregando" na
   * tela. Rodar os mesmos passos de física de uma vez custa menos de um
   * milissegundo (são cinco corpos) e entrega o crachá já parado no primeiro
   * quadro que a pessoa vê.
   *
   * Vai DEPOIS dos hooks de junta de propósito: efeitos rodam na ordem em que
   * são declarados, e sem as juntas criadas os passos só derrubariam os corpos
   * soltos, cada um pro seu lado. */
  const { world } = useRapier();
  useEffect(() => {
    if (!world) return;
    for (let i = 0; i < 180; i++) world.step();
  }, [world]);

  useEffect(() => {
    if (hovered) {
      if (!isMobile) document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation(),
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }

    if (!assentado.current && card.current) {
      /* A contagem só começa depois que o card DESCEU. Sem isso, com a física
         pausada (`paused`, quando a seção ainda não está ativa) o useFrame
         continua rodando, o teto de quadros estoura e o crachá apareceria
         exatamente no estado que este código existe pra esconder: deitado na
         horizontal, na altura da âncora. */
      if (!caiu.current) {
        caiu.current = card.current.translation().y < anchor[1] - 0.5;
      } else {
        quadros.current += 1;
        const v = card.current.linvel();
        const quase = Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z) < 0.8;
        /* Velocidade baixa sozinha não basta: ela também acontece no pico do
           balanço, no instante em que o card inverte o sentido. Por isso são
           6 quadros seguidos, e não um. */
        quietos.current = quase ? quietos.current + 1 : 0;
        /* Teto de quadros pra nunca ficar invisível pra sempre caso a corda
           não pare (aba em segundo plano acumulando delta, por exemplo). */
        if (quietos.current >= 6 || quadros.current > 360) {
          assentado.current = true;
          onSettled?.();
        }
      }
    }
  });

  return (
    <>
      <group position={anchor}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={isMobile ? undefined : () => hover(true)}
            onPointerOut={isMobile ? undefined : () => hover(false)}
            onPointerUp={
              isMobile
                ? undefined
                : (e) => (e.target.releasePointerCapture(e.pointerId), drag(false))
            }
            onPointerDown={
              isMobile
                ? undefined
                : (e) => (
                    e.target.setPointerCapture(e.pointerId),
                    drag(
                      new THREE.Vector3()
                        .copy(e.point)
                        .sub(vec.copy(card.current.translation())),
                    )
                  )
            }
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
      <mesh ref={extension}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-1, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB);
