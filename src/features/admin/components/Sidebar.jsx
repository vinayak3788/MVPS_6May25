// src/features/admin/components/Sidebar.jsx
import React from "react";

/**
 * Horizontal tab bar for Admin Dashboard that preserves existing callbacks and styling
 * @param {{
 *   activeTab: string,
 *   setActiveTab: (tab: string) => void,
 *   fetchOrders: () => void,
 *   fetchUsers: () => void
 * }}
 */
export default function Sidebar({
  activeTab,
  setActiveTab,
  fetchOrders,
  fetchUsers,
}) {
  const tabs = [
    {
      key: "orders",
      label: "Manage Orders",
      action: () => {
        setActiveTab("orders");
        fetchOrders();
      },
    },
    {
      key: "users",
      label: "Manage Users",
      action: () => {
        setActiveTab("users");
        fetchUsers();
      },
    },
    {
      key: "stationery",
      label: "Manage Stationery",
      action: () => {
        setActiveTab("stationery");
      },
    },
  ];

  return (
    <nav className="w-full bg-gradient-to-br from-purple-600 to-purple-400 text-white p-4">
      <div className="max-w-7xl mx-auto flex space-x-4 overflow-x-auto">
        {tabs.map(({ key, label, action }) => (
          <button
            key={key}
            onClick={action}
            className={`px-4 py-2 rounded font-medium transition whitespace-nowrap
              ${activeTab === key ? "bg-purple-700" : "hover:bg-purple-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
