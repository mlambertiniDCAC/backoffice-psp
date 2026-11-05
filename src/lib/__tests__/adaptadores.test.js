import { describe, it, expect } from "vitest";
import {
  adaptarCuenta,
  adaptarFilaLegajo,
  cruzarLegajosConCuentas,
  estaTrabada,
  refExternaDe,
} from "../adaptadores";

describe("adaptarFilaLegajo", () => {
  it("mapea ref_externa y tipo del listado", () => {
    const fila = adaptarFilaLegajo({
      id: 7,
      sujeto_verificado_fillable: 42,
      ref_externa: "25485",
      tipo: "juridica",
      estado: "en_revision",
      documentos_total: 5,
      documentos_por_revisar: 2,
      fecha_creacion: "2026-11-04",
    });
    expect(fila.refExterna).toBe("25485");
    expect(fila.tipo).toBe("juridica");
    expect(fila.sujetoVerificadoId).toBe(42);
  });

  it("deja refExterna en null si el back no la manda", () => {
    const fila = adaptarFilaLegajo({ id: 1, sujeto_verificado_fillable: 42 });
    expect(fila.refExterna).toBeNull();
  });
});

describe("adaptarCuenta", () => {
  it("trata un cvu vacío como sin CVU", () => {
    expect(adaptarCuenta({ cvu: "" }).cvu).toBeNull();
  });

  it("expone ultimo_error tal como lo manda el back", () => {
    const cuenta = adaptarCuenta({
      ultimo_error: {
        codigo: "GE500",
        mensaje: "ERROR DE SQL",
        fecha: "2026-09-24",
      },
    });
    expect(cuenta.ultimoError.codigo).toBe("GE500");
  });
});

describe("estaTrabada", () => {
  it("es trabada si está EN_PROCESO y no tiene CVU", () => {
    expect(estaTrabada({ situacion: "EN_PROCESO", cvu: null })).toBe(true);
  });

  it("no es trabada si ya tiene CVU", () => {
    expect(estaTrabada({ situacion: "EN_PROCESO", cvu: "0".repeat(22) })).toBe(
      false
    );
  });

  it("no es trabada si está activa", () => {
    expect(estaTrabada({ situacion: "ACTIVA", cvu: null })).toBe(false);
  });
});

describe("cruzarLegajosConCuentas", () => {
  it("cruza por sujeto_verificado_id, no por ref_externa", () => {
    const legajos = [{ sujetoVerificadoId: 42 }, { sujetoVerificadoId: 43 }];
    const cuentas = [{ sujetoVerificadoId: "42", cuentaIdExterno: "abc" }];
    const cruzados = cruzarLegajosConCuentas(legajos, cuentas);
    expect(cruzados[0].cuenta.cuentaIdExterno).toBe("abc");
    expect(cruzados[1].cuenta).toBeNull();
  });
});

describe("refExterna derivada del client_id de la cuenta", () => {
  it("usa el client_id de la cuenta como ref_externa del legajo", () => {
    const legajos = [
      adaptarFilaLegajo({ id: 1, sujeto_verificado_fillable: 42 }),
    ];
    const cuentas = [
      adaptarCuenta({
        sujeto_verificado_id: 42,
        client_id: 25485,
        cuenta_id_externo: "abc",
      }),
    ];
    const [cruzado] = cruzarLegajosConCuentas(legajos, cuentas);
    expect(cruzado.refExterna).toBe("25485");
  });

  it("no sobreescribe la ref_externa si el listado ya la trajo", () => {
    const legajos = [
      adaptarFilaLegajo({
        id: 1,
        sujeto_verificado_fillable: 42,
        ref_externa: "99",
      }),
    ];
    const cuentas = [
      adaptarCuenta({ sujeto_verificado_id: 42, client_id: 25485 }),
    ];
    const [cruzado] = cruzarLegajosConCuentas(legajos, cuentas);
    expect(cruzado.refExterna).toBe("99");
  });

  it("deja la ref_externa en null si el sujeto todavía no tiene cuenta", () => {
    const legajos = [
      adaptarFilaLegajo({ id: 1, sujeto_verificado_fillable: 42 }),
    ];
    const [cruzado] = cruzarLegajosConCuentas(legajos, []);
    expect(cruzado.refExterna).toBeNull();
    expect(cruzado.cuenta).toBeNull();
  });

  it("refExternaDe tolera un client_id cero", () => {
    expect(refExternaDe({ clientId: 0 })).toBe("0");
    expect(refExternaDe(null)).toBeNull();
  });
});
