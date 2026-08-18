import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { suppliersApi } from "@/services/api";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import SupplierForm from "@/components/SupplierForm";
import { EmptyState, ErrorMessage, SuccessMessage } from "@/components/Message";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — StockDesk Inventory" },
      { name: "description", content: "Manage suppliers and see how many products each one supplies." },
      { property: "og:title", content: "Suppliers — StockDesk Inventory" },
      {
        property: "og:description",
        content: "Manage suppliers and see how many products each one supplies.",
      },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await suppliersApi.list();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load suppliers.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await suppliersApi.update(editing.id, values);
        setSuccess("Supplier updated successfully.");
      } else {
        await suppliersApi.create(values);
        setSuccess("Supplier created successfully.");
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err.message || (editing ? "Unable to update supplier." : "Unable to create supplier."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Delete "${supplier.name}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await suppliersApi.remove(supplier.id);
      setSuccess("Supplier deleted successfully.");
      await load();
    } catch (err) {
      setError(
        err.message ||
          "Supplier could not be deleted because it is associated with products.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Companies that supply your products</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <Loading label="Loading suppliers..." />
      ) : suppliers.length === 0 ? (
        <div className="panel">
          <EmptyState message="No suppliers found." />
        </div>
      ) : (
        <>
          <div className="panel hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Products</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-4 py-3 font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{supplier.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{supplier.phone}</td>
                    <td className="px-4 py-3">{supplier.productCount ?? supplier.products?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => {
                            setEditing(supplier);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(supplier)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="panel p-4">
                <h3 className="font-medium">{supplier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{supplier.email}</p>
                <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                <p className="mt-2 text-sm">
                  Products supplied: {supplier.productCount ?? supplier.products?.length ?? 0}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => {
                      setEditing(supplier);
                      setFormOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(supplier)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {formOpen && (
        <Modal
          title={editing ? "Edit supplier" : "Add supplier"}
          onClose={() => setFormOpen(false)}
        >
          <SupplierForm
            supplier={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}