import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoriaIdentidad from "../components/CategoriaIdentidad";
import { adaptarIdentidad } from "src/lib/identidad";

const renderizar = (identidad) =>
  render(<CategoriaIdentidad identidad={adaptarIdentidad(identidad)} />);

describe("CategoriaIdentidad", () => {
  it("muestra el estado validado con la fecha desde la que vale", () => {
    renderizar({ validada: true, validada_en: "2026-11-10T12:00:00Z" });

    expect(screen.getByText("Validada")).toBeDefined();
    expect(screen.getByText("2026-11-10T12:00:00Z")).toBeDefined();
  });

  it("una identidad revocada muestra motivo, quién y cuándo", () => {
    renderizar({
      validada: true,
      revocada_en: "2026-11-12T10:00:00Z",
      revocada_por: "admin@ejemplo.com",
      motivo_revocacion: "documento adulterado",
    });

    expect(screen.getByText("Revocada")).toBeDefined();
    const celda = screen.getByText(/documento adulterado/);
    expect(celda.textContent).toContain("admin@ejemplo.com");
    expect(celda.textContent).toContain("2026-11-12T10:00:00Z");
  });

  it("muestra el documento y el CUIL guardados", () => {
    renderizar({ validada: true, documento: "22826019", cuil: "20228260194" });

    expect(screen.getByText("22826019")).toBeDefined();
    expect(screen.getByText("20228260194")).toBeDefined();
  });

  it("explica los flags de discrepancia en palabras y no como booleanos", () => {
    const { container } = renderizar({
      validada: true,
      nombre_difiere: true,
      cuit_difiere: false,
    });

    expect(
      screen.getByText(
        /El nombre que la persona declaró en el alta no coincide/
      )
    ).toBeDefined();
    expect(
      screen.getByText(/El CUIT declarado en el alta coincide con el CUIL/)
    ).toBeDefined();
    expect(container.textContent).not.toContain("nombre_difiere");
    expect(container.textContent).not.toContain("cuit_difiere");
  });

  it("sin validación cerrada no afirma nada sobre las discrepancias", () => {
    renderizar({ validada: false });

    expect(
      screen.getAllByText(/Todavía no hay una validación cerrada/)
    ).toHaveLength(2);
  });

  it("cada intento muestra el motivo en castellano y el step aparte", () => {
    renderizar({
      validada: false,
      validaciones: [
        {
          id: 9,
          flujo: "onboarding",
          estado: "EXPIRADA",
          resultado: "timeout",
          step: "701",
          grupo: "SESION_VENCIDA",
        },
      ],
    });

    expect(screen.getByText("La sesión de validación venció")).toBeDefined();
    expect(
      screen.getByText("La transacción venció sin cerrarse")
    ).toBeDefined();
    expect(screen.getByText("701")).toBeDefined();
  });

  it("un step de bloqueo avisa cuántos minutos quedan", () => {
    const { container } = renderizar({
      validaciones: [
        {
          id: 10,
          estado: "FINALIZADA",
          resultado: "failed",
          step: "9050",
          grupo: "DISPOSITIVO_BLOQUEADO",
        },
      ],
    });

    expect(container.textContent).toContain(
      "El dispositivo queda bloqueado 50 minutos más"
    );
  });

  it("la descripción del backend le gana a la traducción del grupo", () => {
    renderizar({
      validada: false,
      validaciones: [
        {
          id: 11,
          estado: "FINALIZADA",
          resultado: "failed",
          step: "701",
          grupo: "SESION_VENCIDA",
          descripcion: "La persona cortó en el escaneo del dorso",
        },
      ],
    });

    expect(
      screen.getByText("La persona cortó en el escaneo del dorso")
    ).toBeDefined();
    expect(screen.queryByText("La sesión de validación venció")).toBeNull();
  });

  it("los minutos de bloqueo que manda el backend se muestran tal cual", () => {
    const { container } = renderizar({
      validaciones: [
        {
          id: 12,
          estado: "FINALIZADA",
          resultado: "failed",
          step: "701",
          grupo: "DISPOSITIVO_BLOQUEADO",
          minutos_bloqueo: 15,
        },
      ],
    });

    expect(container.textContent).toContain(
      "El dispositivo queda bloqueado 15 minutos más"
    );
  });

  it("sin intentos lo dice en lugar de mostrar una tabla vacía", () => {
    renderizar({ validada: false, validaciones: [] });

    expect(
      screen.getByText(
        "Esta persona nunca arrancó una validación de identidad."
      )
    ).toBeDefined();
  });

  it("avisa que una validación abierta todavía no valida a nadie", () => {
    renderizar({ validada: false, validacion_en_curso: true });

    expect(screen.getByText("Validación en curso")).toBeDefined();
    expect(screen.getByText(/Hay una validación abierta/)).toBeDefined();
  });
});
