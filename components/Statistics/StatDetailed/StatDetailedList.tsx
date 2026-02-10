'use client';

import React from 'react';
import TableAdministrative from './TableAdministrative';
import TableAlert from './TableAlert';
import TableConsumption from './TableConsumption';
import { STATS_QUERY } from '@/lib/graphql/queries';
import { useQuery } from '@apollo/client';
import { Loading } from '@/components/Common/Loading';
import { IStatVehicle } from '@/lib/hooks/Interfaces';

interface IStatDetailedList {
  from: number;
  to: number;
  isAutopartage: boolean | null;
  types: string[];
  energies: string[];
  makes: string[];
  models: string[];
  drivers: string[];
  registrations: string[];
}

const StatDetailedList: React.FC<IStatDetailedList> = (props) => {
  const { loading, error, data } = useQuery(STATS_QUERY, {
    variables: {
      from: props.from,
      to: props.to
    },
    context: {
      version: 'php'
    }
  });

  if (loading) {
    return <Loading msg="Chargement des statistiques..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const statVehicles = new Array<IStatVehicle>();

  data.detailedStatistics.map((stat: IStatVehicle) => {
    if (
      (props.isAutopartage === null || (props.isAutopartage === stat.vehicle.device?.carSharing) || (!props.isAutopartage && !stat.vehicle.device?.carSharing)) &&
      (props.types.length === 0 || props.types.includes(stat.vehicle.information.type)) &&
      (props.energies.length === 0 || props.energies.includes(stat.vehicle.information.energy)) &&
      (props.makes.length === 0 || props.makes.includes(stat.vehicle.information.make)) &&
      (props.models.length === 0 || props.models.includes(stat.vehicle.information.model)) &&
      (props.drivers.length === 0 || (stat.vehicle.driver?.driverID && props.drivers.includes(stat.vehicle.driver.firstName + ' ' + stat.vehicle.driver.lastName))) &&
      (props.registrations.length === 0 || props.registrations.includes(stat.vehicle.information.registration))
    ) statVehicles.push(stat);
  });

  return (
    <>
      <TableAdministrative statVehicles={statVehicles} />
      <TableAlert statVehicles={statVehicles} />
      <TableConsumption statVehicles={statVehicles} />
    </>
  );
};

export default StatDetailedList;
