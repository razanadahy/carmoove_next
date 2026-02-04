"use client"

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { IVehicle } from '@/lib/hooks/Interfaces';
import { IReservation } from '@/app/actions/reservationServices';

interface CarmooveMapProps {
    vehicles: IVehicle[];
    reservations: IReservation[];
    onSelectedVehicle?: (vehicle: IVehicle) => void;
    forDashboard?: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 47.260833,
    lng: 2.418889
};

export default function CarmooveGMapV2({ vehicles, reservations, onSelectedVehicle, forDashboard }: CarmooveMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GMAP_KEY || '',
    });

    const [map, setMap] = React.useState<google.maps.Map | null>(null);

    const onLoad = React.useCallback((map: google.maps.Map) => {
        setMap(map);

        const bounds = new window.google.maps.LatLngBounds();
        vehicles.forEach((vehicle) => {
            if (vehicle.location?.longitude && vehicle.location?.latitude) {
                bounds.extend(new window.google.maps.LatLng(
                    vehicle.location.latitude,
                    vehicle.location.longitude
                ));
            }
        });

        if (vehicles.length > 0) {
            map.fitBounds(bounds);
        }
    }, [vehicles]);

    const onUnmount = React.useCallback(() => {
        setMap(null);
    }, []);

    if (!isLoaded) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement de la carte...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            mapTypeId='roadmap'
        >
            {vehicles.map(vehicle => {
                if (vehicle.location?.longitude && vehicle.location?.latitude) {
                    const position = {
                        lat: vehicle.location.latitude,
                        lng: vehicle.location.longitude,
                    };

                    const isReserved = reservations.some(r => r.vehicleId === vehicle.id);
                    const isUnavailable = vehicle.stateCS?.state.unavailable;

                    return (
                        <Marker
                            position={position}
                            key={`marker-${vehicle.id}`}
                            title={`${vehicle.information.registration} - ${vehicle.information.make}`}
                            onClick={() => {
                                if (onSelectedVehicle) onSelectedVehicle(vehicle);
                            }}
                        />
                    );
                }
                return null;
            })}
        </GoogleMap>
    );
}
