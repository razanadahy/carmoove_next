'use client'
import {IDriver, IReservation, IVehicle} from "@/lib/hooks/Interfaces";
import React, {useEffect, useMemo, useState} from "react";
import { useRouter } from "next/navigation";
import { energyTrueFormat } from "@/services/VehiculesService";
import './planningFC.css';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import frLocale from '@fullcalendar/core/locales/fr';
import { Modal } from 'antd';
import { UserOutlined, CalendarOutlined, CarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import Immat from "@/components/Common/Immat";
import flashIcon from "@/assets/image/flash.svg";
import Image from "next/image";

dayjs.locale('fr');

interface IFormattedChild {
    id: string;
    model: string;
    registration: string;
    energy: string;
    make: string;
    isUnavailable: boolean;
}

export interface IEventItem {
    id: string;
    resourceId: string;
    title: string;
    start: Date;
    end: Date;
    className: string;
    extendedProps?: {
        driverName: string;
        vehicleInfo: string;
        isUnavailable: boolean;
    };
}

interface ISelectedEvent {
    title: string;
    start: Date;
    end: Date;
    driverName: string;
    vehicleInfo: string;
    isUnavailable: boolean;
}

interface PlanningProps {
    resultVehicles: IVehicle[];
    vehicles: IVehicle[];
    allDrivers: IDriver[];
    selectedDriverTags: IDriver[];
    reservations: IReservation[];
    isFreeFloating?: boolean;
}

export const PlanningFC = (props: PlanningProps) => {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ISelectedEvent | null>(null);

    const resources = useMemo(() => {
        const groupsMap = new Map<string, IFormattedChild[]>();

        props.resultVehicles.forEach((vehicle) => {
            const make = vehicle.information.make;

            if (!groupsMap.has(make)) {
                groupsMap.set(make, []);
            }

            groupsMap.get(make)!.push({
                id: vehicle.id,
                model: vehicle.information.model,
                registration: vehicle.information.registration,
                energy: energyTrueFormat(vehicle.information.energy),
                make: vehicle.information.make,
                isUnavailable: vehicle?.stateCS?.state?.unavailable ?? true
            });
        });

        const sortedGroups = Array.from(groupsMap.entries())
            .sort(([makeA], [makeB]) => makeA.localeCompare(makeB))
            .map(([make, children]) => ({ make, children }));

        const fcResources: any[] = [];

        sortedGroups.forEach((group) => {
            // Groupe parent (marque)
            fcResources.push({
                id: `group-${group.make}`,
                title: group.make,
                isGroup: true,
            });

            // Véhicules enfants
            group.children.forEach((child) => {
                fcResources.push({
                    id: child.id,
                    parentId: `group-${group.make}`,
                    title: child.registration,
                    extendedProps: {
                        model: child.model,
                        make: child.make,
                        energy: child.energy,
                        registration: child.registration,
                        isUnavailable: child.isUnavailable,
                    }
                });
            });
        });

        return fcResources;
    }, [props.resultVehicles]);

    const events = useMemo(() => {
        const eventItems: IEventItem[] = [];

        // Helper pour obtenir les infos véhicule
        const getVehicleInfo = (vehicleId: string) => {
            const vehicle = props.resultVehicles.find(v => v.id === vehicleId);
            if (vehicle) {
                return `${vehicle.information.registration} - ${vehicle.information.make} ${vehicle.information.model}`;
            }
            return '';
        };

        if (props.allDrivers.length === 0 || props.reservations.length === 0) {
            // Ajouter quand même les événements "indisponible"
            props.resultVehicles.forEach(vehicle => {
                if (vehicle?.stateCS?.state?.unavailable) {
                    const now = new Date();
                    const fiveYearsLater = new Date();
                    fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);

                    eventItems.push({
                        id: `unavailable-${vehicle.id}`,
                        resourceId: vehicle.id,
                        title: 'Indisponible',
                        start: now,
                        end: fiveYearsLater,
                        className: 'event-red',
                        extendedProps: {
                            driverName: '',
                            vehicleInfo: getVehicleInfo(vehicle.id),
                            isUnavailable: true
                        }
                    });
                }
            });
            return eventItems;
        }

        // Réservations
        props.reservations.forEach((rev) => {
            const driver = props.allDrivers.find(d => d.accountId === rev.userId);
            const driverName = driver ? `${driver.firstName} ${driver.lastName}` : 'Conducteur inconnu';

            eventItems.push({
                id: rev.authorizationId,
                resourceId: rev.vehicleId,
                title: driverName,
                start: new Date(rev.from * 1000),
                end: new Date((props.isFreeFloating ? rev.stopDate as number : rev.until) * 1000),
                className: 'event-green',
                extendedProps: {
                    driverName,
                    vehicleInfo: getVehicleInfo(rev.vehicleId),
                    isUnavailable: false
                }
            });
        });

        // Véhicules indisponibles
        props.resultVehicles.forEach(vehicle => {
            if (vehicle?.stateCS?.state?.unavailable) {
                const now = new Date();
                const fiveYearsLater = new Date();
                fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);

                eventItems.push({
                    id: `unavailable-${vehicle.id}`,
                    resourceId: vehicle.id,
                    title: 'Indisponible',
                    start: now,
                    end: fiveYearsLater,
                    className: 'event-red',
                    extendedProps: {
                        driverName: '',
                        vehicleInfo: getVehicleInfo(vehicle.id),
                        isUnavailable: true
                    }
                });
            }
        });

        return eventItems;
    }, [props.resultVehicles, props.reservations, props.allDrivers, props.isFreeFloating]);

    const renderResourceLabel = (arg: any) => {
        const { resource } = arg;

        if (resource.extendedProps.isGroup || resource.id.startsWith('group-')) {
            return (
                <div className="make-group m-0 w-100" style={{ backgroundColor: '#F5F5F5', fontWeight: 'bold' }}>
                    {resource.title}
                </div>
            );
        }

        const { model, make, energy, registration, isUnavailable } = resource.extendedProps;

        return (
            <div className="title-vehicle-num-planning mt-0 px-3">
                <Image
                    className={`reservation-link ${isUnavailable ? "invisible" : ""}`}
                    src={flashIcon}
                    alt="reservation"
                    width={20}
                    height={20}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isUnavailable) {
                            router.push(`/vehicle/${resource.id}?panel=${props.isFreeFloating ? "floating" : "reservation"}`);
                        }
                    }}
                />
                <Immat registration={registration} size="small" />
                {' '}{make} {model}
                <span className="fw-light"> - {energy}</span>
            </div>
        );
    };

    // Handler pour le clic sur un événement
    const handleEventClick = (clickInfo: EventClickArg) => {
        const event = clickInfo.event;
        const extendedProps = event.extendedProps;

        setSelectedEvent({
            title: event.title,
            start: event.start!,
            end: event.end!,
            driverName: extendedProps.driverName || '',
            vehicleInfo: extendedProps.vehicleInfo || '',
            isUnavailable: extendedProps.isUnavailable || false
        });
        setModalOpen(true);
    };

    // Calculer les dates par défaut (-7 jours à +7 jours)
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 7);
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 7);

    return (
        <div className="planning-main-box mt-4 mb-3">
            <FullCalendar
                plugins={[resourceTimelinePlugin]}
                initialView="resourceTimelineMonth"
                locale={frLocale}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
                }}
                buttonText={{
                    today: "Aujourd'hui",
                    day: 'Jour',
                    week: 'Semaine',
                    month: 'Mois'
                }}
                views={{
                    resourceTimelineDay: {
                        slotDuration: '01:00:00',
                        slotLabelFormat: {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }
                    },
                    resourceTimelineWeek: {
                        slotDuration: '24:00:00',
                        slotLabelFormat: {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        }
                    },
                    resourceTimelineMonth: {
                        slotDuration: '24:00:00',
                        slotLabelFormat: {
                            weekday: 'short',
                            day: 'numeric'
                        }
                    }
                }}
                initialDate={new Date()}
                resources={resources}
                events={events}
                resourceAreaWidth={450}
                slotMinWidth={50}
                resourceLabelContent={renderResourceLabel}
                resourceGroupField="parentId"
                height="auto"
                nowIndicator={true}
                scrollTime="08:00:00"
                resourceAreaHeaderContent={() => (
                    <div className="resource-header">
                        <div className="planning-legend d-flex flex-column gap-2">
                            <div className="d-inline-flex align-items-center">
                                <span className="legend-green d-block me-2" style={{ width: '14px', height: '14px' }}></span>
                                <span className="legende-text">: Réservé</span>
                            </div>
                            <div className="d-inline-flex align-items-center">
                                <span className="legend-red d-block me-2" style={{ width: '14px', height: '14px' }}></span>
                                <span className="legende-text">: Indisponible</span>
                            </div>
                        </div>
                    </div>
                )}
                eventClick={handleEventClick}
            />

            <Modal
                title={selectedEvent?.isUnavailable ? "Véhicule indisponible" : "Détails de la réservation"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
            >
                {selectedEvent && (
                    <div className="event-modal-content">
                        {!selectedEvent.isUnavailable && (
                            <div className="event-modal-row">
                                <UserOutlined className="event-modal-icon" />
                                <div className="event-modal-info">
                                    <span className="event-modal-label">Conducteur</span>
                                    <span className="event-modal-value">{selectedEvent.driverName}</span>
                                </div>
                            </div>
                        )}

                        <div className="event-modal-row">
                            <CarOutlined className="event-modal-icon" />
                            <div className="event-modal-info">
                                <span className="event-modal-label">Véhicule</span>
                                <span className="event-modal-value">{selectedEvent.vehicleInfo}</span>
                            </div>
                        </div>

                        <div className="event-modal-row">
                            <CalendarOutlined className="event-modal-icon" />
                            <div className="event-modal-info">
                                <span className="event-modal-label">Date de départ</span>
                                <span className="event-modal-value">
                                    {dayjs(selectedEvent.start).format('dddd D MMMM YYYY [à] HH:mm')}
                                </span>
                            </div>
                        </div>

                        <div className="event-modal-row">
                            <CalendarOutlined className="event-modal-icon" />
                            <div className="event-modal-info">
                                <span className="event-modal-label">Date de retour</span>
                                <span className="event-modal-value">
                                    {dayjs(selectedEvent.end).format('dddd D MMMM YYYY [à] HH:mm')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PlanningFC;
