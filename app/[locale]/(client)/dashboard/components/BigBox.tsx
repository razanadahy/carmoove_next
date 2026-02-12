"use client"

import { Card } from "antd";
import { useRouter } from "next/navigation";
import { RightOutlined } from "@ant-design/icons";

interface BigBoxProps {
    id?: string;
    title: string;
    link?: {
        link: string;
        label: string;
    };
    children: React.ReactNode;
}

export default function BigBox({ id, title, link, children }: BigBoxProps) {
    const router = useRouter();

    return (
        <Card
            id={id}
            title={title}
            extra={
                link && (
                    <a
                        onClick={() => router.push(link.link)}
                        style={{ cursor: 'pointer', color: '#1890ff' }}
                    >
                        {link.label} <RightOutlined />
                    </a>
                )
            }
            style={{ height: '100%' }}
            styles={{ body: {height: 'calc(100% - 54px)', padding: 0} }}
        >
            {children}
        </Card>
    );
}
