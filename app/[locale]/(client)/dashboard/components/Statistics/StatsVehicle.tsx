"use client"

import { useQuery } from '@apollo/client';
import { Spin, Card } from 'antd';
import { IVehicle } from '@/lib/hooks/Interfaces';
import { STAT_QUERY } from '@/lib/graphql/queries';

interface StatsVehicleProps {
    from: number;
    to: number;
    vehicle: IVehicle;
}

export default function StatsVehicle({ from, to, vehicle }: StatsVehicleProps) {
    const { data, loading, error } = useQuery(STAT_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleId: vehicle.id,
            from: from,
            to: to,
        },
        context: {
            version: 'php'
        }
    });

    if (loading) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="Chargement des statistiques...">
                        <div style={{ height: '100px' }} />
                    </Spin>
                </div>
            </Card>
        );
    }

    if (error) {
        return <p>Erreur lors du chargement des statistiques</p>;
    }

    if (!data?.detailedStatistic) {
        return (
            <Card>
                <span>Aucune statistique disponible pour cette période.</span>
            </Card>
        );
    }

    const statistic = data.detailedStatistic;

    return (
        <Card title="Statistiques de l'année fiscale">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {statistic.distance > 0 && (
                    <div className="stat-box">
                        <div>Kilométrage</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(statistic.distance)} km</div>
                    </div>
                )}
                {statistic.cost > 0 && (
                    <div className="stat-box">
                        <div>Coût estimé</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(statistic.cost)} €</div>
                    </div>
                )}
                {statistic.nbPath > 0 && (
                    <div className="stat-box">
                        <div>Trajets</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistic.nbPath}</div>
                    </div>
                )}
            </div>
        </Card>
    );
}
