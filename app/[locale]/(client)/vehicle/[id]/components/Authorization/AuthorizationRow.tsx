'use client'

import { useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Spin, App } from "antd";
import { LoadingOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { IVehicle, IAuthorization } from "@/lib/hooks/Interfaces";
import { deleteAuthorization, editAuthorization } from "@/app/actions/authorization";
import "./AuthorizationRow.css";

interface IAuthorizationCustom extends IAuthorization {
    dateRange: [Dayjs, Dayjs];
    dateUntil: Dayjs;
}

interface AuthorizationRowProps {
    authorization: IAuthorization;
    vehicle: IVehicle;
    setReload?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AuthorizationRow({ authorization, vehicle, setReload }: AuthorizationRowProps) {
    const { notification } = App.useApp();
    const [modalEditAuthorizationOpen, setModalEditAuthorizationOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const dataEdit: IAuthorizationCustom = {
        ...authorization,
        dateRange: [dayjs(authorization.from! * 1000), dayjs(authorization.until * 1000)],
        dateUntil: dayjs(authorization.until * 1000)
    };

    const mDelete = useMutation({
        mutationFn: deleteAuthorization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authorizations', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['closedAuthorizations', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['futureAuthorizations', vehicle.id] });
            notification.success({ message: 'Autorisation supprimée avec succès' });
        },
        onError: () => {
            notification.error({ message: "Echec lors de la suppression de l'autorisation, veuillez réessayer." });
        },
    });

    const mEdit = useMutation({
        mutationFn: editAuthorization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authorizations', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['futureAuthorizations', vehicle.id] });
            notification.success({ message: 'Autorisation modifiée avec succès' });
        },
        onError: () => {
            notification.error({ message: "Echec lors de la modification de l'autorisation, veuillez réessayer." });
        },
        onMutate: () => setSaving(true),
        onSettled: () => {
            setSaving(false);
            setModalEditAuthorizationOpen(false);
        }
    });

    const handleDelete = (authorizationId: string) => {
        if (authorizationId) {
            mDelete.mutate({ authorizationId });
        }
    };

    const onEdit = (value: IAuthorizationCustom) => {
        let from_ = authorization.from!;
        let until_ = authorization.until;

        if (dayjs().isAfter(dayjs.unix(authorization.from!))) {
            until_ = value.dateUntil.valueOf() / 1000;
        } else {
            from_ = value.dateRange[0].valueOf() / 1000;
            until_ = value.dateRange[1].valueOf() / 1000;
        }

        mEdit.mutate({
            authorizationId: authorization.authorizationId,
            from: from_,
            until: until_,
        });
    };

    const now = dayjs();
    const disabledDate = (current: Dayjs) => current && current.isBefore(now, 'day');

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
        return { disabledHours: () => [], disabledMinutes: () => [] };
    };

    return (
        <div className="authorization-row-box" key={authorization.authorizationId}>
            {dayjs().isBefore(dayjs.unix(authorization.until)) && (
                <div className="btn-action-row-authorization">
                    <DeleteOutlined
                        onClick={() => handleDelete(authorization.authorizationId)}
                        style={{ cursor: 'pointer', color: '#ff4d4f' }}
                    />
                </div>
            )}
            <div className="btn-action-row-authorization">
                <EditOutlined
                    onClick={() => setModalEditAuthorizationOpen(true)}
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                />
            </div>
            <span className="authorization-driver-name">{authorization.driverName}</span>
            <DatePicker.RangePicker
                className="authorization-date-picker"
                value={[dayjs.unix(authorization.from!), dayjs.unix(authorization.until)]}
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                disabled={true}
            />

            <Modal
                title={dayjs().isAfter(dayjs.unix(authorization.from!))
                    ? "Modification fin d'autorisation"
                    : "Modification d'une autorisation"
                }
                className="icon-modal-box modal-authorization-form"
                centered
                open={modalEditAuthorizationOpen}
                onCancel={() => setModalEditAuthorizationOpen(false)}
                footer={[
                    <Button
                        className="custom-button"
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                    >
                        Valider
                        {saving && <Spin indicator={<LoadingOutlined spin />} />}
                    </Button>,
                ]}
            >
                <Form
                    className="authorization-form"
                    layout="vertical"
                    form={form}
                    onFinish={onEdit}
                    initialValues={dataEdit}
                >
                    <Form.Item
                        className="input-driver-authorization-form"
                        label="Conducteur"
                        name="driverName"
                        rules={[{ required: true }]}
                    >
                        <Input className="input-driver-authorization" disabled={true} />
                    </Form.Item>

                    {dayjs().isAfter(dayjs.unix(authorization.from!)) ? (
                        <Form.Item
                            className="input-date-authorization"
                            rules={[{ required: true }]}
                            name="dateUntil"
                            label="Nouvelle date de fin"
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="DD/MM/YYYY HH:mm"
                                minDate={dayjs()}
                                disabledDate={disabledDate}
                                disabledTime={disabledTime}
                            />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            className="input-date-authorization"
                            rules={[{ required: true }]}
                            name="dateRange"
                            label="Période"
                        >
                            <DatePicker.RangePicker
                                showTime={{ format: 'HH:mm' }}
                                format="DD/MM/YYYY HH:mm"
                                disabledDate={disabledDate}
                                disabledTime={disabledTime}
                            />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}
