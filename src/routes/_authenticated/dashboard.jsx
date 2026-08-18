import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LOW_STOCK_THRESHOLD, productsApi, suppliersApi } from "@/services/api";
import Loading from "@/components/Loading";
import { EmptyState, ErrorMessage } from "@/components/Message";
import { LowStockBadge, ProductImage } from "@/components/ProductCard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockDesk Inventory" },
      { name: "description", content: "Overview of products, suppliers and low-stock items." },
      { property: "og:title", content: "Dashboard — StockDesk Inventory" },
      { property: "og:description", content: "Overview of products, suppliers and low-stock items." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({ label, value, accent }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productList, supplierList] = await Promise.all([
          productsApi.list(),
          suppliersApi.list(),
        ]);
        if (!active) return;
        setProducts(Array.isArray(productList) ? productList : []);
        setSuppliers(Array.isArray(supplierList) ? supplierList : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const lowStock = products.filter(
  (p) => Number(p.stockQuantity) < LOW_STOCK_THRESHOLD
);
  const recent = [...products].slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Inventory overview</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total products" value={products.length} />
            <StatCard label="Total suppliers" value={suppliers.length} />
            <StatCard label="Low-stock products" value={lowStock.length} accent="text-warning" />
          </div>

          <section className="panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-medium">Recently added products</h2>
              <Link to="/products" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState message="No products found." />
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                    <ProductImage product={product} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.Supplier?.name ?? product.supplier?.name ?? product.supplierName ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Stock: {product.stockQuantity}</span>
                      <LowStockBadge stock={Number(product.stockQuantity)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}