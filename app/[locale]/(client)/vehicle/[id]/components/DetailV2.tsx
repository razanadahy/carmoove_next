'use client'

import React, { JSX, ReactElement, useEffect, useMemo, useState } from "react";
import { Button, InputNumber, Dropdown, Input, DatePicker, Form, Transfer, App, Modal, Drawer } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CalendarOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { valueType } from "antd/lib/statistic/utils";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { Loading } from "@/components/Common/Loading";
import VehicleInformationBox from "./VehicleInformationBox";
import DetailItem from "./DetailItem";
import "./DetailV2.css";
import { VehicleAcquisitionEnum } from "@/lib/graphql/mutation";
import { useMutation } from "@apollo/client";
import { ACQUISITION_MUTATION } from "@/lib/graphql/mutation";
import { VEHICLES_QUERY } from "@/lib/graphql/queries";
import { useQuery } from "@tanstack/react-query";
import { getVehicleStatus } from "@/app/actions/reservations";
import { useRouter } from "next/navigation";
import type { TransferProps } from 'antd';
import editSrc from "@/assets/image/vehicle/edit.svg";
import Image from "next/image";
import add_i from '@/assets/image/add.svg';
import plus_i from '@/assets/image/plus.svg';
import { getISV } from "../services/DetailServices";
import { Certificate, Additional_information, Fluids, Tire, Electric } from "../services/DetailInterfaces";
import AssistanceList from "./AssistanceList";
import { useQuery as useApolloQuery } from "@apollo/client";
import { NOMENCLATURE_QUERY } from "@/lib/graphql/queries";
import {useGetInsurances, useRegisterAssistance} from "@/lib/hooks";

export interface IDataRowTableV2 {
    oneCol?: boolean
    child?: JSX.Element
    data: string
    value: any
    action: ReactElement<any, any>
}

// Helper function to check if value should be displayed
const shouldDisplay = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (value === "ND") return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'number' && value === 0) return false;
    return true;
};

function DetailV2(props: { vehicle: IVehicle }) {
    const router = useRouter();
    const dateFormat = "DD/MM/YYYY";
    const { notification } = App.useApp();

    const [showInput, setShowInput] = useState<boolean>(false);
    const [phoneNumber, setPhoneNumber] = useState<valueType | null>(
        props?.vehicle?.assistance?.phoneNumber
    );

    const [showInputAssistanceDistance, setShowInputAssistanceDistance] = useState<boolean>(false);
    const [assistanceDistance, setAssistanceDistance] = useState<number>(
        props?.vehicle?.assistance?.distance
    );

    const [showInputLeaser, setShowInputLeaser] = useState<boolean>(false);
    const [showInputStart, setShowInputStart] = useState<boolean>(false);
    const [showInputDuration, setShowInputDuration] = useState<boolean>(false);
    const [showInputMileage, setShowInputMileage] = useState<boolean>(false);
    const [showInputPrice, setShowInputPrice] = useState<boolean>(false);
    const [showInputTax, setShowInputTax] = useState<boolean>(false);
    const [showInputSubscription, setShowInputSubscription] = useState<boolean>(false);
    const [showInputRedemptionValue, setShowInputRedemptionValue] = useState<boolean>(false);
    const [mode, setMode] = useState<VehicleAcquisitionEnum | null>(props.vehicle.acquisition?.mode as VehicleAcquisitionEnum || null);
    const [leaser, setLeaser] = useState<string>(props.vehicle.acquisition?.seller || '');
    const [start, setStart] = useState<Dayjs | null>(props.vehicle.acquisition?.start ? dayjs(props.vehicle.acquisition.start * 1000) : null);
    const [duration, setDuration] = useState<number>(props.vehicle.acquisition?.duration || 0);
    const [mileage, setMileage] = useState<number>(props.vehicle.acquisition?.mileage || 0);
    const [price, setPrice] = useState<number>(props.vehicle.acquisition?.price || 0);
    const [tax, setTax] = useState<number>(props.vehicle.acquisition?.tax || 0);
    const [subscription, setSubscription] = useState<number>(props.vehicle.acquisition?.subscription || 0);
    const [redemptionValue, setRedemptionValue] = useState<number>(props.vehicle.acquisition?.redemptionValue || 0);

    const [updateAcquisition] = useMutation(ACQUISITION_MUTATION, {
        refetchQueries: [{
            query: VEHICLES_QUERY,
            context: {
                version: 'php'
            }
        }],
        awaitRefetchQueries: true,
        onCompleted: () => {
            notification.success({
                message: 'Les informations du véhicule ont été mises à jour'
            });
        },
        onError: () => {
            notification.error({
                message: 'Erreur lors de la mise à jour'
            });
        }
    });

    const qVehicleStatus = useQuery({
        queryKey: ['vehicle', props.vehicle.id],
        queryFn: () => getVehicleStatus({
            vehicleId: props.vehicle.id,
            plate: props.vehicle.information.registration,
        }),
        enabled: !!props.vehicle.id,
        retry: false
    });

    const qSIV = useQuery({
        queryKey: ["siv", props.vehicle.id],
        queryFn: () => getISV(props.vehicle.id)
    });

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState<Additional_information | null>(null);
    const [fluids, setFluids] = useState<Fluids | null>(null);
    const [tires, setTires] = useState<Tire[] | null>(null);
    const [electric, setElectric] = useState<Electric | null>(null);

    // Drawer state for AssistanceList
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const [insurance, error, loading] = useGetInsurances(
        props?.vehicle?.assistance?.code ?? ""
    );

    const openAssistanceDrawer = () => {
        setIsDrawerOpen(true);
    };

    useEffect(() => {
        if (qSIV.data) {
            setCertificate(qSIV.data.certificate);
            setAdditionalInfo(qSIV.data.additional_information);
            setFluids(qSIV.data.fluids);
            setTires(qSIV.data.tires);
            setElectric(qSIV.data.electric);
        }
    }, [qSIV.data]);

    const saveAcquisition = ({ mode, seller, start, duration, mileage, price, tax, subscription, redemptionValue }: {
        mode: string,
        seller?: string,
        start?: number,
        duration?: number,
        mileage?: number,
        price?: number,
        tax?: number,
        subscription?: number
        redemptionValue?: number
    }) => {
        updateAcquisition({
            variables: {
                vehicleId: props.vehicle.id,
                mode: mode ? mode : props.vehicle.acquisition?.mode,
                seller: (seller || seller === '') ? seller : props.vehicle.acquisition?.seller,
                start: (start || start === 0) ? start : props.vehicle.acquisition?.start,
                duration: (duration || duration === 0) ? duration : props.vehicle.acquisition?.duration,
                mileage: (mileage || mileage === 0) ? mileage : props.vehicle.acquisition?.mileage,
                price: (price || price === 0) ? price : props.vehicle.acquisition?.price,
                tax: (tax || tax === 0) ? tax : props.vehicle.acquisition?.tax,
                subscription: (subscription || subscription === 0) ? subscription : props.vehicle.acquisition?.subscription,
                redemptionValue: (redemptionValue || redemptionValue === 0) ? redemptionValue : props.vehicle.acquisition?.redemptionValue,
            }
        });
    };

    // Handlers for phone number
    const handleEditPhoneNumber = () => {
        setShowInput(true);
        setPhoneNumber(props.vehicle.assistance?.phoneNumber);
    };

    const { registerAssistance } = useRegisterAssistance(props.vehicle.id);
    const saveAssistance = ({phoneNumber, distance,}: { phoneNumber?: string; distance?: number; }) => {
        registerAssistance({
            variables: {
                vehicle_id: props.vehicle.id,
                code: props?.vehicle?.assistance?.code,
                phoneNumber: phoneNumber
                    ? phoneNumber.toString()
                    : props.vehicle.assistance?.phoneNumber,
                distance: distance ?? props.vehicle.assistance?.distance,
            },
        });
    };

    const handleSavePhoneNumber = () => {
        if (props.vehicle.assistance?.phoneNumber !== phoneNumber)
            saveAssistance({ phoneNumber: phoneNumber?.toString() });
        notification.success({ message: 'Numéro de téléphone mis à jour' });
        setShowInput(false);
    };

    // Handlers for assistance distance
    const handleEditAssistanceDistance = () => {
        setShowInputAssistanceDistance(true);
        setAssistanceDistance(props.vehicle.assistance?.distance);
    };

    const handleSaveAssistanceDistance = () => {
        if (props.vehicle.assistance?.distance !== assistanceDistance)
            saveAssistance({ distance: assistanceDistance });
        notification.success({ message: 'Distance de prise en charge mise à jour' });
        setShowInputAssistanceDistance(false);
    };

    // Handlers for leaser
    const handleEditLeaser = () => {
        setShowInputLeaser(true);
        setLeaser(props.vehicle.acquisition?.seller || '');
    };

    const handleSaveLeaser = () => {
        if (mode !== null && leaser)
            saveAcquisition({ mode: mode, seller: leaser });
        setShowInputLeaser(false);
    };

    // Handlers for start date
    const handleEditStart = () => {
        setShowInputStart(true);
        setStart(props.vehicle.acquisition?.start ? dayjs(props.vehicle.acquisition?.start * 1000) : null);
    };

    const handleSaveStart = () => {
        if (mode !== null) {
            saveAcquisition({ mode: mode, start: start ? start.unix() : 0 });
        }
        setShowInputStart(false);
    };

    // Handlers for duration
    const handleEditDuration = () => {
        setShowInputDuration(true);
        setDuration(props.vehicle.acquisition?.duration || 0);
    };

    const handleSaveDuration = () => {
        if (mode !== null && (duration || duration === 0))
            saveAcquisition({ mode: mode, duration: duration });
        setShowInputDuration(false);
    };

    // Handlers for mileage
    const handleEditMileage = () => {
        setShowInputMileage(true);
        setMileage(props.vehicle.acquisition?.mileage || 0);
    };

    const handleSaveMileage = () => {
        if (mode !== null && (mileage || mileage === 0))
            saveAcquisition({ mode: mode, mileage: mileage });
        setShowInputMileage(false);
    };

    // Handlers for price
    const handleEditPrice = () => {
        setShowInputPrice(true);
        setPrice(props.vehicle.acquisition?.price || 0);
    };

    const handleSavePrice = () => {
        if (mode !== null && (price || price === 0))
            saveAcquisition({ mode: mode, price: price });
        setShowInputPrice(false);
    };

    // Handlers for tax
    const handleEditTax = () => {
        setShowInputTax(true);
        setTax(props.vehicle.acquisition?.tax || 0);
    };

    const handleSaveTax = () => {
        if (mode !== null && (tax || tax === 0))
            saveAcquisition({ mode: mode, tax: tax });
        setShowInputTax(false);
    };

    // Handlers for subscription
    const handleEditSubscription = () => {
        setShowInputSubscription(true);
        setSubscription(props.vehicle.acquisition?.subscription || 0);
    };

    const handleSaveSubscription = () => {
        if (mode !== null && (subscription || subscription === 0))
            saveAcquisition({ mode: mode, subscription: subscription });
        setShowInputSubscription(false);
    };

    // Handlers for redemption value
    const handleEditRedemptionValue = () => {
        setShowInputRedemptionValue(true);
        setRedemptionValue(props.vehicle.acquisition?.redemptionValue || 0);
    };

    const handleSaveRedemptionValue = () => {
        if (mode !== null && (redemptionValue || redemptionValue === 0))
            saveAcquisition({ mode: mode, redemptionValue: redemptionValue });
        setShowInputRedemptionValue(false);
    };

    // onChange handlers
    const onChangeStart = (date: Dayjs) => {
        setStart(date);
    };

    const onChangeDuration = (value: number | null) => {
        setDuration(value || 0);
    };

    const onChangeMileage = (value: number | null) => {
        setMileage(value || 0);
    };

    const onChangePrice = (value: number | null) => {
        setPrice(value || 0);
    };

    const onChangeTax = (value: number | null) => {
        setTax(value || 0);
    };

    const onChangeSubscription = (value: number | null) => {
        setSubscription(value || 0);
    };

    const onChangeRedemptionValue = (value: number | null) => {
        setRedemptionValue(value || 0);
    };

    // Build data arrays with filtering
    const boitierData: IDataRowTableV2[] = [
        shouldDisplay(props.vehicle.device?.type) && { data: "Type de Boitier", value: props.vehicle.device?.type, action: <></> },
        shouldDisplay(props.vehicle.device?.id) && { data: "Numéro du boitier", value: props.vehicle.device?.id, action: <></> },
        shouldDisplay(props.vehicle.device?.lastMessageDate) && {
            data: "Dernier message",
            value: dayjs(props.vehicle.device?.lastMessageDate).format("DD/MM/YYYY HH:mm"),
            action: <></>
        }
    ].filter(Boolean) as IDataRowTableV2[];

    const chassisData: IDataRowTableV2[] = [
        shouldDisplay(props.vehicle.information.height) && { data: "Hauteur", value: props.vehicle.information.height, action: <></> },
        shouldDisplay(props.vehicle.information.width) && { data: "Largeur", value: props.vehicle.information.width, action: <></> },
        shouldDisplay(props.vehicle.information.length) && { data: "Longueur", value: props.vehicle.information.length, action: <></> },
        shouldDisplay(props.vehicle.information.seatings) && { data: "Nombre de places", value: props.vehicle.information.seatings, action: <></> },
        shouldDisplay(props.vehicle.information.doors) && { data: "Nombre de portes", value: props.vehicle.information.doors, action: <></> },
        shouldDisplay(props.vehicle.information.unloadedWeight) && { data: "Poids à vide (kg)", value: props.vehicle.information.unloadedWeight, action: <></> },
        shouldDisplay(props.vehicle.information.totalWeight) && { data: "Poids total (kg)", value: props.vehicle.information.totalWeight, action: <></> },
        shouldDisplay(props.vehicle.information.prfTotalWeight) && { data: "Poids maximal en charge (kg)", value: props.vehicle.information.prfTotalWeight, action: <></> },
        shouldDisplay(props.vehicle.information.wheelbase) && { data: "Empattement", value: props.vehicle.information.wheelbase, action: <></> },
    ].filter(Boolean) as IDataRowTableV2[];

    const motorisationData: IDataRowTableV2[] = [
        shouldDisplay(props.vehicle.information.engineCode) && { data: "Code moteur", value: props.vehicle.information.engineCode, action: <></> },
        shouldDisplay(props.vehicle.information.injectionMode) && { data: "Type d'injection", value: props.vehicle.information.injectionMode, action: <></> },
        shouldDisplay(props.vehicle.information.turbo) && { data: "Turbo", value: props.vehicle.information.turbo, action: <></> },
        shouldDisplay(props.vehicle.information.displacement) && { data: "Cylindré Moteur", value: props.vehicle.information.displacement, action: <></> },
        shouldDisplay(props.vehicle.information.cylinders) && { data: "Nbr cylindres", value: props.vehicle.information.cylinders, action: <></> },
        shouldDisplay(props.vehicle.information.valves) && { data: "Nbr valves", value: props.vehicle.information.valves, action: <></> },
        shouldDisplay(props.vehicle.information.gearboxType) && { data: "Boite de vitesse", value: props.vehicle.information.gearboxType, action: <></> },
        shouldDisplay(props.vehicle.information.gears) && { data: "Rapports", value: props.vehicle.information.gears, action: <></> },
        shouldDisplay(props.vehicle.information.propulsion) && { data: "Propulsion", value: props.vehicle.information.propulsion, action: <></> },
        shouldDisplay(props.vehicle.information.horsePower) && { data: "Puissance en chevaux", value: props.vehicle.information.horsePower, action: <></> },
        shouldDisplay(props.vehicle.information.kwPower) && { data: "Puissance en kW", value: props.vehicle.information.kwPower, action: <></> },
        shouldDisplay(props.vehicle.information.energy) && { data: "Carburant", value: props.vehicle.information.energy, action: <></> },
        shouldDisplay(props.vehicle.information.fuelTankCapacity) && { data: "Capacité réservoir", value: props.vehicle.information.fuelTankCapacity, action: <></> },
        shouldDisplay(props.vehicle.information.consumptionExtraurban) && { data: "Consommation extra-urbain", value: props.vehicle.information.consumptionExtraurban, action: <></> },
        shouldDisplay(props.vehicle.information.consumptionMixed) && { data: "Consommation mixte", value: props.vehicle.information.consumptionMixed, action: <></> },
        shouldDisplay(props.vehicle.information.consumptionUrban) && { data: "Consommation ville", value: props.vehicle.information.consumptionUrban, action: <></> },
        shouldDisplay(props.vehicle.information.co2) && { data: "CO2 (en g/km)", value: props.vehicle.information.co2, action: <></> },
    ].filter(Boolean) as IDataRowTableV2[];

    // Insurance data
    const insuranceData: IDataRowTableV2[] = [
        {
            data: "Assureur",
            value: props?.vehicle?.assistance?.code ? insurance[0]?.label ?? "ND" : "ND",
            action: (
                <Button onClick={openAssistanceDrawer} type="text">
                    <Image src={editSrc} alt="edit" />
                </Button>
            ),
        },
        {
            data: "Tél assistance",
            value: showInput ? (
                <InputNumber
                    controls={false}
                    value={phoneNumber}
                    onChange={(value: valueType | null) => {
                        setPhoneNumber(value);
                    }}
                    className="tel-input"
                />
            ) : (
                props.vehicle.assistance?.phoneNumber || "ND"
            ),
            action: showInput ? (
                <Button onClick={handleSavePhoneNumber} type="text" className="btn-valider-detail-acq">
                    OK
                </Button>
            ) : (
                <Button
                    onClick={handleEditPhoneNumber}
                    type="text"
                    disabled={!props?.vehicle?.assistance?.code}
                >
                    <Image src={editSrc} alt="edit" />
                </Button>
            ),
        },
        {
            data: "Distance de prise en charge",
            value: showInputAssistanceDistance ? (
                <InputNumber
                    controls={false}
                    value={assistanceDistance}
                    onChange={(value: number | null) => {
                        if (!value) setAssistanceDistance(0);
                        else setAssistanceDistance(value);
                    }}
                    className="distance-input"
                />
            ) : (
                props.vehicle.assistance?.distance || "ND"
            ),
            action: showInputAssistanceDistance ? (
                <Button onClick={handleSaveAssistanceDistance} type="text" className="btn-valider-detail-acq">
                    OK
                </Button>
            ) : (
                <Button
                    onClick={handleEditAssistanceDistance}
                    type="text"
                    disabled={!props?.vehicle?.assistance?.code}
                >
                    <Image src={editSrc} alt="edit" />
                </Button>
            )
        },
    ];

    // Acquisition data
    let acquisitionData: IDataRowTableV2[] = [
        {
            data: "Mode acquisition",
            value: <span>{mode}</span>,
            action: (
                <Dropdown menu={{
                    items: [
                        {
                            label: (
                                <div onClick={() => {
                                    saveAcquisition({ mode: VehicleAcquisitionEnum.ACHAT });
                                    setMode(VehicleAcquisitionEnum.ACHAT);
                                }}>Achat</div>
                            ),
                            key: "ACHAT",
                        },
                        {
                            label: (
                                <div onClick={() => {
                                    saveAcquisition({ mode: VehicleAcquisitionEnum.LLD });
                                    setMode(VehicleAcquisitionEnum.LLD);
                                }}>LLD</div>
                            ),
                            key: "LLD",
                        },
                        {
                            label: (
                                <div onClick={() => {
                                    saveAcquisition({ mode: VehicleAcquisitionEnum.LOA });
                                    setMode(VehicleAcquisitionEnum.LOA);
                                }}>LOA</div>
                            ),
                            key: "LOA",
                        },
                        {
                            label: (
                                <div onClick={() => {
                                    saveAcquisition({ mode: VehicleAcquisitionEnum.CREDITBAIL });
                                    setMode(VehicleAcquisitionEnum.CREDITBAIL);
                                }}>Crédit bail</div>
                            ),
                            key: "CREDITBAIL",
                        },
                    ]
                }} trigger={["click"]}>
                    <Button type="text">
                        <Image src={editSrc} alt="edit" />
                    </Button>
                </Dropdown>
            ),
        },
    ];

    if (mode !== null) {
        acquisitionData.push(
            {
                data: mode === VehicleAcquisitionEnum.ACHAT ? "Vendeur" : "Leaser",
                value: showInputLeaser ? (
                    <Input
                        className="input-disabled-standby input-custom-table-acq"
                        value={leaser}
                        onChange={(e) => {
                            setLeaser(e.target.value);
                        }}
                    />
                ) : (
                    leaser ? <span>{leaser}</span> : <span>ND</span>
                ),
                action: showInputLeaser ? (
                    <Button onClick={handleSaveLeaser} type="text" className="btn-valider-detail-acq">
                        OK
                    </Button>
                ) : (
                    <Button onClick={handleEditLeaser} type="text">
                        <Image src={editSrc} alt="edit" />
                    </Button>
                ),
            }
        );
        acquisitionData.push(
            {
                data: mode === VehicleAcquisitionEnum.ACHAT ?
                    "Date d'achat" : (mode === VehicleAcquisitionEnum.CREDITBAIL || mode === VehicleAcquisitionEnum.LLD) ?
                        "Début du leasing" : mode === VehicleAcquisitionEnum.LOA ?
                            "Début de la LOA" : "champ invalid",
                value: (start || showInputStart) ? (
                    <DatePicker
                        className="input-disabled-standby input-custom-table-acq"
                        allowClear={true}
                        suffixIcon={showInputStart ? <CalendarOutlined /> : null}
                        variant={showInputStart ? "outlined" : "borderless"}
                        disabled={!showInputStart}
                        value={start}
                        onChange={onChangeStart}
                        style={{ color: "#4D4D4D" }}
                        format="DD/MM/YYYY"
                    />
                ) : (
                    <span>ND</span>
                ),
                action: showInputStart ? (
                    <Button onClick={handleSaveStart} type="text" className="btn-valider-detail-acq">
                        OK
                    </Button>
                ) : (
                    <Button onClick={handleEditStart} type="text">
                        <Image src={editSrc} alt="edit" />
                    </Button>
                ),
            }
        );
        if (mode !== VehicleAcquisitionEnum.ACHAT) {
            acquisitionData.push(
                {
                    data: "Durée",
                    value: (props.vehicle.acquisition?.duration || showInputDuration) ? (
                        <InputNumber
                            className="input-disabled-standby input-custom-table-acq"
                            variant={showInputDuration ? "outlined" : "borderless"}
                            disabled={!showInputDuration}
                            value={duration}
                            onChange={onChangeDuration}
                            suffix="mois"
                            style={{ color: "#4D4D4D" }}
                        />
                    ) : (
                        <span>ND</span>
                    ),
                    action: showInputDuration ? (
                        <Button onClick={handleSaveDuration} type="text" className="btn-valider-detail-acq">
                            OK
                        </Button>
                    ) : (
                        <Button onClick={handleEditDuration} type="text">
                            <Image src={editSrc} alt="edit" />
                        </Button>
                    ),
                }
            );
            acquisitionData.push(
                {
                    data: mode === VehicleAcquisitionEnum.LOA ? "Fin de la LOA" : "Fin du leasing",
                    value: (props.vehicle.acquisition?.duration && props.vehicle.acquisition?.start) ? (
                        <DatePicker
                            className="input-disabled-standby input-custom-table-acq"
                            allowClear={false}
                            suffixIcon={null}
                            variant="borderless"
                            disabled
                            value={dayjs(start).add(duration, "month")}
                            style={{ color: "#4D4D4D" }}
                            format="DD/MM/YYYY"
                        />
                    ) : (
                        <span>ND</span>
                    ),
                    action: <></>,
                }
            );
        }
        if (mode === VehicleAcquisitionEnum.LLD || mode === VehicleAcquisitionEnum.CREDITBAIL) {
            acquisitionData.push(
                {
                    data: "Kilométrage contractuel",
                    value: (props.vehicle.acquisition?.mileage || showInputMileage) ? (
                        <InputNumber
                            className="input-disabled-standby input-custom-table-acq"
                            variant={showInputMileage ? "outlined" : "borderless"}
                            disabled={!showInputMileage}
                            value={mileage}
                            onChange={onChangeMileage}
                            suffix="Km"
                            style={{ color: "#4D4D4D" }}
                        />
                    ) : (
                        <span>ND</span>
                    ),
                    action: showInputMileage ? (
                        <Button onClick={handleSaveMileage} type="text" className="btn-valider-detail-acq">
                            OK
                        </Button>
                    ) : (
                        <Button onClick={handleEditMileage} type="text">
                            <Image src={editSrc} alt="edit" />
                        </Button>
                    ),
                }
            );
        }
        acquisitionData.push(
            {
                data: mode === VehicleAcquisitionEnum.ACHAT ? "Prix d'Achat (HT)" : "Apport initial (HT)",
                value: (props.vehicle.acquisition?.price || showInputPrice) ? (
                    <InputNumber
                        className="input-disabled-standby input-custom-table-acq"
                        suffix="€"
                        variant={showInputPrice ? "outlined" : "borderless"}
                        disabled={!showInputPrice}
                        value={price}
                        onChange={onChangePrice}
                        style={{ color: "#4D4D4D", width: "120px" }}
                    />
                ) : (
                    <span>ND</span>
                ),
                action: showInputPrice ? (
                    <Button onClick={handleSavePrice} type="text" className="btn-valider-detail-acq">
                        OK
                    </Button>
                ) : (
                    <Button onClick={handleEditPrice} type="text">
                        <Image src={editSrc} alt="edit" />
                    </Button>
                ),
            }
        );
        acquisitionData.push(
            {
                data: "Taux de TVA",
                value: (props.vehicle.acquisition?.tax || showInputTax) ? (
                    <InputNumber
                        className="input-disabled-standby input-custom-table-acq"
                        suffix="%"
                        variant={showInputTax ? "outlined" : "borderless"}
                        disabled={!showInputTax}
                        value={tax}
                        onChange={onChangeTax}
                        style={{ color: "#4D4D4D" }}
                    />
                ) : (
                    <span>ND</span>
                ),
                action: showInputTax ? (
                    <Button onClick={handleSaveTax} type="text" className="btn-valider-detail-acq">
                        OK
                    </Button>
                ) : (
                    <Button onClick={handleEditTax} type="text">
                        <Image src={editSrc} alt="edit" />
                    </Button>
                ),
            }
        );
        if (mode !== VehicleAcquisitionEnum.ACHAT) {
            acquisitionData.push(
                {
                    data: "Montant mensuel (HT)",
                    value: (props.vehicle.acquisition?.subscription || showInputSubscription) ? (
                        <InputNumber
                            className="input-disabled-standby input-custom-table-acq"
                            suffix="€"
                            variant={showInputSubscription ? "outlined" : "borderless"}
                            disabled={!showInputSubscription}
                            value={subscription}
                            onChange={onChangeSubscription}
                            style={{ color: "#4D4D4D" }}
                        />
                    ) : (
                        <span>ND</span>
                    ),
                    action: showInputSubscription ? (
                        <Button onClick={handleSaveSubscription} type="text" className="btn-valider-detail-acq">
                            OK
                        </Button>
                    ) : (
                        <Button onClick={handleEditSubscription} type="text">
                            <Image src={editSrc} alt="edit" />
                        </Button>
                    ),
                }
            );
        }
        if (mode === VehicleAcquisitionEnum.LOA) {
            acquisitionData.push(
                {
                    data: "Valeur de rachat",
                    value: (props.vehicle.acquisition?.redemptionValue || showInputRedemptionValue) ? (
                        <InputNumber
                            className="input-disabled-standby input-custom-table-acq"
                            suffix="€"
                            variant={showInputRedemptionValue ? "outlined" : "borderless"}
                            disabled={!showInputRedemptionValue}
                            value={redemptionValue}
                            onChange={onChangeRedemptionValue}
                            style={{ color: "#4D4D4D" }}
                        />
                    ) : (
                        <span>ND</span>
                    ),
                    action: showInputRedemptionValue ? (
                        <Button onClick={handleSaveRedemptionValue} type="text" className="btn-valider-detail-acq">
                            OK
                        </Button>
                    ) : (
                        <Button onClick={handleEditRedemptionValue} type="text">
                            <Image src={editSrc} alt="edit" />
                        </Button>
                    ),
                }
            );
        }
    }

    const adminData: IDataRowTableV2[] = useMemo(() => {
        if (!certificate) return [];
        return [
            shouldDisplay(certificate?.plate) && { data: "Immatriculation (A)", value: certificate?.plate, action: <></> },
            shouldDisplay(certificate?.first_registration) && { data: "Date de première immatriculation (B)", value: certificate?.first_registration, action: <></> },
            shouldDisplay(certificate?.brand) && { data: "Marque du véhicule (D.1)", value: certificate?.brand, action: <></> },
            shouldDisplay(certificate?.type_variant_version) && { data: "Type, version ou variante du modèle de voiture (D.2)", value: certificate?.type_variant_version, action: <></> },
            shouldDisplay(certificate?.cnit) && { data: "Code national d'identification du type (D.2.1)", value: certificate?.cnit, action: <></> },
            shouldDisplay(certificate?.model) && { data: "Dénomination commerciale (D.3)", value: certificate?.model, action: <></> },
            shouldDisplay(certificate?.vin) && { data: "N° d'identification du véhicule (E)", value: certificate?.vin, action: <></> },
            shouldDisplay(certificate?.mass_f1) && { data: "Masse en charge maximale techniquement admissible (F.1)", value: certificate?.mass_f1 + " (kg)", action: <></> },
            shouldDisplay(certificate?.mass_f3) && { data: "Masse en charge maximale admissible de l'ensemble en service dans l'État membre d'immatriculation (F.3)", value: certificate?.mass_f3 + " (kg)", action: <></> },
            shouldDisplay(certificate?.mass_g) && { data: "Masse du véhicule en service avec carrosserie et dispositif d'attelage (G)", value: certificate?.mass_g + " (kg)", action: <></> },
            shouldDisplay(certificate?.unloaded_weight) && { data: "Poids à vide national (G.1)", value: certificate?.unloaded_weight, action: <></> },
            shouldDisplay(certificate?.category) && { data: "Catégorie du véhicule (J)", value: certificate?.category, action: <></> },
            shouldDisplay(certificate?.national_type) && { data: "Genre national (J.1)", value: certificate?.national_type, action: <></> },
            shouldDisplay(certificate?.national_bodywork) && { data: "Carrosserie - Désignation nationale (J.3)", value: certificate?.national_bodywork, action: <></> },
            shouldDisplay(certificate?.reception_number) && { data: "N° de réception par type (K)", value: certificate?.reception_number, action: <></> },
            shouldDisplay(certificate?.displacement) && { data: "Cylindrée (P.1)", value: certificate?.displacement + " (cm3)", action: <></> },
            shouldDisplay(certificate?.max_net_power) && { data: "Puissance nette maximale (P.2)", value: certificate?.max_net_power + " (kW)", action: <></> },
            shouldDisplay(certificate?.energy) && { data: "Type de carburant ou source d'énergie (P.3)", value: certificate?.energy, action: <></> },
            shouldDisplay(certificate?.administrative_power) && { data: "Puissance administrative nationale (P.6)", value: certificate?.administrative_power, action: <></> },
            shouldDisplay(certificate?.seats) && { data: "Nombre de places assises, y compris celle du conducteur (S.1)", value: certificate?.seats, action: <></> },
            shouldDisplay(certificate?.standing_places) && { data: "Nombre de places debout (S.2)", value: certificate?.standing_places, action: <></> },
            shouldDisplay(certificate?.sound_level) && { data: "Niveau sonore à l'arrêt (U.1)", value: certificate?.sound_level + " (dB [A])", action: <></> },
            shouldDisplay(certificate?.engine_speed) && { data: "Vitesse du moteur (U.2)", value: certificate?.engine_speed + " (tours/min)", action: <></> },
            shouldDisplay(certificate?.co2) && { data: "CO2 (V.7)", value: certificate?.co2 + " (g/km)", action: <></> },
            shouldDisplay(certificate?.environmental_class) && { data: "Indication de la classe environnementale de réception CE (V.9)", value: certificate?.environmental_class, action: <></> },
            shouldDisplay(certificate?.certificate_date) && { data: "Date du Certificat d'Immatriculation (I)", value: certificate?.certificate_date, action: <></> }
        ].filter(Boolean) as IDataRowTableV2[];
    }, [certificate]);

    const donneAdd: IDataRowTableV2[] = useMemo(() => {
        if (!additionalInfo) return [];
        return [
            shouldDisplay(additionalInfo.color) && { data: "Couleur du véhicule", value: additionalInfo.color, action: <></> },
            shouldDisplay(additionalInfo.model) && { data: "Nom du modèle", value: additionalInfo.model, action: <></> },
            shouldDisplay(additionalInfo.generation) && { data: "Génération du modèle", value: additionalInfo.generation, action: <></> },
            shouldDisplay(additionalInfo.additional_model) && { data: "Donnée complémentaire sur le nom du modèle", value: additionalInfo.additional_model, action: <></> },
            shouldDisplay(additionalInfo.full_version) && { data: "Version complète", value: additionalInfo.full_version, action: <></> },
            shouldDisplay(additionalInfo.version) && { data: "Version", value: additionalInfo.version, action: <></> },
            shouldDisplay(additionalInfo.cylinders_in_liters) && { data: "Cylindrées (en litres)", value: additionalInfo.cylinders_in_liters, action: <></> },
            shouldDisplay(additionalInfo.injection_label) && { data: "Injection", value: additionalInfo.injection_label, action: <></> },
            shouldDisplay(additionalInfo.injection_type) && { data: "Type d'injection", value: additionalInfo.injection_type, action: <></> },
            shouldDisplay(additionalInfo.valves) && { data: "Nombre de valves", value: additionalInfo.valves, action: <></> },
            shouldDisplay(additionalInfo.horsepower) && { data: "Puissance (en chevaux)", value: additionalInfo.horsepower, action: <></> },
            shouldDisplay(additionalInfo.bodywork) && { data: "Carrosserie", value: additionalInfo.bodywork, action: <></> },
            shouldDisplay(additionalInfo.commercial_start_date) && { data: "Date de début de commercialisation", value: additionalInfo.commercial_start_date, action: <></> },
            shouldDisplay(additionalInfo.commercial_end_date) && { data: "Date de fin de commercialisation", value: additionalInfo.commercial_end_date, action: <></> },
            shouldDisplay(additionalInfo.phase) && { data: "Phase de commercialisation", value: additionalInfo.phase, action: <></> },
            shouldDisplay(additionalInfo.doors) && { data: "Nombre de portes", value: additionalInfo.doors, action: <></> },
            shouldDisplay(additionalInfo.engine_code) && { data: "Code moteur", value: additionalInfo.engine_code, action: <></> },
            shouldDisplay(additionalInfo.transmission_type) && { data: "Type de transmission", value: additionalInfo.transmission_type, action: <></> },
            shouldDisplay(additionalInfo.euro_standard) && { data: "Standard Euro", value: additionalInfo.euro_standard, action: <></> },
            shouldDisplay(additionalInfo.particulate_filter) && { data: "Présence d'un filtre à particule", value: additionalInfo.particulate_filter, action: <></> },
            shouldDisplay(additionalInfo.adblue) && { data: "Adblue", value: additionalInfo.adblue, action: <></> },
            shouldDisplay(additionalInfo.gearbox_code) && { data: "Code boite de vitesse", value: additionalInfo.gearbox_code, action: <></> },
            shouldDisplay(additionalInfo.gearbox_type) && { data: "Type de boite de vitesse", value: additionalInfo.gearbox_type, action: <></> },
            shouldDisplay(additionalInfo.gears) && { data: "Nombre de rapports de vitesse", value: additionalInfo.gears, action: <></> },
            shouldDisplay(additionalInfo.crit_air) && { data: "Vignette Crit'Air", value: additionalInfo.crit_air, action: <></> },
            shouldDisplay(additionalInfo.urban_co2) && { data: "CO2 en mode urbain", value: additionalInfo.urban_co2 + " (en g/km)", action: <></> },
            shouldDisplay(additionalInfo.extra_urban_co2) && { data: "CO2 en mode extra-urbain", value: additionalInfo.extra_urban_co2 + " (en g/km)", action: <></> },
            shouldDisplay(additionalInfo.urban_fuel_consumption) && { data: "Consommation urbaine", value: additionalInfo.urban_fuel_consumption, action: <></> },
            shouldDisplay(additionalInfo.extra_urban_fuel_consumption) && { data: "Consommation extra-urbaine", value: additionalInfo.extra_urban_fuel_consumption, action: <></> },
            shouldDisplay(additionalInfo.combined_fuel_consumption) && { data: "Consommation", value: additionalInfo.combined_fuel_consumption, action: <></> },
            shouldDisplay(additionalInfo.starter_battery_power) && { data: "Puissance de la batterie de démarrage", value: additionalInfo.starter_battery_power, action: <></> },
            shouldDisplay(additionalInfo.starter_battery_capacity) && { data: "Capacité de la batterie de démarrage", value: additionalInfo.starter_battery_capacity, action: <></> },
            shouldDisplay(additionalInfo.rear_braking_system) && { data: "Système de freinage arrière", value: additionalInfo.rear_braking_system, action: <></> },
            shouldDisplay(additionalInfo.rear_trunk_capacity) && { data: "Capacité du coffre arrière", value: additionalInfo.rear_trunk_capacity + " (Litre)", action: <></> },
            shouldDisplay(additionalInfo.extended_rear_trunk_capacity) && { data: "Capacité étendue du coffre arrière", value: additionalInfo.extended_rear_trunk_capacity + " (Litre)", action: <></> },
            shouldDisplay(additionalInfo.max_length) && { data: "Longueur maximale", value: additionalInfo.max_length, action: <></> },
            shouldDisplay(additionalInfo.combined_horse_power) && { data: "Puissance combinée", value: additionalInfo.combined_horse_power, action: <></> },
            shouldDisplay(additionalInfo.wheel_drive) && { data: "Roues motrices", value: additionalInfo.wheel_drive, action: <></> },
            shouldDisplay(additionalInfo.front_axle_type) && { data: "Type de suspensions avant", value: additionalInfo.front_axle_type, action: <></> },
            shouldDisplay(additionalInfo.rear_axle_type) && { data: "Type de suspensions arrières", value: additionalInfo.rear_axle_type, action: <></> },
        ].filter(Boolean) as IDataRowTableV2[];
    }, [additionalInfo]);

    const dFluide: IDataRowTableV2[] = useMemo(() => {
        if (!fluids) return [];
        return [
            shouldDisplay(fluids.fuel_tank_capacity) && { data: "Capacité du réservoir de carburant", value: fluids.fuel_tank_capacity, action: <></> },
            shouldDisplay(fluids.engine_oil_standard) && { data: "Norme d'huile moteur", value: fluids.engine_oil_standard, action: <></> },
            shouldDisplay(fluids.engine_oil_acea) && { data: "Norme ACEA", value: fluids.engine_oil_acea, action: <></> },
            shouldDisplay(fluids.engine_oil_viscosity) && { data: "Viscosité de l'huile moteur", value: fluids.engine_oil_viscosity, action: <></> },
            shouldDisplay(fluids.engine_oil_with_filter_capacity_min) && { data: "Capacité minimale d'huile moteur", value: fluids.engine_oil_with_filter_capacity_min, action: <></> },
            shouldDisplay(fluids.engine_oil_with_filter_capacity_max) && { data: "Capacité maximale d'huile moteur", value: fluids.engine_oil_with_filter_capacity_max, action: <></> },
            shouldDisplay(fluids.brake_fluid_capacity) && { data: "Capacité de liquide de frein", value: fluids.brake_fluid_capacity, action: <></> },
            shouldDisplay(fluids.brake_fluid_standard) && { data: "Norme de liquide de frein", value: fluids.brake_fluid_standard, action: <></> },
            shouldDisplay(fluids.engine_coolant_capacity_min) && { data: "Capacité minimale de liquide de refroidissement", value: fluids.engine_coolant_capacity_min, action: <></> },
            shouldDisplay(fluids.engine_coolant_capacity_max) && { data: "Capacité maximale de liquide de refroidissement", value: fluids.engine_coolant_capacity_max, action: <></> },
            shouldDisplay(fluids.engine_coolant_type) && { data: "Type de liquide de refroidissement", value: fluids.engine_coolant_type, action: <></> },
            shouldDisplay(fluids.air_conditioning_gas_capacity_min) && { data: "Capacité minimale de gaz d'air conditionné", value: fluids.air_conditioning_gas_capacity_min, action: <></> },
            shouldDisplay(fluids.air_conditioning_gas_capacity_max) && { data: "Capacité maximale de gaz d'air conditionné", value: fluids.air_conditioning_gas_capacity_max, action: <></> },
            shouldDisplay(fluids.air_conditioning_gas_standard) && { data: "Norme de gaz d'air conditionné", value: fluids.air_conditioning_gas_standard, action: <></> },
            shouldDisplay(fluids.power_steering_fluid_capacity) && { data: "Capacité de liquide de direction assistée", value: fluids.power_steering_fluid_capacity, action: <></> },
            shouldDisplay(fluids.power_steering_fluid_standard) && { data: "Norme de liquide de direction assistée", value: fluids.power_steering_fluid_standard, action: <></> }
        ].filter(Boolean) as IDataRowTableV2[];
    }, [fluids]);

    const dElectric: IDataRowTableV2[] = useMemo(() => {
        if (props.vehicle.information.energy !== "EL" || electric === null) return [];
        return [
            shouldDisplay(electric.front_engine_type) && { data: "Type de moteur avant", value: electric.front_engine_type, action: <></> },
            shouldDisplay(electric.front_engine_kw_power) && { data: "Puissance du moteur avant (kW)", value: electric.front_engine_kw_power, action: <></> },
            shouldDisplay(electric.front_engine_horsepower) && { data: "Puissance du moteur avant (chevaux)", value: electric.front_engine_horsepower, action: <></> },
            shouldDisplay(electric["1st_rear_engine_type"]) && { data: "Type du 1er moteur arrière", value: electric["1st_rear_engine_type"], action: <></> },
            shouldDisplay(electric["1st_rear_engine_kw_power"]) && { data: "Puissance du 1er moteur arrière (kW)", value: electric["1st_rear_engine_kw_power"], action: <></> },
            shouldDisplay(electric["1st_rear_engine_horsepower"]) && { data: "Puissance du 1er moteur arrière (chevaux)", value: electric["1st_rear_engine_horsepower"], action: <></> },
            shouldDisplay(electric["2nd_rear_engine_type"]) && { data: "Type du 2nd moteur arrière", value: electric["2nd_rear_engine_type"], action: <></> },
            shouldDisplay(electric["2nd_rear_engine_kw_power"]) && { data: "Puissance du 2nd moteur arrière (kW)", value: electric["2nd_rear_engine_kw_power"], action: <></> },
            shouldDisplay(electric["2nd_rear_engine_horsepower"]) && { data: "Puissance du 2nd moteur arrière (chevaux)", value: electric["2nd_rear_engine_horsepower"], action: <></> },
            shouldDisplay(electric.combined_kw_power) && { data: "Puissance combinée", value: electric.combined_kw_power, action: <></> },
            shouldDisplay(electric.engine_cooling_type) && { data: "Type de refroidissement moteur", value: electric.engine_cooling_type, action: <></> },
            shouldDisplay(electric.front_engine_nm_torque) && { data: "Couple du moteur avant", value: electric.front_engine_nm_torque, action: <></> },
            shouldDisplay(electric["1st_rear_engine_nm_torque"]) && { data: "Couple du 1er moteur arrière", value: electric["1st_rear_engine_nm_torque"], action: <></> },
            shouldDisplay(electric["2nd_rear_engine_nm_torque"]) && { data: "Couple du 2nd moteur arrière", value: electric["2nd_rear_engine_nm_torque"], action: <></> },
            shouldDisplay(electric.combined_nm_torque) && { data: "Couple combiné", value: electric.combined_nm_torque, action: <></> },
            shouldDisplay(electric.battery_weight) && { data: "Poids de la batterie", value: electric.battery_weight, action: <></> },
            shouldDisplay(electric.battery_layout) && { data: "Position de la batterie", value: electric.battery_layout, action: <></> },
            shouldDisplay(electric.battery_type) && { data: "Type de batterie", value: electric.battery_type, action: <></> },
            shouldDisplay(electric.battery_voltage) && { data: "Voltage de la batterie", value: electric.battery_voltage, action: <></> },
            shouldDisplay(electric.battery_kw_power) && { data: "Puissance de la batterie", value: electric.battery_kw_power, action: <></> },
            shouldDisplay(electric["1st_battery_kwh_capacity"]) && { data: "Capacité de la 1ère batterie", value: electric["1st_battery_kwh_capacity"], action: <></> },
            shouldDisplay(electric["2nd_battery_kwh_capacity"]) && { data: "Capacité de la 2nde batterie", value: electric["2nd_battery_kwh_capacity"], action: <></> },
            shouldDisplay(electric["usable_2nd_battery_kwh_capacity"]) && { data: "Capacité utile de la 2nde batterie", value: electric["usable_2nd_battery_kwh_capacity"], action: <></> },
            shouldDisplay(electric.charging_plug) && { data: "Prise de recharge", value: electric.charging_plug, action: <></> },
            shouldDisplay(electric.dc_charger_power_kw) && { data: "Puissance du chargeur DC", value: electric.dc_charger_power_kw, action: <></> },
            shouldDisplay(electric.dc_charging_time_min) && { data: "Temps minimum de recharge DC", value: electric.dc_charging_time_min, action: <></> },
            shouldDisplay(electric.ac_charger_power_kw) && { data: "Puissance du chargeur AC", value: electric.ac_charger_power_kw, action: <></> },
            shouldDisplay(electric.ac_charging_time_80_home_min) && { data: "Temps de recharge à 80%", value: electric.ac_charging_time_80_home_min + " (en minutes)", action: <></> },
            shouldDisplay(electric.ac_charging_time_80_home_reinforced_min) && { data: "Temps de recharge renforcée à 80%", value: electric.ac_charging_time_80_home_reinforced_min + " (en minutes)", action: <></> },
            shouldDisplay(electric.ac_charging_time_80_wallbox_min) && { data: "Temps de recharge à une borne à 80%", value: electric.ac_charging_time_80_wallbox_min + " (en minutes)", action: <></> },
            shouldDisplay(electric.acceleration_0_100) && { data: "Temps de 0 à 100 km/h", value: electric.acceleration_0_100, action: <></> },
            shouldDisplay(electric.max_speed) && { data: "Vitesse maximale", value: electric.max_speed, action: <></> },
            shouldDisplay(electric.wltp_combined_autonomy_summer) && { data: "Autonomie en été (conduite mixte)", value: electric.wltp_combined_autonomy_summer, action: <></> },
            shouldDisplay(electric.wltp_combined_autonomy_winter) && { data: "Autonomie en hiver (conduite mixte)", value: electric.wltp_combined_autonomy_winter, action: <></> },
            shouldDisplay(electric.wltp_urban_autonomy_summer) && { data: "Autonomie en été (conduite urbaine)", value: electric.wltp_urban_autonomy_summer, action: <></> },
            shouldDisplay(electric.wltp_urban_autonomy_winter) && { data: "Autonomie en hiver (conduite urbaine)", value: electric.wltp_urban_autonomy_winter, action: <></> },
            shouldDisplay(electric.wltp_highway_autonomy_summer) && { data: "Autonomie en été (conduite sur autoroute)", value: electric.wltp_highway_autonomy_summer, action: <></> },
            shouldDisplay(electric.wltp_highway_autonomy_winter) && { data: "Autonomie en hiver (conduite sur autoroute)", value: electric.wltp_highway_autonomy_winter, action: <></> },
            shouldDisplay(electric.combined_consumption_kwh_100km_summer) && { data: "Consommation aux 100km en été (conduite mixte)", value: electric.combined_consumption_kwh_100km_summer, action: <></> },
            shouldDisplay(electric.combined_consumption_kwh_100km_winter) && { data: "Consommation aux 100km en hiver (conduite mixte)", value: electric.combined_consumption_kwh_100km_winter, action: <></> },
            shouldDisplay(electric.urban_consumption_kwh_100km_summer) && { data: "Consommation aux 100km en été (conduite urbaine)", value: electric.urban_consumption_kwh_100km_summer, action: <></> },
            shouldDisplay(electric.urban_consumption_kwh_100km_winter) && { data: "Consommation aux 100km en hiver (conduite urbaine)", value: electric.urban_consumption_kwh_100km_winter, action: <></> },
            shouldDisplay(electric.highway_consumption_kwh_100km_summer) && { data: "Consommation aux 100km en été (conduite sur autoroute)", value: electric.highway_consumption_kwh_100km_summer, action: <></> },
            shouldDisplay(electric.highway_consumption_kwh_100km_winter) && { data: "Consommation aux 100km en hiver (conduite sur autoroute)", value: electric.highway_consumption_kwh_100km_winter, action: <></> },
        ].filter(Boolean) as IDataRowTableV2[];
    }, [props.vehicle.information.energy, electric]);

    const dTires: IDataRowTableV2[] = useMemo(() => {
        if (tires === null || tires.length === 0) return [];
        const tiresData: IDataRowTableV2[] = [];
        for (let i = 0; i < tires.length; i++) {
            const tire = tires[i];
            const tireItems = [
                shouldDisplay(tire.front_display) && { data: "Référence pneu avant", value: tire.front_display, action: <></> },
                shouldDisplay(tire.front_width) && { data: "Largeur du pneu avant", value: tire.front_width, action: <></> },
                shouldDisplay(tire.front_ratio) && { data: "Rapport hauteur/largeur du pneu avant", value: tire.front_ratio, action: <></> },
                shouldDisplay(tire.front_radial) && { data: "Diamètre de la jante du pneu avant", value: tire.front_radial, action: <></> },
                shouldDisplay(tire.front_load) && { data: "Indice de charge du pneu avant", value: tire.front_load, action: <></> },
                shouldDisplay(tire.front_speed) && { data: "Indice de vitesse du pneu avant", value: tire.front_speed, action: <></> },
                shouldDisplay(tire.front_normal_pressure) && { data: "Pression recommandée du pneu avant", value: tire.front_normal_pressure, action: <></> },
                shouldDisplay(tire.front_highway_pressure) && { data: "Pression sur autoroute recommandée du pneu avant", value: tire.front_highway_pressure, action: <></> },
                tire.front_is_summer !== undefined && { data: "Pneu avant été", value: tire.front_is_summer ? "Oui" : "Non", action: <></> },
                tire.front_is_winter !== undefined && { data: "Pneu avant hiver", value: tire.front_is_winter ? "Oui" : "Non", action: <></> },
                tire.front_is_all_season !== undefined && { data: "Pneu avant 4 saisons", value: tire.front_is_all_season ? "Oui" : "Non", action: <></> },
                shouldDisplay(tire.rear_display) && { data: "Référence pneu arrière", value: tire.rear_display, action: <></> },
                shouldDisplay(tire.rear_width) && { data: "Largeur du pneu arrière", value: tire.rear_width, action: <></> },
                shouldDisplay(tire.rear_ratio) && { data: "Rapport hauteur/largeur du pneu arrière", value: tire.rear_ratio, action: <></> },
                shouldDisplay(tire.rear_radial) && { data: "Diamètre de la jante du pneu arrière", value: tire.rear_radial, action: <></> },
                shouldDisplay(tire.rear_load) && { data: "Indice de charge du pneu arrière", value: tire.rear_load, action: <></> },
                shouldDisplay(tire.rear_speed) && { data: "Indice de vitesse du pneu arrière", value: tire.rear_speed, action: <></> },
                shouldDisplay(tire.rear_normal_pressure) && { data: "Pression recommandée du pneu arrière", value: tire.rear_normal_pressure, action: <></> },
                shouldDisplay(tire.rear_highway_pressure) && { data: "Pression sur autoroute recommandée du pneu arrière", value: tire.rear_highway_pressure, action: <></> },
                tire.rear_is_summer !== undefined && { data: "Pneu arrière été", value: tire.rear_is_summer ? "Oui" : "Non", action: <></> },
                tire.rear_is_winter !== undefined && { data: "Pneu arrière hiver", value: tire.rear_is_winter ? "Oui" : "Non", action: <></> },
                tire.rear_is_all_season !== undefined && { data: "Pneu arrière 4 saisons", value: tire.rear_is_all_season ? "Oui" : "Non", action: <></> },
            ].filter(Boolean) as IDataRowTableV2[];
            tiresData.push(...tireItems);
        }
        return tiresData;
    }, [tires]);

    if (qVehicleStatus.isLoading) {
        return <Loading msg="Chargement des détails..." />;
    }

    return (
        <>
            <VehicleInformationBox vehicle={props.vehicle} />
            <div className="detail-main-box">

                {boitierData.length > 0 &&
                    <div>
                        <DetailItem key='boitierData' title="Boitier" data={boitierData} />
                    </div>
                }

                {motorisationData.length > 0 &&
                    <div>
                        <DetailItem key='motorisationData' title="Motorisation" data={motorisationData} />
                    </div>
                }

                {chassisData.length > 0 &&
                    <div>
                        <DetailItem key='chassisData' title="Chassis & carrosserie" data={chassisData} />
                    </div>
                }

                {adminData.length > 0 &&
                    <div>
                        <DetailItem key='adminData' title="Données administratives" data={adminData} />
                    </div>
                }

                {donneAdd.length > 0 &&
                    <div>
                        <DetailItem key='donneAdd' title="Données additionnelles" data={donneAdd} />
                    </div>
                }
                {insuranceData.length > 0 &&
                    <div>
                        <DetailItem key='insuranceData' title="Assurance" data={insuranceData} />
                    </div>
                }

                {acquisitionData.length > 0 &&
                    <div>
                        <DetailItem key='acquisitionData' title="Mode d'achat" data={acquisitionData} />
                    </div>
                }

                {dFluide.length > 0 &&
                    <div>
                        <DetailItem key='dFluide' title="Données fluides" data={dFluide} />
                    </div>
                }

                {dElectric.length > 0 &&
                    <div>
                        <DetailItem key='dElectric' title="Données électriques" data={dElectric} />
                    </div>
                }

                {dTires.length > 0 &&
                    <div>
                        <DetailItem key='dTires' title="Données pneumatiques" data={dTires} />
                    </div>
                }
            </div>

            <Drawer
                title={null}
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={400}
            >
                <AssistanceList
                    vehicleId={props.vehicle.id}
                    phoneNumber={props.vehicle.assistance?.phoneNumber}
                    distance={props.vehicle.assistance?.distance}
                    onClose={() => setIsDrawerOpen(false)}
                />
            </Drawer>
        </>
    );
}

export default DetailV2;
