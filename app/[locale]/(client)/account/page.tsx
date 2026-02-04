'use client';

import { motion } from "framer-motion";
import './Account.css';
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/lib/graphql/queries";
import { IUser } from "@/types/interfaces";
import { Edit } from "./components/Edit";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ConfigProvider, Tabs, Spin } from "antd";
import { EditCompany } from "./components/EditCompany";
import '../help/help.css'

export default function Account() {
    const searchParams = useSearchParams();
    const panelSelected = searchParams.get('panel') ?? 'personal';
    const router = useRouter();
    const [panel, setPanel] = useState<string>(panelSelected);

    const { data, loading, error } = useQuery(ME_QUERY);

    useEffect(() => {
        setPanel(panelSelected);
    }, [panelSelected]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const user: IUser = data.whoami;

    let tabs = [
        {
            key: "personal",
            label: "Infos Personnelles",
            children: <Edit user={user} />,
        },
        {
            key: "company",
            label: "Entreprise",
            children: <EditCompany user={user} />,
        }
    ];

    const handleTabChange = (key: string) => {
        setPanel(key);
        router.push(`/account?panel=${key}`);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
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
                        type={"card"}
                    />
                </ConfigProvider>

                <div className="cgv-box">
                    <h2>CGV/CGVU</h2>
                    <a href="https://www.carmoove.com/conditions-generales-de-vente-et-d-utilisation/" target="_blank" rel="noopener noreferrer">
                        Conditions Générales de Ventes et d'Utilisation - Carmoove.
                    </a>
                </div>
            </motion.div>
        </>
    );
}
