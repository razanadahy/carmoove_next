'use client'

import { useMemo } from "react";
import { Table, Tag } from "antd";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { useGetTellTaleStatus } from "@/lib/hooks";
import { Loading } from "@/components/Common/Loading";
import VehicleInformationBox from "./VehicleInformationBox";
import "./TableDiagV2.css";

interface TableDiagV2Props {
    vehicle: IVehicle;
}

interface DiagRow {
    key: string;
    label: string;
    available: string;
    value: string | null;
    status: 'info' | 'warning' | 'alert' | 'off' | 'disabled';
}

// Translations for FMS fields
const fmsTranslations: Record<string, string> = {
    coolingAirConditioning: "Climatisation",
    highBeam: "Feux de route",
    lowBeam: "Feux de croisement",
    turnSignals: "Clignotants",
    hazardWarning: "Warning",
    provisionForDisabledPerson: "Accessibilité PMR",
    parkingBrake: "Frein de stationnement",
    brakeFailure: "Défaillance freins",
    hatchOpen: "Trappe ouverte",
    fuelLevel: "Niveau carburant",
    engineCoolantTemperature: "Temp. liquide refroidissement",
    batteryChargingCondition: "État charge batterie",
    engineOil: "Huile moteur",
    positionLight: "Feux de position",
    frontFogLight: "Antibrouillard avant",
    rearFogLight: "Antibrouillard arrière",
    parkHeating: "Chauffage stationnaire",
    engineMilIndicator: "Témoin moteur",
    callForMaintenance: "Appel maintenance",
    transmissionFluidTemperature: "Temp. huile transmission",
    transmissionFailure: "Défaillance transmission",
    antiLockBrakeSystemFailure: "Défaillance ABS",
    wornBrakeLinings: "Usure plaquettes",
    windscreenWasherFluid: "Lave-glace",
    tireFailure: "Défaillance pneus",
    generalFailure: "Défaillance générale",
    engineOilTemperature: "Temp. huile moteur",
    engineOilLevel: "Niveau huile moteur",
    engineCoolantLevel: "Niveau liquide refroidissement",
    steeringFluidLevel: "Niveau liquide direction",
    steeringFailure: "Défaillance direction",
    heightControl: "Contrôle hauteur",
    retarder: "Ralentisseur",
    engineEmissionSystemFailure: "Défaillance système émission",
    ESCIndication: "ESC",
    brakeLights: "Feux stop",
    articulation: "Articulation",
    stopRequest: "Demande arrêt",
    pramRequest: "Demande poussette",
    busStopBrake: "Frein arrêt bus",
    AdBlueLevel: "Niveau AdBlue",
    raising: "Levage",
    lowering: "Abaissement",
    kneeling: "Agenouillement",
    engineCompartmentTemperature: "Temp. compartiment moteur",
    auxiliaryAirPressure: "Pression air auxiliaire",
    airFilterClogged: "Filtre air colmaté",
    fuelFilterDifferentialPressure: "Pression filtre carburant",
    seatBelt: "Ceinture de sécurité",
    EBS: "EBS",
    laneDepartureIndication: "Alerte sortie de voie",
    advancedEmergencyBrakingSystem: "Freinage d'urgence avancé",
    ACC: "Régulateur adaptatif",
    trailerConnected: "Remorque connectée",
    ABSTrailer: "ABS remorque",
    airbag: "Airbag",
    EBSTrailer: "EBS remorque",
    tachographIndication: "Tachygraphe",
    ESCSwitchedOff: "ESC désactivé",
    laneDepartureWarningSwitchedOff: "Alerte voie désactivée",
    engineEmissionFilter: "Filtre émission moteur",
    electricMotorFailures: "Défaillance moteur électrique",
    AdBlueTampering: "Falsification AdBlue",
    multiplexSystem: "Système multiplex",
};

const getStatusFromValue = (value: string | null): DiagRow['status'] => {
    if (!value || value === 'UNKNOWN' || value === 'NOT AVAILABLE') {
        return 'disabled';
    }
    switch (value) {
        case 'INFO':
            return 'info';
        case 'YELLOW':
            return 'warning';
        case 'RED':
            return 'alert';
        case 'OFF':
        default:
            return 'off';
    }
};

const getTagColor = (status: DiagRow['status']): string => {
    switch (status) {
        case 'info':
            return 'blue';
        case 'warning':
            return 'orange';
        case 'alert':
            return 'red';
        case 'off':
            return 'green';
        case 'disabled':
        default:
            return 'default';
    }
};

export default function TableDiagV2({ vehicle }: TableDiagV2Props) {
    const { data, loading, error } = useGetTellTaleStatus({
        id: vehicle.id,
        pollInterval: 30000,
    });

    const columns = useMemo(() => [
        {
            title: 'Données',
            dataIndex: 'label',
            key: 'label',
            sorter: (a: DiagRow, b: DiagRow) => a.label.localeCompare(b.label),
        },
        {
            title: 'Disponibilité',
            dataIndex: 'available',
            key: 'available',
            width: 120,
            filters: [
                { text: 'Oui', value: 'Oui' },
                { text: 'Non', value: 'Non' },
            ],
            onFilter: (value: React.Key | boolean, record: DiagRow) => record.available === value,
        },
        {
            title: 'Valeur',
            dataIndex: 'value',
            key: 'value',
            width: 150,
            render: (value: string | null, record: DiagRow) => {
                if (!value) return '-';
                return (
                    <Tag color={getTagColor(record.status)}>
                        {value}
                    </Tag>
                );
            },
        },
    ], []);

    const rows: DiagRow[] = useMemo(() => {
        if (!data?.tellTaleStatus?.[0]) return [];

        const result: DiagRow[] = [];
        for (const [key, value] of Object.entries(data.tellTaleStatus[0])) {
            if (key === '__typename') continue;

            const stringValue = value as string;
            const isAvailable = stringValue !== 'UNKNOWN' && stringValue !== 'NOT AVAILABLE';

            result.push({
                key,
                label: fmsTranslations[key] || key,
                available: isAvailable ? 'Oui' : 'Non',
                value: isAvailable ? stringValue : null,
                status: getStatusFromValue(stringValue),
            });
        }

        return result.sort((a, b) => a.label.localeCompare(b.label));
    }, [data]);

    if (loading) {
        return <Loading msg="Chargement des données de diagnostic..." />;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
                <p>Erreur lors du chargement des données</p>
            </div>
        );
    }

    if (!data?.tellTaleStatus || data.tellTaleStatus.length === 0) {
        return (
            <>
                <VehicleInformationBox vehicle={vehicle} />
                <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                    <p>Données de diagnostic non disponibles pour ce véhicule</p>
                </div>
            </>
        );
    }

    return (
        <>
            <VehicleInformationBox vehicle={vehicle} />

            <div className="diagnostic-header">
                <h2 className="diagnostic-title">Diagnostic</h2>
                <span className="diagnostic-update">
                    Dernière actualisation : {format(
                        new Date(vehicle.location.timestamp * 1000),
                        "dd/MM/yyyy 'à' HH:mm",
                        { locale: fr }
                    )}
                </span>
            </div>

            <Table
                columns={columns}
                dataSource={rows}
                pagination={{ pageSize: 20, showSizeChanger: true }}
                rowClassName={(record) => record.status === 'disabled' ? 'row-disabled' : 'row-enabled'}
                size="middle"
                className="diag-table"
            />
        </>
    );
}
