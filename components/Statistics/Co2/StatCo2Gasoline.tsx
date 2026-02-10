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

const StatCo2Gasoline = (props: IProps) => {
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
    data.globalStatistics.gasolineCo2,
    "g"
  );

  let realUnit = unit;
  if (unit === 'Mg') {
    realUnit = 'T';
  }

  return (
    <StatBulle title="CO2 Essence" number={value} unit={realUnit}>
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.globalStatistics.gasolineCo2 / divisor)
            : getPercentageValue(
                vpData.globalStatistics.gasolineCo2,
                data.globalStatistics.gasolineCo2
              )
        }
        type="VP"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.globalStatistics.gasolineCo2 / divisor)
            : getPercentageValue(
                vulData.globalStatistics.gasolineCo2,
                data.globalStatistics.gasolineCo2
              )
        }
        type="VUL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.globalStatistics.gasolineCo2 / divisor)
            : getPercentageValue(
                plData.globalStatistics.gasolineCo2,
                data.globalStatistics.gasolineCo2
              )
        }
        type="PL"
      />

      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.globalStatistics.gasolineCo2 / divisor)
            : getPercentageValue(
                vlData.globalStatistics.gasolineCo2,
                data.globalStatistics.gasolineCo2
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatCo2Gasoline;
