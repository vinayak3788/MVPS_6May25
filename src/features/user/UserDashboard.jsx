// src/features/user/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

import { auth } from "../../config/firebaseConfig";
import Layout from "../../components/Layout";
import Button from "../../components/Button";

import UploadOrderForm from "./components/UploadOrderForm";
import OrdersHistory from "./components/OrdersHistory";
import StationeryStore from "./components/StationeryStore";
import { useOrders } from "./components/useOrders";
import { useAuthCheck } from "./components/useAuthCheck";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);
  const { files, setFiles, myOrders, fetchMyOrders, ordersLoading } =
    useOrders();
  const { validateMobile } = useAuthCheck();
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("No user logged in.");
        navigate("/login");
      } else {
        await validateMobile(user.email);
        setPending(false);
        fetchMyOrders(user.email);
      }
    });
    return () => unsub();
  }, [navigate, validateMobile, fetchMyOrders]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleViewCart = () => navigate("/cart");

  const handleAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("User not logged in.");
      return;
    }
    try {
      await user.getIdToken(true);
      const res = await axios.get(`/api/get-role?email=${user.email}`);
      if (res.data.role === "admin" || user.email === "vinayak3788@gmail.com") {
        navigate("/admin");
      } else {
        toast.error("Access denied. You are not an admin.");
      }
    } catch (err) {
      console.error("Admin access check failed", err);
      toast.error("Could not verify role. Try again.");
    }
  };

  if (pending) {
    return <div className="text-center mt-10">Checking login…</div>;
  }

  return (
    <Layout title="MVPS Dashboard">
      <Toaster />

      <div className="flex flex-wrap justify-end gap-2 mb-6">
        <Button onClick={handleViewCart}>View Cart</Button>
        <Button onClick={handleAdminAccess}>Switch to Admin</Button>
        <Button variant="secondary" className="bg-red-500 hover:bg-red-600">
          Logout
        </Button>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button
          onClick={() => setActiveTab("orders")}
          variant={activeTab === "orders" ? "primary" : "secondary"}
          className={
            activeTab === "orders" ? "bg-blue-500 hover:bg-blue-600" : ""
          }
        >
          📄 Print Orders
        </Button>
        <Button
          onClick={() => setActiveTab("stationery")}
          variant={activeTab === "stationery" ? "primary" : "secondary"}
          className={
            activeTab === "stationery" ? "bg-green-500 hover:bg-green-600" : ""
          }
        >
          🛒 Stationery Orders
        </Button>
      </div>

      {activeTab === "orders" ? (
        <>
          <UploadOrderForm
            files={files}
            setFiles={setFiles}
            fetchMyOrders={fetchMyOrders}
          />
          <OrdersHistory myOrders={myOrders} ordersLoading={ordersLoading} />
        </>
      ) : (
        <StationeryStore />
      )}
    </Layout>
  );
}
