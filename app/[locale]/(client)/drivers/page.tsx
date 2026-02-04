"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import { Input, Button, Spin, Tag } from "antd";
import { UserOutlined, PlusOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { DRIVERS_QUERY } from "@/lib/graphql/queries";
import { IDriver } from "@/lib/hooks/Interfaces";
import Link from "next/link";
import AddDriverModal from "./components/AddDriverModal";

import "./Drivers.css";

export default function Drivers() {
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    const { loading, error, data } = useQuery(DRIVERS_QUERY, {
        pollInterval: 0,
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip="Chargement des conducteurs...">
                    <div style={{ height: '200px' }} />
                </Spin>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>Erreur lors du chargement des conducteurs</p>
            </div>
        );
    }

    const drivers: IDriver[] = JSON.parse(JSON.stringify(data.drivers));

    // Tri par nom et prénom
    drivers.sort((a: IDriver, b: IDriver) => {
        if (a.lastName < b.lastName) return -1;
        if (a.lastName > b.lastName) return 1;
        if (a.firstName < b.firstName) return -1;
        if (a.firstName > b.firstName) return 1;
        return 0;
    });

    // Filtrage par recherche
    const regExp = new RegExp(searchText, "gi");
    const filteredDrivers = drivers.filter((driver: IDriver) =>
        driver.firstName.match(regExp) || driver.lastName.match(regExp)
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
            className="drivers-page"
        >
            <div className="search-box mb-4">
                <Input
                    size="large"
                    placeholder="Rechercher un conducteur"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    prefix={<UserOutlined />}
                    allowClear
                />
            </div>

            <div className="drivers-list">
                {filteredDrivers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                        {searchText ? 'Aucun conducteur trouvé' : 'Aucun conducteur'}
                    </div>
                ) : (
                    filteredDrivers.map((driver: IDriver) => (
                        <Link
                            href={`/driver/${driver.driverID}?panel=infos`}
                            key={driver.driverID}
                            className="driver-row"
                        >
                            <div className="driver-row-content">
                                <div className="driver-name">
                                    <UserOutlined style={{ marginRight: '8px' }} />
                                    {driver.firstName} {driver.lastName}
                                </div>

                                <div className="driver-status">
                                    {/* Smart Géolocalisation */}
                                    <Tag color={driver.privacy ? "blue" : "green"}>
                                        <EnvironmentOutlined />
                                        {driver.privacy ? "Smart Géo" : "Géo permanente"}
                                    </Tag>

                                    {/* Statut du compte */}
                                    {driver.accountCreated ? (
                                        driver.accountEnabled ? (
                                            <Tag color="success">Compte actif</Tag>
                                        ) : (
                                            <Tag color="error">Compte désactivé</Tag>
                                        )
                                    ) : (
                                        <Tag color="default">Pas de compte</Tag>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <div className="footer-add-btn-box">
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                    style={{ backgroundColor: 'rgba(1, 66, 106, 1)' }}
                >
                    Ajouter 1 conducteur
                </Button>
            </div>

            <AddDriverModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
            />
        </motion.div>
    );
}
