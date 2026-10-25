"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { App, Breadcrumb, Button, Card, Col, Form as AntForm, Input, Row, Select, Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { AdminLayout } from "components";
import { ProtectedRoute } from "guards";
import { useFormik } from "formik";
import * as Yup from "yup";
import { usersService, type CreateUserPayload } from "utility/services";
import styles from "./new-user.module.css";

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  role: Yup.mixed<"customer" | "admin" | "superadmin">().oneOf(["customer", "admin", "superadmin"]).required("Role is required"),
});

export default function NewUserPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const formik = useFormik<CreateUserPayload>({ initialValues: { name: "", email: "", password: "", role: "customer" }, validationSchema, onSubmit: async (values, { resetForm }) => {
    try {
      await usersService.create({ ...values, name: values.name.trim(), email: values.email.toLowerCase() });
      notification.success({ title: "User created", description: "The new user has been added successfully." });
      resetForm();
    } catch (submitError) {
      notification.error({ title: "Unable to create user", description: submitError instanceof Error ? submitError.message : "Please try again." });
    }
  } });

  const fieldError = (name: keyof CreateUserPayload) => formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  return <ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminLayout>
    <div className={styles.topbar}>
      <Link href="/admin/users" className={styles.back}><LeftOutlined /> Users</Link>
      <Breadcrumb items={[{ title: "Shopper" }, { title: "Users" }, { title: "Create" }]} />
    </div>
    <Card className={styles.panel} variant="borderless">
      <div className={styles.heading}>
        <Typography.Text className={styles.kicker}>Team directory</Typography.Text>
        <Typography.Title level={2} className={styles.title}>Create a user</Typography.Title>
        <Typography.Paragraph type="secondary" className={styles.subtitle}>Set up access for a customer or another member of the operations team.</Typography.Paragraph>
      </div>
      <AntForm layout="vertical" onFinish={() => formik.handleSubmit()} className={styles.form} requiredMark={false}>
        <Row gutter={20}>
          <Col xs={24}>
            <AntForm.Item label="Full name" validateStatus={fieldError("name") ? "error" : ""} help={fieldError("name")}>
              <Input name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Alex Morgan" />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item label="Email address" validateStatus={fieldError("email") ? "error" : ""} help={fieldError("email")}>
              <Input name="email" type="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="alex@example.com" />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item label="Temporary password" validateStatus={fieldError("password") ? "error" : ""} help={fieldError("password")}>
              <Input.Password name="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="At least 8 characters" />
            </AntForm.Item>
          </Col>
          <Col xs={24}>
            <AntForm.Item label="Role" validateStatus={fieldError("role") ? "error" : ""} help={fieldError("role")}>
              <Select value={formik.values.role} onChange={(role) => formik.setFieldValue("role", role)} options={[{ value: "customer", label: "Normal user" }, { value: "admin", label: "Admin" }, { value: "superadmin", label: "Superadmin" }]} />
            </AntForm.Item>
          </Col>
        </Row>
        <div className={styles.actions}>
          <Button onClick={() => router.push("/admin/users")}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>Create user</Button>
        </div>
      </AntForm>
    </Card>
  </AdminLayout></ProtectedRoute>;
}
