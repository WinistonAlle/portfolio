# Portfólio — Winiston Alle

Next.js 16 (App Router) + Tailwind 4. Hero com crachá 3D pendurado num cordão,
com física real (arrastável).

```bash
npm run dev      # http://localhost:3000
npm run badge    # regera as faces do crachá a partir de assets/foto.png
npm run build
```

## O crachá

As duas faces e a fita são **geradas**, não desenhadas à mão:
`scripts/gen-badge.mjs` compõe SVG + foto via sharp e escreve
`public/badge-front.png`, `public/badge-back.png` e `public/lanyard-band.png`.
Para trocar texto, foto ou cores, edite o script e rode `npm run badge` — as
cores vivem no objeto `C` e espelham os tokens de `src/app/globals.css`.

A face precisa manter a proporção **1024×1440** (o mesh do card é 1.6×2.25
unidades); qualquer outra proporção é cortada pelo atlas de textura.

## O componente Lanyard

`src/components/lanyard/Lanyard.jsx` é o componente do React Bits, adaptado:

- `card.glb` e `lanyard.png` são servidos de `public/` como URLs comuns, então
  não é preciso a regra `assetsInclude` do Vite que o README original pede.
- `LanyardBadge.tsx` faz o `dynamic(..., { ssr: false })` — three + o wasm do
  rapier são client-only e pesados demais para prerender.
- `useFrame` recebe o delta limitado a `1/30`: uma aba parada ou um primeiro
  paint lento entrega um delta enorme, o lerp de recuperação da fita passa do
  ponto e o cordão chicoteia pela tela.
- A textura da fita é clonada antes de receber `RepeatWrapping`, para não mutar
  o objeto que o `useTexture` mantém em cache.

Enquadramento: o cordão cai reto a partir da âncora, então o card **repousa em
x = 0** — o `x = 2` do RigidBody é só posição de spawn. A câmera em
`[0, -0.8, 22]` centraliza o card em repouso e deixa a fita sair pelo topo.
