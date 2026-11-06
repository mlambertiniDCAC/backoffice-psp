import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { cargarCuenta, corregir, eliminar } from "../store/cuentasSlice";
import {
  cargarVinculos,
  revocar,
} from "src/features/usuarios/store/usuariosSlice";
import { SITUACIONES_CUENTA } from "src/lib/constants";
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

const DetalleCuenta = () => {
  const { cuentaIdExterno } = useParams();
  const dispatch = useDispatch();
  const { cuenta, error } = useSelector((s) => s.cuentas);
  const vinculos = useSelector((s) => s.usuarios.vinculos);
  const [alias, setAlias] = useState("");
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    dispatch(cargarCuenta(cuentaIdExterno));
    dispatch(cargarVinculos(cuentaIdExterno));
  }, [dispatch, cuentaIdExterno]);

  if (!cuenta) return <p>Cargando cuenta…</p>;

  const enProcesoSinCvu =
    cuenta.situacion === SITUACIONES_CUENTA.EN_PROCESO && !cuenta.cvu;
  const activa = cuenta.situacion === SITUACIONES_CUENTA.ACTIVA;

  return (
    <>
      <Titulo>Cuenta {cuenta.cuentaIdExterno}</Titulo>
      <Bajada>
        <Chip>{cuenta.situacion}</Chip> · sujeto{" "}
        {cuenta.sujetoVerificadoId ?? "—"} · CVU {cuenta.cvu ?? "sin CVU"}
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <h2>Datos</h2>
        <Tabla>
          <tbody>
            <tr>
              <th>CUIT</th>
              <td>{cuenta.cuit ?? "—"}</td>
            </tr>
            <tr>
              <th>Razón social</th>
              <td>{cuenta.titular ?? "—"}</td>
            </tr>
            <tr>
              <th>Alias</th>
              <td>{cuenta.alias ?? "—"}</td>
            </tr>
            <tr>
              <th>Moneda</th>
              <td>{cuenta.moneda ?? "—"}</td>
            </tr>
            <tr>
              <th>Ref externa</th>
              <td>{cuenta.refExterna ?? "—"}</td>
            </tr>
            <tr>
              <th title="Identificador interno que se envía a BIND. No es la referencia de la sociedad.">
                Client id BIND
              </th>
              <td>{cuenta.clientId ?? "—"}</td>
            </tr>
          </tbody>
        </Tabla>
      </Panel>

      <Panel>
        <h2>Corregir</h2>
        {activa ? (
          <Fila>
            <input
              aria-label="Alias nuevo"
              placeholder="alias.nuevo.psp"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <Boton
              type="button"
              disabled={!alias}
              onClick={() => dispatch(corregir({ cuentaIdExterno, alias }))}
            >
              Cambiar alias
            </Boton>
          </Fila>
        ) : (
          <p>
            El alias solo se cambia en una cuenta activa. Esta está en{" "}
            {cuenta.situacion}.
          </p>
        )}
        {enProcesoSinCvu ? (
          <Aviso>
            Esta cuenta está trabada. El CUIT, la razón social y el CVU se
            corrigen desde Altas trabadas.
          </Aviso>
        ) : null}
      </Panel>

      <Panel>
        <h2>Usuarios vinculados</h2>
        <Tabla>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Origen</th>
              <th>Estado</th>
              <th>Desde</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {vinculos.length === 0 ? (
              <tr>
                <td colSpan={5}>Sin vínculos activos.</td>
              </tr>
            ) : (
              vinculos.map((v) => (
                <tr key={v.usuario_id ?? v.usuarioId}>
                  <td>{v.usuario_id ?? v.usuarioId}</td>
                  <td>{v.origen ?? "—"}</td>
                  <td>
                    <Chip>{v.estado ?? "—"}</Chip>
                  </td>
                  <td>{v.fecha_creacion ?? "—"}</td>
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
        <Bajada style={{ marginTop: 10 }}>
          Los vínculos nacen del paquete de permisos del legajo. No hay alta
          manual.
        </Bajada>
      </Panel>

      <Panel>
        <h2>Baja</h2>
        <Peligro type="button" onClick={() => setConfirmar("eliminarCuenta")}>
          Eliminar la cuenta
        </Peligro>
      </Panel>

      {confirmar ? (
        <Confirmacion
          accion={confirmar}
          onCancelar={() => setConfirmar(null)}
          onConfirmar={() => {
            dispatch(eliminar({ cuentaIdExterno }));
            setConfirmar(null);
          }}
        />
      ) : null}
    </>
  );
};

export default DetalleCuenta;
