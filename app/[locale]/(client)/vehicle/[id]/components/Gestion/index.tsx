'use client'

import { Row, Col } from "antd";
import { IVehicle } from "@/lib/hooks/Interfaces";
import VehicleInformationBox from "../VehicleInformationBox";
import GestionVehicle from "./GestionVehicle";
import ActiveSecurityFunctions from "./ActiveSecurityFunctions";
import "./Gestion.css";

interface GestionProps {
    vehicle: IVehicle;
}

export default function Gestion({ vehicle }: GestionProps) {
    return (
        <>
            <VehicleInformationBox vehicle={vehicle} />
            <Row gutter={[20, 20]} className="gestion-main-row">
                <Col xs={24} md={12}>
                    <GestionVehicle vehicle={vehicle} />
                </Col>
                <Col xs={24} md={12}>
                    <ActiveSecurityFunctions vehicle={vehicle} />
                </Col>
            </Row>
        </>
    );
}
