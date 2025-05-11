// src/components/FileUploadWithPreview.jsx
import React from "react";
import DocumentPreview from "./DocumentPreview";

/**
 * File input that shows a preview button for each PDF selected.
 * @param {{ files: Array<{ name: string; raw: File }>; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }} props
 */
export default function FileUploadWithPreview({ files, onChange }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Upload PDF(s)</label>
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={onChange}
        className="block w-full"
      />
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b pb-1"
            >
              <span className="text-sm text-gray-800">{f.name}</span>
              <DocumentPreview file={f} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
