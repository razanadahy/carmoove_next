'use client'

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { Modal, notification, Spin, Switch } from "antd";
import { CheckOutlined, CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import "./VehicleInformationBox.css";

interface IProps {
    vehicle: IVehicle;
    setUnavailable?: React.Dispatch<React.SetStateAction<boolean>>;
}

function VehicleInformationBox(props: IProps) {
    const { vehicle } = props;
    const router = useRouter();

    const [modalPrivacyOpen, setModalPrivacyOpen] = useState<boolean>(false);
    const [modalSetDisponibilityOpen, setModalSetDisponibilityOpen] = useState<boolean>(false);
    const [modalStatusOpen, setModalStatusOpen] = useState<boolean>(false);

    const [unavailable, setUnavailable] = useState<boolean>(false);
    const [privacy, setPrivacy] = useState<boolean>(vehicle.status.privacy);
    const [stolen, setStolen] = useState<boolean>(false);
    const [accident, setAccident] = useState<boolean>(false);
    const [towing, setTowing] = useState<boolean>(false);
    const [fault, setFault] = useState<boolean>(false);
    const [maintenance, setMaintenance] = useState<boolean>(false);
    const [ras, setRas] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // TODO: Fetch vehicle status
        // This should be replaced with actual API call
        const fetchStatus = async () => {
            setLoading(true);
            try {
                // const status = await getVehicleStatus({
                //     vehicleId: props.vehicle.id,
                //     plate: props.vehicle.information.registration,
                // });
                // setAccident(status.state.accident);
                // setTowing(status.state.towing);
                // setStolen(status.state.stolen);
                // setFault(status.state.breakdown);
                // setMaintenance(status.state.maintenance);
                // setUnavailable(status.state.unavailable);
                // setRas(!(status.state.accident || status.state.towing || status.state.stolen || status.state.breakdown || status.state.maintenance));
            } catch (error) {
                console.error('Error fetching vehicle status:', error);
            } finally {
                setLoading(false);
            }
        };

        if (props.vehicle.device?.id) {
            fetchStatus();
        }
    }, [props.vehicle]);

    const energyTrueFormat = (energyAbrev: string | null) => {
        switch (energyAbrev) {
            case 'GO':
                return 'Diesel';
            case 'EL':
                return 'Electrique';
            case 'ES':
                return 'Essence';
            case 'ESS+ELEC HNR':
                return 'Hybride';
            default:
                return 'Inconnu';
        }
    };

    const handlePrivacyChange = async (checked: boolean) => {
        try {
            // TODO: Implement privacy update
            // await updatePrivacy({
            //     vehicleIds: [props.vehicle.id],
            //     activate: checked
            // });
            setPrivacy(checked);
            notification.success({
                message: 'Géolocalisation mise à jour avec succès'
            });
        } catch (error) {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    };

    const handleStatusChange = async (statusType: string, value: boolean) => {
        try {
            // TODO: Implement status update
            // await updateState({
            //     id: props.vehicle.id,
            //     state: statusType,
            //     value: value,
            // });

            switch (statusType) {
                case 'stolen':
                    setStolen(value);
                    break;
                case 'accident':
                    setAccident(value);
                    break;
                case 'towing':
                    setTowing(value);
                    break;
                case 'breakdown':
                    setFault(value);
                    break;
                case 'maintenance':
                    setMaintenance(value);
                    break;
                case 'unavailable':
                    setUnavailable(value);
                    if (props.setUnavailable) {
                        props.setUnavailable(value);
                    }
                    break;
            }

            notification.success({
                message: 'Statut du véhicule mis à jour'
            });
        } catch (error) {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    };

    return (
        <>
            <div className="vehicle-box mt-3 mb-0">
                <div className="info-vehicle-box mb-1">
                    <div className="vehicle-registration">
                        {vehicle.information.registration}
                    </div>
                    <span className="vehicle-info">
                        {vehicle.information.make} - {vehicle.information.model}
                        <span className="energy-info">
                            &nbsp;- {energyTrueFormat(vehicle.information.energy)}
                        </span>
                    </span>
                </div>

                <div className="vehicle-status-info">
                    {/* TODO: Add VehicleStatusInResult components */}
                    {loading && (
                        <Spin
                            style={{ alignSelf: 'center', padding: '10px' }}
                            indicator={<LoadingOutlined spin />}
                            size="small"
                        />
                    )}
                </div>

                <div className="vehicle-info-plus">
                    {vehicle?.location?.address?.address && (
                        <div className="last-localisation">
                            <strong>Dernière localisation :&nbsp;</strong>
                            <span>
                                <a onClick={() => router.push(`/maps?vehicleid=${vehicle.id}`)}>
                                    {vehicle.location.address.address},&nbsp;
                                    {vehicle.location.address.zipcode}&nbsp;
                                    {vehicle.location.address.city}
                                </a>
                                <span>
                                    &nbsp;le&nbsp;
                                    {format(new Date(vehicle.location.timestamp * 1000), "dd/MM/yyyy à HH:mm")}
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="driver-information">
                        <strong>Conducteur :&nbsp;</strong>
                        {vehicle?.driver?.driverID ? (
                            <>
                                <span className="driver-fullname">
                                    {vehicle.driver.firstName} {vehicle.driver.lastName}
                                </span>
                                <span>
                                    {vehicle.driver.email && (
                                        <span>
                                            &nbsp;-&nbsp;
                                            <a href={`mailto:${vehicle.driver.email}`}>
                                                {vehicle.driver.email}
                                            </a>
                                        </span>
                                    )}
                                    {vehicle?.driver?.phoneNumber && (
                                        <span>
                                            &nbsp;-&nbsp;
                                            <a href={`tel:${vehicle.driver.phoneNumber}`}>
                                                {vehicle.driver.phoneNumber}
                                            </a>
                                        </span>
                                    )}
                                </span>
                            </>
                        ) : (
                            <>Aucun conducteur</>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Géolocalisation */}
            <Modal
                title="Géolocalisation"
                className="icon-modal-box"
                centered
                open={modalPrivacyOpen}
                onCancel={() => setModalPrivacyOpen(false)}
                footer={[
                    <span key="label1">Géolocalisation permanente</span>,
                    <Switch
                        key="switch"
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={privacy}
                        onChange={handlePrivacyChange}
                    />,
                    <span key="label2">Smart Géolocalisation</span>,
                ]}
            >
                <strong>« Smart Géolocalisation »</strong>&nbsp;limite la localisation de votre véhicule aux cas extrêmes (accident, tentative de vol, soulèvement). En l'activant, vous ne pourrez plus repérer votre véhicule sur la carte.
                <br /><br />
                À l'inverse,&nbsp;<strong>« Géolocalisation permanente »</strong>&nbsp;localise votre véhicule à tous moments.
            </Modal>

            {/* Modal Disponibilité */}
            <Modal
                title="Disponibilité du véhicule"
                className="icon-modal-box"
                centered
                open={modalSetDisponibilityOpen}
                onCancel={() => setModalSetDisponibilityOpen(false)}
                footer={[
                    <span key="label1">Véhicule indisponible</span>,
                    <Switch
                        key="switch"
                        disabled={loading}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={!unavailable}
                        onChange={(checked) => handleStatusChange('unavailable', !checked)}
                    />,
                    <span key="label2">Véhicule disponible</span>,
                ]}
            >
                Si vous ne souhaitez pas que votre véhicule apparaisse dans les résultats de recherche concernant la réservation, vous pouvez le rendre indisponible ici.
            </Modal>

            {/* Modal Statuts */}
            <Modal
                title="Statuts du véhicule"
                className="icon-modal-box modal-status"
                centered
                open={modalStatusOpen}
                onCancel={() => setModalStatusOpen(false)}
                footer={[
                    <div key="stolen">
                        <span>Véhicule volé</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={stolen}
                            onChange={(checked) => handleStatusChange('stolen', checked)}
                        />
                    </div>,
                    <div key="accident">
                        <span>Véhicule accidenté</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={accident}
                            onChange={(checked) => handleStatusChange('accident', checked)}
                        />
                    </div>,
                    <div key="towing">
                        <span>Véhicule en fourrière</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={towing}
                            onChange={(checked) => handleStatusChange('towing', checked)}
                        />
                    </div>,
                    <div key="fault">
                        <span>Véhicule en panne</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={fault}
                            onChange={(checked) => handleStatusChange('breakdown', checked)}
                        />
                    </div>,
                    <div key="maintenance">
                        <span>Véhicule en maintenance</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={maintenance}
                            onChange={(checked) => handleStatusChange('maintenance', checked)}
                        />
                    </div>,
                ]}
            >
                Vous pouvez modifier les statuts du véhicule ci-dessous. Attention, si vous bénéficiez de la fonctionnalité de réservation, l'activation d'un de ces statuts rendra le véhicule indisponible.
            </Modal>
        </>
    );
}

export default VehicleInformationBox;
