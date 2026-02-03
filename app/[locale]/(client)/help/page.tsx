'use client';

import React from "react";
import { ConfigProvider, Tabs } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Tutorial from "@/components/help/Tutorial";
import Contact from "@/components/help/Contact";
import './help.css'

export default function HelpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('panel') || 'tutorial';

    const tabs = [
        {
            key: "tutorial",
            label: "Tutoriels",
            children: (
                <div className="tab-content-container">
                    <Tutorial />
                </div>
            ),
        },
        {
            key: "contact",
            label: "Contact",
            children: (
                <div className="tab-content-container">
                    <Contact />
                </div>
            ),
        }
    ];

    const handleTabChange = (key: string) => {
        router.push(`/help?panel=${key}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="help-box h-full"
        >
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            itemSelectedColor: '#4D4D4D',
                        },
                    },
                    token: {
                        colorBorderSecondary: 'rgba(0,0,0,0)',
                    }
                }}
            >
                <Tabs
                    className="tabs-box"
                    activeKey={activeTab}
                    tabPosition="top"
                    style={{}}
                    items={tabs}
                    onChange={handleTabChange}
                    type="card"
                />
            </ConfigProvider>
        </motion.div>
    );
}
