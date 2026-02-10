"use client"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Spin, Drawer } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery as useQueryCS } from "@tanstack/react-query";

import {IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import { useGetVehicles, useVehiclesWithStatus } from "@/lib/hooks";
import { vehiclesByType, TYPE_FLEET } from "@/lib/utils/VehicleType";
import { fetchReservations } from "@/app/actions/reservations";

import VehicleTypeBar from "./components/VehicleTypeBar";
// import CarmooveGMapV2 from "./components/CarmooveGMapV2";
// import LeftPanel from "./components/LeftPanel";
// import BottomPanel from "./components/BottomPanel";

import "./Maps.css";

export default function MapsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleIdParam = searchParams.get('vehicleid');

    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [vehicleTypePill, setVehicleTypePill] = useState(TYPE_FLEET);
    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
    const [vehiclesSelected, setVehiclesSelected] = useState<IVehicle[]>([]);
    const [vehicleSelected, setVehicleSelected] = useState<IVehicle | null>(null);
    const [openPanel, setOpenPanel] = useState(false);
    const [reservations, setReservations] = useState<IReservation[]>([]);

    const qReservations = useQueryCS({
        queryKey: ['reservations'],
        queryFn: () => fetchReservations({}),
    });

    const { vehicles: vehicleData, loading, error } = useGetVehicles(120000);
    const { vehiclesStatusWithLoading: vehiclesWithStatus } = useVehiclesWithStatus(vehicles);

    useEffect(() => {
        if (qReservations.data) {
            setReservations(qReservations.data);
        }
    }, [qReservations.data]);

    useEffect(() => {
        if (vehicleData) {
            setVehicles(vehicleData);
        }
    }, [vehicleData]);

    // Update vehicles with status from CS
    useEffect(() => {
        if (vehiclesWithStatus.length > 0) {
            setVehicles(prevVehicles => {
                return prevVehicles.map(v => {
                    const updatedVehicle = vehiclesWithStatus.find(vws => vws.id === v.id);
                    return updatedVehicle || v;
                });
            });
        }
    }, [vehiclesWithStatus]);

    // Reset selections on type change
    useEffect(() => {
        setVehiclesSelected([]);
    }, [vehicleTypePill, selectedVehicle]);

    useEffect(() => {
        setSelectedVehicle(null);
    }, [vehicleTypePill]);

    // Handle vehicleIdParam from URL
    useEffect(() => {
        if (selectedVehicle && vehicleIdParam) {
            router.push('/maps');
        } else if (vehicleIdParam && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.id === vehicleIdParam);
            if (vehicle) {
                setSelectedVehicle(vehicle);
                setVehicleSelected(vehicle);
                setOpenPanel(true);
            }
        }
    }, [vehicles, vehicleIdParam, selectedVehicle, router]);

    if (loading || qReservations.isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Chargement de la carte...">
                    <div style={{ height: '200px' }} />
                </Spin>
            </div>
        );
    }

    if (error || qReservations.error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>Erreur lors du chargement</p>
            </div>
        );
    }

    const displayedVehicles = vehiclesSelected.length > 0
        ? vehiclesSelected
        : selectedVehicle
            ? [selectedVehicle]
            : vehiclesByType(vehicles, vehicleTypePill, selectedVehicle);

    const filteredVehicles = vehiclesByType(vehicles, vehicleTypePill, selectedVehicle);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
        >
            <VehicleTypeBar
                showReloadButton
                vehicleTypePill={vehicleTypePill}
                setVehicleTypePill={setVehicleTypePill}
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                setSelectedVehicle={setSelectedVehicle}
            />

            <div className="map-full">
                {/*<CarmooveGMapV2*/}
                {/*    vehicles={displayedVehicles}*/}
                {/*    reservations={reservations}*/}
                {/*    onSelectedVehicle={(vehicle) => {*/}
                {/*        setVehicleSelected(vehicle);*/}
                {/*        setOpenPanel(true);*/}
                {/*    }}*/}
                {/*/>*/}

                {/*<LeftPanel*/}
                {/*    vehicles={filteredVehicles}*/}
                {/*    reservations={reservations}*/}
                {/*    setVehiclesSelected={setVehiclesSelected}*/}
                {/*/>*/}

                <Drawer
                    title={vehicleSelected ? `${vehicleSelected.information.registration} - ${vehicleSelected.information.make} ${vehicleSelected.information.model}` : "Détails du véhicule"}
                    placement="bottom"
                    onClose={() => setOpenPanel(false)}
                    open={openPanel}
                    height="auto"
                    styles={{ body: { padding: '16px' } }}
                >
                    {/*<BottomPanel vehicle={vehicleSelected} />*/}
                </Drawer>
            </div>
        </motion.div>
    );
}
