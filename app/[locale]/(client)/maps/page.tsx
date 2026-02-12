'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/Common/Loading";
import { useGetVehicles } from "@/lib/hooks";
import { IVehicle, IReservation } from "@/lib/hooks/Interfaces";
import { vehiclesByType } from "@/lib/utils/VehicleType";
import { fetchReservations } from "@/app/actions/reservations";
import VehicleTypeBar from "./components/VehicleTypeBar";
import CarmooveGMap from "./components/CarmooveGMap";
import RightPanel from "./components/RightPanel";
import BottomPanel from "./components/BottomPanel";
import "./Maps.css";

export default function Maps() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleIdParam = searchParams.get('vehicleid');

    // State
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    const [vehicleTypePill, setVehicleTypePill] = useState("FLEET");
    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
    const [vehiclesSelected, setVehiclesSelected] = useState<IVehicle[]>([]);
    const [reservations, setReservations] = useState<IReservation[]>([]);
    const [openPanel, setOpenPanel] = useState(false);

    // Fetch reservations
    const qReservations = useQuery({
        queryKey: ['reservations_maps'],
        queryFn: () => fetchReservations({}),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch vehicles with polling
    const { vehicles: vehicleData, loading, error } = useGetVehicles(120000);

    // Update reservations when fetched
    useEffect(() => {
        if (qReservations.data) {
            setReservations(qReservations.data);
        }
    }, [qReservations.data]);

    // Update vehicles when fetched
    useEffect(() => {
        if (vehicleData) {
            setVehicles(vehicleData);
        }
    }, [vehicleData]);

    // Reset selected vehicles when type changes
    useEffect(() => {
        setVehiclesSelected([]);
    }, [vehicleTypePill, selectedVehicle]);

    // Reset selected vehicle when type changes
    useEffect(() => {
        setSelectedVehicle(null);
    }, [vehicleTypePill]);

    // Handle vehicleId from URL param
    useEffect(() => {
        if (selectedVehicle && vehicleIdParam) {
            router.push('/maps');
        } else if (vehicleIdParam && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.id === vehicleIdParam);
            if (vehicle) {
                setSelectedVehicle(vehicle);
                setOpenPanel(true);
            }
        }
    }, [vehicles, vehicleIdParam, selectedVehicle, router]);

    // Handle vehicle selection
    const handleSelectVehicle = (vehicle: IVehicle | null) => {
        setSelectedVehicle(vehicle);
        if (vehicle) {
            setOpenPanel(true);
        }
    };

    const handleClosePanel = () => {
        setOpenPanel(false);
        setSelectedVehicle(null);
    };

    const handleTogglePanel = () => {
        setOpenPanel((prev) => !prev);
    };

    const getDisplayedVehicles = () => {
        if (vehiclesSelected.length > 0) {
            return vehiclesSelected;
        }
        // if (selectedVehicle) {
        //     return [selectedVehicle];
        // }
        return vehiclesByType(vehicles, vehicleTypePill, selectedVehicle);
    };

    if (loading || qReservations.isLoading) {
        return <Loading msg="Chargement de la carte..." />;
    }
    if (error || qReservations.error) {
        return <p>Error :(</p>;
    }

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
                onSelectVehicle={handleSelectVehicle}
            />
            <div className="map-full">
                <CarmooveGMap
                    vehicles={getDisplayedVehicles()}
                    reservations={reservations}
                    selectedVehicle={selectedVehicle}
                    onSelectVehicle={handleSelectVehicle}
                />
                <RightPanel
                    vehicles={vehiclesByType(vehicles, vehicleTypePill, selectedVehicle)}
                    reservations={reservations}
                    vehiclesSelected={vehiclesSelected}
                    setVehiclesSelected={setVehiclesSelected}
                />
                <BottomPanel
                    vehicle={selectedVehicle}
                    open={openPanel}
                    onClose={handleClosePanel}
                    onToggle={handleTogglePanel}
                />
            </div>
        </motion.div>
    );
}
