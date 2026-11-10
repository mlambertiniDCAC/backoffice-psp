import { useState } from "react";
import PropTypes from "prop-types";
import { ESTADOS_DOCUMENTO_REVISION } from "src/lib/constants";
import { nombreDeTipoDocumento } from "src/lib/adaptadores";
import { Boton, Chip, Fila } from "components/Panel";

const DocumentoFila = ({ documento, onRevisar }) => {
  const [estado, setEstado] = useState("");
  const [motivo, setMotivo] = useState("");
  const necesitaMotivo = estado === "rechazado";

  return (
    <tr>
      <td>
        {nombreDeTipoDocumento(documento.tipo) ??
          documento.documento_tipo ??
          "—"}
      </td>
      <td>
        <Chip>{documento.estado ?? "—"}</Chip>
      </td>
      <td>
        {documento.multimedia?.url || documento.url ? (
          <a
            href={documento.multimedia?.url ?? documento.url}
            target="_blank"
            rel="noreferrer"
          >
            Ver archivo
          </a>
        ) : (
          "—"
        )}
      </td>
      <td>
        <Fila>
          <select
            aria-label={`Revisión del documento ${documento.id}`}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Elegir…</option>
            {ESTADOS_DOCUMENTO_REVISION.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          {necesitaMotivo ? (
            <input
              aria-label={`Motivo del rechazo del documento ${documento.id}`}
              placeholder="Motivo (obligatorio)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          ) : null}
          <Boton
            type="button"
            disabled={!estado || (necesitaMotivo && !motivo)}
            onClick={() => {
              onRevisar(estado, necesitaMotivo ? motivo : undefined);
              setEstado("");
              setMotivo("");
            }}
          >
            Guardar
          </Boton>
        </Fila>
      </td>
    </tr>
  );
};

DocumentoFila.propTypes = {
  documento: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    tipo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        codigo: PropTypes.string,
        nombre: PropTypes.string,
      }),
    ]),
    documento_tipo: PropTypes.string,
    estado: PropTypes.string,
    url: PropTypes.string,
    multimedia: PropTypes.shape({ url: PropTypes.string }),
  }).isRequired,
  onRevisar: PropTypes.func.isRequired,
};

export default DocumentoFila;
