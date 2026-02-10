'use client'

import {IAuthorization, IDriver, IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import {App, Button, ConfigProvider, Drawer, Form, Input, Modal, Tabs, DatePicker} from "antd";
import {useCallback, useEffect, useMemo, useState} from "react";
import { useQuery as ApolloQuery } from '@apollo/client';
import dayjs, {Dayjs} from "dayjs";
import AuthorizationDetail from "@/app/[locale]/(client)/vehicle/[id]/components/Authorization/AuthorizationDetail";
import VehicleInformationBox from "../VehicleInformationBox";
import {Loading} from "@/components/Common/Loading";
import CarmooveButton from "@/components/Common/CarmooveButton";
import SelectDriver from "@/app/[locale]/(client)/vehicle/[id]/components/Authorization/SelectDriver";
import CurentReservation from "@/app/[locale]/(client)/planning/components/common/CurentReservation";
import ClosedReservation from "@/app/[locale]/(client)/planning/components/common/ClosedReservation";
import FutureReservation from "@/app/[locale]/(client)/planning/components/common/FutureReservation";
import {
    addReservation,
    fetchCurrentUser,
    fetchVehicleReservations,
    fetchVehicleReservationsArchives
} from "@/app/actions/auth";
import {useMutation, useQuery as useQueryRest, useQuery, useQueryClient} from "@tanstack/react-query";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import {DRIVERS_QUERY} from "@/lib/graphql/queries";
import './reservation.css'

interface IFormAddReservation {
    dateRange: [dayjs.Dayjs, dayjs.Dayjs] | undefined
    // driverName: string
}
interface DisabledTime {
    disabledHours?: () => number[];
    disabledMinutes?: (selectedHour: number) => number[];
}

function Reservation(props: { vehicle: IVehicle, freeFloating?: boolean }) {
    const { notification } = App.useApp();
    const [isInvalidDate, setIsInvalidDate] = useState<boolean>(false)
    const [modalAddOpen, setModalAddOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [authorization, setAuthorization] = useState<IAuthorization | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<IDriver | null>(null);


    const queryClient = useQueryClient()

    const history = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();



    const [sPanelSelected, setSPanelSelected] = useState('current')
    const [panelSelected, setPanelSelected] = useState('resume')
    useEffect(() => {
        if (searchParams){
            setSPanelSelected(searchParams.get('type') ?? 'current')
            setPanelSelected(searchParams.get('panel') ?? 'resume')
        }
    }, [searchParams]);

    const [form] = Form.useForm()

    const qReservations = useQueryCS({
        queryKey: ['reservations'],
        queryFn: () => fetchVehicleReservations({ vehicleId: props.vehicle.id }),
        // refetchInterval: 50000
    })

    const queryLastReservation = useQueryCS({
        queryKey: ['reservations_all', props.vehicle.id],
        queryFn: () => fetchVehicleReservationsArchives({ vehicleId: props.vehicle.id, type: props.freeFloating? "FREE_FLOATING" : "BOOKING"  }),
    })

    const [lastReservationByVehicule, setLastReservationByVehicule] = useState<IReservation[]>([])

    useEffect(() => {
        if (queryLastReservation.data){
            setLastReservationByVehicule(queryLastReservation.data)
        }
    }, [queryLastReservation.data]);

    const handleTabChange = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', key);
        history.push(`${pathname}?${params.toString()}`);
    };

    const mAdd = useMutation({
        mutationFn: addReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['reservations'],
            })
            queryClient.invalidateQueries({
                queryKey: ['reservations_all', props.vehicle.id],
            });

            notification['success']({
                message: 'Réservation ajoutée avec succès'
            })
            setSelectedDriver(null);
        },
        onError: (e) => {
            const no_account = (e as any)?.response?.data?.error === 'DRIVER_WITHOUT_ACCOUNT'
            notification['error']({
                message: no_account ? 'Le conducteur sélectionné n\'a pas de compte utilisateur!' : 'Echec lors de l\'ajout de la réservaion, veuillez réessayer.'
            })
        },
        onMutate: () => {
            setSaving(true)
        },
        onSettled: () => {
            setSaving(false)
            setModalAddOpen(false)
        }
    })

    useEffect(() => {
        if (selectedDriver && panelSelected === 'reservation') {
            setModalAddOpen(true);
        }
    }, [selectedDriver]);

    const [allReservations, setAllReservations] = useState<IReservation[]>([]);
    const [reservations, setReservations] = useState<IReservation[]>([]);
    useEffect(() => {
        if(qReservations.data) {
            setAllReservations(qReservations.data);
        }
    }, [qReservations.data]);

    useEffect(() => {
        setReservations(allReservations.filter(r => r.bookingType === (props.freeFloating ? 'FREE_FLOATING' : 'BOOKING')));
    }, [allReservations]);
    const [pastReservations, setPastReservations] = useState<IReservation[]>([])
    useEffect(() => {
        setPastReservations(lastReservationByVehicule.filter(r => r.bookingType === (props.freeFloating ? 'FREE_FLOATING' : 'BOOKING')));
    }, [lastReservationByVehicule]);


    const [currentReservations, setCurrentReservations] = useState<IReservation[]>([])
    const [plannedReservations, setPlannedReservations] = useState<IReservation[]>([])

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


    const reservation: IFormAddReservation = {
        dateRange: undefined,
        // driverName: `${user.firstname} ${user.lastname}`
    }

    const qDrivers = ApolloQuery(DRIVERS_QUERY);

    const qCurrentUser = useQueryRest({
        queryKey: ['user'],
        queryFn: () => fetchCurrentUser(),
    })
    const tabs = useMemo(()=>{
        const stringTaille = pastReservations.length === 0 ? '' : `(${pastReservations.length})`
        const stringTaillePlan = plannedReservations.length === 0 ? '' : `(${plannedReservations.length})`
        const stringTailleCurre = currentReservations.length === 0 ? '' : `(${currentReservations.length})`
        const tab = []
        if (!props.freeFloating){
            tab.push({
                key: "current",
                label: `En cours ${stringTailleCurre}`,
                children: <CurentReservation reservations={currentReservations} allReservation={reservations} freeFloating={props.freeFloating} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading}  />
            })
            tab.push({
                key: "planned",
                label: `À venir ${stringTaillePlan}`,
                children: <FutureReservation reservations={plannedReservations} allReservation={reservations} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} />
            })
            tab.push({
                key: "archives",
                label: `Passées ${stringTaille}`,
                children: <ClosedReservation reservations={pastReservations} freeFloating={props.freeFloating} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading} />
            })
        }else{
            tab.push({
                key: "current",
                label: `En cours ${stringTailleCurre}`,
                children: <CurentReservation reservations={currentReservations} freeFloating={props.freeFloating} allReservation={reservations} allDrivers={qDrivers.data?.drivers??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading}/>
            })
            tab.push({
                key: "archivesfloating",
                label: `Passées ${stringTaille}`,
                children: <ClosedReservation reservations={pastReservations} freeFloating={props.freeFloating} allDrivers={qDrivers.data?.drivers ??[]} currentUser={qCurrentUser.data!} loading={qDrivers.loading}/>
            })
        }
        return tab
    },[currentReservations, plannedReservations, props.freeFloating, pastReservations, reservations, qCurrentUser, qDrivers.data, qDrivers.loading])

    const onAdd = (value: IFormAddReservation) => {
        let from_ = 0
        let until_ = 0
        if (!value.dateRange) {
            return 0
        } else {
            from_ = value.dateRange[0].valueOf() / 1000
            until_ = value.dateRange[1].valueOf() / 1000
        }
        mAdd.mutate({
            idVehicle: props.vehicle.id,
            type: 'BOOKING',
            from: from_,
            until: until_,
            driver: selectedDriver?.driverID
        })
    }

    const getDisabledDate = useCallback((currentDate: Dayjs | null, info?: { type?: string }): boolean => {
        if (!currentDate) {
            return false;
        }

        const now = dayjs();
        const type = info?.type || 'start';

        if (currentDate.isBefore(now, 'day')) {
            return true;
        }

        const disabledTime = getDisabledTime(currentDate, type as 'start' | 'end');
        if (!disabledTime.disabledHours){
            return false
        }
        const disabledHours = disabledTime.disabledHours() ;

        if (disabledHours.length === 24) {
            return true;
        }

        if (type === 'end') {
            for (const reservation of reservations) {
                const endDate: Dayjs = dayjs(reservation.until * 1000);

                if (currentDate.isBefore(endDate, 'day')) {
                    return true;
                }
            }
        }

        if (type === 'start') {
            for (const reservation of reservations) {
                const startDate: Dayjs = dayjs(reservation.from * 1000);
                const endDate: Dayjs = dayjs(reservation.until * 1000);

                if (currentDate.isAfter(startDate, 'day') && currentDate.isBefore(endDate, 'day')) {
                    return true;
                }
            }
        }

        return false;
    },[reservations]);
    const getDisabledTime = useCallback((currentDate: Dayjs | null, type: 'start' | 'end' = 'start'): DisabledTime => {
        if (!currentDate) {
            return {
                disabledHours: () => [],
                disabledMinutes: () => []
            };
        }

        const reservationsToday = reservations.filter((reservation) => {
            const startDate: Dayjs = dayjs(reservation.from * 1000);
            const endDate: Dayjs = dayjs(reservation.until * 1000);

            return (
                currentDate.isSame(startDate, 'day') ||
                currentDate.isSame(endDate, 'day') ||
                (currentDate.isAfter(startDate, 'day') && currentDate.isBefore(endDate, 'day'))
            );
        });

        const now = dayjs();

        if (reservationsToday.length === 0) {
            if (currentDate.isSame(now, 'day')) {
                const currentHour = now.hour();
                return {
                    disabledHours: () => Array.from(Array(currentHour).keys()),
                    disabledMinutes: (selectedHour: number) => {
                        if (selectedHour === currentHour) {
                            const currentMinute = now.minute();
                            return Array.from(Array(currentMinute).keys());
                        }
                        return [];
                    }
                };
            }
            return {
                disabledHours: () => [],
                disabledMinutes: () => []
            };
        }

        const getDisabledMinutesForHour = (hour: number): number[] => {
            const disabledMinutes: Set<number> = new Set();

            if (currentDate.isSame(now, 'day') && hour === now.hour()) {
                const currentMinute = now.minute();
                for (let m = 0; m < currentMinute; m++) {
                    disabledMinutes.add(m);
                }
            }

            reservationsToday.forEach((reservation) => {
                const startDate: Dayjs = dayjs(reservation.from * 1000);
                const endDate: Dayjs = dayjs(reservation.until * 1000);
                const startHour: number = dayjs(reservation.from * 1000).hour();
                const startMinute: number = dayjs(reservation.from * 1000).minute();
                const endHour: number = dayjs(reservation.until * 1000).hour();
                const endMinute: number = dayjs(reservation.until * 1000).minute();

                const isStartDay = currentDate.isSame(startDate, 'day');
                const isEndDay = currentDate.isSame(endDate, 'day');
                const isBetweenDays = currentDate.isAfter(startDate, 'day') && currentDate.isBefore(endDate, 'day');

                if (type === 'start') {
                    if (isBetweenDays) {
                        for (let minute = 0; minute < 60; minute++) {
                            disabledMinutes.add(minute);
                        }
                    }
                    else if (isStartDay && !isEndDay) {
                        if (hour === startHour) {
                            for (let minute = startMinute; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour > startHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    }
                    else if (isEndDay && !isStartDay) {
                        if (hour < endHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === endHour) {
                            for (let minute = 0; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    }
                    else if (isStartDay && isEndDay) {
                        if (hour === startHour && hour === endHour) {
                            for (let minute = startMinute; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === startHour) {
                            for (let minute = startMinute; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour > startHour && hour < endHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === endHour) {
                            for (let minute = 0; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    }
                } else {
                    if (isBetweenDays) {
                        for (let minute = 0; minute < 60; minute++) {
                            disabledMinutes.add(minute);
                        }
                    } else if (isStartDay && !isEndDay) {
                        if (hour === startHour) {
                            for (let minute = startMinute; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour > startHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    } else if (isEndDay && !isStartDay) {
                        if (hour < endHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === endHour) {
                            for (let minute = 0; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    } else if (isStartDay && isEndDay) {
                        if (hour === startHour && hour === endHour) {
                            for (let minute = startMinute; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === startHour) {
                            for (let minute = startMinute; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour > startHour && hour < endHour) {
                            for (let minute = 0; minute < 60; minute++) {
                                disabledMinutes.add(minute);
                            }
                        } else if (hour === endHour) {
                            for (let minute = 0; minute <= endMinute; minute++) {
                                disabledMinutes.add(minute);
                            }
                        }
                    }
                }
            });

            return Array.from(disabledMinutes).sort((a, b) => a - b);
        };

        return {
            disabledHours: (): number[] => {
                const disabledHours: Set<number> = new Set();

                if (currentDate.isSame(now, 'day')) {
                    const currentHour = now.hour();
                    for (let hour = 0; hour < currentHour; hour++) {
                        disabledHours.add(hour);
                    }
                }

                for (let hour = 0; hour < 24; hour++) {
                    const disabledMinutesForThisHour = getDisabledMinutesForHour(hour);

                    if (disabledMinutesForThisHour.length === 60) {
                        disabledHours.add(hour);
                    }
                }

                return Array.from(disabledHours).sort((a, b) => a - b);
            },

            disabledMinutes: (selectedHour: number): number[] => {
                return getDisabledMinutesForHour(selectedHour);
            }
        };
    }, [reservations]);

    const handleRangeChange = (dates: (dayjs.Dayjs | null)[] | null) => {
        if (!dates) return
        const allDateStartReservation: dayjs.Dayjs[] = reservations.map(r => dayjs(r.from * 1000))
        const allDateEndReservation: dayjs.Dayjs[] = reservations.map(r => dayjs(r.until * 1000))
        const [start, end] = dates;
        ([...allDateStartReservation, ...allDateEndReservation]).forEach(date => {
            if (start?.isBefore(date) && end?.isAfter(date)) {
                setIsInvalidDate(true)
            } else {
                setIsInvalidDate(false)
            }
        })
    }

    useEffect(() => {
        if (modalAddOpen) {
            form.resetFields();
            form.setFieldsValue(reservation);
        }
    }, [modalAddOpen]);
    const [drawerOpen, setDrawerOpen] = useState(false);


    useEffect(() => {
        if (selectedDriver){
            setModalAddOpen(true);
        }
    }, [selectedDriver]);
    return (
        <>
            <VehicleInformationBox vehicle={props.vehicle} />
            {authorization ?
                <AuthorizationDetail
                    autorisation={authorization}
                    setAuthorizationView={setAuthorization}
                /> : qReservations.isLoading || qCurrentUser.isLoading ? <Loading msg="Chargement des réservations"/> : qReservations.error || qCurrentUser.error ? (<>Error fetching :(</>) :
                    <>
                        <h2 className="title-reservation mt-4">Réservation du véhicule & historique</h2>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Tabs: {
                                        itemSelectedColor: '#01426A',
                                        inkBarColor: '#01426A',
                                    },
                                },
                                token: {
                                    colorBorderSecondary: '#f0f0f0',
                                }
                            }}
                        >
                            <Tabs
                                className="tabs-reservation"
                                tabPosition="top"
                                style={{}}
                                items={tabs}
                                activeKey={sPanelSelected}
                                // defaultActiveKey={"current"}
                                // onChange={(key) => { history.push(`/vehicle/${props.vehicle.id}?panel=${props.freeFloating ? 'floating' : 'reservation'}&type=${key}`) }}
                                onChange={(key) => {handleTabChange(key)}}
                            />
                        </ConfigProvider>
                        {!props.freeFloating && <>
                            <div className={`add-reservation-button add-authorization-button`}>
                                <CarmooveButton
                                    htmlType="button"
                                    size={"middle"}
                                    // onClick={() => setModalAddOpen(true)}
                                    onClick={() => {setDrawerOpen(true); setSelectedDriver(null)}}
                                >
                                    AJOUTER UNE RÉSERVATION
                                </CarmooveButton>
                            </div>

                            <Modal
                                title="Ajout d’une réservation"
                                className="icon-modal-box"
                                centered
                                open={modalAddOpen}
                                onOk={() => { }}
                                onCancel={() => { setModalAddOpen(false); setSelectedDriver(null); }}
                                footer={[
                                    <Button
                                        className="custom-button"
                                        key="submit" type="primary"
                                        onClick={() => form.submit()}
                                        disabled={isInvalidDate}
                                    >
                                        Valider
                                        {saving && <Spin indicator={<LoadingOutlined spin />} />}
                                    </Button>,
                                ]}
                            >
                                <Form
                                    className='reservation-form'
                                    layout="vertical"
                                    form={form}
                                    onFinish={onAdd}
                                    initialValues={reservation}
                                >
                                    <Input
                                        className="input-driver-reservation"
                                        value={selectedDriver?.firstName + " " + selectedDriver?.lastName}
                                        disabled={true}
                                    />
                                    <Form.Item
                                        className="input-driver-reservation-form"
                                        layout="vertical"
                                        name='dateRange'
                                        label="Période"
                                        rules={[{ required: true }]}
                                    >
                                        <DatePicker.RangePicker
                                            showTime={{ format: 'HH:mm' }}
                                            format="DD/MM/YYYY HH:mm"
                                            // minDate={dayjs()}
                                            disabledDate={getDisabledDate}
                                            disabledTime={getDisabledTime}
                                            onCalendarChange={handleRangeChange}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>
                            <Drawer
                                title="Sélectionner un conducteur"
                                placement="right"
                                onClose={() => setDrawerOpen(false)}
                                open={drawerOpen}
                                width={400}
                            >
                                <SelectDriver
                                    onSelect={(driver) => setSelectedDriver(driver)}
                                />
                            </Drawer>
                        </>}
                    </>
            }
        </>
    )
}

export default Reservation;