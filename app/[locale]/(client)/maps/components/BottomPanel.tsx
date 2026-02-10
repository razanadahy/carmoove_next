'use client';

import { Drawer, Descriptions, Tag, Button, Space } from "antd";
import { CloseOutlined, CarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface IBottomPanel {
    vehicle: IVehicle | null;
    open: boolean;
    onClose: () => void;
}

const getVehicleStatusTag = (vehicle: IVehicle) => {
    if (vehicle.stateCS?.state?.unavailable) {
        return <Tag color="error">Indisponible</Tag>;
    }
    if (vehicle.status?.engine === "ON") {
        return <Tag color="processing">En mouvement</Tag>;
    }
    return <Tag color="success">Disponible</Tag>;
};

const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return "-";
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm", { locale: fr });
};

export default function BottomPanel({ vehicle, open, onClose }: IBottomPanel) {
    const router = useRouter();

    const handleViewDetails = () => {
        if (vehicle) {
            router.push(`/vehicle/${vehicle.id}`);
        }
    };

    return (
        <Drawer
            title={
                vehicle ? (
                    <Space>
                        <CarOutlined />
                        <span>{vehicle.information.registration}</span>
                        {getVehicleStatusTag(vehicle)}
                    </Space>
                ) : "Détails du véhicule"
            }
            placement="bottom"
            onClose={onClose}
            open={open}
            height={320}
            extra={
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={onClose}
                />
            }
        >
            {vehicle ? (
                <div className="bottom-panel-content">
                    <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                        <Descriptions.Item label="Marque">
                            {vehicle.information.make}
                        </Descriptions.Item>
                        <Descriptions.Item label="Modèle">
                            {vehicle.information.model}
                        </Descriptions.Item>
                        <Descriptions.Item label="Immatriculation">
                            {vehicle.information.registration}
                        </Descriptions.Item>
                        <Descriptions.Item label="Energie">
                            {vehicle.information.energy || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kilométrage">
                            {vehicle.status?.mileage
                                ? `${vehicle.status.mileage.toLocaleString()} km`
                                : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Niveau carburant">
                            {vehicle.status?.fuelPercent !== undefined
                                ? `${vehicle.status.fuelPercent}%`
                                : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Conducteur">
                            {vehicle.driver?.firstName && vehicle.driver?.lastName
                                ? `${vehicle.driver.firstName} ${vehicle.driver.lastName}`
                                : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dernière position">
                            {formatTimestamp(vehicle.location?.timestamp)}
                        </Descriptions.Item>
                    </Descriptions>

                    {vehicle.location?.address && (
                        <div style={{ marginTop: 16 }}>
                            <Space>
                                <EnvironmentOutlined />
                                <span>
                                    {vehicle.location.address.address}
                                    {vehicle.location.address.city &&
                                        `, ${vehicle.location.address.city}`}
                                    {vehicle.location.address.zipcode &&
                                        ` ${vehicle.location.address.zipcode}`}
                                </span>
                            </Space>
                        </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={handleViewDetails}>
                            Voir les détails
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="no-vehicle-selected">
                    Sélectionnez un véhicule sur la carte pour voir ses détails
                </div>
            )}
        </Drawer>
    );
}
