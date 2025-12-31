export function getAuth() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");

  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return { token, user };
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}
