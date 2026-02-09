// // import createNextIntlPlugin from 'next-intl/plugin';
// //
// // const withNextIntl = createNextIntlPlugin('./i18n.ts');
// //
// // export default withNextIntl({
// //     // experimental: {
// //     //     turbo: false,
// //     // },
// // });
//
// import createNextIntlPlugin from 'next-intl/plugin';
//
// const withNextIntl = createNextIntlPlugin('./i18n.ts');
//
//
// const nextConfig = {
//     reactStrictMode: true,
//
//     webpack: (config, { isServer }) => {
//         // Ignorer les warnings pour react-calendar-timeline et antd
//         config.ignoreWarnings = [
//             {
//                 module: /node_modules\/react-calendar-timeline/,
//                 message: /legacy childContextTypes/
//             },
//             {
//                 module: /node_modules\/antd/,
//                 // Vous pouvez spécifier des messages particuliers d'antd si nécessaire
//                 // Par exemple pour les deprecated warnings
//                 message: /deprecated|legacy|React\.createFactory/
//             }
//         ];
//
//         return config;
//     },
//
//     // Configuration supplémentaire pour optimiser le build avec antd
//     transpilePackages: ['antd', '@ant-design', 'rc-*', 'react-calendar-timeline'],
//
//     // Optionnel: Pour réduire les warnings dans la console pendant le développement
//     compiler: {
//         removeConsole: process.env.NODE_ENV === 'production' ? {
//             exclude: ['error', 'warn']
//         } : false,
//     },
//
//     // Configuration des headers si nécessaire
//     async headers() {
//         return [
//             {
//                 source: '/:path*',
//                 headers: [
//                     {
//                         key: 'X-Content-Type-Options',
//                         value: 'nosniff'
//                     }
//                 ]
//             }
//         ];
//     }
// };
//
// // Appliquer la configuration de next-intl
// export default withNextIntl(nextConfig);


import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabled for Leaflet compatibility

    webpack: (config, { isServer, dev }) => {
        // Ignorer spécifiquement les warnings problématiques
        config.ignoreWarnings = [
            {
                module: /node_modules\/react-calendar-timeline/,
                message: /legacy childContextTypes|legacy-context/
            },
            {
                module: /node_modules\/antd/,
                message: /antd v5 support React is 16 ~ 18|React\.createFactory/
            },
            {
                module: /node_modules\/@ant-design/,
                message: /.*/
            }
        ];

        // Alternative: Supprimer tous les console.error pour antd
        if (!isServer) {
            const originalWarn = console.warn;
            console.warn = (...args) => {
                if (typeof args[0] === 'string' &&
                    args[0].includes('[antd: compatible]') &&
                    args[0].includes('antd v5 support React is 16 ~ 18')) {
                    return; // Ne pas afficher ce warning
                }
                originalWarn.apply(console, args);
            };
        }

        return config;
    },

    // Transpiler les packages nécessaires
    transpilePackages: [
        'antd',
        '@ant-design',
        'rc-*',
        'react-calendar-timeline'
    ],

    // Configuration du compilateur pour supprimer les consoles en production
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error']
        } : false,
    }
};

export default withNextIntl(nextConfig);