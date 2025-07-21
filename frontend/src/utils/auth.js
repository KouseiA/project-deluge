import { apiRequest } from "./api";

export async function register(username, password) {
  try {
    const data = await apiRequest("/auth/register", "POST", {
      username,
      password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ username: data.username })
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function login(username, password) {
  try {
    const data = await apiRequest("/auth/login", "POST", {
      username,
      password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ username: data.username })
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
