// // import {
// //     ApolloClient,
// //     InMemoryCache,
// //     HttpLink,
// //     from,
// // } from "@apollo/client";
// // import { setContext } from "@apollo/client/link/context";
// // import { onError } from "@apollo/client/link/error";
// //
// // // 🔹 1. HTTP link vers ton API
// // const httpLink = new HttpLink({
// //     uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
// //     credentials: "include", // si tu utilises cookies
// // });
// //
// // // 🔹 2. Interceptor de requête (auth header)
// // const authLink = setContext((_, { headers }) => {
// //     let token: string | null = null;
// //
// //     if (typeof window !== "undefined") {
// //         token = localStorage.getItem("token"); // adapte à ton stockage
// //     }
// //
// //     return {
// //         headers: {
// //             ...headers,
// //             Authorization: token ? `Bearer ${token}` : "",
// //         },
// //     };
// // });
// //
// // // 🔹 3. Interceptor d’erreurs (réponse)
// // const errorLink = onError(({ graphQLErrors, networkError }) => {
// //     if (graphQLErrors) {
// //         for (const err of graphQLErrors) {
// //             if (err.extensions?.code === "UNAUTHENTICATED") {
// //                 console.log("Token expiré ou invalide");
// //                 // 👉 ici tu peux :
// //                 // - refresh token
// //                 // - logout
// //                 // - redirect
// //             }
// //         }
// //     }
// //
// //     if (networkError) {
// //         console.log("Erreur réseau:", networkError);
// //     }
// // });
// //
// // // 🔹 4. Création du client
// // export const apolloClient = new ApolloClient({
// //     link: from([errorLink, authLink, httpLink]), // ordre important
// //     cache: new InMemoryCache(),
// // });
//
//
// "use client";
//
// import {
//     ApolloClient,
//     InMemoryCache,
//     createHttpLink,
//     from,
//     Operation,
// } from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";
// import { onError } from "@apollo/client/link/error";
// import { RetryLink } from "@apollo/client/link/retry";
//
// let refreshingPromise: Promise<string | null> | null = null;
//
// /* =========================
//    🔁 FETCH AVEC REFRESH
// ========================= */
// const customFetch = async (uri: RequestInfo | URL, options: any): Promise<Response> => {
//     const clonedOptions = {
//         ...options,
//         headers: { ...options.headers },
//     };
//
//     const token = JSON.parse(localStorage.getItem("token") ?? "{}");
//     const accessToken = token?.access_token;
//
//     if (accessToken) {
//         clonedOptions.headers.Authorization = `Bearer ${accessToken}`;
//     }
//
//     if (refreshingPromise) {
//         const newAccessToken = await refreshingPromise;
//         if (newAccessToken) {
//             clonedOptions.headers.Authorization = `Bearer ${newAccessToken}`;
//         }
//         return fetch(uri, clonedOptions);
//     }
//
//     const response = await fetch(uri, clonedOptions);
//
//     if (response.status !== 401) return response;
//
//     if (!token?.refresh_token) {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//         throw new Error("Unauthorized");
//     }
//
//     if (!refreshingPromise) {
//         const params = new URLSearchParams();
//         params.append("grant_type", "refresh_token");
//         params.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);
//         params.append("refresh_token", token.refresh_token);
//
//         refreshingPromise = fetch(String(process.env.NEXT_PUBLIC_KEYCLOAK_URL), {
//             method: "POST",
//             body: params,
//         })
//             .then(async (res) => {
//                 if (!res.ok) {
//                     localStorage.removeItem("token");
//                     window.location.href = "/login";
//                     return null;
//                 }
//                 const refreshJSON = await res.json();
//                 localStorage.setItem("token", JSON.stringify(refreshJSON));
//                 return refreshJSON.access_token;
//             })
//             .finally(() => {
//                 refreshingPromise = null;
//             });
//     }
//
//     const newAccessToken = await refreshingPromise;
//     if (newAccessToken) {
//         clonedOptions.headers.Authorization = `Bearer ${newAccessToken}`;
//         return fetch(uri, clonedOptions);
//     }
//
//     window.location.href = "/login";
//     throw new Error("Auth refresh failed");
// };
//
// /* =========================
//    🌐 HTTP LINKS
// ========================= */
// const httpLink = createHttpLink({
//     uri: process.env.NEXT_PUBLIC_API_URL,
//     fetch: customFetch,
// });
//
// const httpLinkLocal = createHttpLink({
//     uri: process.env.NEXT_PUBLIC_API_LOCAL_URL,
//     fetch: customFetch,
// });
//
// /* =========================
//    🔐 REQUÊTE INTERCEPTOR
// ========================= */
// const authMiddleware = setContext((_, { headers }) => ({
//     headers: {
//         ...headers,
//     },
// }));
//
// /* =========================
//    ❌ ERREUR INTERCEPTOR
// ========================= */
// const errorLink = onError(({ graphQLErrors, networkError }) => {
//     if (graphQLErrors) {
//         for (const err of graphQLErrors) {
//             if (err.extensions?.code === "UNAUTHENTICATED") {
//                 localStorage.removeItem("token");
//                 window.location.href = "/login";
//                 return;
//             }
//         }
//     }
//
//     if (networkError && "statusCode" in networkError && networkError.statusCode === 401) {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//     }
// });
//
// /* =========================
//    🧠 CACHE (inchangé)
// ========================= */
// const cache = new InMemoryCache({
//     typePolicies: {
//         driverType: { keyFields: ["driverID"] },
//         vehicle: { keyFields: ["registration"] },
//         DashboardType: {
//             keyFields: ["agregation", ["consumption", "cost", "count", "fuel"]],
//         },
//         DetailedStatistics: {
//             keyFields: ["cost", "vehicle", ["id"]],
//         },
//         Query: {
//             fields: {
//                 vehicle: {
//                     read(_, { args, toReference }) {
//                         return toReference({ __typename: "Vehicle", id: args?.id });
//                     },
//                 },
//                 notifications: {
//                     keyArgs: ["type", "readType", "vehicleIds", "archived"],
//                     merge(existing = [], incoming, { args }) {
//                         const merged = existing.slice(0);
//                         for (let i = 0; i < incoming.length; ++i) {
//                             merged[args?.offset + i] = incoming[i];
//                         }
//                         return merged;
//                     },
//                 },
//                 paths: {
//                     keyArgs: ["vehicleIds", "from", "to"],
//                     merge(existing = [], incoming, { args }) {
//                         const merged = existing.slice(0);
//                         for (let i = 0; i < incoming.length; ++i) {
//                             merged[args?.offset + i] = incoming[i];
//                         }
//                         return merged;
//                     },
//                 },
//             },
//         },
//     },
// });
//
// /* =========================
//    🔀 SPLIT ENTRE 2 APIs
// ========================= */
// const directionalLink = new RetryLink().split(
//     (operation: Operation) => operation.getContext().version === "php",
//     from([authMiddleware, httpLinkLocal]),
//     from([authMiddleware, httpLink])
// );
//
// /* =========================
//    🚀 CLIENT
// ========================= */
// export const apolloClient = new ApolloClient({
//     link: from([errorLink, directionalLink]),
//     cache,
//     devtools: { enabled: true },
// });


'use client';

import { ApolloClient, ApolloLink, createHttpLink, from, InMemoryCache, Operation } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';

let refreshingPromise: Promise<Response> | null;

const customFetch = async (uri: RequestInfo | URL, options: any): Promise<Response> => {
    // Cloner les options
    const clonedOptions = {
        ...options,
        headers: { ...options.headers }
    };

    let token;
    if (typeof window !== 'undefined') {
        token = JSON.parse(localStorage.getItem('token') ?? '{}');
    }
    const accessToken = token?.access_token;

    if (accessToken) {
        clonedOptions.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshingPromise) {
        const newAccessToken = await refreshingPromise;
        if (newAccessToken) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', JSON.stringify(newAccessToken));
            }
            clonedOptions.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return fetch(uri, clonedOptions);
    }

    const response = await fetch(uri, clonedOptions);

    if (response.status !== 401) {
        return response;
    }

    // Si 401, rafraîchir le token
    if (!token?.refresh_token) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    // Créer refreshingPromise une seule fois
    if (!refreshingPromise) {
        const address = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);
        params.append('refresh_token', token.refresh_token);

        refreshingPromise = fetch(address, {
            method: 'POST',
            body: params,
        })
            .then(async (res) => {
                if (res.ok) {
                    const refreshJSON = await res.json();
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', JSON.stringify(refreshJSON));
                    }
                    return refreshJSON.access_token;
                } else {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                    return null;
                }
            })
            .finally(() => {
                refreshingPromise = null;
            });
    }

    const newAccessToken = await refreshingPromise;
    if (newAccessToken) {
        clonedOptions.headers.Authorization = `Bearer ${newAccessToken}`;
        return fetch(uri, clonedOptions);
    } else {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Auth refresh failed');
    }
};

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    fetch: customFetch
});

const httpLinkLocal = createHttpLink({
    uri: process.env.NEXT_PUBLIC_API_LOCAL_URL,
    fetch: customFetch
});

const authMiddleware = setContext(async (_, { headers }) => {
    return {
        headers: {
            ...headers,
        },
    };
});

const cache = new InMemoryCache({
    typePolicies: {
        driverType: {
            keyFields: ["driverID"],
        },
        vehicle: {
            keyFields: ["registration"],
        },
        DashboardType: {
            keyFields: ["agregation", ["consumption", "cost", "count", "fuel"]]
        },
        DetailedStatistics: {
            keyFields: ['cost', 'vehicle', ['id']]
        },
        Query: {
            fields: {
                vehicle: {
                    read(_, { args, toReference }) {
                        return toReference({
                            __typename: 'Vehicle',
                            id: args?.id,
                        });
                    }
                },
                notifications: {
                    keyArgs: ['type', 'readType', 'vehicleIds', 'archived'],
                    merge(existing, incoming, { args }) {
                        const merged = existing ? existing.slice(0) : [];
                        for (let i = 0; i < incoming.length; ++i) {
                            merged[args?.offset + i] = incoming[i];
                        }
                        return merged;
                    },
                },
                paths: {
                    keyArgs: ['vehicleIds', 'from', 'to'],
                    merge(existing, incoming, { args }) {
                        const merged = existing ? existing.slice(0) : [];
                        for (let i = 0; i < incoming.length; ++i) {
                            merged[args?.offset + i] = incoming[i];
                        }
                        return merged;
                    },
                },
            }
        }
    },
});

const directionalLink = new RetryLink().split(
    (operation: Operation) => operation.getContext().version === 'php',
    from([authMiddleware, httpLinkLocal]),
    from([authMiddleware, httpLink]),
);

const client = new ApolloClient({
    link: directionalLink,
    cache: cache,
    ssrMode: typeof window === 'undefined',
});

export default client;