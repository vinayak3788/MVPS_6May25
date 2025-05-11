// Revised StationeryStore.jsx
// src/features/admin/components/StationeryStore.jsx (adjust path as needed)
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../../../context/CartContext";

export default function StationeryStore() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/stationery/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error("❌ Error fetching stationery products:", error);
      toast.error("Failed to load stationery.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const orderNumber = `Order${Date.now().toString().slice(-6)}`;
    const finalPrice =
      product.discount > 0
        ? parseFloat(
            product.price - (product.price * product.discount) / 100,
          ).toFixed(2)
        : product.price.toFixed(2);

    addToCart("stationery", {
      type: "stationery",
      orderNumber,
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      finalPrice,
      quantity: 1,
    });

    toast.success(`🛒 ${product.name} added to cart`);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  if (!products.length) {
    return (
      <div className="text-center mt-10">
        No stationery products available yet.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        🛒 Stationery Store
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const imgs = Array.isArray(product.images) ? product.images : [];
          const src =
            imgs.length > 0
              ? imgs[0].startsWith("http")
                ? imgs[0]
                : `/uploads/${imgs[0]}`
              : null;

          const finalPrice =
            product.discount > 0
              ? parseFloat(
                  product.price - (product.price * product.discount) / 100,
                ).toFixed(2)
              : product.price.toFixed(2);

          return (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-all flex flex-col bg-white"
            >
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                {src ? (
                  <img
                    src={src}
                    alt={product.name}
                    className="object-contain h-full"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {product.description}
                </p>

                {product.discount > 0 ? (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-green-600 font-bold">
                      ₹{finalPrice}
                    </span>
                    <span className="line-through text-gray-500">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-red-500 text-sm">
                      ({product.discount}% OFF)
                    </span>
                  </div>
                ) : (
                  <div className="text-black font-bold mb-4">
                    ₹{product.price.toFixed(2)}
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  ➕ Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
