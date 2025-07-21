const API_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, method = "GET", body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}
