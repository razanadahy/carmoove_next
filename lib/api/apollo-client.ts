'use client';

import { ApolloClient, createHttpLink, from, InMemoryCache, Operation } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

// Nous utilisons maintenant un Proxy Next.js (/api/graphql) qui gère :
// 1. L'ajout du token via le cookie HttpOnly
// 2. Le rafraîchissement du token en cas de réponse 401

const httpLink = createHttpLink({
    uri: '/api/graphql',
});

const httpLinkLocal = createHttpLink({
    uri: '/api/graphql?api=local',
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
    httpLinkLocal,
    httpLink,
);

const client = new ApolloClient({
    link: directionalLink,
    cache: cache,
    ssrMode: typeof window === 'undefined',
    // defaultOptions: {
    //     watchQuery: {
    //         context: {
    //             version: "php",
    //         }
    //     },
    //     query: {
    //         context: {
    //             version: "php",
    //         },
    //     },
    //     mutate: {
    //         context: {
    //             version: "php",
    //         },
    //     },
    // }
});

export default client;
