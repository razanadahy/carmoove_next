'use client'

import { useEffect, useState } from "react";
import { Button, Modal, Space, App } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IVehicle, EnumImmobilizerStatusCS, EnumLockStatusCS, EnumAction } from "@/lib/hooks/Interfaces";
import {
    getVehicleStatus,
    getActionsList,
    updateHonkSecurity,
    updateImmobilizationSecurity,
    updateLockSecurity,
    updatLightOnSecurity,
    updatUnlockTrunkSecurity
} from "@/app/actions/reservations";
import { Loading } from "@/components/Common/Loading";
import ActionSecurityIcon from "./ActionSecurityIcon";
import AndroidLogo from "./AndroidLogo";

// Icons
import noIcon from "@/assets/image/vehicle/gestion/no.svg";
import yesIcon from "@/assets/image/vehicle/gestion/yes.svg";
import warningIcon from "@/assets/image/vehicle/gestion/warning.svg";
import immobilizeIcon from "@/assets/image/vehicle/gestion/action/immobilize.svg";
import notImmobilizeIcon from "@/assets/image/vehicle/gestion/action/not-immobilize.svg";
import lockIcon from "@/assets/image/vehicle/gestion/action/lock.svg";
import unlockIcon from "@/assets/image/vehicle/gestion/action/unlock.svg";
import trunkOpenIcon from "@/assets/image/vehicle/gestion/action/trunk-open.svg";
import trumpetIcon from "@/assets/image/vehicle/gestion/action/trumpet.svg";
import lightIcon from "@/assets/image/vehicle/gestion/action/light.svg";
import googlePlayIcon from "@/assets/image/vehicle/gestion/google-play-icon.svg";
import appleStoreIcon from "@/assets/image/vehicle/gestion/apple-store-icon.svg";

import "./GestionVehicle.css";

interface ICardHolder {
    id: string;
    status: string;
}

interface GestionVehicleProps {
    vehicle: IVehicle;
}

export const GestionVehicle = ({ vehicle }: GestionVehicleProps) => {
    const { notification } = App.useApp();
    const queryClient = useQueryClient();

    const [isImmobilized, setIsImmobilized] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [cardsHolder, setCardsHolder] = useState<ICardHolder[]>([]);
    const [cardHolder1, setCardHolder1] = useState<ICardHolder | null>(null);
    const [cardHolder2, setCardHolder2] = useState<ICardHolder | null>(null);
    const [vehicleKey, setVehicleKey] = useState(false);
    const [modalKeyOpen, setModalKeyOpen] = useState(false);
    const [modalRFIDOpen, setModalRFIDOpen] = useState(false);
    const [isLoadingImmobilisationState, setIsLoadingImmobilisationState] = useState(false);
    const [isLoadingLockedState, setIsLoadingLockedState] = useState(false);

    const qVehicleStatus = useQuery({
        queryKey: ['vehicle', vehicle.id],
        queryFn: () => getVehicleStatus({
            vehicleId: vehicle.id,
            plate: vehicle.information.registration,
        }),
    });

    const qActionsList = useQuery({
        queryKey: ['actionsList', vehicle.id],
        queryFn: () => getActionsList({ id: vehicle.id }),
    });

    useEffect(() => {
        if (qVehicleStatus.isSuccess && qVehicleStatus.data) {
            const allCardHolder: ICardHolder[] = qVehicleStatus.data.cardHolder ?? [];
            setCardsHolder([...allCardHolder]);
            setCardHolder1(allCardHolder.find(card => card.id === "card_1") || null);
            setCardHolder2(allCardHolder.find(card => card.id === "card_2") || null);
            setVehicleKey(qVehicleStatus.data.vehicleKey);
            setIsImmobilized(qVehicleStatus.data.immobilizer === EnumImmobilizerStatusCS.LOCKED);
            setIsLocked(qVehicleStatus.data.lock === EnumLockStatusCS.LOCKED);
            setIsLoadingImmobilisationState(false);
            setIsLoadingLockedState(false);
        }
    }, [qVehicleStatus.isSuccess, qVehicleStatus.data]);

    const mImmobilize = useMutation({
        mutationFn: updateImmobilizationSecurity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
            notification.success({ message: 'Commande exécutée avec succès' });
        },
        onError: () => {
            setIsLoadingImmobilisationState(false);
            notification.error({ message: "Erreur dans l'exécution de la commande, veuillez réessayer" });
        },
    });

    const mHonk = useMutation({
        mutationFn: updateHonkSecurity,
        onSuccess: () => {
            notification.success({ message: 'Commande exécutée avec succès' });
        },
        onError: () => {
            notification.error({ message: "Erreur dans l'exécution de la commande, veuillez réessayer" });
        },
    });

    const mLock = useMutation({
        mutationFn: updateLockSecurity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
            notification.success({ message: 'Commande exécutée avec succès' });
        },
        onError: () => {
            setIsLoadingLockedState(false);
            notification.error({ message: "Erreur dans l'exécution de la commande, veuillez réessayer" });
        },
    });

    const mUnlockTrunk = useMutation({
        mutationFn: updatUnlockTrunkSecurity,
        onSuccess: () => {
            notification.success({ message: 'Commande exécutée avec succès' });
        },
        onError: () => {
            notification.error({ message: "Erreur dans l'exécution de la commande, veuillez réessayer" });
        },
    });

    const mLightOn = useMutation({
        mutationFn: updatLightOnSecurity,
        onSuccess: () => {
            notification.success({ message: 'Commande exécutée avec succès' });
        },
        onError: () => {
            notification.error({ message: "Erreur dans l'exécution de la commande, veuillez réessayer" });
        },
    });

    const handleImmobilizer = () => {
        setIsLoadingImmobilisationState(true);
        mImmobilize.mutate({ vehicleId: vehicle.id, value: !isImmobilized });
    };

    const handleLock = () => {
        setIsLoadingLockedState(true);
        mLock.mutate({ vehicleId: vehicle.id, value: !isLocked });
    };

    const handleUnlockTrunk = () => {
        mUnlockTrunk.mutate({ vehicleId: vehicle.id });
    };

    const handleLightClick = () => {
        mLightOn.mutate({ vehicleId: vehicle.id });
    };

    const handleHonk = () => {
        mHonk.mutate({ vehicleId: vehicle.id });
    };

    return (
        <Space className="main-content-gestion-vehicle" direction="vertical" size="large" style={{ display: 'flex' }}>
            <h2>Gérez votre véhicule</h2>
            <div className="gestion-main-box">
                <div className="title-box-state-action">
                    {qVehicleStatus.isLoading && <Loading msg="Chargement..." />}
                    {qVehicleStatus.data && (
                        <>
                            <span className="title-state-action">
                                Clé :{" "}
                                <img
                                    className="icon-cle-rfid"
                                    src={vehicleKey ? yesIcon.src : noIcon.src}
                                    alt="Clé"
                                    onClick={() => setModalKeyOpen(true)}
                                />
                            </span>
                            <span className="title-state-action">
                                Carte RFID 1 :{" "}
                                <img
                                    className="icon-cle-rfid"
                                    src={
                                        cardHolder1?.status === "PRESENT"
                                            ? yesIcon.src
                                            : cardHolder1
                                            ? noIcon.src
                                            : warningIcon.src
                                    }
                                    alt="RFID1"
                                    onClick={() => setModalRFIDOpen(true)}
                                />
                            </span>
                            <span className="title-state-action">
                                Carte RFID 2 :{" "}
                                <img
                                    className="icon-cle-rfid"
                                    src={
                                        cardHolder2?.status === "PRESENT"
                                            ? yesIcon.src
                                            : cardHolder2
                                            ? noIcon.src
                                            : warningIcon.src
                                    }
                                    alt="RFID2"
                                    onClick={() => setModalRFIDOpen(true)}
                                />
                            </span>
                        </>
                    )}
                </div>

                <div className="action-security-box">
                    {qActionsList.isLoading ? (
                        <Loading msg="Chargement des actions disponibles..." />
                    ) : (
                        <>
                            {qActionsList.data?.actions.includes(EnumAction.IMMOBILIZE) && (
                                <ActionSecurityIcon
                                    label={isImmobilized ? "Libérer véhicule" : "Immobiliser véhicule"}
                                    icon={isImmobilized ? notImmobilizeIcon.src : immobilizeIcon.src}
                                    onClick={handleImmobilizer}
                                    isLoading={isLoadingImmobilisationState}
                                />
                            )}
                            {qActionsList.data?.actions.includes(EnumAction.CENTRAL_LOCK) && (
                                <ActionSecurityIcon
                                    label={isLocked ? "Ouvrir portes" : "Fermer portes"}
                                    icon={isLocked ? unlockIcon.src : lockIcon.src}
                                    onClick={handleLock}
                                    isLoading={isLoadingLockedState}
                                />
                            )}
                            {qActionsList.data?.actions.includes(EnumAction.UNLOCK_TRUNK) && (
                                <ActionSecurityIcon
                                    label="Ouvrir coffre"
                                    icon={trunkOpenIcon.src}
                                    onClick={handleUnlockTrunk}
                                />
                            )}
                            {qActionsList.data?.actions.includes(EnumAction.HONK) && (
                                <ActionSecurityIcon
                                    label="Klaxonner"
                                    icon={trumpetIcon.src}
                                    onClick={handleHonk}
                                />
                            )}
                            {qActionsList.data?.actions.includes(EnumAction.TURNING_LIGHTS) && (
                                <ActionSecurityIcon
                                    label="Activer les feux"
                                    icon={lightIcon.src}
                                    onClick={handleLightClick}
                                />
                            )}
                        </>
                    )}
                </div>

                <div className="footer-gestion-vehicle-box">
                    <span className="footer-gestion-vehicle">
                        Installez l'application mobile pour gérer votre véhicule à l'aide de votre smartphone et du bluetooth.
                    </span>
                    <div className="footer-gestion-vehicle-icon-box">
                        <AndroidLogo
                            icon={appleStoreIcon.src}
                            h2="Télécharger dans"
                            h1="l'App Store"
                            link="https://apps.apple.com/fr/app/carmoove-connect/id6464523319"
                        />
                        <AndroidLogo
                            icon={googlePlayIcon.src}
                            h2="disponible sur"
                            h1="Google Play"
                            link="https://play.google.com/store/apps/details?id=fr.carmoove.securityandshare"
                        />
                    </div>
                </div>
            </div>

            <Modal
                title="Détecteur de clé"
                className="icon-modal-box"
                centered
                open={modalKeyOpen}
                onCancel={() => setModalKeyOpen(false)}
                footer={[
                    <Button
                        className="custom-button"
                        key="submit"
                        type="primary"
                        onClick={() => setModalKeyOpen(false)}
                    >
                        OK
                    </Button>,
                ]}
            >
                <div className="information-in-modal-box">
                    <span className="information-in-modal">
                        <img src={noIcon.src} alt="no" />
                        La clé n'est pas présente dans le boitier du véhicule.
                    </span>
                    <span className="information-in-modal">
                        <img src={yesIcon.src} alt="yes" />
                        La clé est bien présente dans le boitier du véhicule.
                    </span>
                    <span className="information-in-modal">
                        <img src={warningIcon.src} alt="warning" />
                        La fonction boitier de clé n'est pas disponible sur ce véhicule.
                    </span>
                </div>
            </Modal>

            <Modal
                title="Détecteur de carte RFID"
                className="icon-modal-box"
                centered
                open={modalRFIDOpen}
                onCancel={() => setModalRFIDOpen(false)}
                footer={[
                    <Button
                        className="custom-button"
                        key="submit"
                        type="primary"
                        onClick={() => setModalRFIDOpen(false)}
                    >
                        OK
                    </Button>,
                ]}
            >
                <div className="information-in-modal-box">
                    <span className="information-in-modal">
                        <img src={noIcon.src} alt="no" />
                        Aucune carte RFID n'est présente dans le boitier.
                    </span>
                    <span className="information-in-modal">
                        <img src={yesIcon.src} alt="yes" />
                        Une carte RFID est bien présente dans le boitier.
                    </span>
                    <span className="information-in-modal">
                        <img src={warningIcon.src} alt="warning" />
                        La fonction boitier RFID n'est pas disponible.
                    </span>
                </div>
            </Modal>
        </Space>
    );
};

export default GestionVehicle;
