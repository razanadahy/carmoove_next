"use client"

import { Card } from "antd";
import {IReservation, IVehicle, IVehicleStatusCS} from "@/lib/hooks/Interfaces";
import {useEffect, useMemo, useState} from "react";
import {useVehiclesWithStatus} from "@/lib/hooks";
import {RedoOutlined} from "@ant-design/icons";

import icon_connected from "@/assets/image/statut/new2/connected.svg";
import icon_not_connected from "@/assets/image/statut/new2/not-connected.svg";
import icon_engine_on from "@/assets/image/statut/new/running-car.svg";
import icon_inCharge from "@/assets/image/statut/new/charging.svg";
import icon_fault from "@/assets/image/statut/new/warning.svg";
import icon_parked from "@/assets/image/statut/new/parked.svg";
import icon_stolen from "@/assets/image/statut/new/theft.svg";
import icon_towage from "@/assets/image/statut/new/impound.svg";
import icon_maintenance from "@/assets/image/statut/new/service.svg";
import icon_privacy from "@/assets/image/statut/new2/location-off-ionic.svg";
import icon_no_privacy from "@/assets/image/statut/new2/location-ionic.svg";
import icon_accident from "@/assets/image/statut/new/damaged.svg";
import icon_low_battery from "@/assets/image/statut/new/battery-down.svg";
import available_i from "@/assets/image/vehicle/available.svg";
import unavailable_i from "@/assets/image/vehicle/unavailable.svg";
import ras_i from "@/assets/image/vehicle/ras.svg";
import reserved_i from "@/assets/image/dashboard/reserved.svg";
import unreserved_i from "@/assets/image/dashboard/unreserved.svg";
import lowCharge_i from "@/assets/image/dashboard/low-charge.svg";
import lowFuel_i from "@/assets/image/dashboard/low-fuel.svg";
import VehicleStatus from "@/components/Common/VehicleStatus/VehicleStatus";

interface VehicleStatusBarProps {
    vehicles: IVehicle[];
    reservations: IReservation[];
}

export default function VehicleStatusBar(props: VehicleStatusBarProps) {
    const [countConnected, setCountConnected] = useState<number>(0);
    const [countNotConnected, setCountNotConnected] = useState<number>(0);
    const [countPrivacy, setCountPrivacy] = useState<number>(0);
    const [countNoPrivacy, setCountNoPrivacy] = useState<number>(0);
    const [countInCharge, setCountInCharge] = useState<number>(0);
    const [countParked, setCountParked] = useState<number>(0);
    const [countEnginOn, setCountEnginOn] = useState<number>(0);
    const [countLowBattery, setCountLowBattery] = useState<number>(0);
    const [countLowFuel, setCountLowFuel] = useState<number>(0);
    const [countLowCharge, setCountLowCharge] = useState<number>(0);

    const [vehiclesConnected, setVehiclesConnected] = useState<IVehicle[]>([]);
    const [vehiclesNotConnected, setVehiclesNotConnected] = useState<IVehicle[]>([]);
    const [vehiclesPrivacy, setVehiclesPrivacy] = useState<IVehicle[]>([]);
    const [vehiclesNoPrivacy, setVehiclesNoPrivacy] = useState<IVehicle[]>([]);
    const [vehiclesInCharge, setVehiclesInCharge] = useState<IVehicle[]>([]);
    const [vehiclesParked, setVehiclesParked] = useState<IVehicle[]>([]);
    const [vehiclesEnginOn, setVehiclesEnginOn] = useState<IVehicle[]>([]);
    const [vehiclesLowBattery, setVehiclesLowBattery] = useState<IVehicle[]>([]);


    const [countUnavailable, setCountUnavailable] = useState<number>(0)
    const [countAvailable, setCountAvailable] = useState<number>(0)
    const [countTowage, setCountTowage] = useState<number>(0)
    const [countAccident, setCountAccident] = useState<number>(0)
    const [countStolen, setCountStolen] = useState<number>(0)
    const [countFault, setCountFault] = useState<number>(0)
    const [countMaintenance, setCountMaintenance] = useState<number>(0)
    const [countRas, setCountRas] = useState<number>(0)
    const [countReserved, setCountReserved] = useState<number>(0)
    const [countUnreserved, setCountUnreserved] = useState<number>(0)

    const [vehiclesUnavailable, setVehiclesUnavailable] = useState<IVehicle[]>([])
    const [vehiclesAvailable, setVehiclesAvailable] = useState<IVehicle[]>([])
    const [vehiclesTowage, setVehiclesTowage] = useState<IVehicle[]>([])
    const [vehiclesAccident, setVehiclesAccident] = useState<IVehicle[]>([])
    const [vehiclesStolen, setVehiclesStolen] = useState<IVehicle[]>([])
    const [vehiclesFault, setVehiclesFault] = useState<IVehicle[]>([])
    const [vehiclesMaintenance, setVehiclesMaintenance] = useState<IVehicle[]>([])
    const [vehiclesRas, setVehiclesRas] = useState<IVehicle[]>([])
    const [vehiclesReserved, setVehiclesReserved] = useState<IVehicle[]>([])

    const [vehicleData, setVehicleData] = useState<IVehicle[]>(props.vehicles)
    useEffect(() => {
        setVehicleData(props.vehicles)
    }, [props.vehicles]);
    const { vehiclesStatusWithLoading: vehicles, isLoading: load, refetch } = useVehiclesWithStatus(vehicleData);
    const loadData = ()=>{
        refetch().then((rep)=>{
            console.log("huhu")
        }).finally(()=>{
            console.log("clicde....")
        })
    }

    const [isLoadingQmStatusCS, setLoad] = useState(true)
    useEffect(() => {
        if (props.vehicles.length===0 || load){
            setLoad(true)
        }else{
            setLoad(false)
        }
    }, [props.vehicles, load]);

    const vehiclesConnected_ =useMemo(() =>  vehicles.filter(vehicle => vehicle.device?.id), [vehicles])

    useEffect(() => {
        const statusByVehicle_: IVehicleStatusCS[] = vehiclesConnected_.map(v => v.stateCS)
            .filter((s): s is IVehicleStatusCS => s !== undefined)

        setCountUnavailable(statusByVehicle_.filter(status => status.state.unavailable).length)
        setCountAvailable(statusByVehicle_.filter(status => !status.state.unavailable).length)
        setCountTowage(statusByVehicle_.filter(status => status.state.towing).length)
        setCountAccident(statusByVehicle_.filter(status => status.state.accident).length)
        setCountStolen(statusByVehicle_.filter(status => status.state.stolen).length)
        setCountFault(statusByVehicle_.filter(status => status.state.breakdown).length)
        setCountMaintenance(statusByVehicle_.filter(status => status.state.maintenance).length)
        setCountRas(statusByVehicle_.filter(status =>
            !status.state.towing &&
            !status.state.accident &&
            !status.state.stolen &&
            !status.state.breakdown &&
            !status.state.maintenance
        ).length)

        setVehiclesUnavailable(vehicles.filter(v => v.stateCS?.state.unavailable))
        setVehiclesAvailable(vehicles.filter(v => !v.stateCS?.state.unavailable))
        setVehiclesTowage(vehicles.filter(v => v.stateCS?.state.towing))
        setVehiclesAccident(vehicles.filter(v => v.stateCS?.state.accident))
        setVehiclesStolen(vehicles.filter(v => v.stateCS?.state.stolen))
        setVehiclesFault(vehicles.filter(v => v.stateCS?.state.breakdown))
        setVehiclesMaintenance(vehicles.filter(v => v.stateCS?.state.maintenance))
        setVehiclesRas(vehicles.filter(v =>
            !v.stateCS?.state.towing &&
            !v.stateCS?.state.accident &&
            !v.stateCS?.state.stolen &&
            !v.stateCS?.state.breakdown &&
            !v.stateCS?.state.maintenance
        ))
    }, [ vehiclesConnected_, vehicles])

    useEffect(() => {
        const reservations = props.reservations
        setCountReserved(props.reservations.length)
        setVehiclesReserved(vehicles.filter(v => reservations.map(r => r.vehicleId).includes(v.id)))
    }, [props.reservations, vehicles])

    useEffect(() => {
        setCountUnreserved(countAvailable - countReserved)
    }, [countReserved, countAvailable])

    useEffect(() => {
        let tempCountConnected = 0;
        let tempCountNotConnected = 0;
        let tempCountPrivacy = 0;
        let tempCountNoPrivacy = 0;
        let tempCountInCharge = 0;
        let tempCountParked = 0;
        let tempCountEnginOn = 0;
        let tempCountLowBattery = 0;
        let tempCountLowFuel = 0;
        let tempCountLowCharge = 0;

        let tempVehiclesConnected: IVehicle[] = [];
        let tempVehiclesNotConnected: IVehicle[] = [];
        let tempVehiclesPrivacy: IVehicle[] = [];
        let tempVehiclesNoPrivacy: IVehicle[] = [];
        let tempVehiclesInCharge: IVehicle[] = [];
        let tempVehiclesParked: IVehicle[] = [];
        let tempVehiclesEnginOn: IVehicle[] = [];
        let tempVehiclesLowBattery: IVehicle[] = [];

        vehicles.forEach((vehicle: IVehicle) => {
            if (vehicle.device?.id) {
                tempCountConnected++;
                tempVehiclesConnected.push(vehicle);
            } else {
                tempCountNotConnected++;
                tempVehiclesNotConnected.push(vehicle);
            }

            if (vehicle.status.privacy && vehicle.device?.id) {
                tempCountPrivacy++;
                tempVehiclesPrivacy.push(vehicle);
            } else if ((!vehicle.status.privacy && vehicle.device?.id)) {
                tempCountNoPrivacy++;
                tempVehiclesNoPrivacy.push(vehicle);
            }

            try {
                if (vehicle.electricityStatus.chargeInProgress) {
                    tempCountInCharge++;
                    tempVehiclesInCharge.push(vehicle);
                }
            } catch (e) {
                // Handle error silently
            }

            if (vehicle.status.parked === "ON" && vehicle.device?.id) {
                tempCountParked++;
                tempVehiclesParked.push(vehicle);
            }

            if (vehicle.status.engine === "ON" && vehicle.device?.id) {
                tempCountEnginOn++;
                tempVehiclesEnginOn.push(vehicle);
            }

            if (vehicle.status.battery <= 12 && vehicle.status.battery > 0) {
                tempCountLowBattery++;
                tempVehiclesLowBattery.push(vehicle);
            }

            if (vehicle.electricityStatus?.battery > 0 && vehicle.electricityStatus?.battery < 25) {
                tempCountLowCharge++;
            }

            if (vehicle.device?.id && ((vehicle.status?.fuelPercent > 0 && vehicle.status?.fuelPercent < 25) || (vehicle.status?.fuelLevel > 0 && vehicle.status?.fuelLevel < 10))) {
                tempCountLowFuel++;
            }
        });

        setCountConnected(tempCountConnected);
        setCountNotConnected(tempCountNotConnected);
        setCountPrivacy(tempCountPrivacy);
        setCountNoPrivacy(tempCountNoPrivacy);
        setCountInCharge(tempCountInCharge);
        setCountParked(tempCountParked);
        setCountEnginOn(tempCountEnginOn);
        setCountLowBattery(tempCountLowBattery);
        setCountLowFuel(tempCountLowFuel);
        setCountLowCharge(tempCountLowCharge);

        setVehiclesConnected(tempVehiclesConnected);
        setVehiclesNotConnected(tempVehiclesNotConnected);
        setVehiclesPrivacy(tempVehiclesPrivacy);
        setVehiclesNoPrivacy(tempVehiclesNoPrivacy);
        setVehiclesInCharge(tempVehiclesInCharge);
        setVehiclesParked(tempVehiclesParked);
        setVehiclesEnginOn(tempVehiclesEnginOn);
        setVehiclesLowBattery(tempVehiclesLowBattery);
    }, [vehicles, props.vehicles]);

    return (
        <Card
            title="Statut des véhicules"
            extra={<div id="reload-btn-status" onClick={loadData}><RedoOutlined spin={isLoadingQmStatusCS} style={{color: '#39A1D8', fontWeight: 'bold', fontSize: '1.45rem'}} /></div>}
        >
            <div className="w-100 d-flex flex-column gap-2">
                <div className="d-flex flex-row gap-2">
                    {countConnected > 0 && (<VehicleStatus icon={icon_connected} count={countConnected} tooltip="Connecté" link="/vehicles?connected=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countNotConnected > 0 && (<VehicleStatus icon={icon_not_connected} count={countNotConnected} tooltip="Non connecté" link="/vehicles?notconnected=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countNoPrivacy > 0 && (<VehicleStatus icon={icon_no_privacy} count={countNoPrivacy} tooltip="Géolocalisation permanente" link="/vehicles?noprivacy=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countPrivacy > 0 && (<VehicleStatus icon={icon_privacy} count={countPrivacy} tooltip="Smart géolocalisation activé" link="/vehicles?privacy=yes" isLoading={isLoadingQmStatusCS} />)}
                </div>
                <div className="d-flex flex-row gap-2">
                    {countAvailable > 0 && (<VehicleStatus icon={available_i} count={countAvailable} tooltip="Disponible" link="/vehicles?available=yes" isLoading={isLoadingQmStatusCS}/>)}
                    {countUnavailable > 0 && (<VehicleStatus icon={unavailable_i} count={countUnavailable} tooltip="Indisponible" link="/vehicles?unavailable=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countReserved > 0 && (<VehicleStatus icon={reserved_i} count={countReserved} tooltip="Réservé" link="/vehicles?reserved=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countUnreserved > 0 && (<VehicleStatus icon={unreserved_i} count={countUnreserved} tooltip="Non réservé" link="/vehicles?unreserved=yes" isLoading={isLoadingQmStatusCS}/>)}
                </div>
                <div className="d-flex flex-row gap-2">
                    {countInCharge > 0 && <VehicleStatus icon={icon_inCharge} count={countInCharge} tooltip="En charge" link="/vehicles?incharge=yes" isLoading={isLoadingQmStatusCS} />}
                    {countParked > 0 && <VehicleStatus icon={icon_parked} count={countParked} tooltip="En stationnement" link="/vehicles?parked=yes" isLoading={isLoadingQmStatusCS} />}
                    {countEnginOn > 0 && <VehicleStatus icon={icon_engine_on} count={countEnginOn} tooltip="En déplacement" link="/vehicles?engineon=yes" isLoading={isLoadingQmStatusCS} />}
                </div>
                <div className="d-flex flex-row gap-2">
                    {countRas > 0 && <VehicleStatus icon={ras_i} count={countRas} tooltip="Aucune anomalie" link="/vehicles?ras=yes" isLoading={isLoadingQmStatusCS}/>}
                    {countLowBattery > 0 && (<VehicleStatus icon={icon_low_battery} count={countLowBattery} tooltip="Tension de batterie faible" link="/vehicles?lowbatt=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countFault > 0 && <VehicleStatus icon={icon_fault} count={countFault} tooltip="Code défaut" link="/vehicles?fault=yes" isLoading={isLoadingQmStatusCS} />}
                    {countMaintenance > 0 && <VehicleStatus icon={icon_maintenance} count={countMaintenance} tooltip="Entretien à faire" link="/vehicles?maintenance=yes" isLoading={isLoadingQmStatusCS} />}
                    {countAccident > 0 && (<VehicleStatus icon={icon_accident} count={countAccident} tooltip="Accidenté" link="/vehicles?accident=yes" isLoading={isLoadingQmStatusCS} />)}
                    {countTowage > 0 && <VehicleStatus icon={icon_towage} count={countTowage} tooltip="Fourriére" link="/vehicles?towage=yes" isLoading={isLoadingQmStatusCS} />}
                    {countStolen > 0 && <VehicleStatus icon={icon_stolen} count={countStolen} tooltip="Volé" link="/vehicles?stolen=yes" isLoading={isLoadingQmStatusCS} />}
                </div>
                <div className="d-flex flex-row gap-2">
                    {countLowCharge > 0 && <VehicleStatus icon={lowCharge_i} count={countLowCharge} tooltip="Charge de batterie faible" link="/vehicles?lowcharge=yes" isLoading={isLoadingQmStatusCS} />}
                    {countLowFuel > 0 && <VehicleStatus icon={lowFuel_i} count={countLowFuel} tooltip="Niveau de carburant faible" link="/vehicles?lowfuel=yes" isLoading={isLoadingQmStatusCS}/>}
                </div>
            </div>
        </Card>
    );
}
