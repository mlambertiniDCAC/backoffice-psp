export const ESTADOS_COMPLIANCE = [
  { value: "en_revision", label: "En revisión" },
  { value: "aceptado_sin_firma", label: "Aceptado sin firma" },
  { value: "aceptado", label: "Aceptado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "bloqueado", label: "Bloqueado" },
];

export const ESTADOS_DOCUMENTO_REVISION = [
  { value: "aceptado", label: "Aceptar" },
  { value: "rechazado", label: "Rechazar" },
  { value: "en_revision", label: "Volver a revisión" },
];

export const SITUACIONES_CUENTA = {
  ACTIVA: "ACTIVA",
  INACTIVA: "INACTIVA",
  EN_PROCESO: "EN_PROCESO",
  SUSPENDIDA: "SUSPENDIDA",
};

export const CARGOS_PERSONA = [
  { value: "beneficiario_final", label: "Beneficiario final" },
  { value: "presidente", label: "Presidente" },
  { value: "gerente", label: "Gerente" },
  { value: "director", label: "Director" },
  { value: "apoderado", label: "Apoderado" },
  { value: "accionista", label: "Accionista" },
  { value: "socio_srl", label: "Socio SRL" },
  { value: "socio_sh", label: "Socio SH" },
  { value: "heredero", label: "Heredero" },
  { value: "administrador", label: "Administrador" },
];

export const ESTADOS_CONTRATO = [
  "borrador",
  "pendiente_firma",
  "en_proceso_firma",
  "completado",
  "cancelado",
];
