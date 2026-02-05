import {Dispatch, SetStateAction, useCallback, useState} from "react";
import {Button,  Modal, Tag} from "antd";
import {DownOutlined} from "@ant-design/icons";


interface ButtonModalProps<T> {
    title: string;
    elements: T[];
    elementsChecked: T[];
    setElementChecked: Dispatch<SetStateAction<T[]>>;
    isLoading?: boolean;
    getKey: (element: T) => string | number;
    getLabel: (element: T) => string;
}

function ButtonModal<T>(props: ButtonModalProps<T>) {
    const [modalOpen, setModalOpen] = useState(false);

    const isChecked = useCallback((element: T) => {
        const key = props.getKey(element);
        return props.elementsChecked.some(checked => props.getKey(checked) === key);
    }, [props.elementsChecked, props.getKey]);

    const addElementCheck = useCallback((check: boolean, element: T) => {
        props.setElementChecked(prev => {
            const key = props.getKey(element);
            if (check) {
                if (prev.some(item => props.getKey(item) === key)) return prev;
                return [...prev, element];
            } else {
                return prev.filter(item => props.getKey(item) !== key);
            }
        });
    }, [props.getKey, props.setElementChecked]);

    return (
        <>
            <Button
                className={`filter-button ${(props.elementsChecked.length > 0 || modalOpen) ? 'active' : ''}`}
                type="primary"
                icon={<DownOutlined />}
                iconPosition="end"
                onClick={() => setModalOpen(true)}
                disabled={props.isLoading}
            >
                {props.title}
            </Button>

            <Modal
                title={props.title}
                className="icon-modal-box"
                centered
                open={modalOpen}
                onOk={() => { }}
                onCancel={() => { setModalOpen(false) }}
                footer={[
                    <Button key="reinit" onClick={() => { props.setElementChecked([]) }}>
                        Réinitialiser
                    </Button>,
                    <Button className="custom-button" key="submit" type="primary" onClick={() => setModalOpen(false)}>
                        Appliquer
                    </Button>,
                ]}
            >
                {props.elements.map((element) => (
                    <Tag.CheckableTag
                        className="option-tag-btn"
                        key={props.getKey(element)}
                        checked={isChecked(element)}
                        onChange={(checked) => { addElementCheck(checked, element) }}
                    >
                        {props.getLabel(element)}
                    </Tag.CheckableTag>
                ))}
            </Modal>
        </>
    );
}

export default ButtonModal;