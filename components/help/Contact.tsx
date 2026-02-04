import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Typography, Form, Input, Select } from "antd";
import { RightOutlined } from "@ant-design/icons";

import CarmooveButton from "@/components/Common/CarmooveButton";
import { useGetVehicles, useTechnicalSupport } from "@/lib/hooks";

import "./Contact.css";
import {useQuery} from "@apollo/client/react";
import {VEHICLES_QUERY} from "@/lib/graphql/queries";

type Subject = {
    label: string;
    code: string;
    requireVehicleId: boolean;
    requireDeviceId: boolean;
};

const Contact = () => {
    const [form] = Form.useForm();

    const { vehicles } = useGetVehicles();
    const { mutate: sendMessage, loading } = useTechnicalSupport();

    const [selectedSubject, setSelectedSubject] = useState<Subject>();

    const subjectList: Subject[] = [
        {
            label: "Boitier transféré",
            code: "DEVICE_TRANSFERED",
            requireDeviceId: true,
            requireVehicleId: false,
        },
        {
            label: "Boitier trouvé",
            code: "DEVICE_FOUND",
            requireDeviceId: true,
            requireVehicleId: false,
        },
        {
            label: "Boitier volé",
            code: "STOLEN_DEVICE",
            requireDeviceId: true,
            requireVehicleId: true,
        },
        {
            label: "Erreur lors de la connexion du boitier",
            code: "DEVICE_CONNECTION_FAILED",
            requireDeviceId: true,
            requireVehicleId: true,
        },
        {
            label: "Divers",
            code: "MISCELLANEOUS",
            requireDeviceId: false,
            requireVehicleId: false,
        },
    ];

    const handleFinish = (value: any) => {
        sendMessage({
            variables: {
                mobileOsVersion: "",
                carmooveAppVersion: "",
                comment: value.commentaire,
                device_id: value.numeroDuBoitier,
                vehicle_id: value.vehicule,
                type: value.sujet,
                time: Math.floor(Date.now() / 1000),
                mobileType: "WEB",
            },
        });

        form.resetFields();
    };

    const handleChange = (code: string) => {
        setSelectedSubject(() =>
            subjectList.find((subject) => subject.code === code)
        );
    };

    return (
        <div className="contact-box mt-2">
            <h3>Pour nous contacter</h3>

            <Typography>
                Une question, un problème, une suggestion? Compléter ce formulaire pour
                nous contacter.
            </Typography>

            <Form
                form={form}
                layout="vertical"
                className="form-wrapper"
                onFinish={handleFinish}
            >
                <Form.Item
                    label="Sujet"
                    name="sujet"
                    className="form-item"
                    rules={[{ required: true, message: 'Veuillez sélectionner un sujet' }]}
                >
                    <Select placeholder="Sélectionnez le sujet" onChange={handleChange}>
                        {subjectList.map(({ label, code }) => (
                            <Select.Option key={code} value={code}>
                                {label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Véhicule concerné"
                    name="vehicule"
                    className="form-item"
                    rules={[{ required: selectedSubject?.requireVehicleId, message: 'Veuillez sélectionner un véhicule' }]}
                >
                    <Select placeholder="Sélectionnez le véhicule" disabled={!selectedSubject?.requireVehicleId && !selectedSubject?.code}>
                        {vehicles.map((vehicle: Record<string, any>) => (
                            <Select.Option
                                key={vehicle.information?.registration || vehicle.id} // Fallback safe
                                value={vehicle.id}
                            >
                                {vehicle.information?.make} {vehicle.information?.model}&nbsp;(
                                {vehicle.information?.registration})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Numéro du boitier"
                    name="numeroDuBoitier"
                    className="form-item"
                    rules={[{ required: selectedSubject?.requireDeviceId, message: 'Veuillez entrer le numéro du boitier' }]}
                >
                    <Input placeholder="Veuillez entrer le numéro du boitier" disabled={!selectedSubject?.requireDeviceId && !selectedSubject?.code} />
                </Form.Item>

                <Form.Item
                    label="Commentaire"
                    name="commentaire"
                    className="form-item"
                    rules={[{ required: true, message: 'Veuillez entrer votre message' }]}
                >
                    <Input.TextArea placeholder="Votre message" rows={5} />
                </Form.Item>

                <Form.Item shouldUpdate>
                    {() => (
                        <CarmooveButton htmlType="submit" loading={loading} style={{marginTop: '20px'}}>
                            ENVOYER
                            <RightOutlined />
                        </CarmooveButton>
                    )}
                </Form.Item>
            </Form>
        </div>
    );
};

export default Contact;
