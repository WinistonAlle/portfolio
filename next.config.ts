import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Hides the on-screen dev badge; compile and runtime errors still surface.
  devIndicators: false,
  // Desligado por causa da cena 3D: o duplo mount do Strict Mode em dev deixa
  // duas instâncias do Band vivas e o loop de render do R3F para depois de
  // ~4 frames, congelando o crachá no meio da queda. Só afeta dev — o build de
  // produção nunca teve o problema. Ver README.
  reactStrictMode: false,
  /* Assets do crachá 3D com cache longo. O padrão do Next para /public é
     `max-age=0, must-revalidate`, o que fazia o navegador revalidar o modelo a
     cada visita à página "sobre mim". Estes arquivos são gerados (npm run
     badge) e trocam de conteúdo só quando trocam de nome, então revalidar não
     compra nada. */
  async headers() {
    return [
      {
        source: '/:arquivo(card.glb|badge-front.png|badge-back.png|lanyard-band.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
