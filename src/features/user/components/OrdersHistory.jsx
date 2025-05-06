import React from "react";

export default function OrdersHistory({ myOrders, ordersLoading }) {
  return (
    <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">My Previous Orders</h2>

      {ordersLoading ? (
        <div className="text-center">Loading orders...</div>
      ) : myOrders.length === 0 ? (
        <div className="text-center text-gray-500">No past orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Order No</th>
                <th className="p-2">Files</th>
                <th className="p-2">Total Pages</th>
                <th className="p-2">Cost</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.id}>
                  <td className="p-2">{order.orderNumber}</td>
                  <td className="p-2">{order.fileNames}</td>
                  <td className="p-2">{order.totalPages}</td>
                  <td className="p-2">₹{order.totalCost}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
