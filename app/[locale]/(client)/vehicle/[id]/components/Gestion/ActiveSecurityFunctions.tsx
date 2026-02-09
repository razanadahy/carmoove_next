'use client'

import { Space } from "antd";
import { IVehicle } from "@/lib/hooks/Interfaces";
import CommonFunction from "./CommonFunction";
import "./ActiveSecurityFunctions.css";

interface ActiveSecurityFunctionsProps {
    vehicle: IVehicle;
}

export const ActiveSecurityFunctions = ({ vehicle }: ActiveSecurityFunctionsProps) => {
    const configuration = vehicle.device?.configuration;
    const features = configuration?.features;

    if (!features) {
        return (
            <Space className="main-content-active-security" direction="vertical" size="large" style={{ display: 'flex' }}>
                <h2>Fonctions de sécurité actives</h2>
                <div className="active-security-main-box">
                    <p className="no-data-text">Aucune fonction de sécurité configurée pour ce véhicule.</p>
                </div>
            </Space>
        );
    }

    return (
        <Space className="main-content-active-security" direction="vertical" size="large" style={{ display: 'flex' }}>
            <h2>Fonctions de sécurité actives</h2>
            <div className="active-security-main-box">
                {features.GPSjamming && (
                    <CommonFunction
                        title="Détection brouilleur GPS"
                        tooltip="Détecte si un brouilleur GPS est utilisé à proximité du véhicule."
                        data={features.GPSjamming}
                        textOn="Activé"
                        textOff="En écoute"
                    />
                )}
                {features.GNSSjamming && (
                    <CommonFunction
                        title="Détection brouilleur GNSS"
                        tooltip="Détecte si un brouilleur GNSS est utilisé à proximité du véhicule."
                        data={features.GNSSjamming}
                        textOn="Activé"
                        textOff="En écoute"
                    />
                )}
                {features.towingDetection && (
                    <CommonFunction
                        title="Détection remorquage"
                        tooltip="Détecte si le véhicule est remorqué alors qu'il est à l'arrêt."
                        data={features.towingDetection}
                        textOn="Activé"
                        textOff="En écoute"
                    />
                )}
                {features.crashDetection && (
                    <CommonFunction
                        title="Détection accident"
                        tooltip="Détecte si le véhicule a subi un choc important."
                        data={features.crashDetection}
                        textOn="Activé"
                        textOff="En écoute"
                    />
                )}
                {features.failure && (
                    <CommonFunction
                        title="Détection panne"
                        tooltip="Détecte les pannes du véhicule."
                        data={features.failure}
                        textOn="Activé"
                        textOff="En écoute"
                    />
                )}
                {features.immobilizer && (
                    <CommonFunction
                        title="Immobiliseur"
                        tooltip="Permet d'immobiliser le véhicule à distance."
                        data={features.immobilizer}
                        textOn="Activé"
                        textOff="Désactivé"
                    />
                )}
                {features.centralLock && (
                    <CommonFunction
                        title="Verrouillage centralisé"
                        tooltip="Permet de verrouiller/déverrouiller les portes à distance."
                        data={features.centralLock}
                        textOn="Activé"
                        textOff="Désactivé"
                    />
                )}
                {features.buzzer && (
                    <CommonFunction
                        title="Buzzer"
                        tooltip="Active le buzzer du véhicule."
                        data={features.buzzer}
                        textOn="Activé"
                        textOff="Désactivé"
                    />
                )}
                {features.honk && (
                    <CommonFunction
                        title="Klaxon"
                        tooltip="Active le klaxon du véhicule."
                        data={features.honk}
                        textOn="Activé"
                        textOff="Désactivé"
                    />
                )}
                {features.turningLights && (
                    <CommonFunction
                        title="Feux de détresse"
                        tooltip="Active les feux de détresse du véhicule."
                        data={features.turningLights}
                        textOn="Activé"
                        textOff="Désactivé"
                    />
                )}
            </div>
        </Space>
    );
};

export default ActiveSecurityFunctions;
