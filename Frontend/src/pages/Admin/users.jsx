// Frontend/src/pages/Admin/users.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  first_name: "",
  last_name: "",
  dob: "",
  gender: "",
  email: "",
  password: "",
  isAdmin: false,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [activeId, setActiveId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const title = useMemo(() => (mode === "create" ? "Add New User" : "Edit User"), [mode]);

  const fetchUsers = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // backend returns { data: userArray }
      const data = await apiFetch(`${API_URL}/api/users`, { method: "GET" });
      setUsers(data?.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setMode("create");
    setActiveId(null);
    setForm(emptyForm);
    setOpenModal(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (u) => {
    setMode("edit");
    setActiveId(u._id);

    setForm({
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      dob: u.dob || "",
      gender: u.gender || "",
      email: u.email || "",
      password: "", // keep empty on edit (only set if you want to change)
      isAdmin: !!u.isAdmin,
    });

    setOpenModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setActiveId(null);
    setMode("create");
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required";
    if (!form.last_name.trim()) return "Last name is required";
    if (!form.email.trim()) return "Email is required";

    // On create: password must be provided
    if (mode === "create") {
      if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
      if (!form.dob.trim()) return "DOB is required";
      if (!form.gender.trim()) return "Gender is required";
    }

    // On edit: if password is provided, validate length
    if (mode === "edit" && form.password && form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      if (mode === "create") {
        await apiFetch(`${API_URL}/api/users`, {
          method: "POST",
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            dob: form.dob,
            gender: form.gender,
            email: form.email,
            password: form.password,
            isAdmin: form.isAdmin,
          }),
        });
        setSuccess("User created successfully.");
      } else {
        // update user
        const payload = {
          first_name: form.first_name,
          last_name: form.last_name,
          dob: form.dob,
          gender: form.gender,
          email: form.email,
          isAdmin: form.isAdmin,
        };

        // only include password if admin typed it
        if (form.password) payload.password = form.password;

        await apiFetch(`${API_URL}/api/users/${activeId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("User updated successfully.");
      }

      closeModal();
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (u) => {
    setError("");
    setSuccess("");

    const ok = window.confirm(`Delete user "${u.email}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await apiFetch(`${API_URL}/api/users/${u._id}`, { method: "DELETE" });
      setSuccess("User deleted.");
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>

        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-500"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-xl bg-white shadow border">
        <div className="p-4 border-b">
          <p className="font-semibold">All Users</p>
          <p className="text-sm text-gray-500">Admin can view, create, edit, and delete users.</p>
        </div>

        {loading ? (
          <div className="p-4">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-gray-600">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">DOB</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-3">{u.first_name} {u.last_name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.dob || "-"}</td>
                    <td className="p-3">{u.gender || "-"}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        u.isAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-md border px-3 py-1 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{title}</h3>
              <button onClick={closeModal} className="text-gray-600 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">First name</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Last name</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">DOB</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="other">other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Password {mode === "edit" ? "(leave empty to keep current)" : ""}
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) => handleChange("isAdmin", e.target.checked)}
                />
                Make this user an admin
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-500"
                >
                  {mode === "create" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
