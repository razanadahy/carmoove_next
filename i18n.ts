import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
    const actualLocale = (locale ?? defaultLocale) as Locale;
    return {
        messages: (await import(`./messages/${actualLocale}.json`)).default,
        locale: actualLocale
    };
});