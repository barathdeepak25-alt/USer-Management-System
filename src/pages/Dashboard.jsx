import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, deleteUser } from "../services/api";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers();
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setMessage("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setTimeout(() => setMessage(""), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Dashboard</h1>

        {error && <p className="alert alert-error">{error}</p>}
        {message && <p className="alert alert-success">{message}</p>}

        <div className="cards-row">
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{loading ? "..." : users.length}</p>
          </div>
          <div className="stat-card">
            <Link to="/add-user" className="btn btn-primary">
              + Add New User
            </Link>
          </div>
        </div>

        <h2 className="section-title">User Management</h2>

        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>users</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Created Date</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id.slice(-6)}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>{user.active}</td>
                    <td className="table-actions">
                      <Link to={`/edit-user/${user._id}`} className="btn btn-small btn-secondary">
                        Edit
                      </Link>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
