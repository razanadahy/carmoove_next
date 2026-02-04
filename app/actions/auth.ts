'use server';

import { cookies } from "next/headers";
import createApiClient from "@/lib/api/axios-client";

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return { success: true };
}
export interface IUserCS {
    id: string
    firstname: string
    lastname: string
    email: string
    features: string[]
}

export const fetchCurrentUser = async () => {
    const apiClient = createApiClient();
    try {
        const { data } = await apiClient.get<IUserCS>('/v1/user')
        return data
    } catch (error) {
        console.error('Erreur lors de fetchCurrentUser:', error)
        throw error
    }
}
