'use client';

import { Loading } from "@/components/Common/Loading";
import StatBulle from "../StatBulle";
import StatSmallBulle from "../StatSmallBulle";
import { useGetGlobalStat } from "@/lib/hooks";
import { IFromToProps } from "@/lib/hooks/Interfaces";
import { getPercentageValue, convertisor, formatter } from "@/lib/helpers";

interface IProps extends IFromToProps {
  isNumber: boolean;
}

const StatElectric = (props: IProps) => {
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

  if (loading || getVpDataLoading || getPlDataLoading || getVulDataLoading || getVlDataLoading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const { value, unit, divisor } = convertisor(
    data.globalStatistics.electricConsumption,
    "w"
  );

  return (
    <StatBulle title="Consommation électrique" number={value} unit={unit}>
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.globalStatistics.electricConsumption / divisor)
            : getPercentageValue(
                vpData.globalStatistics.electricConsumption,
                data.globalStatistics.electricConsumption
              )
        }
        type="VP"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.globalStatistics.electricConsumption / divisor)
            : getPercentageValue(
                vulData.globalStatistics.electricConsumption,
                data.globalStatistics.electricConsumption
              )
        }
        type="VUL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.globalStatistics.electricConsumption / divisor)
            : getPercentageValue(
                plData.globalStatistics.electricConsumption,
                data.globalStatistics.electricConsumption
              )
        }
        type="PL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.globalStatistics.electricConsumption / divisor)
            : getPercentageValue(
                vlData.globalStatistics.electricConsumption,
                data.globalStatistics.electricConsumption
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatElectric;
