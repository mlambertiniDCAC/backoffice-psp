import { describe, it, expect, vi, beforeAll } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/usuarios", () => ({
  CANTIDAD_POR_DEFECTO: 20,
  listarUsuarios: vi.fn(),
  obtenerUsuario: vi.fn(),
  consultarIdentidadEnProveedor: vi.fn(),
}));

let DetalleUsuario;
let reducer;
let obtenerUsuario;
let consultarIdentidadEnProveedor;

const SUB = "11111111-1111-1111-1111-111111111111";

beforeAll(async () => {
  DetalleUsuario = (await import("../pages/DetalleUsuario")).default;
  reducer = (await import("../store/usuariosPspSlice")).default;
  ({ obtenerUsuario, consultarIdentidadEnProveedor } =
    await import("src/lib/api/usuarios"));
});

const renderizar = () => {
  const store = configureStore({ reducer: { usuariosPsp: reducer } });
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/usuarios-psp/${SUB}`]}>
        <Routes>
          <Route
            path="/usuarios-psp/:usuarioSub"
            element={<DetalleUsuario />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return { ...utils, store };
};

const detalle = {
  sub: SUB,
  mail: "ana@ejemplo.com",
  nombre: "Ana",
  apellido: "Pérez",
  habilitado: true,
  roles: ["usuario"],
  identidad: {
    validada: true,
    validada_en: "2026-11-10T12:00:00Z",
    documento: "22826019",
    cuil: "20228260194",
    nombre_difiere: false,
    cuit_difiere: true,
    validacion_id: 7,
    validaciones: [
      {
        id: 7,
        flujo: "onboarding",
        estado: "FINALIZADA",
        resultado: "success",
      },
    ],
  },
};

const sinValidaciones = {
  sub: SUB,
  mail: "nunca@ejemplo.com",
  habilitado: true,
  roles: ["usuario"],
  identidad: { validada: false, validaciones: [] },
};

describe("DetalleUsuario", () => {
  it("pide el detalle del sub de la URL y muestra sus datos y su identidad", async () => {
    obtenerUsuario.mockResolvedValue(detalle);

    renderizar();

    await waitFor(() => expect(obtenerUsuario).toHaveBeenLastCalledWith(SUB));
    expect(screen.getAllByText("ana@ejemplo.com")).toHaveLength(2);
    expect(screen.getByText("Identidad")).toBeDefined();
    expect(screen.getByText("22826019")).toBeDefined();
    expect(
      screen.getByText(
        /El CUIT que la persona declaró en el alta no coincide con el CUIL/
      )
    ).toBeDefined();
  });

  it("no consulta al proveedor hasta que se lo pide y se confirma", async () => {
    obtenerUsuario.mockResolvedValue(detalle);
    consultarIdentidadEnProveedor.mockResolvedValue({
      consultado_en: "2026-11-13T18:00:00Z",
      fecha_nacimiento: "1975-03-14",
    });

    renderizar();
    await waitFor(() => expect(screen.getByText("Identidad")).toBeDefined());

    expect(consultarIdentidadEnProveedor).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Consultar a 4i"));
    fireEvent.click(screen.getByText("Sí, continuar"));

    await waitFor(() =>
      expect(consultarIdentidadEnProveedor).toHaveBeenLastCalledWith(7, {
        imagenes: false,
      })
    );
    await waitFor(() => expect(screen.getByText("1975-03-14")).toBeDefined());
  });

  it("al salir de la pantalla descarta lo consultado al proveedor", async () => {
    obtenerUsuario.mockResolvedValue(detalle);
    consultarIdentidadEnProveedor.mockResolvedValue({
      imagenes: { frente: "AAA" },
    });

    const { store, unmount } = renderizar();
    await waitFor(() => expect(screen.getByText("Identidad")).toBeDefined());

    fireEvent.click(screen.getByText("Consultar a 4i"));
    fireEvent.click(screen.getByText("Sí, continuar"));
    await waitFor(() =>
      expect(store.getState().usuariosPsp.proveedor.datos).not.toBeNull()
    );

    unmount();

    const { proveedor } = store.getState().usuariosPsp;
    expect(proveedor.datos).toBeNull();
    expect(proveedor.imagenes).toBeNull();
  });

  it("sin ninguna validación cerrada no ofrece consultar al proveedor", async () => {
    obtenerUsuario.mockResolvedValue(sinValidaciones);
    consultarIdentidadEnProveedor.mockClear();

    const { container } = renderizar();
    await waitFor(() => expect(screen.getByText("Identidad")).toBeDefined());

    expect(screen.queryByText("Consultar a 4i")).toBeNull();
    expect(container.textContent).toContain(
      "no tiene ninguna validación cerrada"
    );
    expect(consultarIdentidadEnProveedor).not.toHaveBeenCalled();
  });

  it("un error del detalle se muestra y no se renderiza un usuario inventado", async () => {
    obtenerUsuario.mockRejectedValue({
      response: { status: 404, data: { message: "No existe ese usuario" } },
    });

    renderizar();

    await waitFor(() =>
      expect(screen.getByText("No existe ese usuario")).toBeDefined()
    );
    expect(screen.queryByText("Identidad")).toBeNull();
  });
});
