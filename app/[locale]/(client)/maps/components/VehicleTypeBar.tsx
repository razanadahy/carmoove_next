"use client"

import { Dispatch, SetStateAction, useState } from "react";
import { Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import Image from "next/image";

import { IVehicle } from "@/lib/hooks/Interfaces";
import { GetVehicleCarmooveType, TYPE_FLEET, TYPE_VP, TYPE_VUL, TYPE_PL, TYPE_VL, TYPE_VEHICLE } from "@/lib/utils/VehicleType";

interface IVehicleTypeBar {
    showReloadButton?: boolean;
    vehicleTypePill: string;
    setVehicleTypePill: Dispatch<SetStateAction<string>>;
    vehicles: IVehicle[];
    selectedVehicle: IVehicle | null;
    setSelectedVehicle: Dispatch<SetStateAction<IVehicle | null>>;
}

export default function VehicleTypeBar({
    showReloadButton = false,
    vehicleTypePill,
    setVehicleTypePill,
    vehicles,
    setSelectedVehicle
}: IVehicleTypeBar) {

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
        // Trigger page reload or refetch
        window.location.reload();
    };

    const handleTypeChange = (type: string) => {
        setVehicleTypePill(type);
        setSelectedVehicle(null);
    };

    return (
        <>
            <div className="vehicle-bar">
                <Space wrap>
                    <Button
                        type={vehicleTypePill === TYPE_FLEET ? "primary" : "default"}
                        onClick={() => handleTypeChange(TYPE_FLEET)}
                    >
                        FLOTTE
                    </Button>

                    {hasVL && (
                        <Button
                            type={vehicleTypePill === TYPE_VL ? "primary" : "default"}
                            onClick={() => handleTypeChange(TYPE_VL)}
                        >
                            VELI
                        </Button>
                    )}

                    {hasVP && (
                        <Button
                            type={vehicleTypePill === TYPE_VP ? "primary" : "default"}
                            onClick={() => handleTypeChange(TYPE_VP)}
                        >
                            VP
                        </Button>
                    )}

                    {hasVUL && (
                        <Button
                            type={vehicleTypePill === TYPE_VUL ? "primary" : "default"}
                            onClick={() => handleTypeChange(TYPE_VUL)}
                        >
                            VUL
                        </Button>
                    )}

                    {hasPL && (
                        <Button
                            type={vehicleTypePill === TYPE_PL ? "primary" : "default"}
                            onClick={() => handleTypeChange(TYPE_PL)}
                        >
                            PL
                        </Button>
                    )}
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
        </>
    );
}
