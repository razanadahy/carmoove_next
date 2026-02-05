'use server';

import createApiClient from '@/lib/api/axios-client';
import {IVehicleStatusCS} from "@/lib/hooks/Interfaces";
import {IGetVehicleStatusCS} from "@/lib/hooks";
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
        return data
    } catch (error) {
        throw error;
    }
}
interface IPutEditReservation {
    id: string
    from: number
    until: number
}
export const editReservation = async ({ id, from, until }: IPutEditReservation) => {
    try {
        const { data } = await apiClient.put(`/v1/booking/${id}`, {
            from,
            until
        })
        return data
    } catch (error) {
        console.error('Erreur lors de editReservation:', error)
        throw error
    }
}
interface IDeleteReservation {
    id: string;
}

export const deleteReservation = async (field: IDeleteReservation) => {
    try {
        const { data } = await apiClient.delete(`/v1/booking/${field.id}`);
        return data;
    } catch (error) {
        console.error('Erreur lors de deleteBooking:', error);
        throw error;
    }
}
