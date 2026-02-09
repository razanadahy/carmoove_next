'use client'

import { DatePicker } from "antd";
import { LeftOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { IAuthorization } from "@/lib/hooks/Interfaces";
import "./AuthorizationDetail.css";

interface AuthorizationDetailProps {
    autorisation: IAuthorization;
    setAuthorizationView: React.Dispatch<React.SetStateAction<IAuthorization | null>>;
}

export default function AuthorizationDetail({ autorisation, setAuthorizationView }: AuthorizationDetailProps) {
    const back = () => {
        setAuthorizationView(null);
    };

    return (
        <>
            <div className="authorization-detail-header">
                <span className="authorization-detail-back" onClick={back}>
                    <LeftOutlined />
                    <span>Retour</span>
                </span>
                <span className="authorization-detail-drivername-box">
                    <span className="authorization-detail-driver-profile">
                        <UserOutlined />
                    </span>
                    <span className="authorization-detail-drivername">{autorisation.driverName}</span>
                </span>
                <span className="authorization-detail-fromto">
                    <span className="authorization-detail-icon-clock">
                        <ClockCircleOutlined />
                    </span>
                    <span className="authorization-detail-date-picker-box">
                        <DatePicker
                            disabled={true}
                            style={{ fontSize: "12px" }}
                            variant="borderless"
                            format={"DD/MM/YYYY à HH:mm"}
                            prefix="Début le "
                            suffixIcon={null}
                            value={dayjs.unix(autorisation.from!)}
                        />
                        <DatePicker
                            disabled={true}
                            style={{ fontSize: "12px" }}
                            variant="borderless"
                            prefix="Fin le "
                            suffixIcon={null}
                            format={"DD/MM/YYYY à HH:mm"}
                            value={dayjs.unix(autorisation.until)}
                        />
                    </span>
                </span>
            </div>
            <h2 className="title-authorization">Droits d'accès au véhicule & historique de réservation</h2>
            <div className="authorization-detail-content">
                <p className="placeholder-text">Détails des droits d'accès...</p>
            </div>
            <h2 className="title-authorization">Statistiques d'usage du véhicule pendant l'autopartage</h2>
            <div className="authorization-detail-content">
                <p className="placeholder-text">Statistiques d'usage...</p>
            </div>
        </>
    );
}
