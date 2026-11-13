import axiosInstance from "../axiosInstance";
import { unwrap } from "../apiResponse";

const base = "/v1/admin/identidad";

export const CANTIDAD_POR_DEFECTO = 20;

export const listarUsuarios = async ({
  texto,
  desde = 0,
  cantidad = CANTIDAD_POR_DEFECTO,
} = {}) => {
  const params = { desde, cantidad };
  if (texto) params.texto = texto;
  const respuesta = await axiosInstance.get(`${base}/usuarios`, { params });
  return unwrap(respuesta);
};

export const obtenerUsuario = async (usuarioSub) => {
  const respuesta = await axiosInstance.get(
    `${base}/usuarios/${encodeURIComponent(usuarioSub)}`
  );
  return unwrap(respuesta);
};

export const revocarIdentidad = async (usuarioSub, motivo) => {
  const respuesta = await axiosInstance.post(
    `${base}/usuarios/${encodeURIComponent(usuarioSub)}/revocar`,
    { motivo }
  );
  return unwrap(respuesta);
};

export const consultarIdentidadEnProveedor = async (
  validacionId,
  { imagenes = false } = {}
) => {
  const respuesta = await axiosInstance.get(
    `${base}/validaciones/${encodeURIComponent(validacionId)}/proveedor`,
    { params: { imagenes: imagenes === true } }
  );
  return unwrap(respuesta);
};
