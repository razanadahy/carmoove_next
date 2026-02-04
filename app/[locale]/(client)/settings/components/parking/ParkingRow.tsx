"use client"

import { Button, Form, Input, Modal, App } from "antd";
import { IParking } from "@/lib/hooks/Interfaces";
import { DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteParking, updateParking } from "@/app/actions/parkingServices";

interface ParkingRowProps {
    parking: IParking;
    index: number;
}

export default function ParkingRow({ parking, index }: ParkingRowProps) {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [modalDelOpen, setModalDelOpen] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const { notification } = App.useApp();

    const mUpdate = useMutation({
        mutationFn: updateParking,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['parkings'],
            });
            notification.success({
                message: 'Information mise à jour avec succès'
            });
            setIsEditMode(false);
        },
        onError: () => {
            notification.error({
                message: 'Échec lors de la modification, veuillez réessayer.'
            });
        },
    });

    const mDelete = useMutation({
        mutationFn: deleteParking,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['parkings'],
            });
            notification.success({
                message: 'Suppression du parking avec succès'
            });
            setModalDelOpen(false);
        },
        onError: () => {
            notification.error({
                message: 'Échec lors de la suppression, veuillez réessayer.'
            });
        },
    });

    const handleUpdateParking = (values: IParking) => {
        mUpdate.mutate(values);
    };

    const handleDeleteParking = () => {
        mDelete.mutate(parking);
    };

    return (
        <div className="parking-row mb-3 p-3" style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0 }}>
                    Stationnement {index}
                    <span style={{ marginLeft: '8px', color: '#999', fontSize: '14px' }}>
                        [ID = {parking.shortId}]
                    </span>
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => setModalDelOpen(true)}
                        danger
                        size="small"
                        disabled={mUpdate.isPending}
                    />
                    {isEditMode ? (
                        <Button
                            icon={mUpdate.isPending ? undefined : <CheckOutlined />}
                            onClick={() => form.submit()}
                            type="primary"
                            size="small"
                            loading={mUpdate.isPending}
                        />
                    ) : (
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setIsEditMode(true)}
                            size="small"
                        />
                    )}
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateParking}
                initialValues={parking}
                className="parking-form"
            >
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Nom"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Adresse de stationnement"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <Form.Item
                    name="address2"
                    label="Adresse complémentaire"
                >
                    <Input disabled={!isEditMode} />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    <Form.Item
                        name="zipcode"
                        label="Code postal"
                        rules={[{ required: true, message: 'Obligatoire' }]}
                    >
                        <Input disabled={!isEditMode} />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="Ville"
                        rules={[{ required: true, message: 'Obligatoire' }]}
                    >
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="country"
                    label="Pays"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input disabled={!isEditMode} />
                </Form.Item>
            </Form>

            <Modal
                title="Suppression du stationnement"
                open={modalDelOpen}
                onCancel={() => setModalDelOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalDelOpen(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        style={{backgroundColor: 'rgba(1, 66, 106, 1)'}}
                        danger
                        onClick={handleDeleteParking}
                        loading={mDelete.isPending}
                    >
                        Supprimer
                    </Button>,
                ]}
            >
                <p>Voulez-vous vraiment supprimer ce parking ?</p>
            </Modal>
        </div>
    );
}
