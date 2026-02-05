'use client'

import { IVehicle } from "@/lib/hooks/Interfaces";
import { useRouter } from "next/navigation";
import { Tag, Spin } from "antd";
import { CarOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import Immat from "@/components/Common/Immat";
import { energyTrueFormat } from "@/services/VehiculesService";

interface IVehicleRowProps {
    vehicle: IVehicle;
}

const VehicleRow = ({ vehicle }: IVehicleRowProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/vehicle/${vehicle.id}`);
    };

    const isElectric = vehicle.information.energy === 'EL';
    const isHybrid = vehicle.information.energy === 'ESS+ELEC HNR';
    const isUnavailable = vehicle.stateCS?.state?.unavailable;
    const isCharging = vehicle.electricityStatus?.chargeInProgress;
    const batteryLevel = vehicle.electricityStatus?.battery;
    const fuelLevel = vehicle.status?.fuelPercent || 0;

    return (
        <div className="vehicle-row" onClick={handleClick}>
            <div className="vehicle-row-left">
                <Immat registration={vehicle.information.registration} size="normal" />
                <div className="vehicle-info">
                    <span className="vehicle-name">
                        {vehicle.information.make} {vehicle.information.model}
                    </span>
                    <span className="vehicle-energy">
                        {energyTrueFormat(vehicle.information.energy)}
                    </span>
                </div>
            </div>

            <div className="vehicle-row-center">
                {vehicle.driver && (
                    <span className="vehicle-driver">
                        {vehicle.driver.firstName} {vehicle.driver.lastName}
                    </span>
                )}
            </div>

            <div className="vehicle-row-right">
                {/* Loading status */}
                {vehicle.statusLoading && (
                    <Spin size="small" />
                )}

                {/* Availability */}
                {!vehicle.statusLoading && (
                    <Tag color={isUnavailable ? "error" : "success"}>
                        {isUnavailable ? "Indisponible" : "Disponible"}
                    </Tag>
                )}

                {/* Battery/Fuel level */}
                {(isElectric || isHybrid) && batteryLevel !== undefined && (
                    <Tag color={batteryLevel < 25 ? "warning" : "default"} icon={<ThunderboltOutlined />}>
                        {batteryLevel.toFixed(2)}%
                    </Tag>
                )}

                {!isElectric && fuelLevel > 0 && (
                    <Tag color={fuelLevel < 25 ? "warning" : "default"}>
                        {fuelLevel.toFixed(2)}%
                    </Tag>
                )}

                {/* Charging */}
                {isCharging && (
                    <Tag color="blue" icon={<ThunderboltOutlined />}>
                        En charge
                    </Tag>
                )}

                {/* Privacy/Geolocation */}
                <Tag color={vehicle.status?.privacy ? "blue" : "green"} icon={<EnvironmentOutlined />}>
                    {vehicle.status?.privacy ? "Smart" : "Géo"}
                </Tag>

                {/* Connected status */}
                {vehicle.device ? (
                    <Tag color="success">Connecté</Tag>
                ) : (
                    <Tag color="default">Non connecté</Tag>
                )}
            </div>
        </div>
    );
};

export default VehicleRow;
