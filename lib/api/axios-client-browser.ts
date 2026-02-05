import axios, { AxiosInstance } from 'axios';

let refreshingPromise: Promise<any> | null = null;

const createApiClientBrowser = (): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.REACT_APP_CAR_SHARING_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    client.interceptors.request.use(async (config) => {
        try {
            // Récupérer le token via la route API
            const response = await fetch('/api/token');
            const { token } = await response.json();

            if (token?.access_token) {
                config.headers!['x-carmoove-token'] = token.access_token;
            }
        } catch (error) {
            console.error('Error fetching token:', error);
        }
        return config;
    });

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                if (!refreshingPromise) {
                    refreshingPromise = fetch('/api/refresh-token', {
                        method: 'POST',
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                // Rediriger vers login si le refresh échoue
                                window.location.href = '/login';
                                return null;
                            }
                            const data = await res.json();
                            return data.token;
                        })
                        .catch((err) => {
                            console.error('Error refreshing token:', err);
                            window.location.href = '/login';
                            return null;
                        })
                        .finally(() => {
                            refreshingPromise = null;
                        });
                }

                const newToken = await refreshingPromise;

                if (newToken?.access_token) {
                    originalRequest.headers['x-carmoove-token'] = newToken.access_token;
                    return client(originalRequest);
                } else {
                    return Promise.reject(error);
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export default createApiClientBrowser;
