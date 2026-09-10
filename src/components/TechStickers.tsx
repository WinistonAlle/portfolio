/* Adesivos das tecnologias espalhados pelo hero, com a mesma borda branca da
   foto. As posições são escritas à mão em porcentagem, não sorteadas: assim
   ficam sempre nos mesmos lugares, longe do rosto e do texto, e o resultado é
   o mesmo no servidor e no cliente.

   Abaixo de lg eles somem: nessa largura a foto já ocupa quase tudo e os
   adesivos cairiam por cima dela. */

type Sticker = {
  id: string;
  label: string;
  /** posição em % do bloco */
  left: number;
  top: number;
  /** lado do adesivo em rem */
  size: number;
  rotate: number;
  /** cor do brilho no hover, uma por marca */
  glow: string;
};

/* As imagens vivem em /public/tech-stickers/<id>.png. Devem ser os logos já
   recortados, com fundo transparente: a moldura quadrada que existia antes
   foi descartada. */
const STICKERS: Sticker[] = [
  { id: 'claude', label: 'Claude', left: 12, top: 28, size: 12.4, rotate: -13, glow: '#d97757' },
  { id: 'react', label: 'React', left: 8, top: 58, size: 11.2, rotate: 8, glow: '#61dafb' },
  { id: 'python', label: 'Python', left: 18, top: 84, size: 10.6, rotate: -7, glow: '#4b8bbe' },
  /* -v2: o arquivo trocou de branco para preto, e sem mudar o nome o
     navegador seguiria mostrando a versão em cache. */
  { id: 'apple-v2', label: 'Apple', left: 92, top: 55, size: 9.4, rotate: -5, glow: '#dbe6ff' },
  /* O n8n é deitado (468x216), então precisa de mais largura que os outros
     para o logo em si sair do mesmo tamanho na tela. */
  { id: 'n8n', label: 'n8n', left: 88, top: 28, size: 16, rotate: 11, glow: '#ea4b71' },
  { id: 'docker', label: 'Docker', left: 86, top: 76, size: 11.4, rotate: -9, glow: '#2496ed' },
];

export default function TechStickers() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 hidden lg:block"
      aria-hidden="true"
    >
      {STICKERS.map((sticker) => {
        const src = `/tech-stickers/${sticker.id}.png`;
        return (
          <div
            key={sticker.id}
            className="tech-sticker pointer-events-auto absolute"
            style={{
              left: `${sticker.left}%`,
              top: `${sticker.top}%`,
              width: `${sticker.size}rem`,
              // o giro entra numa variável para o hover poder somar o seu
              ['--r' as string]: `${sticker.rotate}deg`,
              ['--glow' as string]: sticker.glow,
            }}
          >
            {/* Brilho: gradiente radial já nasce suave, sem precisar de
                filter:blur (caro se animado) — só a opacidade troca. */}
            <span className="tech-sticker__glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={sticker.label}
              className="tech-sticker__img block h-auto w-full select-none"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
