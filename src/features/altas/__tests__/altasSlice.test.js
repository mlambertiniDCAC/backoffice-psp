import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/cuentas", () => ({
  listarCuentas: vi.fn(),
  informarCvu: vi.fn(),
  corregirTitular: vi.fn(),
}));
vi.mock("src/lib/api/compliance", () => ({
  sincronizarPermisos: vi.fn(),
  listarCompliances: vi.fn(),
}));

let reducer;
let cargarTrabadas;
let listarCuentas;
let listarCompliances;

beforeAll(async () => {
  const slice = await import("../store/altasSlice");
  reducer = slice.default;
  cargarTrabadas = slice.cargarTrabadas;
  ({ listarCuentas } = await import("src/lib/api/cuentas"));
  ({ listarCompliances } = await import("src/lib/api/compliance"));
});

const cuentaTrabada = {
  cuenta_id_externo: "42a68412",
  client_id: 3421,
  sujeto_verificado_id: 30,
  cuit: "30712345671",
  name: "Hirthe, Adams and Emmerich",
  cvu: "",
  situacion_cuenta: "EN_PROCESO",
};

describe("cargarTrabadas", () => {
  it("deriva la refExterna del client_id de la cuenta, sin depender del legajo", async () => {
    listarCuentas.mockResolvedValue([cuentaTrabada]);
    listarCompliances.mockResolvedValue({ data: [] });
    const store = configureStore({ reducer: { altas: reducer } });

    await store.dispatch(cargarTrabadas());

    const [fila] = store.getState().altas.trabadas;
    expect(fila.refExterna).toBe("3421");
    expect(fila.legajo).toBeNull();
  });

  it("solo lista cuentas EN_PROCESO sin CVU", async () => {
    listarCuentas.mockResolvedValue([
      cuentaTrabada,
      {
        ...cuentaTrabada,
        cuenta_id_externo: "otra",
        cvu: "0".repeat(22),
        situacion_cuenta: "ACTIVA",
      },
    ]);
    listarCompliances.mockResolvedValue({ data: [] });
    const store = configureStore({ reducer: { altas: reducer } });

    await store.dispatch(cargarTrabadas());

    expect(store.getState().altas.trabadas).toHaveLength(1);
  });
});

describe("reintentarAlta vs sincronizar", () => {
  it("el reintento manda cuit y name: sin ellos el gateway no llama al banco", async () => {
    const { reintentarAlta } = await import("../store/altasSlice");
    const { sincronizarPermisos } = await import("src/lib/api/compliance");
    sincronizarPermisos.mockResolvedValue({});
    listarCuentas.mockResolvedValue([]);
    listarCompliances.mockResolvedValue({ data: [] });
    const store = configureStore({ reducer: { altas: reducer } });

    await store.dispatch(
      reintentarAlta({
        refExterna: "3421",
        cuentaIdExterno: "42a68412",
        cuit: "30712345671",
        name: "Hirthe",
      })
    );

    expect(sincronizarPermisos).toHaveBeenCalledWith("3421", {
      cuit: "30712345671",
      name: "Hirthe",
    });
  });

  it("sincronizar permisos va sin body, para no tocar el banco", async () => {
    const { sincronizar } = await import("../store/altasSlice");
    const { sincronizarPermisos } = await import("src/lib/api/compliance");
    sincronizarPermisos.mockResolvedValue({});
    listarCuentas.mockResolvedValue([]);
    listarCompliances.mockResolvedValue({ data: [] });
    const store = configureStore({ reducer: { altas: reducer } });

    await store.dispatch(
      sincronizar({ refExterna: "3421", cuentaIdExterno: "42a68412" })
    );

    expect(sincronizarPermisos).toHaveBeenCalledWith("3421");
  });
});
