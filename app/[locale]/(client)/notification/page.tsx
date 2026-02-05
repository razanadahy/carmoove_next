'use client'

import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/lib/graphql/queries";
import { useGetVehicles } from "@/lib/hooks";
import { Spin } from "antd";
import Alerts from "./components/Alerts";

export default function Notification() {
    const { loading: ldUser, error: erUser, data: dataUser } = useQuery(ME_QUERY);
    const { vehicles, loading, error } = useGetVehicles(120000);

    if (loading || ldUser) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Spin size="large" tip="Chargement...">
                    <div style={{ height: '100px' }} />
                </Spin>
            </div>
        );
    }

    if (error || erUser) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
                <p>Erreur lors du chargement des données</p>
            </div>
        );
    }

    return (
        <div className="notification-page">
            <h2 className="mb-4">Notifications</h2>
            <Alerts user={dataUser.whoami} vehicles={vehicles} />
        </div>
    );
}
