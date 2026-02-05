'use client'

import { useGetVehicles, useVehiclesWithStatus } from "@/lib/hooks";
import { Spin } from "antd";
import VehiclesBox from "./components/VehiclesBox";

export default function Vehicles() {
    const { vehicles: allVehicles, loading, error } = useGetVehicles(120000);
    const { vehiclesStatusWithLoading } = useVehiclesWithStatus(allVehicles);

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
                <p>Erreur lors du chargement des véhicules</p>
            </div>
        );
    }

    return (
        <div className="vehicles-page-container">
            <VehiclesBox loading={loading} allVehicles={vehiclesStatusWithLoading} />
        </div>
    );
}
