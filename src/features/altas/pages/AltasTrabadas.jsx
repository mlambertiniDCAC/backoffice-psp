import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  cargarTrabadas,
  corregirTitular,
  informarCvu,
  sincronizar,
} from "../store/altasSlice";
import { describirMotivo } from "src/lib/adaptadores";
import {
  Aviso,
  Bajada,
  Boton,
  Chip,
  Fila,
  Panel,
  Tabla,
  Titulo,
} from "components/Panel";
import Confirmacion from "components/Confirmacion";
import CorregirTitular from "../components/CorregirTitular";

const AltasTrabadas = () => {
  const dispatch = useDispatch();
  const { trabadas, cargando, error, fallosPorCuenta } = useSelector(
    (s) => s.altas
  );
  const [cvus, setCvus] = useState({});
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    dispatch(cargarTrabadas());
  }, [dispatch]);

  const ejecutar = () => {
    if (!confirmar) return;
    if (confirmar.accion === "informarCvu") {
      dispatch(
        informarCvu({
          cuentaIdExterno: confirmar.cuenta.cuentaIdExterno,
          cvu: cvus[confirmar.cuenta.cuentaIdExterno],
        })
      );
    }
    setConfirmar(null);
  };

  return (
    <>
      <Titulo>Altas trabadas</Titulo>
      <Bajada>
        Cuentas en proceso sin CVU. El reintento oficial es sincronizar: relee
        la cuenta, toma el CUIT grabado y rehace cuenta, vínculos y permisos.
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        {cargando ? (
          <p>Cargando…</p>
        ) : trabadas.length === 0 ? (
          <p>No hay altas trabadas.</p>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <th>Client id</th>
                <th>Cuenta</th>
                <th>Sujeto</th>
                <th>CUIT / titular</th>
                <th>Motivo del fallo</th>
                <th>Legajo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabadas.map((c) => {
                const fallo = fallosPorCuenta[c.cuentaIdExterno];
                const motivo = describirMotivo(c.ultimoError, fallo);
                const refExterna = c.refExterna ?? c.legajo?.refExterna ?? null;
                return (
                  <tr key={c.cuentaIdExterno}>
                    <td>
                      <strong>{c.clientId ?? "—"}</strong>
                    </td>
                    <td>{c.cuentaIdExterno}</td>
                    <td>{c.sujetoVerificadoId ?? "—"}</td>
                    <td>
                      {c.cuit ?? "—"}
                      <br />
                      <small>{c.titular ?? "sin titular"}</small>
                    </td>
                    <td>
                      <Chip>{motivo.clase}</Chip>
                      <br />
                      <strong>{motivo.titulo}</strong>
                      <br />
                      <small>{motivo.detalle}</small>
                    </td>
                    <td>
                      {c.legajo ? (
                        <Chip>{c.legajo.estado}</Chip>
                      ) : (
                        <Chip>sin legajo</Chip>
                      )}
                    </td>
                    <td>
                      <Fila>
                        <Boton
                          $primario
                          type="button"
                          disabled={!refExterna}
                          title={
                            refExterna
                              ? "Relee la cuenta y rehace cuenta, vínculos y permisos"
                              : "Sin client_id no se puede sincronizar"
                          }
                          onClick={() =>
                            dispatch(
                              sincronizar({
                                refExterna,
                                cuentaIdExterno: c.cuentaIdExterno,
                              })
                            )
                          }
                        >
                          Reintentar (sincronizar)
                        </Boton>
                      </Fila>
                      <Fila style={{ marginTop: 6 }}>
                        <input
                          aria-label={`CVU para ${c.cuentaIdExterno}`}
                          placeholder="CVU de 22 dígitos"
                          value={cvus[c.cuentaIdExterno] ?? ""}
                          onChange={(e) =>
                            setCvus((prev) => ({
                              ...prev,
                              [c.cuentaIdExterno]: e.target.value,
                            }))
                          }
                        />
                        <Boton
                          type="button"
                          disabled={
                            !/^\d{22}$/.test(cvus[c.cuentaIdExterno] ?? "")
                          }
                          onClick={() =>
                            setConfirmar({ accion: "informarCvu", cuenta: c })
                          }
                        >
                          Informar CVU
                        </Boton>
                      </Fila>
                      <CorregirTitular
                        cuenta={c}
                        onGuardar={(cuit, name) =>
                          dispatch(
                            corregirTitular({
                              cuentaIdExterno: c.cuentaIdExterno,
                              cuit,
                              name,
                            })
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tabla>
        )}
      </Panel>

      <Aviso>
        Después de un reintento de alta el legajo sigue en revisión: hay que
        volver a aceptarlo desde Compliance. Con la cuenta ya activa, el aceptar
        no toca BIND.
      </Aviso>

      {confirmar ? (
        <Confirmacion
          accion={confirmar.accion}
          onCancelar={() => setConfirmar(null)}
          onConfirmar={ejecutar}
        />
      ) : null}
    </>
  );
};

export default AltasTrabadas;
