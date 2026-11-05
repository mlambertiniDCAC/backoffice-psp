import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  cargarTrabadas,
  corregirTitular,
  informarCvu,
  reintentarAlta,
  sincronizar,
} from "../store/altasSlice";
import { Aviso, Bajada, Chip, Panel, Tabla, Titulo } from "components/Panel";
import Confirmacion from "components/Confirmacion";
import AccionesAlta from "../components/AccionesAlta";

const AltasTrabadas = () => {
  const dispatch = useDispatch();
  const { trabadas, cargando, error } = useSelector((s) => s.altas);
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    dispatch(cargarTrabadas());
  }, [dispatch]);

  const ejecutar = () => {
    if (!confirmar) return;
    dispatch(confirmar.accionAEjecutar);
    setConfirmar(null);
  };

  return (
    <>
      <Titulo>Altas trabadas</Titulo>
      <Bajada>
        Cuentas en proceso sin CVU. <strong>Reintentar el alta</strong> crea la
        cuenta en BIND con el CUIT y el titular de los campos: sin esos dos
        datos el gateway devuelve la cuenta como está y no llama al banco.
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
                <th>Legajo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabadas.map((c) => {
                const refExterna = c.refExterna ?? c.legajo?.refExterna ?? null;
                return (
                  <tr key={c.cuentaIdExterno}>
                    <td>
                      <strong>{c.clientId ?? "—"}</strong>
                    </td>
                    <td>{c.cuentaIdExterno}</td>
                    <td>{c.sujetoVerificadoId ?? "—"}</td>
                    <td>
                      {c.legajo ? (
                        <Chip>{c.legajo.estado}</Chip>
                      ) : (
                        <Chip>sin legajo</Chip>
                      )}
                    </td>
                    <td>
                      <AccionesAlta
                        cuenta={c}
                        refExterna={refExterna}
                        onReintentarAlta={(cuit, name) =>
                          setConfirmar({
                            accion: "reintentarAlta",
                            accionAEjecutar: reintentarAlta({
                              refExterna,
                              cuit,
                              name,
                            }),
                          })
                        }
                        onSincronizarPermisos={() =>
                          dispatch(sincronizar({ refExterna }))
                        }
                        onInformarCvu={(cvu) =>
                          setConfirmar({
                            accion: "informarCvu",
                            accionAEjecutar: informarCvu({
                              cuentaIdExterno: c.cuentaIdExterno,
                              cvu,
                            }),
                          })
                        }
                        onCorregirTitular={(cuit, name) =>
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
