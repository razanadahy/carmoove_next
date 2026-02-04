import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('token');

        if (!tokenCookie) {
            return NextResponse.json({ success: false, message: 'No token found' }, { status: 401 });
        }

        const token = JSON.parse(tokenCookie.value);

        if (!token?.refresh_token) {
            cookieStore.delete({ name: 'token', path: '/' });
            return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', process.env.REACT_APP_KEYCLOAK_CLIENT_ID!);
        params.append('refresh_token', token.refresh_token);

        const response = await fetch(process.env.REACT_APP_KEYCLOAK_URL!, {
            method: 'POST',
            body: params,
        });

        if (!response.ok) {
            cookieStore.delete({ name: 'token', path: '/' });
            return NextResponse.json({ success: false, message: 'Refresh failed' }, { status: 401 });
        }

        const refreshJSON = await response.json();

        // Mettre à jour le cookie
        cookieStore.set('token', JSON.stringify(refreshJSON), {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return NextResponse.json({ success: true, token: refreshJSON }, { status: 200 });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
}
