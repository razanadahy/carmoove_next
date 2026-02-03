'use client';

import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';


import apolloClient from '@/lib/api/apollo-client';
import queryClient from '@/lib/api/react-query-client';


export function Providers({ children }: { children: React.ReactNode }) {

    return (
        // <AntdRegistry>
        //     <AntdProvider>
        //         <App>
                    <ApolloProvider client={apolloClient}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </ApolloProvider>
    //             </App>
    //         </AntdProvider>
    //     </AntdRegistry>
    );
}
