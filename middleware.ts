// // middleware.ts
// import createIntlMiddleware from 'next-intl/middleware';
// import { NextRequest, NextResponse } from 'next/server';
//
// // Middleware d'internationalisation
// const intlMiddleware = createIntlMiddleware({
//     locales: ['en', 'fr'],
//     defaultLocale: 'en',
//     localePrefix: 'always' as const
// });
//
// export default function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;
//
//     const token = request.cookies.get('token')?.value;
//     const isAdminRoute = pathname.match(/^\/(en|fr)\/admin/);
//     const isClientRoute = pathname.match(/^\/(en|fr)\/client/);
//
//     if (isAdminRoute && !token) {
//         const locale = pathname.split('/')[1]; // Récupère 'en' ou 'fr'
//         return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
//     }
//
//     if (isClientRoute && !token) {
//         const locale = pathname.split('/')[1];
//         return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
//     }
//
//     return intlMiddleware(request);
// }
//
// export const config = {
//     matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)', '/', '/(en|fr)(.*)']
// };


// import createIntlMiddleware from "next-intl/middleware";
// import { NextRequest, NextResponse } from "next/server";
//
// const intlMiddleware = createIntlMiddleware({
//     locales: ["en", "fr"],
//     defaultLocale: "en",
//     localePrefix: "always",
// });
//
// export default function middleware(request: NextRequest) {
//     // 1️⃣ Appliquer d’abord la gestion des langues
//     const response = intlMiddleware(request);
//
//     const { pathname } = request.nextUrl;
//     const token = request.cookies.get("token")?.value;
//
//     // Routes publiques
//     const isPublicRoute = pathname.match(/^\/(en|fr)\/(login|register)/);
//
//     // Routes protégées
//     const isAdminRoute = pathname.match(/^\/(en|fr)\/admin/);
//     const isClientRoute = pathname.match(/^\/(en|fr)\/client/);
//
//     // 2️⃣ Si route protégée sans token → redirection
//     if (!token && (isAdminRoute || isClientRoute) && !isPublicRoute) {
//         const locale = pathname.split("/")[1];
//         return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
//     }
//
//     return response;
// }
//
// export const config = {
//     matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };


import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware({
    locales: ["en", "fr"],
    defaultLocale: "en",
    localePrefix: "always",
});

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request);
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // Routes publiques
    const publicRoutes = ["/login", "/register"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(`/${pathname.split('/')[1]}${route}`));

    // Routes admin : toutes les routes générées par le dossier (admin)
    const isAdminRoute = pathname.startsWith(`/${pathname.split("/")[1]}/`) && pathname.includes("/");
    // Ici tu peux ajouter une logique pour matcher toutes les routes du dossier (admin)
    // Par exemple si tu veux matcher tout ce qui n’est pas public et qui correspond au dossier admin

    if (!token && !isPublicRoute && pathname.startsWith(`/${pathname.split("/")[1]}/`) && pathname.includes("/")) {
        const locale = pathname.split("/")[1];
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
