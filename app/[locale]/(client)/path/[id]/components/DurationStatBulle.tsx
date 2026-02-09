'use client'

import StatBulle from "./StatBulle";

interface IDurationStatBulleProps {
    title: string;
    number: number;
    arrow?: React.ReactNode;
    tooltip?: string;
}

export const DurationStatBulle = (props: IDurationStatBulleProps) => {
    const day = Math.floor(props.number / (60 * 24));
    const hour = Math.floor((props.number - day * 60 * 24) / 60);
    const min = Math.floor(props.number - (day * 60 * 24 + hour * 60));

    const delay = day > 0
        ? day + ':' + (hour < 10 ? '0' + hour : hour)
        : (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min);

    const unit = day > 0 ? 'jj:hh' : 'hh:mm';

    return (
        <StatBulle
            title={props.title}
            tooltip={props.tooltip}
            number={delay}
            unit={unit}
        />
    );
};

export default DurationStatBulle;
