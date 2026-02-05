'use server';

import createApiClient from '@/lib/api/axios-client';
import {IVehicleStatusCS} from "@/lib/hooks/Interfaces";
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
export const getVehicleStatus = async (field: IGetVehicleStatusCS) => {
    try {

        const { data } = await apiClient.get<IVehicleStatusCS>(`/v1/vehicle/status`, {
            params: field
        });
        console.log("data : ",data);
        return data
    } catch (error) {
        throw error;
    }
}