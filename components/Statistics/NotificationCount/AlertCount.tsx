'use client';

import StatBulle from "../StatBulle";
import { Loading } from "@/components/Common/Loading";
import StatSmallBulle from "../StatSmallBulle";
import { IAlertCount, IFromToProps } from "@/lib/hooks/Interfaces";
import { getPercentageValue } from "@/lib/helpers";
import { useGetAlertsCount } from "@/lib/hooks";

interface IProps extends IFromToProps {
  isNumber: boolean;
  vehicles: string[];
}

const AlertCount = (props: IProps) => {
  const { from, to, isNumber } = props;
  const { loading, error, data } = useGetAlertsCount({ from, to });
  const { data: vpData, loading: loadingVP } = useGetAlertsCount({
    from,
    to,
    type: "VP",
    vehicles: props.vehicles,
  });

  const { data: vulData, loading: loadingVUL } = useGetAlertsCount({
    from,
    to,
    type: "VUL",
    vehicles: props.vehicles,
  });
  const { data: plData, loading: loadingPL } = useGetAlertsCount({
    from,
    to,
    type: "PL",
    vehicles: props.vehicles,
  });

  const { data: vlData, loading: loadingVL } = useGetAlertsCount({
    from,
    to,
    type: "VL",
    vehicles: props.vehicles,
  });

  if (loading || loadingVP || loadingVUL || loadingPL || loadingVL) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const count = (data: any) => {
    let count = 0;

    data.notificationCounter.map((alertCount: IAlertCount) => {
      if (alertCount.type === "ALERT") {
        count = alertCount.count;
      }
    });

    return count;
  };

  return (
    <StatBulle title="Alertes critiques" number={count(data)} unit="#">
      <StatSmallBulle
        value={
          isNumber
            ? count(vpData)
            : getPercentageValue(count(vpData), count(data))
        }
        type="VP"
      />
      <StatSmallBulle
        value={
          isNumber
            ? count(vulData)
            : getPercentageValue(count(vulData), count(data))
        }
        type="VUL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? count(plData)
            : getPercentageValue(count(plData), count(data))
        }
        type="PL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? count(vlData)
            : getPercentageValue(count(vlData), count(data))
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default AlertCount;
