import type { CSSProperties } from 'react';

// Tipos escritos à mão para o componente JS em StrokeText.jsx (mesma
// convenção de CardSwap, Lanyard e StackGraph).
export interface StrokeTextProps {
  /** Texto renderizado como glifos SVG medidos. */
  text?: string;
  /** Cor do contorno que é traçado. */
  strokeColor?: string;
  /** Cor que preenche as letras depois do traço. */
  fillColor?: string;
  strokeWidth?: number;
  /** Segundos que cada contorno leva para ser desenhado. */
  drawDuration?: number;
  /** Espera, em segundos, entre o fim do traço e o início do preenchimento. */
  fillDelay?: number;
  /** Atraso em segundos entre uma letra e a seguinte. */
  stagger?: number;
  ease?: string;
  /** Quando a animação dispara. */
  trigger?: 'mount' | 'hover' | 'scroll' | 'loop';
  /** Como o preenchimento aparece. */
  fillMode?: 'fade' | 'wipe' | 'none';
  fontSize?: number | string;
  fontWeight?: number | string;
  letterSpacing?: number | string;
  /** Faz o stagger correr da última letra para a primeira. */
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare const StrokeText: (props: StrokeTextProps) => JSX.Element;
export default StrokeText;
