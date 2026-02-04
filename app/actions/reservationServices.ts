'use server'
import createApiClient from "@/lib/api/axios-client";

const apiClient = createApiClient();

export interface IReservation {
    id: string
    from: number
    until: number
    vehicleId: string
    userId: string
    authorizationId: string
    bookingType: string
    stopDate?: number
}

interface FetchReservationsParams {
    all?: boolean;
    vehicleId?: string;
    from?: number;
    to?: number;
}

export const fetchReservations = async (params: FetchReservationsParams): Promise<IReservation[]> => {
    try {
        const { data } = await apiClient.get<{ reservations: IReservation[] }>('/v1/reservations', {
            params
        });
        return data.reservations ?? [];
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
}
