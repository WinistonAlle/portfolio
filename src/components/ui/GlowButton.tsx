import SpecularButton from './SpecularButton';
import type { ComponentProps, ReactNode } from 'react';

/* O botão do site. É o SpecularButton com a paleta e a hierarquia já
 * resolvidas, para que uma mudança de estilo aconteça aqui e não em onze
 * chamadas espalhadas.
 *
 * A hierarquia é feita por brilho e preenchimento, não por cor sólida contra
 * cor vazada como antes:
 *
 *   primary   a ação que a página quer que você tome
 *   secondary a alternativa legítima, ao lado da primária
 *   quiet     navegação de apoio (voltar), que não disputa atenção
 *
 * Cada instância abre um contexto WebGL próprio, mas o loop dorme quando o
 * botão sai da tela (ver SpecularButton), então uma página com quatro ou
 * cinco não fica com quatro ou cinco animações rodando fora de vista.
 */


type Variant = 'primary' | 'secondary' | 'quiet';

const VARIANTS: Record<
  Variant,
  Partial<ComponentProps<typeof SpecularButton>>
> = {
  primary: {
    size: 'md',
    tint: '#5b9cff',
    tintOpacity: 0.1,
    lineColor: '#bcd6ff',
    baseColor: '#3a5a8c',
    intensity: 2,
    shineSize: 18,
    shineFade: 40,
    thickness: 1.9,
    proximity: 280,
  },
  secondary: {
    size: 'md',
    tint: '#5b9cff',
    tintOpacity: 0.03,
    lineColor: '#8fbcff',
    baseColor: '#2b3a55',
    intensity: 1.4,
    shineSize: 16,
    shineFade: 40,
    thickness: 1.6,
    proximity: 260,
  },
  quiet: {
    size: 'sm',
    tintOpacity: 0,
    lineColor: '#9dc0ff',
    baseColor: '#243044',
    intensity: 1,
    thickness: 1.3,
    proximity: 190,
    speed: 0.28,
  },
};

type GlowButtonProps = Omit<
  ComponentProps<typeof SpecularButton>,
  'radius' | 'autoAnimate'
> & {
  variant?: Variant;
  children?: ReactNode;
};

export default function GlowButton({
  variant = 'primary',
  className = '',
  ...rest
}: GlowButtonProps) {
  return (
    <SpecularButton
      radius={999}
      autoAnimate
      textColor="var(--foreground)"
      speed={0.4}
      {...VARIANTS[variant]}
      {...rest}
      /* Era a mesma classe dos rótulos de seção (`label`): caixa alta, corpo
         0.7rem e entreletra larga. Botão não é rótulo — é a frase que a pessoa
         clica, e em caixa alta espremida ela vira etiqueta. Agora é a voz de
         interface, em caixa mista e num corpo que dá pra ler. */
      className={`botao-texto ${className}`}
    />
  );
}

/** Seta que desliza no hover, do lado certo conforme a direção. */
export function GlowArrow({
  dir = 'right',
}: {
  dir?: 'right' | 'left' | 'diagonal';
}) {
  const glyph = dir === 'left' ? '←' : dir === 'diagonal' ? '↗' : '→';
  return (
    <span
      aria-hidden="true"
      className={`specular-button__arrow specular-button__arrow--${dir}`}
    >
      {glyph}
    </span>
  );
}
