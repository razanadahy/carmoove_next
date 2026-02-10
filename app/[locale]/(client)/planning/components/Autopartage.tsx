"use client"

import {Alert, Spin} from "antd";
import {useQuery} from "@apollo/client";
import {DRIVERS_QUERY} from "@/lib/graphql/queries";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {IDriver, IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import {useQuery as useQueryCS, useQuery as useQueryRest} from "@tanstack/react-query";
import {fetchCurrentUser} from "@/app/actions/auth";
import {fetchAllReservationsArchives, fetchReservations} from "@/app/actions/reservations";
import dayjs from "dayjs";
import {useSearchParams} from "next/navigation";
import {useGetVehicles, useVehiclesWithStatus} from "@/lib/hooks";
import PlanningComponent from "@/app/[locale]/(client)/planning/components/common/PlanningComponent";
import FilterComponent from "@/app/[locale]/(client)/planning/components/common/FilterComponent";
import {PlanningFC} from "@/components/Pl/PlanningFC";
import CurentReservation from "@/app/[locale]/(client)/planning/components/common/CurentReservation";
import FutureReservation from "@/app/[locale]/(client)/planning/components/common/FutureReservation";
import ClosedReservation from "@/app/[locale]/(client)/planning/components/common/ClosedReservation";

export default function Autopartage() {
    const qDrivers = useQuery(DRIVERS_QUERY);
    const [drivers, setDrivers] = useState<IDriver[]>([])
    useEffect(() => {
        if (qDrivers.data){
            setDrivers(qDrivers.data.drivers)
        }
    }, [qDrivers.data]);
    const qCurrentUser = useQueryRest({
        queryKey: ['user'],
        queryFn: () => fetchCurrentUser(),
    })
    const qReservations = useQueryCS({
        queryKey: ['reservations'],
        queryFn: () => fetchReservations({all: true, type: "BOOKING"}), //ok
    })

    const [allReservations, setAllReservations] = useState<IReservation[]>([]);
    useEffect(() => {
        if (qReservations.data) {
            setAllReservations(qReservations.data);
        }
    }, [qReservations.data]);

    const reservations = useMemo(() => {
        return allReservations.filter(r => r.bookingType === 'BOOKING');
    }, [allReservations]);

    const [currentReservations, setCurrentReservations] = useState<IReservation[]>([])
    const [plannedReservations, setPlannedReservations] = useState<IReservation[]>([])
    const [pastReservations, setPastReservations] = useState<IReservation[]>([])
    const [lastReservationByVehicule, setLastReservationByVehicule] = useState<IReservation[]>([])

    useEffect(() => {
        const filterReservations = () => {
            const now = dayjs().unix();
            const current = [];
            const planned = [];

            for (const r of reservations) {
                if (r.until === 0 || (r.from <= now && r.until > now)) {
                    current.push(r);
                } else if (r.from > now) {
                    planned.push(r);
                }
            }
            setCurrentReservations(current);
            setPlannedReservations(planned);
        };
        filterReservations();
        const interval = setInterval(filterReservations, 60000);

        return () => clearInterval(interval);
    }, [reservations]);

    const queryLastReservation = useQueryCS({
        queryKey: ['reservations_all_booking'],
        queryFn: () => fetchAllReservationsArchives({type: "BOOKING"}),
    })
    useEffect(() => {
        if (queryLastReservation.data) {
            setLastReservationByVehicule(queryLastReservation.data)
        }
    }, [queryLastReservation.data]);
    useEffect(() => {
        const filtered = lastReservationByVehicule
            .filter(r => r.bookingType === 'BOOKING')
            .filter((res, index, self) =>
                index === self.findIndex(r => r.id === res.id)
            )
        setPastReservations(filtered)
    }, [lastReservationByVehicule])
    const searchParams = useSearchParams();
    const sPanelSelected = useMemo(() => {
        return searchParams.get('type') ?? 'planning';
    }, [searchParams.get('type')]);

    const { vehicles: dataVehicles, loading, error } = useGetVehicles(30000);
    const [vehicles, setVehicles] = useState<IVehicle[]>([]);
    useEffect(() => {
        if (!dataVehicles) return
        const filtered = dataVehicles.filter(
            (v: IVehicle) => v.device?.carSharing
        )
        setVehicles(filtered)
    }, [dataVehicles])

    const { isLoading, vehiclesStatusWithLoading: vehiclesWithStatus } = useVehiclesWithStatus(vehicles);

    const tabs = useMemo(() => {
        const stringTaille = pastReservations.length === 0 ? '' : `(${pastReservations.length})`
        const stringTaillePlan = plannedReservations.length === 0 ? '' : `(${plannedReservations.length})`
        const stringTailleCurre = currentReservations.length === 0 ? '' : `(${currentReservations.length})`
        const tab = [
            {
                key: "planning",
                label: `Planning`,
                children: (<></>)
            },
            {
                key: "current",
                label: `En cours ${stringTailleCurre}`,
                children: (<></>)
            },
            {
                key: "planned",
                label: `À venir ${stringTaillePlan}`,
                children: (<></>)
            },
            {
                key: "archives",
                label: `Passées ${stringTaille}`,
                children: (<></>)
            }
        ]
        return tab
    }, [currentReservations, plannedReservations, pastReservations])
    const [respFilter, setRespFilter] = useState<IVehicle[]>([])
    const [driverSelected, setDriverSelected] = useState<IDriver[]>([])

    const setFilter = useCallback((filter: IVehicle[], driverSel: IDriver[])=>{
        setRespFilter(filter);
        setDriverSelected(driverSel);
    },[])
    const [filterReservation, setFilterReservation] = useState<IReservation[]>([])
    useEffect(() => {
        let filtered: IReservation[] = []
        if (sPanelSelected === 'current') {
            filtered = currentReservations.filter(reservation => {
                const vehicleMatch =
                    respFilter.length === 0 ||
                    respFilter.some(vehicle => vehicle.id === reservation.vehicleId)

                const driverMatch =
                    driverSelected.length === 0 ||
                    driverSelected.some(driver => driver.accountId === reservation.userId)

                return vehicleMatch && driverMatch
            })
        }else if (sPanelSelected === 'planned'){
            filtered = plannedReservations.filter(reservation => {
                const vehicleMatch =
                    respFilter.length === 0 ||
                    respFilter.some(vehicle => vehicle.id === reservation.vehicleId)

                const driverMatch =
                    driverSelected.length === 0 ||
                    driverSelected.some(driver => driver.accountId === reservation.userId)

                return vehicleMatch && driverMatch
            })
        }else if (sPanelSelected === 'archives'){
            filtered = pastReservations.filter(reservation => {
                const vehicleMatch =
                    respFilter.length === 0 ||
                    respFilter.some(vehicle => vehicle.id === reservation.vehicleId)

                const driverMatch =
                    driverSelected.length === 0 ||
                    driverSelected.some(driver => driver.accountId === reservation.userId)

                return vehicleMatch && driverMatch
            })
        }
        setFilterReservation(filtered)
    }, [pastReservations, sPanelSelected, respFilter, currentReservations, plannedReservations, driverSelected]);
    const allReservationsPlanning: IReservation[] = useMemo(()=>{
        const allrev = [...reservations, ...pastReservations]
        if (driverSelected.length===0){
            return allrev
        }else{
            return  allrev.filter(reservation => {
                return driverSelected.length === 0 ||
                    driverSelected.some(driver => driver.accountId === reservation.userId)
            })
        }
    },[reservations, pastReservations, driverSelected])

    const [loadingComponent, setLoadingComponent] = useState(true)
    useEffect(() => {
        if (loading || qDrivers.loading || qReservations.isLoading || queryLastReservation.isLoading){
            setLoadingComponent(true)
        }else{
            setLoadingComponent(false)
        }
    }, [loading, qDrivers.loading, qReservations.isLoading,queryLastReservation.isLoading]);

    return (
        <div style={{ padding: '24px' }}>
            <PlanningComponent text="Réservation en cours, à venir et passées" tabLink={tabs} loading={qReservations.isLoading || queryLastReservation.isLoading}/>
            <FilterComponent vehicules={vehiclesWithStatus} drivers={drivers} loadingDrivers={!(drivers.length>0)} setRespFilter={setFilter} loadingDisp={vehicles.length>0 ? isLoading : true}/>
            {loadingComponent ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" />
                </div> :
                sPanelSelected === 'planning' ? (<PlanningFC resultVehicles={respFilter} vehicles={vehiclesWithStatus}
                                                           allDrivers={drivers} selectedDriverTags={driverSelected}
                                                           reservations={allReservationsPlanning}/>) : sPanelSelected === 'current' ?
                    <div className="mt-4">
                        <CurentReservation reservations={filterReservation} allReservation={reservations} freeFloating={false} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} vehicles={vehicles} />
                    </div> :
                    sPanelSelected === 'planned' ?
                        <div className="mt-4">
                            <FutureReservation reservations={filterReservation} allReservation={reservations} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} vehicles={vehicles} />
                        </div>:
                        <div className="mt-4">
                            <ClosedReservation reservations={filterReservation} freeFloating={false} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} vehicles={vehicles} />
                        </div>
            }
        </div>
    );
}
