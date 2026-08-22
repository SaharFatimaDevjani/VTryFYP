import { getAuth } from "./Auth.js";

// same function as Auth.js's getAuth, kept under this name too since a
// couple of pages already import it from here
export const getStoredAuth = getAuth;

export const apiFetch = async (url, options = {}) => {
  const { token } = getAuth();

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
