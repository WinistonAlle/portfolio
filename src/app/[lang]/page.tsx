import { notFound } from 'next/navigation';
import HomeShell from '@/components/home/HomeShell';
import SecaoSobre from '@/components/home/secoes/SecaoSobre';
import SecaoStack from '@/components/home/secoes/SecaoStack';
import SecaoProjetos from '@/components/home/secoes/SecaoProjetos';
import SecaoContato from '@/components/home/secoes/SecaoContato';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';

/* A home é página única: abaixo do hero vêm recortes de "sobre mim", da
   stack, dos projetos e o contato inteiro, cada um com caminho para a página
   completa. Os botões do hero e os links do header continuam navegando — um
   rótulo, um destino, em qualquer lugar do site.

   (O WindowStack, com as abas "sobre-mim.md / projetos.tsx / producao.log",
   segue fora da home; componente intacto em '@/components/WindowStack'.) */

export default async function Home(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <HomeShell
      locale={lang}
      t={dict.home}
      nav={dict.nav}
      switchLabel={dict.header.switchLabel}
    >
      {/* As seções são montadas AQUI, no servidor, e entregues prontas ao
          HomeShell, que é de cliente. É a mesma regra que rege o resto do
          site: código atravessa por import, dado atravessa por props — e o
          dicionário nunca atravessa. */}
      <SecaoSobre locale={lang} dict={dict} />
      <SecaoStack
        locale={lang}
        titulo={dict.about.stackTitle}
        verMais={dict.home.stackVerMais}
      />
      <SecaoProjetos locale={lang} dict={dict} limite={6} />
      <SecaoContato locale={lang} dict={dict} />
    </HomeShell>
  );
}
