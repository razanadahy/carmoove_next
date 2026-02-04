import { IUser } from "@/types/interfaces";
import { Alert, Button, Checkbox, Form, Input, notification } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { PASSWORD_RESET_MUTATION, USER_MUTATION } from "@/lib/graphql/mutation";
import { useState } from "react";

export function Edit(props: { user: IUser }) {
    const [form] = Form.useForm();
    const [passwordSent, setPasswordSent] = useState(false);

    const [userMutate, { loading, error }] = useMutation(USER_MUTATION, {
        refetchQueries: ["Whoami"],
        onCompleted: () => {
            notification["success"]({
                message: "Vos informations personnelles ont été mises à jour",
            });
        },
    });

    const [passwordMutate, passwordMutation] = useMutation(
        PASSWORD_RESET_MUTATION,
        {
            onCompleted: () => {
                setPasswordSent(true);
            },
        }
    );

    function handleFinish(values: IUser) {
        userMutate({
            variables: {
                user: values,
            },
        });
    }

    function handleResetPassword() {
        passwordMutate();
    }

    return (
        <>
            <h2>
                {props.user.firstname} {props.user.lastname}
            </h2>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleFinish}
                initialValues={props.user}
                className="form-account"
            >
                <Form.Item
                    name="lastname"
                    label="Nom"
                    hasFeedback
                    rules={[{ required: true }]}
                >
                    <Input placeholder="Nom" />
                </Form.Item>
                <Form.Item
                    name="firstname"
                    label="Prénom"
                    hasFeedback
                    rules={[{ required: true }]}
                >
                    <Input placeholder="Prénom" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Téléphone mobile"
                    hasFeedback
                    rules={[{ required: true }]}
                >
                    <Input placeholder="Téléphone mobile" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    hasFeedback
                    rules={[{ required: true, type: "email" }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item label="Newsletter" name="newsletter" valuePropName="checked">
                    <Checkbox>
            <span style={{ fontSize: "13px", color: "#7A8089" }}>
              J'accepte de recevoir les actualités et mises à jour de Carmoove.
            </span>
                    </Checkbox>
                </Form.Item>
                <Form.Item label="Mot de passe">
                    {!passwordSent && (
                        <Button
                            htmlType="button"
                            loading={passwordMutation.loading}
                            onClick={handleResetPassword}
                        >
                            Modifier mon mot de passe
                        </Button>
                    )}
                    {passwordSent && (
                        <Alert
                            message="Un email avec les instructions nécessaires pour modifier votre mot de passe vient de vous être envoyé."
                            type="info"
                            showIcon
                        />
                    )}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" loading={loading} htmlType="submit">
                        METTRE À JOUR
                        <RightOutlined />
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}
