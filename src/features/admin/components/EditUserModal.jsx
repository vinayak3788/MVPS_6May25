import React from "react";

export default function EditUserModal({
  editUser,
  setEditUser,
  handleEditUser,
  saving,
}) {
  if (!editUser) return null;

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setEditUser((prev) => ({
      ...prev,
      mobileVerified: isChecked ? 1 : 0, // ✅ Ensure 1 or 0, not true/false
    }));
  };

  return (
    <div className="fixed top-10 right-10 bg-white p-4 shadow rounded-lg w-96 space-y-2">
      <h2 className="font-bold text-lg mb-2">Edit User</h2>

      <input
        type="text"
        value={editUser.email || ""}
        disabled
        className="w-full border p-2 rounded bg-gray-100"
        placeholder="Email (readonly)"
      />
      <input
        type="text"
        value={editUser.firstName || ""}
        onChange={(e) =>
          setEditUser((prev) => ({ ...prev, firstName: e.target.value }))
        }
        placeholder="First Name"
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        value={editUser.lastName || ""}
        onChange={(e) =>
          setEditUser((prev) => ({ ...prev, lastName: e.target.value }))
        }
        placeholder="Last Name"
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        value={editUser.mobileNumber || ""}
        onChange={(e) =>
          setEditUser((prev) => ({ ...prev, mobileNumber: e.target.value }))
        }
        placeholder="Mobile Number"
        className="w-full border p-2 rounded"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editUser.mobileVerified === 1}
          onChange={handleCheckboxChange}
        />
        <label>Mobile Verified</label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleEditUser}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditUser(null)}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
