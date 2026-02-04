"use client"

import { Alert } from "antd";

export default function Freefloating() {
    return (
        <div style={{ padding: '24px' }}>
            <Alert
                message="Page Free-Floating"
                description="Cette page affiche le planning des réservations en free-floating. La fonctionnalité complète est en cours de développement."
                type="info"
                showIcon
            />
            <div style={{ marginTop: '24px' }}>
                <h3>Fonctionnalités prévues:</h3>
                <ul>
                    <li>Planning visuel des véhicules en free-floating</li>
                    <li>Réservations en cours</li>
                    <li>Réservations passées</li>
                    <li>Filtres par véhicule, conducteur, date</li>
                    <li>Gestion des véhicules disponibles</li>
                </ul>
            </div>
        </div>
    );
}
