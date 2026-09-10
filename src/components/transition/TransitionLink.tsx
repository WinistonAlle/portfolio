'use client';

/* Link normal do Next (prefetch no hover continua valendo) que sequestra o
   clique simples para passar pela cortina de pixels. Cmd/ctrl/shift-clique,
   botão do meio e target="_blank" seguem o caminho nativo. */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePixelTransition } from './PixelTransition';

type Props = ComponentProps<typeof Link>;

export default function TransitionLink({ onClick, ...props }: Props) {
  const { navigate } = usePixelTransition();

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === '_blank'
        ) {
          return;
        }

        const href =
          typeof props.href === 'string' ? props.href : props.href.pathname;
        if (!href || href.startsWith('http')) return;

        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
