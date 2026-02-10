'use client';

import { Loading } from "@/components/Common/Loading";
import StatSmallBulle from "../StatSmallBulle";
import StatBulle from "../StatBulle";
import { getPercentageValue, convertisor, formatter } from "@/lib/helpers";
import { IFromToProps } from "@/lib/hooks/Interfaces";
import { useGetStats } from "@/lib/hooks";

interface IProps extends IFromToProps {
  isNumber: boolean;
  vehicles: string[];
}

const StatTco = (props: IProps) => {
  const { from, to, isNumber } = props;

  const { loading, error, data } = useGetStats({ from, to });
  const { data: vulData, loading: loadingGetVul } = useGetStats({
    from,
    to,
    type: "VUL",
    vehicles: props.vehicles,
  });
  const { data: vpData, loading: loadingGetVp } = useGetStats({
    from,
    to,
    type: "VP",
    vehicles: props.vehicles,
  });
  const { data: plData, loading: loadingGetPl } = useGetStats({
    from,
    to,
    type: "PL",
    vehicles: props.vehicles,
  });
  const { data: vlData, loading: loadingGetVl } = useGetStats({
    from,
    to,
    type: "VL",
    vehicles: props.vehicles,
  });

  if (loading || loadingGetVul || loadingGetVp || loadingGetPl || loadingGetVl) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const { value, unit, divisor } = convertisor(
    data.dashboard.agregation.cost,
    "€"
  );

  return (
    <StatBulle
      tooltip="Coût estimé total de la catégorie sélectionnée depuis le début de l'année fiscale et basée sur le barème kilométrique gouvernemental"
      title="TCO ou coût estimatif"
      number={value}
      unit={unit}
    >
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vpData.dashboard.agregation.cost / divisor)
            : getPercentageValue(
                vpData.dashboard.agregation.cost,
                data.dashboard.agregation.cost
              )
        }
        type="VP"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vulData.dashboard.agregation.cost / divisor)
            : getPercentageValue(
                vulData.dashboard.agregation.cost,
                data.dashboard.agregation.cost
              )
        }
        type="VUL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter(plData.dashboard.agregation.cost / divisor)
            : getPercentageValue(
                plData.dashboard.agregation.cost,
                data.dashboard.agregation.cost
              )
        }
        type="PL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter(vlData.dashboard.agregation.cost / divisor)
            : getPercentageValue(
                vlData.dashboard.agregation.cost,
                data.dashboard.agregation.cost
              )
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default StatTco;
