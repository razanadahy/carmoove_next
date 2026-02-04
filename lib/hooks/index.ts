'use client';

import { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { App } from "antd";
import { VEHICLES_QUERY, DRIVERS_QUERY, DRIVER_QUERY, DRIVER_STATISTICS_QUERY, DRIVER_PATH_QUERY } from "../graphql/queries";
import { TECHNICAL_SUPPORT, REGISTER_DRIVER } from "../graphql/mutation";
import {IVehicle} from "@/lib/hooks/Interfaces";


export const useGetVehicles = (pollInterval?: number) => {
    const { data, loading, error, refetch } = useQuery(VEHICLES_QUERY, {
        pollInterval: pollInterval ?? 0,
        context: {
            version: "php",
        },
    });

    const vehicles: IVehicle[] = useMemo(() => {
        return data?.vehicles ?? []
    }, [data?.vehicles]);

    return { vehicles, loading, error, refetch };
};

export const useTechnicalSupport = () => {
    const { notification } = App.useApp();

    const [mutate, { loading, error }] = useMutation(TECHNICAL_SUPPORT, {
        onError: () => {
            notification.error({ message: "Erreur lors de l'envoi du message" });
        },
        onCompleted: () => {
            notification.success({ message: "Le message a bien été envoyé" });
        }
    });

    return { mutate, loading, error };
};

export const useRegisterDriver = (onCompleted?: () => void) => {
    const { notification } = App.useApp();

    const [registerDriver, { loading, error }] = useMutation(REGISTER_DRIVER, {
        refetchQueries: [
            {
                query: DRIVERS_QUERY,
            },
        ],
        onError: (e) => {
            console.error("REGISTER_DRIVER error:", e);
            notification.error({
                message: "Erreur lors de la création du conducteur",
            });
        },
        onCompleted: () => {
            onCompleted?.();
            notification.success({
                message: "Le conducteur a été créé",
            });
        },
    });

    return { registerDriver, loading, error };
};

export const useGetDriver = (driverId: string) => {
    const { data, loading, error, refetch } = useQuery(DRIVER_QUERY, {
        variables: {
            id: driverId,
        },
        context: {
            version: "php",
        },
    });

    return { data, loading, error, refetch };
};

export const useGetDriverStatistics = (driverId: string) => {
    const { data, loading, error } = useQuery(DRIVER_STATISTICS_QUERY, {
        variables: {
            driverId: driverId,
        },
        context: {
            version: "php",
        },
    });

    return { data, loading, error };
};

export const useGetDriverPath = ({
    from,
    to,
    driverId,
    onCompleted,
}: {
    from: number | undefined;
    to: number | undefined;
    driverId: string;
    onCompleted?: () => void;
}) => {
    const { data, loading, error, fetchMore } = useQuery(DRIVER_PATH_QUERY, {
        fetchPolicy: "no-cache",
        variables: {
            driverIds: [driverId],
            from,
            to,
            offset: 0,
            limit: 20,
        },
        context: {
            version: "php",
        },
        pollInterval: 300000,
        onCompleted: () => {
            onCompleted?.();
        },
    });

    return { data, loading, error, fetchMore };
};
