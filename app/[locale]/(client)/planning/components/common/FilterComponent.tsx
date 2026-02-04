import {IDriver, IVehicle} from "@/lib/hooks/Interfaces";
import {useEffect, useMemo, useState} from "react";
import ButtonModal from "@/components/Common/ButtonModal";
import {Space} from "antd";
import {
    buildEnergies,
    buildMakes,
    buildModels,
    buildRegistrations,
    buildTypes,
    energyTrueFormat
} from "@/services/VehiculesService";


interface Props {
    vehicules: IVehicle[];
    setRespFilter: (filter: IVehicle[], driverSelected: IDriver[])=>void;
    drivers: IDriver[];
    loadingDrivers: boolean;
    loadingDisp: boolean
}

const FilterComponent = (props: Props) => {

    const [disp, _] = useState<string[]>(["Disponible", "Indisponible"]);
    const [types, setTypes] = useState<string[]>([]);
    const [energies, setEnergies] = useState<string[]>([]);
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [drivers, setDrivers] = useState<IDriver[]>([]);
    const [registrations, setRegistrations] = useState<string[]>([]);

    const [dispChecked, setDispChecked] = useState<string[]>([])
    const [typesChecked, setTypesChecked] = useState<string[]>([])
    const [energiesChecked, setEnergiesChecked] = useState<string[]>([])
    const [makesChecked, setMakesChecked] = useState<string[]>([])
    const [modelsChecked, setModelsChecked] = useState<string[]>([])
    const [driversChecked, setDriversChecked] = useState<IDriver[]>([])
    const [registrationsChecked, setRegistrationsChecked] = useState<string[]>([])

    const [vehicles, setVehicles] = useState<IVehicle[]>(props.vehicules)

    useEffect(() => {
        if (props.vehicules.length > 0){
            setVehicles(props.vehicules)
            setTypes(buildTypes(props.vehicules))
            setEnergies(buildEnergies(props.vehicules))
            setMakes(buildMakes(props.vehicules))
            setModels(buildModels(props.vehicules))
            setRegistrations(buildRegistrations(props.vehicules))
        }
    }, [props.vehicules]);

    useEffect(() => {
        setDrivers(props.drivers)
    }, [props.drivers]);

    const filteredVehicles = useMemo(() => {
        return props.vehicules.filter((vehicle: IVehicle) => {
            const isAvailable = !vehicle.stateCS?.state.unavailable;
            const vehicleStatus = isAvailable ? "Disponible" : "Indisponible";
            const dispPass = dispChecked.length === 0 || dispChecked.includes(vehicleStatus);

            const typePass = typesChecked.length === 0 || typesChecked.includes(vehicle.information.type);

            const energyPass = energiesChecked.length === 0 ||
                energiesChecked.includes(energyTrueFormat(vehicle.information.energy));

            const makePass = makesChecked.length === 0 || makesChecked.includes(vehicle.information.make);

            const modelPass = modelsChecked.length === 0 || modelsChecked.includes(vehicle.information.model);

            const registrationPass = registrationsChecked.length === 0 ||
                registrationsChecked.includes(vehicle.information.registration);

            return dispPass && typePass && energyPass && makePass && modelPass && registrationPass;
        });
    }, [
        props.vehicules,
        dispChecked,
        typesChecked,
        energiesChecked,
        makesChecked,
        modelsChecked,
        registrationsChecked
    ]);

    useEffect(() => {
        props.setRespFilter(filteredVehicles, driversChecked);
    }, [filteredVehicles, driversChecked]);
    return (
        <>
            <Space className="d-flex flex-wrap w-100 mb-2">
                <ButtonModal title="Disponibilité" elements={disp} elementsChecked={dispChecked} setElementChecked={setDispChecked} isLoading={props.loadingDisp}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Type" elements={types} elementsChecked={typesChecked} setElementChecked={setTypesChecked} isLoading={vehicles.length===0}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Energie" elements={energies} elementsChecked={energiesChecked} setElementChecked={setEnergiesChecked} isLoading={vehicles.length===0}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Marque" elements={makes} elementsChecked={makesChecked} setElementChecked={setMakesChecked} isLoading={vehicles.length===0}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Modèle" elements={models} elementsChecked={modelsChecked} setElementChecked={setModelsChecked} isLoading={vehicles.length===0}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Immatriculation" elements={registrations} elementsChecked={registrationsChecked} setElementChecked={setRegistrationsChecked} isLoading={vehicles.length===0}
                             getKey={(name)=>name} getLabel={(name)=>name}/>
                <ButtonModal title="Conducteur" elements={drivers} elementsChecked={driversChecked} setElementChecked={setDriversChecked} isLoading={props.loadingDrivers}
                             getKey={(driver) => driver.driverID}
                             getLabel={(driver) => `${driver.firstName} ${driver.lastName}`}/>
            </Space>
        </>
    )
}
export default FilterComponent