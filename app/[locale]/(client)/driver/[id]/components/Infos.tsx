"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Modal, Switch, App, Spin, Tag } from "antd";
import { RightOutlined, CheckOutlined, CloseOutlined, LoadingOutlined, DeleteOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
    CREATE_DRIVER_ACCOUNT,
    DELETE_DRIVER,
    DRIVER_MUTATION,
    DRIVER_PRIVACY_MUTATION,
    USER_ACTIVATION,
} from "@/lib/graphql/mutation";
import { DRIVER_QUERY, DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver } from "@/lib/hooks/Interfaces";

import "./Info.css";
import {useQueryClient} from "@tanstack/react-query";

const { TextArea } = Input;

interface InfosProps {
    driver: IDriver;
}

export default function Infos({ driver }: InfosProps) {
    const [modalStatusAccountOpen, setModalStatusAccountOpen] = useState<boolean>(false);
    const [modalPrivacyOpen, setModalPrivacyOpen] = useState<boolean>(false);
    const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [privacy, setPrivacy] = useState<boolean>(!!driver.privacy);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const router = useRouter();
    const { notification } = App.useApp();
    const queryClient = useQueryClient();

    const { loading: loadingDrivers, error, data: dataDrivers } = useQuery(DRIVERS_QUERY, {
        pollInterval: 300000,
        context: {
            version: "php",
        },
    });

    const [driverMutate, { loading }] = useMutation(DRIVER_MUTATION, {
        refetchQueries: [
            {
                query: DRIVER_QUERY,
                variables: {
                    id: driver?.driverID,
                },
                context: {
                    version: "php",
                },
            },
            {
                query: DRIVERS_QUERY,
            },
        ],
        awaitRefetchQueries: true,
        onCompleted: () => {
            setIsLoading(false);
            notification.success({
                message: "Ce conducteur a été mis à jour.",
            });
        },
        onError: (e) => {
            console.error("DRIVER_MUTATION error:", e);
            setIsLoading(false);
            notification.error({
                message: "Erreur lors de la modification du conducteur",
            });
        },
    });

    const [privacyMutate] = useMutation(DRIVER_PRIVACY_MUTATION, {
        refetchQueries: [
            {
                query: DRIVER_QUERY,
                variables: {
                    id: driver?.driverID,
                },
                context: {
                    version: "php",
                },
            },
            {
                query: DRIVERS_QUERY,
            },
        ],
    });

    const [createDriverAccountMutate] = useMutation(CREATE_DRIVER_ACCOUNT, {
        refetchQueries: [
            {
                query: DRIVER_QUERY,
                variables: {
                    id: driver?.driverID,
                },
                context: {
                    version: "php",
                },
            },
            {
                query: DRIVERS_QUERY,
            },
        ],
        onCompleted: () => {
            setModalStatusAccountOpen(false);
            setIsLoading(false);
            notification.success({
                message: "Le compte utilisateur a été créé avec succès. Il va recevoir une notification par email.",
            });
        },
        onError: () => {
            setModalStatusAccountOpen(false);
            setIsLoading(false);
            notification.error({
                message: "Une erreur s'est produite."
            });
        }
    });

    const [userActivationMutate] = useMutation(USER_ACTIVATION, {
        context: {
            version: "php",
        },
        refetchQueries: [
            {
                query: DRIVER_QUERY,
                variables: {
                    id: driver?.driverID,
                },
                context: {
                    version: "php",
                },
            },
            {
                query: DRIVERS_QUERY,
            },
        ],
        awaitRefetchQueries: true,
        onCompleted: (data) => {
            setModalStatusAccountOpen(false);
            setIsLoading(false);
            notification.success({
                message: data?.userActivation.accountStatus.enabled
                    ? "Le compte utilisateur a été activé avec succès."
                    : "Le compte utilisateur a été désactivé avec succès.",
            });
        },
        onError: () => {
            setModalStatusAccountOpen(false);
            setIsLoading(false);
            notification.error({
                message: "Une erreur s'est produite."
            });
        }
    });

    const [deleteDriverMutate, { loading: deleteDriverLoading }] = useMutation(DELETE_DRIVER, {
        refetchQueries: [
            {
                query: DRIVERS_QUERY,
            },
        ],
        awaitRefetchQueries: true,
        variables: {
            driverId: driver?.driverID
        },
        onCompleted: () => {
            setModalDeleteOpen(false);
            setIsLoading(false);
            notification.info({
                message: "Ce conducteur a bien été supprimé.",
            });
            router.push("/drivers");
        },
        onError: () => {
            setModalDeleteOpen(false);
            setIsLoading(false);
            notification.error({
                message: "Ce conducteur n'a pas été supprimé !"
            });
        }
    });

    if (loadingDrivers) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Chargement...">
                    <div style={{ height: '100px' }} />
                </Spin>
            </div>
        );
    }

    if (error) {
        return <p>Erreur lors du chargement des données</p>;
    }

    const drivers: IDriver[] = JSON.parse(JSON.stringify(dataDrivers.drivers));
    const vehicle = drivers.filter(d => d.driverID === driver.driverID)[0]?.vehicle;

    const handleFinish = (values: IDriver) => {
        setIsLoading(true);
        privacyMutate({
            variables: {
                driverID: driver.driverID,
                activate: privacy,
            },
        });

        driverMutate({
            variables: {
                ...values,
                driverId: driver.driverID,
            },
        });
    };

    const handleDelete = () => {
        setIsLoading(true);
        deleteDriverMutate();
    };

    const handleUserActivation = (state: boolean) => {
        setIsLoading(true);
        userActivationMutate({
            variables: {
                id: driver.driverID,
                active: state
            }
        });
    };

    const handleCreateDriverAccount = () => {
        setIsLoading(true);
        createDriverAccountMutate({
            variables: {
                driverId: driver.driverID,
            },
        });
    };

    return (
        <div className="driver-info-container">
            <div className="driver-header mb-4">
                <h2 style={{ margin: 0 }}>
                    {driver.firstName} {driver.lastName}
                </h2>
                <div className="driver-status-icons" style={{ display: 'flex', gap: '8px' }}>
                    <Tag
                        color={privacy ? "blue" : "green"}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setModalPrivacyOpen(true)}
                    >
                        <EnvironmentOutlined />
                        {privacy ? "Smart Géo" : "Géo permanente"}
                    </Tag>

                    {driver.accountStatus.accountCreated && driver.accountStatus.enabled && (
                        <Tag color="success" style={{ cursor: 'pointer' }} onClick={() => setModalStatusAccountOpen(true)}>
                            Compte actif
                        </Tag>
                    )}
                    {driver.accountStatus.accountCreated && !driver.accountStatus.enabled && (
                        <Tag color="error" style={{ cursor: 'pointer' }} onClick={() => setModalStatusAccountOpen(true)}>
                            Compte désactivé
                        </Tag>
                    )}
                    {!driver.accountStatus.accountCreated && (
                        <Tag color="default" style={{ cursor: 'pointer' }} onClick={() => setModalStatusAccountOpen(true)}>
                            Pas de compte
                        </Tag>
                    )}
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={driver}
                disabled={loading || isLoading}
            >
                <Form.Item
                    name="lastName"
                    label="Nom"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Nom" />
                </Form.Item>

                <Form.Item
                    name="firstName"
                    label="Prénom"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                >
                    <Input placeholder="Prénom" />
                </Form.Item>

                <Form.Item
                    name="badgeId"
                    label="Numéro de carte RFID (Badge...)"
                >
                    <Input placeholder="Exemple: AA204209" />
                </Form.Item>

                <Form.Item
                    name="licenceNumber"
                    label="Numéro de permis de conduire"
                    tooltip="Cela nous permet de pré-remplir certains documents administratifs pour vous faire gagner du temps (amendes, constats, etc)."
                >
                    <Input placeholder="Exemple: 911091204209" />
                </Form.Item>

                <Form.Item
                    name="licenseDate"
                    label="Date d'obtention du permis de conduire"
                >
                    <Input type="date" />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label="Téléphone mobile"
                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                    tooltip="Il sera utilisé par exemple par les services d'urgence en cas d'accident."
                >
                    <Input placeholder="Téléphone mobile" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Champ obligatoire' },
                        { type: 'email', message: 'Email invalide' }
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    label="Véhicule"
                >
                    <div className="driver-vehicle-information">
                        <span>{vehicle ? `${vehicle.information.make} - ${vehicle.information.model}` : 'Aucun véhicule assigné'}</span>
                        {vehicle && (
                            <Tag color="blue">{vehicle.information.registration}</Tag>
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    name="comment"
                    label="Commentaire"
                >
                    <TextArea rows={4} placeholder="Informations complémentaires..." />
                </Form.Item>

                <Form.Item style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="me-2"
                        loading={loading || isLoading}
                        icon={<RightOutlined />}
                        style={{ backgroundColor: 'rgba(1, 66, 106, 1)' }}
                        size="large"
                    >
                        METTRE À JOUR
                    </Button>
                    <Button
                        danger
                        onClick={() => setModalDeleteOpen(true)}
                        icon={<DeleteOutlined />}
                        size="large"
                    >
                        SUPPRIMER
                    </Button>
                </Form.Item>
            </Form>

            {/* Modal Géolocalisation */}
            <Modal
                title="Géolocalisation"
                open={modalPrivacyOpen}
                onCancel={() => setModalPrivacyOpen(false)}
                footer={[
                    <div key="footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                        <span>Géolocalisation permanente</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={privacy}
                            onChange={(e) => setPrivacy(e)}
                        />
                        <span>Smart Géolocalisation</span>
                    </div>
                ]}
            >
                <p>
                    <strong>« Smart Géolocalisation »</strong> limite la localisation de votre véhicule aux cas extrêmes
                    (accident, tentative de vol, soulèvement). En l'activant, vous ne pourrez plus repérer votre véhicule sur la carte.
                </p>
                <p>
                    À l'inverse, <strong>« Géolocalisation permanente »</strong> localise votre véhicule à tous moments.
                </p>
            </Modal>

            {/* Modal Statut du compte */}
            <Modal
                title="Statut de compte"
                open={modalStatusAccountOpen}
                onCancel={() => setModalStatusAccountOpen(false)}
                footer={[
                    !driver.accountStatus.accountCreated ? (
                        <Button
                            key="create"
                            type="primary"
                            disabled={isLoading}
                            onClick={handleCreateDriverAccount}
                            loading={isLoading}
                        >
                            Créer un compte utilisateur
                        </Button>
                    ) : driver.accountStatus.enabled ? (
                        <Button
                            key="disable"
                            type="primary"
                            danger
                            disabled={isLoading}
                            onClick={() => handleUserActivation(false)}
                            loading={isLoading}
                        >
                            Désactiver le compte utilisateur
                        </Button>
                    ) : (
                        <Button
                            key="enable"
                            type="primary"
                            disabled={isLoading}
                            onClick={() => handleUserActivation(true)}
                            loading={isLoading}
                        >
                            Activer le compte utilisateur
                        </Button>
                    )
                ]}
            >
                {driver.accountStatus.accountCreated && driver.accountStatus.enabled && (
                    <p>Le conducteur dispose d'un compte utilisateur actif, lui permettant de se connecter aux applications.</p>
                )}
                {driver.accountStatus.accountCreated && !driver.accountStatus.enabled && (
                    <p>Le conducteur dispose d'un compte utilisateur qui a été désactivé. Il ne peut plus se connecter aux applications.</p>
                )}
                {!driver.accountStatus.accountCreated && (
                    <p>Le conducteur existe mais aucun compte utilisateur n'a été créé, il ne peut pas se connecter aux applications.</p>
                )}
            </Modal>

            {/* Modal Suppression */}
            <Modal
                title="Veuillez confirmer la suppression"
                open={modalDeleteOpen}
                onCancel={() => setModalDeleteOpen(false)}
                confirmLoading={deleteDriverLoading}
                footer={[
                    <Button key="cancel" onClick={() => setModalDeleteOpen(false)}>
                        Non, annuler
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleDelete}
                        loading={deleteDriverLoading}
                    >
                        Oui, confirmer
                    </Button>,
                ]}
            >
                <p>
                    Vous êtes sur le point de supprimer un conducteur et l'ensemble de ses données, sans restauration possible.
                    Voulez-vous vraiment supprimer ce conducteur?
                </p>
            </Modal>
        </div>
    );
}
