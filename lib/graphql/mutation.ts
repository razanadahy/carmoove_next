import { gql } from "@apollo/client";
import { NOTIFICATION_FRAGMENT } from "./fragment";

export const USER_MUTATION = gql`
  mutation User($user: UserInput!) {
    user(user: $user) {
      id
    }
  }
`;

export const VEHICLE_DRIVER_MUTATION = gql`
  mutation AssociateDriverToVehicle($vehicleId: String!, $driverId: String!) {
    associateDriverToVehicle(vehicle_id: $vehicleId, driver_id: $driverId) {
      error
      status
    }
  }
`;

export enum VehicleAcquisitionEnum {
  ACHAT = "ACHAT",
  LLD = "LLD",
  LOA = "LOA",
  CREDITBAIL = "CREDITBAIL"
}

export const ACQUISITION_MUTATION = gql`
  mutation VehicleAcquisition(
    $vehicleId: String!
    $mode: VehicleAcquisitionEnum!
    $seller: String
    $subscription: Float
    $mileage: Int
    $price: Float
    $tax: Float
    $duration: Int
    $start: Int
    $redemptionValue: Float
  ) {
    vehicleAcquisition(
      vehicleId: $vehicleId
      mode: $mode
      seller: $seller
      subscription: $subscription
      mileage: $mileage
      price: $price
      tax: $tax
      duration: $duration
      start: $start
      redemptionValue: $redemptionValue
    )
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation MarkNotificationAsRead($shipmentId: String!) {
    markNotificationAsRead(
      notification: { shipmentId: $shipmentId, read: true }
    ) {
      ...NotificationFragment
    }
  }
`;

export const ARCHIVE_ALL_MUTATION = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation ArchiveAll(
    $type: NotificationTypeEnum
    $archived: Boolean!
    $vehicleIds: [String!]
  ) {
    archive(
      all: true
      type: $type
      archived: $archived
      vehicleIds: $vehicleIds
    ) {
      ...NotificationFragment
    }
  }
`;

export const ARCHIVE_SELECTION_MUTATION = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation ArchiveSelection(
    $notifications: [GetNotification!]!
    $archived: Boolean!
  ) {
    archive(notifications: $notifications, archived: $archived) {
      ...NotificationFragment
    }
  }
`;

export const DESACTIVATE_TOWING_MUTATION = gql`
  mutation DeactivateTowing($vehicleId: String) {
    deactivateTowing(vehicle_id: $vehicleId)
  }
`;

export const VEHICLE_PRIVACY = gql`
  mutation VehiclePrivacy($vehicleIds: [String!], $activate: Boolean!) {
    vehiclePrivacy(vehicles: $vehicleIds, activate: $activate) {
      error
      status
    }
  }
`;

export const PASSWORD_RESET_MUTATION = gql`
  mutation {
    resetPassword
  }
`;

export const DRIVER_MUTATION = gql`
  mutation UpdateDriver(
    $lastName: String!
    $firstName: String!
    $phoneNumber: String!
    $badgeId: String
    $email: String!
    $driverId: String!
    $licenceNumber: String
    $licenseDate: String
    $privacy: Boolean
    $comment: String
  ) {
    updateDriver(
      lastName: $lastName
      firstName: $firstName
      phoneNumber: $phoneNumber
      badgeId: $badgeId
      email: $email
      driverId: $driverId
      licenceNumber: $licenceNumber
      licenseDate: $licenseDate
      privacy: $privacy
      comment: $comment
    ) {
      error
      status
    }
  }
`;

export const DRIVER_PRIVACY_MUTATION = gql`
  mutation Privacy($driverID: String!, $activate: Boolean!) {
    privacy(driverID: $driverID, activate: $activate) {
      error
      status
    }
  }
`;

export const USER_ACTIVATION = gql`
  mutation UserActivation($id: String!, $active: Boolean!) {
    userActivation(id: $id, active: $active) {
      firstName
      lastName
      driverID
      accountStatus {
        accountId
        accountCreated
        enabled
      }
    }
  }
`;

export const CREATE_DRIVER_ACCOUNT = gql`
  mutation CreateDriverAccount($driverId: String!) {
    createDriverAccount(driverId: $driverId)
  }
`;

export const REGISTER_DRIVER = gql`
  mutation RegisterDriver(
    $firstName: String!
    $lastName: String!
    $phoneNumber: String!
    $email: String!
    $privacy: Boolean
    $licenceNumber: String
    $createAccount: Boolean
    $licenseDate: String
    $comment: String
    $badgeId: String
  ) {
    registerDriver(
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      email: $email
      privacy: $privacy
      licenceNumber: $licenceNumber
      createAccount: $createAccount
      licenseDate: $licenseDate
      comment: $comment
      badgeId: $badgeId
    ) {
      error
      status
    }
  }
`;

export const DELETE_DRIVER = gql`
    mutation DeleteDriver($driverId: String!) {
        deleteDriver(driverId: $driverId)
    }
`

export const LAST_SCHEDULED_MAINTENANCE = gql`
  mutation LastScheduledMaintenance(
    $vehicleId: String!
    $date: Int
    $mileage: Int
  ) {
    lastScheduledMaintenance(
      vehicle_id: $vehicleId
      date: $date
      mileage: $mileage
    )
  }
`;

export const LAST_TECHNICAL_DATE = gql`
  mutation LastTechnicalControl($vehicleId: String!, $date: Int) {
    lastTechnicalControl(vehicle_id: $vehicleId, date: $date)
  }
`;

export const REGISTER_ASSISTANCE = gql`
  mutation RegisterAssistance(
    $vehicle_id: String!
    $code: String
    $distance: Float
    $phoneNumber: String
  ) {
    registerAssistance(
      vehicle_id: $vehicle_id
      code: $code
      distance: $distance
      phoneNumber: $phoneNumber
    )
  }
`;

export const TECHNICAL_SUPPORT = gql`
  mutation TechnicalSupport(
    $mobileOsVersion: String!
    $carmooveAppVersion: String!
    $comment: String
    $device_id: String
    $vehicle_id: String
    $type: statustechnicalsupportenum!
    $time: Int!
    $mobileType: osstatustechnicalsupportenum!
  ) {
    technicalSupport(
      mobileOsVersion: $mobileOsVersion
      carmooveAppVersion: $carmooveAppVersion
      comment: $comment
      device_id: $device_id
      vehicle_id: $vehicle_id
      type: $type
      time: $time
      mobileType: $mobileType
    ) {
      error
      status
    }
  }
`;

export const UNREGISTER_DEVICE = gql`
  mutation UnregisterDevice($vehicleId: String!, $deviceId: String!) {
    unregisterDevice(vehicle_id: $vehicleId, device_id: $deviceId) {
      error
      status
    }
  }
`;
