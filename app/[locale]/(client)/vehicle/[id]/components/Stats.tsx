'use client'

import { useState } from "react";
import { DatePicker, Select } from "antd";
import { useQuery } from "@apollo/client";
import { getUnixTime, getYear } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { ME_QUERY } from "@/lib/graphql/queries";
import { Loading } from "@/components/Common/Loading";
import VehicleInformationBox from "./VehicleInformationBox";
import StatsVehicle from "@/app/[locale]/(client)/dashboard/components/Statistics/StatsVehicle";
import "./Stats.css";

export interface IFromTo {
    from: number;
    to: number;
}

interface StatInPeriodProps {
    vehicle: IVehicle;
    month: number;
}

function StatInPeriod({ vehicle, month }: StatInPeriodProps) {
    const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [fromTo, setFromTo] = useState<IFromTo | null>(null);
    const { RangePicker } = DatePicker;

    const predefinedRanges: Record<string, [Dayjs, Dayjs]> = {
        "Aujourd'hui": [dayjs().startOf("day"), dayjs().endOf("day")],
        "Hier": [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")],
        "Les 7 derniers jours": [dayjs().subtract(7, "day"), dayjs()],
        "Les 90 derniers jours": [dayjs().subtract(90, "day"), dayjs()],
        "Les 12 derniers mois": [dayjs().subtract(12, "month"), dayjs()],
        "Année civile en cours": [dayjs().startOf("year"), dayjs().endOf("year")],
        "Année fiscale en cours": [dayjs(new Date(getYear(new Date()), month, 1)), dayjs().endOf("day")]
    };

    const setDate = (from: Dayjs, to: Dayjs) => {
        setFromTo({
            from: getUnixTime(from.toDate()),
            to: getUnixTime(to.toDate()),
        });
    };

    const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        console.log(dates);
        if (!dates || dates[0] === null || dates[1] === null) {
            setFromTo(null);
            // setPeriod([null, null]);
        } else {
            const from = dates[0];
            const to = dates[1];

            setPeriod([from, to]);
            setDate(from, to);
        }
    };

    const handlePeriodChange = (value: string) => {
        if (value === undefined) {
            setFromTo(null);
            setPeriod([null, null]);
            return;
        }
        const from = predefinedRanges[value][0];
        const to = predefinedRanges[value][1];

        setPeriod([from, to]);
        setDate(from, to);
    };

    return (
        <>
            <div className="stats-period-selector">
                <RangePicker
                    allowClear={true}
                    format="DD/MM/YYYY"
                    onCalendarChange={handleCalendarChange}
                    value={period}
                />
                <span className="stats-period-label">ou sélection d'une période :</span>
                <span className="select-box">
                    <Select
                        allowClear
                        style={{ width: '200px' }}
                        variant="borderless"
                        onChange={(value) => handlePeriodChange(value)}
                        placeholder="Sélectionner une période"
                    >
                        {Object.keys(predefinedRanges).map((key) => (
                            <Select.Option key={key} value={key}>
                                {key}
                            </Select.Option>
                        ))}
                    </Select>
                </span>
            </div>
            {fromTo !== null && (
                <StatsVehicle vehicle={vehicle} from={fromTo.from} to={fromTo.to} />
            )}
        </>
    );
}

function Stats(props: { vehicle: IVehicle }) {
    const { loading, error, data } = useQuery(ME_QUERY, {

    });

    if (loading) {
        return <Loading msg="Chargement..." />;
    }

    if (error) {
        return <p>Erreur lors du chargement</p>;
    }

    const user = data.whoami;
    const month = user.company ? user.company.fiscal_year.month - 1 : 0;

    return (
        <>
            <VehicleInformationBox vehicle={props.vehicle} />
            <div className="stats-main-content">
                <h2>Statistiques</h2>
                <StatInPeriod vehicle={props.vehicle} month={month} />
            </div>
        </>
    );
}

export default Stats;
