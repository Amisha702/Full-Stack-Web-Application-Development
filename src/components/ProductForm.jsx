import { useState } from "react";

const emptyValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  supplierId: "",
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Reusable create/edit product form. Submits FormData to the parent. */
export default function ProductForm({ product, suppliers, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(
    product
  ? {
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stockQuantity ?? ""),
      supplierId: String(product.supplierId ?? product.supplier?.id ?? ""),
    }
  : emptyValues,
  );
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = "Product name is required.";
    if (!values.description.trim()) next.description = "Description is required.";
    if (values.price === "") next.price = "Price is required.";
    else if (Number(values.price) < 0) next.price = "Price cannot be negative.";
    if (values.stockQuantity === "") {
  next.stockQuantity = "Stock quantity is required.";
} else if (Number(values.stockQuantity) < 0) {
  next.stockQuantity = "Stock quantity cannot be negative.";
}
    if (!values.supplierId) next.supplierId = "Supplier is required.";
    if (image && !ACCEPTED_TYPES.includes(image.type))
      next.image = "Please choose a JPG, PNG, WEBP or GIF image.";
    if (!product && !image) next.image = "Product image is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("description", values.description.trim());
    formData.append("price", values.price);
    formData.append("stockQuantity", values.stockQuantity);
    formData.append("supplierId", values.supplierId);
    if (image) formData.append("image", image);
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="name">Product name</label>
        <input
          id="name"
          className="field-input"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Cordless Drill 18V"
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          className="field-input"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            className="field-input"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>
        <div>
          <label className="field-label" htmlFor="stockQuantity">
            Stock quantity
          </label>

          <input
            id="stockQuantity"
            type="number"
            className="field-input"
            value={values.stockQuantity}
            onChange={(e) => setField("stockQuantity", e.target.value)}
          />

          {errors.stockQuantity && (
            <span className="field-error">{errors.stockQuantity}</span>
          )}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="supplierId">Supplier</label>
        <select
          id="supplierId"
          className="field-input"
          value={values.supplierId}
          onChange={(e) => setField("supplierId", e.target.value)}
        >
          <option value="">Select a supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.supplierId && <span className="field-error">{errors.supplierId}</span>}
      </div>

      <div>
        <label className="field-label" htmlFor="image">Product image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          className="field-input file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        {product && !image && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Leave empty to keep the current image.
          </p>
        )}
        {errors.image && <span className="field-error">{errors.image}</span>}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}