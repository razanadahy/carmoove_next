'use client';

import { useCallback, useState, useRef } from "react";
import {GoogleMap, useLoadScript, Marker, InfoWindow, useJsApiLoader} from "@react-google-maps/api";
import { IVehicle, IReservation } from "@/lib/hooks/Interfaces";

interface ICarmooveGMap {
    vehicles: IVehicle[];
    reservations: IReservation[];
    selectedVehicle: IVehicle | null;
    onSelectVehicle: (vehicle: IVehicle | null) => void;
}

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const defaultCenter = {
    lat: 47.260833,
    lng:  2.418889,
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};

const getMarkerColor = (vehicle: IVehicle): string => {
    if (vehicle.stateCS?.state?.unavailable) return "#ff4d4f";
    if (vehicle.status?.engine === "ON") return "#52c41a";
    return "#1890ff";
};

const getOutlineColor = (isSelected: boolean): string => {
    return isSelected ? "#000000" : "#ffffff";
};

const createVehicleIcon = (fill: string, outline: string): string => {
    const svgMarker = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48">
        <path fill="${fill}" stroke="${outline}" stroke-width="2" d="M20 0C9 0 0 9 0 20c0 11 20 28 20 28s20-17 20-28C40 9 31 0 20 0z"/>
        <path fill="white" transform="translate(8, 12)" d="M24 8l-2-6H10L8 8H2v10h2l1 2h2l1-2h12l1 2h2l1-2h2V8h-6zM10 4h12l1.5 4h-15L10 4zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm18 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`;
};

const getMarkerIcon = (vehicle: IVehicle, isSelected: boolean): google.maps.Icon => {
    const fillColor = getMarkerColor(vehicle);
    const outlineColor = getOutlineColor(isSelected);

    return {
        url: createVehicleIcon(fillColor, outlineColor),
        scaledSize: new google.maps.Size(isSelected ? 50 : 40, isSelected ? 60 : 48),
        anchor: new google.maps.Point(isSelected ? 25 : 20, isSelected ? 60 : 48),
    };
};

export default function CarmooveGMap({vehicles, reservations, selectedVehicle, onSelectVehicle}: ICarmooveGMap) {
    const [infoWindowVehicle, setInfoWindowVehicle] = useState<IVehicle | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GMAP_KEY!,
        id: 'google-map-script',
    });

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;

        if (vehicles.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            vehicles.forEach(vehicle => {
                if (vehicle.location?.latitude && vehicle.location?.longitude) {
                    bounds.extend({
                        lat: vehicle.location.latitude,
                        lng: vehicle.location.longitude
                    });
                }
            });

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
            }
        }
    }, [vehicles]);

    const handleMarkerClick = (vehicle: IVehicle) => {
        onSelectVehicle(vehicle);
        setInfoWindowVehicle(vehicle);

        if (mapRef.current && vehicle.location) {
            mapRef.current.panTo({
                lat: vehicle.location.latitude,
                lng: vehicle.location.longitude
            });
        }
    };

    const isVehicleReserved = (vehicleId: string): boolean => {
        const now = Date.now();
        return reservations.some(
            r => r.vehicleId === vehicleId && r.from <= now && r.until >= now
        );
    };

    if (loadError) {
        return <div className="map-error">Erreur de chargement de la carte</div>;
    }

    if (!isLoaded) {
        return <div className="map-loading">Chargement de la carte...</div>;
    }

    const validVehicles = vehicles.filter(
        v => v.location?.latitude && v.location?.longitude
    );

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedVehicle?.location ? {
                lat: selectedVehicle.location.latitude,
                lng: selectedVehicle.location.longitude
            } : defaultCenter}
            zoom={10}
            options={mapOptions}
            mapTypeId='roadmap'
            onLoad={onMapLoad}
            onClick={() => setInfoWindowVehicle(null)}
        >
            {validVehicles.map((vehicle) => (
                <Marker
                    key={vehicle.id}
                    position={{
                        lat: vehicle.location.latitude,
                        lng: vehicle.location.longitude
                    }}
                    icon={getMarkerIcon(vehicle, selectedVehicle?.id === vehicle.id)}
                    onClick={() => handleMarkerClick(vehicle)}
                    title={vehicle.information.registration}
                />
            ))}

            {infoWindowVehicle && infoWindowVehicle.location && (
                <InfoWindow
                    position={{
                        lat: infoWindowVehicle.location.latitude,
                        lng: infoWindowVehicle.location.longitude
                    }}
                    onCloseClick={() => setInfoWindowVehicle(null)}
                >
                    <div className="info-window-content">
                        <div>
                            <span>{infoWindowVehicle.information.registration}</span>
                        </div>
                        <div>
                            {infoWindowVehicle.information.make} {infoWindowVehicle.information.model}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                            {infoWindowVehicle.stateCS?.state?.unavailable ? (
                                <span style={{ color: "#ff4d4f" }}>Indisponible</span>
                            ) : isVehicleReserved(infoWindowVehicle.id) ? (
                                <span style={{ color: "#faad14" }}>Reservé</span>
                            ) : (
                                <span style={{ color: "#52c41a" }}>Disponible</span>
                            )}
                        </div>
                        {infoWindowVehicle.location.address && (
                            <div style={{ marginTop: 4, fontSize: 11, color: "#888" }}>
                                {infoWindowVehicle.location.address.address}
                                {infoWindowVehicle.location.address.city &&
                                    `, ${infoWindowVehicle.location.address.city}`}
                            </div>
                        )}
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
