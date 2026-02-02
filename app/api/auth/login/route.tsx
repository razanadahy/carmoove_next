import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', process.env.REACT_APP_KEYCLOAK_CLIENT_ID!);
        params.append('username', email);
        params.append('password', password);

        const response = await fetch(String(process.env.REACT_APP_KEYCLOAK_URL), {
            method: 'POST',
            body: params
        });

        const tokenJson = await response.json();
        console.log(tokenJson);
        if (tokenJson.error) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Créer la réponse avec le cookie
        const responseWithCookie = NextResponse.json({
            success: true,
            user: tokenJson
        });

        // Ajouter le cookie
        responseWithCookie.cookies.set('token', JSON.stringify(tokenJson), {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 heures
        });

        return responseWithCookie;

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
