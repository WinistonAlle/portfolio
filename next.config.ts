import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Hides the on-screen dev badge; compile and runtime errors still surface.
  devIndicators: false,
  // Desligado por causa da cena 3D: o duplo mount do Strict Mode em dev deixa
  // duas instâncias do Band vivas e o loop de render do R3F para depois de
  // ~4 frames, congelando o crachá no meio da queda. Só afeta dev — o build de
  // produção nunca teve o problema. Ver README.
  reactStrictMode: false,
  /* config options here */
};

export default nextConfig;
