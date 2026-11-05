import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  aceptar,
  bloquear,
  cargarDetalle,
  desbloquear,
  limpiarResultado,
  rechazar,
  reiniciar,
  revisarDocumento,
} from "../store/complianceSlice";
import {
  Aviso,
  Bajada,
  Boton,
  Chip,
  Fila,
  Panel,
  Peligro,
  Tabla,
  Titulo,
} from "components/Panel";
import Confirmacion from "components/Confirmacion";
import DocumentoFila from "../components/DocumentoFila";

const ACCIONES_POR_ESTADO = {
  en_revision: ["aceptar", "rechazar", "reiniciar"],
  aceptado_sin_firma: ["aceptar", "rechazar", "reiniciar"],
  aceptado: ["bloquear", "reiniciar"],
  bloqueado: ["desbloquear", "reiniciar"],
  rechazado: ["reiniciar"],
};

const DetalleLegajo = () => {
  const { sujetoVerificadoId } = useParams();
  const dispatch = useDispatch();
  const { detalle, personas, cargandoDetalle, error, resultadoAccion } =
    useSelector((s) => s.compliance);
  const refDerivada = useSelector(
    (s) =>
      s.compliance.filas.find(
        (f) => String(f.sujetoVerificadoId) === String(sujetoVerificadoId)
      )?.refExterna ?? null
  );
  const [refTipeada, setRefTipeada] = useState("");
  const refExterna = refDerivada ?? (refTipeada.trim() || null);

  const [cuit, setCuit] = useState("");
  const [titular, setTitular] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [motivoBloqueo, setMotivoBloqueo] = useState("");
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    dispatch(limpiarResultado());
    dispatch(cargarDetalle(sujetoVerificadoId));
  }, [dispatch, sujetoVerificadoId]);

  const estado = detalle?.estado ?? null;
  const permitidas = ACCIONES_POR_ESTADO[estado] ?? [];
  const documentos = detalle?.documentos ?? [];

  const ejecutar = () => {
    if (confirmar === "aceptar") {
      dispatch(aceptar({ refExterna, cuit, name: titular }));
    } else if (confirmar === "rechazar") {
      dispatch(rechazar({ sujetoVerificadoId, observaciones }));
    } else if (confirmar === "bloquear") {
      dispatch(bloquear({ refExterna, motivo: motivoBloqueo }));
    } else if (confirmar === "desbloquear") {
      dispatch(desbloquear({ refExterna }));
    } else if (confirmar === "reiniciar") {
      dispatch(reiniciar({ sujetoVerificadoId }));
    }
    setConfirmar(null);
  };

  if (cargandoDetalle) return <p>Cargando legajo…</p>;

  return (
    <>
      <Titulo>Legajo {sujetoVerificadoId}</Titulo>
      <Bajada>
        Estado actual: <Chip>{estado ?? "—"}</Chip>
        {refDerivada ? ` · ref externa ${refDerivada}` : null}
      </Bajada>

      {!refDerivada ? (
        <Panel>
          <h2>Ref externa</h2>
          <Bajada>
            Este sujeto todavía no tiene cuenta CVU, así que la ref externa no
            se puede derivar del listado de cuentas. Es el id de la sociedad en
            la plataforma origen, y lo necesitan aceptar, bloquear, desbloquear
            y sincronizar.
          </Bajada>
          <Fila>
            <input
              aria-label="Ref externa"
              placeholder="id de la sociedad en la plataforma origen"
              value={refTipeada}
              onChange={(e) => setRefTipeada(e.target.value)}
            />
          </Fila>
        </Panel>
      ) : null}

      {error ? <Aviso $tono="error">{error}</Aviso> : null}
      {resultadoAccion?.estado === "permisos_pendientes" ? (
        <Aviso>
          El legajo quedó <strong>aceptado</strong>, pero la orquestación de
          cuenta, vínculos y permisos no terminó. Andá a Altas trabadas y
          sincronizá.
        </Aviso>
      ) : null}
      {resultadoAccion?.estado === "aceptado" ? (
        <Aviso>
          Aceptado. Cuenta {resultadoAccion.cuentaIdExterno ?? "—"} en estado{" "}
          {resultadoAccion.estadoCuenta ?? "—"}.
        </Aviso>
      ) : null}

      <Panel>
        <h2>Documentos</h2>
        <Tabla>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Archivo</th>
              <th>Revisar</th>
            </tr>
          </thead>
          <tbody>
            {documentos.length === 0 ? (
              <tr>
                <td colSpan={4}>Sin documentos cargados.</td>
              </tr>
            ) : (
              documentos.map((d) => (
                <DocumentoFila
                  key={d.id}
                  documento={d}
                  onRevisar={(estadoNuevo, motivo) =>
                    dispatch(
                      revisarDocumento({
                        sujetoVerificadoId,
                        documentoId: d.id,
                        estado: estadoNuevo,
                        motivo,
                      })
                    )
                  }
                />
              ))
            )}
          </tbody>
        </Tabla>
      </Panel>

      <Panel>
        <h2>Personas</h2>
        <Tabla>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Mail</th>
              <th>Cargo</th>
              <th>CUIT</th>
            </tr>
          </thead>
          <tbody>
            {personas.length === 0 ? (
              <tr>
                <td colSpan={4}>Sin personas cargadas.</td>
              </tr>
            ) : (
              personas.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.nombre} {p.apellido}
                  </td>
                  <td>{p.email ?? p.mail ?? "—"}</td>
                  <td>{p.cargo ?? "—"}</td>
                  <td>{p.cuit ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Tabla>
      </Panel>

      <Panel>
        <h2>Resolver</h2>
        {permitidas.includes("aceptar") ? (
          <Fila>
            <input
              aria-label="CUIT"
              placeholder="CUIT del titular"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
            />
            <input
              aria-label="Titular"
              placeholder="Titular / razón social"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
            />
            <Boton
              $primario
              type="button"
              disabled={!refExterna || !cuit || !titular}
              onClick={() => setConfirmar("aceptar")}
            >
              Aceptar
            </Boton>
          </Fila>
        ) : null}

        {permitidas.includes("rechazar") ? (
          <Fila style={{ marginTop: 10 }}>
            <input
              aria-label="Observaciones"
              placeholder="Observaciones del rechazo"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
            <Boton
              type="button"
              disabled={!observaciones}
              onClick={() => setConfirmar("rechazar")}
            >
              Rechazar
            </Boton>
          </Fila>
        ) : null}

        {permitidas.includes("bloquear") ? (
          <Fila style={{ marginTop: 10 }}>
            <input
              aria-label="Motivo del bloqueo"
              placeholder="Motivo del bloqueo"
              value={motivoBloqueo}
              onChange={(e) => setMotivoBloqueo(e.target.value)}
            />
            <Boton
              type="button"
              disabled={!refExterna || !motivoBloqueo}
              onClick={() => setConfirmar("bloquear")}
            >
              Bloquear
            </Boton>
          </Fila>
        ) : null}

        {permitidas.includes("desbloquear") ? (
          <Fila style={{ marginTop: 10 }}>
            <Boton
              type="button"
              disabled={!refExterna}
              onClick={() => setConfirmar("desbloquear")}
            >
              Desbloquear
            </Boton>
          </Fila>
        ) : null}

        {permitidas.includes("reiniciar") ? (
          <Fila style={{ marginTop: 10 }}>
            <Peligro type="button" onClick={() => setConfirmar("reiniciar")}>
              Reiniciar legajo
            </Peligro>
          </Fila>
        ) : null}
      </Panel>

      {confirmar ? (
        <Confirmacion
          accion={confirmar}
          onCancelar={() => setConfirmar(null)}
          onConfirmar={ejecutar}
        />
      ) : null}
    </>
  );
};

export default DetalleLegajo;
