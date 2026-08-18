/*
 * API service layer.
 *
 * This is the ONLY place that talks to the Express backend.
 * Replace VITE_API_URL in your .env file to point at the real server, e.g.
 *   VITE_API_URL=http://localhost:5000
 */

const BASE_URL = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "ims_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Low level request helper: adds the JWT and parses errors. */
async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection.");
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error((data && (data.message || data.error)) || `Request failed (${response.status})`);
  }
  return data;
}

/* ---------------- Authentication ---------------- */

export const authApi = {
  // POST /api/auth/login  ->  { token, user }
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),
};

/* ---------------- Products ---------------- */

export const productsApi = {
  // GET /api/products?search=&supplierId=
  list: ({ search = "", supplierId = "" } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (supplierId) params.set("supplierId", supplierId);
    const qs = params.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  get: (id) => request(`/products/${id}`),
  // formData contains name, description, price, stockQuantity, supplierId, image (File)
  create: (formData) => request("/products", { method: "POST", body: formData, isFormData: true }),
  update: (id, formData) =>
    request(`/products/${id}`, { method: "PUT", body: formData, isFormData: true }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

/* ---------------- Suppliers ---------------- */

export const suppliersApi = {
  list: () => request("/suppliers"),
  get: (id) => request(`/suppliers/${id}`),
  create: (supplier) => request("/suppliers", { method: "POST", body: supplier }),
  update: (id, supplier) => request(`/suppliers/${id}`, { method: "PUT", body: supplier }),
  remove: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
};

export const LOW_STOCK_THRESHOLD = 5;