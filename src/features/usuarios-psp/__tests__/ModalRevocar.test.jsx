import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ModalRevocar from "../components/ModalRevocar";

const renderizar = (props = {}) => {
  const todas = {
    mail: "ana@ejemplo.com",
    revocando: false,
    onCancelar: vi.fn(),
    onConfirmar: vi.fn(),
    ...props,
  };
  const resultado = render(<ModalRevocar {...todas} />);
  return { ...resultado, props: todas };
};

const escribirMotivo = (texto) =>
  fireEvent.change(screen.getByLabelText("Motivo de la revocación"), {
    target: { value: texto },
  });

const botonConfirmar = () => screen.getByText("Sí, revocar");

describe("ModalRevocar", () => {
  it("muestra el mail de la persona que se va a revocar", () => {
    const { baseElement } = renderizar();

    expect(baseElement.textContent).toContain("ana@ejemplo.com");
  });

  it("el botón de confirmar está deshabilitado sin motivo", () => {
    renderizar();

    expect(botonConfirmar().disabled).toBe(true);
  });

  it("un motivo de solo espacios no habilita el botón", () => {
    renderizar();

    escribirMotivo("    ");

    expect(botonConfirmar().disabled).toBe(true);
  });

  it("con un motivo escrito el botón se habilita", () => {
    renderizar();

    escribirMotivo("documento adulterado");

    expect(botonConfirmar().disabled).toBe(false);
  });

  it("al confirmar manda el motivo tal cual se escribió", () => {
    const { props } = renderizar();

    escribirMotivo("documento adulterado");
    fireEvent.click(botonConfirmar());

    expect(props.onConfirmar).toHaveBeenCalledWith("documento adulterado");
  });

  it("cancelar no revoca nada", () => {
    const { props } = renderizar();

    escribirMotivo("documento adulterado");
    fireEvent.click(screen.getByText("Cancelar"));

    expect(props.onConfirmar).not.toHaveBeenCalled();
    expect(props.onCancelar).toHaveBeenCalledTimes(1);
  });

  it("mientras se revoca no se puede confirmar de nuevo", () => {
    renderizar({ revocando: true });

    escribirMotivo("documento adulterado");

    expect(botonConfirmar().disabled).toBe(true);
  });

  it("avisa que la revocación no se deshace desde acá", () => {
    const { baseElement } = renderizar();

    expect(baseElement.textContent).toContain("no se vuelve a encender");
  });
});
