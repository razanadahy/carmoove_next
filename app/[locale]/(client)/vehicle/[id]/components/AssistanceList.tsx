'use client'

import React, { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { App, Spin } from "antd";
import { NOMENCLATURE_QUERY } from "@/lib/graphql/queries";
import { REGISTER_ASSISTANCE } from "@/lib/graphql/mutation";
import { VEHICLES_QUERY } from "@/lib/graphql/queries";
import "./AssistanceList.css";
import {useGetInsurances, useRegisterAssistance} from "@/lib/hooks";

interface IProps {
    vehicleId: string;
    phoneNumber?: string;
    distance?: number;
    onClose: () => void;
}

type InsuranceType = {
    code: string;
    label: string;
};

const AssistanceList = (props: IProps) => {
    const { vehicleId, phoneNumber, distance, onClose } = props;
    const [nomenclature, loading] = useGetInsurances("");

    const { registerAssistance } = useRegisterAssistance(vehicleId, onClose);

    const handleClick = (code: string) => {
        registerAssistance({
            variables: { vehicle_id: vehicleId, code, phoneNumber, distance },
        });
    };


    if (loading) {
        return (
            <div className="assurance-list-wrapper">
                <h2>Changer d'assureur</h2>
                <div className="assurance-loading">
                    <Spin />
                </div>
            </div>
        );
    }

    return (
        <div className="assurance-list-wrapper">
            <h2>Changer d'assureur</h2>
            {nomenclature.map((item: InsuranceType) => (
                <div
                    key={item.code}
                    onClick={() => handleClick(item.code)}
                    className="assistance-row"
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default AssistanceList;
