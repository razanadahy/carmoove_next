"use client"

import { useState } from "react";
import { DatePicker, Space, Card, Empty } from "antd";
import { getUnixTime } from "date-fns";
import dayjs, { Dayjs } from 'dayjs';
import { useGetDriverPath } from "@/lib/hooks";

import "./DriverPath.css";

const { RangePicker } = DatePicker;

interface IFromTo {
    from: number;
    to: number;
}

const thirtyDays = (): IFromTo => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
        from: getUnixTime(thirtyDaysAgo),
        to: getUnixTime(now),
    };
};

interface DriverPathProps {
    driverId: string;
}

export default function DriverPath({ driverId }: DriverPathProps) {
    const [fromTo, setFromTo] = useState<IFromTo>(thirtyDays());

    const { data, loading, error } = useGetDriverPath({
        from: fromTo.from,
        to: fromTo.to,
        driverId,
    });

    if (loading) {
        return <div className="loading-txt">Chargement des trajets...</div>;
    }

    if (error) {
        return <p>Erreur lors du chargement des trajets</p>;
    }

    const paths = data?.paths ?? [];

    const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || !dates[0] || !dates[1]) return;

        setFromTo({
            from: getUnixTime(dates[0].toDate()),
            to: getUnixTime(dates[1].toDate()),
        });
    };

    return (
        <div className="driver-path-wrapper">
            <h3 className="mb-2">Trajets</h3>
            <h5>Afficher les trajets :</h5>

            <RangePicker
                defaultValue={[dayjs.unix(fromTo.from), dayjs.unix(fromTo.to)]}
                format="DD/MM/YYYY"
                onChange={handleCalendarChange}
                className="range-picker mb-4"
                size="large"
            />

            {paths.length === 0 ? (
                <Empty description="Aucun trajet trouvé pour cette période" />
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {paths.map((path: any) => (
                        <Card key={path.id} className="path-card">
                            <div>
                                <strong>Trajet #{path.id}</strong>
                            </div>
                            <div>Distance: {path.distance ? `${path.distance.toFixed(1)} km` : 'N/A'}</div>
                            <div>Durée: {path.duration ? `${Math.round(path.duration / 60)} min` : 'N/A'}</div>
                            {path.consumption && <div>Consommation: {path.consumption.toFixed(2)} L</div>}
                        </Card>
                    ))}
                </Space>
            )}
        </div>
    );
}
