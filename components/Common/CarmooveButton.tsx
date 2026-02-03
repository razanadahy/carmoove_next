import { Button, ButtonProps } from "antd";
import './CarmooveButton.css'
interface IProps extends ButtonProps {
    children: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    htmlType: "button" | "submit" | "reset" | undefined;
    onClick?: () => void;
}

const CarmooveButton = (props: IProps) => {
    const {
        loading = false,
        disabled = false,
        htmlType,
        children,
        onClick,
        ...otherProps
    } = props;
    return (
        <Button
            disabled={disabled}
    className={`rounded-3 ${disabled ? "carmoove-button-disabled" : "carmoove-button"}`}
    size="large"
    loading={loading}
    htmlType={htmlType}
    onClick={onClick}
    {...otherProps}
>
    {children}
    </Button>
);
};

export default CarmooveButton;