const localHosts = ["localhost", "127.0.0.1", "::1"];
const defaultApiBase = localHosts.includes(window.location.hostname)
  ? `http://${window.location.hostname === "::1" ? "[::1]" : window.location.hostname}:5000/api`
  : `${window.location.origin}/api`;
const API_BASE = (window.API_BASE_URL || defaultApiBase).replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("nr_token");
}

function saveSession(data) {
  localStorage.setItem("nr_token", data.token);
  localStorage.setItem("nr_user", JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem("nr_token");
  localStorage.removeItem("nr_user");
}

async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new Error(data.message || "Request failed. Please try again.");
  }
  return data;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function safeImageUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
