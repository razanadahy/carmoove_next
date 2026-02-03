import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // Déterminer l'URL cible
    const apiType = request.nextUrl.searchParams.get('api');
    const targetUrl = apiType === 'local'
        ? process.env.REACT_APP_API_LOCAL_URL
        : process.env.REACT_APP_API_URL;

    if (!targetUrl) {
         return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    // Préparer headers et body pour la requête upstream
    const body = await request.text(); // GraphQL envoie souvent du texte/JSON

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
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

            // Tentative de refresh
            const refreshParams = new URLSearchParams();
            refreshParams.append('grant_type', 'refresh_token');
            // Utiliser REACT_APP_... server-side fonctionne aussi si chargé via .env.local
            refreshParams.append('client_id', process.env.REACT_APP_KEYCLOAK_CLIENT_ID!);
            refreshParams.append('refresh_token', refreshToken);

            const refreshResponse = await fetch(String(process.env.REACT_APP_KEYCLOAK_URL), {
                method: 'POST',
                body: refreshParams
            });

            if (refreshResponse.ok) {
                const newTokenJson = await refreshResponse.json();
                console.log("Token refreshed successfully.");

                // Mettre à jour le cookie
                // On met à jour accessToken pour la requête rejouée
                const newAccessToken = newTokenJson.access_token;

                // Rejouer la requête initiale
                const newHeaders = { ...headers, 'Authorization': `Bearer ${newAccessToken}` };

                response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: newHeaders,
                    body: body,
                });

                // Préparer la réponse finale pour le client
                const data = await response.json();
                const jsonResponse = NextResponse.json(data, {
                    status: response.status,
                    statusText: response.statusText
                });

                // Mettre à jour le cookie "token" sur le client
                // On garde les mêmes paramètres de sécurité que dans login
                jsonResponse.cookies.set('token', JSON.stringify(newTokenJson), {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 // 24h, à ajuster selon vos besoins
                });

                return jsonResponse;

            } else {
                console.error("Token refresh failed");
                // Si le refresh échoue, on retourne le 401 original
                // Optionnel : supprimer le cookie invalide
                // responseWithCookie.cookies.delete('token');
            }
        }

        // Si tout est OK (ou si refresh échoué), on renvoie la réponse upstream telle quelle
        const data = await response.json();
        return NextResponse.json(data, {
            status: response.status
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
    }
}
