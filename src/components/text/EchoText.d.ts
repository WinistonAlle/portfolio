import type { CSSProperties } from 'react';

// Tipos escritos à mão para o componente JS em EchoText.jsx (mesma convenção
// de CardSwap, Lanyard, StackGraph e StrokeText).
export interface EchoTextProps {
  text?: string;
  /** Quantidade de cópias fantasma atrás do texto da frente (0 a 24). */
  echoes?: number;
  /** Quanto mais alto, mais devagar os ecos profundos perseguem o alvo. */
  lag?: number;
  /** Distância em px usada na entrada e na reação ao cursor. */
  offset?: number;
  /** De onde a trilha se recolhe na entrada. */
  direction?: 'right' | 'left' | 'up' | 'down' | 'diagonal';
  /** Queda de opacidade de um eco para o seguinte. */
  fade?: number;
  /** Desfoque máximo, em px, no eco mais profundo. */
  blur?: number;
  /** Cor misturada nos ecos; `false` mantém a cor do texto. */
  tint?: string | false;
  /** Se roda a entrada, a reação ao cursor, ou as duas. */
  mode?: 'entrance' | 'pointer' | 'both';
  /** Distância, em px, em que o cursor puxa o texto ao deslocamento cheio. */
  cursorRadius?: number;
  /** Duração da entrada, em ms. */
  duration?: number;
  ease?: 'linear' | 'ease-out' | 'ease-in-out' | 'snappy';
  fontSize?: string | number;
  fontWeight?: string | number;
  /** Cor do texto da frente. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

declare const EchoText: (props: EchoTextProps) => JSX.Element;
export default EchoText;
