// Revised AdminStationeryTable.jsx
// src/features/admin/components/AdminStationeryTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import EditStationeryModal from "./EditStationeryModal";

export default function AdminStationeryTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stationery/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      toast.error("Failed to load stationery.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/admin/stationery/delete/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">📦 All Stationery Products</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Discount</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const imgs = Array.isArray(p.images) ? p.images : [];
                const src =
                  imgs.length > 0
                    ? imgs[0].startsWith("http")
                      ? imgs[0]
                      : `/uploads/${imgs[0]}`
                    : null;
                return (
                  <tr key={p.id} className="text-center">
                    <td className="px-4 py-2 border">{i + 1}</td>
                    <td className="px-4 py-2 border">
                      {src ? (
                        <img
                          src={src}
                          alt={p.name}
                          className="w-16 h-16 object-cover mx-auto"
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td className="px-4 py-2 border">{p.name}</td>
                    <td className="px-4 py-2 border">₹{p.price.toFixed(2)}</td>
                    <td className="px-4 py-2 border">{p.discount}%</td>
                    <td className="px-4 py-2 border space-x-2">
                      <button
                        onClick={() => setEditProduct(p)}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editProduct && (
        <EditStationeryModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdate={() => {
            setEditProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
