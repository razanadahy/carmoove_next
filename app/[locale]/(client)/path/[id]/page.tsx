'use client'

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { Col, Row } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import dynamic from "next/dynamic";
import { PATH_QUERY } from "@/lib/graphql/queries";
import { IPath } from "@/lib/hooks/Interfaces";
import { Loading } from "@/components/Common/Loading";
import VehicleInformationBox from "../../vehicle/[id]/components/VehicleInformationBox";
import StatBulle from "./components/StatBulle";
import DurationStatBulle from "./components/DurationStatBulle";
import positionStartSvg from "@/assets/image/position_start.svg";
import positionEndSvg from "@/assets/image/position_end.svg";
import "./Path.css";

// Dynamic import for the map component (SSR disabled)
const PathMap = dynamic(() => import("./components/PathMap"), {
    ssr: false,
    loading: () => <Loading msg="Chargement de la carte..." />
});

export default function Path() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const { data, loading, error } = useQuery(PATH_QUERY, {
        variables: {
            id: params.id
        },
        context: {
            version: 'php'
        }
    });

    if (loading) {
        return <Loading msg="Chargement du trajet..." />;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
                <p>Erreur lors du chargement du trajet</p>
            </div>
        );
    }

    const path: IPath = data.path;

    const formatAddress = (address: { address?: string; zipcode?: string; city?: string } | null) => {
        if (!address) return 'N/D';
        const parts = [address.address, address.zipcode, address.city].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/D';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="path-detail-container"
        >
            <VehicleInformationBox vehicle={path.vehicle} />

            <Row justify="start" className="path-header-row">
                <Col span={2} className="back-col">
                    <a onClick={() => router.back()} className="back-link">
                        <LeftOutlined style={{ fontSize: '14px' }} /> Retour
                    </a>
                </Col>
                <Col flex="auto">
                    <div className="path-waypoint">
                        <img src={positionStartSvg.src} alt="Départ" className="waypoint-icon" />
                        <span>
                            Départ le {format(new Date(path.startAt * 1000), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                            &nbsp;de : {formatAddress(path.addressStart)}
                        </span>
                    </div>
                    <div className="path-waypoint">
                        <img src={positionEndSvg.src} alt="Arrivée" className="waypoint-icon" />
                        <span>
                            Arrivée le {format(new Date(path.stopAt * 1000), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                            &nbsp;à : {formatAddress(path.addressEnd)}
                        </span>
                    </div>
                </Col>
            </Row>

            <div className="stat-bar">
                <DurationStatBulle
                    title="Durée"
                    number={path.duration}
                />
                <StatBulle
                    tooltip=""
                    title="Distance"
                    number={Math.round(path.distance * 10) / 10}
                    unit="Km"
                />
                <StatBulle
                    tooltip=""
                    title="Coûts estimés"
                    number={Math.round(path.cost)}
                    unit="€"
                />
                {path.fuel > 0 && (
                    <StatBulle
                        tooltip=""
                        title="Conso totale"
                        number={Math.round(path.fuel)}
                        unit="L"
                    />
                )}
                {path.consumption > 0 && (
                    <StatBulle
                        tooltip=""
                        title="Conso au 100km"
                        number={Math.round(path.consumption * 10) / 10}
                        unit="L"
                    />
                )}
                {path.electricConsumption > 0 && (
                    <StatBulle
                        tooltip=""
                        title="Conso totale"
                        number={Math.round(path.electricConsumption / 100) / 10}
                        unit="Kw"
                    />
                )}
                {path.electricConsumption100km > 0 && (
                    <StatBulle
                        tooltip=""
                        title="Conso au 100km"
                        number={Math.round(path.electricConsumption100km / 100) / 10}
                        unit="Kw"
                    />
                )}
                {path.averageSpeed > 0 && (
                    <StatBulle
                        tooltip=""
                        title="Vitesse moyenne"
                        number={Math.round(path.averageSpeed * 10) / 10}
                        unit="Km/h"
                    />
                )}
            </div>

            <div className="map-full">
                {path.positions?.length >= 2 ? (
                    <PathMap path={path} />
                ) : (
                    <div className="no-data-gps">
                        Aucune donnée GPS, trajet réalisé avec le mode smart géolocalisation activé.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
