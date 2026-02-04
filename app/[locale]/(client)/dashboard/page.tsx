"use client"

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { Spin } from "antd";
import { ME_QUERY } from "@/lib/graphql/queries";
import { IUser, IVehicle } from "@/lib/hooks/Interfaces";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import { useGetVehicles } from "@/lib/hooks";
import {
    TYPE_FLEET,
    TYPE_VEHICLE,
    vehiclesByType,
} from "@/lib/utils/VehicleType";
import { fetchReservations, IReservation } from "@/app/actions/reservationServices";

import BigBox from "./components/BigBox";
import AlertBar from "./components/AlertBar";
import StatBarFleet from "./components/StatBarFleet";
import VehicleTypeBar from "./components/VehicleTypeBar";
import VehicleStatusBar from "./components/VehicleStatusBar";
import VehicleInformationBox from "./components/VehicleInformationBox";
import FiscalYearStats from "./components/Statistics/FiscalYearStats";
import CarmooveGMapV2 from "./components/CarmooveGMapV2";

import "./Dashboard.css";

export default function Dashboard() {
    const [vehicleTypePill, setVehicleTypePill] = useState(TYPE_FLEET);
    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [reservations, setReservations] = useState<IReservation[]>([]);

    const me = useQuery(ME_QUERY, {
        context: {
            version: "php",
        },
    });

    const qReservations = useQueryCS({
        queryKey: ['reservations'],
        queryFn: () => fetchReservations({}),
    });

    const { loading, error, vehicles: vehiclesCS } = useGetVehicles(1200000);

    useEffect(() => {
        if (qReservations.data) {
            setReservations(qReservations.data);
        }
    }, [qReservations.data]);

    if (me.loading || qReservations.isLoading || loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Chargement du tableau de bord...">
                    <div style={{ height: '200px' }} />
                </Spin>
            </div>
        );
    }

    if (me.error || qReservations.error || error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>
                    Erreur lors du chargement du tableau de bord.
                </p>
            </div>
        );
    }

    const user: IUser = me.data?.whoami;

    const vehicles = vehiclesByType(
        vehiclesCS,
        vehicleTypePill,
        selectedVehicle,
        selectedMake
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="dashboard-main-content"
        >
            <div className="vehicle-bar-header">
                <VehicleTypeBar
                    vehicleTypePill={vehicleTypePill}
                    setVehicleTypePill={setVehicleTypePill}
                    me={me}
                    vehicles={vehiclesCS}
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                    selectedMake={selectedMake}
                    setSelectedMake={setSelectedMake}
                />
            </div>

            {vehicleTypePill === TYPE_VEHICLE && selectedVehicle !== null && (
                <VehicleInformationBox vehicle={selectedVehicle} />
            )}

            {vehicleTypePill === TYPE_VEHICLE && selectedVehicle !== null && user?.company && (
                <div style={{ marginTop: '20px' }}>
                    <FiscalYearStats vehicle={selectedVehicle} user={user} />
                </div>
            )}

            {vehicleTypePill !== TYPE_VEHICLE && (
                <StatBarFleet types={vehicleTypePill} />
            )}

            <div className="row">
                <div className="col mr-25">
                    <AlertBar vehicles={vehicles} />
                    {vehicleTypePill !== TYPE_VEHICLE && (
                        <VehicleStatusBar vehicles={vehicles} reservations={reservations} />
                    )}
                </div>

                <div className="col">
                    <BigBox
                        id="map-box"
                        title="Localisation de vos véhicules"
                        link={{ link: "/maps", label: "Voir la carte" }}
                    >
                        <CarmooveGMapV2
                            vehicles={vehicles}
                            reservations={reservations}
                            forDashboard
                        />
                    </BigBox>
                </div>
            </div>
        </motion.div>
    );
}
