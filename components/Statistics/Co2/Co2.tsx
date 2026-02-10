'use client';

import { IFromToProps } from "@/lib/hooks/Interfaces";
import { useGetVehicles } from "@/lib/hooks";
import { Loading } from "@/components/Common/Loading";
import StatCo2Gasoline from "./StatCo2Gasoline";
import StatCo2Diesel from "./StatCo2Diesel";
import StatCo2Electric from "./StatCo2Electric";

interface IProps extends IFromToProps {
  isNumber: boolean;
}

const Co2 = (props: IProps) => {
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
    if ("GO" === vehicle.information.energy) {
      countGO++;
    } else if ("ES" === vehicle.information.energy) {
      countES++;
    } else if ("EL" === vehicle.information.energy) {
      countEL++;
    }
  }

  return (
    <div className="row">
      {countES > 0 && (
        <div className="col-bulle mr-20">
          <StatCo2Gasoline from={from} to={to} isNumber={isNumber} />
        </div>
      )}
      {countGO > 0 && (
        <div className="col-bulle mr-20">
          <StatCo2Diesel from={from} to={to} isNumber={isNumber} />
        </div>
      )}
      {countEL > 0 && (
        <div className="col-bulle mr-20">
          <StatCo2Electric from={from} to={to} isNumber={isNumber} />
        </div>
      )}
    </div>
  );
};

export default Co2;
