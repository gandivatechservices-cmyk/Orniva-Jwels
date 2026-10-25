"use client";

import { useEffect, useState } from "react";
import { Alert, App, Button, Form, Input, Modal, Tabs } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  selectIsAuthModalOpen,
  selectAuthModalTab,
  selectAuthModalMessage,
  selectPendingAction,
  closeAuthModal,
  clearPendingAction,
  loginThunk,
  registerThunk,
  addItem as addItemAction,
  toggleWishlistThunk,
  optimisticToggle,
} from "store";
import styles from "./AuthModal.module.css";

export function AuthModal() {
  const dispatch = useAppDispatch();
  const { message: antMessage } = App.useApp();

  const isOpen = useAppSelector(selectIsAuthModalOpen);
  const activeTabFromStore = useAppSelector(selectAuthModalTab);
  const modalMessage = useAppSelector(selectAuthModalMessage);
  const pendingAction = useAppSelector(selectPendingAction);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(activeTabFromStore);
      setErrorMessage(null);
    }
  }, [isOpen, activeTabFromStore]);

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearPendingAction());
    setErrorMessage(null);
  };

  const handleActionAfterAuth = async () => {
    if (pendingAction) {
      if (pendingAction.type === "addToCart") {
        dispatch(
          addItemAction({
            item: pendingAction.payload.item,
            qty: pendingAction.payload.qty,
            isAuthenticated: true,
          })
        );
        antMessage.success("Item added to your basket!");
      } else if (pendingAction.type === "wishlist") {
        const pId = pendingAction.payload.productId;
        dispatch(optimisticToggle({ productId: pId, wasWishlisted: false }));
        await dispatch(toggleWishlistThunk({ productId: pId, wasWishlisted: false }));
        antMessage.success("Saved to your wishlist!");
      }
      dispatch(clearPendingAction());
    }
  };

  const handleLoginSubmit = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await dispatch(loginThunk(values)).unwrap();
      antMessage.success("Welcome back!");
      await handleActionAfterAuth();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err) || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (values: { name: string; email: string; password: string }) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await dispatch(registerThunk(values)).unwrap();
      antMessage.success("Account created successfully!");
      await handleActionAfterAuth();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err) || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      centered
      width={440}
      className={styles.modal}
    >
      <div className={styles.modalHeader}>
        <div className={styles.brandTitle}>ATLAS GROCERY</div>
        <div className={styles.modalSubtitle}>
          {activeTab === "login"
            ? "Sign in to access your cart, wishlist, and orders"
            : "Create your account for fast and easy shopping"}
        </div>
      </div>

      {modalMessage && (
        <Alert
          title={modalMessage}
          type="info"
          showIcon
          className={styles.alertBanner}
        />
      )}

      {errorMessage && (
        <Alert
          title={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage(null)}
          className={styles.alertBanner}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as "login" | "register");
          setErrorMessage(null);
        }}
        centered
        items={[
          {
            key: "login",
            label: "Sign In",
            forceRender: true,
            children: (
              <Form
                form={loginForm}
                layout="vertical"
                onFinish={handleLoginSubmit}
                requiredMark={false}
                className={styles.form}
              >
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email address" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className={styles.inputIcon} />}
                    placeholder="name@example.com"
                    autoComplete="email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: "Please enter your password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.inputIcon} />}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    size="large"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                  size="large"
                  className={styles.submitBtn}
                >
                  Sign In
                </Button>
              </Form>
            ),
          },
          {
            key: "register",
            label: "Create Account",
            forceRender: true,
            children: (
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegisterSubmit}
                requiredMark={false}
                className={styles.form}
              >
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter your name" }]}
                >
                  <Input
                    prefix={<UserOutlined className={styles.inputIcon} />}
                    placeholder="John Doe"
                    autoComplete="name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email address" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className={styles.inputIcon} />}
                    placeholder="name@example.com"
                    autoComplete="email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                    { min: 6, message: "Password must be at least 6 characters" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.inputIcon} />}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    size="large"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                  size="large"
                  className={styles.submitBtn}
                >
                  Create Account
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
