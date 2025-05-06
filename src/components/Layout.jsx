// src/components/Layout.jsx
import React from "react";

/**
 * @param {React.ReactNode} children
 * @param {string} title
 * @param {string} [maxWidth] tailwind max-width class for the inner container (default: "max-w-md")
 */
export default function Layout({ children, title, maxWidth = "max-w-md" }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans py-10">
      {title && (
        <header className="bg-white shadow-sm">
          <div className={`mx-auto ${maxWidth} py-4 px-6`}>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        </header>
      )}
      <main
        className={`mx-auto ${maxWidth} mt-6 bg-white p-6 rounded-lg shadow-sm`}
      >
        {children}
      </main>
    </div>
  );
}
