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
    uri: process.env.REACT_APP_API_URL,
    fetch: customFetch
});

const httpLinkLocal = createHttpLink({
    uri: process.env.REACT_APP_API_LOCAL_URL,
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