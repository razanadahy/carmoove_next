"use client"

import { Card, Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { IVehicle } from "@/lib/hooks/Interfaces";

interface AlertBarProps {
    vehicles: IVehicle[];
}

export default function AlertBar({ vehicles }: AlertBarProps) {
    const alertCount = vehicles.reduce((acc, vehicle) => {
        // TODO: Calculer le nombre réel d'alertes par véhicule
        return acc + 0;
    }, 0);

    return (
        <Card
            title={
                <span>
                    <BellOutlined /> Alertes
                </span>
            }
            extra={<Badge count={alertCount} />}
        >
            <p>Aucune alerte pour le moment</p>
        </Card>
    );
}
