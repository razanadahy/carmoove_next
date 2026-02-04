'use client';

import { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { App } from "antd";
import { VEHICLES_QUERY } from "../graphql/queries";
import { TECHNICAL_SUPPORT } from "../graphql/mutation";
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
