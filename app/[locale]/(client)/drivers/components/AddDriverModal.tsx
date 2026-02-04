"use client"

import { Form, Input, Switch, Checkbox, Button, Modal, Tooltip, App } from "antd";
import { RightOutlined, InfoCircleOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useRegisterDriver } from "@/lib/hooks";

const { TextArea } = Input;

interface AddDriverModalProps {
    open: boolean;
    onCancel: () => void;
}

export default function AddDriverModal({ open, onCancel }: AddDriverModalProps) {
    const [form] = Form.useForm();

    const { registerDriver, loading } = useRegisterDriver(() => {
        form.resetFields();
        onCancel();
    });

    const handleFinish = (values: any) => {
        registerDriver({ variables: values });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={<h2 style={{ margin: 0 }}>Ajout d'un Conducteur</h2>}
            open={open}
            onCancel={handleCancel}
            maskClosable={false}
            destroyOnHidden={true}
            width={700}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>
                    Annuler
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                    icon={<RightOutlined />}
                    style={{ backgroundColor: 'rgba(1, 66, 106, 1)' }}
                >
                    AJOUTER
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                disabled={loading}
                initialValues={{
                    privacy: false,
                    createAccount: false,
                }}
            >
                <Form.Item
                    label="Nom"
                    name="lastName"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple: Durant" />
                </Form.Item>

                <Form.Item
                    label="Prénom"
                    name="firstName"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Exemple: Jean" />
                </Form.Item>

                <Form.Item
                    label="Numéro de carte RFID (Badge...)"
                    name="badgeId"
                >
                    <Input placeholder="Exemple: AA204209" />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Permis de conduire{' '}
                            <Tooltip title="Cela nous permet de pré-remplir certains documents administratifs pour vous faire gagner du temps (amendes, constats, etc).">
                                <InfoCircleOutlined style={{ color: '#999' }} />
                            </Tooltip>
                        </span>
                    }
                    name="licenceNumber"
                >
                    <Input placeholder="Exemple : 911091204209" />
                </Form.Item>

                <Form.Item
                    label="Date d'obtention du permis de conduire"
                    name="licenseDate"
                >
                    <Input type="date" />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Téléphone mobile{' '}
                            <Tooltip title="Il sera utilisé par exemple par les services d'urgence en cas d'accident.">
                                <InfoCircleOutlined style={{ color: '#999' }} />
                            </Tooltip>
                        </span>
                    }
                    name="phoneNumber"
                    rules={[
                        { required: true, message: 'Champ obligatoire' },
                    ]}
                >
                    <Input type="tel" placeholder="Exemple : +33 6 87 00 99 76" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Champ obligatoire' },
                        { type: 'email', message: 'Email invalide' }
                    ]}
                >
                    <Input type="email" placeholder="Exemple: jean.durant@email.com" />
                </Form.Item>

                <Form.Item
                    label="Commentaire"
                    name="comment"
                >
                    <TextArea rows={4} placeholder="Informations complémentaires..." />
                </Form.Item>

                <Form.Item
                    label={
                        <span>
                            Confidentialité de localisation{' '}
                            <Tooltip title="En mode confidentiel, vous désactivez la localisation du véhicule et toutes les fonctionnalités associées, quel que soit le réglage du véhicule que vous utilisez">
                                <InfoCircleOutlined style={{ color: '#999' }} />
                            </Tooltip>
                        </span>
                    }
                    name="privacy"
                    valuePropName="checked"
                    extra="Je souhaite désactiver la localisation quelque soit le réglage du véhicule"
                >
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                    />
                </Form.Item>

                <Form.Item
                    name="createAccount"
                    valuePropName="checked"
                >
                    <Checkbox>
                        Créer un compte utilisateur pour ce conducteur
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}
