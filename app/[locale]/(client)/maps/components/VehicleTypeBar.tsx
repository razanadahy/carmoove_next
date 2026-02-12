"use client"

import { Dispatch, SetStateAction, useState } from "react";
import { Button, Drawer, Space } from "antd";
import { ReloadOutlined, CarOutlined } from "@ant-design/icons";
import { format } from "date-fns";

import { IVehicle } from "@/lib/hooks/Interfaces";
import { GetVehicleCarmooveType, TYPE_FLEET, TYPE_VP, TYPE_VUL, TYPE_PL, TYPE_VL, TYPE_VEHICLE } from "@/lib/utils/VehicleType";
import VehicleSelector from "./VehicleSelector";

interface IVehicleTypeBar {
    showReloadButton?: boolean;
    vehicleTypePill: string;
    setVehicleTypePill: Dispatch<SetStateAction<string>>;
    vehicles: IVehicle[];
    onSelectVehicle?: (vehicle: IVehicle | null) => void;
}

export default function VehicleTypeBar({showReloadButton = false, vehicleTypePill, setVehicleTypePill, vehicles, onSelectVehicle}: IVehicleTypeBar) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const getCurrentDate = () => format(new Date(), "dd/MM/yyyy à HH:mm");

    const [lastReloadingTime, setLastReloadingTime] = useState<string>(
        typeof window !== 'undefined'
            ? localStorage.getItem("last_reloading_time") ?? getCurrentDate()
            : getCurrentDate()
    );

    let hasVP = false;
    let hasVUL = false;
    let hasPL = false;
    let hasVL = false;

    vehicles.forEach((vehicle: IVehicle) => {
        const carmooveType = GetVehicleCarmooveType(vehicle.information.kindCG);
        switch (carmooveType) {
            case "VP":
                hasVP = true;
                break;
            case "VUL":
                hasVUL = true;
                break;
            case "PL":
                hasPL = true;
                break;
            case "VL":
                hasVL = true;
                break;
        }
    });

    const onReload = () => {
        const currentDate = getCurrentDate();
        setLastReloadingTime(currentDate);
        if (typeof window !== 'undefined') {
            localStorage.setItem("last_reloading_time", currentDate);
        }
        window.location.reload();
    };

    const handleTypeChange = (type: string) => {
        setVehicleTypePill(type);
    };

    const handleVehicleSelect = (vehicle: IVehicle) => {
        setVehicleTypePill(TYPE_VEHICLE);
        onSelectVehicle?.(vehicle);
        setDrawerOpen(false);
    };

    return (
        <>
            <div className="vehicle-bar">
                <Space wrap>
                    <Button
                        className={vehicleTypePill === TYPE_FLEET ? "active" : ""}
                        onClick={() => handleTypeChange(TYPE_FLEET)}
                    >
                        FLOTTE
                    </Button>

                    {hasVL && (
                        <Button
                            className={vehicleTypePill === TYPE_VL ? "active" : ""}
                            onClick={() => handleTypeChange(TYPE_VL)}
                        >
                            VELI
                        </Button>
                    )}

                    {hasVP && (
                        <Button
                            className={vehicleTypePill === TYPE_VP ? "active" : ""}
                            onClick={() => handleTypeChange(TYPE_VP)}
                        >
                            VP
                        </Button>
                    )}

                    {hasVUL && (
                        <Button
                            className={vehicleTypePill === TYPE_VUL ? "active" : ""}
                            onClick={() => handleTypeChange(TYPE_VUL)}
                        >
                            VUL
                        </Button>
                    )}

                    {hasPL && (
                        <Button
                            className={vehicleTypePill === TYPE_PL ? "active" : ""}
                            onClick={() => handleTypeChange(TYPE_PL)}
                        >
                            PL
                        </Button>
                    )}

                    <Button
                        className={vehicleTypePill === TYPE_VEHICLE ? "active rounded-circle" : "rounded-circle"}
                        icon={<CarOutlined />}
                        onClick={() => setDrawerOpen(true)}
                    />
                </Space>
            </div>

            <div className="data-last-use">
                {showReloadButton && (
                    <>
                        <span className="real-time-data">
                            Dernière actualisation: {lastReloadingTime}
                        </span>
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={onReload}
                            title="Actualiser"
                        />
                    </>
                )}
            </div>

            <Drawer
                title="Sélectionner un véhicule"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={400}
            >
                <VehicleSelector
                    vehicles={vehicles}
                    onSelect={handleVehicleSelect}
                />
            </Drawer>
        </>
    );
}
