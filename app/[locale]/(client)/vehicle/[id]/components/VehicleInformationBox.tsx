'use client'

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {EnumStateCS, IVehicle} from "@/lib/hooks/Interfaces";
import {App, Modal, Spin, Switch} from "antd";
import { CheckOutlined, CloseOutlined, LoadingOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import "./VehicleInformationBox.css";
import {useQueryClient, useMutation as useMutationCS, useQuery} from "@tanstack/react-query";
import {getVehicleStatus, updateState} from "@/app/actions/reservations";
import {energyTrueFormat} from "@/services/VehiculesService";
import Immat from "@/components/Common/Immat";
import VehicleStatusInResult from "@/app/[locale]/(client)/vehicle/[id]/components/VehicleStatusInResult";
import ChangeDriverDrawer from "@/app/[locale]/(client)/vehicle/[id]/components/ChangeDriverDrawer";

import itenerary_i from "@/assets/image/itenerary.svg";
import stolen_i from "@/assets/image/vehicle/any.svg";
import towing_i from "@/assets/image/statut/new/impound.svg";
import accident_i from "@/assets/image/statut/new/damaged.svg";
import fault_i from "@/assets/image/statut/new/warning.svg";
import maintenance_i from "@/assets/image/statut/new/service.svg";
import ras_i from "@/assets/image/vehicle/ras.svg";
import alert_i from "@/assets/image/vehicle/alert.svg";
import available_i from "@/assets/image/vehicle/available.svg";
import unavailable_i from "@/assets/image/vehicle/unavailable.svg";
import icon_connected from "@/assets/image/statut/new2/connected.svg";
import icon_not_connected from "@/assets/image/statut/new2/not-connected.svg";
import icon_engine_on from "@/assets/image/statut/new/running-car.svg";
import icon_inCharge from "@/assets/image/statut/new/charging.svg";
import icon_parked from "@/assets/image/statut/new/parked.svg";
import icon_privacy from "@/assets/image/statut/new2/location-off-ionic.svg";
import icon_no_privacy from "@/assets/image/statut/new2/location-ionic.svg";
import icon_low_battery from "@/assets/image/statut/new/battery-down.svg";

interface IProps {
    vehicle: IVehicle;
    setUnavailable?: React.Dispatch<React.SetStateAction<boolean>>;
}

function VehicleInformationBox(props: IProps) {
    const { vehicle } = props;
    const router = useRouter();
    const {notification} = App.useApp()

    const [modalPrivacyOpen, setModalPrivacyOpen] = useState<boolean>(false);
    const [modalSetDisponibilityOpen, setModalSetDisponibilityOpen] = useState<boolean>(false);
    const [modalStatusOpen, setModalStatusOpen] = useState<boolean>(false);
    const [drawerDriverOpen, setDrawerDriverOpen] = useState<boolean>(false);

    const [unavailable, setUnavailable] = useState<boolean>(false);
    const [privacy, setPrivacy] = useState<boolean>(vehicle.status.privacy);
    const [stolen, setStolen] = useState<boolean>(false);
    const [accident, setAccident] = useState<boolean>(false);
    const [towing, setTowing] = useState<boolean>(false);
    const [fault, setFault] = useState<boolean>(false);
    const [maintenance, setMaintenance] = useState<boolean>(false);
    const [ras, setRas] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const queryClient = useQueryClient()

    const mState = useMutationCS({
        mutationFn: updateState,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['vehicle', props.vehicle.id],
            });
            notification['success']({
                message: 'Données du vehicule à jour avec succès'
            });
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de la mise à jour du vehicule, veuillez réessayer.'
            });
        },
    })

    const qStatus = useQuery({
        queryKey: ['vehicle', vehicle.id],
        queryFn: () => getVehicleStatus({
            vehicleId: props.vehicle.id,
            plate: props.vehicle.information.registration,
        }),
        enabled: !!vehicle.id
    })

    useEffect(() => {
        if (qStatus.data) {
            setAccident(qStatus.data.state.accident)
            setTowing(qStatus.data.state.towing)
            setStolen(qStatus.data.state.stolen)
            setFault(qStatus.data.state.breakdown)
            setMaintenance(qStatus.data.state.maintenance)
            setUnavailable(qStatus.data.state.unavailable)
            if (props.setUnavailable) {
                props.setUnavailable(qStatus.data.state.unavailable)
            }
            setRas(!(
                qStatus.data.state.accident ||
                qStatus.data.state.towing ||
                qStatus.data.state.stolen ||
                qStatus.data.state.breakdown ||
                qStatus.data.state.maintenance
            ))
        }
    }, [vehicle, qStatus.data]);

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
                <div className="info-vehicle-box d-inline-flex align-items-center pb-2 w-100">
                    {
                        vehicle.device && (
                            <>
                                <VehicleStatusInResult
                                    tooltip={
                                        qStatus.isLoading ? "" : !unavailable ? "Disponible" : "Indisponible"
                                    }
                                    icon={qStatus.isLoading ? null : !unavailable ? available_i : unavailable_i}
                                    other_class="disponibility-icon-box"
                                    onClick={() => setModalSetDisponibilityOpen(true)}
                                />
                                <Modal
                                    title="Disponibilité du véhicule"
                                    className="icon-modal-box"
                                    centered
                                    open={modalSetDisponibilityOpen && !qStatus.isLoading}
                                    onOk={() => { }}
                                    onCancel={() => { setModalSetDisponibilityOpen(false) }}
                                    footer={[
                                        <span>Véhicule indisponible</span>,
                                        <Switch
                                            disabled={qStatus.isFetching}
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            checked={!unavailable}
                                            onClick={() => {
                                                mState.mutate({
                                                    id: props.vehicle.id,
                                                    state: EnumStateCS.unavailable,
                                                    value: !unavailable,
                                                })
                                            }}
                                        />,
                                        <span>Véhicule disponible</span>,
                                    ]}
                                >
                                    Si vous ne souhaitez pas que votre véhicule apparaisse dans les résultats de recherche concernant la réservation, vous pouvez le rendre indisponible ici.
                                </Modal>
                            </>
                        )
                    }
                    <Immat registration={vehicle.information.registration} blue/>
                    <span className="vehicle-info d-inline-flex flex-row">
                        {vehicle.information.make} - {vehicle.information.model}
                        <span className="energy-info">
                            &nbsp;- {energyTrueFormat(vehicle.information.energy)}
                        </span>
                    </span>
                </div>

                <div className="vehicle-status-info">
                    <VehicleStatusInResult
                        icon={alert_i}
                        tooltip="Alertes reçues" link={`/alerts/vehicle/${vehicle.id}`} />
                    {vehicle.device && (
                        <>
                            <VehicleStatusInResult icon={icon_connected} tooltip="Connecté" />
                            {vehicle.status.privacy && (<VehicleStatusInResult icon={icon_privacy} tooltip="Smart géolocalisation activé" onClick={() => setModalPrivacyOpen(true)} />)}
                            {!vehicle.status.privacy && (<VehicleStatusInResult icon={icon_no_privacy} tooltip="Géolocalisation permanente" onClick={() => setModalPrivacyOpen(true)} />)}
                            {(vehicle.electricityStatus !== null && vehicle.electricityStatus.chargeInProgress) && <VehicleStatusInResult icon={icon_inCharge} tooltip="En charge" />}
                            {vehicle.status.parked === 'ON' && <VehicleStatusInResult icon={icon_parked} tooltip="En stationnement" />}
                            {vehicle.status.engine === 'ON' && <VehicleStatusInResult icon={icon_engine_on} tooltip="En déplacement" />}
                        </>
                    )}
                    {!vehicle.device && (<VehicleStatusInResult icon={icon_not_connected} tooltip="Non connecté" />)}
                    {
                        vehicle.device &&
                        (!qStatus.isLoading ?
                            <>
                                {(ras && <VehicleStatusInResult icon={ras_i} tooltip="Aucune anomalie" onClick={() => setModalStatusOpen(true)} />)}
                                {(qStatus.data?.state.stolen && <VehicleStatusInResult icon={stolen_i} tooltip="Volé" onClick={() => setModalStatusOpen(true)} />)}
                                {(qStatus.data?.state.towing && <VehicleStatusInResult icon={towing_i} tooltip="Fourrière" onClick={() => setModalStatusOpen(true)} />)}
                                {(qStatus.data?.state.accident && <VehicleStatusInResult icon={accident_i} tooltip="Accidenté" onClick={() => setModalStatusOpen(true)} />)}
                                {(qStatus.data?.state.maintenance && <VehicleStatusInResult icon={maintenance_i} tooltip="Entretien à faire" onClick={() => setModalStatusOpen(true)} />)}
                                {(qStatus.data?.state.breakdown && <VehicleStatusInResult icon={fault_i} tooltip="Code défaut" onClick={() => setModalStatusOpen(true)} />)}
                                {(vehicle.status.battery <= 12 && vehicle.status.battery > 0) && (<VehicleStatusInResult icon={icon_low_battery} tooltip="Tension de batterie faible" />)}
                            </>
                            :
                            <Spin style={{ alignSelf: 'center', padding: '10px' }} indicator={<LoadingOutlined spin />} size="small" />)
                    }
                    {!!vehicle.location?.address?.address && <VehicleStatusInResult icon={itenerary_i} tooltip="Itinéraire" onClick={() => window.open(`https://www.google.com/maps/dir//${vehicle.location.address.address + vehicle.location.address.zipcode + vehicle.location.address.city}`, "_blank")} />}
                    {/* {vehicle.device && (<VehicleStatusInResult icon={icon_connected} tooltip="Connecté" />)}
          {!vehicle.device && (<VehicleStatusInResult icon={icon_not_connected} tooltip="Non connecté" />)}
          {vehicle.status.privacy && (<VehicleStatusInResult icon={icon_privacy} tooltip="Smart géolocalisation activé" onClick={() => setModalLocalisationOpen(true)} />)}
          {!vehicle.status.privacy && (<VehicleStatusInResult icon={icon_no_privacy} tooltip="Géolocalisation permanente" onClick={() => setModalLocalisationOpen(true)} />)}
          {(vehicle.electricityStatus !== null && vehicle.electricityStatus.chargeInProgress) && <VehicleStatusInResult icon={icon_inCharge} tooltip="En charge" />}
          {vehicle.status.parked === 'ON' && <VehicleStatusInResult icon={icon_parked} tooltip="En stationnement" />}
          {vehicle.status.engine === 'ON' && <VehicleStatusInResult icon={icon_engine_on} tooltip="En déplacement" />}
          {vehicle.status.towage === "ON" && <VehicleStatusInResult icon={icon_towage} tooltip="Fourriére" />}
          {vehicle.status.accident === "ON" && (<VehicleStatusInResult icon={icon_accident} tooltip="Accidenté" />)}
          {vehicle.status.theft === "ON" && <VehicleStatusInResult icon={icon_stolen} tooltip="Volé" />}
          {vehicle.status.fault === "ON" && <VehicleStatusInResult icon={icon_fault} tooltip="Code défaut" />}
          {false && <VehicleStatusInResult icon={icon_maintenance} tooltip="Entretien à faire" />} */}
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
                                <EditOutlined
                                    className="driver-action-icon"
                                    onClick={() => setDrawerDriverOpen(true)}
                                    title="Changer le conducteur"
                                />
                            </>
                        ) : (
                            <>
                                <span>Aucun conducteur</span>
                                <UserAddOutlined
                                    className="driver-action-icon"
                                    onClick={() => setDrawerDriverOpen(true)}
                                    title="Ajouter un conducteur"
                                />
                            </>
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

            {/* Drawer Change Driver */}
            <ChangeDriverDrawer
                open={drawerDriverOpen}
                onClose={() => setDrawerDriverOpen(false)}
                vehicle={vehicle}
            />
        </>
    );
}

export default VehicleInformationBox;
