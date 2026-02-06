'use client'

import { Dispatch, SetStateAction, useState } from "react";
import { Button, Modal, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Image from "next/image";
import unavailable_i from "@/assets/image/vehicle/unavailable.svg";
import icon_inCharge from "@/assets/image/statut/new/charging.svg";
import icon_fault from "@/assets/image/statut/new/warning.svg";
import icon_stolen from "@/assets/image/statut/new/theft.svg";
import icon_towage from "@/assets/image/statut/new/impound.svg";
import icon_maintenance from "@/assets/image/statut/new/service.svg";
import icon_accident from "@/assets/image/statut/new/damaged.svg";
import icon_low_battery from "@/assets/image/statut/new/battery-down.svg";
import available_i from "@/assets/image/vehicle/available.svg";
import reserved_i from "@/assets/image/dashboard/reserved.svg";
import unreserved_i from "@/assets/image/dashboard/unreserved.svg";
import lowCharge_i from "@/assets/image/dashboard/low-charge.svg";
import lowFuel_i from "@/assets/image/dashboard/low-fuel.svg";
import "./StatusFilterModal.css";
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
                                <span className="tag-icon">
                                    <Image src={unavailable_i} alt="unavailable" />
                                </span>
                                <span className="h-100">Indisponible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.available}
                                onChange={(checked) => updateFilter('available', checked)}
                            >
                                <span className="tag-icon">
                                     <Image src={available_i} alt="available" />
                                </span>
                                <span>Disponible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.unreserved}
                                onChange={(checked) => updateFilter('unreserved', checked)}
                            >
                                <span className="tag-icon">
                                     <Image alt="unreserved" src={unreserved_i}/>
                                </span>
                                <span>Non réservé</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.reserved}
                                onChange={(checked) => updateFilter('reserved', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt="reserved" src={reserved_i}/>
                                </span>
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
                                <span className="tag-icon">
                                    <svg width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <title>Components/Radio/Connected</title>
                                        <g id="Components/Radio/Connected" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <circle id="Oval" stroke="#01426A" stroke-width="1.5" cx="13" cy="13" r="12.25"></circle>
                                            <path d="M20.1111111,6.77777778 L20.1111111,5.88888889 C20.1111111,5.4 19.7111111,5 19.2222222,5 L17.4444444,5 C16.9555556,5 16.5555556,5.4 16.5555556,5.88888889 L16.5555556,6.77777778 L16.5555556,6.77777778 C16.0666667,6.77777778 15.6666667,7.17777778 15.6666667,7.66666667 L15.6666667,10.3333333 C15.6666667,10.8222222 16.0666667,11.2222222 16.5555556,11.2222222 L17.4444444,11.2222222 L17.4444444,17.3644444 C17.4444444,18.2888889 16.7688889,19.1244444 15.8533333,19.2133333 C14.7866667,19.32 13.8888889,18.4844444 13.8888889,17.4444444 L13.8888889,8.68 C13.8888889,6.78666667 12.4577778,5.13333333 10.5644444,5.00888889 C8.49333333,4.87555556 6.77777778,6.51111111 6.77777778,8.55555556 L6.77777778,14.7777778 L5.88888889,14.7777778 C5.4,14.7777778 5,15.1777778 5,15.6666667 L5,18.3333333 C5,18.8222222 5.4,19.2222222 5.88888889,19.2222222 L5.88888889,19.2222222 L5.88888889,20.1111111 C5.88888889,20.6 6.28888889,21 6.77777778,21 L8.55555556,21 C9.04444444,21 9.44444444,20.6 9.44444444,20.1111111 L9.44444444,19.2222222 L9.44444444,19.2222222 C9.93333333,19.2222222 10.3333333,18.8222222 10.3333333,18.3333333 L10.3333333,15.6666667 C10.3333333,15.1777778 9.93333333,14.7777778 9.44444444,14.7777778 L8.55555556,14.7777778 L8.55555556,8.63555556 C8.55555556,7.71111111 9.23111111,6.87555556 10.1466667,6.78666667 C11.2133333,6.68 12.1111111,7.51555556 12.1111111,8.55555556 L12.1111111,17.32 C12.1111111,19.2133333 13.5422222,20.8666667 15.4355556,20.9911111 C17.5066667,21.1244444 19.2222222,19.4888889 19.2222222,17.4444444 L19.2222222,11.2222222 L20.1111111,11.2222222 C20.6,11.2222222 21,10.8222222 21,10.3333333 L21,7.66666667 C21,7.17777778 20.6,6.77777778 20.1111111,6.77777778 L20.1111111,6.77777778 Z" id="Path" fill="#01426A"></path>
                                        </g>
                                    </svg>
                                </span>
                                <span>Connecté</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.notConnected}
                                onChange={(checked) => updateFilter('notConnected', checked)}
                            >
                                <span className="tag-icon">
                                    <svg width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <title>Components/Radio/Not-connected</title>
                                        <g id="Components/Radio/Not-connected" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <circle id="Oval" stroke="#01426A" stroke-width="1.5" cx="13" cy="13" r="12.25"></circle>
                                            <path d="M20.1111111,6.77777778 L20.1111111,5.88888889 C20.1111111,5.4 19.7111111,5 19.2222222,5 L17.4444444,5 C16.9555556,5 16.5555556,5.4 16.5555556,5.88888889 L16.5555556,6.77777778 L16.5555556,6.77777778 C16.0666667,6.77777778 15.6666667,7.17777778 15.6666667,7.66666667 L15.6666667,10.3333333 C15.6666667,10.8222222 16.0666667,11.2222222 16.5555556,11.2222222 L17.4444444,11.2222222 L17.4444444,17.3644444 C17.4444444,18.2888889 16.7688889,19.1244444 15.8533333,19.2133333 C14.7866667,19.32 13.8888889,18.4844444 13.8888889,17.4444444 L13.8888889,8.68 C13.8888889,6.78666667 12.4577778,5.13333333 10.5644444,5.00888889 C8.49333333,4.87555556 6.77777778,6.51111111 6.77777778,8.55555556 L6.77777778,14.7777778 L5.88888889,14.7777778 C5.4,14.7777778 5,15.1777778 5,15.6666667 L5,18.3333333 C5,18.8222222 5.4,19.2222222 5.88888889,19.2222222 L5.88888889,19.2222222 L5.88888889,20.1111111 C5.88888889,20.6 6.28888889,21 6.77777778,21 L8.55555556,21 C9.04444444,21 9.44444444,20.6 9.44444444,20.1111111 L9.44444444,19.2222222 L9.44444444,19.2222222 C9.93333333,19.2222222 10.3333333,18.8222222 10.3333333,18.3333333 L10.3333333,15.6666667 C10.3333333,15.1777778 9.93333333,14.7777778 9.44444444,14.7777778 L8.55555556,14.7777778 L8.55555556,8.63555556 C8.55555556,7.71111111 9.23111111,6.87555556 10.1466667,6.78666667 C11.2133333,6.68 12.1111111,7.51555556 12.1111111,8.55555556 L12.1111111,17.32 C12.1111111,19.2133333 13.5422222,20.8666667 15.4355556,20.9911111 C17.5066667,21.1244444 19.2222222,19.4888889 19.2222222,17.4444444 L19.2222222,11.2222222 L20.1111111,11.2222222 C20.6,11.2222222 21,10.8222222 21,10.3333333 L21,7.66666667 C21,7.17777778 20.6,6.77777778 20.1111111,6.77777778 L20.1111111,6.77777778 Z" id="Path" fill="#01426A"></path>
                                            <line x1="5" y1="25.1067413" x2="21.1203296" y2="1" id="Path-2" stroke="#E9445A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(13.0602, 13.0534) scale(-1, 1) translate(-13.0602, -13.0534)"></line>
                                        </g>
                                    </svg>
                                </span>
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
                                <span className="tag-icon">
                                    <svg width="25px" height="25px" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <title>icones/content/location-off-ionic 2</title>
                                        <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                            <g id="icones/status-icons/geoloc-on" transform="translate(-1, -2)" stroke="#01426A" stroke-width="1.66133333">
                                                <g id="icones/content/location-off-ionic" transform="translate(6.3571, 3.7857)">
                                                    <g id="location-outline" transform="translate(0, -0)">
                                                        <path d="M7.58928571,0 C3.39936756,0 0,3.16241657 0,7.05735576 C0,11.5390342 5.05952381,18.6412068 6.91731771,21.0942818 C7.07373551,21.3043214 7.32349511,21.4285714 7.58928571,21.4285714 C7.85507632,21.4285714 8.10483592,21.3043214 8.26125372,21.0942818 C10.1190476,18.642237 15.1785714,11.5426402 15.1785714,7.05735576 C15.1785714,3.16241657 11.7792039,0 7.58928571,0 Z" id="Path"></path><ellipse id="Oval" cx="7.58928571" cy="7.41795058" rx="2.5297619" ry="2.47265019"></ellipse>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                </span>
                                <span>Localisé en permanence</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.privacy}
                                onChange={(checked) => updateFilter('privacy', checked)}
                            >
                                <span className="tag-icon">
                                     <svg width="25px" height="25px" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                         <title>icones/content/location-off-ionic</title>
                                         <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                             <g id="icones/status-icons/geoloc-off" transform="translate(-1, -2)">
                                                 <g id="icones/content/location-off-ionic" transform="translate(6.3571, 3.2419)">
                                                     <g id="location-outline" transform="translate(0, 0.5438)" stroke="#01426A" stroke-width="1.66133333">
                                                         <path d="M7.58928571,0 C3.39936756,0 0,3.16241657 0,7.05735576 C0,11.5390342 5.05952381,18.6412068 6.91731771,21.0942818 C7.07373551,21.3043214 7.32349511,21.4285714 7.58928571,21.4285714 C7.85507632,21.4285714 8.10483592,21.3043214 8.26125372,21.0942818 C10.1190476,18.642237 15.1785714,11.5426402 15.1785714,7.05735576 C15.1785714,3.16241657 11.7792039,0 7.58928571,0 Z" id="Path"></path>
                                                         <ellipse id="Oval" cx="7.58928571" cy="7.41795058" rx="2.5297619" ry="2.47265019"></ellipse>
                                                     </g>
                                                     <line x1="0.0736777772" y1="22.4188289" x2="14.7321429" y2="4.4408921e-16" id="Path-2" stroke="#E9445A" stroke-width="1.78" transform="translate(7.4029, 11.2094) scale(-1, 1) translate(-7.4029, -11.2094)"></line>
                                                 </g>
                                             </g>
                                         </g>
                                     </svg>
                                </span>
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
                                <span className="tag-icon">
                                    <Image alt={"icon_incharge"} src={icon_inCharge}/>
                                </span>
                                <span>En charge</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.parked}
                                onChange={(checked) => updateFilter('parked', checked)}
                            >
                                <span className="tag-icon">
                                    <svg width="26" height="26">
                                        <path fill="none" stroke="#01426A" stroke-width="0.93913043" stroke-linejoin="round"
                                              transform="translate(1 1)"
                                              d="M3.7037036 24L20.296297 24C22.370371 24 24 22.370371 24 20.296297L24 3.7037036C24 1.6296296 22.370371 0 20.296297 0L3.7037036 0C1.6296296 0 0 1.6296296 0 3.7037036L0 20.296297C0 22.222221 1.6296296 24 3.7037036 24Z"
                                              fill-rule="evenodd"/>
                                        <path fill="#01426A" transform="translate(7 4)"
                                              d="M3.9355469 18.560547L3.9355469 11.958984L5.6240234 11.958984C7.9261069 11.958984 9.701335 11.430013 10.949707 10.37207C12.198079 9.3141279 12.822266 7.7864585 12.822266 5.7890625C12.822266 3.8678386 12.236165 2.4226887 11.063965 1.4536133C9.8917646 0.48453775 8.1800127 0 5.9287109 0L5.9287109 0L0 0L0 18.560547L3.9355469 18.560547ZM5.2304688 8.734375L3.9355469 8.734375L3.9355469 3.2246094L5.7255859 3.2246094C6.8004556 3.2246094 7.5896811 3.4446614 8.0932617 3.8847656C8.5968428 4.3248696 8.8486328 5.0061851 8.8486328 5.9287109C8.8486328 6.8427734 8.5481768 7.5388999 7.9472656 8.0170898C7.346354 8.4952803 6.4407554 8.734375 5.2304688 8.734375L5.2304688 8.734375Z"
                                              fill-rule="evenodd"/>
                                    </svg>
                                </span>
                                <span>En stationnement</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.engineOn}
                                onChange={(checked) => updateFilter('engineOn', checked)}
                            >
                                <span className="tag-icon">
                                    <svg width="28" height="26">
                                        <path fill="#01426A" transform="translate(0.15332 9)" d="M18.402439 2.7625899L17.781843 2.7625899C17.471546 2.7625899 17.161249 2.6474819 16.91301 2.4172661L14.616806 0.40287769C14.368567 0.17266187 13.99621 0 13.623853 0L8.8452663 0C8.472909 0 8.1005507 0.11510792 7.7902532 0.34532374L3.8184407 3.0503597C3.632262 3.1654677 3.3840237 3.2805755 3.1357856 3.3381295L0.90164095 3.6258993C0.65340263 3.6834533 0.40516436 3.7985611 0.21898566 3.9712231C0.1569261 4.0863309 -0.15337177 4.6618705 0.094866522 5.3525181C0.28104523 5.9856114 0.46722394 6.2733812 0.5913431 6.3309355C0.65340263 6.3309355 1.0257601 6.3884892 1.0878197 6.3884892C1.0878197 6.3884892 1.0878197 6.446043 1.0878197 6.446043C1.0878197 7.3093524 1.8325344 8 2.763428 8L3.0737259 8C4.0046196 8 4.7493343 7.3093524 4.7493343 6.446043C4.7493343 6.446043 4.7493343 6.3884892 4.7493343 6.3884892L13.810032 6.3884892C13.810032 6.3884892 13.810032 6.446043 13.810032 6.446043C13.810032 7.3093524 14.554747 8 15.48564 8L15.795938 8C16.726831 8 17.471546 7.3093524 17.471546 6.446043C17.471546 6.446043 17.471546 6.3884892 17.471546 6.3884892L18.402439 6.3884892C18.898916 6.3884892 19.333334 5.9856114 19.333334 5.5251799L19.333334 3.6258993C19.333334 3.1654677 18.898916 2.7625899 18.402439 2.7625899ZM12.506781 2.9352517L6.114645 2.9352517C5.9284663 2.9352517 5.804347 2.7050359 5.9905257 2.5899282L8.162611 0.69064748C8.2246704 0.63309354 8.2246704 0.63309354 8.2867298 0.63309354L11.700006 0.63309354C11.762066 0.63309354 11.886185 0.69064748 11.886185 0.74820143L12.692959 2.6474819C12.755019 2.7625899 12.692959 2.9352517 12.506781 2.9352517Z" fill-rule="evenodd"/>
                                        <path fill="#01426A" transform="translate(20.2922 11.4)" d="M5.746479 0.80000001L0.21126761 0.80000001C0.084507041 0.80000001 0 0.63999999 0 0.40000001C0 0.16 0.084507041 0 0.21126761 0L5.7887325 0C5.915493 0 6 0.16 6 0.40000001C6 0.63999999 5.8732395 0.80000001 5.746479 0.80000001Z" fill-rule="evenodd"/>
                                        <path fill="#01426A" transform="translate(23.2133 13)" d="M2.8514853 0.80000001L0.14851485 0.80000001C0.059405942 0.80000001 0 0.63999999 0 0.40000001C0 0.16 0.059405942 0 0.14851485 0L2.8514853 0C2.940594 0 3 0.16 3 0.40000001C3 0.63999999 2.9108911 0.80000001 2.8514853 0.80000001Z" fill-rule="evenodd"/>
                                        <path fill="#01426A" transform="translate(20.2922 14.6)" d="M5.7692308 0.80000001L0.23076923 0.80000001C0.092307694 0.80000001 0 0.63999999 0 0.40000001C0 0.16 0.092307694 0 0.23076923 0L5.7692308 0C5.9076924 0 6 0.16 6 0.40000001C6 0.63999999 5.8615384 0.80000001 5.7692308 0.80000001Z" fill-rule="evenodd"/>
                                    </svg>
                                </span>
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
                                <span className="tag-icon">
                                     <svg width="26px" height="26px" viewBox="0 0 26 26" version="1.1">
                                         <g id="Components/Radio/On-green" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                             <g id="V2" stroke="#01426A">
                                                 <circle id="Oval" stroke-width="1.5" cx="13" cy="13" r="12.25"></circle>
                                                 <polyline id="Path-3" stroke-width="3" stroke-linecap="round" points="7 13.9230769 10.7894737 17 19 9"></polyline>
                                             </g>
                                         </g>
                                     </svg>
                                </span>
                                <span>Aucune anomalie</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.lowBatt}
                                onChange={(checked) => updateFilter('lowBatt', checked)}
                            >
                                <span className="tag-icon">
                                    <Image src={icon_low_battery} alt="icon_low_battery"/>
                                </span>
                                <span>Batterie faible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.fault}
                                onChange={(checked) => updateFilter('fault', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"icon_fault"} src={icon_fault}/>
                                </span>
                                <span>Code défaut</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.maintenance}
                                onChange={(checked) => updateFilter('maintenance', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"icon_maintenance"} src={icon_maintenance}/>
                                </span>
                                <span>Entretien nécessaire</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.accident}
                                onChange={(checked) => updateFilter('accident', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"icon_accident"} src={icon_accident}/>
                                </span>
                                <span>Accidenté</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.towage}
                                onChange={(checked) => updateFilter('towage', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"icon_towage"} src={icon_towage}/>
                                </span>
                                <span>En fourrière</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.stolen}
                                onChange={(checked) => updateFilter('stolen', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"icon_stolen"} src={icon_stolen}/>
                                </span>
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
                                <span className="tag-icon">
                                    <Image alt={"lowCharge_i"} src={lowCharge_i}/>
                                </span>
                                <span>Charge faible</span>
                            </Tag.CheckableTag>
                            <Tag.CheckableTag
                                className="option-tag-btn"
                                checked={filters.lowFuel}
                                onChange={(checked) => updateFilter('lowFuel', checked)}
                            >
                                <span className="tag-icon">
                                    <Image alt={"lowFuel_i"} src={lowFuel_i}/>
                                </span>
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
