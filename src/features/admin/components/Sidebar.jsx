// src/features/admin/components/Sidebar.jsx
import React from "react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  fetchOrders,
  fetchUsers,
}) {
  return (
    <aside className="flex-shrink-0 w-full lg:w-64 bg-gradient-to-br from-purple-600 to-purple-400 text-white p-4">
      <ul className="space-y-2">
        {/* Manage Orders */}
        <li>
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "orders" ? "bg-purple-700" : "hover:bg-purple-500"
            }`}
            onClick={() => {
              setActiveTab("orders");
              fetchOrders();
            }}
          >
            Manage Orders
          </button>
        </li>

        {/* Manage Users */}
        <li>
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "users" ? "bg-purple-700" : "hover:bg-purple-500"
            }`}
            onClick={() => {
              setActiveTab("users");
              fetchUsers();
            }}
          >
            Manage Users
          </button>
        </li>

        {/* Manage Stationery */}
        <li>
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "stationery"
                ? "bg-purple-700"
                : "hover:bg-purple-500"
            }`}
            onClick={() => setActiveTab("stationery")}
          >
            Manage Stationery
          </button>
        </li>
      </ul>
    </aside>
  );
}
