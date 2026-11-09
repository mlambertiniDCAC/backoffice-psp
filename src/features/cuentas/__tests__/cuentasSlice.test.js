import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/cuentas", () => ({
  listarCuentas: vi.fn(),
}));

let reducer;
let cargarCuentas;
let listarCuentas;

beforeAll(async () => {
  const slice = await import("../store/cuentasSlice");
  reducer = slice.default;
  cargarCuentas = slice.cargarCuentas;
  ({ listarCuentas } = await import("src/lib/api/cuentas"));
});

const crearStore = () => configureStore({ reducer: { cuentas: reducer } });

describe("cargarCuentas", () => {
  it("pasa el filtro refExterna al API", async () => {
    listarCuentas.mockResolvedValue([]);
    const store = crearStore();

    await store.dispatch(cargarCuentas({ refExterna: "27118" }));

    expect(listarCuentas).toHaveBeenLastCalledWith({ refExterna: "27118" });
  });

  it("sin filtros llama sin parámetros", async () => {
    listarCuentas.mockResolvedValue([]);
    const store = crearStore();

    await store.dispatch(cargarCuentas());

    expect(listarCuentas).toHaveBeenLastCalledWith({});
  });

  it("una lista vacía queda como sin cuentas y sin error", async () => {
    listarCuentas.mockResolvedValue([]);
    const store = crearStore();

    await store.dispatch(cargarCuentas({ refExterna: "999" }));

    const { lista, error, cargando } = store.getState().cuentas;
    expect(lista).toEqual([]);
    expect(error).toBeNull();
    expect(cargando).toBe(false);
  });

  it("adapta ref_externa y client_id de cada cuenta", async () => {
    listarCuentas.mockResolvedValue([
      { cuenta_id_externo: "a", ref_externa: "27118", client_id: 7 },
    ]);
    const store = crearStore();

    await store.dispatch(cargarCuentas());

    const [cuenta] = store.getState().cuentas.lista;
    expect(cuenta.refExterna).toBe("27118");
    expect(cuenta.clientId).toBe(7);
  });

  it("un rechazo del API deja el mensaje en state.error", async () => {
    listarCuentas.mockRejectedValue({
      response: { data: { message: "boom" } },
    });
    const store = crearStore();

    await store.dispatch(cargarCuentas());

    const { error, cargando } = store.getState().cuentas;
    expect(error).toBeTruthy();
    expect(cargando).toBe(false);
  });
});
