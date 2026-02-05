'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { ALERTS_COUNT_QUERY } from '@/lib/graphql/queries';
import { useQuery } from '@apollo/client';
import { IVehicle } from '@/lib/hooks/Interfaces';
import { ConfigProvider, Tabs, Spin } from 'antd';
import "./AlertsList.css";
import AlertsRead from './AlertsRead';

interface IPropsAlertsList {
    from: number;
    to: number;
    isAutopartage: boolean | null;
    category: string[];
    energies: string[];
    makes: string[];
    models: string[];
    drivers: string[];
    registrations: string[];
    vehicles: IVehicle[];
}

export const categoriesList: Record<string, string[]> = {
    'sharing': ['SHARING', 'ACCOUNT', 'DATA', 'QUOTE'],
    'maintenance': ['APPOINTMENT', 'VEHICLE'],
    'security': ['ACCIDENT', 'THEFT', 'IMPOUND', 'SECURITY'],
    'fault': ['BATTERY', 'FUEL', 'FAULT'],
    'device': ['DEVICE'],
};

const AlertsList: React.FC<IPropsAlertsList> = (props) => {
    const countResult = useQuery(ALERTS_COUNT_QUERY, {
        variables: {
            from: props.from,
            to: props.to,
            archived: false,
            vehicleIds: props.vehicles.map((vehicle: IVehicle) => vehicle.id),
        },
        context: {
            version: "php",
        },
        pollInterval: 180000,
    });

    const countResultArchive = useQuery(ALERTS_COUNT_QUERY, {
        variables: {
            from: props.from,
            to: props.to,
            archived: true,
            vehicleIds: props.vehicles.map((vehicle: IVehicle) => vehicle.id),
        },
        context: {
            version: "php",
        },
        pollInterval: 180000,
    });

    const [counterNotifications, setCounterNotifications] = useState<any[]>([]);
    const [counterNotificationsArchive, setCounterNotificationsArchive] = useState<any[]>([]);

    useEffect(() => {
        if (countResult.data?.notificationCounter) {
            setCounterNotifications(countResult.data.notificationCounter);
        }
    }, [countResult.data]);

    useEffect(() => {
        if (countResultArchive.data?.notificationCounter) {
            setCounterNotificationsArchive(countResultArchive.data.notificationCounter);
        }
    }, [countResultArchive.data]);

    const count = useMemo(() => {
        const countRead = counterNotifications.reduce((total, counter) => total + counter.count, 0);
        const countUnread = counterNotifications.reduce((total, counter) => total + counter.unread, 0);
        const countArchive = counterNotificationsArchive.reduce((total, counter) => total + counter.count, 0);
        const countTotal = countArchive + countUnread + countRead;
        return {
            countTotal,
            countUnread,
            countRead,
            countArchive
        };
    }, [counterNotifications, counterNotificationsArchive]);

    const isLoading = countResult.loading || countResultArchive.loading;

    const tabs = [
        {
            key: "unread",
            label: `Non lues (${count.countUnread})`,
            children: isLoading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <AlertsRead
                    vehicles={props.vehicles}
                    from={props.from}
                    to={props.to}
                    category={props.category}
                    readType="UNREAD"
                    archived={false}
                    isFiltered={true}
                />
            )
        },
        {
            key: "read",
            label: `Lues (${count.countRead})`,
            children: isLoading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <AlertsRead
                    vehicles={props.vehicles}
                    from={props.from}
                    to={props.to}
                    category={props.category}
                    readType="READ"
                    archived={false}
                    isFiltered={true}
                />
            )
        },
        {
            key: "archive",
            label: `Archivées (${count.countArchive})`,
            children: isLoading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <AlertsRead
                    vehicles={props.vehicles}
                    from={props.from}
                    to={props.to}
                    category={props.category}
                    readType="ALL"
                    archived={true}
                    isFiltered={false}
                />
            )
        },
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        itemSelectedColor: '#01426A',
                        inkBarColor: '#01426A',
                    },
                },
                token: {
                    colorBorderSecondary: '#f0f0f0',
                }
            }}
        >
            <Tabs
                className="tabs-alerts"
                tabPosition="top"
                style={{ width: '100%' }}
                items={tabs}
                type={"line"}
            />
        </ConfigProvider>
    );
};

export default AlertsList;
