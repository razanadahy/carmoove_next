'use client'

import { useMutation, useQuery } from "@apollo/client";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { NOTIFICATIONS_QUERY } from "@/lib/graphql/queries";
import { ARCHIVE_ALL_MUTATION, ARCHIVE_SELECTION_MUTATION } from "@/lib/graphql/mutation";
import { useEffect, useMemo, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { App, Empty, Spin } from "antd";
import { categoriesList } from "./AlertsList";
import AddFilter from "./AddFilter";
import AlertRow from "./AlertRow";

export interface INotification {
    id: string;
    category: string;
    categoryTranslation: string;
    type: string;
    read: boolean;
    archived: boolean;
    code: string;
    vehicle: IVehicle;
    headings: { language: string; text: string }[];
    contents: { language: string; text: string }[];
    shipment: {
        id: string;
        status: string;
        read: boolean;
        timestamp: number;
        recipients: string[];
    };
    informations: { key: string; value: string }[];
    actions: {
        type: string;
        link: string;
        data: string;
        label: { language: string; label: string }[];
        feature: string;
    }[];
}

interface IPropsAlertsRead {
    vehicles: IVehicle[];
    from: number;
    to: number;
    category: string[];
    readType: string;
    archived: boolean;
    isFiltered: boolean;
}

const AlertsRead = (props: IPropsAlertsRead) => {
    const { notification } = App.useApp();
    const [checkedList, setCheckedList] = useState<string[]>([]);
    const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
    const [types, setTypes] = useState<string>("all");
    const [loadingPlus, setLoadingPlus] = useState<boolean>(false);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

    const dataAlert = useQuery(NOTIFICATIONS_QUERY, {
        notifyOnNetworkStatusChange: true,
        pollInterval: 10000,
        variables: {
            from: new Date(props.from * 1000).toISOString(),
            to: new Date(props.to * 1000).toISOString(),
            offset: 0,
            limit: 21,
            readType: props.readType,
            archived: props.archived,
            type: "ALL",
            vehicleIds: props.vehicles.map((vehicle: IVehicle) => vehicle.id),
        },
        context: {
            version: "php",
        },
    });

    const [launchArchiveSelection] = useMutation(ARCHIVE_SELECTION_MUTATION, {
        context: {
            version: "php",
        },
        refetchQueries: [
            { query: NOTIFICATIONS_QUERY },
            "NotificationCounter",
        ],
    });

    const [launchArchiveAll] = useMutation(ARCHIVE_ALL_MUTATION, {
        context: {
            version: "php",
        },
        refetchQueries: [
            { query: NOTIFICATIONS_QUERY },
            "NotificationCounter",
        ],
    });

    // Build categories filter
    const categories: string[] = [];
    Object.entries(categoriesList).forEach(([key, value]) => {
        if (props.category.includes(key)) {
            value.forEach(c => categories.push(c.toLowerCase()));
        }
    });

    const notifications: INotification[] = useMemo(() => {
        if (!dataAlert.data || !dataAlert.data.notifications || dataAlert.data.notifications.length === 0) {
            return [];
        }

        return [...dataAlert.data.notifications as INotification[]]
            .filter(n => {
                const matchesType = types === "all" || n.type.includes(types);
                const matchesCategory = categories.length === 0 || categories.includes(n.category.toLowerCase());
                return matchesType && matchesCategory;
            })
            .sort((a, b) => {
                if (a.shipment.timestamp > b.shipment.timestamp) return -1;
                if (a.shipment.timestamp < b.shipment.timestamp) return 1;
                return 0;
            });
    }, [dataAlert.data, categories, types]);

    const handleCheck = (notification: INotification): void => {
        setCheckedList(prev =>
            prev.includes(notification.id)
                ? prev.filter(id => id !== notification.id)
                : [...prev, notification.id]
        );
    };

    const handleSelectAll = (): void => {
        if (isAllSelected) {
            setCheckedList([]);
            return;
        }
        const allIds = notifications.map(notification => notification.id);
        setCheckedList(allIds);
    };

    useEffect(() => {
        if (checkedList.length === notifications.length && checkedList.length > 0) {
            setIsAllSelected(true);
        }
        if (checkedList.length === 0) {
            setIsAllSelected(false);
        }
    }, [checkedList, notifications]);

    useEffect(() => {
        if (!dataAlert.loading) {
            setLoadingInitial(false);
        }
    }, [dataAlert.loading]);

    useEffect(() => {
        if (loadingPlus && !dataAlert.loading) {
            setLoadingPlus(false);
        }
    }, [loadingPlus, dataAlert.loading]);

    const archiveSelection = async () => {
        if (checkedList.length === 0) return;

        try {
            const result = await launchArchiveSelection({
                variables: {
                    notifications: checkedList.map((id) => ({ id })),
                    archived: true,
                },
            });
            notification.success({
                message: "Notifications archivées",
                description: `${checkedList.length} notification(s) archivée(s) avec succès.`,
            });
            return result;
        } catch (error) {
            notification.error({
                message: "Erreur",
                description: "Une erreur est survenue lors de l'archivage des notifications.",
            });
            throw error;
        } finally {
            setCheckedList([]);
        }
    };

    const archiveAll = async () => {
        try {
            const result = await launchArchiveAll({
                variables: {
                    archived: true,
                    vehicleIds: props.vehicles.map((vehicle: IVehicle) => vehicle.id),
                },
            });
            notification.success({
                message: "Toutes les notifications archivées",
                description: "Toutes les notifications ont été archivées avec succès.",
            });
            return result;
        } catch (error) {
            notification.error({
                message: "Erreur",
                description: "Une erreur est survenue lors de l'archivage des notifications.",
            });
            throw error;
        } finally {
            setCheckedList([]);
        }
    };

    const handleLoadMore = () => {
        setLoadingPlus(true);
        dataAlert.fetchMore({
            variables: { offset: dataAlert.data.notifications.length },
        });
    };

    return (
        <>
            <AddFilter
                handleSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
                archiveSelection={archiveSelection}
                archiveAll={archiveAll}
                inactive={checkedList.length === 0}
                setType={setTypes}
                type={types}
                visibleArchive={props.isFiltered}
            />

            {loadingInitial && (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            )}

            <div className="alert-list-box">
                {notifications.length === 0 && !loadingInitial && (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span>Aucune notification pour le moment</span>}
                    />
                )}

                <div className="row w-100 p-0 m-0">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="col-lg-4 col-sm-12 mb-2">
                            <AlertRow
                                notification={notification}
                                isChecked={checkedList.includes(notification.id)}
                                handleCheck={() => handleCheck(notification)}
                            />
                        </div>
                    ))}
                </div>

                {!loadingInitial && !loadingPlus && notifications.length > 0 && (
                    <div className="data-alert-fetch-more">
                        <a onClick={handleLoadMore}>Charger plus</a>
                    </div>
                )}

                {loadingPlus && (
                    <div className="w-100 mt-2 d-flex justify-content-center align-items-center">
                        <LoadingOutlined style={{ fontSize: '40px' }} />
                    </div>
                )}
            </div>
        </>
    );
};

export default AlertsRead;
