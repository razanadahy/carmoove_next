'use client'

import { IVehicle } from "@/lib/hooks/Interfaces";
import VehicleInformationBox from "./VehicleInformationBox";
import StatShowBox from "./StatShowBox";
import MaintenanceForm from "./MaintenanceForm";
import "./Resume.css";

interface IPropsResume {
    vehicle: IVehicle;
    forMap?: boolean;
}

const formatNum = (number: number, virg: number): string => {
    const result = Math.round(number * Math.pow(10, virg)) / Math.pow(10, virg);
    return result.toString().replace('.', ',');
};

function Resume({ vehicle, forMap }: IPropsResume) {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateObj = new Date(vehicle?.device?.lastMessageDate ? vehicle?.device?.lastMessageDate : '');

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: userTimeZone
    };

    const dateLisible = dateObj.toLocaleDateString("fr-FR", options).replace(' ', ' à ');

    const hasRealTimeData =
        vehicle?.electricityStatus?.autonomy > 0 ||
        vehicle?.status?.fuelLevel > 0 ||
        vehicle?.status?.fuelPercent > 0 ||
        vehicle?.electricityStatus?.battery > 0 ||
        vehicle?.electricityStatus?.timeUntilFullyCharged > 0;

    return (
        <>
            <VehicleInformationBox vehicle={vehicle} />

            <div className="main-statshowbox">
                <div className={`real-time-static ${forMap ? 'for-map' : ''}`}>
                    {vehicle?.electricityStatus?.autonomy > 0 && (
                        <StatShowBox
                            title="Autonomie"
                            value={formatNum(vehicle.electricityStatus.autonomy, 0)}
                            unity="Km"
                        />
                    )}

                    {vehicle?.status?.fuelLevel > 0 && (
                        <StatShowBox
                            title="Énergie restante"
                            value={formatNum(vehicle.status.fuelLevel, 2)}
                            unity="L"
                        />
                    )}

                    {vehicle?.status?.fuelPercent > 0 && (
                        <StatShowBox
                            title="Énergie restante"
                            value={formatNum(vehicle.status.fuelPercent, 2)}
                            unity="%"
                        />
                    )}

                    {vehicle?.electricityStatus?.battery > 0 && (
                        <StatShowBox
                            title="Énergie restante"
                            value={formatNum(vehicle.electricityStatus.battery, 2)}
                            unity="%"
                        />
                    )}

                    {vehicle?.electricityStatus?.timeUntilFullyCharged > 0 && (
                        <StatShowBox
                            title="Temps de charge"
                            value={formatNum(vehicle.electricityStatus.timeUntilFullyCharged, 0)}
                            unity="Min"
                            tooltip="Il s'agit du temps restant estimé avant charge complète de la batterie du véhicule."
                        />
                    )}

                    {vehicle?.status?.battery && (
                        <StatShowBox
                            title="Tension batterie"
                            value={formatNum(vehicle.status.battery, 1)}
                            color={
                                vehicle.status.battery > 11.8
                                    ? vehicle.status.battery <= 12.2
                                        ? '#FFA46A'
                                        : ''
                                    : '#E9445A'
                            }
                            unity="V"
                            tooltip="Il s'agit de la tension de batterie de servitude 12Volts du véhicule. Hors usage, une tension entre 11,8 et 12,2V est insuffisante pour fournir un courant de démarrage fiable, d'où le risque de dysfonctionnement. En dessous de 11,8V son état est critique."
                        />
                    )}

                    {forMap && vehicle?.status?.mileage && (
                        <StatShowBox
                            title="Kilométrage"
                            value={formatNum(vehicle.status.mileage, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            unity="Km"
                        />
                    )}
                </div>

                {!forMap && (
                    <>
                        {hasRealTimeData && (
                            <span className="realtime-static-time">
                                Dernière actualisation : le {dateLisible}
                            </span>
                        )}
                        <div className="maintenance-section">
                            <h2>Informations administratives & entretien</h2>
                            <MaintenanceForm vehicle={vehicle} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Resume;
