"use client"

import { App, Button, Form, Input, Modal, Spin, Table, TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { addEquipments, Equipment, getParamEquipments } from "@/app/actions/equipmentServices";

export interface IDataEquipementType {
    id: string;
    name: string;
}

const columnsEquipement: TableColumnsType<IDataEquipementType> = [
    {
        title: 'ID',
        dataIndex: 'id',
        sorter: (a, b) => a.id.localeCompare(b.id),
        align: 'center',
        width: 150,
    },
    {
        title: 'Caractéristiques et équipements',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        align: 'center',
    },
];

export default function EquipmentList() {
    const { notification } = App.useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const qEquipments = useQuery({
        queryKey: ['equipments'],
        queryFn: async () => {
            const data = await getParamEquipments();
            return data.filter((equipment: Equipment) => !equipment.code?.startsWith('TMP'));
        }
    });

    const tableData = useMemo(() => {
        if (!qEquipments.data) return [];

        return qEquipments.data?.map((eq: Equipment) => {
            const fr = eq.translation.find(t => t.language === 'FR');

            return {
                id: eq.code,
                name: fr?.text || '-'
            };
        });
    }, [qEquipments.data]);

    const onFinish = (values: any) => {
        setLoading(true);
        const equipmentsArray = Array.isArray(values.names)
            ? values.names
            : [values.names];

        addEquipments({ equipments: equipmentsArray })
            .then(() => {
                notification.success({
                    message: 'Les équipements ont été ajoutés avec succès.'
                });
                qEquipments.refetch();
            })
            .catch((err) => {
                notification.error({
                    message: err.message || "Une erreur est survenue lors de l'ajout des équipements."
                });
            })
            .finally(() => {
                setModalOpen(false);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!modalOpen) {
            form.resetFields();
        }
    }, [modalOpen, form]);

    if (qEquipments.isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Chargement...">
                    <div style={{ height: '100px' }} />
                </Spin>
            </div>
        );
    }

    if (qEquipments.error) {
        console.error(qEquipments.error);
        return <p>Erreur lors du chargement des équipements</p>;
    }

    return (
        <div>
            <Table<IDataEquipementType>
                columns={columnsEquipement}
                dataSource={tableData}
                className="mb-4"
                rowKey="id"
                bordered
                pagination={{ pageSize: 10 }}
            />

            <Button
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                style={{ textTransform: 'uppercase', backgroundColor: 'rgba(1, 66, 106, 1)', color: 'white'}}
            >
                Ajouter un équipement
            </Button>

            <Modal
                title="Ajout d'un équipement"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                maskClosable={false}
                destroyOnHidden
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setModalOpen(false);
                            form.resetFields();
                        }}
                    >
                        Annuler
                    </Button>,
                    <Button
                        key="submit"
                        // type="primary"
                        loading={loading}
                        style={{backgroundColor: 'rgba(1, 66, 106, 1)'}}
                        onClick={() => form.submit()}
                    >
                        <PlusOutlined /> Ajouter
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    name="dynamic_form_item"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                    disabled={loading}
                >
                    <Form.List name="names">
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                {fields.map(({ key, ...field }, index) => (
                                    <Form.Item
                                        label={index === 0 ? 'Nom' : ''}
                                        required={index === 0}
                                        key={key}
                                    >
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: "Champ obligatoire",
                                                    },
                                                ]}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            >
                                                <Input placeholder="Nom de l'équipement" />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined
                                                    onClick={() => remove(field.name)}
                                                    style={{ color: '#ff4d4f' }}
                                                />
                                            )}
                                        </div>
                                    </Form.Item>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Ajouter un autre équipement
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
}
