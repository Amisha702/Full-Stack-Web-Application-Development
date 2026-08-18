import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupplierForm({ supplier, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({
    name: supplier?.name ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
  });
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Phone is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="supplier-name">Supplier name</label>
        <input
          id="supplier-name"
          className="field-input"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div>
        <label className="field-label" htmlFor="supplier-email">Email</label>
        <input
          id="supplier-email"
          type="email"
          className="field-input"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div>
        <label className="field-label" htmlFor="supplier-phone">Phone</label>
        <input
          id="supplier-phone"
          className="field-input"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : supplier ? "Save changes" : "Create supplier"}
        </button>
      </div>
    </form>
  );
}