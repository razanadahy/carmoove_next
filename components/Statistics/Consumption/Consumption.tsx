'use client';

import { IFromToProps } from "@/lib/hooks/Interfaces";
import { useGetVehicles } from "@/lib/hooks";
import { Loading } from "@/components/Common/Loading";
import StatGasoline from "./StatGasoline";
import StatDiesel from "./StatDiesel";
import StatElectric from "./StatElectric";

interface IProps extends IFromToProps {
  isNumber: boolean;
  isAutopartage: boolean | null;
}

const Consumption = (props: IProps) => {
  const { from, to, isNumber } = props;

  let countGO = 0;
  let countES = 0;
  let countEL = 0;

  const { loading, error, vehicles } = useGetVehicles();

  if (loading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  for (const vehicle of vehicles) {
    if (
      props.isAutopartage === null ||
      props.isAutopartage === vehicle.device?.carSharing ||
      (!props.isAutopartage && !vehicle.device?.carSharing)
    ) {
      if ("GO" === vehicle.information.energy) {
        countGO++;
      } else if ("ES" === vehicle.information.energy) {
        countES++;
      } else if ("EL" === vehicle.information.energy) {
        countEL++;
      }
    }
  }

  return (
    <div className="row">
      {countES > 0 && (
        <div className="col-bulle mr-20">
          <StatGasoline from={from} to={to} isNumber={isNumber} />
        </div>
      )}
      {countGO > 0 && (
        <div className="col-bulle mr-20">
          <StatDiesel from={from} to={to} isNumber={isNumber} />
        </div>
      )}
      {countEL > 0 && (
        <div className="col-bulle mr-20">
          <StatElectric from={from} to={to} isNumber={isNumber} />
        </div>
      )}
    </div>
  );
};

export default Consumption;
