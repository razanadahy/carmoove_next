import { gql } from "@apollo/client";
import {
    VEHICLE_FRAGMENT,
    PATH_FRAGMENT,
    NOTIFICATION_FRAGMENT,
} from "./fragment";

export const VEHICLES_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  query Vehicles {
    vehicles {
      ...VehicleFragment
    }
  }
`;

export const VEHICLE_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  query Vehicle($id: String!) {
    vehicle(id: $id) {
      ...VehicleFragment
    }
  }
`;

export const ALERTS_COUNT_QUERY = gql`
  query NotificationCounter(
    $vehicleIds: [String!]
    $vehicleTypes: [String!]
    $from: Int
    $to: Int
    $archived: Boolean
  ) {
    notificationCounter(
      vehicleIds: $vehicleIds
      vehicleTypes: $vehicleTypes
      from: $from
      to: $to
      archived: $archived
    ) {
      count
      type
      unread
      __typename
    }
  }
`;

export const DASHBOARD_QUERY = gql`
  query Dashboard($type: [String], $vehicles: [String], $from: Int, $to: Int) {
    dashboard(type: $type, vehicles: $vehicles, from: $from, to: $to) {
      agregation {
        consumption
        cost
        count
        fuel
        electricyConsumption
        electricity
      }
    }
  }
`;

export const NOMENCLATURE_QUERY = gql`
  query Nomenclature($category: String, $code: String) {
    nomenclature(category: $category, code: $code) {
      code
      translation {
        language
        text
      }
    }
  }
`;

export const DRIVERS_QUERY = gql`
  query Drivers {
    drivers {
      accountId
      driverID
      email
      firstName
      lastName
      privacy
      vehicle {
        information {
          make
          model
          registration
        }
      }
      accountEnabled
      accountCreated
    }
  }
`;

export const DRIVER_QUERY = gql`
  query Driver($id: String!) {
    driver(id: $id) {
      driverID
      firstName
      lastName
      phoneNumber
      email
      privacy
      licenceNumber
      licenseDate
      badgeId
      comment
      accountStatus {
        enabled
        accountCreated
        accountId
      }
    }
  }
`;

export const DRIVER_STATISTICS_QUERY = gql`
  query DriverStatistics($driverId: String!) {
    driverStatistics(driverId: $driverId) {
      nbPaths
      usageTime
      usageMileage
      usageCost
      totalFuel
      consumption
      electricConsumption
      co2
    }
  }
`;

export const TELLTALESTATUS_QUERY = gql`
  query TellTaleStatus($vehicles: [String]) {
    tellTaleStatus(vehicles: $vehicles) {
      coolingAirConditioning
      highBeam
      lowBeam
      turnSignals
      hazardWarning
      provisionForDisabledPerson
      parkingBrake
      brakeFailure
      hatchOpen
      fuelLevel
      engineCoolantTemperature
      batteryChargingCondition
      engineOil
      positionLight
      frontFogLight
      rearFogLight
      parkHeating
      engineMilIndicator
      callForMaintenance
      transmissionFluidTemperature
      transmissionFailure
      antiLockBrakeSystemFailure
      wornBrakeLinings
      windscreenWasherFluid
      tireFailure
      generalFailure
      engineOilTemperature
      engineOilLevel
      engineCoolantLevel
      steeringFluidLevel
      steeringFailure
      heightControl
      retarder
      engineEmissionSystemFailure
      ESCIndication
      brakeLights
      articulation
      stopRequest
      pramRequest
      busStopBrake
      AdBlueLevel
      raising
      lowering
      kneeling
      engineCompartmentTemperature
      auxiliaryAirPressure
      airFilterClogged
      fuelFilterDifferentialPressure
      seatBelt
      EBS
      laneDepartureIndication
      advancedEmergencyBrakingSystem
      ACC
      trailerConnected
      ABSTrailer
      airbag
      EBSTrailer
      tachographIndication
      ESCSwitchedOff
      laneDepartureWarningSwitchedOff
      engineEmissionFilter
      electricMotorFailures
      AdBlueTampering
      multiplexSystem
    }
  }
`;

export const ME_QUERY = gql`
  query Whoami {
    whoami {
      id
      firstname
      lastname
      phone
      email
      newsletter
      company {
        name
        address
        city
        zipcode
        country
        fiscal_year {
          month
        }
      }
    }
  }
`;

export const STATS_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  query DetailedStatistics($type: [String!], $from: Int, $to: Int) {
    detailedStatistics(type: $type, from: $from, to: $to) {
      consumption {
        electricity
        fuel
      }
      cost
      distance
      fuel {
        electricity
        fuel
      }
      vehicle {
        ...VehicleFragment
      }
      lastPath {
        consumption
        electricity
      }
      fiveLastPath {
        fuel
        electricity
      }
      notifications {
        alert
        warning
        notice
        total
      }
    }
  }
`;

export const STAT_QUERY = gql`
    ${VEHICLE_FRAGMENT}
    query DetailedStatistic($vehicleId: String!, $from: Int, $to: Int) {
        detailedStatistic(vehicleId: $vehicleId, from: $from, to: $to) {
            consumption {
                electricity
                fuel
            }
            currentPeriodeConsumption {
                electricity
                fuel
            }
            cost
            distance
            usageTime
            nbPath
            fuel {
                electricity
                fuel
            }
            vehicle {
                ...VehicleFragment
            }
            lastPath {
                consumption
                electricity
            }
            fiveLastPath {
                fuel
                electricity
            }
            notifications {
                alert
                warning
                notice
                total
            }
        }
    }
`;

export const GLOBAL_STATISTIC_QUERY = gql`
  query GlobalStatistic($type: [String!], $vehicles: [String!], $from: Int, $to: Int) {
    globalStatistics(type: $type, vehicles: $vehicles, from: $from, to: $to) {
      gasolineConsumption
      dieselConsumption
      electricConsumption
      co2
      gasolineCo2
      dieselCo2
      electricCo2
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  ${NOTIFICATION_FRAGMENT}
  query Notifications(
    $offset: Int!
    $limit: Int!
    $type: NotificationTypeEnum
    $category: NotificationCategoryEnum
    $readType: String
    $vehicleIds: [String!]!
    $notifications: [GetNotification!]
    $archived: Boolean
    $from: DateTime
    $to: DateTime
  ) {
    notifications(
      offset: $offset
      limit: $limit
      type: $type
      category: $category
      readType: $readType
      vehicleIds: $vehicleIds
      notifications: $notifications
      archived: $archived
      from: $from
      to: $to
    ) {
      ...NotificationFragment
    }
  }
`;

export const PATHS_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  ${PATH_FRAGMENT}
  query Paths(
    $vehicleIds: [String!]!
    $from: Int!
    $to: Int!
    $offset: Int!
    $limit: Int!
  ) {
    paths(
      vehicleIds: $vehicleIds
      from: $from
      to: $to
      offset: $offset
      limit: $limit
    ) {
      ...PathFragment
    }
  }
`;

export const COUNT_PATHS_QUERY = gql`
  query CountPaths($vehicleIds: [String!]!, $from: Int!, $to: Int!) {
    countPaths(vehicleIds: $vehicleIds, from: $from, to: $to)
  }
`;

export const PATH_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  ${PATH_FRAGMENT}
  query Path($id: String!) {
    path(id: $id) {
      ...PathFragment
    }
  }
`;

export const DRIVER_PATH_QUERY = gql`
  ${VEHICLE_FRAGMENT}
  ${PATH_FRAGMENT}
  query Paths(
    $driverIds: [String!]!
    $from: Int!
    $to: Int!
    $offset: Int!
    $limit: Int!
  ) {
    paths(
      driverIds: $driverIds
      from: $from
      to: $to
      offset: $offset
      limit: $limit
    ) {
      ...PathFragment
    }
  }
`;

export const DRIVER_STATISTICS = gql`
  query DriverStatistics($driverId: String!) {
    driverStatistics(driverId: $driverId) {
      nbPaths
      usageTime
      usageMileage
      usageCost
      consumption
      electricConsumption
      totalFuel
      co2
    }
  }
`;

export const TREND_VEHICLE_QUERY = gql`
  query TrendVehicle($vehicleId: String!) {
  trend(vehicleId: $vehicleId) {
    id
    objectId
    date
    fuel
    distance
    consumption
    duration
    cost
  }
}
`
