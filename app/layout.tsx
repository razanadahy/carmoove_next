import { Geist, Geist_Mono } from "next/font/google";
import 'antd/dist/reset.css'
import 'bootstrap/dist/css/bootstrap.css';
import "./globals.css";
import {getLocale, getMessages} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function RootLayout({children,}: { children: React.ReactNode; }) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>

            </body>
        </html>
    );
}