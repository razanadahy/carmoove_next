'use server';

import createApiClient from '@/lib/api/axios-client';

interface IReservation {
    id: string;
    [key: string]: any;
}

export const fetchReservations = async ({ all, type }: { all?: boolean, type?: string }) => {
    const apiClient = createApiClient();
    try {
        const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/bookings?${all ? 'all=true' : ''}${type ? (all ? `&type=${type}` : `type=${type}`) : ''}`);
        return data.bookings;
    } catch (error: any) {
        console.error('Erreur lors de fetchReservations:', error);
        throw new Error(error?.message || 'Failed to fetch reservations');
    }
}
