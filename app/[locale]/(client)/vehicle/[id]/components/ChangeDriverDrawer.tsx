'use client'

import React, { useState } from 'react';
import { Button, Drawer, Input, Spin, App, Modal } from 'antd';
import { RightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { IVehicle } from '@/lib/hooks/Interfaces';
import { useQuery, useMutation } from '@apollo/client';
import { DRIVERS_QUERY, VEHICLES_QUERY } from '@/lib/graphql/queries';
import { VEHICLE_DRIVER_MUTATION } from '@/lib/graphql/mutation';
import './ChangeDriverDrawer.css';
import AddDriverModal from "@/app/[locale]/(client)/drivers/components/AddDriverModal";

interface IDriver {
    driverID: string;
    firstName: string;
    lastName: string;
}

interface ChangeDriverDrawerProps {
    open: boolean;
    onClose: () => void;
    vehicle: IVehicle;
}

function ChangeDriverDrawer({ open, onClose, vehicle }: ChangeDriverDrawerProps) {
    const [searchText, setSearchText] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<IDriver | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { notification } = App.useApp();

    const { loading, error, data } = useQuery(DRIVERS_QUERY, {
        pollInterval: 0,
    });

    const [associateDriverToVehicle, { loading: mutationLoading }] = useMutation(
        VEHICLE_DRIVER_MUTATION,
        {
            awaitRefetchQueries: true,
            refetchQueries: [
                {
                    query: VEHICLES_QUERY,
                    context: {
                        version: 'php'
                    }
                }
            ],
            onCompleted: (data) => {
                notification.success({
                    message: 'Conducteur associé avec succès'
                });
                setConfirmModalOpen(false);
                setSelectedDriver(null);
                onClose();
            },
            onError: (error) => {
                notification.error({
                    message: 'Erreur lors de l\'association du conducteur',
                    description: error.message
                });
                setConfirmModalOpen(false);
                setSelectedDriver(null);
            }
        }
    );

    const handleSelectDriver = (driver: IDriver) => {
        setSelectedDriver(driver);
        setConfirmModalOpen(true);
    };

    const handleConfirmAssociation = async () => {
        if (!selectedDriver) return;

        try {
            await associateDriverToVehicle({
                variables: {
                    vehicleId: vehicle.id,
                    driverId: selectedDriver.driverID,
                }
            });
        } catch (error) {
            console.error('Error associating driver:', error);
        }
    };

    const handleAddDriver = () => {
        onClose();
        setModalOpen(true);
    };

    if (loading) {
        return (
            <Drawer
                title="Sélection du conducteur"
                placement="right"
                onClose={onClose}
                open={open}
                width={400}
                className="change-driver-drawer"
            >
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" tip="Chargement des conducteurs..." />
                </div>
            </Drawer>
        );
    }

    if (error) {
        return (
            <Drawer
                title="Sélection du conducteur"
                placement="right"
                onClose={onClose}
                open={open}
                width={400}
                className="change-driver-drawer"
            >
                <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                    Erreur lors du chargement des conducteurs
                </div>
            </Drawer>
        );
    }

    const drivers: IDriver[] = data?.drivers ? JSON.parse(JSON.stringify(data.drivers)) : [];

    const regExp = new RegExp(searchText, 'gi');
    const filteredDrivers = drivers
        .filter(driver =>
            driver.firstName.match(regExp) || driver.lastName.match(regExp)
        )
        .sort((a, b) => {
            if (a.lastName < b.lastName) return -1;
            if (a.lastName > b.lastName) return 1;
            if (a.firstName < b.firstName) return -1;
            if (a.firstName > b.firstName) return 1;
            return 0;
        });

    return (
        <Drawer
            title="Sélection du conducteur"
            placement="right"
            onClose={onClose}
            open={open}
            width={400}
            className="change-driver-drawer"
        >
            <div className="driver-selector">
                <div className="search-container">
                    <Input
                        type="text"
                        className="search-field"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Rechercher un conducteur"
                    />
                </div>

                <div className="driver-list">
                    {filteredDrivers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                            {searchText ? 'Aucun conducteur trouvé' : 'Aucun conducteur disponible'}
                        </div>
                    ) : (
                        filteredDrivers.map((driver) => (
                            <div className="driver-row" key={driver.driverID}>
                                <button
                                    className="driver-button"
                                    onClick={() => handleSelectDriver(driver)}
                                >
                                    {driver.firstName} - {driver.lastName}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="driver-selector-add">
                <Button
                    type="primary"
                    className="custom-button"
                    onClick={handleAddDriver}
                    icon={<RightOutlined />}
                    iconPosition="end"
                    style={{ backgroundColor: 'rgba(1, 66, 106, 1)' }}
                >
                    AJOUTER UN CONDUCTEUR
                </Button>
                <AddDriverModal
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                />
            </div>

            {/* Modal de confirmation */}
            <Modal
                title={
                    <span>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                        Confirmer l'association
                    </span>
                }
                open={confirmModalOpen}
                onOk={handleConfirmAssociation}
                onCancel={() => {
                    setConfirmModalOpen(false);
                    setSelectedDriver(null);
                }}
                okText="Confirmer"
                cancelText="Annuler"
                confirmLoading={mutationLoading}
                okButtonProps={{
                    style: { backgroundColor: 'rgba(1, 66, 106, 1)' }
                }}
            >
                {selectedDriver && (
                    <p>
                        Voulez-vous vraiment associer le conducteur{' '}
                        <strong>{selectedDriver.firstName} {selectedDriver.lastName}</strong>{' '}
                        à ce véhicule ?
                    </p>
                )}
            </Modal>
        </Drawer>
    );
}

export default ChangeDriverDrawer;
