"use client"

import { Card } from "antd";
import {IReservation, IVehicle} from "@/lib/hooks/Interfaces";

interface VehicleStatusBarProps {
    vehicles: IVehicle[];
    reservations: IReservation[];
}

export default function VehicleStatusBar({ vehicles, reservations }: VehicleStatusBarProps) {
    const disponible = vehicles.filter(v => !v.stateCS?.state.unavailable).length;
    const indisponible = vehicles.length - disponible;
    const reserved = reservations.length;

    return (
        <Card title="Statut des véhicules">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>{disponible}</div>
                    <div>Disponibles</div>
                </div>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f' }}>{indisponible}</div>
                    <div>Indisponibles</div>
                </div>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>{reserved}</div>
                    <div>Réservés</div>
                </div>
            </div>
        </Card>
    );
}
