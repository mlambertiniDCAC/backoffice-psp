import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  cargarPermisosView,
  cargarVinculos,
  resincronizar,
  revocar,
} from "../store/usuariosSlice";
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

const UsuariosYPermisos = () => {
  const dispatch = useDispatch();
  const { vinculos, permisos, cargando, error } = useSelector(
    (s) => s.usuarios
  );
  const [cuentaIdExterno, setCuenta] = useState("");
  const [sujetoId, setSujeto] = useState("");
  const [refExterna, setRef] = useState("");

  const pantallas = Object.entries(permisos ?? {});

  return (
    <>
      <Titulo>Usuarios y permisos</Titulo>
      <Bajada>
        Los vínculos usuario↔cuenta nacen del paquete de permisos del legajo.
        Acá se ven, se revocan y se vuelven a sincronizar; no hay alta manual.
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <h2>Vínculos de una cuenta</h2>
        <Fila>
          <input
            aria-label="Cuenta"
            placeholder="cuentaIdExterno (uuid)"
            value={cuentaIdExterno}
            onChange={(e) => setCuenta(e.target.value)}
          />
          <Boton
            type="button"
            disabled={!cuentaIdExterno}
            onClick={() => dispatch(cargarVinculos(cuentaIdExterno))}
          >
            Ver vínculos
          </Boton>
        </Fila>
        {cargando ? <p>Cargando…</p> : null}
        <Tabla style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {vinculos.length === 0 ? (
              <tr>
                <td colSpan={3}>Sin vínculos para mostrar.</td>
              </tr>
            ) : (
              vinculos.map((v) => (
                <tr key={v.usuario_id ?? v.usuarioId}>
                  <td>{v.usuario_id ?? v.usuarioId}</td>
                  <td>
                    <Chip>{v.estado ?? "—"}</Chip>
                  </td>
                  <td>
                    <Boton
                      type="button"
                      onClick={() =>
                        dispatch(
                          revocar({
                            cuentaIdExterno,
                            usuarioId: v.usuario_id ?? v.usuarioId,
                          })
                        )
                      }
                    >
                      Revocar
                    </Boton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Tabla>
      </Panel>

      <Panel>
        <h2>Re-sincronizar desde el legajo</h2>
        <Fila>
          <input
            aria-label="Ref externa"
            placeholder="ref_externa del sujeto"
            value={refExterna}
            onChange={(e) => setRef(e.target.value)}
          />
          <Boton
            type="button"
            disabled={!refExterna}
            onClick={() =>
              dispatch(resincronizar({ refExterna, cuentaIdExterno }))
            }
          >
            Sincronizar vínculos y permisos
          </Boton>
        </Fila>
      </Panel>

      <Panel>
        <h2>Vista de permisos del sujeto</h2>
        <Fila>
          <input
            aria-label="Sujeto"
            placeholder="sujetoId"
            value={sujetoId}
            onChange={(e) => setSujeto(e.target.value)}
          />
          <Boton
            type="button"
            disabled={!sujetoId}
            onClick={() => dispatch(cargarPermisosView(sujetoId))}
          >
            Ver permisos
          </Boton>
        </Fila>
        {pantallas.length === 0 ? (
          <p>Sin pantallas para mostrar.</p>
        ) : (
          <Tabla style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Pantalla</th>
                <th>Accesos</th>
              </tr>
            </thead>
            <tbody>
              {pantallas.map(([pantalla, accesos]) => (
                <tr key={pantalla}>
                  <td>{pantalla}</td>
                  <td>
                    {Object.keys(accesos ?? {}).map((a) => (
                      <Chip key={a} style={{ marginRight: 4 }}>
                        {a}
                      </Chip>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
        <Bajada style={{ marginTop: 10 }}>
          La respuesta nombra solo lo accesible: lo que no viene, no se muestra.
        </Bajada>
      </Panel>
    </>
  );
};

export default UsuariosYPermisos;
