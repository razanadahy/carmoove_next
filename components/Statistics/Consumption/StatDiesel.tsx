'use client';

import StatSmallBulle from "../StatSmallBulle";
import StatBulle from "../StatBulle";
import { IFromToProps } from "@/lib/hooks/Interfaces";
import { Loading } from "@/components/Common/Loading";
import { useGetGlobalStat } from "@/lib/hooks";
import { getPercentageValue, formatter, convertisor } from "@/lib/helpers";

interface IProps extends IFromToProps {
  isNumber: boolean;
}

const StatDiesel = (props: IProps) => {
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
    data.globalStatistics.dieselConsumption,
    "L"
  );

  return (
    <StatBulle title="Consommation gazole" number={value} unit={unit}>
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.globalStatistics.dieselConsumption / divisor)
            : getPercentageValue(
                vpData.globalStatistics.dieselConsumption,
                data.globalStatistics.dieselConsumption
              )
        }
        type="VP"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.globalStatistics.dieselConsumption / divisor)
            : getPercentageValue(
                vulData.globalStatistics.dieselConsumption,
                data.globalStatistics.dieselConsumption
              )
        }
        type="VUL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.globalStatistics.dieselConsumption / divisor)
            : getPercentageValue(
                plData.globalStatistics.dieselConsumption,
                data.globalStatistics.dieselConsumption
              )
        }
        type="PL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.globalStatistics.dieselConsumption / divisor)
            : getPercentageValue(
                vlData.globalStatistics.dieselConsumption,
                data.globalStatistics.dieselConsumption
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatDiesel;
