'use server';
import { IParking } from "@/lib/hooks/Interfaces";
import createApiClient from '@/lib/api/axios-client';
const apiClient = createApiClient();

interface IResponseParkings {
    parkings: IParking[]
    error?: string
}

export const addParking = async (field: IParking) => {
    try {
        const { data } = await apiClient.post(
            `/v1/parkings`, field
        );
        return data;
    } catch (error) {
        throw error;
    }
}

export const updateParking = async (field: IParking) => {
    try {
        const { data } = await apiClient.post(
            `/v1/parkings/${field.id}`, field
        );
        return data;
    } catch (error) {
        throw error;
    }
}

export const getParkings = async () => {
    try {
        const { data } = await apiClient.get<IResponseParkings>(
            `/v1/parkings`,
        );
        return data;
    } catch (error) {
        throw error;
    }
}

export const deleteParking = async (field: IParking) => {
    try {
        const { data } = await apiClient.delete(
            `/v1/parkings/${field.id}`,
        );
        return data;
    } catch (error) {
        throw error;
    }
}

export interface IRespVehicleParking {
    address: string
    address2: string
    city: string
    country: string
    error: string
    id: string | undefined
    name: string
    zipcode: string
}

export const getVehicleParking = async ({ id }: { id: string }) => {
    try {
        const { data } = await apiClient.get<IRespVehicleParking>(
            `/v1/vehicle/${id}/parking`,
        )
        return data
    } catch (error) {
        throw error
    }
}

export const updateVehicleParking = async ({ vehicleId, parkingId }: { vehicleId: string, parkingId: string }) => {
    try {
        const { data } = await apiClient.post(
            `/v1/vehicle/${vehicleId}/parking`, {
                parkingId
            }
        )
        return data;
    } catch (error) {
        throw error;
    }
}

export const deleteVehicleParking = async ({ vehicleId }: { vehicleId: string }) => {
    try {
        const { data } = await apiClient.delete(
            `/v1/vehicle/${vehicleId}/parking`, {}
        )
        return data;
    } catch (error) {
        throw error;
    }
}
