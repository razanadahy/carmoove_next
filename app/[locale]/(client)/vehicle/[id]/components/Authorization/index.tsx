'use client'

import { useEffect, useState } from "react";
import { Button, ConfigProvider, Form, Input, Modal, Tabs, DatePicker, Spin, Drawer, App } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnixTime } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { IVehicle, IAuthorization, IDriver } from "@/lib/hooks/Interfaces";
import { createAuthorization } from "@/app/actions/authorization";
import VehicleInformationBox from "../VehicleInformationBox";
import CurrentAuthorization from "./CurrentAuthorization";
import FutureAuthorization from "./FutureAuthorization";
import ClosedAuthorization from "./ClosedAuthorization";
import AuthorizationDetail from "./AuthorizationDetail";
import SelectDriver from "./SelectDriver";
import "./Authorization.css";

interface AuthorizationProps {
    vehicle: IVehicle;
}

interface IFromTo {
    from: number;
    to: number;
}

export default function Authorization({ vehicle }: AuthorizationProps) {
    const { notification } = App.useApp();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [modalAddAuthorizationOpen, setModalAddAuthorizationOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<IDriver | null>(null);
    const [fromTo, setFromTo] = useState<IFromTo>({ from: 0, to: 0 });
    const [saving, setSaving] = useState(false);
    const [reload, setReload] = useState(false);
    const [authorization, setAuthorization] = useState<IAuthorization | null>(null);

    const sPanelSelected = searchParams.get('autorisation_panel') ?? 'current';

    const mutation = useMutation({
        mutationFn: createAuthorization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authorizations', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['closedAuthorizations', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['futureAuthorizations', vehicle.id] });
            notification.success({ message: 'Autorisation créée avec succès' });
            setModalAddAuthorizationOpen(false);
            setSelectedDriver(null);
            setReload(true);
        },
        onError: () => {
            notification.error({ message: "Echec lors de la création de l'autorisation, veuillez réessayer." });
        },
        onSettled: () => {
            setSaving(false);
            setFromTo({ from: 0, to: 0 });
        }
    });

    useEffect(() => {
        if (selectedDriver) {
            setModalAddAuthorizationOpen(true);
            setDrawerOpen(false);
        }
    }, [selectedDriver]);

    useEffect(() => {
        setFromTo({ from: 0, to: 0 });
    }, [modalAddAuthorizationOpen]);

    const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || !dates[0] || !dates[1]) return;
        setFromTo({
            from: getUnixTime(dates[0].toDate()),
            to: getUnixTime(dates[1].toDate()),
        });
    };

    const handleSave = () => {
        if (selectedDriver) {
            setSaving(true);
            mutation.mutate({
                vehicleId: vehicle.id,
                userId: selectedDriver.driverID,
                level: "DRIVE",
                from: fromTo.from,
                until: fromTo.to,
            });
        }
    };

    const handleTabChange = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('autorisation_panel', key);
        router.push(`${pathname}?${params.toString()}`);
    };

    const tabs = [
        {
            key: "current",
            label: "En cours",
            children: <CurrentAuthorization vehicle={vehicle} reload={reload} setReload={setReload} />
        },
        {
            key: "planned",
            label: "À venir",
            children: <FutureAuthorization vehicle={vehicle} reload={reload} setReload={setReload} />
        },
        {
            key: "closed",
            label: "Terminés",
            children: <ClosedAuthorization vehicle={vehicle} reload={reload} setReload={setReload} setAuthorizationView={setAuthorization} />
        },
    ];

    const now = dayjs();
    const disabledDate = (current: Dayjs) => {
        return current && current.isBefore(now, 'day');
    };

    const disabledTime = (date: Dayjs | null) => {
        if (!date) return {};
        if (date.isSame(now, 'day')) {
            const currentHour = now.hour();
            const currentMinute = now.minute();
            return {
                disabledHours: () => Array.from(Array(currentHour).keys()),
                disabledMinutes: (selectedHour: number) => {
                    if (selectedHour === currentHour) {
                        return Array.from(Array(currentMinute).keys());
                    }
                    return [];
                },
            };
        }
        return {
            disabledHours: () => [],
            disabledMinutes: () => [],
        };
    };

    return (
        <>
            <VehicleInformationBox vehicle={vehicle} />
            {authorization ? (
                <AuthorizationDetail
                    autorisation={authorization}
                    setAuthorizationView={setAuthorization}
                />
            ) : (
                <>
                    <h2 className="title-authorization">Droits d'accès au véhicule & historique</h2>
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
                            className="tabs-authorization"
                            tabPosition="top"
                            items={tabs}
                            defaultActiveKey={sPanelSelected}
                            onChange={handleTabChange}
                        />
                    </ConfigProvider>

                    <div className="add-authorization-button">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setDrawerOpen(true)}
                        >
                            AJOUTER UNE AUTORISATION
                        </Button>
                    </div>

                    <Drawer
                        title="Sélectionner un conducteur"
                        placement="right"
                        onClose={() => setDrawerOpen(false)}
                        open={drawerOpen}
                        width={400}
                    >
                        <SelectDriver
                            onSelect={(driver) => setSelectedDriver(driver)}
                        />
                    </Drawer>

                    <Modal
                        title="Ajout d'une autorisation"
                        className="icon-modal-box"
                        centered
                        open={modalAddAuthorizationOpen}
                        onCancel={() => {
                            setModalAddAuthorizationOpen(false);
                            setSelectedDriver(null);
                        }}
                        footer={[
                            <Button
                                className="custom-button"
                                key="submit"
                                type="primary"
                                onClick={handleSave}
                                disabled={!fromTo.from || !fromTo.to}
                            >
                                Valider
                                {saving && <Spin indicator={<LoadingOutlined spin />} />}
                            </Button>,
                        ]}
                    >
                        <Form.Item
                            className="input-driver-authorization-form"
                            layout="vertical"
                            label="Nom de l'utilisateur"
                            rules={[{ required: true }]}
                        >
                            <Input
                                className="input-driver-authorization"
                                value={selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : ''}
                                disabled={true}
                            />
                            <DatePicker.RangePicker
                                showTime={{ format: 'HH:mm' }}
                                format="DD/MM/YYYY HH:mm"
                                disabledDate={disabledDate}
                                disabledTime={disabledTime}
                                onCalendarChange={handleCalendarChange}
                                style={{ marginTop: 16, width: '100%' }}
                            />
                        </Form.Item>
                    </Modal>
                </>
            )}
        </>
    );
}
