// src/components/Auth/Signup.jsx

import React, { useState } from "react";
import { auth, googleProvider } from "../../config/firebaseConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../Layout";
import Button from "../Button";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // check existing sign-in methods
      const methods = await auth.fetchSignInMethodsForEmail(email);
      if (methods.length) {
        toast.error(
          methods.includes("google.com")
            ? "That email is already registered via Google. Please sign in with Google."
            : "That email is already in use. Try signing in instead.",
        );
        setLoading(false);
        return;
      }

      // email/password signup
      await auth.createUserWithEmailAndPassword(email, password);

      // create your user profile in Postgres
      await axios.post("/api/create-user-profile", {
        email,
        firstName,
        lastName,
        mobileNumber: mobile,
      });

      toast.success(`Welcome, ${firstName}!`);
      navigate("/verify-mobile");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      // popup login
      const result = await auth.signInWithPopup(googleProvider);
      const userEmail = result.user.email;

      // check if profile exists
      let existing = null;
      try {
        const resp = await axios.get(`/api/get-profile?email=${userEmail}`);
        existing = resp.data;
      } catch (e) {
        if (e.response?.status !== 404) throw e;
      }

      if (existing?.firstName) {
        await auth.signOut();
        toast.error("Already registered. Please log in.");
        navigate("/login");
        return;
      }

      // create blank profile on first Google signup
      await axios.post("/api/create-user-profile", {
        email: userEmail,
        firstName: "",
        lastName: "",
        mobileNumber: "",
      });

      toast.success("Account created! Please verify mobile.");
      navigate("/verify-mobile");
    } catch (err) {
      console.error("Popup signup error:", err);
      toast.error("Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up for MVP Services" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
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
          {loading ? "Signing up…" : "Sign Up"}
        </Button>
      </form>

      <div className="text-center font-semibold my-6">OR</div>

      <Button
        onClick={handleGoogleSignup}
        disabled={loading}
        variant="secondary"
        className="w-full flex items-center justify-center"
      >
        <img src="/google-logo.svg" alt="Google" className="w-5 h-5 mr-2" />
        Sign up with Google
      </Button>

      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-purple-600 font-medium underline"
        >
          Log In
        </button>
      </p>
    </Layout>
  );
}
