import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/usuarios", () => ({
  CANTIDAD_POR_DEFECTO: 20,
  listarUsuarios: vi.fn(),
  obtenerUsuario: vi.fn(),
  consultarIdentidadEnProveedor: vi.fn(),
  revocarIdentidad: vi.fn(),
}));

let reducer;
let cargarUsuarios;
let cargarUsuario;
let consultarProveedor;
let traerImagenesDelProveedor;
let limpiarProveedor;
let selectTotalPaginas;
let selectPagina;
let listarUsuarios;
let obtenerUsuario;
let consultarIdentidadEnProveedor;
let revocarIdentidad;
let revocarIdentidadDeUsuario;
let MINIMO_TEXTO_BUSQUEDA;

const SUB = "11111111-1111-1111-1111-111111111111";

beforeAll(async () => {
  const slice = await import("../store/usuariosPspSlice");
  reducer = slice.default;
  cargarUsuarios = slice.cargarUsuarios;
  cargarUsuario = slice.cargarUsuario;
  consultarProveedor = slice.consultarProveedor;
  traerImagenesDelProveedor = slice.traerImagenesDelProveedor;
  limpiarProveedor = slice.limpiarProveedor;
  revocarIdentidadDeUsuario = slice.revocarIdentidadDeUsuario;
  selectTotalPaginas = slice.selectTotalPaginas;
  selectPagina = slice.selectPagina;
  ({
    listarUsuarios,
    obtenerUsuario,
    consultarIdentidadEnProveedor,
    revocarIdentidad,
  } = await import("src/lib/api/usuarios"));
  ({ MINIMO_TEXTO_BUSQUEDA } = await import("src/lib/identidad"));
});

const crearStore = () => configureStore({ reducer: { usuariosPsp: reducer } });

const paginaDe = (usuarios, total, desde = 0) => ({
  total,
  desde,
  cantidad: 20,
  usuarios,
});

describe("cargarUsuarios", () => {
  it("pide desde el principio y sin búsqueda", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));
    const store = crearStore();

    await store.dispatch(cargarUsuarios());

    expect(listarUsuarios).toHaveBeenLastCalledWith({
      texto: undefined,
      desde: 0,
      cantidad: 20,
    });
  });

  it("pasa el texto buscado y el offset", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0, 20));
    const store = crearStore();

    await store.dispatch(cargarUsuarios({ texto: "ana@", desde: 20 }));

    expect(listarUsuarios).toHaveBeenLastCalledWith({
      texto: "ana@",
      desde: 20,
      cantidad: 20,
    });
    expect(store.getState().usuariosPsp.texto).toBe("ana@");
  });

  it("un texto de menos de cuatro caracteres no llega al backend", async () => {
    listarUsuarios.mockClear();
    listarUsuarios.mockResolvedValue(paginaDe([], 0));
    const store = crearStore();

    await store.dispatch(cargarUsuarios({ texto: "ls" }));

    expect(listarUsuarios).not.toHaveBeenCalled();
    expect(store.getState().usuariosPsp.error).toContain(
      `${MINIMO_TEXTO_BUSQUEDA} caracteres`
    );
    expect(store.getState().usuariosPsp.cargando).toBe(false);
  });

  it("un texto con espacios de más se recorta antes de medirlo", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));
    const store = crearStore();

    await store.dispatch(cargarUsuarios({ texto: "  anab  " }));

    expect(listarUsuarios).toHaveBeenLastCalledWith({
      texto: "anab",
      desde: 0,
      cantidad: 20,
    });
  });

  it("un texto que es solo espacios busca sin filtro", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));
    const store = crearStore();

    await store.dispatch(cargarUsuarios({ texto: "   " }));

    expect(listarUsuarios).toHaveBeenLastCalledWith({
      texto: undefined,
      desde: 0,
      cantidad: 20,
    });
    expect(store.getState().usuariosPsp.texto).toBe("");
  });

  it("adapta las filas de usuarios y guarda total, desde y cantidad", async () => {
    listarUsuarios.mockResolvedValue(
      paginaDe(
        [
          {
            sub: SUB,
            mail: "ana@ejemplo.com",
            habilitado: true,
            roles: ["usuario"],
            identidad: { validada: true, validada_en: "2026-11-10T12:00:00Z" },
          },
        ],
        51,
        20
      )
    );
    const store = crearStore();

    await store.dispatch(cargarUsuarios({ desde: 20 }));

    const estado = store.getState().usuariosPsp;
    expect(estado.lista[0].usuarioSub).toBe(SUB);
    expect(estado.lista[0].identidad.validada).toBe(true);
    expect(estado.total).toBe(51);
    expect(estado.desde).toBe(20);
    expect(estado.cantidad).toBe(20);
    expect(selectTotalPaginas({ usuariosPsp: estado })).toBe(3);
    expect(selectPagina({ usuariosPsp: estado })).toBe(2);
  });

  it("un rechazo deja el mensaje en error y no inventa filas", async () => {
    listarUsuarios.mockRejectedValue({
      response: { status: 403, data: { message: "sin permisos" } },
    });
    const store = crearStore();

    await store.dispatch(cargarUsuarios());

    const estado = store.getState().usuariosPsp;
    expect(estado.error).toBe("sin permisos");
    expect(estado.lista).toEqual([]);
    expect(estado.cargando).toBe(false);
  });
});

describe("cargarUsuario", () => {
  it("adapta el detalle con su identidad, su validación y sus intentos", async () => {
    obtenerUsuario.mockResolvedValue({
      sub: SUB,
      mail: "ana@ejemplo.com",
      identidad: {
        validada: true,
        documento: "22826019",
        cuil: "20228260194",
        nombre_difiere: false,
        cuit_difiere: true,
        validacion_id: 7,
        validaciones: [{ id: 7, step: "701", grupo: "SESION_VENCIDA" }],
      },
    });
    const store = crearStore();

    await store.dispatch(cargarUsuario(SUB));

    const { usuario, cargandoUsuario } = store.getState().usuariosPsp;
    expect(usuario.usuarioSub).toBe(SUB);
    expect(usuario.identidad.documento).toBe("22826019");
    expect(usuario.identidad.cuitDifiere).toBe(true);
    expect(usuario.identidad.validacionId).toBe(7);
    expect(usuario.identidad.validaciones[0].grupo).toBe("SESION_VENCIDA");
    expect(cargandoUsuario).toBe(false);
  });

  it("un usuario sin validaciones no tiene id de validación para consultar", async () => {
    obtenerUsuario.mockResolvedValue({
      sub: SUB,
      mail: "ana@ejemplo.com",
      identidad: { validada: false, validaciones: [] },
    });
    const store = crearStore();

    await store.dispatch(cargarUsuario(SUB));

    expect(
      store.getState().usuariosPsp.usuario.identidad.validacionId
    ).toBeNull();
  });

  it("un rechazo deja el error y el usuario en null", async () => {
    obtenerUsuario.mockRejectedValue({
      response: { status: 404, data: { message: "no existe" } },
    });
    const store = crearStore();

    await store.dispatch(cargarUsuario(SUB));

    const estado = store.getState().usuariosPsp;
    expect(estado.error).toBe("no existe");
    expect(estado.usuario).toBeNull();
  });
});

describe("consulta al proveedor", () => {
  it("la primera consulta va por id de validación y sin imágenes", async () => {
    consultarIdentidadEnProveedor.mockResolvedValue({
      validacion_id: 3,
      consultado_en: "2026-11-13T18:00:00Z",
      fecha_nacimiento: "1975-03-14",
    });
    const store = crearStore();

    await store.dispatch(consultarProveedor({ validacionId: 3 }));

    expect(consultarIdentidadEnProveedor).toHaveBeenLastCalledWith(3, {
      imagenes: false,
    });
    const { proveedor } = store.getState().usuariosPsp;
    expect(proveedor.datos.fechaNacimiento).toBe("1975-03-14");
    expect(proveedor.imagenes).toBeNull();
  });

  it("las imágenes se piden en una llamada aparte, por el mismo id", async () => {
    consultarIdentidadEnProveedor.mockResolvedValue({
      validacion_id: 3,
      con_imagenes: true,
      imagenes: { frente: "AAA", dorso: "BBB", selfie: "CCC" },
    });
    const store = crearStore();

    await store.dispatch(traerImagenesDelProveedor({ validacionId: 3 }));

    expect(consultarIdentidadEnProveedor).toHaveBeenLastCalledWith(3, {
      imagenes: true,
    });
    expect(store.getState().usuariosPsp.proveedor.imagenes.frente).toBe(
      "data:image/jpeg;base64,AAA"
    );
  });

  it("un error del proveedor queda en su propio panel y no en el error de la pantalla", async () => {
    consultarIdentidadEnProveedor.mockRejectedValue({
      response: { status: 502, data: { message: "4i no respondió" } },
    });
    const store = crearStore();

    await store.dispatch(consultarProveedor({ validacionId: 3 }));

    const estado = store.getState().usuariosPsp;
    expect(estado.proveedor.error).toBeTruthy();
    expect(estado.proveedor.datos).toBeNull();
    expect(estado.error).toBeNull();
  });

  it("descartar borra los datos del proveedor del estado", async () => {
    consultarIdentidadEnProveedor.mockResolvedValue({
      fecha_nacimiento: "1975-03-14",
      imagenes: { frente: "AAA" },
    });
    const store = crearStore();

    await store.dispatch(traerImagenesDelProveedor({ validacionId: 3 }));
    store.dispatch(limpiarProveedor());

    const { proveedor } = store.getState().usuariosPsp;
    expect(proveedor.datos).toBeNull();
    expect(proveedor.imagenes).toBeNull();
  });

  it("cargar otro usuario descarta lo consultado del anterior", async () => {
    consultarIdentidadEnProveedor.mockResolvedValue({
      imagenes: { frente: "AAA" },
    });
    obtenerUsuario.mockResolvedValue({ sub: "otro" });
    const store = crearStore();

    await store.dispatch(traerImagenesDelProveedor({ validacionId: 3 }));
    await store.dispatch(cargarUsuario("otro"));

    const { proveedor } = store.getState().usuariosPsp;
    expect(proveedor.datos).toBeNull();
    expect(proveedor.imagenes).toBeNull();
  });
});

describe("revocar la identidad", () => {
  const usuarioValidado = {
    sub: SUB,
    mail: "ana@ejemplo.com",
    habilitado: true,
    roles: ["usuario"],
    identidad: {
      validada: true,
      validada_en: "2026-11-10T12:00:00Z",
      documento: "22826019",
      cuil: "20228260194",
      validacion_id: 7,
      validaciones: [{ id: 7, estado: "FINALIZADA" }],
    },
  };

  const conUsuarioCargado = async () => {
    obtenerUsuario.mockResolvedValue(usuarioValidado);
    const store = crearStore();
    await store.dispatch(cargarUsuario(SUB));
    return store;
  };

  const revocadaEnElBack = {
    usuario_sub: SUB,
    validada: false,
    revocada_en: "2026-11-13T15:00:00Z",
    revocada_por: "admin@ejemplo.com",
    motivo_revocacion: "documento adulterado",
  };

  it("manda el sub de la persona y el motivo", async () => {
    const store = await conUsuarioCargado();
    revocarIdentidad.mockResolvedValue(revocadaEnElBack);

    await store.dispatch(
      revocarIdentidadDeUsuario({
        usuarioSub: SUB,
        motivo: "documento adulterado",
      })
    );

    expect(revocarIdentidad).toHaveBeenLastCalledWith(
      SUB,
      "documento adulterado"
    );
  });

  it("actualiza la identidad del usuario sin volver a pedir el detalle", async () => {
    const store = await conUsuarioCargado();
    const detalles = obtenerUsuario.mock.calls.length;
    revocarIdentidad.mockResolvedValue(revocadaEnElBack);

    await store.dispatch(
      revocarIdentidadDeUsuario({
        usuarioSub: SUB,
        motivo: "documento adulterado",
      })
    );

    const { usuario, revocando } = store.getState().usuariosPsp;
    expect(obtenerUsuario.mock.calls.length).toBe(detalles);
    expect(usuario.identidad.validada).toBe(false);
    expect(usuario.identidad.revocadaEn).toBe("2026-11-13T15:00:00Z");
    expect(usuario.identidad.revocadaPor).toBe("admin@ejemplo.com");
    expect(usuario.identidad.motivoRevocacion).toBe("documento adulterado");
    expect(revocando).toBe(false);
  });

  it("lo que la revocación no devuelve queda como estaba", async () => {
    const store = await conUsuarioCargado();
    revocarIdentidad.mockResolvedValue(revocadaEnElBack);

    await store.dispatch(
      revocarIdentidadDeUsuario({ usuarioSub: SUB, motivo: "x" })
    );

    const { usuario } = store.getState().usuariosPsp;
    expect(usuario.mail).toBe("ana@ejemplo.com");
    expect(usuario.identidad.documento).toBe("22826019");
    expect(usuario.identidad.cuil).toBe("20228260194");
    expect(usuario.identidad.validadaEn).toBe("2026-11-10T12:00:00Z");
    expect(usuario.identidad.validaciones).toHaveLength(1);
  });

  it("un error de la revocación no borra al usuario que se estaba viendo", async () => {
    const store = await conUsuarioCargado();
    revocarIdentidad.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "no tiene identidad validada" },
      },
    });

    await store.dispatch(
      revocarIdentidadDeUsuario({ usuarioSub: SUB, motivo: "x" })
    );

    const { usuario, error, revocando } = store.getState().usuariosPsp;
    expect(usuario.mail).toBe("ana@ejemplo.com");
    expect(usuario.identidad.validada).toBe(true);
    expect(usuario.identidad.revocadaEn).toBeNull();
    expect(error).toBe("no tiene identidad validada");
    expect(revocando).toBe(false);
  });
});
