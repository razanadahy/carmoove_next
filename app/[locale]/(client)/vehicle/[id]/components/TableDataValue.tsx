'use client'

import React from "react";
import { IDataRowTableV2 } from "./DetailV2";
import "./TableDataValue.css";

interface IProps {
    data: IDataRowTableV2[];
}

const TableDataValue = ({ data }: IProps) => {
    return (
        <div className="table-data-value">
            {data.map((row, index) => (
                <div key={index} className="table-data-row">
                    <div className="table-data-label">{row.data}</div>
                    <div className="table-data-value-content">{row.value}</div>
                    <div className="table-data-action">{row.action}</div>
                </div>
            ))}
        </div>
    );
};

export default TableDataValue;
