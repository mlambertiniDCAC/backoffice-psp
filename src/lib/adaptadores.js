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
  refExterna: fila?.ref_externa != null ? String(fila.ref_externa) : null,
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

export const refExternaDe = (cuenta) => cuenta?.refExterna ?? null;

export const cruzarLegajosConCuentas = (legajos, cuentas) => {
  const porSujeto = new Map(
    cuentas
      .filter((c) => c.sujetoVerificadoId !== null)
      .map((c) => [Number(c.sujetoVerificadoId), c])
  );
  return legajos.map((legajo) => {
    const cuenta = porSujeto.get(Number(legajo.sujetoVerificadoId)) ?? null;
    return {
      ...legajo,
      cuenta,
      refExterna: legajo.refExterna ?? refExternaDe(cuenta),
    };
  });
};
