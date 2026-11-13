import { describe, it, expect, vi, beforeAll } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/usuarios", () => ({
  CANTIDAD_POR_DEFECTO: 20,
  listarUsuarios: vi.fn(),
  obtenerUsuario: vi.fn(),
  consultarIdentidadEnProveedor: vi.fn(),
}));

let ListadoUsuarios;
let reducer;
let listarUsuarios;

beforeAll(async () => {
  ListadoUsuarios = (await import("../pages/ListadoUsuarios")).default;
  reducer = (await import("../store/usuariosPspSlice")).default;
  ({ listarUsuarios } = await import("src/lib/api/usuarios"));
});

const renderizar = () => {
  const store = configureStore({ reducer: { usuariosPsp: reducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ListadoUsuarios />
      </MemoryRouter>
    </Provider>
  );
};

const paginaDe = (usuarios, total, desde = 0) => ({
  total,
  desde,
  cantidad: 20,
  usuarios,
});

const usuario = (mail, identidad) => ({
  sub: `sub-${mail}`,
  mail,
  nombre: "Ana",
  apellido: "Pérez",
  habilitado: true,
  roles: ["usuario"],
  identidad,
});

describe("ListadoUsuarios", () => {
  it("muestra una columna de identidad por usuario", async () => {
    listarUsuarios.mockResolvedValue(
      paginaDe(
        [
          usuario("validada@ejemplo.com", { validada: true }),
          usuario("revocada@ejemplo.com", {
            validada: true,
            revocada_en: "2026-11-12T00:00:00Z",
          }),
          usuario("curso@ejemplo.com", {
            validada: false,
            validacion_en_curso: true,
          }),
          usuario("nunca@ejemplo.com", undefined),
        ],
        4
      )
    );

    renderizar();

    await waitFor(() =>
      expect(screen.getByText("validada@ejemplo.com")).toBeDefined()
    );
    expect(screen.getByText("Validada")).toBeDefined();
    expect(screen.getByText("Revocada")).toBeDefined();
    expect(screen.getByText("Validación en curso")).toBeDefined();
    expect(screen.getByText("Sin validar")).toBeDefined();
  });

  it("busca con el texto tipeado", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));

    renderizar();
    await waitFor(() => expect(listarUsuarios).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "ana@ejemplo.com" },
    });
    fireEvent.click(screen.getByText("Buscar"));

    await waitFor(() =>
      expect(listarUsuarios).toHaveBeenLastCalledWith({
        texto: "ana@ejemplo.com",
        desde: 0,
        cantidad: 20,
      })
    );
  });

  it("Enter también busca", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));

    renderizar();
    await waitFor(() => expect(listarUsuarios).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "anab" },
    });
    fireEvent.keyDown(screen.getByLabelText("Buscar usuario"), {
      key: "Enter",
    });

    await waitFor(() =>
      expect(listarUsuarios).toHaveBeenLastCalledWith({
        texto: "anab",
        desde: 0,
        cantidad: 20,
      })
    );
  });

  it("con menos de cuatro caracteres no deja buscar y explica por qué", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));

    const { container } = renderizar();
    await waitFor(() => expect(listarUsuarios).toHaveBeenCalled());
    listarUsuarios.mockClear();

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "ana" },
    });

    expect(screen.getByText("Buscar").disabled).toBe(true);
    expect(container.textContent).toContain("al menos 4 caracteres");
    expect(container.textContent).toContain("ingress");

    fireEvent.click(screen.getByText("Buscar"));
    fireEvent.keyDown(screen.getByLabelText("Buscar usuario"), {
      key: "Enter",
    });

    expect(listarUsuarios).not.toHaveBeenCalled();
  });

  it("al llegar al mínimo la búsqueda se habilita y el aviso se va", async () => {
    listarUsuarios.mockResolvedValue(paginaDe([], 0));

    const { container } = renderizar();
    await waitFor(() => expect(listarUsuarios).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "anab" },
    });

    expect(screen.getByText("Buscar").disabled).toBe(false);
    expect(container.textContent).not.toContain("al menos 4 caracteres");
  });

  it("pagina por offset sobre el total que manda el backend y conserva la búsqueda", async () => {
    listarUsuarios.mockResolvedValue(
      paginaDe([usuario("a@ejemplo.com", { validada: true })], 60)
    );

    renderizar();
    await waitFor(() =>
      expect(screen.getByText("Página 1 de 3")).toBeDefined()
    );

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "anab" },
    });
    fireEvent.click(screen.getByText("Buscar"));
    await waitFor(() =>
      expect(screen.getByText(/Filtrando por/)).toBeDefined()
    );

    fireEvent.click(screen.getByText("Siguiente"));

    await waitFor(() =>
      expect(listarUsuarios).toHaveBeenLastCalledWith({
        texto: "anab",
        desde: 20,
        cantidad: 20,
      })
    );
  });

  it("en la primera página no se puede ir hacia atrás", async () => {
    listarUsuarios.mockResolvedValue(
      paginaDe([usuario("a@ejemplo.com", { validada: true })], 60)
    );

    renderizar();
    await waitFor(() =>
      expect(screen.getByText("Página 1 de 3")).toBeDefined()
    );

    expect(screen.getByText("Anterior").disabled).toBe(true);
  });

  it("un error del backend se muestra y la tabla queda vacía", async () => {
    listarUsuarios.mockRejectedValue({
      response: { status: 403, data: { message: "Se requiere rol admin" } },
    });

    renderizar();

    await waitFor(() =>
      expect(screen.getByText("Se requiere rol admin")).toBeDefined()
    );
    expect(screen.getByText("Sin usuarios para mostrar.")).toBeDefined();
  });
});
