// Tipos escritos à mão para o componente JS em StackGraph.jsx (mesma
// convenção de CardSwap e Lanyard). Sem isso o TS infere cada prop pelo
// default e recusa valores reais.
export interface StackGraphProps {
  /** Segundos para uma volta completa da órbita automática. */
  rotationSeconds?: number;
  /** Opacidade dos nós fora de foco quando algum nó está sob o cursor. */
  dimOpacity?: number;
  className?: string;
}

declare const StackGraph: (props: StackGraphProps) => JSX.Element;
export default StackGraph;
