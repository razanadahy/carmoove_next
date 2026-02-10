'use client';

import { Tooltip } from "antd";
import { ReactNode } from "react";
import "./StatBulle.css";

interface IProps {
    tooltip?: string;
    title: string;
    number: number | string;
    unit?: string;
    children?: ReactNode;
}

const StatBulle = ({ tooltip, title, number, unit, children }: IProps) => {
    const formatter = Intl.NumberFormat("fr-FR");

    return (
        <div className="stat-bulle">
            <Tooltip title={tooltip}>
                <div className="bulle-header">
                    <div className="bulle-title">{title}</div>
                </div>
            </Tooltip>
            <div className="bulle-content">
        <span className="bulle-number">
          {typeof number === "number" ? formatter.format(number) : number}
        </span>
                {unit && <span className="bulle-unit">{unit}</span>}
            </div>
            {children && <div className="bulle-children">{children}</div>}
        </div>
    );
};

export default StatBulle;
