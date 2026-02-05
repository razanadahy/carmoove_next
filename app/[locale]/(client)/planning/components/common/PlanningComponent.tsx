'use client';

import React, {JSX, useEffect, useMemo, useState} from "react";
import {ConfigProvider, Tabs, Spin} from "antd";
import {useRouter, usePathname, useSearchParams} from "next/navigation";

interface Iplanning {
    text: string;
    tabLink: { key: string, label: string, children: JSX.Element }[];
    loading: boolean;
}

const PlanningComponent = (props: Iplanning) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const typeParam = useMemo(() => {
        return searchParams.get('type') ?? 'planning';
    }, [searchParams]);

    const [sPanelSelected, setSPanelSelected] = useState(typeParam);

    useEffect(() => {
        setSPanelSelected(typeParam);
    }, [typeParam]);

    const handleTabChange = (key: string) => {
        router.push(`${pathname}?type=${key}`);
    };
    return (
       <>
           <div className=" text-res mb-2">
               <h2 className="my-0">{props.text}</h2>
           </div>
           {/*{props.loading ? (*/}
           {/*    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>*/}
           {/*        <Spin size="large" />*/}
           {/*    </div>*/}
           {/*) :*/}
               <ConfigProvider
               theme={{
                   components: {
                       Tabs: {
                           itemSelectedColor: '#01426A',
                           inkBarColor: '#01426A',
                       },
                   },
                   token: {
                       colorBorderSecondary: '#f0f0f0',
                   }
               }}
           >
               <Tabs
                   className="tabs-reservation"
                   tabPosition="top"
                   items={props.tabLink}
                   activeKey={sPanelSelected}
                   onChange={(key) => { handleTabChange(key) }}
                   type={"line"}
               />
           </ConfigProvider>
{/*}*/}
       </>
    )
}
export default React.memo(PlanningComponent);
