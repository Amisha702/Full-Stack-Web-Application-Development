import { LOW_STOCK_THRESHOLD } from "@/services/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export function LowStockBadge({ stock }) {
  if (stock >= LOW_STOCK_THRESHOLD) return null;
  return <span className="badge bg-warning/20 text-warning-foreground">Low Stock</span>;
}

export function ProductImage({ product, className = "h-12 w-12" }) {
  const imagePath = product.imageUrl || product.image;
  const API_URL = import.meta.env.VITE_API_URL || "";

  const src = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${API_URL}${imagePath}`
    : null;

  return src ? (
    <img
      src={src}
      alt={product.name}
      loading="lazy"
      className={`${className} shrink-0 rounded border border-border object-cover`}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div
      className={`${className} shrink-0 rounded border border-border bg-secondary text-[10px] text-muted-foreground flex items-center justify-center`}
    >
      No image
    </div>
  );
}

/** Card layout used on small screens. */
export default function ProductCard({ product, onView, onEdit, onDelete }) {
  const lowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;
  return (
    <div className={`panel p-4 ${lowStock ? "border-warning/50 bg-warning/5" : ""}`}>
      <div className="flex gap-3">
        <ProductImage product={product} className="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{product.name}</h3>
            <LowStockBadge stock={product.stockQuantity} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex gap-1"><dt className="text-muted-foreground">Price:</dt><dd>{product.price}</dd></div>
            <div className="flex gap-1"><dt className="text-muted-foreground">Stock:</dt><dd>{product.stock}</dd></div>
            <div className="col-span-2 flex gap-1">
              <dt className="text-muted-foreground">Supplier:</dt>
              <dd className="truncate">
                {product.Supplier?.name ?? product.supplier?.name ?? product.supplierName ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-outline btn-sm" onClick={() => onView(product)}>View</button>
        <button className="btn-outline btn-sm" onClick={() => onEdit(product)}>Edit</button>
        <button className="btn-danger btn-sm" onClick={() => onDelete(product)}>Delete</button>
      </div>
    </div>
  );
}