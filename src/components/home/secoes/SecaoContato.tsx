import QuickMessage from '@/components/contact/QuickMessage';
import SocialCubes from '@/components/socials/SocialCubes';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

/* O contato, inteiro.
 *
 * É a única das três seções que NÃO é resumo, e por um motivo simples: a
 * página de contato já é curta, e resumir o lugar onde a conversa começa é o
 * pior corte possível numa página única. Quem rolou o site todo chegou aqui
 * pronto pra falar; mandá-lo clicar mais uma vez é perder a pessoa no último
 * metro.
 */
export default function SecaoContato({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  return (
    <section className="relative w-full border-t border-line pt-20 pb-28">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-10">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            {dict.contact.titleStart}
            <em className="acento">{dict.contact.titleEnd}</em>
          </h2>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            {dict.contact.intro}
          </p>
        </div>

        <SocialCubes greeting={dict.contact.whatsappGreeting} />
      </div>

      <div className="mx-auto mt-16 w-full max-w-7xl border-t border-line px-6 pt-16 lg:px-10">
        <h3 className="max-w-xl text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-balance">
          {dict.contact.quickTitle}
        </h3>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {dict.contact.quickText}
        </p>
        <div className="mt-10">
          <QuickMessage t={dict.contact.form} />
        </div>
      </div>
    </section>
  );
}
