import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserForm from "../components/UserForm";
import { getUserById, updateUser } from "../services/api";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserById(id);
        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdateUser = async (formData) => {
    setError("");
    setSuccess("");
    // Don't send an empty password field — leave the existing one unchanged
    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      await updateUser(id, payload);
      setSuccess("User updated successfully! Redirecting...");
      setTimeout(() => navigate("/users"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Edit User</h1>
        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}

        {loading ? (
          <p className="loading-text">Loading user...</p>
        ) : user ? (
          <UserForm
            initialData={user}
            showPassword={true}
            passwordRequired={false}
            onSubmit={handleUpdateUser}
            submitLabel="Update User"
          />
        ) : (
          !error && <p>User not found.</p>
        )}
      </div>
    </div>
  );
}
