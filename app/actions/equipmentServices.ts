'use server'
import createApiClient from "@/lib/api/axios-client";

const apiClient = createApiClient();

export interface Equipment {
    code: string;
    translation: {
        language: string;
        text: string;
    }[];
}

type AddEquipmentsPayload = {
    equipments: string[]
}
export const getParamEquipments = async () => {
    try {
        const { data } = await apiClient.get<{ equipments: Equipment[] }>(`/v1/equipments`,)
        return data.equipments
    } catch (error) {
        throw error
    }
}
export const addEquipments = async (equipments: AddEquipmentsPayload) => {
    try {
        const { data } = await apiClient.post(`/v1/equipments`, equipments);
        return data;
    } catch (error) {
        throw error;
    }
}
export const getParamEquipmentsVehicule = async (id:string) => {
    try {
        const { data } = await apiClient.get<{ equipments: Equipment[] }>(`/v1/vehicle/${id}/equipments`,)
        return data.equipments
    } catch (error) {
        throw error
    }
}
export const addEquipmentsVehicle = async (equipments: AddEquipmentsPayload, id: string) => {
    try {
        const { data } = await apiClient.post(`/v1/vehicle/${id}/equipments`, equipments);
        return data;
    } catch (error) {
        throw error;
    }
}
