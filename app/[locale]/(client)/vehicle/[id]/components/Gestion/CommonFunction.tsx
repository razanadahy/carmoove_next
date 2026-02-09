'use client'

import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { IDeviceConfigurationFeature } from "@/lib/hooks/Interfaces";
import "./CommonFunction.css";

interface CommonFunctionProps {
    title: string;
    tooltip?: string;
    data: IDeviceConfigurationFeature;
    textOn: string;
    textOff: string;
}

const getActionLabel = (action: string): string => {
    switch (action) {
        case 'IMMOBILIZE':
            return 'immobilisation';
        case 'CENTRAL-LOCK':
            return 'Fermeture centralisée';
        case 'BUZZER':
            return 'buzzer';
        case 'HONK':
            return 'Klaxon';
        default:
            return action;
    }
};

const getActionStatusLabel = (action: string): string => {
    switch (action) {
        case 'IMMOBILIZE':
            return ' - immobilisation activée';
        case 'CENTRAL-LOCK':
            return ' - Verrouillage activé';
        case 'BUZZER':
            return ' - Buzzer activé';
        case 'HONK':
            return ' - Klaxon activé';
        default:
            return '';
    }
};

export const CommonFunction = ({ title, tooltip, data, textOn, textOff }: CommonFunctionProps) => {
    return (
        <div className="common-function-container">
            <h4 className="common-function-title">
                <span>{title}</span>
                {tooltip && (
                    <Tooltip title={tooltip} placement="top" color="#7A8089">
                        <QuestionCircleOutlined className="common-function-tooltip-icon" />
                    </Tooltip>
                )}
            </h4>
            {data.action && data.action.length > 0 && (
                <div className="common-function-info">
                    Fonctionnalité associée : {getActionLabel(data.action)}
                </div>
            )}
            <div className="common-function-info">
                Statut :{" "}
                {data.state === 'ACTIVATED' && <span>{textOn}</span>}
                {data.state === 'ACTIVATED' && data.actionLaunched && (
                    <span>{getActionStatusLabel(data.action)}</span>
                )}
                {data.state === 'LISTENING' && <span>{textOff}</span>}
            </div>
        </div>
    );
};

export default CommonFunction;
