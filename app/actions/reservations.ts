'use server';

import createApiClient from '@/lib/api/axios-client';
import {EnumImmobilizerStatusCS, EnumLockStatusCS, IPostUpdateStateCS, IVehicleStatusCS} from "@/lib/hooks/Interfaces";
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
export const updateState = async (field: IPostUpdateStateCS) => {
    try {
        const { data } = await apiClient.post(`/v1/vehicle/${field.id}/${field.state}?state=${field.value}`,);
        return data;
    } catch (error) {
        throw error;
    }
}
import { EnumAction, IActionsCS } from "@/lib/hooks/Interfaces";

export interface IGetActionsList {
    id: string,
}
interface IPostUpdateLightOnSecurity {
    vehicleId: string,
}
interface IPostUpdateImmobilizationSecurity {
    vehicleId: string,
    value: boolean
}

interface IPostUpdateHonkSecurity {
    vehicleId: string,
}

interface IPostUpdateLockSecurity {
    vehicleId: string,
    value: boolean
}

interface IResponseImmobilizerSecurity {
    Status: EnumImmobilizerStatusCS,
    error: string
}

interface IResponseLockSecurity {
    Status: EnumLockStatusCS,
    error: string
}

interface IPostUpdateUnlockTrunkSecurity {
    vehicleId: string,
}
export const getActionsList = async (field: IGetActionsList) => {
    try {
        const { data } = await apiClient.get<IActionsCS>(
            `/v1/vehicle/actions`, {
                params: field
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de getActionsList:', error);
        throw error;
    }
}


export const updateImmobilizationSecurity = async (field: IPostUpdateImmobilizationSecurity) => {
    try {
        const { data } = await apiClient.post<IResponseImmobilizerSecurity>(
            `/v1/vehicle/${field.value ? 'immobilize' : 'start'}`, {
                vehicleId: field.vehicleId
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de updateImmobilizationSecurity:', error);
        throw error;
    }
}

export const updateHonkSecurity = async (field: IPostUpdateHonkSecurity) => {
    try {
        const { data } = await apiClient.post(
            `/v1/vehicle/honk`, {
                vehicleId: field.vehicleId
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de updateHonkSecurity:', error);
        throw error;
    }
}

export const updateLockSecurity = async (field: IPostUpdateLockSecurity) => {
    try {
        const { data } = await apiClient.post<IResponseLockSecurity>(
            `/v1/vehicle/${field.value ? 'lock' : 'unlock'}`, {
                vehicleId: field.vehicleId
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de updateLockSecurity:', error);
        throw error;
    }
}

export const updatUnlockTrunkSecurity = async (field: IPostUpdateUnlockTrunkSecurity) => {
    try {
        const { data } = await apiClient.post(
            `/v1/vehicle/trunk/unlock`, {
                vehicleId: field.vehicleId
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de updatUnlockTrunkSecurity:', error);
        throw error;
    }
}

export const updatLightOnSecurity = async (field: IPostUpdateLightOnSecurity) => {
    try {
        const { data } = await apiClient.post(
            `/v1/vehicle/lights/on`, {
                vehicleId: field.vehicleId
            }
        );
        return data;
    } catch (error) {
        console.error('Erreur lors de updatLightOnSecurity:', error);
        throw error;
    }
}
