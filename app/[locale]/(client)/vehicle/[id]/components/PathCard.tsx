'use client'

import { Card } from "antd";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IPath } from "@/lib/hooks/Interfaces";
import "./PathCard.css";

interface PathCardProps {
    path: IPath;
}

const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
};

const formatDate = (timestamp: number): string => {
    return format(new Date(timestamp * 1000), "dd/MM/yyyy HH:mm", { locale: fr });
};

export default function PathCard({ path }: PathCardProps) {
    const startAddress = path.addressStart?.address || 'Adresse inconnue';
    const endAddress = path.addressEnd?.address || 'Adresse inconnue';
    const startCity = path.addressStart?.city || '';
    const endCity = path.addressEnd?.city || '';

    return (
        <Card className="path-card" hoverable>
            <div className="path-card-header">
                <span className="path-card-date">{formatDate(path.startAt)}</span>
                <span className="path-card-duration">{formatDuration(path.duration)}</span>
            </div>

            <div className="path-card-route">
                <div className="path-card-location">
                    <span className="path-card-dot start"></span>
                    <div className="path-card-address">
                        <span className="address-text">{startAddress}</span>
                        {startCity && <span className="city-text">{startCity}</span>}
                    </div>
                </div>
                <div className="path-card-line"></div>
                <div className="path-card-location">
                    <span className="path-card-dot end"></span>
                    <div className="path-card-address">
                        <span className="address-text">{endAddress}</span>
                        {endCity && <span className="city-text">{endCity}</span>}
                    </div>
                </div>
            </div>

            <div className="path-card-stats">
                <div className="path-stat">
                    <span className="stat-label">Distance</span>
                    <span className="stat-value">{path.distance?.toFixed(1) || '0'} km</span>
                </div>
                <div className="path-stat">
                    <span className="stat-label">Vitesse moy.</span>
                    <span className="stat-value">{path.averageSpeed?.toFixed(0) || '0'} km/h</span>
                </div>
                {path.fuel > 0 && (
                    <div className="path-stat">
                        <span className="stat-label">Carburant</span>
                        <span className="stat-value">{path.fuel?.toFixed(2) || '0'} L</span>
                    </div>
                )}
                {path.consumption > 0 && (
                    <div className="path-stat">
                        <span className="stat-label">Conso.</span>
                        <span className="stat-value">{path.consumption?.toFixed(1) || '0'} L/100km</span>
                    </div>
                )}
                {path.electricConsumption > 0 && (
                    <div className="path-stat">
                        <span className="stat-label">Elec.</span>
                        <span className="stat-value">{path.electricConsumption?.toFixed(1) || '0'} kWh</span>
                    </div>
                )}
            </div>

            {path.private && (
                <div className="path-card-private">
                    <span>Trajet privé</span>
                </div>
            )}
        </Card>
    );
}
