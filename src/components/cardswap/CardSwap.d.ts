import type { CSSProperties, ReactNode, Ref } from 'react';

export interface CardProps {
  customClass?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export declare const Card: (props: CardProps) => JSX.Element;

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  /** Faz o cartão que cai desaparecer no caminho, em vez de varrer o que vem
   *  logo abaixo da seção. */
  fadeOnDrop?: boolean;
  children: ReactNode;
}

declare const CardSwap: (props: CardSwapProps) => JSX.Element;
export default CardSwap;
