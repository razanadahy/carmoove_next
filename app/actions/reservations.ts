'use server';

import createApiClient from '@/lib/api/axios-client';
const apiClient = createApiClient();
interface IReservation {
    id: string;
    [key: string]: any;
}

export const fetchReservations = async ({ all, type }: { all?: boolean, type?: string }) => {

    try {
        const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/bookings?${all ? 'all=true' : ''}${type ? (all ? `&type=${type}` : `type=${type}`) : ''}`);
        return data.bookings;
    } catch (error: any) {
        console.error('Erreur lors de fetchReservations:', error);
        throw new Error(error?.message || 'Failed to fetch reservations');
    }
}
export const fetchAllReservationsArchives = async ({ type }: {  type: string }) => {
    try {
        const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/bookings/archives?type=${type}`);
        return data.bookings;
    } catch (error) {
        console.error('Erreur lors de fetchVehicleReservations:', error);
        throw error;
    }
}