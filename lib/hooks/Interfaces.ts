import { Dispatch, JSX, SetStateAction } from "react";
import {IReservation} from "@/app/actions/reservationServices";
import dayjs from "dayjs";
export const PAGE_SIZE_DEFAULT = 10;
export interface IUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company: {
        id: string;
        name: string;
        fiscal_year: {
            month: number;
        };
    };
}

export interface IParking {
    id: string;
    shortId: string;
    name: string;
    address: string;
    address2?: string;
    zipcode: string;
    city: string;
    country: string;
}

interface IInformation {
    make: string,
    model: string,
    rawModel: string,
    version: string,
    registration: string,
    energy: string,
    kind: string,
    kindCG: string,
    type: string,
    typeCG: string,
    width: number,
    height: number,
    length: number,
    seatings: number,
    doors: number,
    engineCode: string,
    injectionMode: string,
    turbo: string,
    displacement: number,
    cylinders: number,
    valves: number,
    vin: string,
    vinTypeCG: string,
    unloadedWeight: number,
    totalWeight: number,
    prfTotalWeight: number,
    wheelbase: number,
    gearboxType: string,
    gears: number,
    propulsion: string,
    horsePower: number
    kwPower: number,
    serial: string,
    nationalIdentificationCode: string,
    typeVariantVersion: string,
    color: string,
    dateFirstCirculation: string,
    dateCGRequest: string,
    lastControlDate: number,
    fiscalPower: number,
    price: number,
    depollution: boolean,
    fuelTankCapacity: number,
    consumptionExtraurban: number,
    consumptionMixed: number,
    consumptionUrban: number,
    co2: number,
}

interface IStatus {
    parked: string,
    battery: number,
    fuelLevel: number,
    fuelPercent: number,
    engine: string,
    fault: string,
    theft: string,
    towage: string,
    privacy: boolean,
    accident: string,
    mileage: number,
    immobilized: boolean,
    centralLocked: boolean,
    buzzer: boolean,
    honk: boolean,
}

interface IAvailableValue {
    available: boolean,
    value: number
}

interface IFuelInformation {
    capacity: IAvailableValue,
    distance: IAvailableValue,
    consumption: IAvailableValue,
}

export interface IElectricityStatus {
    chargeInProgress: boolean,
    battery: number,
    autonomy: number,
    batteryHealthStatus: number,
    timeUntilFullyCharged: number,
}

export interface IVehicle {
    id: string,
    rights: string[],
    device: IDevice | null,
    // deviceID: string,
    information: IInformation,
    maintenance: IMaintenance,
    driver: IDriver,
    status: IStatus,
    electricityStatus: IElectricityStatus,
    fuelInformation: IFuelInformation,
    location: ILocation,
    assistance: IAssistance,
    dataAvailability: IDataAvailability,
    electricConsumption: number,
    acquisition?: IAcquisition,
    stateCS?: IVehicleStatusCS
    statusLoading?: boolean
    statusError?: boolean
}

export interface IAcquisition {
    mode: string,
    seller: string,
    price: number,
    tax: number,
    duration: number,
    start: number,
    mileage: number,
    redemptionValue: number,
    subscription: number,
    end: number,
}

export interface IDevice {
    id: string,
    type: string | null,
    model: string | null,
    builder: string | null,
    simId: string | null,
    lastMessageDate: string | null,
    carSharing: boolean,
    configuration: IDeviceConfiguration | null
}

export interface IDeviceConfiguration {
    mongoId: string,
    configuration: string
    features: IDeviceConfigurationFeatures
    programNumber: number,
}

export interface IDeviceConfigurationFeatures {
    GPSjamming: IDeviceConfigurationFeature,
    GNSSjamming: IDeviceConfigurationFeature,
    failure?: IDeviceConfigurationFeature,
    immobilizer?: IDeviceConfigurationFeature,
    towingDetection: IDeviceConfigurationFeature,
    crashDetection?: IDeviceConfigurationFeature,
    centralLock?: IDeviceConfigurationFeature,
    buzzer?: IDeviceConfigurationFeature,
    honk?: IDeviceConfigurationFeature,
    turningLights?: IDeviceConfigurationFeature,
}

export interface IDeviceConfigurationFeature {
    state: string,
    action: string,
    actionLaunched: boolean
}

export interface IMaintenance {
    lastScheduledMaintenance: number,
    nextScheduledMaintenance: number,
    lastMaintenanceMileage: number,
    nextControlDate: number,
    lastControlDate: number,
}

export interface IDataAvailability {
    TellTaleStatus: boolean,
}

export interface IAssistance {
    code: string,
    distance: number,
    phoneNumber: string,
}

export interface ILocation {
    longitude: number,
    latitude: number,
    address: IAddress,
    timestamp: number,
}

export interface IAddress {
    address: string,
    city: string,
    zipcode: string,
    country: string,
}

export interface IAccountStatus {
    enabled: boolean,
    accountCreated: boolean,
    accountId: string,
}

export interface IDriver {
    accountId?: string,
    driverID: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    privacy: boolean,
    licenceNumber: string,
    licenseDate?: string,
    vehicle: IVehicle | null,
    accountStatus: IAccountStatus,
    comment?: string,
    badgeId?: string,
    accountCreated?: boolean,
    accountEnabled?: boolean,
}

export interface IAlertCount {
    count: number,
    type: string,
    unread: number,
}

export interface IdropdownOption {
    value: any,
    label: string | JSX.Element,
}

export interface ISelectOption {
    value: any
}

export interface IFromTo {
    from?: number,
    to: number,
}

export interface IFromToProps {
    from: number,
    to: number,
}

export interface IDropdownFromToOption {
    value: IFromTo,
    label: string | JSX.Element,
}

export interface ITranslation {
    language: string,
    text: string,
}

export interface IFiscalYear {
    month: number,
}
export interface ICompany {
    name: string,
    address: string,
    city: string,
    zipcode: string,
    country: string,
    fiscal_year: IFiscalYear,
}
export interface IUser {
    id: string,
    firstname: string,
    lastname: string,
    newsletter: boolean,
    email: string,
    phone: string,
    company: ICompany,
}
export interface IUnit {
    unit: string,
    diviser: number,
    round: number,
}

export interface IPosition {
    latitude: number,
    longitude: number,
    timestamp: number,
}

export interface IPath {
    averageSpeed: number,
    consumption: number,
    electricConsumption: number,
    electricConsumption100km: number,
    cost: number,
    distance: number,
    duration: number,
    electricity: number,
    electricityPercent: number,
    fuel: number,
    id: string,
    private: boolean,
    startAt: number,
    stopAt: number,
    vehicle: IVehicle,
    positions: IPosition[],
    addressStart: IAddress,
    addressEnd: IAddress,
}

export interface INotificationsCount {
    alert: number,
    notice: number,
    warning: number,
    total: number,
}

export interface IElectric {
    electricConsumtion: number,
    urbanConsumtion: number,
    mixedConsumtion: number,
    motorwayConsumtion: number,
    rollingDuration: number,
    rollingDistance: number,
    distanceInBatteryRegeneration: number,
    durationInBatteryRegeneration: number,
    distanceInECOMode: number,
    durationInECOMode: number,
}

export interface IStatVehicle {
    electric: IElectric,
    consumption: {
        electricity: number,
        fuel: number,
    },
    currentPeriodeConsumption: {
        electricity: number,
        fuel: number,
    },
    cost: number,
    co2: number,
    nbPath: number,
    usageTime: number,
    distance: number,
    fuel: {
        electricity: number,
        fuel: number,
    }
    lastPath: {
        consumption: number,
        electricity: number,
    }
    fiveLastPath: {
        fuel: number,
        electricity: number,
    }
    notifications: INotificationsCount,
    vehicle: IVehicle
}

export interface ICounterNotification {
    type: string
    count: number
    unread: number
}

export interface INotification {
    vehicle: IVehicle
    id: string,
    category: string,
    categoryTranslation: string,
    type: string,
    headings: Array<ITranslation>,
    contents: Array<ITranslation>,
    shipment: IShipment,
    read: boolean,
    archived: boolean,
    code: string,
    informations: INotificationInformation[]
    actions: INotificationAction[]
}

export interface INotificationInformation {
    key: string
    value: string
}

export interface INotificationAction {
    type: string
    link: string
    data: string
    label: INotificationActionLabel[]
    feature: string
}

export interface INotificationActionLabel {
    language: string
    label: string
}

export interface IShipment {
    id: string,
    status: number,
    read: boolean,
    timestamp: number,
    recipients: number,
}

export interface ISetTitleProps {
    setTitle: Dispatch<SetStateAction<string>>
}

export interface IParking {
    id: string,
    shortId: string,
    name: string,
    address: string,
    address2?: string,
    zipcode: string,
    city: string,
    country: string,
}
export interface IPostUpdateStateCS {
    id: string;
    state: EnumStateCS;
    value: boolean;
}

export interface IGetStatus {
    vehicleId: string;
    plate: string;
}

export interface IStateCS {
    accident: boolean;
    breakdown: boolean;
    maintenance: boolean;
    stolen: boolean;
    towing: boolean;
    unavailable: boolean;
}

export enum EnumLockStatusCS {
    LOCKED = "LOCKED",
    UNLOCKED = "UNLOCKED",
}

export enum EnumEngineStatusCS {
    ON = "ON",
    OFF = "OFF",
}

export enum EnumImmobilizerStatusCS {
    LOCKED = "LOCKED",
    UNLOCKED = "UNLOCKED",
}

export enum EnumHandbrakeStatusCS {
    ON = "ON",
    OFF = "OFF",
}

export enum EnumLightsStatusCS {
    ON = "ON",
    OFF = "OFF",
}

export enum EnumDoorsStatusCS {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

export enum EnumWindowsStatusCS {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

export enum IBluetoothStatusCS {
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED",
}

export interface IPositionCS {
    latitude: string,
    longitude: string,
    timestamp: number,
}

export interface IAuthorizationCS {
    authorizationId: string,
    userId: string,
    driverId?: string,
    from: number,
    until: number,
    driverName?: string,
}

export interface ICardHolderCS {
    id: string,
    status: string,
}

export interface IEquipmentTanslation {
    language: string,
    text: string
}

export interface IEquipmentsInBooking {
    code: string,
    translation: IEquipmentTanslation[]
}

export interface IVehiclesForBookingCS {
    id: string,
    builder: string,
    model: string,
    plate: string,
    deviceId: string,
    deviceModel: string,
    bluetoothName: string,
    archived: boolean,
    energy: string,
    seats: number,
    gearbox: string,
    kind: string,
    position: {
        latitude: number,
        longitude: number
    },
    fuelLevel: number,
    fuelPercent: number,
    chargePercent: number,
    parking: {
        id: string,
        shortId: string,
        name: string,
        address: string,
        address2: string,
        zipcode: string,
        city: string,
        country: string
    },
    equipments: IEquipmentsInBooking[]
}

export interface IVehicleStatusCS {
    lock: EnumLockStatusCS,
    engine: EnumEngineStatusCS,
    immobilizer: EnumImmobilizerStatusCS,
    handbrake: EnumHandbrakeStatusCS,
    lights: EnumLightsStatusCS,
    doors: EnumDoorsStatusCS,
    windows: EnumWindowsStatusCS,
    speed: number,
    bluetooth: IBluetoothStatusCS,
    authenticated: boolean | null | undefined,
    mileage: number,
    fuel: number,
    fuelRange: number,
    chargingAdapterStatus: string,
    ChargingStatus: string,
    ChargingUntil: number,
    ChargeLevel: number,
    RemainingRange: number,
    privacy: boolean,
    position: IPositionCS,
    authorizations: IAuthorizationCS[],
    cardHolder: ICardHolderCS[],
    vehicleKey: boolean,
    lastMessage: number,
    state: IStateCS,
    error: string | null | undefined

    isNetLoading?: boolean,
}

export enum EnumStateCS {
    accident = "accident",
    breakdown = "breakdown",
    maintenance = "maintenance",
    stolen = "stolen",
    towing = "towing",
    unavailable = "unavailable"
}
export interface IReservationCustom extends IReservation {
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
    dateUntil: dayjs.Dayjs
    driverName: string
}
export interface Translation {
    language: 'FR' | 'EN' | 'DE' | 'ES' | 'IT' | 'NL'
    text: string
}