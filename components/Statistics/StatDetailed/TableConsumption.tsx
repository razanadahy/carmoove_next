'use client';

import React, { useMemo } from "react";
import { Table } from "antd";
import { IStatVehicle } from "@/lib/hooks/Interfaces";
import { energyTrueFormat } from "@/services/VehiculesService";
import type { ColumnsType } from "antd/es/table";

interface TableConsumptionProps {
  statVehicles: Array<IStatVehicle>;
}

interface DataType {
  key: string;
  registration: string;
  make: string;
  model: string;
  energy: string;
  total: number;
  lastConsumption: number;
  fiveLastConsumption: number;
  consumption: number;
}

function TableConsumption(props: TableConsumptionProps) {
  const numberFormatter0 = (value: number) => Intl.NumberFormat('fr-FR').format(Math.round(value));
  const numberFormatter1 = (value: number) => Intl.NumberFormat('fr-FR').format(Math.round(value * 10) / 10);

  const columns: ColumnsType<DataType> = useMemo(() => [
    {
      title: 'Immatriculation',
      dataIndex: 'registration',
      key: 'registration',
    },
    {
      title: 'Marque',
      dataIndex: 'make',
      key: 'make',
    },
    {
      title: 'Modèle',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Energie',
      dataIndex: 'energy',
      key: 'energy',
    },
    {
      title: 'Total (l / kw / kg)',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => numberFormatter0(value),
    },
    {
      title: 'Au 100km - Dernier trajet (l / kw / kg)',
      dataIndex: 'lastConsumption',
      key: 'lastConsumption',
      render: (value: number) => numberFormatter1(value),
    },
    {
      title: 'Au 100km - Moy. 5 derniers trajets (l / kw / kg)',
      dataIndex: 'fiveLastConsumption',
      key: 'fiveLastConsumption',
      render: (value: number) => numberFormatter1(value),
    },
    {
      title: 'Au 100km - Moyenne tous trajets (l / kw / kg)',
      dataIndex: 'consumption',
      key: 'consumption',
      render: (value: number) => numberFormatter1(value),
    }
  ], []);

  const data: DataType[] = useMemo(() => (
    props.statVehicles.map((row, index) => {
      let fiveLastConsumption = 0;
      let lastConsumption = 0;
      let allConsumption = 0;

      if (row.vehicle.information.energy === 'EL' && row.fiveLastPath) {
        fiveLastConsumption = Math.round(row.fiveLastPath.electricity) / 1000;
      } else if (row.fiveLastPath) {
        fiveLastConsumption = row.fiveLastPath.fuel;
      }

      if (row.vehicle.information.energy === 'EL' && row.lastPath) {
        lastConsumption = Math.round(row.lastPath.electricity) / 1000;
      } else if (row.lastPath) {
        lastConsumption = row.lastPath.consumption;
      }

      if (row.vehicle.information.energy === 'EL' && row.consumption) {
        allConsumption = Math.round(row.consumption.electricity) / 1000;
      } else if (row.consumption) {
        allConsumption = row.consumption.fuel;
      }

      return {
        key: row.vehicle.id || index.toString(),
        registration: row.vehicle.information.registration,
        make: row.vehicle.information.make,
        model: row.vehicle.information.model,
        energy: energyTrueFormat(row.vehicle.information.energy),
        total: row.fuel ? row.fuel.fuel : 0,
        lastConsumption,
        fiveLastConsumption,
        consumption: allConsumption,
      };
    })
  ), [props.statVehicles]);

  return (
    <>
      <h2>Consommation de carburant</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}

export default TableConsumption;
