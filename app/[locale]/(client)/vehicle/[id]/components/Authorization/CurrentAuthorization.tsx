'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import { DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver, IVehicle, IAuthorization } from "@/lib/hooks/Interfaces";
import { fetchAuthorization } from "@/app/actions/authorization";
import { Loading } from "@/components/Common/Loading";
import AuthorizationRow from "./AuthorizationRow";
import "./Authorization.css";

interface CurrentAuthorizationProps {
    vehicle: IVehicle;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CurrentAuthorization({ vehicle, reload, setReload }: CurrentAuthorizationProps) {
    const [drivers, setDrivers] = useState<IDriver[]>([]);

    const { loading: loadingDriver, error: errorDriver, data: dataDriver } = useQuery(DRIVERS_QUERY, {
        context: { version: "php" },
    });

    const queryAuthorizations = useQueryCS({
        queryKey: ['authorizations', vehicle.id],
        queryFn: () => fetchAuthorization({ vehicleId: vehicle.id }),
    });

    const authorizations = useMemo(() => {
        const authorizationCustom = (queryAuthorizations.data ?? []).map((authorization: IAuthorization) => {
            const driver = drivers.find(d => d.driverID === authorization.driverId);
            return {
                ...authorization,
                driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'nodriver',
            };
        });
        return authorizationCustom.filter(
            auth => auth.driverName !== 'nodriver' && !!auth.authorizationId
        );
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
