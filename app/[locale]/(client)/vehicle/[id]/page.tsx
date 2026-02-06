'use client'

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ConfigProvider, Tabs } from "antd";
import { motion } from "framer-motion";
import { useGetVehicle } from "@/lib/hooks";
import { Loading } from "@/components/Common/Loading";
import Resume from "./components/Resume";
import DetailV2 from "./components/DetailV2";
import "./Vehicle.css";

export default function Vehicle() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();

    const panelSelected = searchParams.get('panel') ?? 'resume';

    const { data, loading, error } = useGetVehicle(params.id, 30000);

    const tabs = useMemo(() => {
        if (!data?.vehicle) return [];

        const vehicle = data.vehicle;
        const tabList = [
            {
                key: "resume",
                label: "Résumé",
                children: <Resume vehicle={vehicle} />,
            },
            {
                key: "detail",
                label: "Détail",
                children: <DetailV2 vehicle={vehicle} />,
            },
            // {
            //     key: "stats",
            //     label: "Stats",
            //     children: <Stats vehicle={vehicle} />,
            // },
            // {
            //     key: "paths",
            //     label: "Trajets",
            //     children: <PathsV2 vehicle={vehicle} />,
            // },
        ];

        // Diag tab
        // if (vehicle?.dataAvailability?.TellTaleStatus) {
        //     tabList.push({
        //         key: "diag",
        //         label: "Diag",
        //         children: <TableDiagV2 vehicle={vehicle} />,
        //     });
        // }

        // Gestion tab
        // if (vehicle.device?.configuration) {
        //     tabList.push({
        //         key: "gestion",
        //         label: "Gestion",
        //         children: <Gestion vehicle={vehicle} />,
        //     });
        // }

        // Autorisation tab
        // if (vehicle.device?.carSharing) {
        //     tabList.push({
        //         key: "autorisation",
        //         label: "Autorisation",
        //         children: <Authorization vehicle={vehicle} />,
        //     });
        // }

        // Reservation tab
        // if (vehicle.device?.carSharing) {
        //     tabList.push({
        //         key: "reservation",
        //         label: "Réservation",
        //         children: <Reservation vehicle={vehicle} />,
        //     });
        // }

        // Free floating tab
        // if (vehicle.device?.carSharing) {
        //     tabList.push({
        //         key: "floating",
        //         label: "Free floating",
        //         children: <Reservation vehicle={vehicle} freeFloating />,
        //     });
        // }

        return tabList;
    }, [data]);

    const handleTabChange = (key: string) => {
        router.push(`/vehicle/${params.id}?panel=${key}`);
    };

    if (loading) {
        return <Loading msg="Chargement du véhicule..." />;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
                <p>Erreur lors du chargement du véhicule</p>
            </div>
        );
    }

    if (!data?.vehicle) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                <p>Véhicule non trouvé</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="w-100 p-0 m-0"
        >
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            itemSelectedColor: '#4D4D4D',
                            inkBarColor: 'rgba(0,0,0,0)'
                        },
                    },
                    token: {
                        colorBorderSecondary: 'rgba(0,0,0,0)',
                    }
                }}
            >
                <Tabs
                    className="tabs-box"
                    activeKey={panelSelected}
                    tabPosition="top"
                    items={tabs}
                    onChange={handleTabChange}
                />
            </ConfigProvider>
        </motion.div>
    );
}
