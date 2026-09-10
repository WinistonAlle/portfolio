'use client';

/* CardSwap do React Bits, adaptado:
   - React 19 dispensa forwardRef — `ref` é prop normal;
   - o CSS mora em globals.css, junto do resto dos estilos custom;
   - respeita prefers-reduced-motion (empilha e para, sem rodar o carrossel);
   - a limpeza mata a timeline do gsap, não só o interval. */

import {
  Children,
  cloneElement,
  createRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import gsap from 'gsap';

export const Card = ({ customClass, ...rest }) => (
  <div
    {...rest}
    className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
);
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  fadeOnDrop = false,
  children,
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length],
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef(undefined);
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) =>
      placeNow(
        r.current,
        makeSlot(i, cardDistance, verticalDistance, total),
        skewAmount,
      ),
    );

    /* Empilhado e parado já é uma composição legível — quem pediu menos
       movimento fica com a pilha estática em vez de um carrossel acelerado. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease,
      });

      /* Sem isso o cartão que cai varre a seção de baixo por dois segundos.
         Com isso ele some enquanto desce, que é o que uma janela fechando
         faz — e volta a aparecer já atrás da pilha. Ease próprio: elastic
         estoura o intervalo 0–1 do opacity. */
      if (fadeOnDrop) {
        tl.to(
          elFront,
          { opacity: 0, duration: config.durDrop * 0.55, ease: 'power2.in' },
          0,
        );
      }

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length,
      );
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return',
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        'return',
      );

      if (fadeOnDrop) {
        tl.to(
          elFront,
          { opacity: 1, duration: config.durReturn * 0.5, ease: 'power2.out' },
          'return',
        );
      }

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    const node = container.current;
    const pause = () => {
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };
    const resume = () => {
      tlRef.current?.play();
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };

    if (pauseOnHover) {
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
    }

    return () => {
      if (pauseOnHover) {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
      }
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    fadeOnDrop,
  ]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child,
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
