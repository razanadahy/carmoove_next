'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import { DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver, IVehicle, IAuthorization } from "@/lib/hooks/Interfaces";
import { fetchFutureAuthorization } from "@/app/actions/authorization";
import { Loading } from "@/components/Common/Loading";
import AuthorizationRow from "./AuthorizationRow";
import "./Authorization.css";

interface FutureAuthorizationProps {
    vehicle: IVehicle;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FutureAuthorization({ vehicle, reload, setReload }: FutureAuthorizationProps) {
    const [drivers, setDrivers] = useState<IDriver[]>([]);

    const { loading: loadingDriver, error: errorDriver, data: dataDriver } = useQuery(DRIVERS_QUERY, {
        context: { version: "php" },
    });

    const queryAuthorizations = useQueryCS({
        queryKey: ['futureAuthorizations', vehicle.id],
        queryFn: () => fetchFutureAuthorization({ vehicleId: vehicle.id }),
    });

    const authorizations = useMemo(() => {
        return (queryAuthorizations.data ?? []).map((authorization: IAuthorization) => {
            const driver = drivers.find(d => d.driverID === authorization.driverId && !!authorization.authorizationId);
            return {
                ...authorization,
                driverName: driver ? `${driver.firstName} ${driver.lastName}` : '',
            };
        }).filter(a => !!a.authorizationId && !!a.driverName);
    }, [queryAuthorizations.data, drivers]);

    useEffect(() => {
        if (dataDriver?.drivers) {
            setDrivers(JSON.parse(JSON.stringify(dataDriver.drivers)));
        }
    }, [dataDriver]);

    if (loadingDriver || queryAuthorizations.isLoading) {
        return <Loading msg="Chargement..." />;
    }

    if (errorDriver || queryAuthorizations.isError) {
        return <p className="error-text">Erreur lors du chargement</p>;
    }

    return (
        <div className="authorization-main-box">
            {authorizations.length > 0 ? (
                authorizations.map(authorization => (
                    <AuthorizationRow
                        key={authorization.authorizationId}
                        authorization={authorization}
                        vehicle={vehicle}
                        setReload={setReload}
                    />
                ))
            ) : (
                <span className="no-authorization-content">Aucune autorisation disponible</span>
            )}
        </div>
    );
}
