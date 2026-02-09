'use client'

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Space, Modal, Slider, Empty } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { getUnixTime } from "date-fns";
import dayjs from "dayjs";
import classNames from "classnames";
import { IPath, IVehicle } from "@/lib/hooks/Interfaces";
import { PATHS_QUERY, COUNT_PATHS_QUERY } from "@/lib/graphql/queries";
import { Loading } from "@/components/Common/Loading";
import PathCard from "./PathCard";
import "./PathCards.css";

interface PathCardsProps {
    vehicle: IVehicle;
    dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

enum EnumKeyPath {
    distance = 'distance',
    duration = 'duration',
    averageSpeed = 'averageSpeed',
    fuel = 'fuel',
    electricConsumption = 'electricConsumption',
    consumption = 'consumption',
    electricConsumption100km = 'electricConsumption100km',
}

const getMinMaxExtrem = (paths: IPath[], key: EnumKeyPath) => {
    if (paths.length === 0) return { min: 0, max: 0 };
    const { min, max } = paths.reduce((acc: { min: number; max: number; }, path) => {
        const value = path[key] as number;
        if (value < acc.min) acc.min = value;
        if (value > acc.max) acc.max = value;
        return acc;
    }, { min: paths[0][key] as number, max: paths[0][key] as number });
    return { min, max };
};

export default function PathCards({ vehicle, dateRange }: PathCardsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const limit = 50;

    const [paths, setPaths] = useState<IPath[]>([]);
    const [offset, setOffset] = useState(0);
    const [allLoaded, setAllLoaded] = useState(false);

    // Filter states
    const [distanceMinMax, setDistanceMinMax] = useState<[number, number]>([0, 0]);
    const [distanceRange, setDistanceRange] = useState<[number, number]>(() => {
        const from = Number(searchParams.get('distancefrom'));
        const to = Number(searchParams.get('distanceto'));
        return (from || to) ? [from, to] : [0, 0];
    });
    const [modalDistanceRangeOpen, setModalDistanceRangeOpen] = useState(false);

    const [durationMinMax, setDurationMinMax] = useState<[number, number]>([0, 0]);
    const [durationRange, setDurationRange] = useState<[number, number]>(() => {
        const from = Number(searchParams.get('durationfrom'));
        const to = Number(searchParams.get('durationto'));
        return (from || to) ? [from, to] : [0, 0];
    });
    const [modalDurationRangeOpen, setModalDurationRangeOpen] = useState(false);

    const [averageSpeedMinMax, setAverageSpeedMinMax] = useState<[number, number]>([0, 0]);
    const [averageSpeedRange, setAverageSpeedRange] = useState<[number, number]>(() => {
        const from = Number(searchParams.get('averagespeedfrom'));
        const to = Number(searchParams.get('averagespeedto'));
        return (from || to) ? [from, to] : [0, 0];
    });
    const [modalAverageSpeedRangeOpen, setModalAverageSpeedRangeOpen] = useState(false);

    const [fuelMinMax, setFuelMinMax] = useState<[number, number]>([0, 0]);
    const [fuelRange, setFuelRange] = useState<[number, number]>(() => {
        const from = Number(searchParams.get('fuelfrom'));
        const to = Number(searchParams.get('fuelto'));
        return (from || to) ? [from, to] : [0, 0];
    });
    const [modalFuelRangeOpen, setModalFuelRangeOpen] = useState(false);

    const [consumptionMinMax, setConsumptionMinMax] = useState<[number, number]>([0, 0]);
    const [consumptionRange, setConsumptionRange] = useState<[number, number]>(() => {
        const from = Number(searchParams.get('consumptionfrom'));
        const to = Number(searchParams.get('consumptionto'));
        return (from || to) ? [from, to] : [0, 0];
    });
    const [modalConsumptionRangeOpen, setModalConsumptionRangeOpen] = useState(false);

    const from = getUnixTime(dateRange[0].toDate());
    const to = getUnixTime(dateRange[1].toDate());

    // Count query
    const { data: countData, loading: countLoading } = useQuery(COUNT_PATHS_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleIds: [vehicle.id],
            from,
            to,
        },
        context: { version: "php" },
    });

    const count = countData?.countPaths ?? 0;

    // Paths query
    const { data, loading, error } = useQuery(PATHS_QUERY, {
        fetchPolicy: "network-only",
        variables: {
            vehicleIds: [vehicle.id],
            from,
            to,
            offset,
            limit,
        },
        context: { version: "php" },
        skip: countLoading || count === 0,
    });

    // Accumulate paths when data arrives
    useEffect(() => {
        if (data?.paths) {
            const newPaths = data.paths as IPath[];

            if (offset === 0) {
                // First batch
                setPaths(newPaths);
            } else {
                // Append new paths, avoiding duplicates
                setPaths(prev => {
                    const combined = [...prev, ...newPaths];
                    const unique = combined.filter(
                        (item, index, self) => index === self.findIndex(t => t.id === item.id)
                    );
                    return unique;
                });
            }

            // Check if we need more data
            if (newPaths.length === limit && offset + limit < count) {
                setOffset(prev => prev + limit);
            } else {
                setAllLoaded(true);
            }
        }
    }, [data, offset, limit, count]);

    // Handle empty count
    useEffect(() => {
        if (!countLoading && count === 0) {
            setPaths([]);
            setAllLoaded(true);
        }
    }, [countLoading, count]);

    const updateSearchParams = useCallback((params: Record<string, string | null>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newSearchParams.delete(key);
            } else {
                newSearchParams.set(key, value);
            }
        });
        router.push(`${pathname}?${newSearchParams.toString()}`);
    }, [router, pathname, searchParams]);

    // Update min/max when all paths are loaded
    useEffect(() => {
        if (allLoaded && paths.length > 0) {
            const { min: minDistance, max: maxDistance } = getMinMaxExtrem(paths, EnumKeyPath.distance);
            setDistanceMinMax([Math.floor(minDistance), Math.ceil(maxDistance)]);
            setDistanceRange((cur) => (cur[0] === 0 && cur[1] === 0)
                ? [Math.floor(minDistance), Math.ceil(maxDistance)]
                : cur);

            const { min: minDuration, max: maxDuration } = getMinMaxExtrem(paths, EnumKeyPath.duration);
            setDurationMinMax([Math.floor(minDuration), Math.ceil(maxDuration)]);
            setDurationRange((cur) => (cur[0] === 0 && cur[1] === 0)
                ? [Math.floor(minDuration), Math.ceil(maxDuration)]
                : cur);

            const { min: minAverageSpeed, max: maxAverageSpeed } = getMinMaxExtrem(paths, EnumKeyPath.averageSpeed);
            setAverageSpeedMinMax([Math.floor(minAverageSpeed), Math.ceil(maxAverageSpeed)]);
            setAverageSpeedRange((cur) => (cur[0] === 0 && cur[1] === 0)
                ? [Math.floor(minAverageSpeed), Math.ceil(maxAverageSpeed)]
                : cur);

            const { min: minFuel, max: maxFuel } = getMinMaxExtrem(paths, EnumKeyPath.fuel);
            setFuelMinMax([Math.floor(minFuel), Math.ceil(maxFuel)]);
            setFuelRange((cur) => (cur[0] === 0 && cur[1] === 0)
                ? [Math.floor(minFuel), Math.ceil(maxFuel)]
                : cur);

            const { min: minConsumption, max: maxConsumption } = getMinMaxExtrem(paths, EnumKeyPath.consumption);
            setConsumptionMinMax([Math.floor(minConsumption), Math.ceil(maxConsumption)]);
            setConsumptionRange((cur) => (cur[0] === 0 && cur[1] === 0)
                ? [Math.floor(minConsumption), Math.ceil(maxConsumption)]
                : cur);
        }
    }, [allLoaded, paths]);

    const pathFiltered = useMemo(() => {
        return paths.filter(path => (
            ((distanceMinMax[0] === distanceRange[0] && distanceMinMax[1] === distanceRange[1]) ||
             (distanceRange[0] <= path.distance && distanceRange[1] >= path.distance)) &&
            ((durationMinMax[0] === durationRange[0] && durationMinMax[1] === durationRange[1]) ||
             (durationRange[0] <= path.duration && durationRange[1] >= path.duration)) &&
            ((averageSpeedMinMax[0] === averageSpeedRange[0] && averageSpeedMinMax[1] === averageSpeedRange[1]) ||
             (averageSpeedRange[0] <= path.averageSpeed && averageSpeedRange[1] >= path.averageSpeed)) &&
            ((fuelMinMax[0] === fuelRange[0] && fuelMinMax[1] === fuelRange[1]) ||
             (fuelRange[0] <= path.fuel && fuelRange[1] >= path.fuel)) &&
            ((consumptionMinMax[0] === consumptionRange[0] && consumptionMinMax[1] === consumptionRange[1]) ||
             (consumptionRange[0] <= path.consumption && consumptionRange[1] >= path.consumption))
        ));
    }, [paths, distanceRange, durationRange, averageSpeedRange, fuelRange, consumptionRange,
        distanceMinMax, durationMinMax, averageSpeedMinMax, fuelMinMax, consumptionMinMax]);

    // Filter handlers
    const onChangeDistanceRange = (value: number[]) => {
        setDistanceRange([value[0], value[1]]);
        updateSearchParams({
            distancefrom: value[0].toString(),
            distanceto: value[1].toString(),
        });
    };

    const onChangeDurationRange = (value: number[]) => {
        setDurationRange([value[0], value[1]]);
        updateSearchParams({
            durationfrom: value[0].toString(),
            durationto: value[1].toString(),
        });
    };

    const onChangeAverageSpeedRange = (value: number[]) => {
        setAverageSpeedRange([value[0], value[1]]);
        updateSearchParams({
            averagespeedfrom: value[0].toString(),
            averagespeedto: value[1].toString(),
        });
    };

    const onChangeFuelRange = (value: number[]) => {
        setFuelRange([value[0], value[1]]);
        updateSearchParams({
            fuelfrom: value[0].toString(),
            fuelto: value[1].toString(),
        });
    };

    const onChangeConsumptionRange = (value: number[]) => {
        setConsumptionRange([value[0], value[1]]);
        updateSearchParams({
            consumptionfrom: value[0].toString(),
            consumptionto: value[1].toString(),
        });
    };

    // Reset handlers
    const handleResetDistanceRange = () => {
        setDistanceRange(distanceMinMax);
        updateSearchParams({ distancefrom: null, distanceto: null });
    };

    const handleResetDurationRange = () => {
        setDurationRange(durationMinMax);
        updateSearchParams({ durationfrom: null, durationto: null });
    };

    const handleResetAverageSpeedRange = () => {
        setAverageSpeedRange(averageSpeedMinMax);
        updateSearchParams({ averagespeedfrom: null, averagespeedto: null });
    };

    const handleResetFuelRange = () => {
        setFuelRange(fuelMinMax);
        updateSearchParams({ fuelfrom: null, fuelto: null });
    };

    const handleResetConsumptionRange = () => {
        setConsumptionRange(consumptionMinMax);
        updateSearchParams({ consumptionfrom: null, consumptionto: null });
    };

    if (countLoading) {
        return <Loading msg="Chargement..." />;
    }

    if (loading || !allLoaded) {
        return (
            <Loading
                msg={count > 0 ? `Chargement des trajets... (${paths.length}/${count})` : 'Chargement des trajets...'}
            />
        );
    }

    if (error) {
        return <p>Erreur lors du chargement des trajets</p>;
    }

    return (
        <Space direction="vertical" className="path-cards">
            <Space className="filter-buttons" wrap>
                {/* Distance Filter */}
                <Button
                    className={classNames('filter-button', {
                        active: distanceRange[0] !== distanceMinMax[0] || distanceRange[1] !== distanceMinMax[1]
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalDistanceRangeOpen(true)}
                >
                    Distance
                </Button>
                <Modal
                    title="Distance"
                    className="icon-modal-box path-modal"
                    centered
                    open={modalDistanceRangeOpen}
                    onCancel={() => setModalDistanceRangeOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={handleResetDistanceRange}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalDistanceRangeOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <div className="modal-content">
                        <span>Km : </span>
                        <Slider
                            range
                            min={Math.floor(distanceMinMax[0])}
                            max={Math.ceil(distanceMinMax[1])}
                            value={distanceRange}
                            onChange={onChangeDistanceRange}
                        />
                    </div>
                </Modal>

                {/* Duration Filter */}
                <Button
                    className={classNames('filter-button', {
                        active: durationRange[0] !== durationMinMax[0] || durationRange[1] !== durationMinMax[1]
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalDurationRangeOpen(true)}
                >
                    Durée
                </Button>
                <Modal
                    title="Durée"
                    className="icon-modal-box path-modal"
                    centered
                    open={modalDurationRangeOpen}
                    onCancel={() => setModalDurationRangeOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={handleResetDurationRange}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalDurationRangeOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <div className="modal-content">
                        <span>Min : </span>
                        <Slider
                            range
                            min={Math.floor(durationMinMax[0])}
                            max={Math.ceil(durationMinMax[1])}
                            value={durationRange}
                            onChange={onChangeDurationRange}
                        />
                    </div>
                </Modal>

                {/* Average Speed Filter */}
                <Button
                    className={classNames('filter-button', {
                        active: averageSpeedRange[0] !== averageSpeedMinMax[0] || averageSpeedRange[1] !== averageSpeedMinMax[1]
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalAverageSpeedRangeOpen(true)}
                >
                    Vitesse moyenne
                </Button>
                <Modal
                    title="Vitesse moyenne"
                    className="icon-modal-box path-modal"
                    centered
                    open={modalAverageSpeedRangeOpen}
                    onCancel={() => setModalAverageSpeedRangeOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={handleResetAverageSpeedRange}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalAverageSpeedRangeOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <div className="modal-content">
                        <span>Km/h : </span>
                        <Slider
                            range
                            min={Math.floor(averageSpeedMinMax[0])}
                            max={Math.ceil(averageSpeedMinMax[1])}
                            value={averageSpeedRange}
                            onChange={onChangeAverageSpeedRange}
                        />
                    </div>
                </Modal>

                {/* Fuel Filter */}
                <Button
                    className={classNames('filter-button', {
                        active: fuelRange[0] !== fuelMinMax[0] || fuelRange[1] !== fuelMinMax[1]
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalFuelRangeOpen(true)}
                >
                    Conso totale
                </Button>
                <Modal
                    title="Conso totale"
                    className="icon-modal-box path-modal"
                    centered
                    open={modalFuelRangeOpen}
                    onCancel={() => setModalFuelRangeOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={handleResetFuelRange}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalFuelRangeOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <div className="modal-content">
                        <span>L : </span>
                        <Slider
                            range
                            min={Math.floor(fuelMinMax[0])}
                            max={Math.ceil(fuelMinMax[1])}
                            value={fuelRange}
                            onChange={onChangeFuelRange}
                        />
                    </div>
                </Modal>

                {/* Consumption Filter */}
                <Button
                    className={classNames('filter-button', {
                        active: consumptionRange[0] !== consumptionMinMax[0] || consumptionRange[1] !== consumptionMinMax[1]
                    })}
                    type="primary"
                    icon={<DownOutlined />}
                    iconPosition="end"
                    onClick={() => setModalConsumptionRangeOpen(true)}
                >
                    Conso moyenne
                </Button>
                <Modal
                    title="Conso moyenne"
                    className="icon-modal-box path-modal"
                    centered
                    open={modalConsumptionRangeOpen}
                    onCancel={() => setModalConsumptionRangeOpen(false)}
                    footer={[
                        <Button key="reinit" onClick={handleResetConsumptionRange}>
                            Réinitialiser
                        </Button>,
                        <Button
                            className="custom-button"
                            key="submit"
                            type="primary"
                            onClick={() => setModalConsumptionRangeOpen(false)}
                        >
                            Appliquer
                        </Button>,
                    ]}
                >
                    <div className="modal-content">
                        <span>L/100Km : </span>
                        <Slider
                            range
                            min={Math.floor(consumptionMinMax[0])}
                            max={Math.ceil(consumptionMinMax[1])}
                            value={consumptionRange}
                            onChange={onChangeConsumptionRange}
                        />
                    </div>
                </Modal>
            </Space>

            <Space className="w-100 d-flex justify-content-center" direction="horizontal" wrap>
                {pathFiltered.length > 0 ? (
                    pathFiltered.map((path: IPath) => (
                        <PathCard path={path} key={`path_${path.id}`} />
                    ))
                ) : (
                    <Empty
                        description="Aucun trajet disponible pour cette période ou ce filtre."
                        className="no-data-information"
                    />
                )}
            </Space>
        </Space>
    );
}
