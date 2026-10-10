import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sfr_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.error || error.message || "Request failed";
    if (error.response?.data?.fields) {
      const fieldList = Object.entries(error.response.data.fields)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      message = `${message}: ${fieldList}`;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
