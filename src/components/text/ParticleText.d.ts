import type { CSSProperties } from 'react';

// Tipos escritos à mão para o componente JS em ParticleText.jsx (mesma
// convenção de CardSwap, Lanyard, StackGraph, StrokeText e EchoText).
export interface ParticleTextProps {
  text?: string;
  /** Tamanho de cada partícula, em px. */
  particleSize?: number;
  /** Passo da amostragem: menor = mais partículas e mais custo. */
  density?: number;
  color?: string;
  /** Segunda cor, misturada ao longo do campo de partículas. */
  highlightColor?: string;
  /** Distância de onde as partículas partem antes de se juntarem. */
  scatter?: number;
  /** Duração da convergência, em ms. */
  gatherDuration?: number;
  /** Atraso máximo por partícula antes de começar a se juntar, em ms. */
  stagger?: number;
  /** Força com que o cursor empurra as partículas. */
  pointerRepel?: number;
  /** Raio de influência do cursor, em px. */
  repelRadius?: number;
  /** Movimento residual depois que o texto se forma. */
  idleDrift?: number;
  /** O que faz o efeito se repetir depois da primeira formação. */
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  /** 'inherit' espera a fonte do container antes de amostrar. */
  fontFamily?: string;
  /** Brilho suave nas partículas, na cor de destaque. */
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare const ParticleText: (props: ParticleTextProps) => JSX.Element;
export default ParticleText;
