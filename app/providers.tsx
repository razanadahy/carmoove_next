'use client';

import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';

import apolloClient from '@/lib/api/apollo-client';
import queryClient from '@/lib/api/react-query-client';

export function Providers({ children }: { children: React.ReactNode }) {
    // Supprimer l'avertissement console.error pour defaultProps
    if (typeof window !== 'undefined') {
        const originalError = console.error;
        // eslint-disable-next-line react-hooks/immutability
        console.error = (...args) => {
            if (typeof args[0] === 'string' && args[0].includes('defaultProps')) {
                return;
            }
            originalError(...args);
        };
    }

    return (
        <ApolloProvider client={apolloClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ApolloProvider>
    );
}