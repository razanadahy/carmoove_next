'use client';

import Image from "next/image";
import { IVehicle } from "@/lib/hooks/Interfaces";
import Resume from "@/app/[locale]/(client)/vehicle/[id]/components/Resume";
import upOutlined_i from "@/assets/image/up-outlined.svg";
import "./BottomPanel.css";

interface IBottomPanelProps {
    vehicle: IVehicle | null;
    open: boolean;
    onClose: () => void;
    onToggle: () => void;
}

export default function BottomPanel({ vehicle, open, onToggle }: IBottomPanelProps) {
    return (
        <div className={`panel-bottom-map-box${open ? ' open' : ''}`}>
            <div
                className={`handle-btn${open ? ' open' : ''}`}
                onClick={onToggle}
            >
                <Image
                    src={upOutlined_i}
                    alt="toggle panel"
                    className="ico-handle-panel"
                    width={16}
                    height={16}
                />
            </div>
            <div className="panel-content">
                <div className="panel-main">
                    {vehicle ? (
                        <Resume vehicle={vehicle} forMap />
                    ) : (
                        <div className="no-vehicle-message">Aucun véhicule sélectionné</div>
                    )}
                </div>
            </div>
        </div>
    );
}
