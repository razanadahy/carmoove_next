'use client'

import { useState } from "react";
import { DatePicker, Select, Space } from "antd";
import { useQuery } from "@apollo/client";
import { getUnixTime, getYear } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IVehicle } from "@/lib/hooks/Interfaces";
import { ME_QUERY } from "@/lib/graphql/queries";
import { Loading } from "@/components/Common/Loading";
import VehicleInformationBox from "./VehicleInformationBox";
import PathCards from "./PathCards";
import "./PathsV2.css";

interface PathsV2Props {
    vehicle: IVehicle;
}

export default function PathsV2({ vehicle }: PathsV2Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
        const dateFrom = searchParams.get('datefrom');
        const dateTo = searchParams.get('dateto');
        return (dateFrom || dateTo)
            ? [dateFrom ? dayjs(dateFrom) : null, dateTo ? dayjs(dateTo) : null]
            : null;
    });

    const { loading, error, data } = useQuery(ME_QUERY);

    if (loading) {
        return <Loading msg="Chargement des trajets..." />;
    }

    if (error) {
        return <p>Erreur lors du chargement</p>;
    }

    const user = data.whoami;
    const month = user.company ? user.company.fiscal_year.month - 1 : 0;

    const predefinedRanges: Record<string, [Dayjs, Dayjs]> = {
        "Aujourd'hui": [dayjs().startOf("day"), dayjs().endOf("day")],
        "Hier": [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")],
        "Les 7 derniers jours": [dayjs().subtract(7, "day"), dayjs()],
        "Les 90 derniers jours": [dayjs().subtract(90, "day"), dayjs()],
        "Les 12 derniers mois": [dayjs().subtract(12, "month"), dayjs()],
        "Année civile en cours": [dayjs().startOf("year"), dayjs().endOf("year")],
        "Année fiscale en cours": [dayjs(new Date(getYear(new Date()), month, 1)), dayjs().endOf("day")]
    };

    const updateSearchParams = (params: Record<string, string | null>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newSearchParams.delete(key);
            } else {
                newSearchParams.set(key, value);
            }
        });
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange(dates);
            setSelectedPeriod(undefined);
            updateSearchParams({
                datefrom: dates[0].toISOString(),
                dateto: dates[1].toISOString(),
            });
        }
    };

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
        if (value) {
            const range = predefinedRanges[value];
            setDateRange(range);
            updateSearchParams({
                datefrom: range[0].toISOString(),
                dateto: range[1].toISOString(),
            });
        }
    };

    const handleClear = () => {
        setDateRange(null);
        setSelectedPeriod(undefined);
        updateSearchParams({
            datefrom: null,
            dateto: null,
        });
    };

    return (
        <>
            <VehicleInformationBox vehicle={vehicle} />
            <Space direction="vertical" size={12} className="paths-v2-container">
                <h2>Afficher les trajets</h2>
                <div className="paths-v2-filters">
                    <DatePicker.RangePicker
                        allowClear={true}
                        format="DD/MM/YYYY"
                        onChange={handleDateChange}
                        value={dateRange}
                        placement="bottomLeft"
                        className="custom-daterange-mobile"
                    />
                    <span className="paths-v2-separator">ou sélection d'une période :</span>
                    <span className="select-box" style={{ width: '190px', display: 'inline-block' }}>
                        <Select
                            allowClear
                            style={{ width: '200px' }}
                            variant="borderless"
                            onChange={handlePeriodChange}
                            value={selectedPeriod}
                            onClear={handleClear}
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
                {dateRange && dateRange[0] && dateRange[1] && (
                    <PathCards
                        key={`${dateRange[0].toISOString()}_${dateRange[1].toISOString()}`}
                        vehicle={vehicle}
                        dateRange={[dateRange[0], dateRange[1]]}
                    />
                )}
            </Space>
        </>
    );
}
