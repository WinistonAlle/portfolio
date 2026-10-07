/* O monograma WA (public/logo/), desenhado inline para herdar a cor do texto:
   o W e o A saem em `currentColor` e só a barra do A leva o azul do site.
   O viewBox é o recorte justo do desenho de 256, sem a margem do ícone. */
export default function LogoWA({ className, titulo }: { className?: string; titulo?: string }) {
  return (
    <svg
      viewBox="13 60 230 136"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <g fill="currentColor">
        <polygon points="17,64 47,64 83,192 53,192" />
        <polygon points="87,112 117,112 83,192 53,192" />
        <polygon points="87,112 117,112 151,192 121,192" />
        <polygon points="165,64 195,64 151,192 121,192" />
        <polygon points="165,64 195,64 239,192 209,192" />
      </g>
      <polygon fill="var(--accent)" points="163.94,150 196.06,150 202.25,168 157.75,168" />
    </svg>
  );
}
