'use client'

import React, { JSX, ReactElement, useEffect, useMemo, useState } from "react";
import { Button, InputNumber, Dropdown, Input, DatePicker, Form, Transfer, App, Modal } from "antd";
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
        enabled: !!props.vehicle.device?.id,
        retry: false
    });

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

    if (qVehicleStatus.isLoading) {
        return <Loading msg="Chargement des détails..." />;
    }

    return (
        <>
            <VehicleInformationBox vehicle={props.vehicle} />
            <div className="row detail-main-box">
                <div className="col">
                    {boitierData.length > 0 && <DetailItem key='boitierData' title="Boitier" data={boitierData} />}
                    {motorisationData.length > 0 && <DetailItem key='motorisationData' title="Motorisation" data={motorisationData} />}
                </div>
                <div className="col">
                    {chassisData.length > 0 && <DetailItem key='chassisData' title="Chassis & carrosserie" data={chassisData} />}
                </div>
            </div>
        </>
    );
}

export default DetailV2;
