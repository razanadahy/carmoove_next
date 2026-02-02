import axios, { AxiosInstance } from 'axios';
import { cookies } from 'next/headers';

let refreshingPromise: Promise<string | null> | null = null;

const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_CAR_SHARING_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    client.interceptors.request.use(async (config) => {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('token');
        if (tokenCookie) {
            const tokenJson = JSON.parse(tokenCookie.value);
            if (tokenJson.access_token) {
                config.headers!['x-carmoove-token'] = tokenJson.access_token;
            }
        }
        return config;
    });
    
    client.interceptors.response.use((response) => response, async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const cookieStore = await cookies();
                const tokenCookie = cookieStore.get('token');
                const token = tokenCookie ? JSON.parse(tokenCookie.value) : null;

                if (!token?.refresh_token) {
                    cookieStore.delete({name: 'token',  path: '/' });
                    throw error;
                }

                if (!refreshingPromise) {
                    const params = new URLSearchParams();
                    params.append('grant_type', 'refresh_token');
                    params.append('client_id', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);
                    params.append('refresh_token', token.refresh_token);

                    refreshingPromise = fetch(process.env.NEXT_PUBLIC_KEYCLOAK_URL!, {
                        method: 'POST',
                        body: params,
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                cookieStore.delete({name: 'token', path: '/'} );
                                return null;
                            }
                            const refreshJSON = await res.json();
                            // Mettre à jour le cookie
                            cookieStore.set('token', JSON.stringify(refreshJSON), {
                                httpOnly: true,
                                path: '/',
                                maxAge: 60 * 60 * 24,
                            });
                            return refreshJSON.access_token;
                        })
                        .finally(() => {
                            refreshingPromise = null;
                        });
                }

                const newAccessToken = await refreshingPromise;

                if (newAccessToken) {
                    originalRequest.headers['x-carmoove-token'] = newAccessToken;
                    return client(originalRequest);
                } else {
                    throw error;
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export default createApiClient;


// import { NextResponse } from 'next/server';
// import createApiClient from '@/lib/apiClient';
//
// export async function GET() {
//     const apiClient = createApiClient();
//
//     try {
//         const response = await apiClient.get('/some-protected-endpoint');
//         return NextResponse.json(response.data);
//     } catch (error) {
//         return NextResponse.json({ success: false, message: 'Erreur API' }, { status: 500 });
//     }
// }