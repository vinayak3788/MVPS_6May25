// src/components/StationeryPreview.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StationeryPreview({ filename, alt }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/get-signed-url", { params: { filename } })
      .then((res) => {
        if (!cancelled) setUrl(res.data.url);
      })
      .catch((err) => {
        console.error("Failed to fetch signed URL:", err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [filename]);

  if (error) {
    return (
      <div className="h-48 w-full flex items-center justify-center bg-red-100 text-red-500">
        ⚠️
      </div>
    );
  }
  if (!url) {
    return <div className="h-48 w-full bg-gray-100 animate-pulse" />;
  }

  return (
    <img
      src={url}
      alt={alt || filename}
      className="object-contain h-full w-full"
    />
  );
}
