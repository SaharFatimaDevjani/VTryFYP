// Frontend/src/utils/api.js

export const getStoredAuth = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");

  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return { token, user };
};

export const apiFetch = async (url, options = {}) => {
  const { token } = getStoredAuth();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};
