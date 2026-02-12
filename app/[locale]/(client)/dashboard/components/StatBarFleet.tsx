"use client"

import {Card, Statistic, Row, Col, Tag} from "antd";
import { CarOutlined, DashboardOutlined } from "@ant-design/icons";
import {convertisor} from "@/lib/helpers";
import {TYPE_FLEET, TYPE_VEHICLE, VehicleType} from "@/lib/utils/VehicleType";
import {useGetStats} from "@/lib/hooks";
import {Skeleton} from "antd";
import {StatBulle} from "@/components/Statistics";
import StatShowBox from "@/app/[locale]/(client)/vehicle/[id]/components/StatShowBox";

interface StatBarFleetProps {
    types: string;
}

export default function StatBarFleet({ types }: StatBarFleetProps) {
    const to = new Date();
    to.setHours(23, 59, 59);

    const { loading, error, data } = useGetStats({
        from: 0,
        to: Math.round(to.getTime() / 1000),
        pollInterval: 30000,
        type: types as VehicleType | typeof TYPE_FLEET | typeof TYPE_VEHICLE,
    });


    const { value: estimatedCost, unit: estimatedCostUnit } = convertisor(
        data?.dashboard.agregation.cost ?? 0,
        "€"
    );

    const { value: electricConsumption, unit: electricConsumptionUnit } =
        convertisor(data?.dashboard.agregation.electricyConsumption ?? 0, "w");

    const { value: electricity, unit: electricityConsumptionUnit } = convertisor(
        data?.dashboard.agregation.electricity ?? 0,
        "w"
    );
    return (
        <Card className="mt-3 mb-3" title={<span><DashboardOutlined /> Statistiques de <Tag><strong>{types}</strong></Tag> </span>}>
            <div className="w-100 d-flex gap-2">
                {loading ? (<>
                    <div className="stat-show-box" style={{border: '1px solid #39A1D8'}}>
                        <div className="mb-2 w-100">
                            <div className="stat-title pe-2"> <Skeleton.Button active={true} size={"small"} className="w-100" shape={"default"} block={false} /></div>
                        </div>
                        <div className="w-100 h-100" >
                            <Skeleton.Button active={true} className="w-100 h-100" style={{ width: '100%', minHeight: '60px' }} />
                        </div>
                    </div>
                    <div className="stat-show-box" style={{border: '1px solid #39A1D8'}}>
                        <div className="stat-header w-100 mb-2">
                            <div className="stat-title pe-2"> <Skeleton.Button active={true} size={"small"} className="w-100" shape={"default"} block={false} /></div>
                        </div>
                        <div className=" w-100 h-100">
                            <Skeleton.Button active={true} className="w-100 h-100" />
                        </div>
                    </div>

                </>) : (<>
                    <StatShowBox
                        tooltip="Nombre total de véhicules de la catégorie disponibles dans Carmoove"
                        title="Véhicules"
                        value={data.dashboard.agregation.count}
                        unity="#"
                    />

                    <StatShowBox
                        tooltip="Coût estimé total de la catégorie sélectionnée depuis le début de l'année fiscale et basée sur le barème kilométrique gouvernemental"
                        title="Coûts estimés"
                        value={estimatedCost}
                        unity={estimatedCostUnit}
                    />

                    {data.dashboard.agregation.consumption > 0 && (
                        <StatShowBox
                            tooltip="Consommation moyenne au 100km de la catégorie sélectionnée depuis le début de l'année fiscale"
                            title="Conso au 100km"
                            value={data.dashboard.agregation.consumption}
                            unity="L"
                        />
                    )}

                    {data.dashboard.agregation.fuel > 0 && (
                        <StatShowBox
                            tooltip="Consommation totale de carburant de la catégorie sélectionnée depuis le début de l'année fiscale"
                            title="Conso totale"
                            value={Math.round(data.dashboard.agregation.fuel)}
                            unity="L"
                        />
                    )}

                    {data.dashboard.agregation.electricyConsumption > 0 && (
                        <StatShowBox
                            tooltip="Consommation moyenne au 100km de la catégorie sélectionnée depuis le début de l'année fiscale"
                            title="Conso au 100km"
                            value={electricConsumption}
                            unity={electricConsumptionUnit}
                        />
                    )}

                    {data.dashboard.agregation.electricity > 0 && (
                        <StatShowBox
                            tooltip="Consommation totale d'énergie de la catégorie sélectionnée depuis le début de l'année fiscale"
                            title="Conso totale"
                            value={electricity}
                            unity={electricityConsumptionUnit}
                        />
                    )}
                </>)}

            </div>
        </Card>
    );
}
