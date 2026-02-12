import { IVehicle } from "@/lib/hooks/Interfaces";

export type VehicleType = "VP" | "VUL" | "PL" | "VL";

export const TYPE_FLEET = "FLEET";
export const TYPE_VP = "VP";
export const TYPE_VL = "VL";
export const TYPE_VUL = "VUL";
export const TYPE_PL = "PL";
export const TYPE_VEHICLE = "vehicle";

export function getVehicleAntsTypes(type: string): string[] {
    switch (type) {
        case "VUL":
            return ["CTTE", "VASP", "Deriv-VP", "VTSU"];
        case "PL":
            return ["CAM", "TRR", "SRAT", "SRTC", "TCP"];
        case "VP":
            return ["VP"];
        case "VL":
            return ["QM", "TM", "voiturette", "CYCL"];
    }

    return [];
}

export function GetVehicleCarmooveType(type: string): string  {
    switch (type) {
        case "VP":
            return "VP";
        case "CTTE":
        case "VASP":
        case "VTSU":
        case "Deriv-VP":
            return "VUL";
        case "CAM":
        case "TRR":
        case "SRAT":
        case "SRTC":
        case "TCP":
            return "PL";
        case "TM":
        case "QM":
        case "voiturette":
        case "CYCL":
            return "VL";
    }

    return type;
}

export function IsVehicleOfCarmooveType(
    vehicle: IVehicle,
    type: string
): boolean {
    return GetVehicleCarmooveType(vehicle.information.kindCG) === type;
}

export function VehicleTypes(types: Array<string> | undefined): Array<string> {
    let newTypes = new Array<string>();
    if (typeof types === undefined) {
        return newTypes;
    }
    for (const type of types!) {
        newTypes = newTypes.concat(getVehicleAntsTypes(type));
    }

    return newTypes;
}

export function vehiclesByType(
    vehicles: IVehicle[],
    vehicleTypePill: string,
    selectedVehicle: IVehicle | null,
    make?: string | null
): Array<IVehicle> {
    let typeVehicles = new Array<IVehicle>();

    for (const vehicle of vehicles) {
        if (vehicleTypePill === TYPE_VEHICLE && vehicle.id === selectedVehicle?.id) {
            return [vehicle];
        } else if (make === vehicle.information.make) {
            typeVehicles.push(vehicle);
        }

        if (vehicleTypePill === TYPE_FLEET) {
            typeVehicles.push(vehicle);
        } else if (GetVehicleCarmooveType(vehicle.information.kindCG) === vehicleTypePill) {
            typeVehicles.push(vehicle);
        }
    }

    if (typeVehicles.length === 0) {
        return vehicles;
    }

    return typeVehicles;
}
