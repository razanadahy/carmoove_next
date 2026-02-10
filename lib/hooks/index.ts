'use client';

import { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { App } from "antd";
import {
    VEHICLES_QUERY, VEHICLE_QUERY, DRIVERS_QUERY, DRIVER_QUERY, DRIVER_STATISTICS_QUERY, DRIVER_PATH_QUERY,
    NOMENCLATURE_QUERY, PATHS_QUERY, COUNT_PATHS_QUERY, TELLTALESTATUS_QUERY, DASHBOARD_QUERY, GLOBAL_STATISTIC_QUERY,
    ALERTS_COUNT_QUERY
} from "../graphql/queries";
import {TECHNICAL_SUPPORT, REGISTER_DRIVER, REGISTER_ASSISTANCE} from "../graphql/mutation";
import {IFromTo, IVehicle, IVehicleStatusCS} from "@/lib/hooks/Interfaces";
import {useQueries} from "@tanstack/react-query";
import {getVehicleStatus} from "@/app/actions/reservations";
import {getVehicleAntsTypes, TYPE_FLEET, TYPE_VEHICLE, VehicleType} from "@/lib/utils/VehicleType";


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
export interface IGetVehicleStatusCS {
    vehicleId: string;
    plate: string;
}

export const useVehiclesWithStatus = (vehicles: IVehicle[]) => {
    return useQueries({
        queries: vehicles.map(vehicle => ({
            queryKey: ['vehicle', vehicle.id],
            queryFn: () => getVehicleStatus({
                vehicleId: vehicle.id,
                plate: vehicle.information.registration,
            }),
            enabled: !!vehicle.id
        })),
        combine: (results) => {
            const statusRecord: Record<string, IVehicleStatusCS> = {};
            const vehiclesStatusWithLoading: IVehicle[] = [];

            results.forEach((query, index) => {
                const vehicle = vehicles[index];

                if (query.data) {
                    statusRecord[vehicle.id] = query.data;
                }

                vehiclesStatusWithLoading.push({
                    ...vehicle,
                    stateCS: query.data,
                    statusLoading: query.isLoading ,
                    statusError: query.isError,
                });
            });
            const refetchAll = () => {
                return Promise.all(results.map(query => query.refetch()));
            };

            return {
                data: statusRecord,
                vehiclesStatusWithLoading,
                isFetching: results.some(q => q.isFetching),
                isLoading: results.some(q => q.isLoading),
                refetch: refetchAll,
            };
        }
    });
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

export const useGetVehicle = (vehicleId: string, pollInterval?: number) => {
    const { data, loading, error, refetch } = useQuery(VEHICLE_QUERY, {
        variables: {
            id: vehicleId,
        },
        pollInterval: pollInterval ?? 0,
        context: {
            version: "php",
        },
        skip: !vehicleId,
    });

    return { data, loading, error, refetch };
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


export const useRegisterAssistance = (id: string, onCompleted?: () => void) => {
    const { notification } = App.useApp();

    const [registerAssistance, { loading, error }] = useMutation(
        REGISTER_ASSISTANCE,
        {
            refetchQueries: [
                {
                    query: VEHICLE_QUERY,
                    variables: { id },
                    context: {
                        version: "php",
                    },
                },
            ],

            onError: () => {
                notification.error({
                    message: "Erreur lors de la mise à jour de l'assurance",
                });
            },

            onCompleted: (data) => {
                onCompleted?.();
                if (data.registerAssistance)
                    notification.success({
                        message: "L'assurance a été mise à jour",
                    });
            },
        }
    );

    return { registerAssistance, loading, error };
};


type InsuranceType = Record<string, any>;

export const useGetInsurances = (code: string) => {
    const { data, loading, error } = useQuery(NOMENCLATURE_QUERY, {
        variables: {
            category: "INSURANCES",
            code,
        },
    });

    const insuranceData = useMemo(
        () =>
            data?.nomenclature
                .map((insurance: InsuranceType) => ({
                    code: insurance.code,
                    label: insurance.translation[0].text,
                }))
                .sort(
                    (a: InsuranceType, b: InsuranceType) =>
                        a.label > b.label ? 1 : b.label > a.label ? -1 : 0 // Sort insurances by label
                ) ?? [],
        [data]
    );

    return [insuranceData, loading, error];
};

export const useGetVehiclePaths = ({
    from,
    to,
    vehicleId,
    offset = 0,
    limit = 30,
}: {
    from: number;
    to: number;
    vehicleId: string;
    offset?: number;
    limit?: number;
}) => {
    const { data, loading, error, fetchMore } = useQuery(PATHS_QUERY, {
        fetchPolicy: "no-cache",
        variables: {
            vehicleIds: [vehicleId],
            from,
            to,
            offset,
            limit,
        },
        pollInterval: 300000,
    });

    return { data, loading, error, fetchMore };
};

export const useCountVehiclePaths = ({
    from,
    to,
    vehicleId,
}: {
    from: number;
    to: number;
    vehicleId: string;
}) => {
    const { data, loading, error } = useQuery(COUNT_PATHS_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleIds: [vehicleId],
            from,
            to,
        },
        context: {
            version: "php",
        },
        pollInterval: 300000,
    });

    return { count: data?.countPaths ?? 0, loading, error };
};

export const useGetTellTaleStatus = ({id, pollInterval = 0,}: { id: string; pollInterval?: number; }) => {
    const { data, loading, error } = useQuery(TELLTALESTATUS_QUERY, {
        variables: {
            vehicles: [id],
        },
        pollInterval,
    });

    return { data, loading, error };
};
export const useGetStats = ({from, to, type, pollInterval, vehicles}: { from: number; to: number; type?: VehicleType | typeof TYPE_FLEET | typeof TYPE_VEHICLE; pollInterval?: number; vehicles?: string[]; }) => {
    const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
        variables: {
            from: from,
            to: to,
            type: type ? getVehicleAntsTypes(type) : [],
            vehicles: vehicles ?? []
        },
        pollInterval: pollInterval ?? 0,
    });

    return { data, loading, error };
};

export const useGetGlobalStat = ({from, to, type, vehicles,}: { from: number; to: number; type?: VehicleType; vehicles?: string[]; }) => {
    const { data, loading, error } = useQuery(GLOBAL_STATISTIC_QUERY, {
        variables: {
            from,
            to,
            type: type ? getVehicleAntsTypes(type) : [],
            vehicles: vehicles ?? []
        },
        context: {
            version: "php",
        },
    });

    return { data, loading, error };
};


interface IArg extends IFromTo {
    type?: VehicleType;
    vehicles?: string[];
}

export const useGetAlertsCount = ({ from, to, type, vehicles }: IArg) => {
    const { loading, error, data } = useQuery(ALERTS_COUNT_QUERY, {
        variables: {
            from,
            to,
            vehicleTypes: type ? getVehicleAntsTypes(type) : [],
            vehicleIds: vehicles ?? [],
        },
        context: {
            version: "php",
        },
    });

    return { loading, error, data };
};
