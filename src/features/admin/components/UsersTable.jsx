export default function UsersTable({
  users,
  loading,
  handleRoleChange,
  handleBlockUser,
  handleUnblockUser,
  handleDeleteUser,
  handleVerifyMobile,
  setEditUser,
}) {
  if (loading) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  if (!users.length) {
    return <div className="text-center">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border shadow text-sm sm:text-base">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">Email</th>
            <th className="px-3 py-2 border">Role</th>
            <th className="px-3 py-2 border">First Name</th>
            <th className="px-3 py-2 border">Last Name</th>
            <th className="px-3 py-2 border">Mobile</th>
            <th className="px-3 py-2 border">Verified</th>
            <th className="px-3 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email} className="text-center">
              <td className="px-3 py-2 border break-words">{u.email}</td>
              <td className="px-3 py-2 border">{u.role}</td>
              <td className="px-3 py-2 border">{u.firstName}</td>
              <td className="px-3 py-2 border">{u.lastName}</td>
              <td className="px-3 py-2 border">{u.mobileNumber}</td>
              <td className="px-3 py-2 border">
                {u.mobileVerified ? "✅" : "❌"}
              </td>
              <td className="px-3 py-2 border flex flex-wrap justify-center gap-1">
                <button
                  onClick={() => setEditUser(u)}
                  className="text-blue-500 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleRoleChange(
                      u.email,
                      u.role === "admin" ? "user" : "admin",
                    )
                  }
                  className="text-yellow-600 underline"
                >
                  Toggle Role
                </button>
                <button
                  onClick={() =>
                    u.blocked
                      ? handleUnblockUser(u.email)
                      : handleBlockUser(u.email)
                  }
                  className="text-purple-600 underline"
                >
                  {u.blocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={() => handleVerifyMobile(u.email)}
                  className="text-green-600 underline"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleDeleteUser(u.email)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
