import { Fragment } from 'react';

/* Título com uma expressão em serifa itálica.
 *
 * O trecho destacado vem marcado no próprio dicionário, entre asteriscos:
 *
 *     title: 'Conheça um pouco do *meu trabalho*.'
 *
 * Marcar no dicionário, e não no JSX, existe por causa do bilíngue: a
 * expressão que merece destaque em português quase nunca ocupa a mesma posição
 * na frase em inglês. Com a marca no texto, cada idioma escolhe a sua, e o
 * tipo `typeof pt` continua obrigando os dois a existir.
 *
 * Sem asterisco nenhum o componente devolve o texto inteiro, então ele é
 * seguro de usar em qualquer título, marcado ou não.
 */
export default function TituloAcento({ texto }: { texto: string }) {
  /* Captura mantendo os separadores, pra remontar a frase na ordem. Índice
     ímpar = trecho que estava entre asteriscos. */
  const partes = texto.split(/\*([^*]+)\*/g);

  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <em key={i} className="acento">
            {parte}
          </em>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </>
  );
}
