import { Geist, Geist_Mono } from "next/font/google";
import 'antd/dist/reset.css'
import 'bootstrap/dist/css/bootstrap.css';
import "./globals.css";
import {getLocale, getMessages} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';
import AntdRegistry from '@/lib/AntdRegistry';
import AntdProvider from '@/app/components/AntdProvider';
import { App } from 'antd';
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
    if (typeof window !== 'undefined') {
        const originalError = console.error;
        // eslint-disable-next-line react-hooks/immutability
        console.error = (...args) => {
            if (typeof args[0] === 'string') {
                if (args[0].includes('defaultProps') || args[0].includes('antd: compatible')) {
                    return;
                }
            }
            originalError(...args);
        };
    }
    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <AntdRegistry>
                        <AntdProvider>
                            <App>
                                {children}
                            </App>
                        </AntdProvider>
                    </AntdRegistry>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}