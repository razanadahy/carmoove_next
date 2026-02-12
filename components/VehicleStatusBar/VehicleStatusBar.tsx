'use client';

import { useEffect, useMemo, useState } from "react";
import { RedoOutlined } from "@ant-design/icons";
import { IVehicle, IReservation, IVehicleStatusCS } from "@/lib/hooks/Interfaces";
import { useVehiclesWithStatus } from "@/lib/hooks";
import VehicleStatus from "@/components/Common/VehicleStatus/VehicleStatus";

// Icons
import icon_no_privacy from "@/assets/image/statut/new2/location-ionic.svg";
import icon_engine_on from "@/assets/image/statut/new/running-car.svg";
import icon_inCharge from "@/assets/image/statut/new/charging.svg";
import icon_fault from "@/assets/image/statut/new/warning.svg";
import icon_parked from "@/assets/image/statut/new/parked.svg";
import icon_stolen from "@/assets/image/statut/new/theft.svg";
import icon_towage from "@/assets/image/statut/new/impound.svg";
import icon_maintenance from "@/assets/image/statut/new/service.svg";
import icon_accident from "@/assets/image/statut/new/damaged.svg";
import icon_low_battery from "@/assets/image/statut/new/battery-down.svg";
import unavailable_i from "@/assets/image/vehicle/unavailable.svg";
import reserved_i from "@/assets/image/dashboard/reserved.svg";

import "./VehicleStatusBar.css";

interface IPropsVehicleStatusBar {
    vehicles: IVehicle[];
    reservations: IReservation[];
    onSelectVehicles: (vehicles: IVehicle[]) => void;
    flexCol?: boolean
}

export default function VehicleStatusBar({vehicles: propsVehicles, reservations, onSelectVehicles, flexCol = true}: IPropsVehicleStatusBar) {
    const [vehicleData, setVehicleData] = useState<IVehicle[]>(propsVehicles);

    useEffect(() => {
        setVehicleData(propsVehicles);
    }, [propsVehicles]);

    const { vehiclesStatusWithLoading: vehicles, isLoading: load, refetch } = useVehiclesWithStatus(vehicleData);

    const [isLoadingQmStatusCS, setLoad] = useState(true);

    useEffect(() => {
        if (propsVehicles.length === 0 || load) {
            setLoad(true);
        } else {
            setLoad(false);
        }
    }, [propsVehicles, load]);

    const loadData = () => {
        refetch();
    };

    const vehiclesConnected_ = useMemo(
        () => vehicles.filter(vehicle => vehicle.device?.id),
        [vehicles]
    );

    // Status counts and vehicle arrays
    const [countNoPrivacy, setCountNoPrivacy] = useState(0);
    const [countInCharge, setCountInCharge] = useState(0);
    const [countParked, setCountParked] = useState(0);
    const [countEnginOn, setCountEnginOn] = useState(0);
    const [countLowBattery, setCountLowBattery] = useState(0);
    const [countUnavailable, setCountUnavailable] = useState(0);
    const [countTowage, setCountTowage] = useState(0);
    const [countAccident, setCountAccident] = useState(0);
    const [countStolen, setCountStolen] = useState(0);
    const [countFault, setCountFault] = useState(0);
    const [countMaintenance, setCountMaintenance] = useState(0);
    const [countReserved, setCountReserved] = useState(0);

    const [vehiclesNoPrivacy, setVehiclesNoPrivacy] = useState<IVehicle[]>([]);
    const [vehiclesInCharge, setVehiclesInCharge] = useState<IVehicle[]>([]);
    const [vehiclesParked, setVehiclesParked] = useState<IVehicle[]>([]);
    const [vehiclesEnginOn, setVehiclesEnginOn] = useState<IVehicle[]>([]);
    const [vehiclesLowBattery, setVehiclesLowBattery] = useState<IVehicle[]>([]);
    const [vehiclesUnavailable, setVehiclesUnavailable] = useState<IVehicle[]>([]);
    const [vehiclesTowage, setVehiclesTowage] = useState<IVehicle[]>([]);
    const [vehiclesAccident, setVehiclesAccident] = useState<IVehicle[]>([]);
    const [vehiclesStolen, setVehiclesStolen] = useState<IVehicle[]>([]);
    const [vehiclesFault, setVehiclesFault] = useState<IVehicle[]>([]);
    const [vehiclesMaintenance, setVehiclesMaintenance] = useState<IVehicle[]>([]);
    const [vehiclesReserved, setVehiclesReserved] = useState<IVehicle[]>([]);

    // Calculate status from stateCS
    useEffect(() => {
        const statusByVehicle_: IVehicleStatusCS[] = vehiclesConnected_
            .map(v => v.stateCS)
            .filter((s): s is IVehicleStatusCS => s !== undefined);

        setCountUnavailable(statusByVehicle_.filter(status => status.state.unavailable).length);
        setCountTowage(statusByVehicle_.filter(status => status.state.towing).length);
        setCountAccident(statusByVehicle_.filter(status => status.state.accident).length);
        setCountStolen(statusByVehicle_.filter(status => status.state.stolen).length);
        setCountFault(statusByVehicle_.filter(status => status.state.breakdown).length);
        setCountMaintenance(statusByVehicle_.filter(status => status.state.maintenance).length);

        setVehiclesUnavailable(vehicles.filter(v => v.stateCS?.state.unavailable));
        setVehiclesTowage(vehicles.filter(v => v.stateCS?.state.towing));
        setVehiclesAccident(vehicles.filter(v => v.stateCS?.state.accident));
        setVehiclesStolen(vehicles.filter(v => v.stateCS?.state.stolen));
        setVehiclesFault(vehicles.filter(v => v.stateCS?.state.breakdown));
        setVehiclesMaintenance(vehicles.filter(v => v.stateCS?.state.maintenance));
    }, [vehiclesConnected_, vehicles]);

    // Reservations
    useEffect(() => {
        setCountReserved(reservations.length);
        setVehiclesReserved(
            vehicles.filter(v => reservations.map(r => r.vehicleId).includes(v.id))
        );
    }, [reservations, vehicles]);

    // Other statuses
    useEffect(() => {
        let tempCountNoPrivacy = 0;
        let tempCountInCharge = 0;
        let tempCountParked = 0;
        let tempCountEnginOn = 0;
        let tempCountLowBattery = 0;

        const tempVehiclesNoPrivacy: IVehicle[] = [];
        const tempVehiclesInCharge: IVehicle[] = [];
        const tempVehiclesParked: IVehicle[] = [];
        const tempVehiclesEnginOn: IVehicle[] = [];
        const tempVehiclesLowBattery: IVehicle[] = [];

        vehicles.forEach((vehicle: IVehicle) => {
            if (!vehicle.status.privacy && vehicle.device?.id) {
                tempCountNoPrivacy++;
                tempVehiclesNoPrivacy.push(vehicle);
            }

            try {
                if (vehicle.electricityStatus?.chargeInProgress) {
                    tempCountInCharge++;
                    tempVehiclesInCharge.push(vehicle);
                }
            } catch {
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
        });

        setCountNoPrivacy(tempCountNoPrivacy);
        setCountInCharge(tempCountInCharge);
        setCountParked(tempCountParked);
        setCountEnginOn(tempCountEnginOn);
        setCountLowBattery(tempCountLowBattery);

        setVehiclesNoPrivacy(tempVehiclesNoPrivacy);
        setVehiclesInCharge(tempVehiclesInCharge);
        setVehiclesParked(tempVehiclesParked);
        setVehiclesEnginOn(tempVehiclesEnginOn);
        setVehiclesLowBattery(tempVehiclesLowBattery);
    }, [vehicles, propsVehicles]);

    return (
        <div className="vehicle-status-bar-map" style={{display: 'flex', flexDirection: flexCol ? 'column' : 'row'}}>
            <div className="reload-btn-status" onClick={loadData}>
                <RedoOutlined
                    spin={isLoadingQmStatusCS}
                    style={{ color: '#39A1D8', fontWeight: 'bold', fontSize: '1.2rem' }}
                />
            </div>

            {countNoPrivacy > 0 && (
                <VehicleStatus
                    icon={icon_no_privacy}
                    count={countNoPrivacy}
                    vehicles={vehiclesNoPrivacy}
                    tooltip="Géolocalisation permanente"
                    link="/vehicles?noprivacy=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countParked > 0 && (
                <VehicleStatus
                    icon={icon_parked}
                    count={countParked}
                    vehicles={vehiclesParked}
                    tooltip="En stationnement"
                    link="/vehicles?parked=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countInCharge > 0 && (
                <VehicleStatus
                    icon={icon_inCharge}
                    count={countInCharge}
                    vehicles={vehiclesInCharge}
                    tooltip="En charge"
                    link="/vehicles?incharge=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countEnginOn > 0 && (
                <VehicleStatus
                    icon={icon_engine_on}
                    count={countEnginOn}
                    vehicles={vehiclesEnginOn}
                    tooltip="En déplacement"
                    link="/vehicles?engineon=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countMaintenance > 0 && (
                <VehicleStatus
                    icon={icon_maintenance}
                    count={countMaintenance}
                    vehicles={vehiclesMaintenance}
                    tooltip="Entretien à faire"
                    link="/vehicles?maintenance=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countFault > 0 && (
                <VehicleStatus
                    icon={icon_fault}
                    count={countFault}
                    vehicles={vehiclesFault}
                    tooltip="Code défaut"
                    link="/vehicles?fault=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countAccident > 0 && (
                <VehicleStatus
                    icon={icon_accident}
                    count={countAccident}
                    vehicles={vehiclesAccident}
                    tooltip="Accidenté"
                    link="/vehicles?accident=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countTowage > 0 && (
                <VehicleStatus
                    icon={icon_towage}
                    count={countTowage}
                    vehicles={vehiclesTowage}
                    tooltip="Fourrière"
                    link="/vehicles?towage=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countStolen > 0 && (
                <VehicleStatus
                    icon={icon_stolen}
                    count={countStolen}
                    vehicles={vehiclesStolen}
                    tooltip="Volé"
                    link="/vehicles?stolen=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countUnavailable > 0 && (
                <VehicleStatus
                    icon={unavailable_i}
                    count={countUnavailable}
                    vehicles={vehiclesUnavailable}
                    tooltip="Indisponible"
                    link="/vehicles?unavailable=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countLowBattery > 0 && (
                <VehicleStatus
                    icon={icon_low_battery}
                    count={countLowBattery}
                    vehicles={vehiclesLowBattery}
                    tooltip="Tension de batterie faible"
                    link="/vehicles?lowbatt=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
            {countReserved > 0 && (
                <VehicleStatus
                    icon={reserved_i}
                    count={countReserved}
                    vehicles={vehiclesReserved}
                    tooltip="Réservé"
                    link="/vehicles?reserved=yes"
                    isLoading={isLoadingQmStatusCS}
                    onSelectVehicles={onSelectVehicles}
                />
            )}
        </div>
    );
}
