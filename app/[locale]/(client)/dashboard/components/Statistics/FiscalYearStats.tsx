"use client"

import { IUser, IVehicle } from "@/lib/hooks/Interfaces";
import { endOfToday, getUnixTime, getYear } from "date-fns";
import StatsVehicle from "./StatsVehicle";

interface FiscalYearStatsProps {
    vehicle: IVehicle;
    user: IUser;
}

export default function FiscalYearStats({ vehicle, user }: FiscalYearStatsProps) {
    const month = user.company ? user.company.fiscal_year.month - 1 : 0;
    const from = getUnixTime(new Date(getYear(new Date()), month, 1));
    const to = getUnixTime(endOfToday());

    return <StatsVehicle from={from} to={to} vehicle={vehicle} />;
}
