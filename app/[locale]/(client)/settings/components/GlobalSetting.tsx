"use client"

import { Form, Select, Switch, Input, Button, Space, Card, Divider, Spin, Alert } from 'antd';
import { SaveOutlined, GlobalOutlined, BellOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { ME_QUERY } from '@/lib/graphql/queries';
import { FiscalMonthSelect } from './FiscalMonthSelect';

const { Option } = Select;

export default function GlobalSetting() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const { data: dataMe, loading: loadingMe, error } = useQuery(ME_QUERY, {
        context: {
            version: "php",
        },
    });

    // Charger les paramètres depuis localStorage
    useEffect(() => {
        const refreshMap = window.localStorage.getItem('refresh_map') ?? '30';
        const language = window.localStorage.getItem('language') ?? 'fr';
        const timezone = window.localStorage.getItem('timezone') ?? 'Europe/Paris';
        const dateFormat = window.localStorage.getItem('date_format') ?? 'DD/MM/YYYY';
        const notifications = window.localStorage.getItem('notifications') === 'true';
        const emailNotifications = window.localStorage.getItem('email_notifications') === 'true';

        form.setFieldsValue({
            refreshMap,
            language,
            timezone,
            dateFormat,
            notifications,
            emailNotifications,
            displayName: dataMe?.whoami?.firstName ? `${dataMe.whoami.firstName} ${dataMe.whoami.lastName || ''}`.trim() : '',
            email: dataMe?.whoami?.email || '',
        });
    }, [form, dataMe]);


    const handleChangeRefresh = (value: string) => {
        window.localStorage.setItem('refresh_map', value);
    };

    // if (loadingMe) {
    //     return (
    //         <div style={{ textAlign: 'center', padding: '50px' }}>
    //             <Spin size="large" tip="Chargement des paramètres...">
    //                 <div style={{ height: '100px' }} />
    //             </Spin>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <Alert
    //             message="Erreur de chargement"
    //             description="Impossible de charger vos paramètres. Veuillez réessayer."
    //             type="error"
    //             showIcon
    //         />
    //     );
    // }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="setting-section"
        >
            <Form
                form={form}
                layout="vertical"
                // onFinish={handleSave}
                initialValues={{
                    refreshMap: '30',
                    language: 'fr',
                    timezone: 'Europe/Paris',
                    dateFormat: 'DD/MM/YYYY',
                    notifications: true,
                    emailNotifications: true,
                }}
            >
                {/* Suivi temps réel */}
                <Card className="setting-item">
                    <div className="setting-item-header">
                        <h3 style={{ margin: 0 }}>
                            <ClockCircleOutlined /> Suivi temps réel
                        </h3>
                    </div>

                    <Form.Item
                        label="Rafraîchissement des positions sur la carte"
                        name="refreshMap"
                        help="Fréquence de mise à jour des positions des véhicules"
                    >
                        <Select onChange={handleChangeRefresh}>
                            <Option value="30">30 secondes</Option>
                            <Option value="60">1 minute</Option>
                            <Option value="120">2 minutes</Option>
                            <Option value="300">5 minutes</Option>
                        </Select>
                    </Form.Item>
                </Card>

                <Divider />

                {dataMe?.whoami?.company && (
                    <>
                        <Card className="setting-item">
                            <div className="setting-item-header">
                                <h3 style={{ margin: 0 }}>
                                    <CalendarOutlined /> Année Fiscale
                                </h3>
                            </div>

                            <Form.Item
                                label="Début de l'année fiscale"
                                help="Définit le mois de début de votre année fiscale"
                            >
                                <FiscalMonthSelect user={dataMe.whoami} />
                            </Form.Item>
                        </Card>

                        <Divider />
                    </>
                )}
            </Form>
        </motion.div>
    );
}
