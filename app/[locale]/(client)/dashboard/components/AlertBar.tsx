"use client"

import { Card, Badge } from "antd";
import {BellOutlined, RightOutlined} from "@ant-design/icons";
import { IVehicle } from "@/lib/hooks/Interfaces";
import {useRouter} from "next/navigation";
import { useQuery } from "@apollo/client";
import {ALERTS_COUNT_QUERY} from "@/lib/graphql/queries";
import {useEffect, useState} from "react";
import "./AlertBar.css";

interface AlertBarProps {
    vehicles: IVehicle[];
}

export default function AlertBar({ vehicles }: AlertBarProps) {
    const router = useRouter();
    const to = new Date();
    to.setHours(23, 59, 59);

    const { loading, error, data } = useQuery(ALERTS_COUNT_QUERY, {
        variables: {
            from: 0,
            to: Math.round(to.getTime() / 1000),
            archived: false,
            vehicleIds: vehicles.map(function (vehicle: IVehicle) {
                return vehicle.id
            })
        },
        context: {
            version: 'php'
        },
        pollInterval: 60000
    });

    const [total_unread, setTotal_unread] = useState(0)

    useEffect(() => {
        if (data?.notificationCounter){
            let y = 0
            data.notificationCounter.forEach((notification: { unread: number; }) => {
                y += notification.unread
            })
            setTotal_unread(y)
        }

    },[data?.notificationCounter])


    return (
        <Card className="mb-3"
            title={
                <span>
                    <BellOutlined />{loading ? '' :  <Badge count={total_unread} />} notifications non lues
                </span>
            }
              extra={
                  <a
                      onClick={() => router.push('/notification')}
                      style={{ cursor: 'pointer', color: '#1890ff' }}
                  >
                      Voir les notifications  <RightOutlined />
                  </a>
        }
        >
            {loading ? ( <div className="loading-txt">Chargement des alertes...</div>) : (
                <div className="alert-bar">
                    <div className="alert-content">
                        <div className="alert-item-alertes">
                            <span className="no-read-alert">{data.notificationCounter[0].unread} alertes</span>
                            <span className="total-alert">Total : {data.notificationCounter[0].count}</span>
                        </div>
                        <div className="alert-item-avertissements">
                            <span className="no-read-alert">{data.notificationCounter[1].unread} avertissements</span>
                            <span className="total-alert">Total : {data.notificationCounter[1].count}</span>
                        </div>
                        <div className="alert-item-informations">
                            <span className="no-read-alert">{data.notificationCounter[2].unread} informations</span>
                            <span className="total-alert">Total : {data.notificationCounter[2].count}</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
