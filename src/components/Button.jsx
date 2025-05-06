// src/components/Button.jsx
import React from "react";

export default function Button({
  children,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded shadow-sm font-medium transition " +
        "bg-purple-600 hover:bg-purple-700 text-white " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
