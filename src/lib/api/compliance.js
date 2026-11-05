import axiosInstance from "../axiosInstance";
import { unwrap } from "../apiResponse";

const base = "/v1/compliance";
const admin = "/v1/admin/compliance";

export const listarCompliances = async ({
  estado,
  pagina = 1,
  ordenadoPor = "fecha",
  sujetoVerificadoId,
} = {}) => {
  const params = { resumida: true, pagina, ordenado_por: ordenadoPor };
  if (estado) params.estado = estado;
  if (sujetoVerificadoId) params.sujeto_verificado_id = sujetoVerificadoId;
  const respuesta = await axiosInstance.get(base, { params });
  return unwrap(respuesta);
};

export const obtenerCompliance = async (sujetoVerificadoId) => {
  const respuesta = await axiosInstance.get(`${base}/${sujetoVerificadoId}`);
  return unwrap(respuesta);
};

export const obtenerPasosLegajo = async (sujetoVerificadoId, step) => {
  const respuesta = await axiosInstance.get(
    `${admin}/${sujetoVerificadoId}/steps`,
    {
      params: step === undefined ? undefined : { step },
    }
  );
  return unwrap(respuesta);
};

export const crearDraftLegajo = async (sujetoVerificadoId, body) => {
  const respuesta = await axiosInstance.post(
    `${admin}/${sujetoVerificadoId}/draft`,
    body
  );
  return unwrap(respuesta);
};

export const guardarDraftLegajo = async (sujetoVerificadoId, body) => {
  const respuesta = await axiosInstance.put(
    `${admin}/${sujetoVerificadoId}/draft`,
    body
  );
  return unwrap(respuesta);
};

export const subirDocumentoLegajo = async (
  sujetoVerificadoId,
  archivo,
  documentType,
  docTipoId
) => {
  const form = new FormData();
  form.append("file", archivo);
  form.append("documentType", documentType);
  if (docTipoId !== undefined)
    form.append("compliances_documentos_tipos_id", docTipoId);
  const respuesta = await axiosInstance.post(
    `${admin}/${sujetoVerificadoId}/documentos`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return unwrap(respuesta);
};

export const subirVersionDocumento = async (
  sujetoVerificadoId,
  documentoId,
  archivo,
  documentType
) => {
  const form = new FormData();
  form.append("file", archivo);
  form.append("documentType", documentType);
  const respuesta = await axiosInstance.post(
    `${admin}/${sujetoVerificadoId}/documentos/${documentoId}/versiones`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return unwrap(respuesta);
};

export const revisarDocumento = async (
  sujetoVerificadoId,
  documentoId,
  estado,
  motivo
) => {
  const respuesta = await axiosInstance.put(
    `${base}/${sujetoVerificadoId}/documentos/${documentoId}`,
    motivo ? { estado, motivo } : { estado }
  );
  return unwrap(respuesta);
};

export const listarPersonas = async (sujetoVerificadoId) => {
  const respuesta = await axiosInstance.get(
    `${base}/${sujetoVerificadoId}/personas`
  );
  return unwrap(respuesta);
};

export const crearPersona = async (sujetoVerificadoId, persona) => {
  const respuesta = await axiosInstance.post(
    `${base}/${sujetoVerificadoId}/personas`,
    persona
  );
  return unwrap(respuesta);
};

export const actualizarPersona = async (
  sujetoVerificadoId,
  personaId,
  cambios
) => {
  const respuesta = await axiosInstance.patch(
    `${base}/${sujetoVerificadoId}/personas/${personaId}`,
    cambios
  );
  return unwrap(respuesta);
};

export const listarEsquemaFirmantes = async (sujetoVerificadoId) => {
  const respuesta = await axiosInstance.get(
    `${base}/${sujetoVerificadoId}/esquema-firmantes`
  );
  return unwrap(respuesta);
};

export const crearEsquemaFirmantes = async (sujetoVerificadoId, esquema) => {
  const respuesta = await axiosInstance.post(
    `${base}/${sujetoVerificadoId}/esquema-firmantes`,
    esquema
  );
  return unwrap(respuesta);
};

export const listarContratos = async (sujetoVerificadoId) => {
  const respuesta = await axiosInstance.get(
    `${base}/${sujetoVerificadoId}/contratos`
  );
  return unwrap(respuesta);
};

export const obtenerContrato = async (contratoId) => {
  const respuesta = await axiosInstance.get(`${base}/contratos/${contratoId}`);
  return unwrap(respuesta);
};

export const listarFirmantes = async (contratoId) => {
  const respuesta = await axiosInstance.get(
    `${base}/contratos/${contratoId}/firmantes`
  );
  return unwrap(respuesta);
};

export const listarDocumentosContrato = async (contratoId) => {
  const respuesta = await axiosInstance.get(
    `${base}/contratos/${contratoId}/documentos`
  );
  return unwrap(respuesta);
};

export const publicarContrato = async (contratoId) => {
  const respuesta = await axiosInstance.post(
    `${base}/contratos/${contratoId}/publicar`,
    {}
  );
  return unwrap(respuesta);
};

export const aceptarCompliance = async (refExterna, cuit, name) => {
  const respuesta = await axiosInstance.post(`${base}/${refExterna}/aceptar`, {
    cuit,
    name,
  });
  return unwrap(respuesta);
};

export const aceptarSinFirma = async (sujetoVerificadoId, body = {}) => {
  const respuesta = await axiosInstance.post(
    `${base}/${sujetoVerificadoId}/aceptar-sin-firma`,
    body
  );
  return unwrap(respuesta);
};

export const rechazarCompliance = async (sujetoVerificadoId, observaciones) => {
  const respuesta = await axiosInstance.post(
    `${base}/${sujetoVerificadoId}/rechazar`,
    {
      observaciones,
    }
  );
  return unwrap(respuesta);
};

export const bloquearCompliance = async (refExterna, motivo) => {
  const respuesta = await axiosInstance.post(`${base}/${refExterna}/bloquear`, {
    motivo,
  });
  return unwrap(respuesta);
};

export const desbloquearCompliance = async (refExterna) => {
  const respuesta = await axiosInstance.post(
    `${base}/${refExterna}/desbloquear`,
    {}
  );
  return unwrap(respuesta);
};

export const reiniciarCompliance = async (sujetoVerificadoId) => {
  const respuesta = await axiosInstance.post(
    `${base}/${sujetoVerificadoId}/reiniciar`,
    {}
  );
  return unwrap(respuesta);
};

export const sincronizarPermisos = async (refExterna) => {
  const respuesta = await axiosInstance.post(
    `${base}/${refExterna}/permisos/sincronizar`,
    {}
  );
  return unwrap(respuesta);
};

export const listarProvincias = async () => {
  const respuesta = await axiosInstance.get("/v1/catalogos/provincias");
  return unwrap(respuesta);
};

export const listarPartidos = async (provinciaId) => {
  const respuesta = await axiosInstance.get("/v1/catalogos/partidos", {
    params: { provincia_id: provinciaId },
  });
  return unwrap(respuesta);
};
