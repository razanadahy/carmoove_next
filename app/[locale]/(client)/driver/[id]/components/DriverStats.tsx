"use client"

import { Card, Statistic, Row, Col } from "antd";
import { CarOutlined, ClockCircleOutlined, DollarOutlined, FireOutlined } from "@ant-design/icons";

interface DriverStatsProps {
    data: any;
}

export default function DriverStats({ data }: DriverStatsProps) {
    const stats = data?.driverStatistics;

    if (!stats) {
        return <div>Aucune statistique disponible</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '24px' }}>Statistiques du conducteur</h2>

            <Row gutter={[16, 16]}>
                {stats.nbPaths > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Nombre de trajets"
                                value={stats.nbPaths}
                                prefix={<CarOutlined />}
                            />
                        </Card>
                    </Col>
                )}

                {stats.usageMileage > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Kilométrage"
                                value={stats.usageMileage}
                                suffix="km"
                                precision={1}
                            />
                        </Card>
                    </Col>
                )}

                {stats.usageTime > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Temps d'utilisation"
                                value={Math.round(stats.usageTime / 60)}
                                suffix="h"
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                )}

                {stats.usageCost > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Coût estimé"
                                value={stats.usageCost}
                                precision={2}
                                suffix="€"
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                    </Col>
                )}

                {stats.totalFuel > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Consommation totale"
                                value={stats.totalFuel}
                                precision={1}
                                suffix="L"
                                prefix={<FireOutlined />}
                            />
                        </Card>
                    </Col>
                )}

                {stats.consumption > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Consommation moyenne"
                                value={stats.consumption}
                                precision={1}
                                suffix="L/100km"
                            />
                        </Card>
                    </Col>
                )}

                {stats.electricConsumption > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Conso. électrique"
                                value={stats.electricConsumption}
                                precision={1}
                                suffix="kWh/100km"
                            />
                        </Card>
                    </Col>
                )}

                {stats.co2 > 0 && (
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                            <Statistic
                                title="Émissions CO2"
                                value={stats.co2}
                                precision={2}
                                suffix="T"
                            />
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}
