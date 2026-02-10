'use client';

import React from 'react';
import VehicleCount from './VehicleCount';
import StatTco from './TCO/StatTco';
import StatCo2 from './StatCo2';
import Consumption from './Consumption/Consumption';
import AlertCount from './NotificationCount/AlertCount';
import WarningCount from './NotificationCount/WarningCount';
import InfoCount from './NotificationCount/InfoCount';
import Co2 from './Co2/Co2';
import "./StatGlobalList.css";

interface StatsVehicleProps {
  from: number;
  to: number;
  isNumber: boolean;
  isAutopartage: boolean | null;
  vehicles: string[];
}

const StatGlobalList: React.FC<StatsVehicleProps> = (props) => {
  return (
    <>
      <div className="stat-row">
        <div className="col-bulle mr-20">
          <VehicleCount
            isNumber={props.isNumber}
            isAutopartage={props.isAutopartage}
          />
        </div>

        <div className="col-bulle mr-20">
          <StatTco
            isNumber={props.isNumber}
            from={props.from}
            to={props.to}
            vehicles={props.vehicles}
          />
        </div>

        <div className="col-bulle">
          <StatCo2
            isNumber={props.isNumber}
            from={props.from}
            to={props.to}
            vehicles={props.vehicles}
          />
        </div>
      </div>

      <h2>Consommation de carburant</h2>
      <Consumption
        isNumber={props.isNumber}
        from={props.from}
        to={props.to}
        isAutopartage={props.isAutopartage}
      />

      <h2>Alertes</h2>
      <div className="stat-row">
        <div className="col-bulle mr-20">
          <AlertCount
            isNumber={props.isNumber}
            from={props.from}
            to={props.to}
            vehicles={props.vehicles}
          />
        </div>
        <div className="col-bulle mr-20">
          <WarningCount
            isNumber={props.isNumber}
            from={props.from}
            to={props.to}
            vehicles={props.vehicles}
          />
        </div>
        <div className="col-bulle">
          <InfoCount
            isNumber={props.isNumber}
            from={props.from}
            to={props.to}
            vehicles={props.vehicles}
          />
        </div>
      </div>

      <h2>Emissions de CO2</h2>
      <Co2
        isNumber={props.isNumber}
        from={props.from}
        to={props.to}
      />
    </>
  );
};

export default StatGlobalList;
export { formatNum } from '@/lib/helpers';
