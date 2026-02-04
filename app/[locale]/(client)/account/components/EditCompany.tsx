import { ICompany, IUser } from "@/types/interfaces";
import {Form, Input, Button, App} from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { USER_MUTATION } from "@/lib/graphql/mutation";

export function EditCompany(props: { user: IUser }) {
    const [form] = Form.useForm();
    const { notification } = App.useApp();

    const [userMutate, { loading, error }] = useMutation(USER_MUTATION, {
        refetchQueries: ["Whoami"],
        onCompleted: () => {
            notification["success"]({
                message: "Vos informations de l'entreprise ont été mises à jour",
            });
        },
    });

    function handleFinish(values: ICompany) {
        userMutate({
            variables: {
                user: {
                    company: values,
                },
            },
        });
    }

    return (
        <>
            <h2>{props.user.company?.name}</h2>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleFinish}
                initialValues={props.user.company ?? ({} as ICompany)}
                className="form-account-company"
            >
                <Form.Item
                    name="name"
                    label="Nom de l'entreprise"
                    hasFeedback
                    rules={[{ required: true }]}
                >
                    <Input placeholder="Nom de l'entreprise" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Adresse"
                    hasFeedback
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Adresse" />
                </Form.Item>
                <Form.Item
                    name="zipcode"
                    label="Code postal"
                    hasFeedback
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Code postal" />
                </Form.Item>
                <Form.Item
                    name="city"
                    label="Ville"
                    hasFeedback
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Ville" />
                </Form.Item>
                <Form.Item
                    name="country"
                    label="Pays"
                    hasFeedback
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Pays" />
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
