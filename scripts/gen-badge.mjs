import sharp from 'sharp';

// The card mesh is 1.6 x 2.25 world units (CuboidCollider 0.8 x 1.125),
// so every face we bake has to match that aspect or the atlas crops it.
const W = 1024;
const H = Math.round(W * (2.25 / 1.6) ** 1 * 0 + W / 0.7111); // 1440
const PAD = 76;

const C = {
  ink: '#05070E',
  surface: '#0C1220',
  line: 'rgba(255,255,255,0.13)',
  text: '#F3F6FF',
  muted: '#78879F',
  accent: '#5B9CFF',
};

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, 'Courier New', monospace";

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Deterministic barcode so re-runs produce an identical asset. */
function barcode(x, y, w, h) {
  let bars = '';
  let cx = x;
  let seed = 7;
  while (cx < x + w) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const bw = 2 + (seed % 4);
    const gap = 2 + ((seed >> 5) % 4);
    if (cx + bw > x + w) break;
    bars += `<rect x="${cx}" y="${y}" width="${bw}" height="${h}" fill="${C.text}" opacity="0.82"/>`;
    cx += bw + gap;
  }
  return bars;
}

const label = (x, y, t, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="20" letter-spacing="3.4"
     fill="${C.muted}" text-anchor="${anchor}">${esc(t.toUpperCase())}</text>`;

const value = (x, y, t, size = 34, fill = C.text) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="500"
     fill="${fill}">${esc(t)}</text>`;

/* ---------------------------------------------------------------- front */

const PHOTO = { x: PAD, y: 214, w: W - PAD * 2, h: 760, r: 18 };

function frontSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#0D1526"/>
      <stop offset="55%" stop-color="${C.ink}"/>
      <stop offset="100%" stop-color="#080C18"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${C.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="26"
        fill="none" stroke="${C.line}" stroke-width="2"/>

  <!-- punch slot, mirrors the clip on the 3D model -->
  <rect x="${W / 2 - 92}" y="74" width="184" height="26" rx="13"
        fill="#000" opacity="0.55"/>

  <!-- header -->
  ${label(PAD, 168, 'Portfólio')}
  ${label(W - PAD, 168, '2026', 'end')}
  <rect x="${PAD}" y="188" width="${W - PAD * 2}" height="2" fill="url(#glow)"/>

  <!-- photo frame (image composited on top of this rect) -->
  <rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}"
        rx="${PHOTO.r}" fill="#0A1120"/>

  <!-- identity -->
  <text x="${PAD}" y="1078" font-family="${FONT}" font-size="76" font-weight="700"
        letter-spacing="-1.5" fill="${C.text}">WINISTON ALLE</text>
  <text x="${PAD}" y="1130" font-family="${FONT}" font-size="36" font-weight="500"
        fill="${C.accent}">Desenvolvedor Full-Stack</text>

  <rect x="${PAD}" y="1176" width="${W - PAD * 2}" height="1" fill="${C.line}"/>

  <!-- data grid: two rows, right column reserved for the handle -->
  ${label(PAD, 1222, 'Stack')}
  ${value(PAD, 1264, 'React · Next.js · Supabase', 32)}
  ${label(W - PAD, 1222, 'GitHub', 'end')}
  <text x="${W - PAD}" y="1264" font-family="${MONO}" font-size="27"
        fill="${C.text}" text-anchor="end">@WinistonAlle</text>

  ${label(PAD, 1320, 'Foco')}
  ${value(PAD, 1362, 'Sistemas em produção', 32)}
</svg>`;
}

/* ----------------------------------------------------------------- back */

function backSVG() {
  const stats = [
    ['4', 'sistemas em produção'],
    ['255', 'usuários atendidos'],
    ['1', 'ERP legado integrado'],
  ];
  const rows = stats
    .map(([n, t], i) => {
      const y = 560 + i * 148;
      return `
      <text x="${PAD}" y="${y}" font-family="${FONT}" font-size="72" font-weight="700"
            fill="${C.accent}">${n}</text>
      <text x="${PAD + 150}" y="${y}" font-family="${FONT}" font-size="32"
            fill="${C.text}" opacity="0.9">${esc(t)}</text>
      <rect x="${PAD}" y="${y + 40}" width="${W - PAD * 2}" height="1" fill="${C.line}"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${C.ink}"/>
      <stop offset="100%" stop-color="#0B1120"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg2)"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="26"
        fill="none" stroke="${C.line}" stroke-width="2"/>
  <rect x="${W / 2 - 92}" y="74" width="184" height="26" rx="13" fill="#000" opacity="0.55"/>

  <text x="${PAD}" y="300" font-family="${FONT}" font-size="200" font-weight="700"
        fill="${C.text}" opacity="0.08">W</text>

  ${label(PAD, 420, 'O que já está no ar')}

  ${rows}

  ${label(PAD, 1120, 'Contato')}
  <text x="${PAD}" y="1176" font-family="${MONO}" font-size="28"
        fill="${C.text}">dev.winiston@gmail.com</text>
  <text x="${PAD}" y="1226" font-family="${MONO}" font-size="28"
        fill="${C.muted}">github.com/WinistonAlle</text>

  ${barcode(PAD, 1310, W - PAD * 2, 60)}
</svg>`;
}

/* ------------------------------------------------------------- lanyard */

async function band() {
  /* Potências de 2, e a largura precisa ser múltipla do tile da trama (8px):
     a textura repete 4x ao longo da fita (repeat=[-4,1] no meshline), então
     qualquer sobra faria a emenda aparecer a cada volta. */
  const BW = 1024;
  const BH = 256;
  const seam = 26; // distância da costura até a borda

  /* Um feixe de diagonais paralelas do tile da sarja, deslocado em y.
     Espaçamento 16 divide a altura do tile (64), que é o que faz o padrão
     fechar quando ele repete. */
  const twill = (offset) => {
    const lines = [];
    for (let y = -64 + offset; y <= 64 + offset; y += 16) {
      lines.push(`M0,${y} L128,${y + 64}`);
    }
    return lines.join(' ');
  };

  /* Fita de poliéster escura, sem texto. O que vende o realismo aqui não é
     a cor, é o resto: trama diagonal de sarja, as bordas escurecendo porque
     a tira dobra, e a linha de costura correndo paralela. */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#03060b"/>
        <stop offset="0.08" stop-color="#0a1524"/>
        <stop offset="0.34" stop-color="#101e34"/>
        <stop offset="0.5" stop-color="#12223c"/>
        <stop offset="0.68" stop-color="#0d192c"/>
        <stop offset="0.92" stop-color="#080f1b"/>
        <stop offset="1" stop-color="#03060b"/>
      </linearGradient>

      <!-- Sarja. Duas correções de escala aqui, as duas aprendidas errando:
           1) o tile é 128x64, bem maior do que parece necessário, porque a
              fita renderiza com ~55px de largura contra 256px de textura:
              tudo encolhe ~5x e detalhe fino vira meio pixel, que o mipmap
              apaga. Linha de 7px na textura chega como ~1.5px na tela.
           2) o tile não é quadrado (dx = 2·dy) porque a textura cobre uma
              fita muito mais longa que larga, então chega achatada em x;
              essa inclinação sai perto de 45 graus depois do esmagamento.
           Fecha nas quatro bordas (128 em x equivale a 64 em y, múltiplo do
           espaçamento de 32), então repete sem emenda. -->
      <pattern id="twill" width="128" height="64" patternUnits="userSpaceOnUse">
        <path d="${twill(0)}" stroke="#ffffff" stroke-width="5" opacity="0.06" fill="none"/>
        <path d="${twill(8)}" stroke="#000000" stroke-width="4.5" opacity="0.2" fill="none"/>
      </pattern>
    </defs>

    <rect width="${BW}" height="${BH}" fill="url(#body)"/>
    <rect width="${BW}" height="${BH}" fill="url(#twill)"/>

    <!-- costura: dois fios paralelos, levemente puxados para o azul -->
    <line x1="0" y1="${seam}" x2="${BW}" y2="${seam}" stroke="${C.accent}"
          stroke-width="1.4" stroke-dasharray="7 6" opacity="0.22"/>
    <line x1="0" y1="${BH - seam}" x2="${BW}" y2="${BH - seam}" stroke="${C.accent}"
          stroke-width="1.4" stroke-dasharray="7 6" opacity="0.22"/>

    <!-- vinco das bordas: a fita é dobrada e prensada nas duas pontas -->
    <rect y="0" width="${BW}" height="3" fill="#ffffff" opacity="0.05"/>
    <rect y="${BH - 3}" width="${BW}" height="3" fill="#ffffff" opacity="0.04"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile('public/lanyard-band.png');
}

/* --------------------------------------------------------------- build */

const rounded = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO.w}" height="${PHOTO.h}">
     <rect width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}" fill="#fff"/>
   </svg>`,
);

const photo = await sharp('assets/foto.png')
  .resize(PHOTO.w, PHOTO.h, { fit: 'cover', position: 'top' })
  .composite([{ input: rounded, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(Buffer.from(frontSVG()))
  .composite([{ input: photo, left: PHOTO.x, top: PHOTO.y }])
  .png()
  .toFile('public/badge-front.png');

await sharp(Buffer.from(backSVG())).png().toFile('public/badge-back.png');
await band();

console.log(`ok — ${W}x${H}`);
