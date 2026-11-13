import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { domicilioEnUnaLinea } from "src/lib/identidad";
import { Aviso, Bajada, Boton, Fila, Panel, Tabla } from "components/Panel";
import Confirmacion from "components/Confirmacion";

const Delicado = styled(Panel)`
  margin-top: 36px;
  border: 1px solid #f0c7a6;
  border-left: 4px solid #d9822b;
  background: #fffaf4;
`;

const Galeria = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 12px;

  figure {
    margin: 0;
    font-size: 11px;
    color: #6b7280;
  }

  img {
    display: block;
    max-width: 260px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
`;

const vigenciaEnPalabras = (documento) => {
  if (!documento) return "—";
  const estado =
    documento.vigente === true
      ? "Vigente"
      : documento.vigente === false
        ? "No vigente"
        : "Sin dato de vigencia";
  return documento.vigenciaHasta
    ? `${estado} · hasta ${documento.vigenciaHasta}`
    : estado;
};

const ConsultaProveedor = ({
  estado,
  validacionId,
  onConsultar,
  onTraerImagenes,
  onDescartar,
}) => {
  const [confirmar, setConfirmar] = useState(null);
  const hayValidacion = validacionId !== null && validacionId !== undefined;
  const datos = estado?.datos ?? null;
  const imagenes = estado?.imagenes ?? null;
  const fotos = imagenes
    ? [
        {
          clave: "frente",
          titulo: "Frente del documento",
          src: imagenes.frente,
        },
        { clave: "dorso", titulo: "Dorso del documento", src: imagenes.dorso },
        { clave: "selfie", titulo: "Selfie del cotejo", src: imagenes.selfie },
      ].filter((foto) => Boolean(foto.src))
    : [];

  const ejecutar = () => {
    if (confirmar === "consultarIdentidadProveedor") onConsultar();
    if (confirmar === "traerImagenesIdentidad") onTraerImagenes();
    setConfirmar(null);
  };

  return (
    <Delicado>
      <h2>Consultar los datos que no guardamos</h2>
      <Bajada>
        El domicilio, la fecha de nacimiento, el score del cotejo facial, la
        vigencia del documento y las fotos no están en ninguna base nuestra: se
        le piden a 4i en el momento y no se persisten. Son datos personales y
        biométricos de la persona, y cada consulta queda auditada con el usuario
        que la hizo. Se consultan sobre la última validación cerrada de la
        persona.
      </Bajada>

      {estado?.error ? <Aviso $tono="error">{estado.error}</Aviso> : null}

      {hayValidacion ? (
        <Fila>
          <Boton
            type="button"
            disabled={estado?.cargando}
            onClick={() => setConfirmar("consultarIdentidadProveedor")}
          >
            {estado?.cargando ? "Consultando a 4i…" : "Consultar a 4i"}
          </Boton>
          {datos ? (
            <Boton type="button" onClick={onDescartar}>
              Descartar lo consultado
            </Boton>
          ) : null}
        </Fila>
      ) : (
        <Aviso>
          Esta persona no tiene ninguna validación cerrada, así que no hay
          transacción de 4i sobre la que consultar.
        </Aviso>
      )}

      {datos ? (
        <>
          <Bajada style={{ marginTop: 14 }}>
            Consultado el {datos.consultadoEn ?? "—"} · transacción de 4i{" "}
            {datos.trxId ?? "—"}
          </Bajada>
          <Tabla>
            <tbody>
              <tr>
                <th>Domicilio</th>
                <td>{domicilioEnUnaLinea(datos.domicilio) ?? "—"}</td>
              </tr>
              <tr>
                <th>Fecha de nacimiento</th>
                <td>{datos.fechaNacimiento ?? "—"}</td>
              </tr>
              <tr>
                <th>Score del cotejo facial</th>
                <td>
                  {datos.scoreCotejoFacial === null ||
                  datos.scoreCotejoFacial === undefined
                    ? "—"
                    : datos.scoreCotejoFacial}
                </td>
              </tr>
              <tr>
                <th>Vigencia del documento</th>
                <td>{vigenciaEnPalabras(datos.documento)}</td>
              </tr>
            </tbody>
          </Tabla>

          <h3>Fotos</h3>
          <Bajada>
            El frente, el dorso y la selfie pesan cientos de kilobytes cada uno,
            así que no vienen con la consulta anterior. Se piden aparte y solo
            si hacen falta.
          </Bajada>
          {imagenes ? null : (
            <Fila>
              <Boton
                type="button"
                disabled={estado?.cargandoImagenes}
                onClick={() => setConfirmar("traerImagenesIdentidad")}
              >
                {estado?.cargandoImagenes
                  ? "Trayendo las fotos…"
                  : "Traer frente, dorso y selfie"}
              </Boton>
            </Fila>
          )}
          {imagenes && fotos.length === 0 ? (
            <p>El proveedor no devolvió fotos para esta validación.</p>
          ) : null}
          {fotos.length > 0 ? (
            <Galeria>
              {fotos.map((foto) => (
                <figure key={foto.clave}>
                  <img src={foto.src} alt={foto.titulo} />
                  <figcaption>{foto.titulo}</figcaption>
                </figure>
              ))}
            </Galeria>
          ) : null}
        </>
      ) : null}

      <Aviso style={{ marginTop: 14, marginBottom: 0 }}>
        Nada de lo que se consulta acá se guarda ni queda en el navegador: al
        salir de la pantalla se descarta.
      </Aviso>

      {confirmar ? (
        <Confirmacion
          accion={confirmar}
          onCancelar={() => setConfirmar(null)}
          onConfirmar={ejecutar}
        />
      ) : null}
    </Delicado>
  );
};

ConsultaProveedor.propTypes = {
  estado: PropTypes.shape({
    cargando: PropTypes.bool,
    cargandoImagenes: PropTypes.bool,
    error: PropTypes.string,
    datos: PropTypes.object,
    imagenes: PropTypes.object,
  }),
  validacionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onConsultar: PropTypes.func.isRequired,
  onTraerImagenes: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
};

export default ConsultaProveedor;
