'use client';

import { useState, useMemo } from "react";
import { Input, List } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IVehicle } from "@/lib/hooks/Interfaces";

interface IVehicleSelector {
    vehicles: IVehicle[];
    onSelect: (vehicle: IVehicle) => void;
}

export default function VehicleSelector({ vehicles, onSelect }: IVehicleSelector) {
    const [searchText, setSearchText] = useState("");

    const filteredVehicles = useMemo(() => {
        if (!searchText) return vehicles;
        const search = searchText.toLowerCase();
        return vehicles.filter(vehicle =>
            vehicle.information.registration.toLowerCase().includes(search) ||
            vehicle.information.make.toLowerCase().includes(search) ||
            vehicle.information.model.toLowerCase().includes(search)
        );
    }, [vehicles, searchText]);

    return (
        <div>
            <Input
                placeholder="Rechercher un véhicule..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <List
                dataSource={filteredVehicles}
                renderItem={(vehicle) => (
                    <List.Item
                        onClick={() => onSelect(vehicle)}
                        style={{ cursor: 'pointer', padding: '12px 0' }}
                        className="vehicle-selector-item"
                    >
                        <List.Item.Meta
                            title={vehicle.information.registration}
                            description={`${vehicle.information.make} ${vehicle.information.model}`}
                        />
                    </List.Item>
                )}
                style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
            />
        </div>
    );
}
