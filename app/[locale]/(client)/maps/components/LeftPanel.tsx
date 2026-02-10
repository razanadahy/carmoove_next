'use client';

import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { Tooltip } from "antd";
import { IVehicle, IReservation } from "@/lib/hooks/Interfaces";

interface ILeftPanel {
    vehicles: IVehicle[];
    reservations: IReservation[];
    selectedVehicle: IVehicle | null;
    onSelectVehicle: (vehicle: IVehicle | null) => void;
    vehiclesSelected: IVehicle[];
    setVehiclesSelected: Dispatch<SetStateAction<IVehicle[]>>;
}

interface IVehicleStatus {
    key: string;
    label: string;
    color: string;
    count: number;
    vehicles: IVehicle[];
}

export default function LeftPanel({
    vehicles,
    reservations,
    selectedVehicle,
    onSelectVehicle,
    vehiclesSelected,
    setVehiclesSelected
}: ILeftPanel) {
    const [isOpen, setIsOpen] = useState(false);

    const now = Date.now();

    const vehicleStatuses = useMemo<IVehicleStatus[]>(() => {
        const available: IVehicle[] = [];
        const unavailable: IVehicle[] = [];
        const reserved: IVehicle[] = [];
        const running: IVehicle[] = [];
        const parked: IVehicle[] = [];

        const reservedVehicleIds = new Set(
            reservations
                .filter(r => r.from <= now && r.until >= now)
                .map(r => r.vehicleId)
        );

        vehicles.forEach(vehicle => {
            if (vehicle.stateCS?.state?.unavailable) {
                unavailable.push(vehicle);
            } else if (reservedVehicleIds.has(vehicle.id)) {
                reserved.push(vehicle);
            } else {
                available.push(vehicle);
            }

            if (vehicle.status?.engine === "ON") {
                running.push(vehicle);
            } else {
                parked.push(vehicle);
            }
        });

        return [
            { key: 'available', label: 'Disponibles', color: '#52c41a', count: available.length, vehicles: available },
            { key: 'unavailable', label: 'Indisponibles', color: '#ff4d4f', count: unavailable.length, vehicles: unavailable },
            { key: 'reserved', label: 'Réservés', color: '#faad14', count: reserved.length, vehicles: reserved },
            { key: 'running', label: 'En mouvement', color: '#1890ff', count: running.length, vehicles: running },
            { key: 'parked', label: 'Stationnés', color: '#8c8c8c', count: parked.length, vehicles: parked },
        ];
    }, [vehicles, reservations, now]);

    const handleStatusClick = (status: IVehicleStatus) => {
        if (vehiclesSelected.length > 0 && vehiclesSelected[0].id === status.vehicles[0]?.id) {
            setVehiclesSelected([]);
        } else {
            setVehiclesSelected(status.vehicles);
        }
        onSelectVehicle(null);
    };

    const handleReset = () => {
        setVehiclesSelected([]);
        onSelectVehicle(null);
    };

    return (
        <div className={`left-panel-wrapper ${isOpen ? 'left-panel-open' : ''}`}>
            <div
                className="left-panel-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg
                    className={`ico-btn-panel ${isOpen ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </div>

            <div className="status">
                {vehicleStatuses.map((status) => (
                    <Tooltip key={status.key} title={status.label} placement="right">
                        <div
                            className="vehicle-status-item"
                            onClick={() => handleStatusClick(status)}
                            style={{
                                backgroundColor: vehiclesSelected.length > 0 &&
                                    vehiclesSelected[0].id === status.vehicles[0]?.id
                                    ? '#e6f7ff'
                                    : 'transparent'
                            }}
                        >
                            <div
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: status.color
                                }}
                            />
                            <span className="count">{status.count}</span>
                            {isOpen && (
                                <span className="tooltip-text">{status.label}</span>
                            )}
                        </div>
                    </Tooltip>
                ))}

                {(vehiclesSelected.length > 0 || selectedVehicle) && (
                    <div
                        className="reinit-filter-status-map"
                        onClick={handleReset}
                    >
                        Réinitialiser le filtre
                    </div>
                )}
            </div>
        </div>
    );
}
