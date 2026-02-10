'use client';

import { Loading } from "@/components/Common/Loading";
import StatBulle from "./StatBulle";
import StatSmallBulle from "./StatSmallBulle";
import { useGetGlobalStat } from "@/lib/hooks";
import { IFromToProps } from "@/lib/hooks/Interfaces";
import { getPercentageValue, formatter, convertisor } from "@/lib/helpers";

interface IProps extends IFromToProps {
  isNumber: boolean;
  vehicles: string[];
}

const StatCo2 = (props: IProps) => {
  const { from, to, isNumber } = props;

  const { loading, error, data } = useGetGlobalStat({ from, to });
  const { data: vpData, loading: getVpDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VP",
    vehicles: props.vehicles,
  });

  const { data: vulData, loading: getVulDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VUL",
    vehicles: props.vehicles,
  });

  const { data: plData, loading: getPlDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "PL",
    vehicles: props.vehicles,
  });

  const { data: vlData, loading: getVlDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VL",
    vehicles: props.vehicles,
  });

  if (loading || getVpDataLoading || getVulDataLoading || getPlDataLoading || getVlDataLoading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const { value, unit, divisor } = convertisor(
    data.globalStatistics.co2,
    "g"
  );

  let realUnit = unit;
  if (unit === 'Mg') {
    realUnit = 'T';
  }

  return (
    <StatBulle title="Emission de CO2" number={value} unit={realUnit}>
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.globalStatistics.co2 / divisor)
            : getPercentageValue(
                vpData.globalStatistics.co2,
                data.globalStatistics.co2
              )
        }
        type="VP"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.globalStatistics.co2 / divisor)
            : getPercentageValue(
                vulData.globalStatistics.co2,
                data.globalStatistics.co2
              )
        }
        type="VUL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.globalStatistics.co2 / divisor)
            : getPercentageValue(
                plData.globalStatistics.co2,
                data.globalStatistics.co2
              )
        }
        type="PL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.globalStatistics.co2 / divisor)
            : getPercentageValue(
                vlData.globalStatistics.co2,
                data.globalStatistics.co2
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatCo2;
