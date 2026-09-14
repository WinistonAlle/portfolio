/* O navegador consegue mesmo abrir um contexto WebGL?
 *
 * Vive num arquivo só dele, sem importar `three`, pela mesma regra que criou o
 * `can-run-3d.ts`: **o que decide SE carrega não pode morar no mesmo módulo do
 * que é carregado**. Importar isto de dentro da cena arrastaria a biblioteca
 * inteira para o bundle antes de alguém decidir se ela vai ser usada.
 *
 * Por que existe, sendo que já havia o `canRun3D`: aquele decide se VALE A PENA
 * (ele recusa renderizador de software, pouca memória, economia de dados) e só
 * guarda a abertura do MacBook. O crachá nunca perguntou nada — montava o
 * `<Canvas>` e torcia. Num Windows com GPU na lista de bloqueio do Chromium, o
 * navegador recusa o contexto, o three lança, e o erro sobe sem ninguém para
 * pegá-lo: a página inteira morre, não só o crachá. Reproduzido em 14/09/2026
 * num Chrome sem GPU: sete "unable to create webgl context" seguidos de um
 * `TypeError: Cannot set properties of null (setting 'renderer')` não tratado,
 * e o documento parou em uma tela de altura.
 *
 * Aqui a pergunta é mais frouxa de propósito: não interessa se é rápido,
 * interessa se ABRE. Renderizador de software desenha o crachá devagar, o que
 * ainda é melhor que não desenhar nada.
 */

let resposta: boolean | null = null;

export function temWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  /* Memoizado: cada chamada cria um contexto de verdade, e contexto WebGL é
     recurso contado (o Chromium derruba os mais antigos depois de ~16). Numa
     página com crachá e abertura 3D isso não é teórico. */
  if (resposta !== null) return resposta;
  try {
    const cv = document.createElement('canvas');
    const gl =
      cv.getContext('webgl2') ??
      cv.getContext('webgl') ??
      cv.getContext('experimental-webgl');
    if (!gl) {
      resposta = false;
      return resposta;
    }
    /* Devolve o contexto na hora. Sem isto a sondagem fica segurando um slot
       que a cena de verdade vai precisar. */
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    resposta = true;
  } catch {
    resposta = false;
  }
  return resposta;
}
