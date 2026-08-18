import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { LOW_STOCK_THRESHOLD, productsApi, suppliersApi } from "@/services/api";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import ProductForm from "@/components/ProductForm";
import ProductCard, { LowStockBadge, ProductImage } from "@/components/ProductCard";
import { EmptyState, ErrorMessage, SuccessMessage } from "@/components/Message";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "Products — StockDesk Inventory" },
      { name: "description", content: "Create, edit, search and delete inventory products." },
      { property: "og:title", content: "Products — StockDesk Inventory" },
      { property: "og:description", content: "Create, edit, search and delete inventory products." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formProduct, setFormProduct] = useState(null); // product being edited
  const [formOpen, setFormOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  // Filtering happens on the backend: search + supplierId are sent as query params.
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productsApi.list({ search, supplierId });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, supplierId]);

  useEffect(() => {
    suppliersApi
      .list()
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [loadProducts]);

  function openCreate() {
    setFormProduct(null);
    setFormOpen(true);
  }

  function openEdit(product) {
    setFormProduct(product);
    setFormOpen(true);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (formProduct) {
        await productsApi.update(formProduct.id, formData);
        setSuccess("Product updated successfully.");
      } else {
        await productsApi.create(formData);
        setSuccess("Product created successfully.");
      }
      setFormOpen(false);
      await loadProducts();
    } catch (err) {
      setError(err.message || (formProduct ? "Unable to update product." : "Unable to create product."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await productsApi.remove(product.id);
      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your inventory items</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="panel grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
        <div>
          <label className="field-label" htmlFor="search">Search</label>
          <input
            id="search"
            className="field-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="supplier-filter">Supplier</label>
          <select
            id="supplier-filter"
            className="field-input"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <Loading label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="panel">
          <EmptyState message="No products found." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="panel hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const low = Number(product.stockQuantity) < LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={product.id} className={low ? "bg-warning/10" : ""}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage product={product} />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-muted-foreground">
                        <span className="line-clamp-2">{product.description}</span>
                      </td>
                      <td className="px-4 py-3">{product.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{product.stockQuantity}</span>
                          <LowStockBadge stock={Number(product.stockQuantity)} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.Supplier?.name ?? product.supplier?.name ?? product.supplierName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="btn-outline btn-sm" onClick={() => setViewProduct(product)}>View</button>
                          <button className="btn-outline btn-sm" onClick={() => openEdit(product)}>Edit</button>
                          <button className="btn-danger btn-sm" onClick={() => handleDelete(product)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="grid gap-3 md:hidden">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={setViewProduct}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {formOpen && (
        <Modal
          title={formProduct ? "Edit product" : "Add product"}
          onClose={() => setFormOpen(false)}
        >
          <ProductForm
            product={formProduct}
            suppliers={suppliers}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}

      {viewProduct && (
        <Modal title={viewProduct.name} onClose={() => setViewProduct(null)}>
          <div className="space-y-4">
            <ProductImage product={viewProduct} className="h-40 w-40" />
            <p className="text-sm text-muted-foreground">{viewProduct.description}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Price</dt><dd className="font-medium">{viewProduct.price}</dd></div>
              <div>
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="flex items-center gap-2 font-medium">
                {viewProduct.stockQuantity} <LowStockBadge stock={Number(viewProduct.stockQuantity)} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Supplier</dt>
                <dd className="font-medium">
                  {viewProduct.Supplier?.name ??
                  viewProduct.supplier?.name ??
                  viewProduct.supplierName ??
                  "—"}
                </dd>
              </div>
            </dl>
          </div>
        </Modal>
      )}
    </div>
  );
}