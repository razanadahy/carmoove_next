'use client'

import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { IAuthorization } from "@/lib/hooks/Interfaces";
import "./ClosedAuthorizationRow.css";

interface ClosedAuthorizationRowProps {
    authorization: IAuthorization;
    setReload?: React.Dispatch<React.SetStateAction<boolean>>;
    setAuthorizationView: React.Dispatch<React.SetStateAction<IAuthorization | null>>;
}

export default function ClosedAuthorizationRow({ authorization, setAuthorizationView }: ClosedAuthorizationRowProps) {
    return (
        <div className="closed-authorization-row-box" key={authorization.authorizationId}>
            <span className="closed-authorization-head">
                <DatePicker.RangePicker
                    variant="borderless"
                    className="closed-authorization-date-picker"
                    defaultValue={[dayjs.unix(authorization.from!), dayjs.unix(authorization.until)]}
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY à HH:mm"
                    suffixIcon={"-"}
                    disabled={true}
                />
            </span>
            <span className="closed-authorization-driver-name">{authorization.driverName}</span>
        </div>
    );
}
