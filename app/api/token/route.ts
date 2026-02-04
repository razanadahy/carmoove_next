import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('token');

        if (!tokenCookie) {
            return NextResponse.json({ token: null }, { status: 200 });
        }

        const tokenJson = JSON.parse(tokenCookie.value);
        return NextResponse.json({ token: tokenJson }, { status: 200 });
    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json({ token: null }, { status: 500 });
    }
}
