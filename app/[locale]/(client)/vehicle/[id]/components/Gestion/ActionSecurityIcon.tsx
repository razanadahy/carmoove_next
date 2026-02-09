'use client'

import classNames from 'classnames';
import bltIcon from '@/assets/image/vehicle/gestion/action/blt.svg';
import './ActionSecurityIcon.css';

interface ActionSecurityIconProps {
    label: string;
    icon: string;
    onClick: () => void;
    isLoading?: boolean;
}

const ActionSecurityIcon = ({ label, icon, onClick, isLoading }: ActionSecurityIconProps) => {
    return (
        <div className="action-security-icon-container">
            <div className="action-security-icon-box" onClick={onClick}>
                <div className="main-icon">
                    <img src={icon} alt={label} />
                </div>
                <div className="second-icon">
                    <img src={bltIcon.src} alt="bluetooth" />
                </div>
                <div
                    className={classNames('action-security-icon-box-mask', {
                        masked: isLoading
                    })}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <span className="action-security-label">{label}</span>
        </div>
    );
};

export default ActionSecurityIcon;
