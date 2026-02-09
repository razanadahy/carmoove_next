'use client'

import { useState, useMemo } from "react";
import { Input, List, Avatar, Empty } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver } from "@/lib/hooks/Interfaces";
import { Loading } from "@/components/Common/Loading";
import "./SelectDriver.css";

interface SelectDriverProps {
    onSelect: (driver: IDriver) => void;
}

export default function SelectDriver({ onSelect }: SelectDriverProps) {
    const [searchText, setSearchText] = useState("");

    const { loading, error, data } = useQuery(DRIVERS_QUERY, {
        context: { version: "php" },
    });

    const filteredDrivers = useMemo(() => {
        if (!data?.drivers) return [];
        const drivers: IDriver[] = data.drivers;

        if (!searchText) return drivers;

        const search = searchText.toLowerCase();
        return drivers.filter(driver =>
            driver.firstName?.toLowerCase().includes(search) ||
            driver.lastName?.toLowerCase().includes(search) ||
            driver.email?.toLowerCase().includes(search)
        );
    }, [data, searchText]);

    if (loading) {
        return <Loading msg="Chargement des conducteurs..." />;
    }

    if (error) {
        return <div className="error-text">Erreur lors du chargement</div>;
    }

    return (
        <div className="select-driver-container">
            <Input
                placeholder="Rechercher un conducteur..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-driver-input"
            />

            {filteredDrivers.length === 0 ? (
                <Empty description="Aucun conducteur trouvé" />
            ) : (
                <List
                    className="driver-list"
                    itemLayout="horizontal"
                    dataSource={filteredDrivers}
                    renderItem={(driver: IDriver) => (
                        <List.Item
                            className="driver-list-item"
                            onClick={() => onSelect(driver)}
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={`${driver.firstName} ${driver.lastName}`}
                                description={driver.email}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
}
