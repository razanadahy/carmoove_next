'use client';

import {ApolloClient, ApolloLink, createHttpLink, from, InMemoryCache, Operation} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';

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

// Link pour gérer les erreurs d'authentification et les erreurs réseau
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        const hasAuthError = graphQLErrors.some(
            error => error.extensions?.code === 'UNAUTHENTICATED' ||
                     error.message?.includes('Token refresh failed')
        );

        if (hasAuthError && typeof window !== 'undefined') {
            console.error('Authentication error, redirecting to login');
            // window.location.href = '/login';
        }
    }

    // Gérer les erreurs réseau (401 non capturés par GraphQL)
    if (networkError && 'statusCode' in networkError) {
        if (networkError.statusCode === 401 && typeof window !== 'undefined') {
            console.error('401 Unauthorized, redirecting to login');
            // window.location.href = '/login';
        }
    }
});

const directionalLink = from([
    errorLink,
]).split(
    (operation: Operation) => operation.getContext().version === 'php',
    httpLinkLocal,
    httpLink,
);

const client = new ApolloClient({
    link: directionalLink,
    cache: cache,
    ssrMode: typeof window === 'undefined',
});

export default client;
