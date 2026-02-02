"use client"
import { Alert, Button, Form, Input, Space, Row, Col, Grid, Spin } from "antd";
import {useState} from "react";
// import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import {useRouter} from "next/navigation";
import Image from "next/image";
import logo from '@/assets/image/logo.svg';
import mascotte from '@/assets/image/mascotte_v2.png';
import './login.css'
import {NextResponse} from "next/server";
const { useBreakpoint } = Grid;
export default function Login() {

    const router = useRouter();
    const [authFail, setAuthFail] = useState(false);

    const screens = useBreakpoint();
    const isMobile = screens.md;

    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm();
    console.log('KEYCLOAK_URL =', process.env.KEYCLOAK_URL);

    const handleLogin = async (values: { email: string, password: string }) => {
        const { email, password } = values;

        setLoading(true);
        setAuthFail(false);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setAuthFail(true);
                return;
            }

            router.push("/");
            router.refresh();

        } catch (error) {
            console.error('Login error:', error);
            setAuthFail(true);
        } finally {
            setLoading(false);
        }
    }

    return(
        <>
            <div>
                <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
                    <Col className='login-box' xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Form form={form} name="loginForm" onFinish={handleLogin} className='login-form' layout='vertical'>
                            <Image src={logo} alt="logo" className="mb-4" />
                            <h2 className='login-title'>Bienvenue !</h2>
                            <div style={{ marginBottom: '10px' }}>
                                {authFail && <Alert type="error" message="Mauvais login ou mot de passe" />}
                            </div>
                            <Form.Item
                                className='input-login-form'
                                label={ <label className='login-label'>Adresse e-mail</label>}
                                name='email'
                                rules={[
                                    { required: true, message: 'Veuillez saisir une adresse e-mail' },
                                    { type: 'email', message: 'Adresse e-mail non valide' }
                                ]}>
                                <Input className='input-mail' placeholder='Saisissez une adresse e-mail' disabled={loading} />
                            </Form.Item>
                            <Form.Item label={<label className='password-label'>Mot de passe</label>} name='password' rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}>
                                <Input.Password  className='input-password' placeholder='Saisissez un mot de passe' disabled={loading} />
                            </Form.Item>
                            <Space className='login-form-actions pb-3 pt-2'>
                                <Button className='login-btn' type='primary' htmlType='submit' loading={loading} disabled={loading}>
                                    {loading ? '' : 'Se connecter'}
                                </Button>
                                <div className='recover-password-box'>
                                    <a
                                        className='recover-password-btn'
                                        onClick={() => !loading && router.push('/reset-password')}
                                        style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                                    >
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            </Space>
                            <Space>
                                <div className='contact-us-box'>
                                    <span className='contact-us'>
                                        Pas encore de compte ?
                                    </span>
                                    <a className='contact-us-link' href='mailto:support@carmoove.com?subject:Demande%20de%20compte'>
                                        Contactez-nous
                                    </a>
                                </div>
                            </Space>
                        </Form>
                    </Col>
                    {isMobile && (
                        <Col className="mascotte-box d-flex justify-content-center align-items-center" xs={0} sm={0} md={12} lg={12} xl={12}>
                            <Image className="mascotte" src={mascotte} alt="Mascotte" loading="eager"/>
                        </Col>
                    )}
                </Row>
            </div>
        </>
    )
}