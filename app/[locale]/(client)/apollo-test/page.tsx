"use client"

import { useQuery } from '@apollo/client/react';
import { VEHICLES_QUERY } from '@/lib/graphql/queries';
import { IVehicle } from '@/lib/hooks/Interfaces';
import { useMemo, useState } from 'react';
import { Card, Spin, Alert, Button, Table, Tag, Space } from 'antd';
import { ReloadOutlined, CarOutlined, ThunderboltOutlined } from '@ant-design/icons';

export default function ApolloTest() {
    const [pollInterval, setPollInterval] = useState<number | undefined>(undefined);

    const { data, loading, error, refetch } = useQuery(VEHICLES_QUERY, {
        pollInterval: pollInterval ?? 0,
        context: {
            version: "php",
        },
    });

    const vehicles: IVehicle[] = useMemo(() => {
        return data?.vehicles ?? []
    }, [data?.vehicles]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Immatriculation',
            dataIndex: ['information', 'registration'],
            key: 'registration',
            render: (text: string) => <Tag color="blue">{text || 'N/A'}</Tag>
        },
        {
            title: 'Marque/Modèle',
            key: 'makeModel',
            render: (_: any, record: IVehicle) => (
                <Space>
                    <CarOutlined />
                    <span>{record.information?.make || 'N/A'} {record.information?.model || ''}</span>
                </Space>
            )
        },
        {
            title: 'Énergie',
            dataIndex: ['information', 'energy'],
            key: 'energy',
            render: (energy: string) => {
                const color = energy === 'ELECTRIC' ? 'green' : energy === 'DIESEL' ? 'orange' : 'blue';
                return <Tag color={color}>{energy || 'N/A'}</Tag>;
            }
        },
        {
            title: 'Statut',
            key: 'status',
            render: (_: any, record: IVehicle) => (
                <Space direction="vertical" size="small">
                    <div>
                        <BatteryOutlined /> Batterie: {record.status?.battery || 0}%
                    </div>
                    <div>
                        <ThunderboltOutlined /> Carburant: {record.status?.fuelPercent || 0}%
                    </div>
                    <div>Kilométrage: {record.status?.mileage || 0} km</div>
                </Space>
            )
        },
        {
            title: 'Moteur',
            dataIndex: ['status', 'engine'],
            key: 'engine',
            render: (engine: string) => (
                <Tag color={engine === 'ON' ? 'green' : 'red'}>
                    {engine || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'Droits',
            dataIndex: 'rights',
            key: 'rights',
            render: (rights: string[]) => (
                <Space direction="vertical">
                    {rights?.map((right, index) => (
                        <Tag key={index} color="purple">{right}</Tag>
                    ))}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Space>
                        <CarOutlined style={{ fontSize: '24px' }} />
                        <span>Test Apollo Client - Liste des Véhicules</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                            loading={loading}
                        >
                            Rafraîchir
                        </Button>
                        <Button
                            onClick={() => setPollInterval(pollInterval ? undefined : 5000)}
                        >
                            {pollInterval ? 'Arrêter polling' : 'Démarrer polling (5s)'}
                        </Button>
                    </Space>
                }
            >
                {/* Info de debug */}
                <Alert
                    message="Information de debug"
                    description={
                        <Space direction="vertical">
                            <div><strong>Loading:</strong> {loading ? 'Oui' : 'Non'}</div>
                            <div><strong>Error:</strong> {error ? error.message : 'Aucune'}</div>
                            <div><strong>Nombre de véhicules:</strong> {vehicles.length}</div>
                            <div><strong>Polling:</strong> {pollInterval ? `Activé (${pollInterval}ms)` : 'Désactivé'}</div>
                            <div><strong>Context:</strong> version=php (API Local)</div>
                        </Space>
                    }
                    type="info"
                    style={{ marginBottom: '24px' }}
                />

                {/* Gestion des erreurs */}
                {error && (
                    <Alert
                        message="Erreur GraphQL"
                        description={
                            <div>
                                <div><strong>Message:</strong> {error.message}</div>
                                {error.graphQLErrors?.map((err, i) => (
                                    <div key={i}>
                                        <strong>GraphQL Error {i + 1}:</strong> {err.message}
                                        {err.extensions && (
                                            <pre style={{ fontSize: '11px', marginTop: '8px' }}>
                                                {JSON.stringify(err.extensions, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                {error.networkError && (
                                    <div>
                                        <strong>Network Error:</strong> {error.networkError.message}
                                    </div>
                                )}
                            </div>
                        }
                        type="error"
                        style={{ marginBottom: '24px' }}
                        showIcon
                    />
                )}

                {/* Loader */}
                {loading && !data && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" tip="Chargement des véhicules...">
                            <div style={{ height: '100px' }} />
                        </Spin>
                    </div>
                )}

                {/* Table des véhicules */}
                {!loading && !error && vehicles.length > 0 && (
                    <Table
                        dataSource={vehicles}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total: ${total} véhicules`,
                        }}
                        scroll={{ x: 1200 }}
                        loading={loading}
                    />
                )}

                {/* Aucune donnée */}
                {!loading && !error && vehicles.length === 0 && (
                    <Alert
                        message="Aucun véhicule trouvé"
                        description="La requête GraphQL n'a retourné aucun véhicule."
                        type="warning"
                        showIcon
                    />
                )}

                {/* JSON brut pour debug */}
                {vehicles.length > 0 && (
                    <Card
                        title="Données brutes (JSON)"
                        style={{ marginTop: '24px' }}
                        type="inner"
                    >
                        <pre style={{
                            maxHeight: '400px',
                            overflow: 'auto',
                            background: '#f5f5f5',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            {JSON.stringify(vehicles, null, 2)}
                        </pre>
                    </Card>
                )}
            </Card>
        </div>
    );
}
