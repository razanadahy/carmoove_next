"use client"

import { Button, Space, Select } from "antd";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { TYPE_FLEET, TYPE_VP, TYPE_VUL, TYPE_PL, TYPE_VL, TYPE_VEHICLE } from "@/lib/utils/VehicleType";
import { Dispatch, SetStateAction } from "react";

const { Option } = Select;

interface VehicleTypeBarProps {
    vehicleTypePill: string;
    setVehicleTypePill: Dispatch<SetStateAction<string>>;
    me: any;
    vehicles: IVehicle[];
    selectedVehicle: IVehicle | null;
    setSelectedVehicle: Dispatch<SetStateAction<IVehicle | null>>;
    selectedMake: string | null;
    setSelectedMake: Dispatch<SetStateAction<string | null>>;
}

export default function VehicleTypeBar({
    vehicleTypePill,
    setVehicleTypePill,
    vehicles,
    selectedVehicle,
    setSelectedVehicle
}: VehicleTypeBarProps) {

    const handleTypeChange = (type: string) => {
        setVehicleTypePill(type);
        setSelectedVehicle(null);
    };

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Space>
                <Button
                    type={vehicleTypePill === TYPE_FLEET ? "primary" : "default"}
                    onClick={() => handleTypeChange(TYPE_FLEET)}
                >
                    Flotte
                </Button>
                <Button
                    type={vehicleTypePill === TYPE_VP ? "primary" : "default"}
                    onClick={() => handleTypeChange(TYPE_VP)}
                >
                    VP
                </Button>
                <Button
                    type={vehicleTypePill === TYPE_VUL ? "primary" : "default"}
                    onClick={() => handleTypeChange(TYPE_VUL)}
                >
                    VUL
                </Button>
                <Button
                    type={vehicleTypePill === TYPE_PL ? "primary" : "default"}
                    onClick={() => handleTypeChange(TYPE_PL)}
                >
                    PL
                </Button>
                <Button
                    type={vehicleTypePill === TYPE_VL ? "primary" : "default"}
                    onClick={() => handleTypeChange(TYPE_VL)}
                >
                    VL
                </Button>
            </Space>

            <Select
                placeholder="Sélectionner un véhicule"
                style={{ minWidth: 250 }}
                value={selectedVehicle?.id}
                onChange={(value) => {
                    const vehicle = vehicles.find(v => v.id === value);
                    if (vehicle) {
                        setSelectedVehicle(vehicle);
                        setVehicleTypePill(TYPE_VEHICLE);
                    }
                }}
                allowClear
                onClear={() => {
                    setSelectedVehicle(null);
                    setVehicleTypePill(TYPE_FLEET);
                }}
            >
                {vehicles.map(vehicle => (
                    <Option key={vehicle.id} value={vehicle.id}>
                        {vehicle.information.registration} - {vehicle.information.make}
                    </Option>
                ))}
            </Select>
        </div>
    );
}
