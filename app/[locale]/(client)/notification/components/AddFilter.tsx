'use client'

import { useState } from "react";
import { Button, Checkbox, Modal, Select } from "antd";
import { DeleteOutlined, InboxOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface IAddFilterProps {
    handleSelectAll: () => void;
    isAllSelected: boolean;
    archiveSelection: () => Promise<any>;
    archiveAll: () => Promise<any>;
    inactive: boolean;
    setType: (type: string) => void;
    type: string;
    visibleArchive: boolean;
}

const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'ALERT', label: 'Alertes' },
    { value: 'WARNING', label: 'Avertissements' },
    { value: 'NOTICE', label: 'Informations' },
];

const AddFilter = (props: IAddFilterProps) => {
    const [modalSelectionOpen, setModalSelectionOpen] = useState(false);
    const [modalAllOpen, setModalAllOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleArchiveSelection = async () => {
        setLoading(true);
        try {
            await props.archiveSelection();
            setModalSelectionOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleArchiveAll = async () => {
        setLoading(true);
        try {
            await props.archiveAll();
            setModalAllOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-filter-container">
            <div className="add-filter-left">
                <Checkbox
                    checked={props.isAllSelected}
                    onChange={props.handleSelectAll}
                >
                    Tout sélectionner
                </Checkbox>

                <Select
                    value={props.type}
                    onChange={props.setType}
                    options={typeOptions}
                    style={{ width: 180 }}
                    className="type-select"
                />
            </div>

            {props.visibleArchive && (
                <div className="add-filter-right">
                    <Button
                        icon={<InboxOutlined />}
                        disabled={props.inactive}
                        onClick={() => setModalSelectionOpen(true)}
                    >
                        Archiver la sélection
                    </Button>

                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => setModalAllOpen(true)}
                        danger
                    >
                        Tout archiver
                    </Button>
                </div>
            )}

            {/* Modal confirmation archiver la sélection */}
            <Modal
                title={
                    <span>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        Archiver la sélection
                    </span>
                }
                open={modalSelectionOpen}
                onCancel={() => setModalSelectionOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalSelectionOpen(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={loading}
                        onClick={handleArchiveSelection}
                        className="custom-button"
                    >
                        Confirmer
                    </Button>,
                ]}
                centered
            >
                <p>Êtes-vous sûr de vouloir archiver les notifications sélectionnées ?</p>
            </Modal>

            {/* Modal confirmation tout archiver */}
            <Modal
                title={
                    <span>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Tout archiver
                    </span>
                }
                open={modalAllOpen}
                onCancel={() => setModalAllOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalAllOpen(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        danger
                        loading={loading}
                        onClick={handleArchiveAll}
                    >
                        Tout archiver
                    </Button>,
                ]}
                centered
            >
                <p>Êtes-vous sûr de vouloir archiver <strong>toutes</strong> les notifications ?</p>
                <p style={{ color: '#8c8c8c', fontSize: 13 }}>Cette action archivera toutes les notifications non archivées.</p>
            </Modal>
        </div>
    );
};

export default AddFilter;
