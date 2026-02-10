'use client';

import { Loading } from "@/components/Common/Loading";
import StatBulle from "../StatBulle";
import StatSmallBulle from "../StatSmallBulle";
import { useGetGlobalStat } from "@/lib/hooks";
import { IFromToProps } from "@/lib/hooks/Interfaces";
import { getPercentageValue, formatter, convertisor } from "@/lib/helpers";

interface IProps extends IFromToProps {
  isNumber: boolean;
}

const StatGasoline = (props: IProps) => {
  const { from, to, isNumber } = props;

  const { loading, error, data } = useGetGlobalStat({ from, to });
  const { data: vpData, loading: getVpDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VP",
  });

  const { data: vulData, loading: getVulDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VUL",
  });

  const { data: plData, loading: getPlDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "PL",
  });

  const { data: vlData, loading: getVlDataLoading } = useGetGlobalStat({
    from,
    to,
    type: "VL",
  });

  if (loading || getVpDataLoading || getVulDataLoading || getPlDataLoading || getVlDataLoading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const { value, unit, divisor } = convertisor(
    data.globalStatistics.gasolineConsumption,
    "L"
  );

  return (
    <StatBulle title="Consommation Essence" number={value} unit={unit}>
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.globalStatistics.gasolineConsumption / divisor)
            : getPercentageValue(
                vpData.globalStatistics.gasolineConsumption,
                data.globalStatistics.gasolineConsumption
              )
        }
        type="VP"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.globalStatistics.gasolineConsumption / divisor)
            : getPercentageValue(
                vulData.globalStatistics.gasolineConsumption,
                data.globalStatistics.gasolineConsumption
              )
        }
        type="VUL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.globalStatistics.gasolineConsumption / divisor)
            : getPercentageValue(
                plData.globalStatistics.gasolineConsumption,
                data.globalStatistics.gasolineConsumption
              )
        }
        type="PL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.globalStatistics.gasolineConsumption / divisor)
            : getPercentageValue(
                vlData.globalStatistics.gasolineConsumption,
                data.globalStatistics.gasolineConsumption
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatGasoline;
