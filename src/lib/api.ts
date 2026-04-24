import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
});

const TOKEN_KEY = "dfms_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // token expired or invalid → force re-login
      setToken(null);
      if (!location.pathname.endsWith("/login") && !location.pathname.endsWith("/signup")) {
        location.assign(import.meta.env.BASE_URL + "login");
      }
    }
    return Promise.reject(err);
  }
);

export const API_BASE_URL = baseURL;
