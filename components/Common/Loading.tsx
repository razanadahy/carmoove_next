import { Spin} from "antd";
import React from "react";

export const Loading = ({msg}: {msg: string}) => {
    return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" tip={msg} >
                <div style={{ minHeight: '100px' }} /> {/* Contenu vide minimum */}
            </Spin>
        </div>
    )
}