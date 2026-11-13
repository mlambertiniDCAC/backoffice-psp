import PropTypes from "prop-types";
import {
  ESTADOS_IDENTIDAD,
  estadoDeIdentidad,
  etiquetaDeIdentidad,
  minutosDeBloqueo,
  motivoDeIntento,
  resultadoDeIntento,
  textoCuitDifiere,
  textoNombreDifiere,
} from "src/lib/identidad";
import { Aviso, Bajada, Chip, Panel, Tabla } from "components/Panel";

const CategoriaIdentidad = ({ identidad }) => {
  const estado = estadoDeIdentidad(identidad);
  const intentos = identidad?.validaciones ?? [];

  return (
    <Panel>
      <h2>Identidad</h2>
      <Bajada>
        La validación biométrica es de la persona y no del legajo de una
        sociedad: vale para cualquier cuenta en la que participe.
      </Bajada>

      <Tabla>
        <tbody>
          <tr>
            <th>Estado</th>
            <td>
              <Chip>{etiquetaDeIdentidad(identidad)}</Chip>
            </td>
          </tr>
          <tr>
            <th>Validada desde</th>
            <td>{identidad?.validadaEn ?? "—"}</td>
          </tr>
          <tr>
            <th>Revocación</th>
            <td>
              {identidad?.revocadaEn
                ? `${identidad.revocadaEn} · por ${
                    identidad.revocadaPor ?? "—"
                  } · motivo: ${identidad.motivoRevocacion ?? "—"}`
                : "No"}
            </td>
          </tr>
          <tr>
            <th>Documento guardado</th>
            <td>{identidad?.documento ?? "—"}</td>
          </tr>
          <tr>
            <th>CUIL guardado</th>
            <td>{identidad?.cuil ?? "—"}</td>
          </tr>
        </tbody>
      </Tabla>

      {estado === ESTADOS_IDENTIDAD.REVOCADA ? (
        <Aviso>
          Una identidad revocada no se vuelve a encender desde acá: la persona
          tiene que validarse de nuevo.
        </Aviso>
      ) : null}

      {estado === ESTADOS_IDENTIDAD.EN_CURSO ? (
        <Aviso>
          Hay una validación abierta. Mientras no cierre, la identidad sigue sin
          validar.
        </Aviso>
      ) : null}

      <h3>Qué declaró contra qué dice el documento</h3>
      <Bajada>
        El proveedor contrasta la cara contra la foto que RENAPER tiene del
        documento, pero no verifica los datos que se declararon en el alta. Esa
        comparación la hacemos nosotros y los dos avisos de abajo son su
        resultado: marcan la diferencia, no bloquean a la persona.
      </Bajada>
      <Tabla>
        <tbody>
          <tr>
            <th>Nombre</th>
            <td>{textoNombreDifiere(identidad?.nombreDifiere)}</td>
          </tr>
          <tr>
            <th>CUIT</th>
            <td>{textoCuitDifiere(identidad?.cuitDifiere)}</td>
          </tr>
        </tbody>
      </Tabla>

      <h3>Intentos de validación</h3>
      <Tabla>
        <thead>
          <tr>
            <th>Inicio</th>
            <th>Flujo</th>
            <th>Estado</th>
            <th>Resultado</th>
            <th>Motivo del corte</th>
            <th>Step (4i)</th>
          </tr>
        </thead>
        <tbody>
          {intentos.length === 0 ? (
            <tr>
              <td colSpan={6}>
                Esta persona nunca arrancó una validación de identidad.
              </td>
            </tr>
          ) : (
            intentos.map((intento) => {
              const bloqueo =
                intento.minutosBloqueo ?? minutosDeBloqueo(intento.step);
              return (
                <tr key={intento.id}>
                  <td>{intento.iniciadaEn ?? "—"}</td>
                  <td>{intento.flujo ?? "—"}</td>
                  <td>
                    <Chip>{intento.estado ?? "—"}</Chip>
                  </td>
                  <td>{resultadoDeIntento(intento) ?? "—"}</td>
                  <td>
                    {motivoDeIntento(intento) ?? "—"}
                    {bloqueo !== null ? (
                      <Bajada style={{ margin: "4px 0 0" }}>
                        El dispositivo queda bloqueado {bloqueo} minutos más.
                      </Bajada>
                    ) : null}
                  </td>
                  <td>{intento.step ?? "—"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </Tabla>
      <Bajada style={{ marginTop: 10 }}>
        El step es el código con el que 4i cerró la transacción. El motivo es la
        traducción del grupo al que pertenece ese código.
      </Bajada>
    </Panel>
  );
};

CategoriaIdentidad.propTypes = {
  identidad: PropTypes.shape({
    validada: PropTypes.bool,
    validadaEn: PropTypes.string,
    revocadaEn: PropTypes.string,
    revocadaPor: PropTypes.string,
    motivoRevocacion: PropTypes.string,
    documento: PropTypes.string,
    cuil: PropTypes.string,
    nombreDifiere: PropTypes.bool,
    cuitDifiere: PropTypes.bool,
    validacionEnCurso: PropTypes.bool,
    validaciones: PropTypes.array,
  }),
};

export default CategoriaIdentidad;
