// src/features/user/components/UploadOrderForm.jsx

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { auth } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";
import { useCart } from "../../../context/CartContext";

export default function UploadOrderForm({ files, setFiles }) {
  const { addToCart } = useCart();
  const [printType, setPrintType] = useState("bw");
  const [sideOption, setSideOption] = useState("single");
  const [spiralBinding, setSpiralBinding] = useState(false);

  // read PDFs & count pages
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf"),
    );
    const updated = await Promise.all(
      selected.map(async (file) => {
        try {
          const buf = await file.arrayBuffer();
          const pdf = await PDFDocument.load(buf);
          return { name: file.name, pages: pdf.getPageCount(), raw: file };
        } catch {
          toast.error(`Error reading ${file.name}`);
          return { name: file.name, pages: 0, raw: file };
        }
      }),
    );
    setFiles(updated);
  };

  // calculate cost
  const getPrice = () => {
    const ppp = printType === "color" ? 5 : 2;
    let sum = files.reduce((acc, f) => acc + (f.pages || 0) * ppp, 0);
    if (spiralBinding) sum += 30;
    return sum;
  };

  // add print-order to cart (with raw files attached)
  const handleAddToCart = () => {
    if (!files.length || files.some((f) => !f.pages)) {
      toast.error("Please wait for page counts on all PDFs.");
      return;
    }

    const userEmail = auth.currentUser?.email;
    const newOrder = {
      type: "print",
      user: userEmail,
      printType,
      sideOption,
      spiralBinding,
      totalCost: getPrice(),
      createdAt: new Date().toISOString(),
      files: files.map((f) => ({
        name: f.name,
        pages: f.pages,
        raw: f.raw,
      })),
    };

    addToCart("print", newOrder);
    toast.success("🛒 Added to cart!");
    setFiles([]);
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto mb-8">
      <h2 className="text-lg font-semibold mb-4">Place Your Print Order</h2>

      <label className="block font-medium mb-1">Upload PDF(s)</label>
      <input type="file" accept=".pdf" multiple onChange={handleFileChange} />

      <div className="flex gap-4 mt-4">
        <div>
          <p className="font-medium mb-1">Print Type:</p>
          <label className="block">
            <input
              type="radio"
              name="printType"
              value="bw"
              checked={printType === "bw"}
              onChange={() => setPrintType("bw")}
            />{" "}
            B/W (₹2/page)
          </label>
          <label className="block">
            <input
              type="radio"
              name="printType"
              value="color"
              checked={printType === "color"}
              onChange={() => setPrintType("color")}
            />{" "}
            Color (₹5/page)
          </label>
        </div>

        <div>
          <p className="font-medium mb-1">Print Side:</p>
          <label className="block">
            <input
              type="radio"
              name="sideOption"
              value="single"
              checked={sideOption === "single"}
              onChange={() => setSideOption("single")}
            />{" "}
            Single Sided
          </label>
          <label className="block">
            <input
              type="radio"
              name="sideOption"
              value="double"
              checked={sideOption === "double"}
              onChange={() => setSideOption("double")}
            />{" "}
            Back to Back
          </label>
        </div>
      </div>

      <div className="mt-3">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={spiralBinding}
            onChange={() => setSpiralBinding((prev) => !prev)}
          />
          <span className="ml-2 font-medium">Add Spiral Binding (₹30)</span>
        </label>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Uploaded Files</h3>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left p-2">File</th>
              <th className="text-right p-2">Pages</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f, idx) => (
              <tr key={idx}>
                <td className="p-2">{f.name}</td>
                <td className="text-right p-2">{f.pages || "Loading..."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-bold text-right">Total Cost: ₹{getPrice()}</p>

      <button
        onClick={handleAddToCart}
        className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
        disabled={!files.length || files.some((f) => !f.pages)}
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
