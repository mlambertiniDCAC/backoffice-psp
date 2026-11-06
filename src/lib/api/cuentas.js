import axiosInstance from "../axiosInstance";
import { unwrap } from "../apiResponse";

const base = "/v1/cuentas";

export const listarCuentas = async ({
  refExterna,
  sujetoVerificadoId,
  activo,
  full,
} = {}) => {
  const params = {};
  if (refExterna !== undefined) params.refExterna = refExterna;
  if (sujetoVerificadoId !== undefined)
    params.sujetoVerificadoId = sujetoVerificadoId;
  if (activo !== undefined) params.activo = activo;
  if (full !== undefined) params.full = full;
  const respuesta = await axiosInstance.get(base, { params });
  return unwrap(respuesta) ?? [];
};

export const obtenerCuenta = async (cuentaIdExterno, full = true) => {
  const respuesta = await axiosInstance.get(`${base}/${cuentaIdExterno}`, {
    params: { full },
  });
  return unwrap(respuesta);
};

export const crearCuenta = async ({
  refExterna,
  sujetoVerificadoId,
  cuit,
  name,
}) => {
  const respuesta = await axiosInstance.post(base, {
    refExterna,
    sujetoVerificadoId,
    cuit,
    name,
    origen: "PSP",
  });
  return unwrap(respuesta);
};

export const corregirCuenta = async (
  cuentaIdExterno,
  { cambiosCuenta, cambiosSnapshot, alias }
) => {
  const body = {};
  if (cambiosCuenta) body.cambiosCuenta = cambiosCuenta;
  if (cambiosSnapshot) body.cambiosSnapshot = cambiosSnapshot;
  if (alias !== undefined) body.alias = alias;
  const respuesta = await axiosInstance.patch(
    `${base}/${cuentaIdExterno}`,
    body
  );
  return unwrap(respuesta);
};

export const informarCvu = (cuentaIdExterno, cvu) =>
  corregirCuenta(cuentaIdExterno, { cambiosCuenta: { cvu } });

export const corregirTitular = (cuentaIdExterno, cuit, name) =>
  corregirCuenta(cuentaIdExterno, { cambiosCuenta: { cuit, name } });

export const eliminarCuenta = async (cuentaIdExterno) => {
  await axiosInstance.delete(`${base}/${cuentaIdExterno}`);
};

export const listarUsuariosDeCuenta = async (cuentaIdExterno) => {
  const respuesta = await axiosInstance.get(
    `${base}/${cuentaIdExterno}/usuarios`
  );
  return unwrap(respuesta) ?? [];
};

export const revocarUsuario = async (cuentaIdExterno, usuarioId) => {
  const respuesta = await axiosInstance.post(
    `${base}/${cuentaIdExterno}/usuarios/${usuarioId}/revocar`,
    {}
  );
  return unwrap(respuesta);
};

export const listarMovimientos = async (cuentaCvuId) => {
  const respuesta = await axiosInstance.get("/v1/movimientos", {
    params: { cuentaCvuId },
  });
  return unwrap(respuesta) ?? [];
};

export const listarTransaccionesDeCuenta = async (cuentaCvuId) => {
  const respuesta = await axiosInstance.get(
    `/v1/transacciones/psp/cuentas/${cuentaCvuId}`
  );
  return unwrap(respuesta) ?? [];
};

export const reprocesarTransaccionesFallidas = async () => {
  const respuesta = await axiosInstance.post(
    "/v1/transacciones/recibidas/reprocesar-fallidas",
    {}
  );
  return unwrap(respuesta);
};

export const obtenerPermisosView = async (sujetoId) => {
  const respuesta = await axiosInstance.get(
    `/v1/sujetos/${sujetoId}/permisos/view`
  );
  return unwrap(respuesta) ?? {};
};
