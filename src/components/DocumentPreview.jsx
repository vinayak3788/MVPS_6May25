// src/components/DocumentPreview.jsx
import React, { useState, useEffect, useMemo } from "react";

/**
 * Renders a PDF preview in a modal/lightbox using an iframe.
 * @param {{ file: { raw: File } }} props
 */
export default function DocumentPreview({ file }) {
  const [open, setOpen] = useState(false);

  // Create and memoize object URL for the PDF file
  const url = useMemo(() => URL.createObjectURL(file.raw), [file.raw]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-blue-600 underline text-sm"
      >
        Preview
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 max-w-3xl w-full relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-600"
            >
              ✕
            </button>
            <iframe
              src={url}
              title={file.name}
              width="100%"
              height="600px"
              className="border"
            >
              <p>
                Your browser does not support embedded PDFs.{" "}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </p>
            </iframe>
          </div>
        </div>
      )}
    </>
  );
}
