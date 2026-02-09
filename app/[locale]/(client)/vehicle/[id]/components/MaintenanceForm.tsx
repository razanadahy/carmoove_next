'use client'

import { DatePicker, Form, Input, InputNumber, App, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { IVehicle } from "@/lib/hooks/Interfaces";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@apollo/client";
import { LAST_SCHEDULED_MAINTENANCE, LAST_TECHNICAL_DATE } from "@/lib/graphql/mutation";
import { STAT_QUERY, VEHICLE_QUERY } from "@/lib/graphql/queries";
import './MaintenanceForm.css';

export function formatNum(number: number, virg: number): string {
    const result = Math.round(number * Math.pow(10, virg)) / Math.pow(10, virg);
    return result.toString().replace('.', ',');
}

const toValidDayjs = (timestamp: number | null | undefined): dayjs.Dayjs | null => {
    if (!timestamp || timestamp <= 0) return null;
    return dayjs.unix(timestamp);
};

export default function MaintenanceForm(props: { vehicle: IVehicle }) {
    const { notification } = App.useApp();
    const [form] = Form.useForm();
    const dateFormat = 'DD/MM/YYYY';
    const [maintenance, setMaintenance] = useState<any>({
        ...props.vehicle.maintenance,
        lastScheduledMaintenance: toValidDayjs(props.vehicle.maintenance.lastScheduledMaintenance),
        lastControlDate: toValidDayjs(props.vehicle.maintenance.lastControlDate),
        nextScheduledMaintenance: toValidDayjs(props.vehicle.maintenance.nextScheduledMaintenance),
        nextControlDate: toValidDayjs(props.vehicle.maintenance.nextControlDate),
        privacy: props.vehicle.status.privacy,
    });

    const [statistic, setStatistic] = useState<any>(null);

    // Fetch statistics data
    const { data, loading, error } = useQuery(STAT_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleId: props.vehicle.id,
        },
        context: {
            version: 'php'
        }
    });

    // Mutation for last scheduled maintenance
    const [lastScheduledMaintenanceMutate] = useMutation(LAST_SCHEDULED_MAINTENANCE, {
        refetchQueries: [{
            query: VEHICLE_QUERY,
            variables: {
                id: props.vehicle.id
            },
            context: {
                version: 'php'
            }
        }],
        awaitRefetchQueries: true,
        onCompleted: () => {
            notification.success({
                message: 'Vos informations personnelles ont été mises à jour'
            });
        },
        onError: () => {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    });

    // Mutation for last technical date
    const [lastTechnicalDateMutate] = useMutation(LAST_TECHNICAL_DATE, {
        refetchQueries: [{
            query: VEHICLE_QUERY,
            variables: {
                id: props.vehicle.id
            },
            context: {
                version: 'php'
            }
        }],
        awaitRefetchQueries: true,
        onCompleted: () => {
            notification.success({
                message: 'Vos informations personnelles ont été mises à jour'
            });
        },
        onError: () => {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    });

    useEffect(() => {
        if (data) {
            setStatistic(data.detailedStatistic);
        }
    }, [data]);

    const handleLastScheduledMaintenanceChange = (date: dayjs.Dayjs | null) => {
        if (!date) return;
        lastScheduledMaintenanceMutate({
            variables: {
                vehicleId: props.vehicle.id,
                date: date.unix(),
                mileage: maintenance.lastMaintenanceMileage
            }
        });
    };

    const handleLastTechnicalDateChange = (date: dayjs.Dayjs | null) => {
        if (!date) return;
        lastTechnicalDateMutate({
            variables: {
                vehicleId: props.vehicle.id,
                date: date.unix(),
            }
        });
    };

    const handleLastMaintenanceMileageChange = (value: number | null) => {
        if (!value) return;
        lastScheduledMaintenanceMutate({
            variables: {
                vehicleId: props.vehicle.id,
                date: props.vehicle.maintenance.lastScheduledMaintenance,
                mileage: value
            }
        });
    };

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <p>Erreur de chargement</p>;
    }

    if (!data?.detailedStatistic) {
        return null;
    }

    return (
        <Form
            layout="vertical"
            form={form}
            initialValues={maintenance}
            className="administrative-entretien-box"
        >
            <Form.Item
                label="Kilométrage à date"
                hasFeedback
                help=""
                rules={[{ required: false }]}
                className="adm-ent-items info-mileage"
            >
                <InputNumber
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    value={formatNum(statistic?.vehicle?.status?.mileage ?? 0, 0)}
                    style={{ width: '100%', color: '#4d4d4d' }}
                />
            </Form.Item>
            <Form.Item
                name="lastControlDate"
                label="Date du dernier contrôle technique"
                hasFeedback
                help=""
                rules={[{ required: false }]}
                className="adm-ent-items info-date-last-technical"
            >
                <DatePicker
                    format={dateFormat}
                    onChange={handleLastTechnicalDateChange}
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <Form.Item
                name="lastScheduledMaintenance"
                label="Date du dernier entretien"
                hasFeedback
                help=""
                rules={[{ required: false }]}
                className="adm-ent-items info-date-last-maintenance"
            >
                <DatePicker
                    format={dateFormat}
                    onChange={handleLastScheduledMaintenanceChange}
                    style={{ width: '100%' }}
                />
            </Form.Item>
            <Form.Item
                name="nextScheduledMaintenance"
                label="Date du prochain entretien"
                className="adm-ent-items info-date-next-maintenance"
            >
                <DatePicker format={dateFormat} disabled style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
                label="Coût total estimé"
                className="adm-ent-items info-cost"
            >
                <Input
                    disabled
                    type="text"
                    value={formatNum(statistic?.cost ?? 0, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " €"}
                    style={{ width: '100%', color: '#4d4d4d' }}
                />
            </Form.Item>
            <Form.Item
                name="nextControlDate"
                label="Date du prochain contrôle technique"
                className="adm-ent-items info-date-next-technical"
            >
                <DatePicker format={dateFormat} disabled style={{ width: '100%', color: '#4d4d4d' }} />
            </Form.Item>
            <Form.Item
                name="lastMaintenanceMileage"
                label="Kilométrage du dernier entretien"
                hasFeedback
                help=""
                rules={[{ required: false }]}
                className="adm-ent-items info-date-last-mileage-maintenance"
            >
                <InputNumber
                    min={1}
                    onChange={handleLastMaintenanceMileageChange}
                    style={{ width: '100%', color: '#4d4d4d' }}
                />
            </Form.Item>
        </Form>
    );
}
