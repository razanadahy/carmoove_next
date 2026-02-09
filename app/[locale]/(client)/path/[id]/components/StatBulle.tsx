'use client'

import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./StatBulle.css";

interface IStatBulleProps {
    title: string;
    number: number | string | React.ReactElement;
    arrow?: React.ReactNode;
    unit: string;
    tooltip?: string;
}

const StatBulle = (props: IStatBulleProps) => {
    const { number, title, unit, tooltip } = props;
    const formatter = Intl.NumberFormat("fr-FR");

    return (
        <div className="stat-bulle">
            <div className="stat-header">
                <div className="stat-title">{title}</div>
            </div>
            <div className="stat-content">
                {typeof number === "number" ? (
                    <>{formatter.format(Number(number))}</>
                ) : (
                    <>{number}</>
                )}
            </div>
            <div className="stat-footer">
                <div className="stat-unit">{unit}</div>
                <div className="stat-explain">
                    {tooltip && (
                        <Tooltip title={tooltip}>
                            <QuestionCircleOutlined style={{ cursor: 'pointer', color: '#999' }} />
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatBulle;
