'use client'

import React from "react";
import TableDataValue from "./TableDataValue";
import { IDataRowTableV2 } from "./DetailV2";

interface IProps {
    title: string
    data: IDataRowTableV2[]
    footer?: any
}

const DetailItem = (props: IProps) => {
    const { title, data } = props;

    return (
        <div className="detail-item-section">
            {title && title.length > 0 && <h2>{title}</h2>}
            {
                data.length > 0 && data[0].oneCol ?
                    <>
                        {data.map((d, index) => (
                            <React.Fragment key={index}>
                                {d.child}
                            </React.Fragment>
                        ))}
                    </>
                    :
                    <TableDataValue data={data} />
            }
            {props.footer && props.footer}
        </div>
    );
};

export default DetailItem;
