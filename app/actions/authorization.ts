'use server'
import createApiClient from "@/lib/api/axios-client";
import {IAuthorization, IEditAuthorisation, IVehicleStatusCS} from "@/lib/hooks/Interfaces";

const apiClient = createApiClient();


interface IPostAuthorisation {
    vehicleId: string;
    userId: string;
    level: string;
    from: number;
    until: number;
}

interface IGetAuthorisation {
    vehicleId: string;
    limit?: number
}

interface IDeleteAuthorisation {
    authorizationId: string;
}



export const fetchAuthorization = async (field: IGetAuthorisation) => {
    try {
        const { data } = await apiClient.get<IVehicleStatusCS>('/v1/vehicle/' + field.vehicleId + '/status');
        return data.authorizations;
    } catch (error) {
        console.error('Erreur lors de fetchReservation:', error);
        throw error;
    }
}

export const fetchClosedAuthorization = async (field: IGetAuthorisation) => {
    try {
        const { data } = await apiClient.get(`/v1/vehicle/${field.vehicleId}/authorizations/expired?offset=0${field.limit ? `&limit=${field.limit}` : ''}`);
        const authorizations: IAuthorization[] = data.authorizations
        return authorizations;
    } catch (error) {
        console.error('Erreur lors de fetchClosedAuthorization:', error);
        throw error;
    }
}

export const fetchFutureAuthorization = async (field: IGetAuthorisation) => {
    try {
        const { data } = await apiClient.get('/v1/vehicle/' + field.vehicleId + '/authorizations/scheduled');
        const authorizations: IAuthorization[] = data.authorizations
        return authorizations;
    } catch (error) {
        console.error('Erreur lors de fetchFutureAuthorization:', error);
        throw error;
    }
}

export const createAuthorization = async (field: IPostAuthorisation) => {
    try {
        const { data } = await apiClient.post('/v1/bluetooth-token', field);
        return data;
    } catch (error) {
        console.error('Erreur lors de createAuthorization:', error);
        throw error;
    }
}

export const deleteAuthorization = async (field: IDeleteAuthorisation) => {
    try {
        const { data } = await apiClient.delete('/v1/bluetooth-token', { data: field });
        return data;
    } catch (error) {
        console.error('Erreur lors de deleteAuthorization:', error);
        throw error;
    }
}

export const editAuthorization = async (field: IEditAuthorisation) => {
    try {
        const { data } = await apiClient.post(`/v1/bluetooth-token/${field.authorizationId}`, {
            from: field.from,
            until: field.until
        });
        return data;
    } catch (error) {
        console.error('Erreur lors de editAuthorization:', error);
        throw error;
    }
}
