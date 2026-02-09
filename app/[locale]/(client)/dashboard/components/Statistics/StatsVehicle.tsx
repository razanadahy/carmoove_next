"use client"

import React from 'react';
import { useQuery } from '@apollo/client';
import { IStatVehicle, IVehicle } from '@/lib/hooks/Interfaces';
import { STAT_QUERY } from '@/lib/graphql/queries';
import { Loading } from '@/components/Common/Loading';
import StatShowBox from '@/app/[locale]/(client)/vehicle/[id]/components/StatShowBox';
import './StatsVehicle.css';

interface StatsVehicleProps {
    from: number;
    to: number;
    vehicle: IVehicle;
}

const formatNum = (number: number, virg: number): string => {
    const result = Math.round(number * Math.pow(10, virg)) / Math.pow(10, virg);
    return result.toString().replace('.', ',');
};

const StatsVehicle: React.FC<StatsVehicleProps> = (props) => {
    const { data, loading, error } = useQuery(STAT_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleId: props.vehicle.id,
            from: props.from,
            to: props.to,
        },
        context: {
            version: 'php'
        }
    });

    if (loading) {
        return <Loading msg="Chargement des statistiques..." />;
    }

    if (error) {
        return <p>Erreur lors du chargement des statistiques</p>;
    }

    if (!data?.detailedStatistic) {
        return <span className='no-statistic-data'>Aucune statistique disponible pour cette période.</span>;
    }

    const statistic: IStatVehicle = data.detailedStatistic;

    const hasData = (
        statistic?.distance > 0 ||
        (statistic?.usageTime > 0) ||
        statistic?.fuel?.fuel > 0 ||
        statistic?.fuel?.electricity > 0 ||
        statistic?.currentPeriodeConsumption?.fuel > 0 ||
        statistic?.currentPeriodeConsumption?.electricity > 0 ||
        statistic?.co2 > 0 ||
        statistic?.nbPath > 0 ||
        statistic?.cost > 0 ||
        statistic?.notifications?.alert > 0
    );

    if (!hasData) {
        return <span className='no-statistic-data'>Aucune statistique disponible pour cette période.</span>;
    }

    return (
        <div className="stats-show-container">
            {statistic?.distance > 0 && (
                <StatShowBox
                    title="Kilométrage"
                    value={formatNum(statistic.distance, 1)}
                    unity="Km"
                    tooltip='Distance parcourue en kilomètres, sur la période sélectionnée.'
                />
            )}
            {statistic?.usageTime > 0 && (
                <StatShowBox
                    title="Taux d'utilisation"
                    value={formatNum((statistic.usageTime) * 100 / ((props.to - props.from) / 60), 2)}
                    unity='%'
                    tooltip="Ratio d'utilisation du véhicule sur la période sélectionnée. Exemple : un véhicule utilisé 7 heures sur 1 semaine aura un taux d'utilisation de 4,2% (7/168*100=4,2)."
                />
            )}
            {statistic?.fuel?.fuel > 0 && (
                <StatShowBox
                    title="Conso totale"
                    value={formatNum(statistic.fuel.fuel, 1)}
                    unity='L'
                    tooltip="Consommation d'énergie totale du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.fuel?.electricity > 0 && (
                <StatShowBox
                    title="Conso totale"
                    value={formatNum(statistic.fuel.electricity, 1)}
                    unity='kWh'
                    tooltip="Consommation d'énergie totale du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.currentPeriodeConsumption?.fuel > 0 && (
                <StatShowBox
                    title="Conso /100km"
                    value={formatNum(statistic.currentPeriodeConsumption.fuel, 1)}
                    unity="L"
                    tooltip="Consommation d'énergie moyenne au 100 kilomètres du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.currentPeriodeConsumption?.electricity > 0 && (
                <StatShowBox
                    title="Conso /100km"
                    value={formatNum(statistic.currentPeriodeConsumption.electricity, 1)}
                    unity="kWh"
                    tooltip="Consommation d'énergie moyenne au 100 kilomètres du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.co2 > 0 && (
                <StatShowBox
                    title="Emission CO2"
                    value={formatNum(statistic.co2, 2)}
                    unity="T"
                    tooltip="Emission de CO2 totale du véhicule sur la période sélectionnée."
                />
            )}
            {(statistic?.co2 > 0 && statistic?.distance > 0) && (
                <StatShowBox
                    title="Emission /100km"
                    value={formatNum(100 * statistic.co2 / statistic.distance, 2)}
                    unity="T"
                    tooltip="Emission de CO2 moyenne au 100 kilomètres du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.nbPath > 0 && (
                <StatShowBox
                    title="Trajets"
                    value={formatNum(statistic.nbPath, 0)}
                    unity="#"
                    tooltip="Nombre total de trajets détectés, sur la période sélectionnée."
                />
            )}
            {statistic?.usageTime > 0 && (
                <StatShowBox
                    title="Utilisation"
                    value={statistic.usageTime}
                    type='time'
                    unity="JJ:HH:MM"
                    tooltip="Durée d'utilisation totale du véhicule, sur la période sélectionnée."
                />
            )}
            {(statistic?.nbPath > 0 && statistic?.usageTime > 0) && (
                <StatShowBox
                    title="Utilisation /trajets"
                    value={formatNum(statistic.usageTime / statistic.nbPath, 0)}
                    type='time'
                    unity="JJ:HH:MM"
                    tooltip="Durée d'utilisation moyenne par trajet du véhicule, sur la période sélectionnée."
                />
            )}
            {(statistic?.nbPath > 0 && statistic?.distance > 0) && (
                <StatShowBox
                    title="Kilométrage /trajets"
                    value={formatNum(statistic.distance / statistic.nbPath, 1)}
                    unity="Km"
                    tooltip="Distance moyenne par trajet du véhicule, sur la période sélectionnée."
                />
            )}
            {(statistic?.usageTime > 0 && statistic?.distance > 0) && (
                <StatShowBox
                    title="Vitesse moyenne"
                    value={formatNum(statistic.distance / (statistic.usageTime / 60), 0)}
                    unity="Km/h"
                    tooltip="Vitesse moyenne du véhicule, sur la période sélectionnée."
                />
            )}
            {statistic?.cost > 0 && (
                <StatShowBox
                    title="Coût estimé"
                    value={Math.round(statistic.cost)}
                    unity="€"
                    tooltip="Coût estimé du véhicule sur la période sélectionnée, basé sur le barème kilométrique gouvernemental."
                />
            )}
            {statistic?.notifications?.alert > 0 && (
                <StatShowBox
                    title="Alertes"
                    value={statistic.notifications.alert}
                    unity="#"
                    tooltip="Nombre total d'alerte reçue pour ce véhicule, sur la période sélectionnée."
                />
            )}
        </div>
    );
};

export default StatsVehicle;
export { formatNum };
