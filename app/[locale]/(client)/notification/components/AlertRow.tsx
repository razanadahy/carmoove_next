'use client'

import { Checkbox, Tag } from "antd";
import { INotification } from "./AlertsRead";
import dayjs from "dayjs";
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface IAlertRowProps {
    notification: INotification;
    isChecked: boolean;
    handleCheck: () => void;
}

const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        'SHARING': '#1890ff',
        'ACCOUNT': '#1890ff',
        'DATA': '#1890ff',
        'QUOTE': '#1890ff',
        'APPOINTMENT': '#faad14',
        'VEHICLE': '#faad14',
        'ACCIDENT': '#f5222d',
        'THEFT': '#f5222d',
        'IMPOUND': '#f5222d',
        'SECURITY': '#f5222d',
        'BATTERY': '#fa8c16',
        'FUEL': '#fa8c16',
        'FAULT': '#fa8c16',
        'DEVICE': '#722ed1',
    };
    return colors[category.toUpperCase()] || '#8c8c8c';
};

const AlertRow = ({ notification, isChecked, handleCheck }: IAlertRowProps) => {
    const heading = notification.headings.find(h => h.language === 'fr')?.text
        || notification.headings[0]?.text
        || 'Notification';

    const content = notification.contents.find(c => c.language === 'fr')?.text
        || notification.contents[0]?.text
        || '';

    const vehicleInfo = notification.vehicle?.information;
    const timestamp = dayjs(notification.shipment.timestamp * 1000);

    return (
        <div className={`alert-row ${isChecked ? 'checked' : ''} ${!notification.read ? 'unread' : ''}`}>
            <div className="alert-row-header">
                <Checkbox
                    checked={isChecked}
                    onChange={handleCheck}
                    className="alert-checkbox"
                />
                <Tag color={getCategoryColor(notification.category)}>
                    {notification.categoryTranslation || notification.category}
                </Tag>
                <span className="alert-time">{timestamp.fromNow()}</span>
            </div>

            <div className="alert-row-content">
                <h4 className="alert-title">{heading}</h4>
                <p className="alert-description">{content}</p>

                {vehicleInfo && (
                    <div className="alert-vehicle">
                        <span className="vehicle-registration">{vehicleInfo.registration}</span>
                        <span className="vehicle-info">{vehicleInfo.make} {vehicleInfo.model}</span>
                    </div>
                )}
            </div>

            <div className="alert-row-footer">
                <span className="alert-date">
                    {timestamp.format('DD/MM/YYYY à HH:mm')}
                </span>
            </div>
        </div>
    );
};

export default AlertRow;
