'use client';

import React, { useMemo } from "react";
import { Table } from "antd";
import { IStatVehicle } from "@/lib/hooks/Interfaces";
import type { ColumnsType } from "antd/es/table";

interface TableAlertProps {
  statVehicles: Array<IStatVehicle>;
}

interface DataType {
  key: string;
  registration: string;
  make: string;
  model: string;
  total: number;
  critic: number;
  warning: number;
  info: number;
}

function TableAlert(props: TableAlertProps) {
  const numberFormatter = (value: number) => Intl.NumberFormat('fr-FR').format(value);

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
      title: 'Total (#)',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => numberFormatter(value),
    },
    {
      title: 'Alerte critique (#)',
      dataIndex: 'critic',
      key: 'critic',
      render: (value: number) => numberFormatter(value),
    },
    {
      title: 'Warning (#)',
      dataIndex: 'warning',
      key: 'warning',
      render: (value: number) => numberFormatter(value),
    },
    {
      title: 'Alerte Informative (#)',
      dataIndex: 'info',
      key: 'info',
      render: (value: number) => numberFormatter(value),
    }
  ], []);

  const data: DataType[] = useMemo(() => (
    props.statVehicles.map((row, index) => ({
      key: row.vehicle.id || index.toString(),
      registration: row.vehicle.information.registration,
      make: row.vehicle.information.make,
      model: row.vehicle.information.model,
      critic: row.notifications ? row.notifications.alert : 0,
      warning: row.notifications ? row.notifications.warning : 0,
      info: row.notifications ? row.notifications.notice : 0,
      total: row.notifications ? row.notifications.total : 0,
    }))
  ), [props.statVehicles]);

  return (
    <>
      <h2>Alertes & diagnostic</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}

export default TableAlert;
