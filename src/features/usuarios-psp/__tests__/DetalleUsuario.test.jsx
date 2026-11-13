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
  revocarIdentidad: vi.fn(),
}));

let DetalleUsuario;
let reducer;
let obtenerUsuario;
let consultarIdentidadEnProveedor;
let revocarIdentidad;

const SUB = "11111111-1111-1111-1111-111111111111";

beforeAll(async () => {
  DetalleUsuario = (await import("../pages/DetalleUsuario")).default;
  reducer = (await import("../store/usuariosPspSlice")).default;
  ({ obtenerUsuario, consultarIdentidadEnProveedor, revocarIdentidad } =
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

describe("DetalleUsuario · revocar la identidad", () => {
  const revocadaEnElBack = {
    usuario_sub: SUB,
    validada: false,
    revocada_en: "2026-11-13T15:00:00Z",
    revocada_por: "admin@ejemplo.com",
    motivo_revocacion: "documento adulterado",
  };

  const abrirConfirmacion = async () => {
    obtenerUsuario.mockResolvedValue(detalle);
    const utils = renderizar();
    await waitFor(() => expect(screen.getByText("Identidad")).toBeDefined());
    fireEvent.click(screen.getByText("Revocar la identidad"));
    return utils;
  };

  const escribirMotivo = (texto) =>
    fireEvent.change(screen.getByLabelText("Motivo de la revocación"), {
      target: { value: texto },
    });

  it("la confirmación repite el mail y no revoca sin motivo", async () => {
    await abrirConfirmacion();

    expect(screen.getAllByText("ana@ejemplo.com").length).toBeGreaterThan(2);
    expect(screen.getByText("Sí, revocar").disabled).toBe(true);

    escribirMotivo("   ");
    expect(screen.getByText("Sí, revocar").disabled).toBe(true);
  });

  it("al confirmar muestra la identidad revocada sin volver a pedir el detalle", async () => {
    await abrirConfirmacion();
    const detalles = obtenerUsuario.mock.calls.length;
    revocarIdentidad.mockResolvedValue(revocadaEnElBack);

    escribirMotivo("documento adulterado");
    fireEvent.click(screen.getByText("Sí, revocar"));

    await waitFor(() =>
      expect(revocarIdentidad).toHaveBeenLastCalledWith(
        SUB,
        "documento adulterado"
      )
    );
    await waitFor(() => expect(screen.getByText("Revocada")).toBeDefined());
    const celda = screen.getByText(/documento adulterado/);
    expect(celda.textContent).toContain("admin@ejemplo.com");
    expect(celda.textContent).toContain("2026-11-13T15:00:00Z");
    expect(obtenerUsuario.mock.calls.length).toBe(detalles);
    expect(screen.queryByText("Revocar la identidad")).toBeNull();
  });

  it("cancelar la confirmación no revoca nada", async () => {
    await abrirConfirmacion();
    revocarIdentidad.mockClear();

    escribirMotivo("documento adulterado");
    fireEvent.click(screen.getByText("Cancelar"));

    expect(revocarIdentidad).not.toHaveBeenCalled();
    expect(screen.getByText("Revocar la identidad")).toBeDefined();
  });

  it("un error al revocar no borra al usuario que se estaba viendo", async () => {
    await abrirConfirmacion();
    revocarIdentidad.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "no tiene identidad validada" },
      },
    });

    escribirMotivo("documento adulterado");
    fireEvent.click(screen.getByText("Sí, revocar"));

    await waitFor(() =>
      expect(screen.getByText("no tiene identidad validada")).toBeDefined()
    );
    expect(screen.getAllByText("ana@ejemplo.com").length).toBeGreaterThan(0);
    expect(screen.getByText("Validada")).toBeDefined();
  });
});
