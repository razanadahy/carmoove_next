'use client'

import {useQuery} from "@apollo/client";
import {ME_QUERY} from "@/lib/graphql/queries";
import {useGetVehicles} from "@/lib/hooks";
import {useEffect, useState} from "react";
import {IUser} from "@/lib/hooks/Interfaces";
import { motion } from "framer-motion";
import {ConfigProvider, Tabs} from "antd";
import { StatGlobal, StatDetailed, StatExport } from "@/components/Statistics";

export default function Statistics() {
    const {loading: ld_user, error: er_user, data: data_user} = useQuery(ME_QUERY, {
        //fetchPolicy: "network-only"
    });

    const { vehicles, loading, error } = useGetVehicles(0)

    const [user, setUser] = useState<IUser | null>(null)

    useEffect(() => {
        if (data_user?.whoami){
            setUser(data_user.whoami)
        }
    },[data_user?.whoami])

    let tabs = [
        {
            key: "globales",
            label: "Globales",
            children: <StatGlobal user={user} vehicles={vehicles} />,
        },
        {
            key: "detaillees",
            label: "Détaillées",
            children: <StatDetailed user={user} vehicles={vehicles} />,
        },
        {
            key: "exports",
            label: "Exports",
            children: <StatExport user={user} vehicles={vehicles} />,
        }
    ];
    return (
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
                    defaultActiveKey="1"
                    tabPosition="top"
                    style={{}}
                    items={tabs}
                    type={"card"}
                />
            </ConfigProvider>
        </motion.div>
    )
}