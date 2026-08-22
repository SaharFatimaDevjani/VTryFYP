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

  // if we're uploading a file, the browser needs to set its own
  // multipart content-type header (with the boundary) - setting it
  // manually to json here would break the upload
  const isFormData =
    options?.body && typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // some error responses come back as html instead of json (e.g. a
  // proxy/server error page), so just fall back to an empty object
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};
