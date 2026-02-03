import { gql } from "@apollo/client";

export const VEHICLE_FRAGMENT = gql`
  fragment VehicleFragment on Vehicle {
    __typename
    id
    rights
    device {
      id
      carSharing
      type
      model
      builder
      simId
      lastMessageDate
      configuration {
        mongoId
        configuration
        features {
          GPSjamming {
            state
            action
            actionLaunched
          }
          GNSSjamming {
            state
            action
            actionLaunched
          }
          towingDetection {
            state
            action
            actionLaunched
          }
          buzzer {
            state
            action
            actionLaunched
          }
          honk {
            state
            action
            actionLaunched
          }
          immobilizer {
            state
            action
            actionLaunched
          }
          centralLock {
            state
            action
            actionLaunched
          }
          turningLights {
            state
            action
            actionLaunched
          }
        }
        programNumber
      }
    }
    information {
      __typename
      make
      model
      rawModel
      version
      registration
      energy
      kind
      kindCG
      type
      typeCG
      width
      height
      length
      seatings
      doors
      engineCode
      injectionMode
      turbo
      displacement
      cylinders
      valves
      vin
      vinTypeCG
      unloadedWeight
      totalWeight
      prfTotalWeight
      wheelbase
      gearboxType
      gears
      propulsion
      horsePower
      kwPower
      serial
      nationalIdentificationCode
      typeVariantVersion
      color
      dateFirstCirculation
      dateCGRequest
      lastControlDate
      fiscalPower
      price
      depollution
      fuelTankCapacity
      consumptionExtraurban
      consumptionMixed
      consumptionUrban
      co2
    }
    maintenance {
      lastScheduledMaintenance
      nextScheduledMaintenance
      lastMaintenanceMileage
      nextControlDate
      lastControlDate
    }
    driver {
      __typename
      firstName
      lastName
      driverID
      phoneNumber
      email
      privacy  
    }
    status {
      __typename
      parked
      battery
      fuelLevel
      fuelPercent
      engine
      fault
      theft
      towage
      privacy
      accident
      mileage
      immobilized
      centralLocked
      buzzer
      honk
    }
    electricityStatus {
      __typename
      chargeInProgress
      battery
      autonomy
      batteryHealthStatus
      timeUntilFullyCharged
    }
    fuelInformation {
      capacity {
        available
        value
      }
      distance {
        available
        value
      }
      consumption {
        available
        value
      }
    }
    electricConsumption
    location {
      latitude
      longitude
      address {
        address
        city
        zipcode
        country
      }
      timestamp
    }
    assistance {
      code
      distance
      phoneNumber
    }
    dataAvailability {
      TellTaleStatus
    }
    acquisition {
      mode
      seller
      price
      tax
      duration
      start
      mileage
      redemptionValue
      subscription
      end
    }
  }
`;

export const PATH_FRAGMENT = gql`
  fragment PathFragment on Path {
    id
    duration
    distance
    fuel
    cost
    private
    averageSpeed
    consumption
    electricConsumption
    electricConsumption100km
    electricityPercent
    startAt
    stopAt
    addressStart {
      address
      city
      zipcode
      country
    }
    addressEnd {
      address
      city
      zipcode
      country
    }
    positions {
      latitude
      longitude
      timestamp
    }
    vehicle {
      ...VehicleFragment
    }
  }
`;

export const NOTIFICATION_FRAGMENT = gql`
  ${VEHICLE_FRAGMENT}
  fragment NotificationFragment on Notification {
    id
    category
    categoryTranslation
    type
    read
    archived
    code
    vehicle {
      ...VehicleFragment
    }
    headings {
      language
      text
    }
    contents {
      language
      text
    }
    shipment {
      id
      status
      read
      timestamp
      recipients
    }
    informations {
      key
      value
    }
    actions {
      type
      link
      data
      label {
        language
        label
      }
      feature
    }
  }
`;
