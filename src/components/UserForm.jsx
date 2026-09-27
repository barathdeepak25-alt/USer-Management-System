import React, { useState, useEffect } from "react";

// A reusable form used by both "Add User" and "Edit User" pages.
// props:
//   initialData: { name, email, phone } to pre-fill (edit mode)
//   showPassword: whether to show the password field (true for add, optional for edit)
//   onSubmit: async function(formData) called when the form is submitted
//   submitLabel: text for the submit button
export default function UserForm({
  initialData = {},
  showPassword = false,
  passwordRequired = false,
  onSubmit,
  submitLabel = "Save",
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,// previous data copy
      name: initialData.name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
    }));
  }, [initialData.name, initialData.email, initialData.phone]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name cannot be empty";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (showPassword) {
      if (passwordRequired && !formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }
    if (formData.phone && !/^\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number (digits only)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
        {errors.phone && <p className="field-error">{errors.phone}</p>}
      </div>

      {showPassword && (
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
