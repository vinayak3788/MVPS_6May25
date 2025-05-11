// src/features/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

import { auth } from "../../config/firebaseConfig";
import Layout from "../../components/Layout";
import Button from "../../components/Button";

import OrdersTable from "./components/OrdersTable";
import UsersTable from "./components/UsersTable";
import AdminStationeryForm from "./components/AdminStationeryForm";
import AdminStationeryTable from "./components/AdminStationeryTable";
import EditUserModal from "./components/EditUserModal";

import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import {
  getAllUsers,
  updateUserRole as apiUpdateUserRole,
  blockUser as apiBlockUser,
  unblockUser as apiUnblockUser,
  deleteUser as apiDeleteUser,
  updateProfile,
  verifyMobileManual,
} from "../../api/userApi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");
      setPending(false);
      await fetchOrders();
    });
    return () => unsub();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { orders } = await getAllOrders();
      setOrders(orders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { users } = await getAllUsers();
      setUsers(users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    try {
      await updateOrderStatus(id, status);
      toast.success("Status updated");
      await fetchOrders();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    try {
      await apiUpdateUserRole(userId, newRole);
      toast.success("Role updated");
      await fetchUsers();
    } catch {
      toast.error("Role update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    setLoading(true);
    try {
      await apiBlockUser(userId);
      toast.success("User blocked");
      await fetchUsers();
    } catch {
      toast.error("Block failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    setLoading(true);
    try {
      await apiUnblockUser(userId);
      toast.success("User unblocked");
      await fetchUsers();
    } catch {
      toast.error("Unblock failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await apiDeleteUser(userId);
      toast.success("User deleted");
      await fetchUsers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobile = async (userId) => {
    setLoading(true);
    try {
      await verifyMobileManual(userId);
      toast.success("Mobile verified");
      await fetchUsers();
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSwitchToUser = () => navigate("/userdashboard");

  if (pending) {
    return <div className="text-center mt-10">Checking login…</div>;
  }

  return (
    <Layout title="Admin Dashboard">
      <Toaster />

      {/* Top-bar controls */}
      <div className="flex justify-end gap-2 mb-6">
        <Button onClick={handleSwitchToUser}>Back to User View</Button>
        <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
          Logout
        </Button>
      </div>

      {/* Tab selector at top */}
      <nav className="flex space-x-4 mb-6 px-6">
        <button
          onClick={() => {
            setActiveTab("orders");
            fetchOrders();
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "orders"
              ? "bg-purple-700 text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          Manage Orders
        </button>
        <button
          onClick={() => {
            setActiveTab("users");
            fetchUsers();
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "users"
              ? "bg-purple-700 text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("stationery")}
          className={`px-4 py-2 rounded ${
            activeTab === "stationery"
              ? "bg-purple-700 text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          Manage Stationery
        </button>
      </nav>

      {/* Main content */}
      <div className="bg-white rounded shadow p-6 overflow-auto min-h-[60vh] mx-6">
        {activeTab === "orders" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
            <OrdersTable
              orders={orders}
              loading={loading}
              handleStatusChange={handleStatusChange}
            />
          </>
        )}

        {activeTab === "users" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
            <UsersTable
              users={users}
              loading={loading}
              handleRoleChange={handleRoleChange}
              handleBlockUser={handleBlockUser}
              handleUnblockUser={handleUnblockUser}
              handleDeleteUser={handleDeleteUser}
              handleVerifyMobile={handleVerifyMobile}
              setEditUser={setEditUser}
            />
            <EditUserModal
              editUser={editUser}
              setEditUser={setEditUser}
              handleEditUser={updateProfile}
              saving={saving}
            />
          </>
        )}

        {activeTab === "stationery" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Manage Stationery</h2>
            <AdminStationeryForm />
            <AdminStationeryTable />
          </>
        )}
      </div>
    </Layout>
  );
}
