/* Os desenhos da área de trabalho: ícones de arquivo, de app e da barra de
   menu. Tudo em SVG inline, sem imagem baixada, pra a mesa aparecer inteira
   no primeiro quadro junto com o resto do hero.

   Os ícones de app seguem a grade do macOS: quadrado de cantos contínuos
   (raio de ~22,5% do lado) com uma margem de respiro em volta, que é o que
   faz eles lerem como ícone de Dock e não como botão. */

import { useId, type ReactNode } from 'react';

/* ids de gradiente por instância: a mesa e o iPhone desenham os mesmos
   ícones, e um `url(#id)` repetido apontando pra uma cópia em `display:none`
   some no Chrome. */
const useIdSvg = () => useId().replace(/[^a-zA-Z0-9_-]/g, '');

/* ---------- Barra de menu ---------- */

export function Maca() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 12.54c-.03-2.83 2.31-4.19 2.41-4.26-1.31-1.92-3.36-2.18-4.09-2.21-1.74-.18-3.4 1.03-4.28 1.03-.88 0-2.25-1-3.69-.98-1.9.03-3.65 1.1-4.63 2.8-1.97 3.42-.5 8.49 1.42 11.27.94 1.36 2.06 2.89 3.53 2.83 1.42-.06 1.95-.92 3.66-.92 1.71 0 2.19.92 3.69.89 1.52-.03 2.49-1.38 3.42-2.75 1.08-1.58 1.52-3.11 1.55-3.19-.03-.02-2.97-1.14-3-4.51zM14.24 4.23c.78-.95 1.31-2.27 1.17-3.58-1.13.05-2.49.75-3.3 1.7-.72.84-1.36 2.18-1.19 3.47 1.26.1 2.54-.64 3.32-1.59z"
      />
    </svg>
  );
}

export function Wifi() {
  return (
    <svg viewBox="0 0 20 15" width="17" height="13" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 12.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm0-4.1c1.7 0 3.25.67 4.4 1.77l-1.33 1.39A4.4 4.4 0 0 0 10 10.05a4.4 4.4 0 0 0-3.07 1.21L5.6 9.87A6.33 6.33 0 0 1 10 8.1Zm0-4.06c2.83 0 5.4 1.1 7.31 2.9L15.98 8.3A8.64 8.64 0 0 0 10 5.98 8.64 8.64 0 0 0 4.02 8.3L2.69 6.94A10.56 10.56 0 0 1 10 4.04ZM10 0c3.9 0 7.45 1.52 10 4.01L18.67 5.4A12.37 12.37 0 0 0 10 1.94 12.37 12.37 0 0 0 1.33 5.4L0 4.01A14.27 14.27 0 0 1 10 0Z"
      />
    </svg>
  );
}

export function Bateria() {
  return (
    <svg viewBox="0 0 27 13" width="25" height="12" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="22.5"
        height="12"
        rx="3.6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
      />
      <rect x="2" y="2" width="16.5" height="9" rx="2.2" fill="currentColor" />
      <path
        d="M24.5 4.4c.9.3 1.5 1.1 1.5 2.1s-.6 1.8-1.5 2.1V4.4Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function Lupa() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 0a6.6 6.6 0 0 1 5.28 10.56l3.83 3.83-1.27 1.27-3.83-3.83A6.6 6.6 0 1 1 6.6 0Zm0 1.8a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z"
      />
    </svg>
  );
}

export function CentroDeControle() {
  return (
    <svg viewBox="0 0 18 16" width="16" height="14" aria-hidden="true">
      <rect x="0.75" y="0.75" width="16.5" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.75" cy="3.75" r="1.9" fill="currentColor" />
      <rect x="0.75" y="9.25" width="16.5" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.25" cy="12.25" r="1.9" fill="currentColor" />
    </svg>
  );
}

/* ---------- Arquivos na mesa ---------- */

/* Pasta no desenho do macOS desde o Big Sur: a parte de trás mais escura com
   a aba, a frente clara por cima, e um filete de luz na borda de cima. */
export function Pasta({ size = 64 }: { size?: number }) {
  const u = useIdSvg();
  return (
    <svg viewBox="0 0 64 52" width={size} height={size * (52 / 64)} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd3fc" />
          <stop offset="1" stopColor="#5fb2f0" />
        </linearGradient>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ea9ea" />
          <stop offset="1" stopColor="#3f8fde" />
        </linearGradient>
      </defs>
      <path
        d="M4 4.5A3.5 3.5 0 0 1 7.5 1h15.2c1 0 1.9.4 2.6 1.1l2.6 2.7c.7.7 1.6 1.1 2.6 1.1H56.5A3.5 3.5 0 0 1 60 9.4V46a3.5 3.5 0 0 1-3.5 3.5h-49A3.5 3.5 0 0 1 4 46V4.5Z"
        fill={`url(#${u}b)`}
      />
      <rect x="2" y="11" width="60" height="40" rx="3.5" fill={`url(#${u}f)`} />
      <rect x="2" y="11" width="60" height="1.2" rx="0.6" fill="#c8ecff" opacity="0.9" />
    </svg>
  );
}

/* Documento genérico do Finder: folha branca com a orelha dobrada, e o
   conteúdo em miniatura, como o Quick Look desenha um texto. */
export function Documento({ size = 64, extensao }: { size?: number; extensao: string }) {
  const linhas = [18, 22, 26, 30, 34, 38, 42, 46];
  return (
    <svg viewBox="0 0 52 64" width={size * (52 / 64)} height={size} aria-hidden="true">
      <path
        d="M6 1h28l14 14v44a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z"
        fill="#fbfbfd"
        stroke="#c9ccd3"
      />
      <path d="M34 1v10a4 4 0 0 0 4 4h10" fill="#e3e5ea" stroke="#c9ccd3" />
      <rect x="9" y="9" width="16" height="3" rx="1.5" fill="#1d1d1f" />
      {linhas.map((y, i) => (
        <rect
          key={y}
          x="9"
          y={y}
          width={i % 3 === 2 ? 20 : 33}
          height="1.6"
          rx="0.8"
          fill="#a1a5ae"
        />
      ))}
      <text
        x="26"
        y="57"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="#8a8f99"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
      >
        {extensao}
      </text>
    </svg>
  );
}

/* vCard: o cartão de contato do macOS, com a foto no círculo. */
export function Cartao({ size = 64, foto }: { size?: number; foto: string }) {
  const u = useIdSvg();
  return (
    <svg viewBox="0 0 64 52" width={size} height={size * (52 / 64)} aria-hidden="true">
      <defs>
        <clipPath id={`${u}c`}>
          <circle cx="19" cy="24" r="10" />
        </clipPath>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f2ea" />
          <stop offset="1" stopColor="#e4ddcf" />
        </linearGradient>
      </defs>
      <rect x="2" y="5" width="60" height="42" rx="5" fill={`url(#${u}g)`} stroke="#c9bfae" />
      <circle cx="19" cy="24" r="10" fill="#9aa3b2" />
      <image
        href={foto}
        x="8"
        y="13"
        width="22"
        height="22.7"
        preserveAspectRatio="xMidYMin slice"
        clipPath={`url(#${u}c)`}
      />
      <rect x="34" y="17" width="20" height="3" rx="1.5" fill="#6b6457" />
      <rect x="34" y="24" width="16" height="2" rx="1" fill="#a69d8c" />
      <rect x="34" y="29" width="18" height="2" rx="1" fill="#a69d8c" />
    </svg>
  );
}

/* ---------- Ícones de app (Dock e iPhone) ---------- */

/* Quadrado de app com margem: o ícone do macOS ocupa 824 de 1024, e o raio é
   185. Em 100 unidades: 80,5 de lado e raio de 18. */
function Squircle({
  id,
  de,
  para,
  children,
  sombra = true,
}: {
  id: string;
  de: string;
  para: string;
  children?: ReactNode;
  sombra?: boolean;
}) {
  const u = useIdSvg() + id;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={de} />
          <stop offset="1" stopColor={para} />
        </linearGradient>
        <clipPath id={`c-${u}`}>
          <rect x="9.75" y="9.75" width="80.5" height="80.5" rx="18" />
        </clipPath>
      </defs>
      {sombra && (
        <rect x="9.75" y="11.5" width="80.5" height="80.5" rx="18" fill="#000" opacity="0.28" />
      )}
      <g clipPath={`url(#c-${u})`}>
        <rect x="9.75" y="9.75" width="80.5" height="80.5" fill={`url(#g-${u})`} />
        {children}
      </g>
      <rect
        x="10.25"
        y="10.25"
        width="79.5"
        height="79.5"
        rx="17.6"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.14"
      />
    </svg>
  );
}

/* Finder: o rosto de duas cores, metade azul e metade clara. */
export function AppFinder() {
  return (
    <Squircle id="finder" de="#ffffff" para="#dfe9f5">
      <path d="M9.75 9.75H55c-4 10-6.5 22-6.5 36 0 6 .6 11.5 1.6 16.5H44c.5 9 1.8 19.5 3.6 28.25H9.75Z" fill="#2a95f2" />
      <path d="M9.75 9.75H55c-4 10-6.5 22-6.5 36 0 6 .6 11.5 1.6 16.5H44c.5 9 1.8 19.5 3.6 28.25H9.75Z" fill="#5ec3ff" opacity="0.35" />
      <rect x="31" y="32" width="4" height="13" rx="2" fill="#0c2a4f" />
      <rect x="65" y="32" width="4" height="13" rx="2" fill="#0c2a4f" />
      <path d="M27 64c13 9 33 9 46 0" fill="none" stroke="#0c2a4f" strokeWidth="3.4" strokeLinecap="round" />
    </Squircle>
  );
}

export function AppMail() {
  return (
    <Squircle id="mail" de="#3fb2ff" para="#0b63e5">
      <rect x="23" y="33" width="54" height="36" rx="4" fill="#fff" />
      <path d="M24 35l26 19 26-19" fill="none" stroke="#9cc7f5" strokeWidth="2.6" strokeLinejoin="round" />
    </Squircle>
  );
}

/* "Sobre mim" é a minha foto num ícone de app, no lugar do Contatos. */
export function AppFoto({ foto }: { foto: string }) {
  return (
    <Squircle id="foto" de="#7aa7ff" para="#2e5fd1">
      <image href={foto} x="14" y="18" width="72" height="74.3" preserveAspectRatio="xMidYMin slice" />
    </Squircle>
  );
}

export function AppMarca({
  id,
  de,
  para,
  path,
  cor = '#fff',
  escala = 0.46,
}: {
  id: string;
  de: string;
  para: string;
  path: string;
  cor?: string;
  escala?: number;
}) {
  const lado = 24 * (100 / 24) * escala;
  const pos = 50 - lado / 2;
  return (
    <Squircle id={id} de={de} para={para}>
      <g transform={`translate(${pos} ${pos}) scale(${lado / 24})`}>
        <path d={path} fill={cor} />
      </g>
    </Squircle>
  );
}

/* Lixo vazio do macOS: cesto de tela translúcido, sem fundo de app. */
export function AppLixo() {
  const u = useIdSvg();
  const ripas = [30, 37, 44, 51, 58, 65, 72];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9ced6" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#f4f6f9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#c9ced6" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d="M22 22h56l-5 66a4 4 0 0 1-4 3.6H31a4 4 0 0 1-4-3.6Z" fill={`url(#${u}l)`} />
      {ripas.map((x, i) => (
        <path
          key={x}
          d={`M${x} 26 L${x + (i - 3) * 0.7} 88`}
          stroke="#8d939d"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
      ))}
      <ellipse cx="50" cy="22" rx="29" ry="5" fill="#e8ebf0" stroke="#9aa0aa" strokeWidth="1.2" />
      <ellipse cx="50" cy="22" rx="25" ry="3.4" fill="#7c828c" opacity="0.5" />
    </svg>
  );
}

/* Ajustes do iPhone, usado pelo ícone que troca o idioma. */
export function AppIdioma() {
  return (
    <Squircle id="idioma" de="#a8acb4" para="#6c7079">
      <circle cx="50" cy="50" r="22" fill="none" stroke="#fff" strokeWidth="3.4" />
      <ellipse cx="50" cy="50" rx="10" ry="22" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M28 50h44M31 39h38M31 61h38" stroke="#fff" strokeWidth="3" />
    </Squircle>
  );
}

/* Arquivos do iPhone: folha branca com a pasta azul no meio. */
export function AppArquivos() {
  return (
    <Squircle id="arquivos" de="#ffffff" para="#e9edf3">
      <path
        d="M25 36.5a4 4 0 0 1 4-4h13c1 0 2 .4 2.7 1.2l2.6 2.8c.7.8 1.7 1.2 2.7 1.2H71a4 4 0 0 1 4 4V67a4 4 0 0 1-4 4H29a4 4 0 0 1-4-4V36.5Z"
        fill="#2f8ef0"
      />
      <rect x="25" y="42" width="50" height="29" rx="4" fill="#5cb4fb" />
    </Squircle>
  );
}
