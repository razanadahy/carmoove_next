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
                className={`status-badge${link ? ' linked' : ''}`}
                onClick={handleOnClick}
                style={{border: '1px solid #39a1d8', backgroundColor: '#39a1d8'}}
            >
                <span className="status-icon bg-white w-50 h-100 rounded-start-3" >
                    <Image src={icon} alt={tooltip || ''} width={24} height={24} />
                </span>
                <span className="status-number w-50 h-100 d-flex justify-content-center align-items-center">{count}</span>
            </div>
        </Tooltip>
    );
}
