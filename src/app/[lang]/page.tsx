import { notFound } from 'next/navigation';
import HomeShell from '@/components/home/HomeShell';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';

// WindowStack (o bloco com as abas "sobre-mim.md / projetos.tsx /
// producao.log") saiu da home a pedido do usuário — vai voltar em outro
// lugar depois. Componente intacto em '@/components/WindowStack'.

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
    />
  );
}
