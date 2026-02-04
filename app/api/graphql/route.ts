import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Variable globale pour gérer les refreshs concurrents
let refreshingPromise: Promise<any> | null = null;

export async function POST(request: NextRequest) {

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (tokenCookie?.value) {
        try {
            const tokenJson = JSON.parse(tokenCookie.value);
            accessToken = tokenJson.access_token;
            refreshToken = tokenJson.refresh_token;
        } catch (e) {
            console.error("Error parsing token cookie:", e);
        }
    }

    const apiType = request.nextUrl.searchParams.get('api');
    const targetUrl = apiType === 'local'
        ? process.env.REACT_APP_API_LOCAL_URL
        : process.env.REACT_APP_API_URL;

    if (!targetUrl) {
         return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const body = await request.text();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Si un refresh est déjà en cours, attendre son résultat
    if (refreshingPromise) {
        console.log("Refresh already in progress, waiting...");
        const newTokenJson = await refreshingPromise;

        if (newTokenJson) {
            headers['Authorization'] = `Bearer ${newTokenJson.access_token}`;

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            const data = await response.json();
            return NextResponse.json(data, {
                status: response.status,
                statusText: response.statusText
            });
        }
    }

    try {
        let response = await fetch(targetUrl, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        // Gestion du 401 et Refresh Token
        if (response.status === 401 && refreshToken) {
            console.log("401 detected, attempting token refresh...");

            // On ne crée le refreshingPromise qu'une seule fois
            if (!refreshingPromise) {
                const refreshParams = new URLSearchParams();
                refreshParams.append('grant_type', 'refresh_token');
                refreshParams.append('client_id', process.env.REACT_APP_KEYCLOAK_CLIENT_ID!);
                refreshParams.append('refresh_token', refreshToken);

                refreshingPromise = fetch(String(process.env.REACT_APP_KEYCLOAK_URL), {
                    method: 'POST',
                    body: refreshParams
                })
                .then(async (refreshResponse) => {
                    if (refreshResponse.ok) {
                        const newTokenJson = await refreshResponse.json();
                        console.log("Token refreshed successfully.");
                        return newTokenJson;
                    } else {
                        console.error("Token refresh failed");
                        return null;
                    }
                })
                .finally(() => {
                    refreshingPromise = null;
                });
            }

            // Attendre le nouveau token
            const newTokenJson = await refreshingPromise;

            if (newTokenJson) {
                const newAccessToken = newTokenJson.access_token;
                const newHeaders = { ...headers, 'Authorization': `Bearer ${newAccessToken}` };

                // Rejouer la requête
                response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: newHeaders,
                    body: body,
                });

                // Gestion de la réponse après refresh
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Retry failed with status ${response.status}. Response body:`, errorText.substring(0, 500));

                    try {
                        const data = JSON.parse(errorText);
                        const jsonResponse = NextResponse.json(data, {
                            status: response.status,
                            statusText: response.statusText
                        });

                        // Mettre à jour le cookie
                        jsonResponse.cookies.set('token', JSON.stringify(newTokenJson), {
                            httpOnly: true,
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 60 * 60 * 24
                        });
                        return jsonResponse;
                    } catch (jsonError) {
                        const errorResponse = new NextResponse(errorText, { status: response.status });
                        return errorResponse;
                    }
                }

                const data = await response.json();
                const jsonResponse = NextResponse.json(data, {
                    status: response.status,
                    statusText: response.statusText
                });

                // Mettre à jour le cookie avec le nouveau token
                jsonResponse.cookies.set('token', JSON.stringify(newTokenJson), {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24
                });

                return jsonResponse;
            } else {
                // Le refresh a échoué, rediriger vers login
                const errorResponse = NextResponse.json({
                    error: 'Token refresh failed',
                    // redirect: '/login'
                }, { status: 401 });

                // Supprimer le cookie invalide
                errorResponse.cookies.delete('token');

                return errorResponse;
            }
        }

        const responseText = await response.text();
        try {
             // Tenter de parser en JSON
             const data = JSON.parse(responseText);
             return NextResponse.json(data, {
                status: response.status
            });
        } catch (e) {
            // Si ce n'est pas du JSON (ex: HTML erreur), on loggue et on renvoie
            console.error("Upstream response was not JSON:", responseText.substring(0, 200));
            // On peut renvoyer une erreur explicite au client
            return new NextResponse(responseText, {
                status: response.status,
                headers: { 'Content-Type': response.headers.get('Content-Type') || 'text/plain' }
            });
        }

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
    }
}
