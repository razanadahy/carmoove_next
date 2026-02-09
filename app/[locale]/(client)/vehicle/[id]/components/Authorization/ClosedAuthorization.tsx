'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import { DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver, IVehicle, IAuthorization } from "@/lib/hooks/Interfaces";
import { fetchClosedAuthorization } from "@/app/actions/authorization";
import { Loading } from "@/components/Common/Loading";
import ClosedAuthorizationRow from "./ClosedAuthorizationRow";
import "./Authorization.css";

interface ClosedAuthorizationProps {
    vehicle: IVehicle;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    setAuthorizationView: React.Dispatch<React.SetStateAction<IAuthorization | null>>;
}

export default function ClosedAuthorization({ vehicle, reload, setReload, setAuthorizationView }: ClosedAuthorizationProps) {
    const [drivers, setDrivers] = useState<IDriver[]>([]);

    const { loading: loadingDriver, error: errorDriver, data: dataDriver } = useQuery(DRIVERS_QUERY, {
        context: { version: "php" },
    });

    const queryClosedAuthorizations = useQueryCS({
        queryKey: ['closedAuthorizations', vehicle.id],
        queryFn: () => fetchClosedAuthorization({ vehicleId: vehicle.id }),
    });

    const authorizations = useMemo(() => {
        let auths = (queryClosedAuthorizations.data ?? []).map((authorization: IAuthorization) => {
            const driver = drivers.find(d => d.driverID === authorization.driverId && !!authorization.authorizationId);
            return {
                ...authorization,
                driverName: driver ? `${driver.firstName} ${driver.lastName}` : '',
            };
        });
        return auths.filter((auth: IAuthorization) =>
            auth.driverName !== undefined && auth.driverName !== null && auth.driverName !== ''
        );
    }, [queryClosedAuthorizations.data, drivers]);

    useEffect(() => {
        if (dataDriver?.drivers) {
            setDrivers(JSON.parse(JSON.stringify(dataDriver.drivers)));
        }
    }, [dataDriver]);

    if (queryClosedAuthorizations.isLoading) {
        return <Loading msg="Chargement..." />;
    }

    return (
        <div className="authorization-main-box">
            {authorizations.length > 0 ? (
                authorizations.map(authorization => (
                    <ClosedAuthorizationRow
                        key={authorization.authorizationId}
                        authorization={authorization}
                        setReload={setReload}
                        setAuthorizationView={setAuthorizationView}
                    />
                ))
            ) : (
                <span className="no-authorization-content">Aucune autorisation disponible</span>
            )}
        </div>
    );
}
