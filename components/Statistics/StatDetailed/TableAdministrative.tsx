'use client';

import React, { useMemo } from "react";
import { Table } from "antd";
import { IStatVehicle } from "@/lib/hooks/Interfaces";
import { energyTrueFormat } from "@/services/VehiculesService";
import type { ColumnsType } from "antd/es/table";

interface TableAdministrativeProps {
  statVehicles: Array<IStatVehicle>;
}

interface DataType {
  key: string;
  registration: string;
  make: string;
  model: string;
  category: string;
  km: number;
  tco: number;
  energy: string;
  driver: string | null;
}

function TableAdministrative(props: TableAdministrativeProps) {
  const numberFormatter = (value: number) => Intl.NumberFormat('fr-FR').format(Math.round(value));

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
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Kilométrage (Km)',
      dataIndex: 'km',
      key: 'km',
      render: (value: number) => numberFormatter(value),
    },
    {
      title: 'Coût estimé (€)',
      dataIndex: 'tco',
      key: 'tco',
      render: (value: number) => numberFormatter(value),
    },
    {
      title: 'Carburant',
      dataIndex: 'energy',
      key: 'energy',
    },
    {
      title: 'Conducteurs',
      dataIndex: 'driver',
      key: 'driver',
    }
  ], []);

  const data: DataType[] = useMemo(() => (
    props.statVehicles.map((row, index) => ({
      key: row.vehicle.id || index.toString(),
      registration: row.vehicle.information.registration,
      make: row.vehicle.information.make,
      model: row.vehicle.information.model,
      category: row.vehicle.information.kindCG,
      km: row.vehicle.status.mileage,
      tco: row.cost,
      energy: energyTrueFormat(row.vehicle.information.energy),
      driver: row.vehicle.driver ? row.vehicle.driver.firstName + ' ' + row.vehicle.driver.lastName : null,
    }))
  ), [props.statVehicles]);

  return (
    <>
      <h2>Administratif</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}

export default TableAdministrative;
