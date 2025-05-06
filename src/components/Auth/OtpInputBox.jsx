import React from "react";

export default function OtpInputBox() {
  return (
    <button
      className="flex items-center justify-center gap-2 border px-4 py-2 rounded w-full mt-3 hover:bg-gray-100"
      disabled
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
