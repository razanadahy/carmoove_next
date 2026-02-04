"use client"

import { Card, Tag, Space } from "antd";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { CarOutlined, EnvironmentOutlined, UserOutlined } from "@ant-design/icons";

interface VehicleInformationBoxProps {
    vehicle: IVehicle;
}

export default function VehicleInformationBox({ vehicle }: VehicleInformationBoxProps) {
    const energyTrueFormat = (energyAbrev: string | null) => {
        switch (energyAbrev) {
            case 'GO':
                return 'Diesel';
            case 'EL':
                return 'Electrique';
            case 'ES':
                return 'Essence';
            case 'ESS+ELEC HNR':
                return 'Hybride';
            default:
                return 'Inconnu';
        }
    };

    const energyColor = (energyAbrev: string | null) => {
        switch (energyAbrev) {
            case 'EL':
                return 'green';
            case 'ESS+ELEC HNR':
                return 'blue';
            default:
                return 'orange';
        }
    };

    return (
        <Card className="vehicle-box">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="large">
                        <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px' }}>
                            {vehicle.information.registration}
                        </Tag>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            <CarOutlined /> {vehicle.information.make} - {vehicle.information.model}
                        </span>
                        <Tag color={energyColor(vehicle.information.energy)}>
                            {energyTrueFormat(vehicle.information.energy)}
                        </Tag>
                    </Space>
                </div>

                {vehicle.location?.address?.address && (
                    <div>
                        <EnvironmentOutlined /> Dernière localisation:{' '}
                        <a href={`/maps?vehicleid=${vehicle.id}`}>
                            {vehicle.location.address.address}, {vehicle.location.address.zipcode} {vehicle.location.address.city}
                        </a>
                    </div>
                )}

                <div>
                    <UserOutlined /> Conducteur:{' '}
                    {vehicle.driver?.driverID ? (
                        <span>
                            {vehicle.driver.firstName} {vehicle.driver.lastName}
                            {vehicle.driver.email && (
                                <span> - <a href={`mailto:${vehicle.driver.email}`}>{vehicle.driver.email}</a></span>
                            )}
                        </span>
                    ) : (
                        <span>Aucun conducteur</span>
                    )}
                </div>
            </Space>
        </Card>
    );
}
