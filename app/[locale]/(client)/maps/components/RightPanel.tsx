'use client';

import { useState } from "react";
import Image from "next/image";
import { IVehicle, IReservation } from "@/lib/hooks/Interfaces";
import VehicleStatusBar from "./VehicleStatusBar/VehicleStatusBar";
import upOutlined_i from "@/assets/image/up-outlined.svg";
import "./RightPanel.css";

interface IProps {
    vehicles: IVehicle[];
    reservations: IReservation[];
    vehiclesSelected: IVehicle[];
    setVehiclesSelected: (vehicles: IVehicle[]) => void;
}

export default function RightPanel({
    vehicles,
    reservations,
    vehiclesSelected,
    setVehiclesSelected
}: IProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleReinitFilterMap = () => {
        setVehiclesSelected([]);
    };

    const handleSelectVehicles = (vehicles: IVehicle[]) => {
        setVehiclesSelected(vehicles);
    };

    return (
        <div className={`right-panel-wrapper${isOpen ? " right-panel-open" : ""}`}>
            <div onClick={toggleOpen} className="right-panel-button">
                <Image
                    className={`ico-btn-panel${isOpen ? ' open' : ''}`}
                    src={upOutlined_i}
                    alt="toggle panel"
                    width={16}
                    height={16}
                />
            </div>
            <div className="d-flex bg-white flex-column justify-content-center px-1 rounded-3 pb-1">
                <VehicleStatusBar
                    vehicles={vehicles}
                    reservations={reservations}
                    onSelectVehicles={handleSelectVehicles}
                />
                {vehiclesSelected.length > 0 && (
                    <a className="reinit-filter-status-map text-center" onClick={handleReinitFilterMap}>
                        Réinitialiser
                    </a>
                )}
            </div>
        </div>
    );
}
