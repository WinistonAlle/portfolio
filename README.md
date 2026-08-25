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

O `card.glb` tem 2,4 MB e o `useGLTF` suspende até terminar de parsear, então o
hero mostra um estado de carregamento por alguns segundos. Ele é deliberadamente
borrado, esmaecido e pulsante: um PNG nítido do crachá ali parece o resultado
final, e dá a impressão de que o 3D nunca chegou.

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

**`reactStrictMode` está desligado, e é por causa desta cena.** Em dev o Strict
Mode monta, desmonta e remonta; a cena rapier/R3F não sobrevive a isso — sobram
duas instâncias do `Band` com refs alternando entre válidas e nulas, e o loop de
render do R3F para depois de ~4 frames. Como o rapier sincroniza as transforms
dentro desse loop, o crachá congela onde estiver. Medido: em dev com Strict Mode
o callback do `useFrame` roda 3 vezes e para; sem ele, e no build de produção,
roda continuamente. **O build de produção nunca teve o problema** — se um dia
quiser o Strict Mode de volta, o custo é o crachá travado em dev.

Enquadramento: o cordão cai reto a partir da âncora, então o card **repousa
perto de x = 0** — o `x = 2` do RigidBody é só posição de spawn. A câmera em
`[0, -1.3, 13.5]` deixa o card ocupando cerca de metade da altura da coluna,
centrado no repouso, com a fita saindo pelo topo. Aproximar mais que isso começa
a cortar o card nas laterais durante a queda inicial.

Para conferir mudanças visuais sem abrir o navegador:
`npm run shot -- <url> <saida.png> 1440x900 <scrollY> <msDeEspera>`. A cena 3D
leva alguns segundos para assentar — use 8000 ms ou mais.

## O fundo de partículas

`src/components/background/Particles.jsx` é o componente do React Bits, montado
em `layout.tsx` como camada fixa de página inteira. Mudanças sobre o original:

- **Reage ao scroll.** `scrollParallax` desloca o campo conforme a página rola e
  `scrollRoll` acrescenta giro. A posição é lida num ref dentro do loop de
  render — rolar a página nunca dispara re-render do React — e é suavizada por
  lerp, então uma rolada seca desliza em vez de saltar.
- **Mouse escutado na `window`**, não no container: a camada é
  `pointer-events: none`, então o ponteiro nunca chega nela.
- **`pixelRatio` 0 = usar o do display**, lido dentro do efeito. Ler
  `devicePixelRatio` no corpo do componente quebra o build: um Client Component
  ainda é pré-renderizado no servidor, onde `window` não existe.
- **`prefers-reduced-motion`** renderiza um frame e para.

O giro do scroll é **somado como deslocamento absoluto**, nunca acumulado:
`rotation.z = spin + scrollSuavizado * scrollRoll`. Acumular (`+=`) faz o campo
girar para sempre enquanto a página estiver rolada — medido em 11 rad em 4s
parado, contra 0,12 rad da versão correta.

Camadas são explícitas: campo em `z-0`, `<main>` em `z-10`. Com z-index negativo
os pontos passavam por cima do texto em algumas seções.
