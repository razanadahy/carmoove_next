'use server';
import createApiClient from "@/lib/api/axios-client";
import {DetailInterfaces} from "@/app/[locale]/(client)/vehicle/[id]/services/DetailInterfaces";

const apiClient = createApiClient();

export const getISV = async (vehicleId: string) => {
    try {
        const { data } = await apiClient.get<DetailInterfaces>(`/v1/vehicle/${vehicleId}/siv`)
        return data
    } catch (error) {
        throw error
    }
};
