// Hand-written types for the JS component in Lanyard.jsx. Without these, TS
// infers each prop's type from its `null` default and rejects real values.
export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  /** World position of the fixed rope anchor. The card rests ~1.9 units to its right. */
  anchor?: [number, number, number];
  /** Freezes the physics sim on its authored pose — the segments never fall until this flips to false. */
  paused?: boolean;
  /** Fires once the rope has stopped swinging and the scene has faded in. The
   *  scene is hidden until then, so this is the cue to drop any placeholder. */
  onReveal?: () => void;
  className?: string;
}

declare const Lanyard: (props: LanyardProps) => JSX.Element;
export default Lanyard;
