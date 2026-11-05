import axios from "axios";
import { authStorage } from "./authStorage";

const axiosInstance = axios.create({
  baseURL: __APIGW_PSP_URL__ || "",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
};

const forceLogout = () => {
  authStorage.clear();
  window.location.reload();
};

axiosInstance.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const isAuthEndpoint =
      url.includes("/v1/auth/login") || url.includes("/v1/auth/refresh");

    if (status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (!authStorage.getToken()) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => axiosInstance(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axiosInstance.post("/v1/auth/refresh");
      processQueue(null);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getAxiosInstance = async () => axiosInstance;

export default axiosInstance;
