"use client"

import { useState } from "react";
import { IParking } from "@/lib/hooks/Interfaces";
import { Form, Input, Modal, Button, App } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addParking } from "@/app/actions/parkingServices";

interface AddParkingModalProps {
    open: boolean;
    onCancel: () => void;
}

export default function AddParkingModal({ open, onCancel }: AddParkingModalProps) {
    const [form] = Form.useForm<IParking>();
    const queryClient = useQueryClient();
    const { notification } = App.useApp();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const mAdd = useMutation({
        mutationFn: addParking,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['parkings'],
            });
            notification.success({
                message: 'Ajout de stationnement avec succès'
            });
            form.resetFields();
            onCancel();
        },
        onError: () => {
            notification.error({
                message: 'Échec lors de l\'ajout de stationnement, veuillez réessayer.'
            });
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    const handleFinish = (values: IParking) => {
        setIsLoading(true);
        mAdd.mutate(values);
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Ajout d'un emplacement de stationnement"
            open={open}
            onCancel={handleCancel}
            maskClosable={false}
            destroyOnHidden
            width={600}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
                    Annuler
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={isLoading}
                    icon={isLoading ? <LoadingOutlined spin /> : <PlusOutlined />}
                    style={{ backgroundColor: 'rgba(1, 66, 106, 1)' }}
                >
                    Ajouter
                </Button>,
            ]}
        >
            <Form
                form={form}
                onFinish={handleFinish}
                layout="vertical"
                disabled={isLoading}
            >
                <Form.Item
                    name="name"
                    label="Nom"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Pare-buffle" />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Adresse"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple : 10 rue de la république" />
                </Form.Item>

                <Form.Item
                    name="address2"
                    label="Adresse complémentaire"
                >
                    <Input placeholder="Exemple : Bâtiment B" />
                </Form.Item>

                <Form.Item
                    name="zipcode"
                    label="Code postal"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple : 75010" />
                </Form.Item>

                <Form.Item
                    name="city"
                    label="Ville"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple : Paris" />
                </Form.Item>

                <Form.Item
                    name="country"
                    label="Pays"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple : France" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
