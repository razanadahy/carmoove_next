'use client'


import {IReservation, IReservationCustom, IVehicle} from "@/lib/hooks/Interfaces";
import {App, Button, DatePicker, Form, Input, Modal, Spin} from "antd";
import {useQueryClient} from "@tanstack/react-query";
import dayjs, {Dayjs} from "dayjs";
import {useCallback, useState} from "react";
import {useMutation}  from "@tanstack/react-query";
import {deleteReservation, editReservation} from "@/app/actions/reservations";

import delete_i from "@/assets/image/Common/Delete.svg";
import edit_i from "@/assets/image/Common/Shape.svg";
import mask from "@/assets/image/Common/Mask.svg";

import { useMediaQuery } from 'react-responsive';
import {energyTrueFormat} from "@/services/VehiculesService";
import Immat from "@/components/Common/Immat";
import Image from "next/image";

import './reservation.css'

interface DisabledTime {
    disabledHours?: () => number[];
    disabledMinutes?: (selectedHour: number) => number[];
}
interface IPropsReservationRow {
    reservation: IReservation
    deletable?: boolean
    editable?: boolean
    freeFloating?: boolean
    timeLine: number
    allReservation?: IReservation[]
    cstRs: IReservationCustom
    vehicle?: IVehicle | null
}
const ReservationRow = ({ reservation: reservation_, deletable, editable, freeFloating, timeLine, allReservation, cstRs, vehicle }: IPropsReservationRow) => {
    const { notification } = App.useApp();
    const queryClient = useQueryClient()

    function formatRange(fromDate: number | null, untilDate: number | null | undefined, timeline: number) {
        const format = (ts: number | null |undefined) =>
            ts ? dayjs.unix(ts).format("DD/MM/YYYY à HH:mm") : "";

        if (untilDate===null || untilDate===0) {
            return `Le ${format(fromDate)}`
        }

        const fromStr = format(fromDate);
        const untilStr = format(untilDate);

        if (timeline === 0) {
            return `Depuis le ${fromStr} au ${untilStr}`;
        }

        return `Du ${fromStr} au ${untilStr}`;
    }

    const [modalEditOpen, setModalEditOpen] = useState<boolean>(false)
    const [modalConfirmDeleteOpen, setModalConfirmDeleteOpen] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [form] = Form.useForm()


    const mEdit = useMutation({
        mutationFn: editReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['reservations'],
            })
            queryClient.invalidateQueries({
                queryKey: ['reservations_all', reservation_.vehicleId],
            });
            queryClient.invalidateQueries({
                queryKey: ['reservations_all_booking'],
            });
            queryClient.invalidateQueries({
                queryKey: ['reservations_all_freefloating'],
            });
            notification['success']({
                message: 'Réservation modifiée avec succès'
            })
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de la modification de la réservation, veuillez réessayer.'
            })
        },
        onMutate: () => {
            setSaving(true)
        },
        onSettled: () => {
            setSaving(false)
            setModalEditOpen(false)
        }
    })

    const mDelete = useMutation({
        mutationFn: deleteReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['reservations'],
            })
            queryClient.invalidateQueries({
                queryKey: ['reservations_all', reservation_.vehicleId],
            });
            notification['success']({
                message: 'Réservation supprimée avec succès'
            })
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de la suppression de la réservation, veuillez réessayer.'
            })
        },
        onMutate: () => {
            setSaving(true)
        },
        onSettled: () => {
            setSaving(false)
            setModalEditOpen(false)
        }
    })

    const mArchive = useMutation({
        mutationFn: deleteReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['reservations'],
            })
            queryClient.invalidateQueries({
                queryKey: ['reservations_all', reservation_.vehicleId],
            });
            notification['success']({
                message: 'Réservation archivée avec succès'
            })
        },
        onError: () => {
            notification['error']({
                message: 'Echec lors de l\'archivage de la réservation, veuillez réessayer.'
            })
        },
        onMutate: () => {
            setSaving(true)
        },
        onSettled: () => {
            setSaving(false)
            setModalEditOpen(false)
        }
    })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 600px)' });


    const onEdit = (value: IReservationCustom) => {
        let from_ = cstRs.from
        let until_ = cstRs.until
        if (dayjs().isAfter(dayjs.unix(cstRs.from))) {
            until_ = dayjs().isAfter(dayjs.unix(cstRs.from)) ? value.dateUntil.valueOf() / 1000 : until_
        } else {
            from_ = value.dateRange[0].valueOf() / 1000
            until_ = value.dateRange[1].valueOf() / 1000
        }
        mEdit.mutate({
            id: cstRs.id,
            from: from_,
            until: until_,
        })
    }

    const onDelete = () => {
        setModalConfirmDeleteOpen(true)
    }

    const onConfirmDelete = () => {
        if (freeFloating) {
            mArchive.mutate({ id: cstRs.id })
        } else {
            if (dayjs().isBefore(dayjs.unix(cstRs.from))) {
                mDelete.mutate({ id: cstRs.id })
            } else {
                mArchive.mutate({ id: cstRs.id })
            }
        }
    }

    const getDisabledDate = useCallback((currentDate: Dayjs | null, info?: { type?: string }): boolean => {
        if (!currentDate || !allReservation) {
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
            for (const reservation of allReservation) {
                if (reservation.id!==reservation_.id){
                    const endDate: Dayjs = dayjs(reservation.until * 1000);

                    if (currentDate.isBefore(endDate, 'day')) {
                        return true;
                    }
                }
            }
        }

        if (type === 'start') {
            for (const reservation of allReservation) {
                if(reservation.id!==reservation_.id){
                    const startDate: Dayjs = dayjs(reservation.from * 1000);
                    const endDate: Dayjs = dayjs(reservation.until * 1000);

                    if (currentDate.isAfter(startDate, 'day') && currentDate.isBefore(endDate, 'day')) {
                        return true;
                    }
                }
            }
        }

        return false;
    },[allReservation, reservation_]);
    const getDisabledTime = useCallback((currentDate: Dayjs | null, type: 'start' | 'end' = 'start'): DisabledTime => {
        if (!currentDate || !allReservation) {
            return {
                disabledHours: () => [],
                disabledMinutes: () => []
            };
        }

        const reservationsToday = allReservation.filter((reservation) => {
            const startDate: Dayjs = dayjs(reservation.from * 1000);
            const endDate: Dayjs = dayjs(reservation.until * 1000);

            return (
                (currentDate.isSame(startDate, 'day') ||
                    currentDate.isSame(endDate, 'day') ||
                    (currentDate.isAfter(startDate, 'day') && currentDate.isBefore(endDate, 'day'))) && reservation.id!==reservation_.id
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
    }, [allReservation, reservation_]);
    return (
        <>
            <div className={isTabletOrMobile ? 'd-flex flex-column reservation-font mb-2' : 'd-flex gap-2 flex-row align-items-end reservation-font mb-1 pb-1'}>
                <div className={`d-inline-flex flex-wrap ${isTabletOrMobile ? "mb-1": "mb-0"}`}>
                    {deletable && <div className='btn-action-row-reservation me-1'><Image src={delete_i} onClick={() => onDelete()} style={{ cursor: 'pointer', width: '15px' }}  alt={"del"}/></div>}
                    {editable && !freeFloating && <div className='btn-action-row-reservation me-1'><Image src={edit_i} onClick={() => setModalEditOpen(true)} style={{ cursor: 'pointer', width: '21px' }}  alt={"ed"}/></div>}
                    {timeLine<0 && <div className='btn-action-row-reservation me-1'><Image src={mask} style={{ cursor: 'pointer', width: '18px', color: '#13335e' }}  alt={"mask"}/></div>}
                    { vehicle!==null && vehicle!==undefined && (
                        <div className="d-inline-flex align-items-center mb-1">
                           <span className="vehicle-mini-info d-inline-flex align-items-center">
                               <span className="reservation-driver-name">
                                   {vehicle.information.make} - {vehicle.information.model}
                               </span>
                               <span className="energy-info">&nbsp;- {energyTrueFormat(vehicle.information.energy)}</span>
                           </span>
                            <div className="">
                                <Immat registration={vehicle.information.registration} size="small" />
                            </div>
                        </div>
                    )}
                    <span className={`reservation-driver-name ${isTabletOrMobile ? 'w-max' : 'w-300px'}`}>{`${cstRs.driverName}`}</span>
                </div>

                {
                    !freeFloating ? (<span className="font-size-14">{formatRange(cstRs.from, cstRs.until, timeLine)}</span>)
                        : (<span className="font-size-14">{formatRange(cstRs.from, cstRs.stopDate, timeLine)}</span>)
                }
            </div>
            <Modal
                title={dayjs().isAfter(dayjs.unix(cstRs.from)) ? `Modification fin d'une réservation` : `Modification d’une réservation`}
                className="icon-modal-box modal-reservation-form"
                centered
                open={modalEditOpen}
                onOk={() => { }}
                onCancel={() => { setModalEditOpen(false) }}
                footer={[
                    <Button
                        className="custom-button"
                        key="submit" type="primary"
                        onClick={() => form.submit()}
                        loading={saving}
                    >
                        Valider
                    </Button>,
                ]}
            >
                <Form
                    className='reservation-form'
                    layout="vertical"
                    form={form}
                    onFinish={onEdit}
                    initialValues={cstRs}
                >
                    <Form.Item
                        className="input-driver-reservation-form input-date-reservations"
                        label="Conducteur"
                        name='driverName'
                        rules={[{ required: true }]}
                    >
                        <Input
                            className="input-driver-reservation"
                            // value={reservation.driverName}
                            disabled={true}
                        />
                    </Form.Item>
                    <Form.Item
                        className='input-date-reservation'
                        rules={[{ required: true }]}
                        name='dateRange'
                    >
                        {dayjs().isAfter(dayjs.unix(cstRs.from)) ?
                            <Form.Item
                                className='input-date-reservation'
                                rules={[{ required: true }]}
                                name='dateUntil'
                            >
                                <DatePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="DD/MM/YYYY HH:mm"
                                    minDate={dayjs()}
                                    disabledDate={getDisabledDate}
                                    disabledTime={getDisabledTime}
                                />
                            </Form.Item>
                            :
                            <Form.Item
                                className='input-date-reservation'
                                rules={[{ required: true }]}
                                name='dateRange'
                            >
                                <DatePicker.RangePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="DD/MM/YYYY HH:mm"
                                    // minDate={dayjs()}
                                    disabledDate={getDisabledDate}
                                    disabledTime={getDisabledTime}
                                    // onCalendarChange={handleCalendarChange}
                                />
                            </Form.Item>}
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title='Supprimer la réservation ?'
                className="icon-modal-box"
                centered
                open={modalConfirmDeleteOpen}
                onOk={() => { }}
                onCancel={() => { setModalConfirmDeleteOpen(false) }}
                footer={[
                    <Button
                        className="custom-button"
                        key="submit" type="primary" danger
                        onClick={() => onConfirmDelete()}
                        loading={saving}
                    >
                        CONFIRMER LA SUPPRESSION
                    </Button>,
                ]}
            >
                Si vous supprimez cette réservation, l’utilisateur n’aurez plus accès au
                véhicule et il devra relancer une nouvelle réservation.
            </Modal>
        </>
    );
}

export default ReservationRow;