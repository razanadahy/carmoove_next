'use client'

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, Popup, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
import { IPath } from "@/lib/hooks/Interfaces";

// Extend Leaflet types for polylineDecorator
declare module 'leaflet' {
    function polylineDecorator(
        polyline: L.Polyline | L.LatLngExpression[],
        options?: any
    ): any;
    const Symbol: {
        arrowHead: (options?: any) => any;
        dash: (options?: any) => any;
        marker: (options?: any) => any;
    };
}
import positionStartSvg from "@/assets/image/position_start.svg";
import positionEndSvg from "@/assets/image/position_end.svg";
import "./PathMap.css";

interface ILocationV3Props {
    coordinates: [number, number][];
}

interface IGeoJsonORS {
    type: string;
    features: {
        bbox: number[];
        geometry: {
            coordinates: [number, number][];
            type: string;
        };
        properties: Record<string, unknown>;
    }[];
}

interface PathMapProps {
    path: IPath;
}

// Create icons lazily
const getPositionStartIcon = () => L.icon({
    iconUrl: positionStartSvg.src,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const getPositionEndIcon = () => L.icon({
    iconUrl: positionEndSvg.src,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const FitBounds = ({ departure, arrival }: { departure: [number, number]; arrival: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds([departure, arrival]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, departure, arrival]);

    return null;
};

interface MapContentProps {
    path: IPath;
    departure: [number, number];
    arrival: [number, number];
    routeData: IGeoJsonORS | null;
}

const MapContent = ({ path, departure, arrival, routeData }: MapContentProps) => {
    const map = useMap();
    const positionStartIcon = useMemo(() => getPositionStartIcon(), []);
    const positionEndIcon = useMemo(() => getPositionEndIcon(), []);

    // Draw route using native Leaflet if routeData exists
    useEffect(() => {
        if (!routeData?.features?.[0]?.geometry?.coordinates) return;

        const coordinates = routeData.features[0].geometry.coordinates;
        const latLngs: L.LatLngExpression[] = coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

        // Border polyline
        const borderPolyline = L.polyline(latLngs, {
            color: '#01426A',
            weight: 7,
            opacity: 1
        }).addTo(map);

        // Main polyline
        const mainPolyline = L.polyline(latLngs, {
            color: '#39A1D8',
            weight: 5,
            opacity: 1
        }).addTo(map);

        // Add arrow decorators for direction
        const arrowDecorator = L.polylineDecorator(mainPolyline, {
            patterns: [
                {
                    offset: '5%',
                    repeat: 80,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            weight: 2,
                            color: '#01426A',
                            fillOpacity: 1
                        }
                    })
                }
            ]
        }).addTo(map);

        // Fit bounds to route
        map.fitBounds(mainPolyline.getBounds(), { padding: [50, 50] });

        return () => {
            map.removeLayer(borderPolyline);
            map.removeLayer(mainPolyline);
            map.removeLayer(arrowDecorator);
        };
    }, [map, routeData]);

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={departure} icon={positionStartIcon}>
                {!!path.addressStart?.address && (
                    <Popup closeButton={false} autoClose>
                        {path.addressStart?.address}
                    </Popup>
                )}
            </Marker>
            <Marker position={arrival} icon={positionEndIcon}>
                {!!path.addressEnd?.address && (
                    <Popup closeButton={false} autoClose>
                        {path.addressEnd?.address}
                    </Popup>
                )}
            </Marker>
            {!routeData && <FitBounds departure={departure} arrival={arrival} />}
        </>
    );
};

const fetchRoute = async (routeProps: ILocationV3Props): Promise<IGeoJsonORS | null> => {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY || '',
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: JSON.stringify(routeProps)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
};

export default function PathMap({ path }: PathMapProps) {
    const maxPoint = 70;
    const [routeData, setRouteData] = useState<IGeoJsonORS | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    const departure: [number, number] = useMemo(() => [
        path.positions[0].latitude,
        path.positions[0].longitude
    ], [path.positions]);

    const arrival: [number, number] = useMemo(() => [
        path.positions[path.positions.length - 1].latitude,
        path.positions[path.positions.length - 1].longitude
    ], [path.positions]);

    useEffect(() => {
        let positions = [...path.positions];
        if (path.positions.length > maxPoint) {
            const startPoint = positions[0];
            const endPoint = positions[positions.length - 1];
            positions = positions.slice(1, positions.length - 1);
            positions = positions.filter((_, index) => index % Math.ceil(path.positions.length / maxPoint) === 0);
            positions = positions.slice(0, maxPoint - 2);
            positions.unshift(startPoint);
            positions.push(endPoint);
        }

        const locationV3Props: ILocationV3Props = {
            coordinates: positions.map(pos => [pos.longitude, pos.latitude]),
        };

        fetchRoute(locationV3Props).then(setRouteData);
    }, [path.id]);

    return (
        <MapContainer
            center={departure}
            zoom={12}
            style={{ height: "800px", width: "100%" }}
            ref={mapRef}
            whenReady={() => {
                // Map is ready
            }}
        >
            <MapContent
                path={path}
                departure={departure}
                arrival={arrival}
                routeData={routeData}
            />
        </MapContainer>
    );
}
