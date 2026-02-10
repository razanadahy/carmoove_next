'use client';

import { IUser, IVehicle } from "@/lib/hooks/Interfaces";
import { Button, DatePicker, Modal, Select, Space, Tag, Typography } from "antd";
import classNames from "classnames";
import { DownOutlined } from "@ant-design/icons";
import { ME_QUERY } from "@/lib/graphql/queries";
import { useQuery } from "@apollo/client";
import { getUnixTime, getYear } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { Loading } from "@/components/Common/Loading";
import StatGlobalList from "./StatGlobalList";
import ReactSwitch from "react-switch";
import "./StatGlobal.css";

export interface IFromTo {
    from: number;
    to: number;
}

interface IProps {
    user: IUser | null;
    vehicles: IVehicle[];
}

function StatGlobal({ user: propsUser, vehicles }: IProps) {
    const [isAutopartage, setIsAutopartage] = useState<boolean | null>(null);
    const [modalUsageOpen, setModalUsageOpen] = useState<boolean>(false);
    const [isNumber, setIsNumber] = useState<boolean>(true);
    const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [fromTo, setFromTo] = useState<IFromTo | null>(null);
    const { RangePicker } = DatePicker;

    const { loading, error, data } = useQuery(ME_QUERY);

    if (loading) {
        return <Loading msg="Chargement..." />;
    }
    if (error) {
        return <p>Error :(</p>;
    }

    const user: IUser = data.whoami;
    const month = user?.company ? user.company.fiscal_year.month - 1 : 0;

    const predefinedRanges: Record<string, [Dayjs, Dayjs]> = {
        "Aujourd'hui": [dayjs().startOf("day"), dayjs().endOf("day")],
        "Hier": [
            dayjs().subtract(1, "day").startOf("day"),
            dayjs().subtract(1, "day").endOf("day"),
        ],
        "Les 7 derniers jours": [dayjs().subtract(7, "day"), dayjs()],
        "Les 90 derniers jours": [dayjs().subtract(90, "day"), dayjs()],
        "Les 12 derniers mois": [dayjs().subtract(12, "month"), dayjs()],
        "Année civile en cours": [dayjs().startOf("year"), dayjs().endOf("year")],
        "Année fiscale en cours": [
            dayjs(new Date(getYear(new Date()), month, 1)),
            dayjs().endOf("day"),
        ],
    };

    const setDate = (from: Dayjs, to: Dayjs) => {
        setFromTo({
            from: getUnixTime(from.toDate()),
            to: getUnixTime(to.toDate()),
        });
    };

    const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || dates[0] === null || dates[1] === null) {
            setFromTo(null);
            return;
        }
        const from = dates[0];
        const to = dates[1];
        setPeriod([from, to]);
        setDate(from, to);
    };

    const handlePeriodChange = (value: string) => {
        if (value === undefined) {
            setFromTo(null);
            setPeriod([null, null]);
            return;
        }
        const from = predefinedRanges[value][0];
        const to = predefinedRanges[value][1];

        setPeriod([from, to]);
        setDate(from, to);
    };

    const handleUnity = () => {
        setIsNumber((prev) => !prev);
    };

    return (
        <div className="stat-global-container">
            <div className="stat-filters">
                <RangePicker
                    allowClear={true}
                    format="DD/MM/YYYY"
                    onCalendarChange={handleCalendarChange}
                    value={period}
                />
                <span className="period-label">ou sélection d&apos;une période :</span>
                <span className="select-box">
          <Select
              allowClear
              style={{ width: "200px" }}
              variant="borderless"
              onChange={(value) => handlePeriodChange(value)}
              placeholder="Sélectionner une période"
          >
            {Object.keys(predefinedRanges).map((key) => (
                <Select.Option key={key} value={key}>
                    {key}
                </Select.Option>
            ))}
          </Select>
        </span>
            </div>

            <Space className="filter-buttons">
                <Button
                    className={classNames("filter-button", {
                        active: isAutopartage !== null,
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalUsageOpen(true)}
                >
                    Usage
                </Button>

                <Modal
                    title="Usage"
                    className="icon-modal-box"
                    centered
                    open={modalUsageOpen}
                    onCancel={() => setModalUsageOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={() => setIsAutopartage(null)}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalUsageOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <Tag.CheckableTag
                        className="option-tag-btn"
                        key="autopartage"
                        checked={isAutopartage !== null && isAutopartage}
                        onChange={() => setIsAutopartage(true)}
                    >
                        Autopartage
                    </Tag.CheckableTag>
                    <Tag.CheckableTag
                        className="option-tag-btn"
                        key="individuel"
                        checked={isAutopartage !== null && !isAutopartage}
                        onChange={() => setIsAutopartage(false)}
                    >
                        Individuel
                    </Tag.CheckableTag>
                </Modal>

                <div className="switch-mode-view">
                    <Typography.Text className="typo">%</Typography.Text>

                    <ReactSwitch
                        checked={isNumber}
                        onChange={handleUnity}
                        onColor="#3AA1D8"
                        offColor="#3AA1D8"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        checkedHandleIcon={
                            <span className="icon-check-box">
                <i className="icofont-check-alt"></i>
              </span>
                        }
                        uncheckedHandleIcon={
                            <span className="icon-check-box">
                <i className="icofont-check-alt"></i>
              </span>
                        }
                        className="react-switch"
                    />

                    <Typography.Text className="typo">#</Typography.Text>
                </div>
            </Space>

            <div className="stats-show-container">
                {fromTo !== null ? (
                    <StatGlobalList
                        from={fromTo.from}
                        to={fromTo.to}
                        isNumber={isNumber}
                        isAutopartage={isAutopartage}
                        vehicles={
                            isAutopartage ? vehicles.map((vehicle) => vehicle.id) : []
                        }
                    />
                ) : (
                    <div className="no-data-info">
                        <div className="data-info">
                            <p>
                                Accédez ici aux données consolidées de votre flotte et par
                                catégorie de véhicule. Seront accessibles, un ensemble de
                                données génériques, ainsi qu&apos;un focus sur la consommation
                                d&apos;énergie et les emissions de CO2.
                            </p>
                            <p>
                                Définissez une période et l&apos;usage afin d&apos;obtenir les
                                données correspondantes.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatGlobal;
