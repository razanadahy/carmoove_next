'use client'
import {useRouter} from "next/navigation";
import {Spin, Tooltip} from "antd";
import Image from "next/image";
import {LoadingOutlined} from "@ant-design/icons";
import './vS.css'

interface IVehicleStatusProp {
    icon: string|null;
    tooltip?: string;
    link?: string;
    other_class? : string;
    onClick?: () => void
}

const VehicleStatusInResult = ({ icon, tooltip, link, other_class, onClick }: IVehicleStatusProp) => {
    const history = useRouter()
    const onClickParam = () => {
        if (link) history.push(link)
        if (onClick) onClick();
    }
    return (
        <Tooltip placement="top" arrow={false} color="white" title={<span className="tooltip-text">{tooltip}</span>}>
            <div className={`vehicle-icon-box ${(link || onClick) ? "link" : ""} ${other_class ? other_class : ''}`} onClick={() => onClickParam()}>
                {icon ? <Image alt={""} src={icon} /> : <Spin indicator={<LoadingOutlined spin />} size="small" />}
            </div>
        </Tooltip>
    );
};

export default VehicleStatusInResult;