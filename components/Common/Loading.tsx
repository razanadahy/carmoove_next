import { Spin} from "antd";
import React from "react";

export const Loading = ({msg}: {msg: string}) => {
    return(
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" tip={msg}>
                <div style={{ height: '200px' }} />
            </Spin>
        </div>
    )
}