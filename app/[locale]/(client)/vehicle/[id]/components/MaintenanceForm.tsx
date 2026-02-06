'use client'

import { Col, DatePicker, Form, Input, InputNumber, notification, Row } from "antd";
import React, { useEffect, useState } from "react";
import { IVehicle } from "@/lib/hooks/Interfaces";
import dayjs from "dayjs";
import './MaintenanceForm.css';

export function formatNum(number: number, virg: number): string {
    const result = Math.round(number * Math.pow(10, virg)) / Math.pow(10, virg);
    return result.toString().replace('.', ',');
}

export default function MaintenanceForm(props: { vehicle: IVehicle }) {
    const [form] = Form.useForm();
    const dateFormat = 'DD/MM/YYYY';
    const [maintenance, setMaintenance] = useState<any>({
        ...props.vehicle.maintenance,
        lastScheduledMaintenance: dayjs.unix(props.vehicle.maintenance.lastScheduledMaintenance),
        lastControlDate: dayjs.unix(props.vehicle.maintenance.lastControlDate),
        nextScheduledMaintenance: dayjs.unix(props.vehicle.maintenance.nextScheduledMaintenance),
        nextControlDate: dayjs.unix(props.vehicle.maintenance.nextControlDate),
        privacy: props.vehicle.status.privacy,
    });

    const [statistic, setStatistic] = useState<any>(null);

    // TODO: Implement data fetching logic here
    // This should be replaced with actual API calls using your data fetching method
    useEffect(() => {
        // Fetch statistics data
        // setStatistic(data);
    }, [props.vehicle.id]);

    const handleLastScheduledMaintenanceChange = async (date: dayjs.Dayjs | null) => {
        if (!date) return;

        try {
            // TODO: Implement mutation to update last scheduled maintenance
            // await updateLastScheduledMaintenance({
            //   vehicleId: props.vehicle.id,
            //   date: date.unix(),
            //   mileage: maintenance.lastMaintenanceMileage
            // });

            notification.success({
                message: 'Date du dernier entretien mise à jour'
            });
        } catch (error) {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    };

    const handleLastTechnicalDateChange = async (date: dayjs.Dayjs | null) => {
        if (!date) return;

        try {
            // TODO: Implement mutation to update last technical date
            // await updateLastTechnicalDate({
            //   vehicleId: props.vehicle.id,
            //   date: date.unix(),
            // });

            notification.success({
                message: 'Date du dernier contrôle technique mise à jour'
            });
        } catch (error) {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    };

    const handleLastMaintenanceMileageChange = async (value: number | null) => {
        if (!value) return;

        try {
            // TODO: Implement mutation to update last maintenance mileage
            // await updateLastScheduledMaintenance({
            //   vehicleId: props.vehicle.id,
            //   date: props.vehicle.maintenance.lastScheduledMaintenance,
            //   mileage: value
            // });

            notification.success({
                message: 'Kilométrage du dernier entretien mis à jour'
            });
        } catch (error) {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    };

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
                    value={formatNum(props.vehicle.status.mileage ?? 0, 0)}
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
