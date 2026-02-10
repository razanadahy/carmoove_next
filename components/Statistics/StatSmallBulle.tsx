'use client';

import { VehicleType } from "@/lib/utils/VehicleType";
import "./StatSmallBulle.css";

interface IProps {
    isNumber?: boolean;
    value: number | string;
    type: VehicleType;
}

const StatSmallBulle = (props: IProps) => {
    const { isNumber = false, value, type } = props;
    return (
        <div className="small-bulle">
            <div className="small-bulle-header">
                <div className="small-bulle-title">{type}</div>
            </div>
            <div className="small-bulle-content">
                {isNumber && typeof value === "number"
                    ? Intl.NumberFormat("fr-FR", {
                        maximumFractionDigits: 2,
                    }).format(value)
                    : value}
            </div>
        </div>
    );
};

export default StatSmallBulle;
