import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("src/lib/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

let axiosInstance;
let listarUsuarios;
let obtenerUsuario;
let consultarIdentidadEnProveedor;

const SUB = "11111111-1111-1111-1111-111111111111";

beforeAll(async () => {
  axiosInstance = (await import("src/lib/axiosInstance")).default;
  ({ listarUsuarios, obtenerUsuario, consultarIdentidadEnProveedor } =
    await import("../usuarios"));
});

describe("listarUsuarios", () => {
  it("pega al listado de identidad con desde y cantidad", async () => {
    axiosInstance.get.mockResolvedValue({ data: { usuarios: [] } });

    await listarUsuarios();

    const [url, config] = axiosInstance.get.mock.calls.at(-1);
    expect(url).toBe("/v1/admin/identidad/usuarios");
    expect(config.params).toEqual({ desde: 0, cantidad: 20 });
  });

  it("pagina por offset, no por número de página", async () => {
    axiosInstance.get.mockResolvedValue({ data: { usuarios: [] } });

    await listarUsuarios({ desde: 40, cantidad: 20 });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params).toEqual({ desde: 40, cantidad: 20 });
    expect(config.params).not.toHaveProperty("pagina");
    expect(config.params).not.toHaveProperty("porPagina");
  });

  it("manda el texto de búsqueda cuando hay uno", async () => {
    axiosInstance.get.mockResolvedValue({ data: { usuarios: [] } });

    await listarUsuarios({ texto: "ana@ejemplo.com", desde: 20 });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params.texto).toBe("ana@ejemplo.com");
    expect(config.params.desde).toBe(20);
  });

  it("una búsqueda vacía no viaja como parámetro", async () => {
    axiosInstance.get.mockResolvedValue({ data: { usuarios: [] } });

    await listarUsuarios({ texto: "" });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params).not.toHaveProperty("texto");
  });

  it("devuelve el cuerpo con total, desde, cantidad y usuarios", async () => {
    axiosInstance.get.mockResolvedValue({
      data: {
        total: 137,
        desde: 0,
        cantidad: 20,
        usuarios: [{ sub: SUB, mail: "a@b.com" }],
      },
    });

    const pagina = await listarUsuarios();

    expect(pagina.total).toBe(137);
    expect(pagina.desde).toBe(0);
    expect(pagina.cantidad).toBe(20);
    expect(pagina.usuarios).toHaveLength(1);
  });
});

describe("obtenerUsuario", () => {
  it("pega al detalle de identidad por sub", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await obtenerUsuario(SUB);

    const [url] = axiosInstance.get.mock.calls.at(-1);
    expect(url).toBe(`/v1/admin/identidad/usuarios/${SUB}`);
  });
});

describe("consultarIdentidadEnProveedor", () => {
  it("se indexa por id de validación y por defecto no pide las imágenes", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await consultarIdentidadEnProveedor(3);

    const [url, config] = axiosInstance.get.mock.calls.at(-1);
    expect(url).toBe("/v1/admin/identidad/validaciones/3/proveedor");
    expect(config.params).toEqual({ imagenes: false });
  });

  it("pide las imágenes solo cuando se lo piden", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await consultarIdentidadEnProveedor(3, { imagenes: true });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params).toEqual({ imagenes: true });
  });

  it("imagenes viaja siempre como booleano, nunca otro valor", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await consultarIdentidadEnProveedor(3, { imagenes: "si" });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params.imagenes).toBe(false);
  });

  it("no manda el id sin escapar en la URL", async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await consultarIdentidadEnProveedor("a b");

    const [url] = axiosInstance.get.mock.calls.at(-1);
    expect(url).toBe("/v1/admin/identidad/validaciones/a%20b/proveedor");
  });
});
