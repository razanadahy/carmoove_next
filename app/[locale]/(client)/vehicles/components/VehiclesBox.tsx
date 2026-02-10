'use client'

import {IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import {
    sortVehiclesByMake,
    buildTypes,
    buildEnergies,
    buildMakes,
    buildModels,
    buildDrivers,
    buildRegistrations,
    energyTrueFormat
} from "@/services/VehiculesService";
import { fetchReservations } from "@/app/actions/reservations";
import ButtonModal from "@/components/Common/ButtonModal";
import StatusFilterModal from "./StatusFilterModal";
import VehicleRow from "./VehicleRow";
import "./VehiclesBox.css";
import {Loading} from "@/components/Common/Loading";

interface IVehiclesBoxProps {
    loading: boolean;
    allVehicles: IVehicle[];
}

const VehiclesBox = ({ loading, allVehicles }: IVehiclesBoxProps) => {
    const searchParams = useSearchParams();

    // Search state
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        setSearchText(searchParams.get('word') ?? "");
    }, [searchParams]);

    const regExp = useMemo(() => new RegExp(searchText, "gi"), [searchText]);

    // Filter states
    const [isAutopartage, setIsAutopartage] = useState<boolean | null>(null);
    const [selectedTypeTags, setSelectedTypeTags] = useState<string[]>([]);
    const [selectedEnergyTags, setSelectedEnergyTags] = useState<string[]>([]);
    const [selectedMakeTags, setSelectedMakeTags] = useState<string[]>([]);
    const [selectedModelTags, setSelectedModelTags] = useState<string[]>([]);
    const [selectedDriverTags, setSelectedDriverTags] = useState<string[]>([]);
    const [selectedRegistrationTags, setSelectedRegistrationTags] = useState<string[]>([]);

    // Status filter states
    const [statusFilters, setStatusFilters] = useState({
        connected: false,
        notConnected: false,
        noPrivacy: false,
        privacy: false,
        inCharge: false,
        parked: false,
        engineOn: false,
        ras: false,
        fault: false,
        maintenance: false,
        accident: false,
        towage: false,
        stolen: false,
        lowBatt: false,
        unavailable: false,
        available: false,
        unreserved: false,
        reserved: false,
        lowCharge: false,
        lowFuel: false,
    });

    // Available options for filters
    const [types, setTypes] = useState<string[]>([]);
    const [energies, setEnergies] = useState<string[]>([]);
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [registrations, setRegistrations] = useState<string[]>([]);
    const [reservations, setReservations] = useState<IReservation[]>([]);

    // Refs for keeping selected tags
    const selectedTypeTagsRef = useRef(selectedTypeTags);
    const selectedEnergyTagsRef = useRef(selectedEnergyTags);
    const selectedMakeTagsRef = useRef(selectedMakeTags);
    const selectedModelTagsRef = useRef(selectedModelTags);
    const selectedDriverTagsRef = useRef(selectedDriverTags);
    const selectedRegistrationTagsRef = useRef(selectedRegistrationTags);

    // Fetch reservations
    const qReservations = useQuery({
        queryKey: ['reservations_vehicles'],
        queryFn: () => fetchReservations({}),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (qReservations.data) {
            setReservations(qReservations.data);
        }
    }, [qReservations.data]);

    // Filter vehicles by search text
    const filteredInputVehicles = useMemo(() => {
        if (loading) return [];
        return allVehicles.filter((vehicle: IVehicle) =>
            vehicle.information.make.match(regExp) ||
            vehicle.information.model.match(regExp) ||
            vehicle.information.registration.match(regExp)
        );
    }, [allVehicles, regExp, loading]);

    // Apply all filters
    const resultVehicles = useMemo(() => {
        if (loading) return [];

        const {
            connected, notConnected, noPrivacy, privacy, inCharge, parked, engineOn,
            ras, fault, maintenance, accident, towage, stolen, lowBatt,
            unavailable, available, unreserved, reserved, lowCharge, lowFuel
        } = statusFilters;

        const filtered = filteredInputVehicles.filter((vehicle: IVehicle) => {
            return (
                (isAutopartage === null || (isAutopartage === vehicle.device?.carSharing) || (!isAutopartage && !vehicle.device?.carSharing)) &&
                (selectedTypeTags.length === 0 || selectedTypeTags.includes(vehicle.information.type)) &&
                (selectedEnergyTags.length === 0 || selectedEnergyTags.includes(vehicle.information.energy)) &&
                (selectedMakeTags.length === 0 || selectedMakeTags.includes(vehicle.information.make)) &&
                (selectedModelTags.length === 0 || selectedModelTags.includes(vehicle.information.model)) &&
                (selectedDriverTags.length === 0 || (vehicle.driver?.driverID && selectedDriverTags.includes(vehicle.driver?.firstName + ' ' + vehicle.driver?.lastName))) &&
                (selectedRegistrationTags.length === 0 || selectedRegistrationTags.includes(vehicle.information.registration)) &&
                (!connected || (connected && vehicle.device)) &&
                (!notConnected || (notConnected && !(vehicle.device))) &&
                (!privacy || (privacy && vehicle.status.privacy)) &&
                (!noPrivacy || (noPrivacy && !vehicle.status.privacy)) &&
                (!inCharge || (inCharge && vehicle.electricityStatus?.chargeInProgress)) &&
                (!parked || (parked && vehicle.status.parked === "ON")) &&
                (!engineOn || (engineOn && vehicle.status.engine === "ON")) &&
                (!fault || (fault && vehicle.status.fault === "ON") || (vehicle.device?.id && vehicle.stateCS?.state?.breakdown)) &&
                (!accident || (accident && vehicle.status.accident === "ON") || (vehicle.device?.id && vehicle.stateCS?.state?.accident)) &&
                (!towage || (towage && vehicle.status.towage === "ON") || (vehicle.device?.id && vehicle.stateCS?.state?.towing)) &&
                (!stolen || (stolen && vehicle.status.theft === "ON") || (vehicle.device?.id && vehicle.stateCS?.state?.stolen)) &&
                (!maintenance || (vehicle.device?.id && vehicle.stateCS?.state?.maintenance)) &&
                (!lowBatt || (vehicle.status.battery <= 12 && vehicle.status.battery > 0)) &&
                (!unavailable || (unavailable && vehicle.stateCS?.state?.unavailable)) &&
                (!available || (available && !vehicle.stateCS?.state?.unavailable)) &&
                (!ras || (ras && (!vehicle.stateCS?.state?.accident && !vehicle.stateCS?.state?.breakdown && !vehicle.stateCS?.state?.maintenance && !vehicle.stateCS?.state?.stolen && !vehicle.stateCS?.state?.towing))) &&
                (!reserved || (reserved && reservations.map(r => r.vehicleId).includes(vehicle.id))) &&
                (!unreserved || (unreserved && !(reservations.map(r => r.vehicleId).includes(vehicle.id)))) &&
                (!lowCharge || (vehicle.electricityStatus?.battery > 0 && vehicle.electricityStatus?.battery < 25)) &&
                (!lowFuel || (vehicle.device?.id && ((vehicle.status?.fuelPercent > 0 && vehicle.status?.fuelPercent < 25) || (vehicle.status?.fuelLevel > 0 && vehicle.status?.fuelLevel < 10))))
            );
        });
        return sortVehiclesByMake(filtered);
    }, [
        filteredInputVehicles,
        isAutopartage,
        selectedMakeTags,
        selectedTypeTags,
        selectedEnergyTags,
        selectedModelTags,
        selectedDriverTags,
        selectedRegistrationTags,
        statusFilters,
        reservations,
        loading
    ]);

    // Update available filter options
    useEffect(() => {
        setTypes([...buildTypes(filteredInputVehicles), ...selectedTypeTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
        setEnergies([...buildEnergies(filteredInputVehicles), ...selectedEnergyTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
        setMakes([...buildMakes(filteredInputVehicles), ...selectedMakeTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
        setModels([...buildModels(filteredInputVehicles), ...selectedModelTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
        setDrivers([...buildDrivers(filteredInputVehicles), ...selectedDriverTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
        setRegistrations([...buildRegistrations(filteredInputVehicles), ...selectedRegistrationTagsRef.current].filter((el, i, arr) => arr.indexOf(el) === i));
    }, [filteredInputVehicles]);

    // Update filter options when filters change
    useEffect(() => {
        setTypes(buildTypes(resultVehicles));
        setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setModels(buildModels(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [isAutopartage, statusFilters]);

    const hasActiveStatusFilter = Object.values(statusFilters).some(v => v);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
        >
            <div className="vehicles-page">
                <div className="search-box mb-3 w-100">
                    <Input
                        placeholder="Rechercher un véhicule..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        prefix={<SearchOutlined />}
                        className="search-input py-2 rounded-2"
                    />
                </div>

                <div className="filter-buttons d-flex flex-wrap gap-2 mb-3">
                    {/* Usage filter */}
                    <ButtonModal
                        title="Usage"
                        elements={[
                            { value: 'autopartage', label: 'Autopartage' },
                            { value: 'individuel', label: 'Individuel' }
                        ]}
                        elementsChecked={isAutopartage !== null
                            ? [{ value: isAutopartage ? 'autopartage' : 'individuel', label: isAutopartage ? 'Autopartage' : 'Individuel' }]
                            : []
                        }
                        setElementChecked={(items) => {
                            if (items.length === 0) {
                                setIsAutopartage(null);
                            } else {
                                setIsAutopartage(items[items.length - 1].value === 'autopartage');
                            }
                        }}
                        getKey={(el) => el.value}
                        getLabel={(el) => el.label}
                    />

                    {/* Type filter */}
                    <ButtonModal
                        title="Type"
                        elements={types}
                        elementsChecked={selectedTypeTags}
                        setElementChecked={setSelectedTypeTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
                    />

                    {/* Energy filter */}
                    <ButtonModal
                        title="Energie"
                        elements={energies}
                        elementsChecked={selectedEnergyTags}
                        setElementChecked={setSelectedEnergyTags}
                        getKey={(el) => el}
                        getLabel={(el) => energyTrueFormat(el)}
                    />

                    {/* Make filter */}
                    <ButtonModal
                        title="Marque"
                        elements={makes}
                        elementsChecked={selectedMakeTags}
                        setElementChecked={setSelectedMakeTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
                    />

                    {/* Model filter */}
                    <ButtonModal
                        title="Modèle"
                        elements={models}
                        elementsChecked={selectedModelTags}
                        setElementChecked={setSelectedModelTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
                    />

                    {/* Driver filter */}
                    <ButtonModal
                        title="Conducteur"
                        elements={drivers}
                        elementsChecked={selectedDriverTags}
                        setElementChecked={setSelectedDriverTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
                    />

                    {/* Registration filter */}
                    <ButtonModal
                        title="Immatriculation"
                        elements={registrations}
                        elementsChecked={selectedRegistrationTags}
                        setElementChecked={setSelectedRegistrationTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
                    />

                    {/* Status filter */}
                    <StatusFilterModal
                        filters={statusFilters}
                        setFilters={setStatusFilters}
                        isActive={hasActiveStatusFilter}
                    />
                </div>

                <div className="vehicle-list">
                    {loading ? (
                        <Loading msg={"Chargement des véhicules..."}/>
                    ) : resultVehicles.length === 0 ? (
                        <div className="no-vehicles">
                            <p>Aucun véhicule trouvé</p>
                        </div>
                    ) : (
                        resultVehicles.map((vehicle: IVehicle) => (
                            <VehicleRow vehicle={vehicle} key={vehicle.id} />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default VehiclesBox;
