"use client"

import { ConfigProvider, Tabs } from 'antd';
import { useRouter, useParams } from "next/navigation";
import GlobalSetting from "../components/GlobalSetting";
import AutoPartageSetting from "../components/AutoPartageSetting";

import "../Settings.css";

export default function SettingsTabPage() {
    const router = useRouter();
    const params = useParams();
    const tab = params?.tab as string;

    const tabs = [
        {
            key: "global",
            label: "Général",
            children: <GlobalSetting />,
        },
        {
            key: "car-sharing",
            label: "Autopartage",
            children: <AutoPartageSetting />,
        }
    ];


    const handleTabChange = (key: string) => {
        // Récupérer le chemin de base (avec locale)
        const pathParts = window.location.pathname.split('/settings');
        const basePath = pathParts[0];
        router.push(`${basePath}/settings/${key}`);
    };

    return (
        <div className=" h-100 m-0 p-0">
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
                    activeKey={tab}
                    tabPosition="top"
                    items={tabs}
                    onChange={handleTabChange}
                    type={"card"}
                />
            </ConfigProvider>
        </div>
    );
}
