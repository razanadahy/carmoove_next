'use client';

import { Tooltip } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IVehicle } from "@/lib/hooks/Interfaces";
import "./VehicleStatus.css";

interface IVehicleStatusProp {
    icon: string;
    count: number;
    tooltip?: string;
    link?: string;
    vehicles?: IVehicle[];
    isLoading: boolean;
    onSelectVehicles?: (vehicles: IVehicle[]) => void;
}

export default function VehicleStatus({
    icon,
    count,
    tooltip,
    link,
    vehicles,
    isLoading,
    onSelectVehicles
}: IVehicleStatusProp) {
    const router = useRouter();

    const handleOnClick = () => {
        if (vehicles && onSelectVehicles) {
            onSelectVehicles(vehicles);
        } else if (link) {
            router.push(link);
        }
    };

    return (
        <Tooltip
            placement={!!vehicles ? 'left' : "top"}
            arrow={false}
            color="white"
            title={<span className="tooltip-text">{tooltip}</span>}
        >
            <div
                className={`status-badge${link ? ' linked' : ''} position-relative`}
                onClick={handleOnClick}
            >
                <span className="status-icon">
                    <Image src={icon} alt={tooltip || ''} width={24} height={24} />
                </span>
                <span className="status-number">{count}</span>
            </div>
        </Tooltip>
    );
}
