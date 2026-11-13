export const MINIMO_TEXTO_BUSQUEDA = 4;

export const AVISO_BUSQUEDA_CORTA = `Escribí al menos ${MINIMO_TEXTO_BUSQUEDA} caracteres para buscar. Con menos, el filtro de seguridad del ingress puede cortar la consulta antes de que llegue a la aplicación (le pasa a textos como “sh”, “ls” o “env”), así que el backend rechaza las búsquedas cortas de entrada.`;

export const ESTADOS_IDENTIDAD = {
  REVOCADA: "revocada",
  VALIDADA: "validada",
  EN_CURSO: "en_curso",
  SIN_VALIDAR: "sin_validar",
};

export const ETIQUETAS_ESTADO_IDENTIDAD = {
  [ESTADOS_IDENTIDAD.REVOCADA]: "Revocada",
  [ESTADOS_IDENTIDAD.VALIDADA]: "Validada",
  [ESTADOS_IDENTIDAD.EN_CURSO]: "Validación en curso",
  [ESTADOS_IDENTIDAD.SIN_VALIDAR]: "Sin validar",
};

export const GRUPOS_STEP = {
  ERROR_SISTEMA: "Falló el sistema del proveedor",
  DISPOSITIVO_NO_COMPATIBLE: "El dispositivo no es compatible",
  SESION_VENCIDA: "La sesión de validación venció",
  CANT_MAX_INTENTOS: "Se agotaron los intentos permitidos",
  PERMISO_CAMARA: "No se dio permiso a la cámara",
  SALIDA_USUARIO: "La persona abandonó la validación",
  DOCUMENTO_NO_VALIDO: "El documento no se pudo validar",
  DISPOSITIVO_BLOQUEADO:
    "El dispositivo quedó bloqueado por sospecha de fraude",
};

export const RESULTADOS_VALIDACION = {
  success: "Validación exitosa",
  failed: "Validación rechazada",
  review_needed: "Quedó para revisión manual",
  exit: "La persona salió del flujo",
  timeout: "La transacción venció sin cerrarse",
  error: "Error durante la validación",
};

export const adaptarIntentoIdentidad = (intento) => ({
  id: intento?.id ?? null,
  flujo: intento?.flujo ?? null,
  estado: intento?.estado ?? null,
  resultado: intento?.resultado ?? null,
  step: intento?.step ?? null,
  grupo: intento?.grupo ?? null,
  descripcion: intento?.descripcion ?? null,
  minutosBloqueo: intento?.minutos_bloqueo ?? null,
  iniciadaEn: intento?.iniciada_en ?? null,
  finalizadaEn: intento?.finalizada_en ?? null,
  expiraEn: intento?.expira_en ?? null,
});

export const adaptarIdentidad = (identidad) => ({
  validada: identidad?.validada === true,
  validadaEn: identidad?.validada_en ?? null,
  revocadaEn: identidad?.revocada_en ?? null,
  revocadaPor: identidad?.revocada_por ?? null,
  motivoRevocacion: identidad?.motivo_revocacion ?? null,
  documento: identidad?.documento ?? null,
  cuil: identidad?.cuil ?? null,
  nombreDifiere: identidad?.nombre_difiere ?? null,
  cuitDifiere: identidad?.cuit_difiere ?? null,
  citizenId: identidad?.citizen_id ?? null,
  validacionId: identidad?.validacion_id ?? null,
  validacionEnCurso: identidad?.validacion_en_curso === true,
  validaciones: (identidad?.validaciones ?? []).map(adaptarIntentoIdentidad),
});

export const adaptarUsuarioPsp = (usuario) => ({
  usuarioSub: usuario?.sub ?? null,
  mail: usuario?.mail ?? null,
  nombre: usuario?.nombre ?? null,
  apellido: usuario?.apellido ?? null,
  habilitado: usuario?.habilitado === true,
  roles: usuario?.roles ?? [],
  identidad: adaptarIdentidad(usuario?.identidad),
});

export const adaptarConsultaProveedor = (consulta) => {
  if (!consulta) return null;
  const domicilio = consulta.domicilio ?? null;
  const documento = consulta.documento ?? null;
  const imagenes = consulta.imagenes ?? null;
  return {
    validacionId: consulta.validacion_id ?? null,
    usuarioSub: consulta.usuario_sub ?? null,
    consultadoEn: consulta.consultado_en ?? null,
    trxId: consulta.trx_id ?? null,
    conImagenes: consulta.con_imagenes === true,
    domicilio: domicilio
      ? {
          calle: domicilio.calle ?? null,
          numero: domicilio.numero ?? null,
          piso: domicilio.piso ?? null,
          departamento: domicilio.departamento ?? null,
          localidad: domicilio.localidad ?? null,
          provincia: domicilio.provincia ?? null,
          codigoPostal: domicilio.codigo_postal ?? null,
          formateado: domicilio.formateado ?? null,
        }
      : null,
    fechaNacimiento: consulta.fecha_nacimiento ?? null,
    scoreCotejoFacial: consulta.score_cotejo_facial ?? null,
    documento: documento
      ? {
          numero: documento.numero ?? null,
          vigente: documento.vigente ?? null,
          vigenciaHasta: documento.vigencia_hasta ?? null,
        }
      : null,
    imagenes: imagenes
      ? {
          frente: fuenteDeImagen(imagenes.frente),
          dorso: fuenteDeImagen(imagenes.dorso),
          selfie: fuenteDeImagen(imagenes.selfie),
        }
      : null,
  };
};

export const domicilioEnUnaLinea = (domicilio) => {
  if (!domicilio) return null;
  const calle = [domicilio.calle, domicilio.numero].filter(Boolean).join(" ");
  const unidad = [
    domicilio.piso ? `piso ${domicilio.piso}` : null,
    domicilio.departamento ? `depto ${domicilio.departamento}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const zona = [
    domicilio.localidad,
    domicilio.provincia,
    domicilio.codigoPostal,
  ]
    .filter(Boolean)
    .join(", ");
  const partes = [calle, unidad, zona].filter(Boolean);
  if (partes.length) return partes.join(" · ");
  const formateado = String(domicilio.formateado ?? "").trim();
  return formateado || null;
};

export const estadoDeIdentidad = (identidad) => {
  if (identidad?.revocadaEn) return ESTADOS_IDENTIDAD.REVOCADA;
  if (identidad?.validada) return ESTADOS_IDENTIDAD.VALIDADA;
  if (identidad?.validacionEnCurso) return ESTADOS_IDENTIDAD.EN_CURSO;
  return ESTADOS_IDENTIDAD.SIN_VALIDAR;
};

export const etiquetaDeIdentidad = (identidad) =>
  ETIQUETAS_ESTADO_IDENTIDAD[estadoDeIdentidad(identidad)];

export const motivoDeIntento = (intento) => {
  const propio = String(intento?.descripcion ?? "").trim();
  if (propio) return propio;
  const delGrupo = GRUPOS_STEP[intento?.grupo];
  if (delGrupo) return delGrupo;
  return null;
};

export const resultadoDeIntento = (intento) => {
  const resultado = intento?.resultado;
  if (!resultado) return null;
  return RESULTADOS_VALIDACION[resultado] ?? resultado;
};

export const minutosDeBloqueo = (step) => {
  const codigo = Number(step);
  if (!Number.isInteger(codigo) || codigo < 9000 || codigo > 9999) return null;
  return codigo - 9000;
};

export const textoNombreDifiere = (valor) => {
  if (valor === true)
    return "El nombre que la persona declaró en el alta no coincide con el del documento que escaneó.";
  if (valor === false)
    return "El nombre declarado en el alta coincide con el del documento escaneado.";
  return "Todavía no hay una validación cerrada con la que comparar el nombre declarado.";
};

export const textoCuitDifiere = (valor) => {
  if (valor === true)
    return "El CUIT que la persona declaró en el alta no coincide con el CUIL que RENAPER tiene para su documento.";
  if (valor === false)
    return "El CUIT declarado en el alta coincide con el CUIL del documento.";
  return "Todavía no hay una validación cerrada con la que comparar el CUIT declarado.";
};

export const fuenteDeImagen = (valor) => {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  if (texto.startsWith("data:")) return texto;
  return `data:image/jpeg;base64,${texto}`;
};
