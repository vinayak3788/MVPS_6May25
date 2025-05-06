import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebaseConfig";
import toast from "react-hot-toast";

export default function GoogleSignupButton() {
  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed up with Google!");
      window.location.href = "/login";
    } catch (err) {
      console.error(err.message);
      toast.error("Google signup failed.");
    }
  };

  return (
    <button
      onClick={handleGoogleSignup}
      className="flex items-center justify-center gap-2 border px-4 py-2 rounded w-full mt-3 hover:bg-gray-100"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Sign up with Google</span>
    </button>
  );
}
