'use client'

import { Dispatch, SetStateAction, useState } from "react";
import { Button, Modal, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Image from "next/image";

interface IStatusFilters {
    connected: boolean;
    notConnected: boolean;
    noPrivacy: boolean;
    privacy: boolean;
    inCharge: boolean;
    parked: boolean;
    engineOn: boolean;
    ras: boolean;
    fault: boolean;
    maintenance: boolean;
    accident: boolean;
    towage: boolean;
    stolen: boolean;
    lowBatt: boolean;
    unavailable: boolean;
    available: boolean;
    unreserved: boolean;
    reserved: boolean;
    lowCharge: boolean;
    lowFuel: boolean;
}

interface IStatusFilterModalProps {
    filters: IStatusFilters;
    setFilters: Dispatch<SetStateAction<IStatusFilters>>;
    isActive: boolean;
}

const StatusFilterModal = ({ filters, setFilters, isActive }: IStatusFilterModalProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const updateFilter = (key: keyof IStatusFilters, value: boolean) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // Handle filter dependencies
            if (key === 'connected' && value) {
                newFilters.notConnected = false;
            }
            if (key === 'notConnected' && value) {
                newFilters.connected = false;
                newFilters.privacy = false;
                newFilters.noPrivacy = false;
                newFilters.inCharge = false;
                newFilters.parked = false;
                newFilters.engineOn = false;
            }
            if (key === 'noPrivacy' && value) {
                newFilters.privacy = false;
                newFilters.connected = true;
                newFilters.notConnected = false;
            }
            if (key === 'privacy' && value) {
                newFilters.noPrivacy = false;
                newFilters.connected = true;
                newFilters.notConnected = false;
            }
            if (key === 'inCharge' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.parked = false;
                newFilters.engineOn = false;
            }
            if (key === 'parked' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.inCharge = false;
                newFilters.engineOn = false;
            }
            if (key === 'engineOn' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.inCharge = false;
                newFilters.parked = false;
            }
            if (key === 'ras' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.fault = false;
                newFilters.maintenance = false;
                newFilters.accident = false;
                newFilters.towage = false;
                newFilters.stolen = false;
            }
            if (key === 'unavailable' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.available = false;
                newFilters.reserved = false;
                newFilters.unreserved = false;
            }
            if (key === 'available' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.unavailable = false;
            }
            if (key === 'reserved' && value) {
                newFilters.available = true;
                newFilters.unavailable = false;
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.unreserved = false;
            }
            if (key === 'unreserved' && value) {
                newFilters.available = true;
                newFilters.unavailable = false;
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.reserved = false;
            }
            if (key === 'lowCharge' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.lowFuel = false;
            }
            if (key === 'lowFuel' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
                newFilters.lowCharge = false;
            }
            if (key === 'lowBatt' && value) {
                newFilters.connected = true;
                newFilters.notConnected = false;
            }

            return newFilters;
        });
    };

    const reinitAllStatusTags = () => {
        setFilters({
            connected: false,
            notConnected: false,
            noPrivacy: false,
            privacy: false,
            inCharge: false,
            parked: false,
            engineOn: false,
            ras: false,
            fault: false,
            maintenance: false,
            accident: false,
            towage: false,
            stolen: false,
            lowBatt: false,
            unavailable: false,
            available: false,
            unreserved: false,
            reserved: false,
            lowCharge: false,
            lowFuel: false,
        });
    };

    return (
        <>
            <Button
                className={`filter-button ${isActive ? 'active' : ''}`}
                type="primary"
                icon={<DownOutlined />}
                iconPosition="end"
                onClick={() => setModalOpen(true)}
            >
                Statut
            </Button>

            <Modal
                title="Statut"
                className="icon-modal-box status-modal"
                centered
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={[
                    <Button key="reinit" onClick={reinitAllStatusTags}>
                        Réinitialiser
                    </Button>,
                    <Button
                        className="custom-button"
                        key="submit"
                        type="primary"
                        onClick={() => setModalOpen(false)}
                    >
                        Appliquer
                    </Button>,
                ]}
                width={600}
            >
                <div className="status-tags-container">
                    {/* Disponibilité */}
                    <div className="status-group">
                        <h4>Disponibilité</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.unavailable}
                                onChange={(checked) => updateFilter('unavailable', checked)}
                            >
                                <span className="tag-icon unavailable-icon"></span>
                                <span>Indisponible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.available}
                                onChange={(checked) => updateFilter('available', checked)}
                            >
                                <span className="tag-icon available-icon"></span>
                                <span>Disponible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.unreserved}
                                onChange={(checked) => updateFilter('unreserved', checked)}
                            >
                                <span className="tag-icon unreserved-icon"></span>
                                <span>Non réservé</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.reserved}
                                onChange={(checked) => updateFilter('reserved', checked)}
                            >
                                <span className="tag-icon reserved-icon"></span>
                                <span>Réservé</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>

                    {/* Connexion */}
                    <div className="status-group">
                        <h4>Connexion</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.connected}
                                onChange={(checked) => updateFilter('connected', checked)}
                            >
                                <span className="tag-icon connected-icon"></span>
                                <span>Connecté</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.notConnected}
                                onChange={(checked) => updateFilter('notConnected', checked)}
                            >
                                <span className="tag-icon not-connected-icon"></span>
                                <span>Non connecté</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>

                    {/* Géolocalisation */}
                    <div className="status-group">
                        <h4>Géolocalisation</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.noPrivacy}
                                onChange={(checked) => updateFilter('noPrivacy', checked)}
                            >
                                <span className="tag-icon no-privacy-icon"></span>
                                <span>Localisé en permanence</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.privacy}
                                onChange={(checked) => updateFilter('privacy', checked)}
                            >
                                <span className="tag-icon privacy-icon"></span>
                                <span>Smart géolocalisé</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>

                    {/* État du véhicule */}
                    <div className="status-group">
                        <h4>État du véhicule</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.inCharge}
                                onChange={(checked) => updateFilter('inCharge', checked)}
                            >
                                <span className="tag-icon charge-icon"></span>
                                <span>En charge</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.parked}
                                onChange={(checked) => updateFilter('parked', checked)}
                            >
                                <span className="tag-icon parked-icon"></span>
                                <span>En stationnement</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.engineOn}
                                onChange={(checked) => updateFilter('engineOn', checked)}
                            >
                                <span className="tag-icon engine-icon"></span>
                                <span>En déplacement</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>

                    {/* Anomalies */}
                    <div className="status-group">
                        <h4>Anomalies</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.ras}
                                onChange={(checked) => updateFilter('ras', checked)}
                            >
                                <span className="tag-icon ras-icon"></span>
                                <span>Aucune anomalie</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.lowBatt}
                                onChange={(checked) => updateFilter('lowBatt', checked)}
                            >
                                <span className="tag-icon low-batt-icon"></span>
                                <span>Batterie faible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.fault}
                                onChange={(checked) => updateFilter('fault', checked)}
                            >
                                <span className="tag-icon fault-icon"></span>
                                <span>Code défaut</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.maintenance}
                                onChange={(checked) => updateFilter('maintenance', checked)}
                            >
                                <span className="tag-icon maintenance-icon"></span>
                                <span>Entretien nécessaire</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.accident}
                                onChange={(checked) => updateFilter('accident', checked)}
                            >
                                <span className="tag-icon accident-icon"></span>
                                <span>Accidenté</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.towage}
                                onChange={(checked) => updateFilter('towage', checked)}
                            >
                                <span className="tag-icon towage-icon"></span>
                                <span>En fourrière</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.stolen}
                                onChange={(checked) => updateFilter('stolen', checked)}
                            >
                                <span className="tag-icon stolen-icon"></span>
                                <span>Volé</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>

                    {/* Niveaux */}
                    <div className="status-group">
                        <h4>Niveaux</h4>
                        <div className="status-tags">
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.lowCharge}
                                onChange={(checked) => updateFilter('lowCharge', checked)}
                            >
                                <span className="tag-icon low-charge-icon"></span>
                                <span>Charge faible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.lowFuel}
                                onChange={(checked) => updateFilter('lowFuel', checked)}
                            >
                                <span className="tag-icon low-fuel-icon"></span>
                                <span>Carburant faible</span>
                            </Tag.CheckableTag>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default StatusFilterModal;
