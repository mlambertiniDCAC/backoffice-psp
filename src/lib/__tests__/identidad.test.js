import { describe, it, expect } from "vitest";
import {
  adaptarConsultaProveedor,
  adaptarUsuarioPsp,
  domicilioEnUnaLinea,
  estadoDeIdentidad,
  etiquetaDeIdentidad,
  fuenteDeImagen,
  minutosDeBloqueo,
  motivoDeIntento,
  resultadoDeIntento,
  textoCuitDifiere,
  textoNombreDifiere,
} from "../identidad";

describe("adaptarUsuarioPsp", () => {
  it("adapta el usuario y su identidad", () => {
    const usuario = adaptarUsuarioPsp({
      sub: "11111111-1111-1111-1111-111111111111",
      mail: "ana@ejemplo.com",
      nombre: "Ana",
      apellido: "Pérez",
      habilitado: true,
      roles: ["usuario"],
      identidad: {
        validada: true,
        validada_en: "2026-11-10T12:00:00Z",
        documento: "22826019",
        cuil: "20228260194",
        nombre_difiere: false,
        cuit_difiere: true,
        citizen_id: "5631c242-0000-4000-8000-000000000000",
        validacion_id: 3,
        validaciones: [
          {
            id: 3,
            step: "701",
            grupo: "SESION_VENCIDA",
            descripcion: null,
            minutos_bloqueo: null,
            expira_en: "2026-11-13T03:13:47.966Z",
          },
        ],
      },
    });

    expect(usuario.usuarioSub).toBe("11111111-1111-1111-1111-111111111111");
    expect(usuario.identidad.validada).toBe(true);
    expect(usuario.identidad.cuil).toBe("20228260194");
    expect(usuario.identidad.cuitDifiere).toBe(true);
    expect(usuario.identidad.citizenId).toBe(
      "5631c242-0000-4000-8000-000000000000"
    );
    expect(usuario.identidad.validacionId).toBe(3);
    expect(usuario.identidad.validaciones).toHaveLength(1);
    expect(usuario.identidad.validaciones[0].grupo).toBe("SESION_VENCIDA");
    expect(usuario.identidad.validaciones[0].expiraEn).toBe(
      "2026-11-13T03:13:47.966Z"
    );
  });

  it("el identificador del usuario es sub, no usuario_sub", () => {
    expect(adaptarUsuarioPsp({ usuario_sub: "viejo" }).usuarioSub).toBeNull();
    expect(adaptarUsuarioPsp({ sub: "nuevo" }).usuarioSub).toBe("nuevo");
  });

  it("un usuario sin identidad queda sin validar y sin flags resueltos", () => {
    const usuario = adaptarUsuarioPsp({ sub: "abc", mail: "a@b.com" });

    expect(usuario.identidad.validada).toBe(false);
    expect(usuario.identidad.nombreDifiere).toBeNull();
    expect(usuario.identidad.cuitDifiere).toBeNull();
    expect(usuario.identidad.validacionId).toBeNull();
    expect(usuario.identidad.validaciones).toEqual([]);
    expect(usuario.roles).toEqual([]);
  });
});

describe("estadoDeIdentidad", () => {
  it("una identidad revocada pesa más que validada", () => {
    expect(
      estadoDeIdentidad({ validada: true, revocadaEn: "2026-11-12T00:00:00Z" })
    ).toBe("revocada");
  });

  it("validada cuando está validada y no revocada", () => {
    expect(estadoDeIdentidad({ validada: true, revocadaEn: null })).toBe(
      "validada"
    );
  });

  it("en curso cuando no validó pero tiene una validación abierta", () => {
    expect(
      estadoDeIdentidad({ validada: false, validacionEnCurso: true })
    ).toBe("en_curso");
  });

  it("sin validar cuando nunca validó", () => {
    expect(estadoDeIdentidad({ validada: false })).toBe("sin_validar");
    expect(estadoDeIdentidad(undefined)).toBe("sin_validar");
  });

  it("cada estado tiene su etiqueta en castellano", () => {
    expect(etiquetaDeIdentidad({ validada: true })).toBe("Validada");
    expect(etiquetaDeIdentidad({ revocadaEn: "hoy" })).toBe("Revocada");
    expect(etiquetaDeIdentidad({ validacionEnCurso: true })).toBe(
      "Validación en curso"
    );
    expect(etiquetaDeIdentidad({})).toBe("Sin validar");
  });
});

describe("motivoDeIntento", () => {
  it("usa la descripción que manda el backend", () => {
    expect(
      motivoDeIntento({
        descripcion: "La sesión venció",
        grupo: "SESION_VENCIDA",
      })
    ).toBe("La sesión venció");
  });

  it("traduce el grupo cuando el backend no manda descripción", () => {
    expect(motivoDeIntento({ grupo: "PERMISO_CAMARA" })).toBe(
      "No se dio permiso a la cámara"
    );
  });

  it("no inventa un motivo para un grupo desconocido", () => {
    expect(motivoDeIntento({ grupo: "ALGO_NUEVO", step: "999" })).toBeNull();
  });

  it("no inventa un motivo cuando no hubo corte", () => {
    expect(motivoDeIntento({ resultado: "success" })).toBeNull();
  });

  it("una descripción de solo espacios cae al grupo", () => {
    expect(
      motivoDeIntento({ descripcion: "   ", grupo: "ERROR_SISTEMA" })
    ).toBe("Falló el sistema del proveedor");
  });
});

describe("resultadoDeIntento", () => {
  it("traduce los resultados conocidos", () => {
    expect(resultadoDeIntento({ resultado: "success" })).toBe(
      "Validación exitosa"
    );
    expect(resultadoDeIntento({ resultado: "review_needed" })).toBe(
      "Quedó para revisión manual"
    );
  });

  it("deja pasar un resultado que no conoce", () => {
    expect(resultadoDeIntento({ resultado: "otra_cosa" })).toBe("otra_cosa");
  });

  it("sin resultado devuelve null", () => {
    expect(resultadoDeIntento({})).toBeNull();
  });
});

describe("minutosDeBloqueo", () => {
  it("los últimos tres dígitos del rango 9000-9999 son los minutos", () => {
    expect(minutosDeBloqueo("9001")).toBe(1);
    expect(minutosDeBloqueo("9050")).toBe(50);
    expect(minutosDeBloqueo("9000")).toBe(0);
  });

  it("un step fuera del rango no habla de bloqueo", () => {
    expect(minutosDeBloqueo("701")).toBeNull();
    expect(minutosDeBloqueo(null)).toBeNull();
    expect(minutosDeBloqueo("abc")).toBeNull();
  });
});

describe("los flags de discrepancia se explican en palabras", () => {
  it("nombre que difiere dice qué no coincide", () => {
    expect(textoNombreDifiere(true)).toContain("no coincide");
    expect(textoNombreDifiere(true)).toContain("declaró en el alta");
  });

  it("nombre que no difiere lo dice en positivo", () => {
    expect(textoNombreDifiere(false)).toContain("coincide");
    expect(textoNombreDifiere(false)).not.toContain("no coincide");
  });

  it("sin dato no afirma ni niega", () => {
    expect(textoNombreDifiere(null)).toContain("Todavía no hay");
    expect(textoCuitDifiere(undefined)).toContain("Todavía no hay");
  });

  it("el CUIT que difiere nombra el CUIL del documento", () => {
    expect(textoCuitDifiere(true)).toContain("CUIL");
    expect(textoCuitDifiere(true)).toContain("no coincide");
  });

  it("ningún texto es un booleano crudo", () => {
    [textoNombreDifiere, textoCuitDifiere].forEach((texto) => {
      [true, false, null].forEach((valor) => {
        expect(texto(valor)).not.toMatch(/true|false/);
      });
    });
  });
});

describe("fuenteDeImagen", () => {
  it("deja pasar un data url", () => {
    expect(fuenteDeImagen("data:image/png;base64,AAA")).toBe(
      "data:image/png;base64,AAA"
    );
  });

  it("le pone el prefijo a un base64 pelado", () => {
    expect(fuenteDeImagen("AAA")).toBe("data:image/jpeg;base64,AAA");
  });

  it("sin imagen devuelve null", () => {
    expect(fuenteDeImagen(null)).toBeNull();
    expect(fuenteDeImagen("")).toBeNull();
  });
});

describe("adaptarConsultaProveedor", () => {
  it("adapta la consulta sin imágenes", () => {
    const consulta = adaptarConsultaProveedor({
      validacion_id: 3,
      usuario_sub: "11111111-1111-1111-1111-111111111111",
      consultado_en: "2026-11-13T18:00:00Z",
      trx_id: "01JCB",
      con_imagenes: false,
      domicilio: {
        calle: "Corrientes",
        numero: "1234",
        localidad: "CABA",
        provincia: "Buenos Aires",
        codigo_postal: "C1043",
      },
      fecha_nacimiento: "1975-03-14",
      score_cotejo_facial: 98.7,
      documento: {
        numero: "22826019",
        vigente: true,
        vigencia_hasta: "2031-05-02",
      },
    });

    expect(consulta.validacionId).toBe(3);
    expect(consulta.usuarioSub).toBe("11111111-1111-1111-1111-111111111111");
    expect(consulta.conImagenes).toBe(false);
    expect(consulta.consultadoEn).toBe("2026-11-13T18:00:00Z");
    expect(consulta.scoreCotejoFacial).toBe(98.7);
    expect(consulta.documento.vigenciaHasta).toBe("2031-05-02");
    expect(consulta.imagenes).toBeNull();
  });

  it("convierte las tres fotos en fuentes mostrables", () => {
    const consulta = adaptarConsultaProveedor({
      imagenes: {
        frente: "AAA",
        dorso: null,
        selfie: "data:image/png;base64,BBB",
      },
    });

    expect(consulta.imagenes.frente).toBe("data:image/jpeg;base64,AAA");
    expect(consulta.imagenes.dorso).toBeNull();
    expect(consulta.imagenes.selfie).toBe("data:image/png;base64,BBB");
  });

  it("una vigencia que no se pudo determinar queda en null, no en false", () => {
    const consulta = adaptarConsultaProveedor({
      documento: { numero: "44560910", vigente: null, vigencia_hasta: null },
    });

    expect(consulta.documento.vigente).toBeNull();
    expect(consulta.documento.vigente).not.toBe(false);
  });

  it("domicilio y documento vienen completos aunque todo sea null", () => {
    const consulta = adaptarConsultaProveedor({
      validacion_id: 3,
      domicilio: {
        calle: null,
        numero: null,
        piso: null,
        departamento: null,
        localidad: null,
        provincia: null,
        codigo_postal: null,
        formateado: null,
      },
      documento: { numero: null, vigente: null, vigencia_hasta: null },
      fecha_nacimiento: null,
      score_cotejo_facial: null,
      imagenes: null,
    });

    expect(Object.keys(consulta.domicilio)).toHaveLength(8);
    expect(consulta.domicilio.codigoPostal).toBeNull();
    expect(consulta.documento.numero).toBeNull();
    expect(domicilioEnUnaLinea(consulta.domicilio)).toBeNull();
  });

  it("sin respuesta devuelve null", () => {
    expect(adaptarConsultaProveedor(null)).toBeNull();
  });
});

describe("domicilioEnUnaLinea", () => {
  it("arma calle, unidad y zona", () => {
    expect(
      domicilioEnUnaLinea({
        calle: "Corrientes",
        numero: "1234",
        piso: "3",
        departamento: "B",
        localidad: "CABA",
        codigoPostal: "C1043",
      })
    ).toBe("Corrientes 1234 · piso 3 depto B · CABA, C1043");
  });

  it("sin domicilio devuelve null", () => {
    expect(domicilioEnUnaLinea(null)).toBeNull();
    expect(domicilioEnUnaLinea({})).toBeNull();
  });

  it("si solo vino el domicilio formateado lo usa", () => {
    expect(domicilioEnUnaLinea({ formateado: "EOLO, 833, PINAMAR" })).toBe(
      "EOLO, 833, PINAMAR"
    );
  });

  it("con las partes cargadas no necesita el formateado del proveedor", () => {
    expect(
      domicilioEnUnaLinea({
        calle: "Corrientes",
        numero: "1234",
        formateado: "OTRA COSA",
      })
    ).toBe("Corrientes 1234");
  });
});
