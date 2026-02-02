import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AntdProvider from '../components/AntdProvider';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });

    return {
        // title: t('title'),
        // description: t('subtitle'),
        title: "Carmoove - Webapp",
    };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
    return (
        <AntdProvider>{children}</AntdProvider>
    );
}