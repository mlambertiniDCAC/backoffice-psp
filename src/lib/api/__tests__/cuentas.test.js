import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("src/lib/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

let axiosInstance;
let listarCuentas;
let crearCuenta;

beforeAll(async () => {
  axiosInstance = (await import("src/lib/axiosInstance")).default;
  ({ listarCuentas, crearCuenta } = await import("../cuentas"));
});

describe("listarCuentas", () => {
  it("manda refExterna como parámetro y no manda clientId", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: [] } });

    await listarCuentas({ refExterna: "27118", clientId: 5 });

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params.refExterna).toBe("27118");
    expect(config.params).not.toHaveProperty("clientId");
  });

  it("sin filtros no manda parámetros", async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: [] } });

    await listarCuentas();

    const [, config] = axiosInstance.get.mock.calls.at(-1);
    expect(config.params).toEqual({});
  });
});

describe("crearCuenta", () => {
  it("manda refExterna en el body y no clientId", async () => {
    axiosInstance.post.mockResolvedValue({ data: { data: {} } });

    await crearCuenta({
      refExterna: "27118",
      sujetoVerificadoId: 30,
      cuit: "30712345671",
      name: "Hirthe",
    });

    const [, body] = axiosInstance.post.mock.calls.at(-1);
    expect(body.refExterna).toBe("27118");
    expect(body).not.toHaveProperty("clientId");
  });
});
