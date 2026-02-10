"use client"

import {useQuery as useQueryCS, useQuery as useQueryRest} from "@tanstack/react-query";
import {useGetVehicles, useVehiclesWithStatus} from "@/lib/hooks";
import {useCallback, useEffect, useMemo, useState} from "react";
import {IDriver, IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import {useSearchParams} from "next/navigation";

import {useQuery} from "@apollo/client";
import {DRIVERS_QUERY} from "@/lib/graphql/queries";
import {fetchCurrentUser} from "@/app/actions/auth";
import {fetchAllReservationsArchives, fetchReservations} from "@/app/actions/reservations";
import dayjs from "dayjs";
import PlanningComponent from "@/app/[locale]/(client)/planning/components/common/PlanningComponent";
import FilterComponent from "@/app/[locale]/(client)/planning/components/common/FilterComponent";
import {Loading} from "@/components/Common/Loading";
import CurentReservation from "@/app/[locale]/(client)/planning/components/common/CurentReservation";
import ClosedReservation from "@/app/[locale]/(client)/planning/components/common/ClosedReservation";
import PlanningFC from "@/components/Pl/PlanningFC";

export default function Freefloating() {
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
        queryKey: ['reservations_freefloating'],
        queryFn: () => fetchReservations({all: true, type: "FREE_FLOATING"}),
    })
    const [allReservations, setAllReservations] = useState<IReservation[]>([]);
    useEffect(() => {
        if (qReservations.data) {
            setAllReservations(qReservations.data);
        }
    }, [qReservations.data]);

    const reservations = useMemo(() => {
        return allReservations.filter(r => r.bookingType === 'FREE_FLOATING');
    }, [allReservations]);

    const [currentReservations, setCurrentReservations] = useState<IReservation[]>([])
    const [pastReservations, setPastReservations] = useState<IReservation[]>([])
    const [lastReservationByVehicule, setLastReservationByVehicule] = useState<IReservation[]>([])
    useEffect(() => {
        const filterReservations = () => {
            const now = dayjs().unix();
            const current = [];

            for (const r of reservations) {
                if (r.until === 0 || (r.from <= now && r.until > now)) {
                    current.push(r);
                }
            }
            setCurrentReservations(current);
        };
        filterReservations();
        const interval = setInterval(filterReservations, 60000);

        return () => clearInterval(interval);
    }, [reservations]);

    const queryLastReservation = useQueryCS({
        queryKey: ['reservations_all_freefloating'],
        queryFn: () => fetchAllReservationsArchives({type: "FREE_FLOATING"}),
    })
    useEffect(() => {
        if (queryLastReservation.data) {
            setLastReservationByVehicule(queryLastReservation.data)
        }
    }, [queryLastReservation.data]);
    useEffect(() => {
        const filtered = lastReservationByVehicule
            .filter(r => r.bookingType === 'FREE_FLOATING')
            .filter((res, index, self) =>
                index === self.findIndex(r => r.id === res.id)
            )
        setPastReservations(filtered)
    }, [lastReservationByVehicule])

    const searchParams = useSearchParams();
    const sPanelSelected = useMemo(() => {
        return searchParams.get('type') ?? 'planning';
    }, [searchParams.get('type')]);

    const [vehicles, setVehicles] = useState<IVehicle[]>([]);

    const { vehicles: dataVehicles, loading, error } = useGetVehicles(30000);

    useEffect(() => {
        if (!dataVehicles) return

        const filtered = dataVehicles.filter(
            (v: IVehicle) => v.device?.carSharing
        )

        setVehicles(filtered)
    }, [dataVehicles])

    const { vehiclesStatusWithLoading: vehiclesWithStatus, isLoading } = useVehiclesWithStatus(vehicles);


    const tabs = useMemo(() => {
        const stringTaille = pastReservations.length === 0 ? '' : `(${pastReservations.length})`
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
                key: "archives",
                label: `Passées ${stringTaille}`,
                children: (<></>)
            }
        ]
        return tab
    }, [currentReservations, pastReservations])

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
    }, [pastReservations, sPanelSelected, respFilter, currentReservations, driverSelected]);

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
        <>
            <PlanningComponent text="Réservation en cours et passées" tabLink={tabs} loading={qReservations.isLoading}/>
            <FilterComponent vehicules={vehiclesWithStatus} drivers={drivers} loadingDrivers={!(drivers.length>0)} setRespFilter={setFilter} loadingDisp={vehicles.length>0 ? isLoading : true}/>
            {loadingComponent ? <Loading msg={"Chargement du composant"}/> :
                sPanelSelected === 'planning' ? (<PlanningFC resultVehicles={respFilter} vehicles={vehiclesWithStatus}
                                                           allDrivers={drivers} selectedDriverTags={driverSelected}
                                                           reservations={allReservationsPlanning} isFreeFloating={true}/>) : sPanelSelected === 'current' ?
                    <div className="mt-4">
                        <CurentReservation reservations={filterReservation} allReservation={reservations} freeFloating={true} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} vehicles={vehicles} />
                    </div> :

                    <div className="mt-4">
                        <ClosedReservation reservations={filterReservation} freeFloating={true} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} vehicles={vehicles} />
                    </div>
            }
        </>
    )
}
