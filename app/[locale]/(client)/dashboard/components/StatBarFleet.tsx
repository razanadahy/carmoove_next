"use client"

import { Card, Statistic, Row, Col } from "antd";
import { CarOutlined, DashboardOutlined } from "@ant-design/icons";

interface StatBarFleetProps {
    types: string;
}

export default function StatBarFleet({ types }: StatBarFleetProps) {
    return (
        <Card title={<span><DashboardOutlined /> Statistiques de la flotte</span>}>
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title="Véhicules"
                        value={0}
                        prefix={<CarOutlined />}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Kilométrage"
                        value={0}
                        suffix="km"
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Coût"
                        value={0}
                        precision={2}
                        suffix="€"
                    />
                </Col>
            </Row>
        </Card>
    );
}
