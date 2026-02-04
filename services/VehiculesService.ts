import {IVehicle} from "@/lib/hooks/Interfaces";

const buildTypes = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.information.type)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
        .sort();
}

export const buildGearbox = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.information.gearboxType)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
        .sort();
}

const buildEnergies = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => energyTrueFormat(vehicle.information.energy))
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
        .sort();
}

const buildMakes = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.information.make)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
        .sort();
}

const buildModels = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.information.model)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
        .sort();
}

const buildDrivers = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.driver?.firstName + ' ' + vehicle.driver?.lastName)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index && element !== "undefined undefined")
        .sort();
}

const buildRegistrations = (vehicles: IVehicle[]): string[] => {
    return vehicles
        .map((vehicle: IVehicle) => vehicle.information.registration)
        .filter((element: string, index: number, array: string[]) => array.indexOf(element) === index && element !== "undefined undefined")
        .sort();
}
const sortVehiclesByMake = (vehicles: IVehicle[]): IVehicle[] => {
    return vehicles.sort((a, b) => {
        if (a.information.make < b.information.make) return -1;
        if (a.information.make > b.information.make) return 1;
        if (a.information.model < b.information.model) return -1;
        if (a.information.model > b.information.model) return 1;
        return 0;
    })
}
const energyTrueFormat  = (energyAbrev: string|null) : string => {
    switch (energyAbrev) {
        case 'GO':
            return 'Diesel'
        case 'EL':
            return 'Electrique'
        case 'ES':
            return 'Essence'
        case 'ESS+ELEC HNR':
            return 'Hybride'
        default:
            return energyAbrev || ""
    }
}
export {
    sortVehiclesByMake,
    buildDrivers,
    buildEnergies,
    buildMakes,
    buildModels,
    buildRegistrations,
    buildTypes,
    energyTrueFormat
}