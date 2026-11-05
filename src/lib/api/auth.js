import axiosInstance from "../axiosInstance";
import { unwrap } from "../apiResponse";

export const loginAdmin = async (mail, password) => {
  const respuesta = await axiosInstance.post("/v1/auth/login", {
    mail,
    password,
  });
  return unwrap(respuesta);
};

export const refrescarSesion = async () => {
  const respuesta = await axiosInstance.post("/v1/auth/refresh");
  return unwrap(respuesta);
};

export const cerrarSesion = async () => {
  await axiosInstance.post("/v1/auth/logout");
};
