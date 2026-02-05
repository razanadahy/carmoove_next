'use client'

import { IUser, IVehicle } from "@/lib/hooks/Interfaces";
import './Alerts.css';
import { DatePicker, Select, Grid } from "antd";
import { getUnixTime, getYear } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    buildDrivers,
    buildEnergies,
    buildMakes,
    buildModels,
    buildRegistrations,
    sortVehiclesByMake
} from "@/services/VehiculesService";
import AlertsList from "./AlertsList";
import ButtonModal from "@/components/Common/ButtonModal";

export interface IFromTo {
    from: number;
    to: number;
}

const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

interface IAlertsProps {
    user: IUser;
    vehicles: IVehicle[];
}

const categories = [
    { value: 'sharing', label: 'Partage' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Sécurité' },
    { value: 'fault', label: 'Défauts et pannes' },
    { value: 'device', label: 'Boitier' },
];

function Alerts({ user, vehicles }: IAlertsProps) {
    const screens = useBreakpoint();

    const [isAutopartage, setIsAutopartage] = useState<boolean | null>(null);

    const [selectedCategoryTags, setSelectedCategoryTags] = useState<{ value: string; label: string }[]>([]);
    const [selectedEnergyTags, setSelectedEnergyTags] = useState<string[]>([]);
    const [selectedMakeTags, setSelectedMakeTags] = useState<string[]>([]);
    const [selectedModelTags, setSelectedModelTags] = useState<string[]>([]);
    const [selectedDriverTags, setSelectedDriverTags] = useState<string[]>([]);
    const [selectedRegistrationTags, setSelectedRegistrationTags] = useState<string[]>([]);

    const [energies, setEnergies] = useState<string[]>([]);
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [registrations, setRegistrations] = useState<string[]>([]);

    const selectedEnergyTagsRef = useRef(selectedEnergyTags);
    const selectedMakeTagsRef = useRef(selectedMakeTags);
    const selectedModelTagsRef = useRef(selectedModelTags);
    const selectedDriverTagsRef = useRef(selectedDriverTags);
    const selectedRegistrationTagsRef = useRef(selectedRegistrationTags);

    const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [fromTo, setFromTo] = useState<IFromTo | null>(null);
    const [valueSelect, setValueSelect] = useState<string>("");

    const month = user.company ? user.company.fiscal_year.month - 1 : 0;

    const predefinedRanges: Record<string, [Dayjs, Dayjs]> = {
        "Aujourd'hui": [dayjs().startOf("day"), dayjs().endOf("day")],
        "Hier": [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")],
        "Les 7 derniers jours": [dayjs().subtract(7, "day"), dayjs()],
        "Les 90 derniers jours": [dayjs().subtract(90, "day"), dayjs()],
        "Les 12 derniers mois": [dayjs().subtract(12, "month"), dayjs()],
        "Année civile en cours": [dayjs().startOf("year"), dayjs().endOf("year")],
        "Année fiscale en cours": [dayjs(new Date(getYear(new Date()), month, 1)), dayjs().endOf("day")]
    };

    const resultVehicles = useMemo(() => {
        const filtered = vehicles.filter((vehicle: IVehicle) =>
            (isAutopartage === null || (isAutopartage === vehicle.device?.carSharing) || (!isAutopartage && !vehicle.device?.carSharing)) &&
            (selectedEnergyTags.length === 0 || selectedEnergyTags.includes(vehicle.information.energy)) &&
            (selectedMakeTags.length === 0 || selectedMakeTags.includes(vehicle.information.make)) &&
            (selectedModelTags.length === 0 || selectedModelTags.includes(vehicle.information.model)) &&
            (selectedDriverTags.length === 0 || (vehicle.driver?.driverID && selectedDriverTags.includes(vehicle.driver?.firstName + ' ' + vehicle.driver?.lastName))) &&
            (selectedRegistrationTags.length === 0 || selectedRegistrationTags.includes(vehicle.information.registration))
        );
        return sortVehiclesByMake(filtered);
    }, [
        vehicles,
        isAutopartage,
        selectedEnergyTags,
        selectedMakeTags,
        selectedModelTags,
        selectedDriverTags,
        selectedRegistrationTags,
    ]);

    // Init filters on mount
    useEffect(() => {
        handlePeriodChange("Aujourd'hui");
    }, []);

    // Update available filter options based on vehicles
    useEffect(() => {
        setEnergies(
            [...buildEnergies(vehicles), ...selectedEnergyTagsRef.current]
                .filter((element, index, array) => array.indexOf(element) === index)
        );
        setMakes(
            [...buildMakes(vehicles), ...selectedMakeTagsRef.current]
                .filter((element, index, array) => array.indexOf(element) === index)
        );
        setModels(
            [...buildModels(vehicles), ...selectedModelTagsRef.current]
                .filter((element, index, array) => array.indexOf(element) === index)
        );
        setDrivers(
            [...buildDrivers(vehicles), ...selectedDriverTagsRef.current]
                .filter((element, index, array) => array.indexOf(element) === index)
        );
        setRegistrations(
            [...buildRegistrations(vehicles), ...selectedRegistrationTagsRef.current]
                .filter((element, index, array) => array.indexOf(element) === index)
        );
    }, [vehicles, isAutopartage]);

    // Update tags when autopartage changes
    useEffect(() => {
        setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setModels(buildModels(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [isAutopartage]);

    // Update tags when energy selection changes
    useEffect(() => {
        if (selectedEnergyTags.length === 0) setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setModels(buildModels(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [selectedEnergyTags]);

    // Update tags when make selection changes
    useEffect(() => {
        if (selectedMakeTags.length === 0) setMakes(buildMakes(resultVehicles));
        setEnergies(buildEnergies(resultVehicles));
        setModels(buildModels(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [selectedMakeTags]);

    // Update tags when model selection changes
    useEffect(() => {
        if (selectedModelTags.length === 0) setModels(buildModels(resultVehicles));
        setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [selectedModelTags]);

    // Update tags when driver selection changes
    useEffect(() => {
        if (selectedDriverTags.length === 0) setDrivers(buildDrivers(resultVehicles));
        setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setModels(buildModels(resultVehicles));
        setRegistrations(buildRegistrations(resultVehicles));
    }, [selectedDriverTags]);

    // Update tags when registration selection changes
    useEffect(() => {
        if (selectedRegistrationTags.length === 0) setRegistrations(buildRegistrations(resultVehicles));
        setEnergies(buildEnergies(resultVehicles));
        setMakes(buildMakes(resultVehicles));
        setModels(buildModels(resultVehicles));
        setDrivers(buildDrivers(resultVehicles));
    }, [selectedRegistrationTags]);

    const setDate = (from: Dayjs, to: Dayjs) => {
        setFromTo({
            from: getUnixTime(from.toDate()),
            to: getUnixTime(to.toDate()),
        });
    };

    const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || dates[0] === null || dates[1] === null) {
            setFromTo(null);
            return;
        }
        const from = dates[0];
        const to = dates[1];
        setPeriod([from, to]);
        setDate(from, to);
        setValueSelect("");
    };

    const handlePeriodChange = (value: string) => {
        if (value === undefined) {
            setFromTo(null);
            setPeriod([null, null]);
            return;
        }
        const from = predefinedRanges[value][0];
        const to = predefinedRanges[value][1];

        setValueSelect(value);
        setPeriod([from, to]);
        setDate(from, to);
    };

    return (
        <>
            <div className="d-flex flex-column w-100 mx-0 mb-3 p-0">
                {/* Date range picker */}
                <div className={`${!screens.md ? "d-flex flex-column justify-content-center mb-3" : "d-inline-flex justify-content-start align-items-center mb-3"}`}>
                    <RangePicker
                        allowClear={true}
                        format="DD/MM/YYYY"
                        onCalendarChange={handleCalendarChange}
                        value={period}
                        className={`rounded-1 border-carmoove py-2 ${!screens.md ? "mb-2" : "me-3"}`}
                    />
                    <div className={`d-inline-flex align-items-center ${!screens.md ? "justify-content-center w-100" : "justify-content-end ms-2"}`}>
                        <span className="text-center">ou sélection d&apos;une période :</span>
                        <span style={{ display: 'inline-block' }}>
                            <Select
                                allowClear
                                style={{ width: '200px' }}
                                variant="borderless"
                                value={valueSelect}
                                onChange={(value) => handlePeriodChange(value)}
                            >
                                {Object.keys(predefinedRanges).map((key) => (
                                    <Select.Option key={key} value={key}>
                                        {key}
                                    </Select.Option>
                                ))}
                            </Select>
                        </span>
                    </div>
                </div>

                {/* Filter buttons */}
                <div className={`d-flex ${!screens.md ? "w-100 flex-wrap" : "flex-nowrap"} gap-2`}>
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

                    {/* Category filter */}
                    <ButtonModal
                        title="Catégorie"
                        elements={categories}
                        elementsChecked={selectedCategoryTags}
                        setElementChecked={setSelectedCategoryTags}
                        getKey={(el) => el.value}
                        getLabel={(el) => el.label}
                    />

                    {/* Energy filter */}
                    <ButtonModal
                        title="Energie"
                        elements={energies}
                        elementsChecked={selectedEnergyTags}
                        setElementChecked={setSelectedEnergyTags}
                        getKey={(el) => el}
                        getLabel={(el) => el}
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
                </div>
            </div>

            {/* Alerts list */}
            <div className="alerts-container">
                {fromTo !== null ? (
                    <AlertsList
                        from={fromTo.from}
                        to={fromTo.to}
                        isAutopartage={isAutopartage}
                        category={selectedCategoryTags.map(c => c.value)}
                        energies={selectedEnergyTags}
                        makes={selectedMakeTags}
                        models={selectedModelTags}
                        drivers={selectedDriverTags}
                        registrations={selectedRegistrationTags}
                        vehicles={resultVehicles}
                    />
                ) : (
                    <div className="no-data-info">
                        <div className="data-info">
                            <p>Aucune alerte non lue pour le moment. Modifiez vos filtres ou revenez plus tard.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Alerts;
