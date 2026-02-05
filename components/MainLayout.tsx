'use client';

import React, { useState } from "react";
import { Layout, Menu, Avatar, Button, Space, Dropdown, App } from 'antd';
import {
    UserOutlined,
    MenuOutlined,
    BellOutlined,
    SettingOutlined,
    LogoutOutlined,
    DownOutlined,
    DashboardOutlined,
    CarOutlined,
    QuestionCircleOutlined,
    ExclamationCircleFilled, CalendarOutlined, ScheduleOutlined, PushpinOutlined, BarChartOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import mini_masquotte_i from "@/assets/image/menu/mini-masquotte-footer.svg"
import { logoutAction } from "@/app/actions/auth";
import './mainLayout.css'
import dayjs from "dayjs";
dayjs.locale('fr');
const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { modal } = App.useApp();

    // Fonction simple pour mapper l'URL au titre de la page
    const getPageTitle = (path: string): string => {
        if (path.includes('/dashboard')) return 'Tableau de bord';
        if (path.includes('/planning')) return 'Planning';
        if (path.includes('/settings')) return 'Paramètres';
        if (path.includes('/help')) return 'Contact';
        if (path.includes('/vehicle')) return 'Véhicule';
        if (path.includes('/vehicles')) return 'Véhicules';
        if (path.includes('/driver')) return 'Conducteur';
        if (path.includes('/drivers')) return 'Conducteurs';
        if (path.includes('/planning')) return 'Planning des véhicules';
        if (path.includes('/maps')) return 'Suivi temps réel';
        if (path.includes('/statistics')) return 'Statistiques';
        if (path.includes('/account')) return 'Profil';
        if (path.includes('/notification')) return 'Notifications';
        // Ajoute d'autres mappings ici
        return 'CarMoove';
    };

    const showLogoutConfirm = () => {
        modal.confirm({
            title: 'Déconnexion',
            icon: <ExclamationCircleFilled />,
            content: 'Êtes-vous sûr de vouloir vous déconnecter ?',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            async onOk() {
                try {
                    await logoutAction();
                    router.push('/login');
                } catch (error) {
                    console.error('Logout failed', error);
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const handleLogout = () => {
        showLogoutConfirm();
    };

    const handleHelp = () => {
        router.push('/help');
    }
    const handleNotification = () => {
        router.push('/notification');
    }

    const handleSettings = () => {
        router.push('/settings/global');
    };

    const handleProfile = () => {
        router.push('/account');
    };

    const userMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Profil', onClick: handleProfile },
        { key: '2', icon: <SettingOutlined />, label: 'Paramètres', onClick: handleSettings },
        { key: '3', icon: <QuestionCircleOutlined />, label: 'Aide', onClick: handleHelp },
        { type: 'divider' as const },
        { key: '4', icon: <LogoutOutlined />, label: 'Déconnexion', onClick: handleLogout }
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tableau de bord',
        },
        {
            key: '/vehicles',
            icon: <CarOutlined />,
            label: 'Véhicules',
        },
        {
            key: '/drivers',
            icon: <UserOutlined />,
            label: 'Conducteurs',
        },
        {
            key: '/planning',
            icon: <ScheduleOutlined />,
            label: 'Planning',
        },
        {
            key: '/maps',
            icon: <PushpinOutlined />,
            label: 'Carte',
        },
        {
            key: '/statistics',
            icon: <BarChartOutlined />,
            label: 'Statistiques',
        }
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        router.push(key);
    };

    const getSelectedMenuKey = (path: string): string => {
        if (path.includes('/dashboard')) return '/dashboard';
        if (path.includes('/driver')) return '/drivers';
        if (path.includes('/planning')) return '/planning';
        if (path.includes('/vehicle')) return '/vehicles';
        return path;
    };

    return (
        <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    background: '#f5f5f5',
                    height: '100vh',
                    overflowY: 'auto',
                    borderRight: '1px solid black',
                    position: 'relative',
                }}
                className="site-layout-sider"
            >
                <div
                    className={`d-flex justify-content-center align-items-center gap-2`}
                    style={{
                        height: 64,
                        transition: 'all 0.3s'
                    }}
                >
                    <Image src={mini_masquotte_i} alt="Carmoove mascot" style={{scale: '1.08'}} />
                    {!collapsed && (
                        <h5 style={{fontSize: '0.85rem'}}>Carmoove -Webapp</h5>
                    )}
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    style={{ fontSize: '14px', fontWeight: '600' }}
                    selectedKeys={[getSelectedMenuKey(pathname)]}
                    items={menuItems}
                    className="bg-transparent"
                    onClick={handleMenuClick}
                />
                <div className="masquotte-footer d-flex flex-row align-items-center gap-2 position-absolute bottom-0 mb-5 w-100 justify-content-center overflow-x-hidden h-auto overflow-y-hidden">
                    <Image src={mini_masquotte_i} alt="Carmoove mascot" style={{scale: '1.08'}} />
                    {!collapsed && (
                        <div>
                            <div className="masquotte-footer-info" style={{fontSize: "11px", fontWeight: "700"}}>© Carmoove SAS</div>
                            <div className="masquotte-footer-info" style={{fontSize: "11px", fontWeight: "700"}}>Version : 1.1.11</div>
                            <div className="masquotte-footer-info" style={{fontSize: "11px", fontWeight: "700"}}>
                                <a href="https://www.carmoove.com/conditions-generales-de-vente-et-d-utilisation/" target="_blank" >
                                    CGV - CGVU
                                </a>
                            </div>
                        </div>
                    )}

                </div>
            </Sider>

            <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header
                    className="d-flex justify-content-between align-items-center px-4"
                    style={{
                        background: '#fff',
                        height: '64px',
                        padding: '0 24px',
                        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
                        zIndex: 1
                    }}
                >
                    <div className="d-flex align-items-center">
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 46, height: 46, marginRight: 16 }}
                        />
                        <h4 className="m-0" style={{ fontWeight: 600 }}>
                            {getPageTitle(pathname)}
                        </h4>
                    </div>

                    <div className="d-flex align-items-center">
                        <Space size="middle">
                            <Button onClick={handleNotification} type="text" style={{ fontSize: "18px" }} icon={<BellOutlined />} />
                            <Dropdown menu={{ items: userMenuItems }} className="py-2" placement="bottomRight">
                                <Button type="text" className="d-flex align-items-center py-0 px-1" style={{ height: 'auto' }}>
                                    <Avatar icon={<UserOutlined />} className="bg-primary" />
                                </Button>
                            </Dropdown>
                        </Space>
                    </div>
                </Header>

                <Content style={{
                    padding: 24,
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
