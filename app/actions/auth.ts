'use server';

import { cookies } from "next/headers";
import createApiClient from "@/lib/api/axios-client";
import {IReservation} from "@/lib/hooks/Interfaces";
const apiClient = createApiClient();
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
    try {
        const { data } = await apiClient.get<IUserCS>('/v1/user')
        return data
    } catch (error) {
        console.error('Erreur lors de fetchCurrentUser:', error)
        throw error
    }
}

export const fetchVehicleReservations = async ({ vehicleId }: { vehicleId: string }) => {
    try {
        const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/vehicle/${vehicleId}/booking`);
        return data.bookings;
    } catch (error) {
        console.error('Erreur lors de fetchVehicleReservations:', error);
        throw error;
    }
}

export const fetchVehicleReservationsArchives = async ({ vehicleId, type }: { vehicleId: string, type: string }) => {
    try {
        const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/vehicle/${vehicleId}/booking/archives?type=${type}`);
        // const { data } = await apiClient.get<{ bookings: IReservation[] }>(`/v1/bookings/archives`);
        return data.bookings;
    } catch (error) {
        console.error('Erreur lors de fetchVehicleReservations:', error);
        throw error;
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

export interface IPostAddReservation {
    idVehicle: string
    type: string
    from: number
    until: number
    driver?: string
}

export const addReservation = async ({ idVehicle, type, from, until, driver }: IPostAddReservation) => {
    try {
        const { data } = await apiClient.post(`/v1/vehicle/${idVehicle}/booking`, {
            type,
            from,
            until,
            driver
        })
        return data
    } catch (error) {
        console.error('Erreur lors de addReservation:', error)
        throw error
    }
}