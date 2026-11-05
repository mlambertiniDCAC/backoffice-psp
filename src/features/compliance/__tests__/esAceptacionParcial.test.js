import { describe, it, expect } from "vitest";
import { esAceptacionParcial } from "../store/complianceSlice";

describe("esAceptacionParcial", () => {
  it("reconoce la aceptación a medias por el mensaje del gateway", () => {
    const error = {
      response: {
        data: {
          error: {
            message:
              "compliance aceptado, permisos pendientes, usar POST /v1/compliance/25485/permisos/sincronizar",
          },
        },
      },
    };
    expect(esAceptacionParcial(error)).toBe(true);
  });

  it("no confunde un error común con una aceptación a medias", () => {
    const error = {
      response: { data: { error: { message: "cuit invalido" } } },
    };
    expect(esAceptacionParcial(error)).toBe(false);
  });

  it("no explota sin respuesta", () => {
    expect(esAceptacionParcial(new Error("boom"))).toBe(false);
  });
});
