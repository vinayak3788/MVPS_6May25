// src/components/FileLinks.jsx

import React from "react";
import axios from "axios";

export default function FileLinks({ files }) {
  if (!files || files.length === 0) {
    return <div className="text-gray-500">No files uploaded</div>;
  }

  const handleDownload = async (fileName) => {
    try {
      const res = await axios.get(
        `/api/get-signed-url?filename=${encodeURIComponent(fileName)}`,
      );
      const url = res.data.url;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to fetch signed URL", err);
      alert("⚠️ File not found or expired.");
    }
  };

  return (
    <div className="flex flex-col items-start space-y-1 p-2">
      {files.map((file, idx) => (
        <button
          key={idx}
          onClick={() => handleDownload(file.name)}
          className="text-red-600 underline flex items-center space-x-1 hover:text-red-800"
        >
          <span role="img" aria-label="file">
            📄
          </span>
          <span>{file.name}</span>
        </button>
      ))}
    </div>
  );
}
