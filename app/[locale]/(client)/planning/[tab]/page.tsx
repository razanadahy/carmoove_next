"use client"

import { ConfigProvider, Tabs } from 'antd';
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Autopartage from "../components/Autopartage";
import Freefloating from "../components/Freefloating";

import "../Planning.css";
import '../../help/help.css'

export default function PlanningTabPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const tab = params?.tab as string;

    const tabs = useMemo(() => {
        return [
            {
                key: "auto",
                label: "Autopartage",
                children: <Autopartage />,
            },
            {
                key: "free",
                label: "Free-Floating",
                children: <Freefloating />,
            }
        ];
    }, []);

    const handleTabChange = (key: string) => {
        const type = searchParams?.get('type') || 'planning';
        router.push(`/planning/${key}?type=${type}`);
    };

    return (
        <div className="w-100 h-100 m-0 p-0">
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
