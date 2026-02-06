'use client'
import React from 'react';
import { Tooltip } from 'antd';
import './StatShowBox.css';
import detail_icon from '@/assets/image/vehicle/detail.svg';

interface StatShowBoxProps {
    title: string;
    value: number | string;
    unity: string;
    tooltip?: string;
    type?: string;
    color?: string;
}

const usageTimeFormat = (number: number) => {
    const day = Math.floor(number / (60 * 24));
    const hour = Math.floor((number - day * 60 * 24) / 60);
    const min = Math.floor(number - (day * 60 * 24 + hour * 60));
    const delay = day > 0
        ? day + ':' + (hour < 10 ? '0' + hour : hour)
        : (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min);
    const unit = day > 0 ? 'jj:hh' : 'hh:mm';
    return {
        delay: delay,
        unit: unit
    };
};

const StatShowBox: React.FC<StatShowBoxProps> = ({ title, value, unity, tooltip, color = '', type = 'default' }) => {
    let time = usageTimeFormat(Number(value));
    if (type === 'time') {
        value = time.delay;
        unity = time.unit;
    }
    return (
        <div className='stat-show-box' style={{border: '1px solid #39A1D8'}}>
            <div className='stat-show-box-title'>
                <span>{title}</span>
            </div>
            <div className='stat-show-box-value'>
                <span style={{ color }}>{value}</span>
            </div>
            <div className='stat-show-box-unity w-100 justify-content-between'>
                <span style={{fontWeight: "700"}}>{unity}</span>
                <Tooltip placement="bottom" arrow={false} color="white" title={<span className="stat-tooltip-text">{tooltip ?? title}</span>}>
                    <img src={detail_icon.src} alt="detail" />
                </Tooltip>
            </div>
        </div>
    );
};

export default StatShowBox;
