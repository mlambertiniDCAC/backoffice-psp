import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/compliance", () => ({
  obtenerCompliance: vi.fn(),
  listarPersonas: vi.fn(),
  listarCompliances: vi.fn(),
}));
vi.mock("src/lib/api/cuentas", () => ({
  listarCuentas: vi.fn(),
}));

let reducer;
let cargarDetalle;
let obtenerCompliance;
let listarPersonas;
let listarCompliances;

beforeAll(async () => {
  const slice = await import("../store/complianceSlice");
  reducer = slice.default;
  cargarDetalle = slice.cargarDetalle;
  ({ obtenerCompliance, listarPersonas, listarCompliances } =
    await import("src/lib/api/compliance"));
});

const detalleSinEstado = {
  compliance_sujeto_id: 32,
  documentos: [],
  form_data: { condicion_legal: "juridica" },
};

const armarStore = () => configureStore({ reducer: { compliance: reducer } });

describe("estado del legajo en el detalle", () => {
  it("lo toma del resumen porque el detalle no trae estado", async () => {
    obtenerCompliance.mockResolvedValue(detalleSinEstado);
    listarPersonas.mockResolvedValue([]);
    listarCompliances.mockResolvedValue({
      data: [{ id: 32, sujeto_verificado_fillable: 33, estado: "en_revision" }],
    });

    const store = armarStore();
    await store.dispatch(cargarDetalle(33));

    expect(listarCompliances).toHaveBeenCalledWith({ sujetoVerificadoId: 33 });
    expect(store.getState().compliance.estadoLegajo).toBe("en_revision");
  });

  it("deja el estado en null si el legajo no está en los estados activos", async () => {
    obtenerCompliance.mockResolvedValue(detalleSinEstado);
    listarPersonas.mockResolvedValue([]);
    listarCompliances.mockResolvedValue({ data: [] });

    const store = armarStore();
    await store.dispatch(cargarDetalle(33));

    expect(store.getState().compliance.estadoLegajo).toBeNull();
  });

  it("no pierde el detalle si el resumen falla", async () => {
    obtenerCompliance.mockResolvedValue(detalleSinEstado);
    listarPersonas.mockResolvedValue([]);
    listarCompliances.mockRejectedValue(new Error("boom"));

    const store = armarStore();
    await store.dispatch(cargarDetalle(33));

    const estado = store.getState().compliance;
    expect(estado.detalle).toEqual(detalleSinEstado);
    expect(estado.estadoLegajo).toBeNull();
  });
});
