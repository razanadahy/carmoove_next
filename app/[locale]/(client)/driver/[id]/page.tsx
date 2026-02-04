"use client"

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ConfigProvider, Tabs, Spin } from "antd";
import { useGetDriver, useGetDriverStatistics } from "@/lib/hooks";
import Infos from "./components/Infos";
import DriverPath from "./components/DriverPath";
import DriverStats from "./components/DriverStats";
import '../../help/help.css'

export default function DriverDetail() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const driverId = params?.id as string;
    const panelSelected = searchParams?.get('panel') ?? 'infos';
    const [panel, setPanel] = useState<string>(panelSelected);

    const { data, loading, error } = useGetDriver(driverId);
    const mDriverStat = useGetDriverStatistics(driverId);

    useEffect(() => {
        setPanel(panelSelected);
    }, [panelSelected]);

    if (loading || mDriverStat.loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Chargement du conducteur...">
                    <div style={{ height: '200px' }} />
                </Spin>
            </div>
        );
    }

    if (error || mDriverStat.error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>Erreur lors du chargement du conducteur</p>
            </div>
        );
    }

    const driver = data?.driver;

    if (!driver) {
        router.push('/drivers');
        return null;
    }

    let tabs = [
        {
            key: "infos",
            label: "Infos",
            children: <Infos driver={driver} />,
        }
    ];

    // Ajouter l'onglet Trajets si le conducteur a des trajets
    if (mDriverStat.data?.driverStatistics?.nbPaths) {
        tabs.push({
            key: "paths",
            label: "Trajets",
            children: <DriverPath driverId={driverId} />,
        });
    }

    // Ajouter l'onglet Stats si des statistiques existent
    if (
        mDriverStat.data?.driverStatistics?.nbPaths ||
        mDriverStat.data?.driverStatistics?.usageTime ||
        mDriverStat.data?.driverStatistics?.usageMileage ||
        mDriverStat.data?.driverStatistics?.usageCost ||
        mDriverStat.data?.driverStatistics?.totalFuel ||
        mDriverStat.data?.driverStatistics?.consumption ||
        mDriverStat.data?.driverStatistics?.electricConsumption ||
        mDriverStat.data?.driverStatistics?.co2
    ) {
        tabs.push({
            key: "stats",
            label: "Stats",
            children: <DriverStats data={mDriverStat.data} />,
        });
    }

    const handleTabChange = (key: string) => {
        setPanel(key);
        router.push(`/driver/${driverId}?panel=${key}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ padding: '24px' }}
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
                    activeKey={panel}
                    tabPosition="top"
                    items={tabs}
                    onChange={handleTabChange}
                    type="card"
                />
            </ConfigProvider>
        </motion.div>
    );
}
