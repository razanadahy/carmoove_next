"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getParkings } from "@/app/actions/parkingServices";
import { IParking } from "@/lib/hooks/Interfaces";
import { Button, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ParkingRow from "./ParkingRow";
import AddParkingModal from "./AddParkingModal";

export default function ParkingList() {
    const [modalOpen, setModalOpen] = useState(false);

    const qParkings = useQuery({
        queryKey: ['parkings'],
        queryFn: () => getParkings()
    });

    if (qParkings.isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Chargement...">
                    <div style={{ height: '100px' }} />
                </Spin>
            </div>
        );
    }

    if (qParkings.error) {
        console.error(qParkings.error);
        return <p>Erreur lors du chargement des stationnements</p>;
    }

    const parkings: IParking[] = qParkings.data?.parkings ?? [];

    return (
        <div>
            <div className="parking-list mb-4">
                {parkings.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        Aucun stationnement disponible
                    </p>
                ) : (
                    parkings.map((parking, index) => (
                        <ParkingRow
                            parking={parking}
                            key={parking.id}
                            index={index + 1}
                        />
                    ))
                )}
            </div>
            <Button
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                style={{ textTransform: 'uppercase',  backgroundColor: 'rgba(1, 66, 106, 1)', color: 'white' }}
            >
                Ajouter un emplacement
            </Button>

            <AddParkingModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
