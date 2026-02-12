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

const getMarkerIcon = (vehicle: IVehicle, isSelected: boolean): google.maps.Symbol => {
    const color = getMarkerColor(vehicle);
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: isSelected ? "#000" : "#fff",
        strokeWeight: isSelected ? 3 : 2,
        scale: isSelected ? 12 : 8,
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
