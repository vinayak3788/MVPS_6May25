// src/components/Button.jsx
import React from "react";

// Variant-based Button: primary (purple) or secondary (gray)
const styles = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded shadow-sm font-medium transition " +
        styles[variant] +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {children}
    </button>
  );
}
