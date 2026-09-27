import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserForm from "../components/UserForm";
import { createUser } from "../services/api";

export default function AddUser() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddUser = async (formData) => {
    setError("");
    setSuccess("");
    try {
      await createUser(formData);
      setSuccess("User added successfully! Redirecting...");
      setTimeout(() => navigate("/users"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Add New User</h1>
        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}
        <UserForm
          showPassword={true}
          passwordRequired={false}
          onSubmit={handleAddUser}
          submitLabel="Add User"
        />
      </div>
    </div>
  );
}
