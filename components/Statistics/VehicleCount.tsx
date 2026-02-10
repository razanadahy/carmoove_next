'use client';

import StatSmallBulle from "./StatSmallBulle";
import StatBulle from "./StatBulle";
import { Loading } from "@/components/Common/Loading";
import { IsVehicleOfCarmooveType } from "@/lib/utils/VehicleType";
import { useGetVehicles } from "@/lib/hooks";
import { getPercentageValue } from "@/lib/helpers";

interface IProps {
  isNumber: boolean;
  isAutopartage: boolean | null;
}

const VehicleCount = ({ isNumber, isAutopartage }: IProps) => {
  const { loading, error, vehicles } = useGetVehicles();

  if (loading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  let countVP = 0;
  let countVL = 0;
  let countPL = 0;
  let countVUL = 0;

  for (const vehicle of vehicles) {
    if (
      isAutopartage === null ||
      isAutopartage === vehicle.device?.carSharing ||
      (!isAutopartage && !vehicle.device?.carSharing)
    ) {
      if (IsVehicleOfCarmooveType(vehicle, "VP")) {
        countVP++;
      } else if (IsVehicleOfCarmooveType(vehicle, "PL")) {
        countPL++;
      } else if (IsVehicleOfCarmooveType(vehicle, "VUL")) {
        countVUL++;
      } else if (IsVehicleOfCarmooveType(vehicle, "VL")) {
        countVL++;
      }
    }
  }

  const total = countVP + countPL + countVUL + countVL;
  const formatter = Intl.NumberFormat("fr-FR");

  return (
    <StatBulle
      tooltip="Nombre total de véhicules de la catégorie disponibles dans Carmoove"
      title="Nombre de Véhicules"
      number={total}
      unit="#"
    >
      <StatSmallBulle
        value={
          isNumber
            ? formatter.format(countVP)
            : getPercentageValue(countVP, total)
        }
        type="VP"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter.format(countVUL)
            : getPercentageValue(countVUL, total)
        }
        type="VUL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter.format(countPL)
            : getPercentageValue(countPL, total)
        }
        type="PL"
      />
      <StatSmallBulle
        value={
          isNumber
            ? formatter.format(countVL)
            : getPercentageValue(countVL, total)
        }
        type="VL"
      />
    </StatBulle>
  );
};

export default VehicleCount;
