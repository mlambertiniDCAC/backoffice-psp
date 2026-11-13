import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ConsultaProveedor from "../components/ConsultaProveedor";
import { adaptarConsultaProveedor } from "src/lib/identidad";

const vacio = {
  cargando: false,
  cargandoImagenes: false,
  error: null,
  datos: null,
  imagenes: null,
};

const renderizar = (estado = vacio, handlers = {}) => {
  const props = {
    validacionId: 3,
    onConsultar: vi.fn(),
    onTraerImagenes: vi.fn(),
    onDescartar: vi.fn(),
    ...handlers,
  };
  const resultado = render(<ConsultaProveedor estado={estado} {...props} />);
  return { ...resultado, props };
};

const consultado = adaptarConsultaProveedor({
  consultado_en: "2026-11-13T18:00:00Z",
  trx_id: "01JCB",
  domicilio: { calle: "Corrientes", numero: "1234", localidad: "CABA" },
  fecha_nacimiento: "1975-03-14",
  score_cotejo_facial: 98.7,
  documento: {
    numero: "22826019",
    vigente: true,
    vigencia_hasta: "2031-05-02",
  },
});

describe("ConsultaProveedor", () => {
  it("avisa que los datos no están guardados y que la consulta queda auditada", () => {
    const { container } = renderizar();

    expect(container.textContent).toContain("no están en ninguna base nuestra");
    expect(container.textContent).toContain("queda auditada");
    expect(container.textContent).toContain("no se persisten");
  });

  it("no consulta nada hasta que se confirma", () => {
    const { props } = renderizar();

    fireEvent.click(screen.getByText("Consultar a 4i"));

    expect(props.onConsultar).not.toHaveBeenCalled();
    expect(
      screen.getByText("Consultar los datos de identidad a 4i")
    ).toBeDefined();
  });

  it("consulta al confirmar", () => {
    const { props } = renderizar();

    fireEvent.click(screen.getByText("Consultar a 4i"));
    fireEvent.click(screen.getByText("Sí, continuar"));

    expect(props.onConsultar).toHaveBeenCalledTimes(1);
  });

  it("cancelar la confirmación no consulta", () => {
    const { props } = renderizar();

    fireEvent.click(screen.getByText("Consultar a 4i"));
    fireEvent.click(screen.getByText("Cancelar"));

    expect(props.onConsultar).not.toHaveBeenCalled();
  });

  it("sin consultar todavía no ofrece las fotos", () => {
    renderizar();

    expect(screen.queryByText("Traer frente, dorso y selfie")).toBeNull();
  });

  it("muestra lo consultado y recién ahí ofrece las fotos", () => {
    const { container } = renderizar({ ...vacio, datos: consultado });

    expect(container.textContent).toContain("Corrientes 1234 · CABA");
    expect(screen.getByText("1975-03-14")).toBeDefined();
    expect(screen.getByText("98.7")).toBeDefined();
    expect(screen.getByText("Vigente · hasta 2031-05-02")).toBeDefined();
    expect(screen.getByText("Traer frente, dorso y selfie")).toBeDefined();
  });

  it("avisa que las fotos pesan antes de pedirlas", () => {
    const { container } = renderizar({ ...vacio, datos: consultado });

    expect(container.textContent).toContain("cientos de kilobytes");
  });

  it("las fotos se piden en un paso aparte y con confirmación", () => {
    const { props } = renderizar({ ...vacio, datos: consultado });

    fireEvent.click(screen.getByText("Traer frente, dorso y selfie"));
    expect(props.onTraerImagenes).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Sí, continuar"));
    expect(props.onTraerImagenes).toHaveBeenCalledTimes(1);
  });

  it("muestra las tres fotos que vinieron", () => {
    renderizar({
      ...vacio,
      datos: consultado,
      imagenes: {
        frente: "data:image/jpeg;base64,AAA",
        dorso: "data:image/jpeg;base64,BBB",
        selfie: "data:image/jpeg;base64,CCC",
      },
    });

    expect(screen.getByAltText("Frente del documento")).toBeDefined();
    expect(screen.getByAltText("Dorso del documento")).toBeDefined();
    expect(screen.getByAltText("Selfie del cotejo")).toBeDefined();
    expect(screen.queryByText("Traer frente, dorso y selfie")).toBeNull();
  });

  it("no inventa una foto que el proveedor no mandó", () => {
    renderizar({
      ...vacio,
      datos: consultado,
      imagenes: {
        frente: "data:image/jpeg;base64,AAA",
        dorso: null,
        selfie: null,
      },
    });

    expect(screen.getByAltText("Frente del documento")).toBeDefined();
    expect(screen.queryByAltText("Dorso del documento")).toBeNull();
    expect(screen.queryByAltText("Selfie del cotejo")).toBeNull();
  });

  it("si el proveedor no devolvió fotos lo dice", () => {
    renderizar({
      ...vacio,
      datos: consultado,
      imagenes: { frente: null, dorso: null, selfie: null },
    });

    expect(
      screen.getByText("El proveedor no devolvió fotos para esta validación.")
    ).toBeDefined();
  });

  it("sin id de validación no hay nada que consultar y el botón no va", () => {
    const { container } = renderizar(vacio, { validacionId: null });

    expect(screen.queryByText("Consultar a 4i")).toBeNull();
    expect(container.textContent).toContain(
      "no tiene ninguna validación cerrada"
    );
  });

  it("la consulta se hace sobre la última validación cerrada y lo dice", () => {
    const { container } = renderizar();

    expect(container.textContent).toContain("última validación cerrada");
  });

  it("una vigencia que no se pudo determinar no se muestra como no vigente", () => {
    const { container } = renderizar({
      ...vacio,
      datos: adaptarConsultaProveedor({
        consultado_en: "2026-11-13T18:00:00Z",
        documento: { numero: "44560910", vigente: null, vigencia_hasta: null },
      }),
    });

    expect(container.textContent).toContain("Sin dato de vigencia");
    expect(container.textContent).not.toContain("No vigente");
  });

  it("un documento no vigente lo dice, y eso es distinto de no tener el dato", () => {
    const { container } = renderizar({
      ...vacio,
      datos: adaptarConsultaProveedor({
        documento: {
          numero: "44560910",
          vigente: false,
          vigencia_hasta: "08/10/2020",
        },
      }),
    });

    expect(container.textContent).toContain("No vigente · hasta 08/10/2020");
    expect(container.textContent).not.toContain("Sin dato de vigencia");
  });

  it("un domicilio con todas sus claves en null se muestra como vacío", () => {
    const { container } = renderizar({
      ...vacio,
      datos: adaptarConsultaProveedor({
        domicilio: {
          calle: null,
          numero: null,
          piso: null,
          departamento: null,
          localidad: null,
          provincia: null,
          codigo_postal: null,
          formateado: null,
        },
        documento: { numero: null, vigente: null, vigencia_hasta: null },
      }),
    });

    expect(container.textContent).toContain("Domicilio");
    expect(container.textContent).toContain("—");
  });

  it("un error de la consulta se muestra y no deja datos simulados", () => {
    const { container } = renderizar({ ...vacio, error: "4i no respondió" });

    expect(screen.getByText("4i no respondió")).toBeDefined();
    expect(container.textContent).not.toContain("Fecha de nacimiento");
  });

  it("descartar lo consultado aparece solo cuando hay algo que descartar", () => {
    const { props, rerender } = renderizar();

    expect(screen.queryByText("Descartar lo consultado")).toBeNull();

    rerender(
      <ConsultaProveedor
        estado={{ ...vacio, datos: consultado }}
        validacionId={3}
        onConsultar={props.onConsultar}
        onTraerImagenes={props.onTraerImagenes}
        onDescartar={props.onDescartar}
      />
    );

    fireEvent.click(screen.getByText("Descartar lo consultado"));
    expect(props.onDescartar).toHaveBeenCalledTimes(1);
  });
});
