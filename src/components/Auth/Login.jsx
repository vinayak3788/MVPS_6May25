// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../config/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../Layout";
import Button from "../Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const postLoginCheck = async (userEmail) => {
    try {
      const { data: profile } = await axios.get(
        `/api/get-profile?email=${encodeURIComponent(userEmail)}`,
      );
      if (profile.blocked) {
        toast.error("Your account has been blocked. Contact admin.");
        await auth.signOut();
        return false;
      }
      return true;
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Your account has been blocked. Contact admin.");
      } else if (err.response?.status === 404) {
        toast.error("No account found. Please sign up first.");
        navigate("/signup");
      } else {
        console.error("Error fetching profile:", err);
        toast.error("Server error. Try again later.");
      }
      await auth.signOut();
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (await postLoginCheck(cred.user.email)) {
        toast.success("Welcome back!");
        navigate("/userdashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      if (await postLoginCheck(userEmail)) {
        toast.success("Welcome back!");
        navigate("/userdashboard");
      }
    } catch (err) {
      console.error("Popup sign-in error:", err);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Log In to MVP Services" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Log In"}
        </Button>
      </form>

      <div className="text-center font-semibold my-6">OR</div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center border border-gray-300 bg-white px-4 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
      >
        <img src="/google-logo.svg" alt="Google" className="w-5 h-5 mr-2" />
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm">
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          className="text-purple-600 font-medium underline"
        >
          Sign Up
        </button>
      </p>
    </Layout>
  );
}

//commit purpose
