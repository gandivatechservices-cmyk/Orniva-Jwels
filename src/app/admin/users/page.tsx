"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, Card, Flex, Segmented, Select, Space, Table, Tag, Typography } from "antd";
import { SafetyCertificateOutlined, TeamOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { AdminLayout } from "components";
import { ProtectedRoute } from "guards";
import { ADMIN_TABLE_PROPS, AdminPageHeader, AdminSearchBar, AdminStatCards } from "components/admin";
import { useAdminSearchIntent } from "hooks";
import { usersService, type User, type UserRole } from "utility/services";

function userId(user: User) {
  return user._id || user.id || user.email || "unknown-user";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  useAdminSearchIntent(({ q }) => setSearch(q));
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { notification } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    usersService.list()
      .then(setUsers)
      .catch((error: unknown) => notification.error({ title: "Unable to load users", description: error instanceof Error ? error.message : "Please try again." }))
      .finally(() => setLoading(false));
  }, [notification]);

  const filteredUsers = users.filter(
    (user) =>
      (roleFilter === "all" || (user.role || "customer") === roleFilter) &&
      `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase())
  );
  const roleCount = (role: UserRole) => users.filter((u) => (u.role || "customer") === role).length;
  async function updateRole(user: User, role: UserRole) {
    const id = userId(user);
    const previousRole = user.role;
    setUpdatingId(id);
    setUsers((current) => current.map((item) => userId(item) === id ? { ...item, role } : item));
    try {
      const updatedUser = await usersService.updateRole(id, role);
      setUsers((current) => current.map((item) => userId(item) === id ? updatedUser : item));
      notification.success({ title: "Role updated", description: `${user.name || "User"} is now ${role}.` });
    } catch (error) {
      setUsers((current) => current.map((item) => userId(item) === id ? { ...item, role: previousRole } : item));
      notification.error({ title: "Unable to update role", description: error instanceof Error ? error.message : "Please try again." });
    } finally { setUpdatingId(null); }
  }

  const columns: ColumnsType<User> = [
    { title: "User", key: "user", render: (_, user) => <Space orientation="vertical" size={0}><Typography.Text strong>{user.name || "Unnamed user"}</Typography.Text><Typography.Text type="secondary">{user.email}</Typography.Text></Space> },
    { title: "Role", key: "role", render: (_, user) => <Select value={user.role || "customer"} loading={updatingId === userId(user)} disabled={updatingId !== null && updatingId !== userId(user)} onChange={(role) => updateRole(user, role)} options={[{ value: "customer", label: "Normal user" }, { value: "admin", label: "Admin" }, { value: "superadmin", label: "Superadmin" }]} /> },
    { title: "Access", key: "access", render: (_, user) => <Tag color={user.role === "customer" ? "default" : user.role === "superadmin" ? "green" : "gold"}>{user.role === "customer" ? "Standard" : "Admin access"}</Tag> },
    { title: "Account ID", dataIndex: "_id", key: "id", render: (_, user) => <Typography.Text type="secondary" copyable={{ text: userId(user) }}>{userId(user)}</Typography.Text> },
  ];

  const adminCount = users.filter((u) => u.role === "admin" || u.role === "superadmin").length;

  return <ProtectedRoute allowedRoles={["admin", "superadmin"]}><AdminLayout>
    <AdminPageHeader
      title="Users"
      subtitle="Manage everyone with access to the Shopper account."
      actions={<Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => router.push("/admin/users/new")}>Create user</Button>}
    />
    <AdminStatCards
      items={[
        { key: "all", title: "Total users", value: users.length, icon: <TeamOutlined />, color: "#14452b" },
        { key: "admins", title: "Admin access", value: adminCount, icon: <SafetyCertificateOutlined />, color: "#1f3f55" },
        { key: "customers", title: "Customers", value: users.length - adminCount, icon: <UserOutlined />, color: "#6b5a3a" },
      ]}
    />
    <Card variant="borderless" style={{ borderRadius: 12 }}>
      <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by name, email or role..." />
      <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
        <Segmented
          size="large"
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as typeof roleFilter)}
          options={[
            { value: "all", label: `All (${users.length})` },
            { value: "customer", label: `Customers (${roleCount("customer")})` },
            { value: "admin", label: `Admins (${roleCount("admin")})` },
            { value: "superadmin", label: `Superadmins (${roleCount("superadmin")})` },
          ]}
        />
        <Typography.Text type="secondary" style={{ marginLeft: "auto" }}>{filteredUsers.length} of {users.length} users</Typography.Text>
      </Flex>
      <Table rowKey={userId} {...ADMIN_TABLE_PROPS} loading={loading} columns={columns} dataSource={filteredUsers} locale={{ emptyText: search || roleFilter !== "all" ? "No users match your search." : "No users found." }} />
    </Card>
  </AdminLayout></ProtectedRoute>;
}
