import { SITUACIONES_CUENTA } from "./constants";

export const adaptarFilaLegajo = (fila) => ({
  complianceId: fila?.id ?? null,
  sujetoVerificadoId: fila?.sujeto_verificado_fillable ?? null,
  refExterna: fila?.ref_externa ?? null,
  tipo: fila?.tipo ?? null,
  estado: fila?.estado ?? null,
  documentosTotal: fila?.documentos_total ?? 0,
  documentosPorRevisar: fila?.documentos_por_revisar ?? 0,
  fechaCreacion: fila?.fecha_creacion ?? null,
  documentos: fila?.documentos ?? [],
  cuenta: null,
});

export const adaptarCuenta = (fila) => ({
  cuentaIdExterno: fila?.cuenta_id_externo ?? null,
  clientId: fila?.client_id ?? null,
  sujetoVerificadoId: fila?.sujeto_verificado_id ?? null,
  cuit: fila?.cuit ?? null,
  titular: fila?.name ?? null,
  cvu: fila?.cvu || null,
  alias: fila?.alias ?? null,
  moneda: fila?.currency ?? null,
  situacion: fila?.situacion_cuenta ?? null,
  saldo: fila?.saldo ?? null,
  usuarios: fila?.usuarios ?? [],
  ultimoError: fila?.ultimo_error ?? null,
});

export const estaTrabada = (cuenta) =>
  cuenta?.situacion === SITUACIONES_CUENTA.EN_PROCESO && !cuenta?.cvu;

export const cruzarLegajosConCuentas = (legajos, cuentas) => {
  const porSujeto = new Map(
    cuentas
      .filter((c) => c.sujetoVerificadoId !== null)
      .map((c) => [Number(c.sujetoVerificadoId), c])
  );
  return legajos.map((legajo) => ({
    ...legajo,
    cuenta: porSujeto.get(Number(legajo.sujetoVerificadoId)) ?? null,
  }));
};

const CLASE_TRANSPORTE = new Set(["SIN_RESPUESTA"]);
const CLASE_NUESTRA = new Set(["ALTA_NO_REGISTRADA"]);

export const describirMotivo = (ultimoError, error) => {
  if (ultimoError?.codigo) {
    const { codigo, mensaje } = ultimoError;
    if (CLASE_TRANSPORTE.has(codigo)) {
      return {
        clase: "transporte",
        titulo: "El bridge no respondió",
        detalle: mensaje || "Sin detalle. Reintentar es seguro.",
      };
    }
    if (CLASE_NUESTRA.has(codigo)) {
      return {
        clase: "nuestra",
        titulo: "No se registró el alta de nuestro lado",
        detalle: mensaje || "Verificar el estado de la cuenta antes de actuar.",
      };
    }
    return {
      clase: "rechazo",
      titulo: `BIND rechazó el alta (${codigo})`,
      detalle: mensaje || "Sin detalle del proveedor.",
    };
  }

  const status = error?.response?.status;
  if (status && status >= 500) {
    return {
      clase: "desconocido",
      titulo: "El servicio no pudo responder",
      detalle: "El motivo real no llega en un 5xx. Ver los logs del servicio.",
    };
  }
  if (status) {
    return {
      clase: "rechazo",
      titulo: "La operación fue rechazada",
      detalle: error?.response?.data?.error?.message ?? "Sin detalle.",
    };
  }
  return {
    clase: "desconocido",
    titulo: "Sin motivo registrado",
    detalle: "No hay un fallo guardado para esta cuenta.",
  };
};
