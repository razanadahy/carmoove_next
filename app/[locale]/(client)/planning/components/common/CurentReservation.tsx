'use client'
import {Pagination} from "antd";
import {useCallback, useMemo, useState} from "react";
import {IReservation} from "@/app/actions/reservationServices";
import {IDriver, IReservationCustom, IVehicle, PAGE_SIZE_DEFAULT} from "@/lib/hooks/Interfaces";
import dayjs from "dayjs";
import {Loading} from "@/components/Common/Loading";
import {IUserCS} from "@/app/actions/auth";
import ReservationRow from "@/components/Common/ReservationRow";


const CurentReservation =  ({ reservations, freeFloating, allReservation, allDrivers, loading, currentUser, vehicles }: { reservations: IReservation[], freeFloating?: boolean, allReservation: IReservation[],
    allDrivers: IDriver[], loading: boolean, currentUser: IUserCS, vehicles?: IVehicle[] }) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const sorted = useMemo(() => {
        return [...reservations].sort((a, b) => {
            return b.from - a.from
        });
    }, [reservations]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page, pageSize]);


    const cstRv = useCallback((res: IReservation): IReservationCustom=>{
        const driver = allDrivers.find((d: IDriver) => d.accountId === res.userId)
        return {
            ...res,
            dateRange: [dayjs(res.from * 1000), dayjs(res.until * 1000)],
            dateUntil: dayjs(res.until * 1000),
            driverName: !!driver ? `${driver.firstName} ${driver.lastName}` : currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : ''
        }
    },[allDrivers, currentUser])

    const getVehicleReservationsByVehicle = useCallback((idVehicle: string) : IVehicle | null  =>  {
        if (vehicles){
            const veh = vehicles.find((prev)=>prev.id === idVehicle);
            if (veh){
                return  veh
            }
            return null;
        }
        return null
    },[vehicles])

    return (
        <>
            {loading ? (<Loading msg={"chargment des chauffeurs"}/>): <>
                <div className="reservation-main-box" >
                    {
                        paginated.length ?
                            paginated.map(reservation => (
                                <ReservationRow
                                    key={reservation.id}
                                    reservation={reservation}
                                    editable
                                    deletable
                                    freeFloating={freeFloating}
                                    timeLine={0}
                                    allReservation={allReservation}
                                    cstRs={cstRv(reservation)}
                                    vehicle={getVehicleReservationsByVehicle(reservation.vehicleId)}
                                />
                            ))
                            :
                            <span className="no-reservation-content">Aucune réservation disponible</span>
                    }
                    {reservations.length>0 && (
                        <Pagination
                            total={sorted.length}
                            current={page}
                            pageSize={pageSize}
                            showTotal={(total) => `Total ${total} résultats`}
                            onChange={(p, size) => {
                                setPage(p);
                                setPageSize(size);
                            }}
                            className="fs-6"
                            showSizeChanger
                            hideOnSinglePage={reservations.length<10}
                        />
                    )}
                </div>
            </>}
        </>
    )
}

export default CurentReservation
