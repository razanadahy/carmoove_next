// import { getTranslations } from 'next-intl/server';
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // const t = await getTranslations({ locale, namespace: 'HomePage' });

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
        redirect(`/${locale}/dashboard`);
    }
    redirect(`/${locale}/login`);
}