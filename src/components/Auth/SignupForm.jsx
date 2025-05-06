// src/components/Auth/SignupForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Layout from "../Layout";
import Button from "../Button";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.mobileNumber.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await axios.post("/api/create-user-profile", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
      });
      toast.success("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error("SignupForm error:", err);
      toast.error("Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up">
      <form onSubmit={handleSignup} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Mobile Number</label>
          <input
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");
              if (val.length > 10) val = val.slice(0, 10);
              setFormData((prev) => ({ ...prev, mobileNumber: val }));
            }}
            placeholder="Mobile Number"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="relative">
          <label className="block mb-1 font-medium">Password</label>
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md pr-10 focus:ring-2 focus:ring-purple-500"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setShowPwd((prev) => !prev)}
          >
            {showPwd ? "🙈" : "👁️"}
          </span>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </Layout>
  );
}
