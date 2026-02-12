"use client"

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import {Drawer, Form, Spin, Tag} from "antd";
import { ME_QUERY } from "@/lib/graphql/queries";
import {IReservation, IUser, IVehicle} from "@/lib/hooks/Interfaces";
import { useQuery as useQueryCS } from "@tanstack/react-query";
import { useGetVehicles } from "@/lib/hooks";
import {TYPE_FLEET, TYPE_VEHICLE, vehiclesByType,} from "@/lib/utils/VehicleType";

import BigBox from "./components/BigBox";
import AlertBar from "./components/AlertBar";
import StatBarFleet from "./components/StatBarFleet";
import FiscalYearStats from "./components/Statistics/FiscalYearStats";
import CarmooveGMapV2 from "./components/CarmooveGMapV2";

import "./Dashboard.css";
import {fetchReservations} from "@/app/actions/reservations";
import VehicleTypeBar from "@/components/Common/VehicleTypeBar";
import VehicleStatusBar from "./components/VehicleStatusBar";
import VehicleInformationBox from "@/app/[locale]/(client)/vehicle/[id]/components/VehicleInformationBox";
import {CalendarOutlined, EditOutlined} from "@ant-design/icons";
import {FiscalMonthSelect} from "@/app/[locale]/(client)/settings/components/FiscalMonthSelect";
import {MONTHS} from "@/lib/constants";


export default function Dashboard() {
    const [vehicleTypePill, setVehicleTypePill] = useState(TYPE_FLEET);
    const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [reservations, setReservations] = useState<IReservation[]>([]);

    const me = useQuery(ME_QUERY, {});

    const [drawerOpen, setDrawerOpen] = useState(false);

    const qReservations = useQueryCS({
        queryKey: ['reservations'],
        queryFn: () => fetchReservations({}),
    });

    const { loading, error, vehicles: vehiclesCS } = useGetVehicles(1200000);

    useEffect(() => {
        if (qReservations.data) {
            setReservations(qReservations.data);
        }
    }, [qReservations.data]);

    if (me.loading || loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Chargement du tableau de bord...">
                    <div style={{ height: '200px' }} />
                </Spin>
            </div>
        );
    }

    if (me.error || qReservations.error || error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>
                    Erreur lors du chargement du tableau de bord.
                </p>
            </div>
        );
    }

    const user: IUser = me.data?.whoami;

    const vehicles = vehiclesByType(
        vehiclesCS,
        vehicleTypePill,
        selectedVehicle,
        selectedMake
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="dashboard-main-content"
        >
            <div className="vehicle-bar-header">
                <VehicleTypeBar
                    vehicleTypePill={vehicleTypePill}
                    setVehicleTypePill={setVehicleTypePill}
                    vehicles={vehiclesCS}
                    onSelectVehicle={(vehicle)=>{
                        setSelectedVehicle(vehicle);
                    }}
                />
            </div>

            <div className="bg-white rounded-3 p-3 w-100 mb-2 d-flex justify-content-between align-items-center">
                <div className="px-2">
                    <div className="align-items-center">
                        <span className="fw-bold" style={{ margin: 0, fontSize: '0.85rem' }}>
                            <CalendarOutlined /> Année Fiscale
                            <Tag className="ms-2 px-3" color={'#1773b4'}>{MONTHS[user.company.fiscal_year.month -1]}</Tag>
                        </span>
                    </div>
                </div>

                <span onClick={()=>setDrawerOpen(true)} style={{color: '#5098b6', fontSize: '17px', cursor: 'pointer'}}><EditOutlined/></span>
            </div>

            {vehicleTypePill === TYPE_VEHICLE && selectedVehicle !== null && (
                <VehicleInformationBox vehicle={selectedVehicle} />
            )}

            {vehicleTypePill === TYPE_VEHICLE && selectedVehicle !== null && user?.company && (
                <div style={{ marginTop: '20px' }}>
                    <FiscalYearStats vehicle={selectedVehicle as IVehicle} user={user} />
                </div>
            )}

            {vehicleTypePill !== TYPE_VEHICLE && (
                <StatBarFleet types={vehicleTypePill} />
            )}

            <div className="row">
                <div className="col mr-25">
                    <AlertBar vehicles={vehicles} />
                    {vehicleTypePill !== TYPE_VEHICLE && (
                        <VehicleStatusBar vehicles={vehicles} reservations={reservations} />
                    )}
                </div>

                <div className="col">
                    <BigBox
                        id="map-box"
                        title="Localisation de vos véhicules"
                        link={{ link: "/maps", label: "Voir la carte" }}
                    >
                        <CarmooveGMapV2
                            vehicles={vehicles}
                            reservations={reservations}
                            forDashboard
                        />
                    </BigBox>
                </div>
            </div>
            <Drawer
                title="Année fiscale"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                width={400}
            >
                <div className="d-flex flex-column w-100">
                    <h5 className="mb-4">
                        Par défaut, vos données seront affichées par année fiscale à partir de Janvier. Si vous le souhaitez, vous pouvez modifier ce mois ci-dessous :
                    </h5>

                    <Form.Item
                        label=""
                        help="Définit le mois de début de votre année fiscale"
                    >
                        <FiscalMonthSelect user={user} />
                    </Form.Item>
                </div>
            </Drawer>
        </motion.div>
    );
}
