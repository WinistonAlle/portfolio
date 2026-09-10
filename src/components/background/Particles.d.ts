// Hand-written types for the JS component in Particles.jsx.
export interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  /** 0 (the default) matches the display. */
  pixelRatio?: number;
  /** World units the field drifts per viewport scrolled. 0 disables parallax. */
  scrollParallax?: number;
  /** Ceiling for the total parallax drift, in world units. 0 is unbounded. */
  scrollParallaxCap?: number;
  /** Extra roll, in radians, applied across one viewport of scroll. */
  scrollRoll?: number;
  className?: string;
}

declare const Particles: (props: ParticlesProps) => JSX.Element;
export default Particles;
