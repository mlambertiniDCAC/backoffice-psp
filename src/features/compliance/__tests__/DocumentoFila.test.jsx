import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import DocumentoFila from "../components/DocumentoFila";

const tipoRenderizado = (documento) => {
  const { container } = render(
    <table>
      <tbody>
        <DocumentoFila documento={documento} onRevisar={vi.fn()} />
      </tbody>
    </table>
  );
  return container.querySelector("td").textContent;
};

describe("DocumentoFila", () => {
  it("muestra el nombre cuando el backend manda el tipo como objeto", () => {
    expect(
      tipoRenderizado({
        id: 1,
        tipo: { codigo: "DNI", nombre: "Documento de identidad" },
        estado: "en_revision",
      })
    ).toBe("Documento de identidad");
  });

  it("cae al código cuando el tipo no trae nombre", () => {
    expect(
      tipoRenderizado({ id: 2, tipo: { codigo: "ESTATUTO" }, estado: "en_revision" })
    ).toBe("ESTATUTO");
  });

  it("sigue mostrando el tipo cuando viene como texto", () => {
    expect(
      tipoRenderizado({ id: 3, tipo: "Constancia de CUIT", estado: "en_revision" })
    ).toBe("Constancia de CUIT");
  });

  it("usa documento_tipo cuando no hay tipo", () => {
    expect(
      tipoRenderizado({ id: 4, documento_tipo: "Poder", estado: "en_revision" })
    ).toBe("Poder");
  });

  it("muestra un guion cuando no hay ningún tipo", () => {
    expect(tipoRenderizado({ id: 5, estado: "en_revision" })).toBe("—");
  });
});
